#![cfg_attr(not(feature = "export-abi"), no_main)]
extern crate alloc;

use alloc::{string::String, vec::Vec};
use alloy_primitives::{Address, U256};
use alloy_sol_types::sol;
use stylus_sdk::{
    msg,
    prelude::*,
    call::{call, Call, transfer_eth},
    block,
    evm,
    sol_emit,
    storage::{
        StorageAddress,
        StorageMap,
        StorageBool,
        StorageVec,
        StorageU256,
        StorageString
    }
};
use std::cmp::Ordering; // Importar Ordering

// Interfaces para interactuar con los contratos auxiliares
sol_interface! {
    interface IPOAPVerifier {
        function verifyPoapOwnership(address user, uint256 poap_id) external returns (bool);
        function getLastVerifiedPoap(address user) external view returns (uint256);
        function getVerifiedPoaps(address user) external view returns (uint256[]);
    }

    interface IBoostManager {
        function checkBoostStatus(address user) external returns (bool);
        function getBoostLevel(address user) external view returns (uint256);
        function getRemainingBoostTime(address user) external view returns (uint256);
    }
}

sol! {
    event UserRegistered(address indexed user, uint256 timestamp);
    event MatchReported(address indexed user1, address indexed user2, uint256 timestamp);
    event UserUpdated(address indexed user, uint256 timestamp);
    event UserLocationUpdated(address indexed user, string location, uint256 timestamp);
    event POAPVerified(address indexed user, uint256 indexed poapId, uint256 timestamp);
    event RegistrationFeeUpdated(uint256 oldFee, uint256 newFee);
    event FundsWithdrawn(address indexed to, uint256 amount, uint256 timestamp);

    error Unauthorized();
    error InvalidParameters();
    error InsufficientPayment();
    error ContractNotSet();
    error VerificationFailed();
    error AlreadyRegistered();
    error NotRegistered();
    error WithdrawalFailed();
    error POAPNotVerified();
}

#[derive(SolidityError)]
pub enum MainContractError {
    Unauthorized(Unauthorized),
    InvalidParameters(InvalidParameters),
    InsufficientPayment(InsufficientPayment),
    ContractNotSet(ContractNotSet),
    VerificationFailed(VerificationFailed),
    AlreadyRegistered(AlreadyRegistered),
    NotRegistered(NotRegistered),
    WithdrawalFailed(WithdrawalFailed),
    POAPNotVerified(POAPNotVerified),
}

// Estructura para almacenar información detallada del usuario
#[storage]
struct UserProfile {
    is_active: StorageBool,
    registration_time: StorageU256,
    last_active: StorageU256,
    location: StorageString,
    longitude: StorageU256,
    latitude: StorageU256,
    interests: StorageVec<StorageU256>, // POAPs como intereses
    matches: StorageVec<StorageAddress>,
    match_score: StorageMap<Address, StorageU256>,
}

#[storage]
#[entrypoint]
pub struct MainContract {
    // Mapeos principales
    user_profiles: StorageMap<Address, UserProfile>,
    registered_users: StorageVec<StorageAddress>,

    // Relación con POAPs
    user_poaps: StorageMap<Address, StorageVec<StorageU256>>,
    poap_popularity: StorageMap<U256, StorageU256>,

    // Contratos auxiliares
    poap_verifier: StorageAddress,
    boost_manager: StorageAddress,

    // Administración
    owner: StorageAddress,
    operators: StorageMap<Address, StorageBool>,
    registration_fee: StorageU256,
    total_funds: StorageU256,
}

#[public]
impl MainContract {
    /// Inicializa el contrato estableciendo al remitente como propietario
    pub fn init(&mut self) -> Result<(), MainContractError> {
        if !self.owner.get().is_zero() {
            return Err(MainContractError::Unauthorized(Unauthorized {}));
        }

        self.owner.set(msg::sender());
        self.operators.insert(msg::sender(), true);

        // 0.01 ETH por defecto para registro
        self.registration_fee.set(U256::from(10_000_000_000_000_000u64));
        self.total_funds.set(U256::ZERO);
        Ok(())
    }

