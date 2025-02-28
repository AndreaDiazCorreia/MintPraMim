#![cfg_attr(not(feature = "export-abi"), no_main)]
extern crate alloc;

use alloy_primitives::{Address, U256};
use alloy_sol_types::sol;
use stylus_sdk::{msg, prelude::*, call::{call, Call}, alloy_primitives};

sol! {
    event POAPVerified(address indexed user, uint256 indexed poapId, uint256 timestamp);
    
    error Unauthorized();
    error POAPNotOwned();
    error InvalidPOAP();
}

sol_interface! {
    interface IPOAP {
        function balanceOf(address owner) external view returns (uint256);
        function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256);
        function tokenURI(uint256 tokenId) external view returns (string);
    }
}

#[derive(SolidityError)]
pub enum POAPVerifierError {
    Unauthorized(Unauthorized),
    POAPNotOwned(POAPNotOwned),
    InvalidPOAP(InvalidPOAP),
}

#[storage]
#[entrypoint]
pub struct POAPVerifier {  
    poap_contract: StorageAddress,
    owner: StorageAddress,
    main_contract: StorageAddress,
    verified_poaps: StorageMap<Address, StorageVec<StorageU256>>,
    last_verified_poap: StorageMap<Address, StorageU256>,
}

#[public]
impl POAPVerifier {
    pub fn init(&mut self) -> Result<(), POAPVerifierError> {
        if !self.owner.get().is_zero() {
            return Err(POAPVerifierError::Unauthorized(Unauthorized {}));
        }
        
        self.owner.set(msg::sender());
        // Dirección del contrato POAP en Gnosis Chain (xDai) TODO: CAMBIAR A ARBITRUM
        self.poap_contract.set(Address::from_slice(&hex::decode("22c1f6050e56d2876009903609a2cc3fef83b415").unwrap()));
        
        Ok(())
    }
    
    
    pub fn set_main_contract(&mut self, main_contract: Address) -> Result<(), POAPVerifierError> {
        if msg::sender() != self.owner.get() {
            return Err(POAPVerifierError::Unauthorized(Unauthorized {}));
        }
        
        self.main_contract.set(main_contract);
        Ok(())
    }
    
    
    pub fn verify_poap_ownership(&mut self, user: Address, poap_id: U256) -> Result<bool, POAPVerifierError> {
        if msg::sender() != self.main_contract.get() && msg::sender() != self.owner.get() {
            return Err(POAPVerifierError::Unauthorized(Unauthorized {}));
        }
        
        // TODO: Aquí implementaríamos la lógica para verificar la posesión del POAP

        let owns_poap = self.check_poap_ownership_mock(user, poap_id);
        
        if owns_poap {
            if let Some(mut user_poaps) = self.verified_poaps.getter(user) {
                user_poaps.push(poap_id);
            } else {
                let mut new_poaps = self.verified_poaps.setter(user);
                new_poaps.push(poap_id);
            }
            
            self.last_verified_poap.insert(user, poap_id);
            
            sol_emit!(POAPVerified(user, poap_id, block::timestamp()));
        }
        
        Ok(owns_poap)
    }
    
    // Método mock para simular la verificación de posesión de POAP TODO: Quitar
    fn check_poap_ownership_mock(&self, _user: Address, _poap_id: U256) -> bool {
        // En una implementación real, esta función haría una llamada al contrato de POAP
        // para verificar si el usuario posee ese POAP específico.
        
        // Para fines de demostración, siempre devolvemos true
        true
    }
    

    pub fn get_last_verified_poap(&self, user: Address) -> U256 {
        self.last_verified_poap.get(user)
    }
    

    pub fn get_verified_poaps(&self, user: Address) -> Vec<U256> {
        let mut result = Vec::new();
        
        if let Some(user_poaps) = self.verified_poaps.getter(user) {
            for i in 0..user_poaps.len() {
                if let Some(poap_id) = user_poaps.getter(i) {
                    result.push(poap_id.get());
                }
            }
        }
        
        result
    }
    

    pub fn update_poap_contract(&mut self, new_contract: Address) -> Result<(), POAPVerifierError> {
        if msg::sender() != self.owner.get() {
            return Err(POAPVerifierError::Unauthorized(Unauthorized {}));
        }
        
        self.poap_contract.set(new_contract);
        Ok(())
    }
}