#![cfg_attr(not(feature = "export-abi"), no_main)]
extern crate alloc;

use alloc::vec::Vec;
use alloy_primitives::{Address, U256, FixedBytes};
use stylus_sdk::{
    msg, 
    prelude::*, 
    call::Call, 
    block,
    evm,
    storage::{
        StorageAddress,
        StorageMap,
        StorageBool,
        StorageVec,
        StorageU256
    },
};

// Definir los eventos sin usar el macro sol!
struct POAPVerifiedEvent {
    user: Address,
    poap_id: U256,
    timestamp: u64,
}

struct VerificationAttemptEvent {
    user: Address,
    poap_id: U256,
    success: bool,
}

// Definir los errores sin usar el macro sol!
#[derive(Debug)]
pub enum POAPVerifierErrorKind {
    Unauthorized,
    POAPNotOwned,
    InvalidPOAP,
    CallFailed,
}

// Interfaz para interactuar con el API de POAP a través de un oracle
sol_interface! {
    interface IPOAPOracle {
        function verifyPOAPOwnership(address user, uint256 event_id) external returns (bool);
    }
    
    // Interfaz para el contrato POAP en Arbitrum (si existe) o para un adaptador cross-chain
    interface IPOAP {
        function balanceOf(address owner) external view returns (uint256);
        function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256);
        function tokenURI(uint256 token_id) external view returns (string);
        function ownerOf(uint256 token_id) external view returns (address);
    }
}

// Adaptación manual del SolidityError
pub struct POAPVerifierError {
    kind: POAPVerifierErrorKind,
}

impl POAPVerifierError {
    pub fn unauthorized() -> Self {
        Self { kind: POAPVerifierErrorKind::Unauthorized }
    }
    
    pub fn poap_not_owned() -> Self {
        Self { kind: POAPVerifierErrorKind::POAPNotOwned }
    }
    
    pub fn invalid_poap() -> Self {
        Self { kind: POAPVerifierErrorKind::InvalidPOAP }
    }
    
    pub fn call_failed() -> Self {
        Self { kind: POAPVerifierErrorKind::CallFailed }
    }
}

#[storage]
#[entrypoint]
pub struct POAPVerifier {  
    poap_contract: StorageAddress,
    poap_oracle: StorageAddress,
    owner: StorageAddress,
    main_contract: StorageAddress,
    operators: StorageMap<Address, StorageBool>,
    verified_poaps: StorageMap<Address, StorageVec<StorageU256>>,
    last_verified_poap: StorageMap<Address, StorageU256>,
    poap_verification_count: StorageMap<U256, StorageU256>,
    user_verified: StorageMap<Address, StorageBool>,
}

#[public]
impl POAPVerifier {
    pub fn init(&mut self) -> Result<(), POAPVerifierError> {
        if !self.owner.get().is_zero() {
            return Err(POAPVerifierError::unauthorized());
        }
        
        self.owner.set(msg::sender());
        self.operators.insert(msg::sender(), true);
        
        self.poap_contract.set(Address::ZERO);
        self.poap_oracle.set(Address::ZERO);
        self.main_contract.set(Address::ZERO);
        
        Ok(())
    }
    
    pub fn set_main_contract(&mut self, main_contract: Address) -> Result<(), POAPVerifierError> {
        if msg::sender() != self.owner.get() {
            return Err(POAPVerifierError::unauthorized());
        }
        
        if main_contract.is_zero() {
            return Err(POAPVerifierError::invalid_poap());
        }
        
        self.main_contract.set(main_contract);
        self.operators.insert(main_contract, true);
        Ok(())
    }
    
    pub fn set_poap_oracle(&mut self, oracle_address: Address) -> Result<(), POAPVerifierError> {
        if msg::sender() != self.owner.get() {
            return Err(POAPVerifierError::unauthorized());
        }
        
        self.poap_oracle.set(oracle_address);
        Ok(())
    }
    
    pub fn add_operator(&mut self, operator: Address) -> Result<(), POAPVerifierError> {
        if msg::sender() != self.owner.get() {
            return Err(POAPVerifierError::unauthorized());
        }
        
        self.operators.insert(operator, true);
        Ok(())
    }
    
    pub fn remove_operator(&mut self, operator: Address) -> Result<(), POAPVerifierError> {
        if msg::sender() != self.owner.get() {
            return Err(POAPVerifierError::unauthorized());
        }
        
        self.operators.insert(operator, false);
        Ok(())
    }
    
