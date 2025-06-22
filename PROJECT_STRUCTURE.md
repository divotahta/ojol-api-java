# Struktur Proyek Sistem Ojek Online

```
ojol/
├── README.md                           # Dokumentasi utama
├── PROJECT_STRUCTURE.md                # Dokumentasi struktur proyek
├── database-setup.sql                  # Script setup database
├── start-services.bat                  # Script Windows untuk menjalankan services
├── start-services.sh                   # Script Linux/Mac untuk menjalankan services
├── start-frontend.bat                  # Script Windows untuk menjalankan frontend
├── start-frontend.sh                   # Script Linux/Mac untuk menjalankan frontend
├── stop-services.bat                   # Script Windows untuk menghentikan services
├── stop-services.sh                    # Script Linux/Mac untuk menghentikan services
│
├── eureka-server/                      # Service Discovery
│   ├── pom.xml
│   ├── src/main/java/com/ojol/eureka/
│   │   └── EurekaServerApplication.java
│   └── src/main/resources/
│       └── application.yml
│
├── api-gateway/                        # API Gateway
│   ├── pom.xml
│   ├── src/main/java/com/ojol/gateway/
│   │   └── ApiGatewayApplication.java
│   └── src/main/resources/
│       └── application.yml
│
├── user-service/                       # User Management Service
│   ├── pom.xml
│   ├── src/main/java/com/ojol/user/
│   │   ├── UserServiceApplication.java
│   │   ├── model/
│   │   │   ├── User.java
│   │   │   ├── Customer.java
│   │   │   └── Notification.java
│   │   ├── repository/
│   │   │   ├── UserRepository.java
│   │   │   ├── CustomerRepository.java
│   │   │   └── NotificationRepository.java
│   │   └── controller/
│   │       └── UserController.java
│   └── src/main/resources/
│       └── application.yml
│
├── driver-service/                     # Driver Management Service
│   ├── pom.xml
│   ├── src/main/java/com/ojol/driver/
│   │   ├── DriverServiceApplication.java
│   │   ├── model/
│   │   │   └── Driver.java
│   │   ├── repository/
│   │   │   └── DriverRepository.java
│   │   └── controller/
│   │       └── DriverController.java
│   └── src/main/resources/
│       └── application.yml
│
├── order-service/                      # Order Management Service
│   ├── pom.xml
│   ├── src/main/java/com/ojol/order/
│   │   ├── OrderServiceApplication.java
│   │   ├── model/
│   │   │   └── Order.java
│   │   ├── repository/
│   │   │   └── OrderRepository.java
│   │   └── controller/
│   │       └── OrderController.java
│   └── src/main/resources/
│       └── application.yml
│
├── payment-service/                    # Payment Management Service
│   ├── pom.xml
│   ├── src/main/java/com/ojol/payment/
│   │   ├── PaymentServiceApplication.java
│   │   ├── model/
│   │   │   └── Payment.java
│   │   ├── repository/
│   │   │   └── PaymentRepository.java
│   │   └── controller/
│   │       └── PaymentController.java
│   └── src/main/resources/
│       └── application.yml
│
└── frontend/                           # Frontend Application
    ├── index.html                      # Halaman utama dengan TailwindCSS
    └── app.js                          # JavaScript untuk API communication
```

## Penjelasan Komponen

### 1. Service Discovery (Eureka Server)
- **Port**: 8761
- **Fungsi**: Mendaftarkan dan menemukan semua microservices
- **Dashboard**: http://localhost:8761

### 2. API Gateway
- **Port**: 8080
- **Fungsi**: Routing request ke service yang sesuai
- **Load Balancing**: Menggunakan Netflix Ribbon
- **CORS**: Diaktifkan untuk frontend

### 3. User Service
- **Port**: 8081
- **Database**: user_db
- **Fitur**: 
  - Manajemen user (CRUD)
  - Manajemen customer
  - Notifikasi user

### 4. Driver Service
- **Port**: 8082
- **Database**: driver_db
- **Fitur**:
  - Manajemen driver (CRUD)
  - Status driver (available/unavailable)
  - Informasi kendaraan

### 5. Order Service
- **Port**: 8083
- **Database**: order_db
- **Fitur**:
  - Manajemen order (CRUD)
  - Tracking lokasi (lat/lng)
  - Status order (waiting/assigned/completed)

### 6. Payment Service
- **Port**: 8084
- **Database**: payment_db
- **Fitur**:
  - Manajemen payment (CRUD)
  - Metode pembayaran (cash/qris/bank_transfer)
  - Status payment (pending/paid)

### 7. Frontend
- **Port**: 3000
- **Teknologi**: HTML, TailwindCSS, JavaScript
- **Fitur**:
  - Interface untuk semua CRUD operations
  - Tab-based navigation
  - Real-time status connection

## Database Schema

### user_db
```sql
users (id, name, email, password, role)
customers (id, user_id, phone, address, gender, date_of_birth, created_at)
notifications (id, user_id, title, message, type, is_read, created_at)
```

### driver_db
```sql
drivers (id, user_id, name, phone, status, vehicle_type, vehicle_brand, vehicle_model, plate_number, created_at)
```

### order_db
```sql
orders (id, user_id, driver_id, origin, origin_lat, origin_lng, destination, destination_lat, destination_lng, status, created_at)
```

### payment_db
```sql
payments (id, order_id, amount, method, status, paid_at)
```

## Cara Menjalankan

### Quick Start (Windows)
```bash
# 1. Setup database
mysql -u root -p < database-setup.sql

# 2. Jalankan semua services
start-services.bat

# 3. Jalankan frontend (terminal baru)
start-frontend.bat
```

### Quick Start (Linux/Mac)
```bash
# 1. Setup database
mysql -u root -p < database-setup.sql

# 2. Jalankan semua services
./start-services.sh

# 3. Jalankan frontend (terminal baru)
./start-frontend.sh
```

### Manual Start
```bash
# Terminal 1 - Eureka Server
cd eureka-server && mvn spring-boot:run

# Terminal 2 - API Gateway
cd api-gateway && mvn spring-boot:run

# Terminal 3 - User Service
cd user-service && mvn spring-boot:run

# Terminal 4 - Driver Service
cd driver-service && mvn spring-boot:run

# Terminal 5 - Order Service
cd order-service && mvn spring-boot:run

# Terminal 6 - Payment Service
cd payment-service && mvn spring-boot:run

# Terminal 7 - Frontend
cd frontend && python -m http.server 3000
```

## Testing

### 1. Service Discovery
- Buka http://localhost:8761
- Pastikan semua service terdaftar

### 2. API Testing
```bash
# Test User Service
curl http://localhost:8080/api/users

# Test Driver Service
curl http://localhost:8080/api/drivers

# Test Order Service
curl http://localhost:8080/api/orders

# Test Payment Service
curl http://localhost:8080/api/payments
```

### 3. Frontend Testing
- Buka http://localhost:3000
- Test CRUD operations untuk semua entity

## Troubleshooting

### Service tidak terdaftar di Eureka
1. Cek log service yang bermasalah
2. Pastikan Eureka Server running
3. Restart service

### Database connection error
1. Pastikan MySQL running
2. Cek username/password di application.yml
3. Pastikan database sudah dibuat

### Frontend tidak connect
1. Pastikan API Gateway running
2. Cek browser console untuk error
3. Pastikan semua service running 