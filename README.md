# Sistem Ojek Online - Microservices Architecture

Sistem ojek online terdistribusi berbasis microservices dengan komunikasi REST API menggunakan Spring Boot, Eureka Server untuk service discovery, dan API Gateway untuk routing.

## 🏗️ Arsitektur Sistem

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │  API Gateway    │    │  Eureka Server  │
│   (Port 3000)   │◄──►│   (Port 8080)   │◄──►│   (Port 8761)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                ┌───────────────┼───────────────┐
                │               │               │
        ┌───────▼──────┐ ┌──────▼──────┐ ┌─────▼──────┐
        │ User Service │ │Driver Service│ │Order Service│
        │  (Port 8081) │ │ (Port 8082) │ │ (Port 8083)│
        └──────────────┘ └─────────────┘ └────────────┘
                                │
                        ┌───────▼──────┐
                        │Payment Service│
                        │ (Port 8084)  │
                        └──────────────┘
```

## 📋 Daftar Service

| Service | Port | Database | Deskripsi |
|---------|------|----------|-----------|
| Eureka Server | 8761 | - | Service Discovery |
| API Gateway | 8080 | - | Routing & Load Balancing |
| User Service | 8081 | user_db | Manajemen user, customer, notification |
| Driver Service | 8082 | driver_db | Manajemen driver dan kendaraan |
| Order Service | 8083 | order_db | Manajemen order/pesanan |
| Payment Service | 8084 | payment_db | Manajemen pembayaran |

## 🗄️ Database Schema

### user_db
- `users` - Data pengguna (user, driver, admin)
- `customers` - Data pelanggan
- `notifications` - Notifikasi pengguna

### driver_db
- `drivers` - Data driver dan kendaraan

### order_db
- `orders` - Data pesanan/order

### payment_db
- `payments` - Data pembayaran

## 🚀 Cara Menjalankan Sistem

### Prerequisites
- Java 17 atau lebih tinggi
- Maven 3.6+
- MySQL 8.0+
- Node.js (untuk menjalankan frontend)

### 1. Setup Database

Jalankan script SQL berikut di MySQL:

```sql
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
    role VARCHAR(20)
);

-- Tabel Customers
CREATE TABLE customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    phone VARCHAR(20),
    address TEXT,
    gender VARCHAR(10),
    date_of_birth DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Notifications
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    title VARCHAR(255),
    message TEXT,
    type VARCHAR(50),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Gunakan database driver_db
USE driver_db;

-- Tabel Drivers
CREATE TABLE drivers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    name VARCHAR(100),
    phone VARCHAR(20),
    status VARCHAR(20),
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
    user_id INT,
    driver_id INT,
    origin VARCHAR(255),
    origin_lat DECIMAL(10,6),
    origin_lng DECIMAL(10,6),
    destination VARCHAR(255),
    destination_lat DECIMAL(10,6),
    destination_lng DECIMAL(10,6),
    status VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Gunakan database payment_db
USE payment_db;

-- Tabel Payments
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    amount DECIMAL(10,2),
    method VARCHAR(50),
    status VARCHAR(20),
    paid_at TIMESTAMP
);
```

### 2. Konfigurasi Database

Edit file `application.yml` di setiap service dan sesuaikan konfigurasi database:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/[nama_database]?useSSL=false&serverTimezone=UTC
    username: root
    password: [password_mysql_anda]
```

### 3. Menjalankan Services

Buka terminal terpisah untuk setiap service dan jalankan:

#### Terminal 1 - Eureka Server
```bash
cd eureka-server
mvn spring-boot:run
```

#### Terminal 2 - API Gateway
```bash
cd api-gateway
mvn spring-boot:run
```

#### Terminal 3 - User Service
```bash
cd user-service
mvn spring-boot:run
```

#### Terminal 4 - Driver Service
```bash
cd driver-service
mvn spring-boot:run
```

#### Terminal 5 - Order Service
```bash
cd order-service
mvn spring-boot:run
```

#### Terminal 6 - Payment Service
```bash
cd payment-service
mvn spring-boot:run
```

### 4. Menjalankan Frontend

```bash
cd frontend
# Jika menggunakan Python 3
python -m http.server 3000

# Atau jika menggunakan Node.js
npx http-server -p 3000
```

