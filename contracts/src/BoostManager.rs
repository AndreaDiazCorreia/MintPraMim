#![cfg_attr(not(feature = "export-abi"), no_main)]
extern crate alloc;

use alloy_primitives::{Address, U256};
use alloy_sol_types::sol;
use stylus_sdk::{msg, prelude::*, call::{transfer_eth, call, Call}, alloy_primitives};

sol! {
    event BoostPurchased(address indexed user, uint256 amount, uint256 duration, uint256 timestamp);
    event BoostExpired(address indexed user, uint256 timestamp);
    event FundsWithdrawn(address indexed to, uint256 amount, uint256 timestamp);
    
    error Unauthorized();
    error InsufficientPayment();
    error NoActiveBoost();
    error WithdrawalFailed();
}

#[derive(SolidityError)]
pub enum BoostManagerError {
    Unauthorized(Unauthorized),
    InsufficientPayment(InsufficientPayment),
    NoActiveBoost(NoActiveBoost),
    WithdrawalFailed(WithdrawalFailed),
}


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
}

#[public]
impl BoostManager {

    pub fn init(&mut self) -> Result<(), BoostManagerError> {
        if !self.owner.get().is_zero() {
            return Err(BoostManagerError::Unauthorized(Unauthorized {}));
        }
        
        self.owner.set(msg::sender());
        self.min_boost_price.set(U256::from(10_000_000_000_000_000u64)); // 0.01 ETH por día por defecto
        self.total_funds.set(U256::ZERO);
        
        Ok(())
    }
    

    pub fn set_main_contract(&mut self, main_contract: Address) -> Result<(), BoostManagerError> {
        if msg::sender() != self.owner.get() {
            return Err(BoostManagerError::Unauthorized(Unauthorized {}));
        }
        
        self.main_contract.set(main_contract);
        Ok(())
    }

    #[payable]
    pub fn purchase_boost(&mut self, days: U256) -> Result<(), BoostManagerError> {
        let sender = msg::sender();
        let payment = msg::value();
        

        let min_price = self.min_boost_price.get() * days;
        

        if payment < min_price {
            return Err(BoostManagerError::InsufficientPayment(InsufficientPayment {}));
        }
        

        let duration = days * U256::from(86400); // 86400 segundos = 1 día
        let now = U256::from(block::timestamp());
        let end_time = now + duration;
        

        let mut boost = self.boosts.setter(sender);
        boost.amount.set(payment);
        boost.start_time.set(now);
        boost.end_time.set(end_time);
        boost.is_active.set(true);
        

        let current_total = self.total_funds.get();
        self.total_funds.set(current_total + payment);
        

        sol_emit!(BoostPurchased(sender, payment, duration, now.as_u64()));
        
        Ok(())
    }
    

    pub fn check_boost_status(&mut self, user: Address) -> Result<bool, BoostManagerError> {

        if msg::sender() != self.main_contract.get() && msg::sender() != self.owner.get() && msg::sender() != user {
            return Err(BoostManagerError::Unauthorized(Unauthorized {}));
        }
        
        let mut boost = self.boosts.setter(user);
        

        if !boost.is_active.get() {
            return Ok(false);
        }
        
        let now = U256::from(block::timestamp());
        let end_time = boost.end_time.get();
        

        if now > end_time {
            boost.is_active.set(false);
            

            sol_emit!(BoostExpired(user, now.as_u64()));
            
            return Ok(false);
        }
        

        Ok(true)
    }
    

    pub fn get_boost_level(&self, user: Address) -> U256 {
        let boost = self.boosts.getter(user);
        

        if boost.is_none() || !boost.unwrap().is_active.get() {
            return U256::ZERO;
        }
        
        let boost = boost.unwrap();
        let now = U256::from(block::timestamp());
        let end_time = boost.end_time.get();
        

        if now > end_time {
            return U256::ZERO;
        }
        

        boost.amount.get()
    }
    

    pub fn withdraw_funds(&mut self, to: Address, amount: U256) -> Result<(), BoostManagerError> {
        if msg::sender() != self.owner.get() {
            return Err(BoostManagerError::Unauthorized(Unauthorized {}));
        }
        
        let total_funds = self.total_funds.get();
        

        if amount > total_funds {
            return Err(BoostManagerError::InsufficientPayment(InsufficientPayment {}));
        }
        

        self.total_funds.set(total_funds - amount);
        

        match transfer_eth(to, amount) {
            Ok(_) => {

                sol_emit!(FundsWithdrawn(to, amount, block::timestamp()));
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
        
        self.min_boost_price.set(new_price);
        Ok(())
    }
    

    pub fn get_min_boost_price(&self) -> U256 {
        self.min_boost_price.get()
    }
    

    pub fn get_total_funds(&self) -> U256 {
        self.total_funds.get()
    }
}