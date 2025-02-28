#![cfg_attr(not(feature = "export-abi"), no_main)]
extern crate alloc;

use alloy_primitives::{Address, U256, FixedBytes};
use alloy_sol_types::sol;
use stylus_sdk::{
    msg, 
    prelude::*, 
    call::{transfer_eth, call, Call}, 
    block, 
    evm,
    storage::{
        StorageAddress,
        StorageMap,
        StorageBool,
        StorageU256
    }
};

// Definición de eventos y errores usando Solidity
sol! {
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
    amount: StorageU256,        
    start_time: StorageU256,    
    end_time: StorageU256,      
    is_active: StorageBool,     
}

#[storage]
#[entrypoint]
pub struct BoostManager {
    boosts: StorageMap<Address, Boost>,  
    min_boost_price: StorageU256,        
    owner: StorageAddress,               
    main_contract: StorageAddress,       
    total_funds: StorageU256,            
    operators: StorageMap<Address, StorageBool>, 
}

#[public]
impl BoostManager {
    pub fn init(&mut self) -> Result<(), BoostManagerError> {
        if !self.owner.get().is_zero() {
            return Err(BoostManagerError::Unauthorized(Unauthorized {}));
        }
        
        self.owner.set(msg::sender());
        self.operators.insert(msg::sender(), true);
        self.min_boost_price.set(U256::from(10_000_000_000_000_000u64));
        self.total_funds.set(U256::ZERO);
        
        Ok(())
    }
    
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
    
    pub fn remove_operator(&mut self, operator: Address) -> Result<(), BoostManagerError> {
        if msg::sender() != self.owner.get() {
            return Err(BoostManagerError::Unauthorized(Unauthorized {}));
        }
        
        self.operators.insert(operator, false);
        Ok(())
    }

    #[payable]
    pub fn purchase_boost(&mut self, days: U256) -> Result<(), BoostManagerError> {
        if days.is_zero() {
            return Err(BoostManagerError::ZeroDaysNotAllowed(ZeroDaysNotAllowed {}));
        }
        
        let sender = msg::sender();
        let payment = msg::value();
        let min_price = self.min_boost_price.get() * days;
        
        if payment < min_price {
            return Err(BoostManagerError::InsufficientPayment(InsufficientPayment {}));
        }
        
        let duration = days * U256::from(86400);
        let now = U256::from(block::timestamp());
        let end_time = now + duration;
        
        let mut boost = self.boosts.setter(sender);
        boost.amount.set(payment);
        boost.start_time.set(now);
        boost.end_time.set(end_time);
        boost.is_active.set(true);
        
        let current_total = self.total_funds.get();
        self.total_funds.set(current_total + payment);
        
        // Emit BoostPurchased
        let event_sig = FixedBytes::<32>::from_slice(&[
            0x92, 0x85, 0x29, 0x14, 0x87, 0x29, 0x54, 0x82,
            0x95, 0x82, 0x94, 0x82, 0x94, 0x82, 0x91, 0x82,
            0x94, 0x82, 0x94, 0x82, 0x94, 0x82, 0x91, 0x84,
            0x92, 0x84, 0x92, 0x84, 0x92, 0x84, 0x92, 0x84
        ]);
        
        let _ = evm::raw_log(
            &[event_sig, sender.into_word(), payment.into_word(), duration.into_word()],
            &now.to_be_bytes_pad()
        );
        
        Ok(())
    }
    
    pub fn check_boost_status(&mut self, user: Address) -> Result<bool, BoostManagerError> {
        if !self.is_authorized(msg::sender(), user) {
            return Err(BoostManagerError::Unauthorized(Unauthorized {}));
        }
        
        let boost_opt = self.boosts.getter(user);
        if boost_opt.is_none() {
            return Ok(false);
        }
        
        let mut boost = self.boosts.setter(user);
        
        if !boost.is_active.get() {
            return Ok(false);
        }
        
        let now = U256::from(block::timestamp());
        let end_time = boost.end_time.get();
        
        if now > end_time {
            boost.is_active.set(false);
            
            // Emit BoostExpired
            let event_sig = FixedBytes::<32>::from_slice(&[
                0x82, 0x95, 0x82, 0x94, 0x82, 0x94, 0x82, 0x91,
                0x84, 0x92, 0x84, 0x92, 0x84, 0x92, 0x84, 0x92,
                0x84, 0x92, 0x84, 0x92, 0x84, 0x92, 0x84, 0x92,
                0x84, 0x92, 0x84, 0x92, 0x84, 0x92, 0x84, 0x93
            ]);
            
            let _ = evm::raw_log(
                &[event_sig, user.into_word()],
                &now.to_be_bytes_pad()
            );
            
            return Ok(false);
        }
        
        Ok(true)
    }
    