    /// Establece las direcciones de los contratos auxiliares
    pub fn set_contracts(&mut self, poap_verifier: Address, boost_manager: Address) -> Result<(), MainContractError> {
        if msg::sender() != self.owner.get() {
            return Err(MainContractError::Unauthorized(Unauthorized {}));
        }

        if poap_verifier.is_zero() || boost_manager.is_zero() {
            return Err(MainContractError::InvalidParameters(InvalidParameters {}));
        }

        self.poap_verifier.set(poap_verifier);
        self.boost_manager.set(boost_manager);
        Ok(())
    }

    /// Añade un operador autorizado
    pub fn add_operator(&mut self, operator: Address) -> Result<(), MainContractError> {
        if msg::sender() != self.owner.get() {
            return Err(MainContractError::Unauthorized(Unauthorized {}));
        }

        if operator.is_zero() {
            return Err(MainContractError::InvalidParameters(InvalidParameters {}));
        }

        self.operators.insert(operator, true);
        Ok(())
    }

    /// Elimina un operador
    pub fn remove_operator(&mut self, operator: Address) -> Result<(), MainContractError> {
        if msg::sender() != self.owner.get() {
            return Err(MainContractError::Unauthorized(Unauthorized {}));
        }

        self.operators.insert(operator, false);
        Ok(())
    }

    /// Registra un nuevo usuario en la plataforma
    #[payable]
    pub fn register_user(&mut self) -> Result<(), MainContractError> {
        let sender = msg::sender();
        let now = U256::from(block::timestamp());

        // Verificar si ya está registrado
        if let Some(profile) = self.user_profiles.getter(sender) {
            if profile.is_active.get() {
                return Err(MainContractError::AlreadyRegistered(AlreadyRegistered {}));
            }
        }

        // Verificar pago de registro
        if msg::value() < self.registration_fee.get() {
            return Err(MainContractError::InsufficientPayment(InsufficientPayment {}));
        }

        // Actualizar fondos totales
        let current_funds = self.total_funds.get();
        self.total_funds.set(current_funds + msg::value());

        // Crear perfil de usuario
        let mut profile = self.user_profiles.setter(sender);
        profile.is_active.set(true);
        profile.registration_time.set(now);
        profile.last_active.set(now);

        // Añadir a la lista de usuarios registrados
        self.registered_users.push(sender);

        // Emitir evento
        sol_emit!(UserRegistered(sender, now.as_u64()));

        Ok(())
    }

    /// Actualiza la ubicación geográfica del usuario
    pub fn update_location(&mut self, location: String, longitude: U256, latitude: U256) -> Result<(), MainContractError> {
        let sender = msg::sender();
        let now = U256::from(block::timestamp());

        // Verificar registro
        if !self.is_user_registered(sender) {
            return Err(MainContractError::NotRegistered(NotRegistered {}));
        }

        // Actualizar ubicación
        let mut profile = self.user_profiles.setter(sender);
        profile.location.set_str(location.clone());
        profile.longitude.set(longitude);
        profile.latitude.set(latitude);
        profile.last_active.set(now);

        // Emitir evento
        sol_emit!(UserLocationUpdated(sender, location, now.as_u64()));

        Ok(())
    }