    // Verificar la propiedad de un POAP
    pub fn verify_poap_ownership(&mut self, user: Address, poap_id: U256) -> Result<bool, POAPVerifierError> {
        // Verificar que el llamante sea un operador autorizado
        if !self.is_operator(msg::sender()) {
            return Err(POAPVerifierError::unauthorized());
        }
        
        // Verificar POAP usando el método apropiado según la configuración
        let owns_poap = self.check_poap_ownership(user, poap_id)?;
        
        // Emitir evento de intento de verificación usando raw_log
        // Calcular keccak256("VerificationAttempt(address,uint256,bool)")
        let event_sig = FixedBytes::<32>::from_slice(&[
            0x5a, 0x97, 0x31, 0x2d, 0xe2, 0x32, 0x12, 0x7c, 
            0x8a, 0x86, 0x85, 0xac, 0x97, 0xf1, 0x4f, 0xeb, 
            0x3d, 0x96, 0x65, 0xaa, 0x5d, 0x75, 0x3a, 0x42, 
            0xf3, 0x10, 0xc1, 0xb0, 0x8e, 0x6e, 0xed, 0x4e
        ]);
        
        let mut data = Vec::with_capacity(32);
        data.extend_from_slice(&[0; 31]);
        data.push(owns_poap as u8);
        
        let _ = evm::raw_log(
            &[event_sig, user.into_word(), poap_id.into_word()],
            &data
        );
        
        if owns_poap {
            // Almacenar el POAP verificado            
            let mut user_poaps = self.verified_poaps.setter(user);
            user_poaps.push(poap_id);
            
            // Actualizar el último POAP verificado
            self.last_verified_poap.insert(user, poap_id);
            
            // Incrementar el contador de verificaciones para este POAP
            let current_count = self.poap_verification_count.get(poap_id);
            self.poap_verification_count.insert(poap_id, current_count + U256::from(1));
            
            // Marcar al usuario como verificado
            self.user_verified.insert(user, true);
            
            // Emitir evento POAPVerified
            // Calcular keccak256("POAPVerified(address,uint256,uint256)")
            let event_sig = FixedBytes::<32>::from_slice(&[
                0x95, 0x2e, 0x44, 0xb2, 0x99, 0x5d, 0x91, 0x0f, 
                0x10, 0xab, 0x7b, 0x57, 0x13, 0xd7, 0xa5, 0x9a, 
                0x91, 0xb8, 0x95, 0x88, 0x72, 0xe9, 0x6c, 0xc3, 
                0xbb, 0x2d, 0x5f, 0x72, 0xe6, 0x8b, 0xac, 0x37
            ]);
            
            let timestamp = block::timestamp();
            let mut timestamp_bytes = [0u8; 32];
            let ts_u64 = timestamp as u64;
            timestamp_bytes[24..32].copy_from_slice(&ts_u64.to_be_bytes());
            
            let _ = evm::raw_log(
                &[event_sig, user.into_word(), poap_id.into_word()],
                &timestamp_bytes
            );
        }
        
        Ok(owns_poap)
    }
    
    // Verificación real de propiedad de POAP
    fn check_poap_ownership(&mut self, user: Address, poap_id: U256) -> Result<bool, POAPVerifierError> {
        // Primero intentamos verificar a través del contrato de POAP si está configurado
        if !self.poap_contract.get().is_zero() {
            let poap = IPOAP::new(self.poap_contract.get());
            
            // Intentar usar ownerOf para verificar directamente
            let config = Call::new_in(self);
            
            match poap.owner_of(config, poap_id) {
                Ok(owner) => return Ok(owner == user),
                Err(_) => {
                    // Si falla, podría ser que el token no exista o que el contrato no soporte esta interfaz
                    // Intentemos un enfoque alternativo con balanceOf
                    let config = Call::new_in(self);
                    match poap.balance_of(config, user) {
                        Ok(balance) => {
                            if balance.is_zero() {
                                return Ok(false);
                            }
                            
                            // El usuario tiene POAPs, verifiquemos si tiene el específico
                            for i in 0..balance.as_u64() {
                                let config = Call::new_in(self);
                                if let Ok(token_id) = poap.token_of_owner_by_index(config, user, U256::from(i)) {
                                    if token_id == poap_id {
                                        return Ok(true);
                                    }
                                }
                            }
                            return Ok(false);
                        },
                        Err(_) => {} // Continuar con el siguiente método
                    }
                }
            }
        }
        
        // Si el contrato POAP no está establecido o falla, intentemos con el oráculo
        if !self.poap_oracle.get().is_zero() {
            let oracle = IPOAPOracle::new(self.poap_oracle.get());
            let config = Call::new_in(self);
            
            match oracle.verify_poap_ownership(config, user, poap_id) {
                Ok(result) => return Ok(result),
                Err(_) => {} // Continuar con el siguiente método si falla
            }
        }
        
        // Implementación para entorno de debug y producción
        #[cfg(feature = "debug")]
        return Ok(true);
        
        #[cfg(not(feature = "debug"))]
        return Err(POAPVerifierError::call_failed());
    }
    
    // Verificar si una dirección es un operador autorizado
    fn is_operator(&self, address: Address) -> bool {
        address == self.owner.get() || 
        address == self.main_contract.get() || 
        self.operators.get(address)
    }
    
    // Obtener el último POAP verificado para un usuario
    pub fn get_last_verified_poap(&self, user: Address) -> U256 {
        self.last_verified_poap.get(user)
    }
    
    // Obtener todos los POAPs verificados para un usuario
    pub fn get_verified_poaps(&self, user: Address) -> Vec<U256> {
        if let Some(user_poaps) = self.verified_poaps.getter(user) {
            let len = user_poaps.len();
            let mut result = Vec::with_capacity(len as usize);
            
            for i in 0..len {
                if let Some(poap_id) = user_poaps.getter(i) {
                    result.push(poap_id.get());
                }
            }
            result
        } else {
            Vec::new()
        }
    }
    
    // Obtener el número de usuarios que han verificado un POAP específico
    pub fn get_poap_verification_count(&self, poap_id: U256) -> U256 {
        self.poap_verification_count.get(poap_id)
    }
    
    // Verificar si un usuario ha verificado al menos un POAP
    pub fn is_user_verified(&self, user: Address) -> bool {
        self.user_verified.get(user)
    }
    
    // Actualizar la dirección del contrato POAP
    pub fn update_poap_contract(&mut self, new_contract: Address) -> Result<(), POAPVerifierError> {
        if msg::sender() != self.owner.get() {
            return Err(POAPVerifierError::unauthorized());
        }
        
        self.poap_contract.set(new_contract);
        Ok(())
    }
}