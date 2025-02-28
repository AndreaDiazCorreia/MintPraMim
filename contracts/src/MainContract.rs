#![cfg_attr(not(feature = "export-abi"), no_main)]
extern crate alloc;

use alloy_primitives::{Address, U256};
use alloy_sol_types::sol;
use stylus_sdk::{msg, prelude::*, alloy_primitives};

sol! {
    event UserRegistered(address indexed user, uint256 timestamp);
    event MatchReported(address indexed user1, address indexed user2, uint256 timestamp);
    event UserUpdated(address indexed user, uint256 timestamp);
    
    error Unauthorized();
    error InvalidParameters();
    error InsufficientPayment();
}

#[derive(SolidityError)]
pub enum MainContractError {
    Unauthorized(Unauthorized),
    InvalidParameters(InvalidParameters),
    InsufficientPayment(InsufficientPayment),
}


#[storage]
#[entrypoint]
pub struct MainContract {

    users: StorageMap<Address, StorageBool>,
    last_verified_poap: StorageMap<Address, StorageU256>,
    poap_verifier: StorageAddress,
    boost_manager: StorageAddress,
    owner: StorageAddress,
    registration_fee: StorageU256,
}

#[public]
impl MainContract {
    pub fn init(&mut self) -> Result<(), MainContractError> {
        if !self.owner.get().is_zero() {
            return Err(MainContractError::Unauthorized(Unauthorized {}));
        }
        
        self.owner.set(msg::sender());
        self.registration_fee.set(U256::from(10_000_000_000_000_000u64)); // 0.01 ETH por defecto
        Ok(())
    }

    pub fn set_contracts(&mut self, poap_verifier: Address, boost_manager: Address) -> Result<(), MainContractError> {
        if msg::sender() != self.owner.get() {
            return Err(MainContractError::Unauthorized(Unauthorized {}));
        }
        
        self.poap_verifier.set(poap_verifier);
        self.boost_manager.set(boost_manager);
        Ok(())
    }
    

    #[payable]
    pub fn register_user(&mut self) -> Result<(), MainContractError> {
        let sender = msg::sender();
        

        if msg::value() < self.registration_fee.get() {
            return Err(MainContractError::InsufficientPayment(InsufficientPayment {}));
        }
        

        self.users.insert(sender, true);

        sol_emit!(UserRegistered(sender, block::timestamp()));
        
        Ok(())
    }
    

    pub fn verify_poap(&mut self, poap_id: U256) -> Result<(), MainContractError> {
        let sender = msg::sender();
        

        if !self.users.get(sender) {
            return Err(MainContractError::Unauthorized(Unauthorized {}));
        }
        
        // Llamar al contrato de verificación de POAPs
        // Esta es una implementación simplificada
        

        self.last_verified_poap.insert(sender, poap_id);
        

        sol_emit!(UserUpdated(sender, block::timestamp()));
        
        Ok(())
    }
    

    pub fn report_match(&mut self, user1: Address, user2: Address) -> Result<(), MainContractError> {

        if msg::sender() != self.owner.get() {
            return Err(MainContractError::Unauthorized(Unauthorized {}));
        }
        

        if !self.users.get(user1) || !self.users.get(user2) {
            return Err(MainContractError::InvalidParameters(InvalidParameters {}));
        }
        
        sol_emit!(MatchReported(user1, user2, block::timestamp()));
        
        Ok(())
    }
    

    pub fn get_registration_fee(&self) -> U256 {
        self.registration_fee.get()
    }
    

    pub fn update_registration_fee(&mut self, new_fee: U256) -> Result<(), MainContractError> {
        if msg::sender() != self.owner.get() {
            return Err(MainContractError::Unauthorized(Unauthorized {}));
        }
        
        self.registration_fee.set(new_fee);
        Ok(())
    }
    

    pub fn is_user_registered(&self, user: Address) -> bool {
        self.users.get(user)
    }
    

    pub fn get_last_verified_poap(&self, user: Address) -> U256 {
        self.last_verified_poap.get(user)
    }
}