    /// Verifica la posesión de un POAP para el usuario
    pub fn verify_poap(&mut self, poap_id: U256) -> Result<(), MainContractError> {
        let sender = msg::sender();
        let now = U256::from(block::timestamp());

        // Verificar registro
        if !self.is_user_registered(sender) {
            return Err(MainContractError::NotRegistered(NotRegistered {}));
        }

        // Verificar que el contrato verificador está configurado
        if self.poap_verifier.get().is_zero() {
            return Err(MainContractError::ContractNotSet(ContractNotSet {}));
        }

        // Llamar al contrato de verificación de POAPs
        let verifier = IPOAPVerifier::new(self.poap_verifier.get());
        let config = Call::new_in(self);
        let verified = verifier.verify_poap_ownership(config, sender, poap_id)?;

        if !verified {
            return Err(MainContractError::VerificationFailed(VerificationFailed {}));
        }

        // Almacenar el POAP verificado
        if let Some(mut user_poaps) = self.user_poaps.getter(sender) {
            user_poaps.push(poap_id);
        } else {
            let mut new_poaps = self.user_poaps.setter(sender);
            new_poaps.push(poap_id);
        }

        // Incrementar popularidad del POAP
        let current_popularity = self.poap_popularity.get(poap_id);
        self.poap_popularity.insert(poap_id, current_popularity + U256::from(1));

        // Actualizar intereses del usuario
        let mut profile = self.user_profiles.setter(sender);
        let mut interests = profile.interests;
        interests.push(poap_id);
        profile.last_active.set(now);

        // Emitir eventos
        sol_emit!(POAPVerified(sender, poap_id, now.as_u64()));
        sol_emit!(UserUpdated(sender, now.as_u64()));

        Ok(())
    }

    /// Comprueba la compatibilidad entre dos usuarios basándose en POAPs similares
    pub fn check_compatibility(&mut self, user1: Address, user2: Address) -> Result<U256, MainContractError> {
        // Verificar que ambos usuarios están registrados
        if !self.is_user_registered(user1) || !self.is_user_registered(user2) {
            return Err(MainContractError::NotRegistered(NotRegistered {}));
        }

        // Obtener POAPs verificados de ambos usuarios
        let poaps1 = self.get_user_poaps(user1);
        let poaps2 = self.get_user_poaps(user2);

        if poaps1.is_empty() || poaps2.is_empty() {
            return Err(MainContractError::POAPNotVerified(POAPNotVerified {}));
        }

        // Calcular compatibilidad (POAPs en común)
        let mut common_poaps = 0;
        let mut score = U256::ZERO;

        for poap1 in &poaps1 {
            for poap2 in &poaps2 {
                if poap1 == poap2 {
                    common_poaps += 1;
                    // POAPs menos populares tienen mayor peso
                    let popularity = self.poap_popularity.get(*poap1);
                    let poap_weight = if popularity.is_zero() {
                        U256::from(100)
                    } else {
                        U256::from(100) / popularity.min(U256::from(100))
                    };
                    score += poap_weight;
                }
            }
        }

        // Si no hay POAPs en común, score es 0
        if common_poaps == 0 {
            return Ok(U256::ZERO);
        }

        // Normalizar score (máximo 100)
        if score > U256::from(100) {
            score = U256::from(100);
        }

        Ok(score)
    }

    /// Registra un match entre dos usuarios
    pub fn report_match(&mut self, user1: Address, user2: Address) -> Result<(), MainContractError> {
        // Solo propietarios y operadores pueden reportar matches
        if !self.is_operator(msg::sender()) {
            return Err(MainContractError::Unauthorized(Unauthorized {}));
        }

        // Verificar que ambos usuarios estén registrados
        if !self.is_user_registered(user1) || !self.is_user_registered(user2) {
            return Err(MainContractError::NotRegistered(NotRegistered {}));
        }

        let now = U256::from(block::timestamp());

        // Registrar match para el usuario 1
        let mut profile1 = self.user_profiles.setter(user1);
        let mut matches1 = profile1.matches;
        matches1.push(user2);

        // Registrar match para el usuario 2
        let mut profile2 = self.user_profiles.setter(user2);
        let mut matches2 = profile2.matches;
        matches2.push(user1);

        // Emitir evento
        sol_emit!(MatchReported(user1, user2, now.as_u64()));

        Ok(())
    }

