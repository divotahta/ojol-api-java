# SISTEM OJEK ONLINE (OJOL) - DOKUMENTASI LENGKAP

## 📋 DAFTAR ISI
1. [Gambaran Umum](#gambaran-umum)
2. [Arsitektur Sistem](#arsitektur-sistem)
3. [Komponen Microservices](#komponen-microservices)
4. [Teknologi yang Digunakan](#teknologi-yang-digunakan)
5. [Struktur Database](#struktur-database)
6. [Integrasi Kafka](#integrasi-kafka)
7. [Alur Kerja Sistem](#alur-kerja-sistem)
8. [Cara Menjalankan Sistem](#cara-menjalankan-sistem)
9. [Testing dan Monitoring](#testing-dan-monitoring)
10. [Troubleshooting](#troubleshooting)

---

## 🚀 GAMBARAN UMUM

Sistem Ojek Online (OJOL) adalah aplikasi berbasis microservices yang meniru layanan transportasi online seperti Gojek atau Grab. Sistem ini terdiri dari beberapa service yang bekerja secara independen namun terintegrasi melalui message broker Kafka untuk komunikasi asynchronous.

### Fitur Utama:
- **Pemesanan Ojek**: Customer dapat memesan ojek dengan menentukan lokasi pickup dan destination
- **Manajemen Driver**: Driver dapat menerima dan mengelola order
- **Sistem Pembayaran**: Integrasi dengan berbagai metode pembayaran
- **Notifikasi Real-time**: Menggunakan Kafka untuk event-driven communication
- **Monitoring**: Kafka UI untuk monitoring message broker

---

## 🏗️ ARSITEKTUR SISTEM

### Arsitektur Microservices
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway   │    │   Load Balancer │
│   (React/Vue)   │◄──►│   (Spring Cloud)│◄──►│   (Nginx)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Order Service │    │  Payment Service│    │  Driver Service │
│   (Port 8081)   │◄──►│   (Port 8082)   │◄──►│   (Port 8083)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Kafka Broker  │    │   Kafka UI      │    │   Database      │
│   (Port 9092)   │◄──►│   (Port 9090)   │◄──►│   (MySQL/PostgreSQL)
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Komunikasi Antar Service:
- **Synchronous**: REST API calls antar service
- **Asynchronous**: Event-driven communication via Kafka
- **Database**: Setiap service memiliki database terpisah

---

## 🔧 KOMPONEN MICROSERVICES

### 1. Order Service (Port 8081)
**Fungsi**: Mengelola pemesanan ojek

**Endpoint Utama**:
- `POST /api/orders` - Membuat order baru
- `GET /api/orders/{id}` - Mendapatkan detail order
- `PUT /api/orders/{id}/status` - Update status order
- `GET /api/orders` - List semua order

**Event Kafka**:
- `order.created` - Order baru dibuat
- `order.status.updated` - Status order berubah
- `order.cancelled` - Order dibatalkan

**Database**: `ojol_order_db`

### 2. Payment Service (Port 8082)
**Fungsi**: Mengelola pembayaran

**Endpoint Utama**:
- `POST /api/payments` - Membuat payment baru
- `GET /api/payments/{id}` - Detail payment
- `PUT /api/payments/{id}/status` - Update status payment
- `GET /api/payments` - List semua payment

**Event Kafka**:
- `payment.created` - Payment baru dibuat
- `payment.completed` - Payment berhasil
- `payment.failed` - Payment gagal

**Database**: `ojol_payment_db`

### 3. Driver Service (Port 8083)
**Fungsi**: Mengelola driver dan penerimaan order

**Endpoint Utama**:
- `GET /api/drivers` - List driver tersedia
- `POST /api/drivers/{id}/accept-order` - Driver terima order
- `PUT /api/drivers/{id}/status` - Update status driver
- `GET /api/drivers/{id}/orders` - Order history driver

**Event Kafka**:
- `driver.order.accepted` - Driver terima order
- `driver.status.updated` - Status driver berubah
- `driver.location.updated` - Lokasi driver berubah

**Database**: `ojol_driver_db`

---

## 🛠️ TEKNOLOGI YANG DIGUNAKAN

### Backend Framework
- **Spring Boot 3.x** - Framework utama untuk microservices
- **Spring Web** - REST API development
- **Spring Data JPA** - Database access layer
- **Spring Cloud** - Microservices tools
- **Spring Kafka** - Kafka integration

### Database
- **MySQL/PostgreSQL** - Relational database
- **H2 Database** - In-memory database untuk testing

### Message Broker
- **Apache Kafka** - Event streaming platform
- **Kafka UI** - Web interface untuk monitoring Kafka

### Development Tools
- **Maven** - Build tool dan dependency management
- **** - Containerization
- ** Compose** - Multi-container orchestration

### Monitoring & Testing
- **Kafka UI** - Kafka monitoring
- **Postman/curl** - API testing
- **Logging** - Application logging

---

## 🗄️ STRUKTUR DATABASE

### Order Database (ojol_order_db)
```sql
-- Tabel Orders
CREATE TABLE orders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    customer_id BIGINT NOT NULL,
    driver_id BIGINT,
    pickup_location VARCHAR(255) NOT NULL,
    destination_location VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabel Order Events (untuk audit trail)
CREATE TABLE order_events (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    event_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Payment Database (ojol_payment_db)
```sql
-- Tabel Payments
CREATE TABLE payments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    transaction_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabel Payment Methods
CREATE TABLE payment_methods (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Driver Database (ojol_driver_db)
```sql
-- Tabel Drivers
CREATE TABLE drivers (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    vehicle_number VARCHAR(20) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE',
    current_latitude DECIMAL(10,8),
    current_longitude DECIMAL(11,8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabel Driver Orders
CREATE TABLE driver_orders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    driver_id BIGINT NOT NULL,
    order_id BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ASSIGNED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 📡 INTEGRASI KAFKA

### Konfigurasi Kafka
```yaml
spring:
  kafka:
    bootstrap-servers: localhost:9092
    producer:
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.springframework.kafka.support.serializer.JsonSerializer
    consumer:
      group-id: ojol-group
      auto-offset-reset: earliest
      key-deserializer: org.apache.kafka.common.serialization.StringDeserializer
      value-deserializer: org.springframework.kafka.support.serializer.JsonDeserializer
      properties:
        spring.json.trusted.packages: "*"
```

### Topic Kafka
- `order-events` - Event terkait order
- `payment-events` - Event terkait payment
- `driver-events` - Event terkait driver

### Event Structure
```json
{
  "eventType": "ORDER_CREATED",
  "orderId": 123,
  "customerId": 456,
  "amount": 25000.00,
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "pickupLocation": "Jl. Sudirman No. 1",
    "destinationLocation": "Jl. Thamrin No. 10"
  }
}
```

---

## 🔄 ALUR KERJA SISTEM

### 1. Alur Pemesanan Order
```
1. Customer membuat order via Order Service
   ↓
2. Order Service menyimpan order ke database
   ↓
3. Order Service mengirim event "order.created" ke Kafka
   ↓
4. Payment Service menerima event dan membuat payment otomatis
   ↓
5. Driver Service menerima event dan mencari driver tersedia
   ↓
6. Driver menerima order dan update status
   ↓
7. Order Service update status order menjadi "ASSIGNED"
```

### 2. Alur Pembayaran
```
1. Payment Service membuat payment otomatis saat order dibuat
   ↓
2. Payment Service mengirim event "payment.created" ke Kafka
   ↓
3. Customer melakukan pembayaran
   ↓
4. Payment Service update status payment menjadi "COMPLETED"
   ↓
5. Payment Service mengirim event "payment.completed" ke Kafka
   ↓
6. Order Service menerima event dan update status order
```

### 3. Alur Driver Accept Order
```
1. Driver Service menerima event "order.created"
   ↓
2. Driver Service mencari driver tersedia
   ↓
3. Driver menerima order via API
   ↓
4. Driver Service mengirim event "driver.order.accepted" ke Kafka
   ↓
5. Order Service menerima event dan update status order
   ↓
6. Payment Service dapat menerima event untuk trigger pembayaran
```

---

## 🚀 CARA MENJALANKAN SISTEM

### Prerequisites
- Java 17 atau lebih tinggi
- Maven 3.6+
-  dan  Compose
- MySQL/PostgreSQL (opsional, bisa menggunakan H2)

### 1. Setup Kafka dengan 
```bash
# Jalankan Kafka dan Kafka UI
-compose up -d

# Atau jalankan manual
./start-kafka-manual.sh
```

### 2. Setup Database
```bash
# Jika menggunakan MySQL/PostgreSQL
mysql -u root -p < database-setup.sql

# Jika menggunakan H2 (default), tidak perlu setup manual
```

### 3. Build dan Jalankan Services
```bash
# Build semua services
mvn clean install

# Jalankan Order Service
cd order-service
mvn spring-boot:run

# Jalankan Payment Service (terminal baru)
cd payment-service
mvn spring-boot:run

# Jalankan Driver Service (terminal baru)
cd driver-service
mvn spring-boot:run
```

### 4. Verifikasi Sistem
```bash
# Test Order Service
curl -X POST http://localhost:8081/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": 1,
    "pickupLocation": "Jl. Sudirman No. 1",
    "destinationLocation": "Jl. Thamrin No. 10",
    "amount": 25000
  }'

# Test Payment Service
curl http://localhost:8082/api/payments

# Test Driver Service
curl http://localhost:8083/api/drivers
```

---

## 🧪 TESTING DAN MONITORING

### 1. Kafka UI Monitoring
- URL: http://localhost:9090
- Monitor topics, messages, dan consumer groups
- View message content dan metadata

### 2. API Testing
```bash
# Test script untuk order creation
./test-order-creation.bat

# Test script untuk payment
./test-payment-automatic-creation.bat

# Test script untuk driver
./test-driver-accept-order-kafka.bat
```

### 3. Database Monitoring
```sql
-- Check order database
USE ojol_order_db;
SELECT * FROM orders ORDER BY created_at DESC LIMIT 10;

-- Check payment database
USE ojol_payment_db;
SELECT * FROM payments ORDER BY created_at DESC LIMIT 10;

-- Check driver database
USE ojol_driver_db;
SELECT * FROM drivers;
```

### 4. Log Monitoring
```bash
# Monitor logs Order Service
tail -f order-service/logs/application.log

# Monitor logs Payment Service
tail -f payment-service/logs/application.log

# Monitor logs Driver Service
tail -f driver-service/logs/application.log
```

---

## 🔧 TROUBLESHOOTING

### Masalah Umum dan Solusi

#### 1. Kafka Connection Error
**Gejala**: Service tidak bisa connect ke Kafka
**Solusi**:
```bash
# Check Kafka status
 ps | grep kafka

# Restart Kafka
-compose restart kafka

# Check Kafka logs
 logs kafka
```

#### 2. Database Connection Error
**Gejala**: Service tidak bisa connect ke database
**Solusi**:
```bash
# Check database status
 ps | grep mysql

# Restart database
-compose restart mysql

# Check database logs
 logs mysql
```

#### 3. Event Kafka Tidak Muncul
**Gejala**: Order dibuat tapi event tidak muncul di Kafka UI
**Solusi**:
```bash
# Check Kafka producer configuration
# Pastikan bootstrap-servers benar
# Check application.yml di setiap service

# Test Kafka connection
./test-kafka-connection.bat
```

#### 4. Payment Tidak Terbuat Otomatis
**Gejala**: Order dibuat tapi payment tidak terbuat
**Solusi**:
```bash
# Check Payment Service logs
# Pastikan Payment Service running
# Check Kafka consumer configuration

# Manual test payment creation
./test-payment-automatic-creation.bat
```

#### 5. Driver Tidak Menerima Order
**Gejala**: Order dibuat tapi driver tidak mendapat notifikasi
**Solusi**:
```bash
# Check Driver Service logs
# Pastikan Driver Service running
# Check driver availability

# Manual test driver assignment
./test-driver-accept-order-kafka.bat
```

### Debug Scripts
```bash
# Debug Kafka integration
./debug-kafka-integration.bat

# Debug payment creation
./debug-payment-creation.bat

# Debug order creation
./test-order-kafka-debug.bat
```

---

## 📊 METRICS DAN MONITORING

### Key Performance Indicators (KPIs)
- **Order Success Rate**: Persentase order yang berhasil diselesaikan
- **Average Response Time**: Waktu rata-rata response API
- **Kafka Message Throughput**: Jumlah message per detik
- **Database Connection Pool**: Utilization database connections
- **Error Rate**: Persentase error dalam sistem

### Monitoring Tools
- **Kafka UI**: Message monitoring
- **Application Logs**: Error tracking
- **Database Monitoring**: Query performance
- **Health Checks**: Service availability

---

## 🔒 SECURITY CONSIDERATIONS

### Authentication & Authorization
- Implementasi JWT token untuk API security
- Role-based access control (RBAC)
- API rate limiting

### Data Protection
- Encryption untuk sensitive data
- Secure communication (HTTPS)
- Database encryption

### Kafka Security
- SASL authentication
- SSL/TLS encryption
- Topic access control

---

## 📈 SCALABILITY

### Horizontal Scaling
- Service dapat di-scale secara independen
- Load balancer untuk distribusi traffic
- Database sharding untuk high volume

### Performance Optimization
- Connection pooling untuk database
- Caching dengan Redis
- Async processing dengan Kafka

---

## 🚀 DEPLOYMENT

### Production Deployment
```bash
# Build  images
 build -t ojol-order-service ./order-service
 build -t ojol-payment-service ./payment-service
 build -t ojol-driver-service ./driver-service

# Deploy dengan Kubernetes
kubectl apply -f k8s/
```

### Environment Configuration
```yaml
# Production environment
spring:
  profiles: production
  kafka:
    bootstrap-servers: kafka-cluster:9092
  datasource:
    url: jdbc:mysql://prod-db:3306/ojol
```

---

## 📝 KESIMPULAN

Sistem OJOL ini merupakan implementasi microservices yang lengkap dengan:

1. **Arsitektur yang Scalable**: Microservices dengan komunikasi asynchronous
2. **Event-Driven Architecture**: Menggunakan Kafka untuk loose coupling
3. **Complete Business Flow**: Dari order creation hingga payment completion
4. **Monitoring & Debugging**: Tools untuk monitoring dan troubleshooting
5. **Production Ready**: Konfigurasi untuk development dan production

Sistem ini dapat dikembangkan lebih lanjut dengan menambahkan:
- User authentication dan authorization
- Real-time tracking dengan WebSocket
- Mobile app integration
- Advanced analytics dan reporting
- Multi-language support
- Advanced payment gateway integration

---

## 📞 SUPPORT

Untuk pertanyaan atau masalah teknis, silakan:
1. Check troubleshooting section di atas
2. Review application logs
3. Monitor Kafka UI untuk event flow
4. Gunakan debug scripts yang disediakan

**Happy Coding! 🚀** 