### 5. Akses Aplikasi

- **Frontend**: http://localhost:3000
- **Eureka Dashboard**: http://localhost:8761
- **API Gateway**: http://localhost:8080

## 📡 API Endpoints

### User Service (http://localhost:8081)
- `GET /users` - Daftar semua user
- `POST /users` - Buat user baru
- `GET /users/{id}` - Detail user
- `PUT /users/{id}` - Update user
- `DELETE /users/{id}` - Hapus user
- `GET /users/customers` - Daftar customers
- `POST /users/customers` - Buat customer baru
- `GET /users/notifications/user/{userId}` - Notifikasi user

### Driver Service (http://localhost:8082)
- `GET /drivers` - Daftar semua driver
- `POST /drivers` - Buat driver baru
- `GET /drivers/{id}` - Detail driver
- `PUT /drivers/{id}` - Update driver
- `DELETE /drivers/{id}` - Hapus driver
- `GET /drivers/status/{status}` - Driver berdasarkan status
- `PUT /drivers/{id}/status` - Update status driver

### Order Service (http://localhost:8083)
- `GET /orders` - Daftar semua order
- `POST /orders` - Buat order baru
- `GET /orders/{id}` - Detail order
- `PUT /orders/{id}` - Update order
- `DELETE /orders/{id}` - Hapus order
- `GET /orders/user/{userId}` - Order berdasarkan user

### Payment Service (http://localhost:8084)
- `GET /payments` - Daftar semua payment
- `POST /payments` - Buat payment baru
- `GET /payments/{id}` - Detail payment
- `PUT /payments/{id}` - Update payment
- `DELETE /payments/{id}` - Hapus payment
- `GET /payments/order/{orderId}` - Payment berdasarkan order

### Melalui API Gateway (http://localhost:8080)
Semua endpoint di atas dapat diakses melalui gateway dengan prefix `/api`:
- `GET /api/users` - User Service
- `GET /api/drivers` - Driver Service
- `GET /api/orders` - Order Service
- `GET /api/payments` - Payment Service

## 🧪 Testing

### 1. Test Service Discovery
- Buka http://localhost:8761
- Pastikan semua service terdaftar di Eureka

### 2. Test API Gateway
```bash
curl http://localhost:8080/api/users
curl http://localhost:8080/api/drivers
curl http://localhost:8080/api/orders
curl http://localhost:8080/api/payments
```

### 3. Test Frontend
- Buka http://localhost:3000
- Coba CRUD operations untuk semua entity

## 📝 Contoh Data Testing

### Create User
```bash
curl -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "user"
  }'
```

### Create Driver
```bash
curl -X POST http://localhost:8080/api/drivers \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "name": "Budi Driver",
    "phone": "08123456789",
    "status": "available",
    "vehicleType": "motorcycle",
    "vehicleBrand": "Honda",
    "vehicleModel": "Vario",
    "plateNumber": "B1234ABC"
  }'
```

### Create Order
```bash
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "origin": "Jakarta Pusat",
    "originLat": -6.2088,
    "originLng": 106.8456,
    "destination": "Jakarta Selatan",
    "destinationLat": -6.2088,
    "destinationLng": 106.8456,
    "status": "waiting"
  }'
```

## 🔧 Troubleshooting

### Service tidak terdaftar di Eureka
1. Pastikan Eureka Server sudah running
2. Cek konfigurasi `eureka.client.service-url` di application.yml
3. Restart service yang bermasalah

### Database connection error
1. Pastikan MySQL running
2. Cek username dan password database
3. Pastikan database sudah dibuat

### Frontend tidak bisa connect ke API
1. Pastikan API Gateway running di port 8080
2. Cek CORS configuration
3. Pastikan semua service sudah running

## 📚 Teknologi yang Digunakan

- **Backend**: Spring Boot 3.2.0, Spring Cloud 2023.0.0
- **Service Discovery**: Netflix Eureka
- **API Gateway**: Spring Cloud Gateway
- **Database**: MySQL 8.0
- **Frontend**: HTML, TailwindCSS, JavaScript (fetch API)
- **Build Tool**: Maven

## 🤝 Kontribusi

1. Fork repository
2. Buat feature branch
3. Commit changes
4. Push ke branch
5. Buat Pull Request

## 📄 License

MIT License 