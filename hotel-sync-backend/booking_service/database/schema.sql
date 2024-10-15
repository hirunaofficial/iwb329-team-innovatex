CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    guest VARCHAR(255) NOT NULL,
    room_category VARCHAR(100) NOT NULL,
    room_id VARCHAR(50) NOT NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);