    /// Encuentra usuarios compatibles para un usuario dado
    pub fn find_matches(&mut self, user: Address, max_results: u32) -> Result<Vec<Address>, MainContractError> {
        if !self.is_user_registered(user) {
            return Err(MainContractError::NotRegistered(NotRegistered {}));
        }

        let mut matches = Vec::new();
        let user_count = self.registered_users.len() as u64;

        // Evitar operaciones costosas si no hay suficientes usuarios
        if user_count <= 1 {
            return Ok(matches);
        }

        // Obtener ubicación del usuario
        let user_profile = self.user_profiles.getter(user).unwrap();
        let user_longitude = user_profile.longitude.get();
        let user_latitude = user_profile.latitude.get();

        // Estructura para almacenar usuarios con su puntuación
        struct PotentialMatch {
            address: Address,
            score: U256,
        }

        let mut potential_matches = Vec::new();

        // Evaluar compatibilidad con otros usuarios
        for i in 0..user_count {
            let other_address = self.registered_users.getter(i).unwrap().get();

            // Ignorar al propio usuario y usuarios inactivos
            if other_address == user || !self.is_user_active(other_address) {
                continue;
            }

            // Calcular compatibilidad de POAPs
            let poap_score = match self.check_compatibility(user, other_address) {
                Ok(score) => score,
                Err(_) => U256::ZERO,
            };

            // Solo considerar si hay alguna compatibilidad
            if poap_score.is_zero() {
                continue;
            }

            // Calcular distancia (puntuación de proximidad)
            let other_profile = self.user_profiles.getter(other_address).unwrap();
            let other_longitude = other_profile.longitude.get();
            let other_latitude = other_profile.latitude.get();

            // Cálculo simple de distancia (puntuación inversa - mayor distancia, menor puntuación)
            let location_score = if other_longitude.is_zero() || other_latitude.is_zero() {
                U256::ZERO
            } else {
                // Diferencia absoluta de coordenadas (simplificado para entornos onchain)
                let long_diff = if other_longitude > user_longitude {
                    other_longitude - user_longitude
                } else {
                    user_longitude - other_longitude
                };

                let lat_diff = if other_latitude > user_latitude {
                    other_latitude - user_latitude
                } else {
                    user_latitude - other_latitude
                };

                // Diferencia total (inversa para puntuación - menor diferencia, mayor puntuación)
                let total_diff = long_diff + lat_diff;
                if total_diff.is_zero() {
                    U256::from(100) // Máxima puntuación para misma ubicación
                } else if total_diff > U256::from(1000) {
                    U256::ZERO // Demasiado lejos
                } else {
                    U256::from(100) - (total_diff * U256::from(100)) / U256::from(1000)
                }
            };

            // Verificar boost del otro usuario
            let boost_level = self.get_user_boost_level(other_address);
            let boost_multiplier = U256::from(100) + boost_level;

            // Puntuación total: POAPs (60%) + Ubicación (40%) x Boost
            let total_score = ((poap_score * U256::from(60) + location_score * U256::from(40)) * boost_multiplier) / U256::from(10000);

            potential_matches.push(PotentialMatch {
                address: other_address,
                score: total_score,
            });
        }

        // Ordenar por puntuación (simulación simple - en producción usar algoritmo más eficiente)
        potential_matches.sort_by(|a, b| {
            if a.score > b.score {
                Ordering::Less // Orden descendente
            } else if a.score < b.score {
                Ordering::Greater
            } else {
                Ordering::Equal
            }
        });

        // Tomar los mejores resultados
        let result_count = potential_matches.len().min(max_results as usize);
        for i in 0..result_count {
            matches.push(potential_matches[i].address);
        }

        Ok(matches)
    }

    /// Obtiene el nivel de boost de un usuario
    pub fn get_user_boost_level(&mut self, user: Address) -> U256 {
        if self.boost_manager.get().is_zero() {
            return U256::ZERO;
        }

        let boost_manager = IBoostManager::new(self.boost_manager.get());
        let config = Call::new_in(self);

        match boost_manager.get_boost_level(config, user) {
            Ok(level) => level,
            Err(_) => U256::ZERO,
        }
    }

