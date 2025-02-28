#![cfg_attr(not(feature = "export-abi"), no_main)]
extern crate alloc;

use alloy_primitives::{Address, U256};
use alloy_sol_types::sol;
use stylus_sdk::{
    msg, 
    prelude::*, 
    call::{transfer_eth, call, Call}, 
    block, 
    evm,
    alloy_primitives
};

// Definición de eventos y errores usando Solidity
sol! {
    // Emitido cuando un usuario compra un boost
    event BoostPurchased(address indexed user, uint256 amount, uint256 duration, uint256 timestamp);
    
    // Emitido cuando un boost expira
    event BoostExpired(address indexed user, uint256 timestamp);
    
    // Emitido cuando el propietario retira fondos
    event FundsWithdrawn(address indexed to, uint256 amount, uint256 timestamp);
    
    // Emitido cuando se actualiza el precio mínimo del boost
    event MinBoostPriceUpdated(uint256 oldPrice, uint256 newPrice);
    
    error Unauthorized();
    error InsufficientPayment();
    error NoActiveBoost();
    error WithdrawalFailed();
    error ZeroAddressNotAllowed();
    error ZeroDaysNotAllowed();
}

#[derive(SolidityError)]
pub enum BoostManagerError {
    Unauthorized(Unauthorized),
    InsufficientPayment(InsufficientPayment),
    NoActiveBoost(NoActiveBoost),
    WithdrawalFailed(WithdrawalFailed),
    ZeroAddressNotAllowed(ZeroAddressNotAllowed),
    ZeroDaysNotAllowed(ZeroDaysNotAllowed),
}

// Estructura de almacenamiento para la información del boost
#[storage]
struct Boost {
    amount: StorageU256,        // Cantidad pagada por el boost
    start_time: StorageU256,    // Timestamp de inicio del boost
    end_time: StorageU256,      // Timestamp de finalización del boost
    is_active: StorageBool,     // Indica si el boost está activo
}

// Contrato principal para gestionar los boosts
#[storage]
#[entrypoint]
pub struct BoostManager {
    boosts: StorageMap<Address, Boost>,  // Mapeo de dirección a boost
    min_boost_price: StorageU256,        // Precio mínimo por día de boost
    owner: StorageAddress,               // Propietario del contrato
    main_contract: StorageAddress,       // Contrato principal de la aplicación
    total_funds: StorageU256,            // Total de fondos recolectados
    operators: StorageMap<Address, StorageBool>, // Operadores autorizados
}

#[public]
impl BoostManager {
    /// Inicializa el contrato estableciendo al remitente como propietario
    /// y configurando el precio mínimo del boost.
    pub fn init(&mut self) -> Result<(), BoostManagerError> {
        if !self.owner.get().is_zero() {
            return Err(BoostManagerError::Unauthorized(Unauthorized {}));
        }
        
        self.owner.set(msg::sender());
        self.operators.insert(msg::sender(), true);
        
        // 0.01 ETH (10^16 wei) por día por defecto
        self.min_boost_price.set(U256::from(10_000_000_000_000_000u64));
        self.total_funds.set(U256::ZERO);
        
        Ok(())
    }
    
    /// Establece la dirección del contrato principal.
    /// Solo el propietario puede llamar a esta función.
    pub fn set_main_contract(&mut self, main_contract: Address) -> Result<(), BoostManagerError> {
        if msg::sender() != self.owner.get() {
            return Err(BoostManagerError::Unauthorized(Unauthorized {}));
        }
        
        if main_contract.is_zero() {
            return Err(BoostManagerError::ZeroAddressNotAllowed(ZeroAddressNotAllowed {}));
        }
        
        self.main_contract.set(main_contract);
        self.operators.insert(main_contract, true);
        Ok(())
    }
    
    /// Añade un operador autorizado para verificar boosts
    pub fn add_operator(&mut self, operator: Address) -> Result<(), BoostManagerError> {
        if msg::sender() != self.owner.get() {
            return Err(BoostManagerError::Unauthorized(Unauthorized {}));
        }
        
        if operator.is_zero() {
            return Err(BoostManagerError::ZeroAddressNotAllowed(ZeroAddressNotAllowed {}));
        }
        
        self.operators.insert(operator, true);
        Ok(())
    }
    
    /// Elimina un operador
    pub fn remove_operator(&mut self, operator: Address) -> Result<(), BoostManagerError> {
        if msg::sender() != self.owner.get() {
            return Err(BoostManagerError::Unauthorized(Unauthorized {}));
        }
        
        self.operators.insert(operator, false);
        Ok(())
    }

    /// Permite a un usuario comprar un boost por una cantidad de días.
    /// El usuario debe enviar suficiente ETH para cubrir el precio mínimo.
    /// Esta función es pagable (payable).
    #[payable]
    pub fn purchase_boost(&mut self, days: U256) -> Result<(), BoostManagerError> {
        if days.is_zero() {
            return Err(BoostManagerError::ZeroDaysNotAllowed(ZeroDaysNotAllowed {}));
        }
        
        let sender = msg::sender();
        let payment = msg::value();
        
        // Calcular el precio mínimo para los días solicitados
        let min_price = self.min_boost_price.get() * days;
        
        // Verificar que el pago sea suficiente
        if payment < min_price {
            return Err(BoostManagerError::InsufficientPayment(InsufficientPayment {}));
        }
        
        // Calcular la duración en segundos
        let duration = days * U256::from(86400); // 86400 segundos = 1 día
        let now = U256::from(block::timestamp());
        let end_time = now + duration;
        
        // Almacenar información del boost
        let mut boost = self.boosts.setter(sender);
        boost.amount.set(payment);
        boost.start_time.set(now);
        boost.end_time.set(end_time);
        boost.is_active.set(true);
        
        // Actualizar el total de fondos
        let current_total = self.total_funds.get();
        self.total_funds.set(current_total + payment);
        
        // Emitir evento
        sol_emit!(BoostPurchased(sender, payment, duration, now.as_u64()));
        
        Ok(())
    }
    
