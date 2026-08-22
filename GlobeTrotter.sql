
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    profile_image TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE trips (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    cover_image TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_trips_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_trip_dates
        CHECK (end_date >= start_date)
);


CREATE TABLE cities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    region VARCHAR(100),
    cost_index DECIMAL(5,2),
    popularity INT DEFAULT 0,
    image_url TEXT,

    CONSTRAINT chk_city_popularity
        CHECK (popularity >= 0),

    CONSTRAINT chk_city_cost
        CHECK (cost_index >= 0)
);


CREATE TABLE trip_stops (
    id SERIAL PRIMARY KEY,
    trip_id INT NOT NULL,
    city_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    stop_order INT NOT NULL,

    CONSTRAINT fk_trip_stops_trip
        FOREIGN KEY (trip_id)
        REFERENCES trips(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_trip_stops_city
        FOREIGN KEY (city_id)
        REFERENCES cities(id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_stop_dates
        CHECK (end_date >= start_date),

    CONSTRAINT chk_stop_order
        CHECK (stop_order > 0),

    CONSTRAINT unique_trip_stop_order
        UNIQUE (trip_id, stop_order)
);


CREATE TABLE activities (
    id SERIAL PRIMARY KEY,
    city_id INT NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    activity_type VARCHAR(50),
    duration_minutes INT,
    estimated_cost DECIMAL(10,2) DEFAULT 0,
    image_url TEXT,

    CONSTRAINT fk_activities_city
        FOREIGN KEY (city_id)
        REFERENCES cities(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_activity_duration
        CHECK (duration_minutes IS NULL OR duration_minutes > 0),

    CONSTRAINT chk_activity_cost
        CHECK (estimated_cost >= 0)
);


CREATE TABLE itinerary_items (
    id SERIAL PRIMARY KEY,
    trip_id INT NOT NULL,
    trip_stop_id INT NOT NULL,
    activity_id INT NOT NULL,
    date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    sort_order INT NOT NULL DEFAULT 1,

    CONSTRAINT fk_itinerary_trip
        FOREIGN KEY (trip_id)
        REFERENCES trips(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_itinerary_stop
        FOREIGN KEY (trip_stop_id)
        REFERENCES trip_stops(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_itinerary_activity
        FOREIGN KEY (activity_id)
        REFERENCES activities(id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_itinerary_time
        CHECK (
            end_time IS NULL
            OR start_time IS NULL
            OR end_time > start_time
        ),

    CONSTRAINT chk_itinerary_order
        CHECK (sort_order > 0)
);

CREATE TABLE expenses (
    id SERIAL PRIMARY KEY,
    trip_id INT NOT NULL,
    trip_stop_id INT,
    category VARCHAR(50) NOT NULL,
    description VARCHAR(200),
    amount DECIMAL(10,2) NOT NULL,
    expense_date DATE,

    CONSTRAINT fk_expenses_trip
        FOREIGN KEY (trip_id)
        REFERENCES trips(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_expenses_stop
        FOREIGN KEY (trip_stop_id)
        REFERENCES trip_stops(id)
        ON DELETE SET NULL,

    CONSTRAINT chk_expense_amount
        CHECK (amount >= 0)
);


CREATE INDEX idx_trips_user_id
ON trips(user_id);

CREATE INDEX idx_trip_stops_trip_id
ON trip_stops(trip_id);

CREATE INDEX idx_trip_stops_city_id
ON trip_stops(city_id);

CREATE INDEX idx_activities_city_id
ON activities(city_id);

CREATE INDEX idx_itinerary_trip_id
ON itinerary_items(trip_id);

CREATE INDEX idx_itinerary_date
ON itinerary_items(date);

CREATE INDEX idx_expenses_trip_id
ON expenses(trip_id);

CREATE INDEX idx_expenses_date
ON expenses(expense_date);
