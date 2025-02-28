pub mod main_contract;
pub mod poap_verifier;
pub mod boost_manager;

// Exportamos los tipos principales para facilitar su uso
pub use main_contract::MainContract;
pub use poap_verifier::POAPVerifier;
pub use boost_manager::BoostManager;