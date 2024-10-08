-- Insert test data into Users table
INSERT INTO users (nic, name, email, phone_number, password_hash, role, address, status) VALUES
('123456789V', 'John Doe', 'john@example.com', '0712345678', 'hashed_password_1', 'Admin', '123 Main Street', 'active'),
('987654321V', 'Jane Smith', 'jane@example.com', '0776543210', 'hashed_password_2', 'User', '456 Elm Street', 'active'),
('456123789V', 'Bob Lee', 'bob@example.com', '0767891234', 'hashed_password_3', 'Staff', '789 Pine Street', 'inactive');

-- Insert test data into Rooms table
INSERT INTO rooms (room_number, room_type, status, price, description) VALUES
('101', 'Single', 'available', 100.00, 'Single room with one bed'),
('102', 'Double', 'booked', 150.00, 'Double room with two beds'),
('103', 'Suite', 'maintenance', 250.00, 'Luxury suite with king-sized bed');

-- Insert test data into Bookings table
INSERT INTO bookings (user_id, room_id, check_in_date, check_out_date, total_price, status) VALUES
(1, 1, '2024-10-10', '2024-10-12', 200.00, 'approved'),
(2, 2, '2024-11-01', '2024-11-05', 600.00, 'pending'),
(2, 3, '2024-11-15', '2024-11-17', 500.00, 'canceled');

-- Insert test data into Service Requests table
INSERT INTO service_requests (user_id, request_text, status, assigned_to) VALUES
(1, 'Room cleaning required', 'pending', 3),
(2, 'Towel replacement', 'in_progress', 3),
(1, 'Wi-Fi issue', 'completed', 3);

-- Insert test data into Payments table
INSERT INTO payments (booking_id, amount, payment_method, payment_status, payment_date) VALUES
(1, 200.00, 'credit_card', 'completed', '2024-10-12'),
(2, 600.00, 'online', 'pending', '2024-11-05'),
(3, 500.00, 'cash', 'failed', '2024-11-17');