    pub fn get_boost_level(&self, user: Address) -> U256 {
        let boost_opt = self.boosts.getter(user);
        
        if boost_opt.is_none() {
            return U256::ZERO;
        }
        
        let boost = boost_opt.unwrap();
        
        if !boost.is_active.get() {
            return U256::ZERO;
        }
        
        let now = U256::from(block::timestamp());
        let end_time = boost.end_time.get();
        
        if now > end_time {
            return U256::ZERO;
        }
        
        boost.amount.get()
    }
    
    pub fn get_remaining_boost_time(&self, user: Address) -> U256 {
        let boost_opt = self.boosts.getter(user);
        
        if boost_opt.is_none() {
            return U256::ZERO;
        }
        
        let boost = boost_opt.unwrap();
        
        if !boost.is_active.get() {
            return U256::ZERO;
        }
        
        let now = U256::from(block::timestamp());
        let end_time = boost.end_time.get();
        
        if now >= end_time {
            return U256::ZERO;
        }
        
        end_time - now
    }
    
    pub fn withdraw_funds(&mut self, to: Address, amount: U256) -> Result<(), BoostManagerError> {
        if msg::sender() != self.owner.get() {
            return Err(BoostManagerError::Unauthorized(Unauthorized {}));
        }
        
        if to.is_zero() {
            return Err(BoostManagerError::ZeroAddressNotAllowed(ZeroAddressNotAllowed {}));
        }
        
        let total_funds = self.total_funds.get();
        if amount > total_funds {
            return Err(BoostManagerError::InsufficientPayment(InsufficientPayment {}));
        }
        
        self.total_funds.set(total_funds - amount);
        
        match transfer_eth(to, amount) {
            Ok(_) => {
                // Emit FundsWithdrawn
                let event_sig = FixedBytes::<32>::from_slice(&[
                    0x72, 0x95, 0x82, 0x94, 0x82, 0x94, 0x82, 0x91,
                    0x84, 0x92, 0x84, 0x92, 0x84, 0x92, 0x84, 0x92,
                    0x84, 0x92, 0x84, 0x92, 0x84, 0x92, 0x84, 0x92,
                    0x84, 0x92, 0x84, 0x92, 0x84, 0x92, 0x84, 0x94
                ]);
                
                let timestamp = U256::from(block::timestamp());
                let _ = evm::raw_log(
                    &[event_sig, to.into_word(), amount.into_word()],
                    &timestamp.to_be_bytes_pad()
                );
                
                Ok(())
            },
            Err(_) => {
                self.total_funds.set(total_funds);
                Err(BoostManagerError::WithdrawalFailed(WithdrawalFailed {}))
            }
        }
    }
    
    pub fn update_min_boost_price(&mut self, new_price: U256) -> Result<(), BoostManagerError> {
        if msg::sender() != self.owner.get() {
            return Err(BoostManagerError::Unauthorized(Unauthorized {}));
        }
        
        let old_price = self.min_boost_price.get();
        self.min_boost_price.set(new_price);
        
        // Emit MinBoostPriceUpdated
        let event_sig = FixedBytes::<32>::from_slice(&[
            0x62, 0x95, 0x82, 0x94, 0x82, 0x94, 0x82, 0x91,
            0x84, 0x92, 0x84, 0x92, 0x84, 0x92, 0x84, 0x92,
            0x84, 0x92, 0x84, 0x92, 0x84, 0x92, 0x84, 0x92,
            0x84, 0x92, 0x84, 0x92, 0x84, 0x92, 0x84, 0x95
        ]);
        
        let _ = evm::raw_log(
            &[event_sig, old_price.into_word(), new_price.into_word()],
            &[]
        );
        
        Ok(())
    }
    
    pub fn get_min_boost_price(&self) -> U256 {
        self.min_boost_price.get()
    }
    
    pub fn get_total_funds(&self) -> U256 {
        self.total_funds.get()
    }
    
    fn is_authorized(&self, caller: Address, user: Address) -> bool {
        caller == self.owner.get() || 
        caller == self.main_contract.get() || 
        caller == user || 
        self.operators.get(caller)
    }
}