    /// Obtiene la lista de POAPs verificados de un usuario
    pub fn get_user_poaps(&self, user: Address) -> Vec<U256> {
        let mut result = Vec::new();

        if let Some(user_poaps) = self.user_poaps.getter(user) {
            for i in 0..user_poaps.len() {
                if let Some(poap_id) = user_poaps.getter(i) {
                    result.push(poap_id.get());
                }
            }
        }

        result
    }

    /// Obtiene información del perfil de un usuario
    pub fn get_user_profile(&mut self, user: Address) -> (bool, U256, String, U256, U256, Vec<Address>) {
        if let Some(profile) = self.user_profiles.getter(user) {
            let is_active = profile.is_active.get();
            let last_active = profile.last_active.get();
            let location = profile.location.get_string();

            let boost_level = self.get_user_boost_level(user);
            let poap_count = U256::from(self.get_user_poaps(user).len() as u64);

            let mut matches = Vec::new();
            if let Some(user_matches) = profile.matches {
                for i in 0..user_matches.len() {
                    if let Some(match_addr) = user_matches.getter(i) {
                        matches.push(match_addr.get());
                    }
                }
            }

            return (is_active, last_active, location, boost_level, poap_count, matches);
        }

        (false, U256::ZERO, String::new(), U256::ZERO, U256::ZERO, Vec::new())
    }

    /// Obtiene la tarifa de registro
    pub fn get_registration_fee(&self) -> U256 {
        self.registration_fee.get()
    }

    /// Actualiza la tarifa de registro
    pub fn update_registration_fee(&mut self, new_fee: U256) -> Result<(), MainContractError> {
        if msg::sender() != self.owner.get() {
            return Err(MainContractError::Unauthorized(Unauthorized {}));
        }

        let old_fee = self.registration_fee.get();
        self.registration_fee.set(new_fee);

        // Emitir evento
        sol_emit!(RegistrationFeeUpdated(old_fee, new_fee));

        Ok(())
    }

    /// Verifica si un usuario está registrado
    pub fn is_user_registered(&self, user: Address) -> bool {
        if let Some(profile) = self.user_profiles.getter(user) {
            return profile.is_active.get();
        }
        false
    }

    /// Verifica si un usuario está activo
    pub fn is_user_active(&self, user: Address) -> bool {
        if let Some(profile) = self.user_profiles.getter(user) {
            if !profile.is_active.get() {
                return false;
            }

            // Usuario considerado inactivo si no ha estado activo en 30 días
            let now = U256::from(block::timestamp());
            let last_active = profile.last_active.get();

            return now.saturating_sub(last_active) <= U256::from(30 * 24 * 60 * 60);
        }
        false
    }

    /// Verifica si una dirección es operador
    fn is_operator(&self, addr: Address) -> bool {
        addr == self.owner.get() || self.operators.get(addr)
    }

    /// Permite al propietario retirar fondos
    pub fn withdraw_funds(&mut self, to: Address, amount: U256) -> Result<(), MainContractError> {
        if msg::sender() != self.owner.get() {
            return Err(MainContractError::Unauthorized(Unauthorized {}));
        }

        if to.is_zero() {
            return Err(MainContractError::InvalidParameters(InvalidParameters {}));
        }

        let total_funds = self.total_funds.get();
        if amount > total_funds {
            return Err(MainContractError::InsufficientPayment(InsufficientPayment {}));
        }

        self.total_funds.set(total_funds - amount);

        match transfer_eth(to, amount) {
            Ok(_) => {
                sol_emit!(FundsWithdrawn(to, amount, block::timestamp()));
                Ok(())
            },
            Err(_) => {
                self.total_funds.set(total_funds);
                Err(MainContractError::WithdrawalFailed(WithdrawalFailed {}))
            }
        }
    }

    /// Obtiene el total de fondos del contrato
    pub fn get_total_funds(&self) -> U256 {
        self.total_funds.get()
    }

    /// Obtiene el número total de usuarios registrados
    pub fn get_total_users(&self) -> U256 {
        U256::from(self.registered_users.len() as u64)
    }
}
