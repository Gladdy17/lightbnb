-- Drop tables if they exist
DROP TABLE IF EXISTS property_reviews CASCADE;
DROP TABLE IF EXISTS reservations CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Step 1: Create the `users` table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- Step 2: Create the `properties` table
CREATE TABLE properties (
    id SERIAL PRIMARY KEY,
    owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    thumbnail_photo_url VARCHAR(255),
    cover_photo_url VARCHAR(255),
    cost_per_night INTEGER NOT NULL,
    parking_spaces INTEGER DEFAULT 0,
    number_of_bathrooms INTEGER DEFAULT 0,
    number_of_bedrooms INTEGER DEFAULT 0,
    country VARCHAR(255) NOT NULL,
    street VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    province VARCHAR(255) NOT NULL,
    post_code VARCHAR(255) NOT NULL,
    active BOOLEAN DEFAULT TRUE
);

-- Step 3: Create the `reservations` table
CREATE TABLE reservations (
    id SERIAL PRIMARY KEY,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
    guest_id INTEGER REFERENCES users(id) ON DELETE CASCADE
);

-- Step 4: Create the `property_reviews` table
CREATE TABLE property_reviews (
    id SERIAL PRIMARY KEY,
    guest_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
    reservation_id INTEGER REFERENCES reservations(id) ON DELETE CASCADE,
    rating SMALLINT CHECK (rating BETWEEN 1 AND 5),
    message TEXT
);

