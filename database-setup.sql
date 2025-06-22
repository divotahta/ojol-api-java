-- Sistem Ojek Online - Database Setup
-- Jalankan script ini di MySQL untuk membuat semua database dan tabel

-- Buat database
CREATE DATABASE IF NOT EXISTS user_db;
CREATE DATABASE IF NOT EXISTS driver_db;
CREATE DATABASE IF NOT EXISTS order_db;
CREATE DATABASE IF NOT EXISTS payment_db;

-- Gunakan database user_db
USE user_db;

-- Tabel Users
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255),
    role VARCHAR(20) -- contoh: 'user', 'driver', 'admin'
);

-- Tabel Customers
CREATE TABLE customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT, -- relasi logis ke users.id
    phone VARCHAR(20),
    address TEXT,
    gender VARCHAR(10), -- contoh: 'male', 'female', 'other'
    date_of_birth DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Notifications
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT, -- relasi logis ke users.id
    title VARCHAR(255),
    message TEXT,
    type VARCHAR(50), -- contoh: 'order_update', 'promo', 'payment'
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Gunakan database driver_db
USE driver_db;

-- Tabel Drivers
CREATE TABLE drivers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT, -- relasi logis ke user_db.users.id
    name VARCHAR(100),
    phone VARCHAR(20),
    status VARCHAR(20), -- contoh: 'available', 'unavailable'
    vehicle_type VARCHAR(50),
    vehicle_brand VARCHAR(50),
    vehicle_model VARCHAR(50),
    plate_number VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Gunakan database order_db
USE order_db;

-- Tabel Orders
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,    -- relasi logis ke user_db.users.id
    driver_id INT,  -- relasi logis ke driver_db.drivers.id
    origin VARCHAR(255),
    origin_lat DECIMAL(10,6),
    origin_lng DECIMAL(10,6),
    destination VARCHAR(255),
    destination_lat DECIMAL(10,6),
    destination_lng DECIMAL(10,6),
    status VARCHAR(20), -- contoh: "waiting", "assigned", "completed"
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Gunakan database payment_db
USE payment_db;

-- Tabel Payments
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT, -- relasi logis ke order_db.orders.id
    amount DECIMAL(10,2),
    method VARCHAR(50), -- contoh: 'cash', 'qris', 'bank_transfer'
    status VARCHAR(20), -- contoh: 'paid', 'pending'
    paid_at TIMESTAMP
);

-- Insert sample data untuk testing
USE user_db;
INSERT INTO users (name, email, password, role) VALUES 
('John Doe', 'john@example.com', 'password123', 'user'),
('Jane Smith', 'jane@example.com', 'password123', 'user'),
('Admin User', 'admin@example.com', 'admin123', 'admin');

INSERT INTO customers (user_id, phone, address, gender, date_of_birth) VALUES 
(1, '08123456789', 'Jl. Sudirman No. 123, Jakarta', 'male', '1990-01-15'),
(2, '08987654321', 'Jl. Thamrin No. 456, Jakarta', 'female', '1992-05-20');

INSERT INTO notifications (user_id, title, message, type) VALUES 
(1, 'Order Update', 'Order Anda telah diterima driver', 'order_update'),
(2, 'Promo Spesial', 'Dapatkan diskon 50% untuk order pertama', 'promo');

USE driver_db;
INSERT INTO drivers (user_id, name, phone, status, vehicle_type, vehicle_brand, vehicle_model, plate_number) VALUES 
(3, 'Budi Driver', '08123456789', 'available', 'motorcycle', 'Honda', 'Vario', 'B1234ABC'),
(4, 'Sari Driver', '08987654321', 'available', 'motorcycle', 'Yamaha', 'NMAX', 'B5678DEF');

USE order_db;
INSERT INTO orders (user_id, origin, origin_lat, origin_lng, destination, destination_lat, destination_lng, status) VALUES 
(1, 'Jakarta Pusat', -6.2088, 106.8456, 'Jakarta Selatan', -6.2088, 106.8456, 'waiting'),
(2, 'Jakarta Barat', -6.2088, 106.8456, 'Jakarta Timur', -6.2088, 106.8456, 'assigned');

USE payment_db;
INSERT INTO payments (order_id, amount, method, status) VALUES 
(1, 25000.00, 'cash', 'pending'),
(2, 30000.00, 'qris', 'paid');

-- Tampilkan status database
SELECT 'Database setup selesai!' as status;
SELECT 'user_db' as database_name, COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = 'user_db'
UNION ALL
SELECT 'driver_db' as database_name, COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = 'driver_db'
UNION ALL
SELECT 'order_db' as database_name, COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = 'order_db'
UNION ALL
SELECT 'payment_db' as database_name, COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = 'payment_db'; 