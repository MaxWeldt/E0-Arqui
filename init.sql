CREATE TABLE IF NOT EXISTS energy_events (
    idpk VARCHAR(255) PRIMARY KEY,
    type VARCHAR(50),
    received_at TIMESTAMP,
    package_body JSONB
);