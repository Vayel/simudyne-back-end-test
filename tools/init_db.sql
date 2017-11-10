CREATE TABLE IF NOT EXISTS agents (
    breed INTEGER NOT NULL,
    id INTEGER NOT NULL PRIMARY KEY,
    age INTEGER NOT NULL,
    social_grade INTEGER NOT NULL,
    payment_at_purchase INTEGER NOT NULL,
    attribute_brand FLOAT NOT NULL,
    attribute_price FLOAT NOT NULL,
    attribute_promotions FLOAT NOT NULL,
    auto_renew INTEGER NOT NULL,
    inertia_for_switch INTEGER NOT NULL
);