    /// Verifica si un usuario tiene un boost activo.
    /// Si el boost ha expirado, lo marca como inactivo.
    pub fn check_boost_status(&mut self, user: Address) -> Result<bool, BoostManagerError> {
        // Comprobar si el llamante está autorizado
        if !self.is_authorized(msg::sender(), user) {
            return Err(BoostManagerError::Unauthorized(Unauthorized {}));
        }
        
        let boost_opt = self.boosts.getter(user);
        if boost_opt.is_none() {
            return Ok(false);
        }
        
        let mut boost = self.boosts.setter(user);
        
        // Si el boost ya está marcado como inactivo
        if !boost.is_active.get() {
            return Ok(false);
        }
        
        // Comprobar si el boost ha expirado
        let now = U256::from(block::timestamp());
        let end_time = boost.end_time.get();
        
        if now > end_time {
            boost.is_active.set(false);
            sol_emit!(BoostExpired(user, now.as_u64()));
            return Ok(false);
        }
        
        // El boost sigue activo
        Ok(true)
    }
    
    /// Obtiene el nivel de boost de un usuario, que es la cantidad pagada.
    /// Si el boost no está activo o ha expirado, devuelve 0.
    pub fn get_boost_level(&self, user: Address) -> U256 {
        let boost_opt = self.boosts.getter(user);
        
        if boost_opt.is_none() {
            return U256::ZERO;
        }
        
        let boost = boost_opt.unwrap();
        
        if !boost.is_active.get() {
            return U256::ZERO;
        }
        
        // Verificar si ha expirado
        let now = U256::from(block::timestamp());
        let end_time = boost.end_time.get();
        
        if now > end_time {
            return U256::ZERO;
        }
        
        // Devolver la cantidad pagada como nivel de boost
        boost.amount.get()
    }
    
    /// Obtiene el tiempo restante de boost en segundos
    pub fn get_remaining_boost_time(&self, user: Address) -> U256 {
        let boost_opt = self.boosts.getter(user);
        
        if boost_opt.is_none() {
            return U256::ZERO;
        }
        
        let boost = boost_opt.unwrap();
        
        if !boost.is_active.get() {
            return U256::ZERO;
        }
        
        // Obtener tiempo actual
        let now = U256::from(block::timestamp());
        let end_time = boost.end_time.get();
        
        // Si ha expirado, devolver 0
        if now >= end_time {
            return U256::ZERO;
        }
        
        // Calcular tiempo restante
        end_time - now
    }
    
    /// Permite al propietario retirar fondos del contrato.
    pub fn withdraw_funds(&mut self, to: Address, amount: U256) -> Result<(), BoostManagerError> {
        // Solo el propietario puede retirar fondos
        if msg::sender() != self.owner.get() {
            return Err(BoostManagerError::Unauthorized(Unauthorized {}));
        }
        
        // La dirección destino no puede ser cero
        if to.is_zero() {
            return Err(BoostManagerError::ZeroAddressNotAllowed(ZeroAddressNotAllowed {}));
        }
        
        // Verificar fondos disponibles
        let total_funds = self.total_funds.get();
        if amount > total_funds {
            return Err(BoostManagerError::InsufficientPayment(InsufficientPayment {}));
        }
        
        // Actualizar fondos total antes de la transferencia
        self.total_funds.set(total_funds - amount);
        
        // Transferir ETH
        match transfer_eth(to, amount) {
            Ok(_) => {
                // Éxito - emitir evento
                sol_emit!(FundsWithdrawn(to, amount, block::timestamp()));
                Ok(())
            },
            Err(_) => {
                // Fallo - revertir cambios en total_funds
                self.total_funds.set(total_funds);
                Err(BoostManagerError::WithdrawalFailed(WithdrawalFailed {}))
            }
        }
    }
    
    /// Actualiza el precio mínimo por día de boost.
    pub fn update_min_boost_price(&mut self, new_price: U256) -> Result<(), BoostManagerError> {
        if msg::sender() != self.owner.get() {
            return Err(BoostManagerError::Unauthorized(Unauthorized {}));
        }
        
        let old_price = self.min_boost_price.get();
        self.min_boost_price.set(new_price);
        
        // Emitir evento de actualización de precio
        sol_emit!(MinBoostPriceUpdated(old_price, new_price));
        
        Ok(())
    }
    
    /// Obtiene el precio mínimo por día de boost.
    pub fn get_min_boost_price(&self) -> U256 {
        self.min_boost_price.get()
    }
    
    /// Obtiene el total de fondos acumulados en el contrato.
    pub fn get_total_funds(&self) -> U256 {
        self.total_funds.get()
    }
    
    /// Verifica si una dirección está autorizada para verificar el boost de un usuario
    fn is_authorized(&self, caller: Address, user: Address) -> bool {
        caller == self.owner.get() || 
        caller == self.main_contract.get() || 
        caller == user || 
        self.operators.get(caller)
    }
}