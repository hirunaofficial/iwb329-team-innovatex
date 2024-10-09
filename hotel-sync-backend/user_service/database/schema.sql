-- Users Table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nic VARCHAR(15) UNIQUE NOT NULL,               -- NIC (National Identity Card)
    name VARCHAR(100) NOT NULL,                    -- Full name of the user
    email VARCHAR(100) UNIQUE NOT NULL,            -- Email address for login
    phone_number VARCHAR(20) NOT NULL,             -- Phone number
    password_hash VARCHAR(255) NOT NULL,           -- Hashed password for authentication
    role ENUM('Admin', 'Staff', 'User') NOT NULL,  -- Define roles in the system
    address VARCHAR(255),                          -- Physical address
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- User creation time
);

-- Rooms Table
CREATE TABLE rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_number VARCHAR(10) UNIQUE NOT NULL,        -- Unique room number
    room_type ENUM('Single', 'Double', 'Suite') NOT NULL, -- Type of room
    status ENUM('available', 'booked', 'maintenance') DEFAULT 'available', -- Room status
    price DECIMAL(10, 2) NOT NULL,                  -- Room price per night
    description TEXT,                               -- Additional room description
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- Creation time
);

-- Bookings Table
CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,                                    -- Foreign key to users table
    room_id INT,                                    -- Foreign key to rooms table
    check_in_date DATE NOT NULL,                    -- Date of check-in
    check_out_date DATE NOT NULL,                   -- Date of check-out
    total_price DECIMAL(10, 2) NOT NULL,            -- Total booking price
    status ENUM('pending', 'approved', 'canceled') DEFAULT 'pending', -- Booking status
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Booking creation time
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE, -- Link to users
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE  -- Link to rooms
);

-- Service Requests Table
CREATE TABLE service_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,                                    -- Foreign key to users table
    request_text TEXT NOT NULL,                     -- Description of the service request
    status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending', -- Request status
    assigned_to INT,                                -- Staff handling the request (foreign key to users)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Request creation time
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- Last update
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE, -- Link to users
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL -- Link to staff member handling request
);

-- Payments Table
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT,                                 -- Foreign key to bookings table
    amount DECIMAL(10, 2) NOT NULL,                 -- Total payment amount
    payment_method ENUM('credit_card', 'cash', 'online') NOT NULL, -- Payment method
    payment_status ENUM('pending', 'completed', 'failed') DEFAULT 'pending', -- Payment status
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Date and time of payment
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE -- Link to booking
);