# OjoL - Sistem Ojek Online

## 📋 Deskripsi Proyek

OjoL adalah sistem ojek online yang dibangun menggunakan arsitektur microservices dengan Spring Boot dan frontend JavaScript. Sistem ini menyediakan layanan transportasi online dengan fitur lengkap untuk customer, driver, dan admin.

## 🏗️ Arsitektur Sistem

### Microservices Architecture
Sistem OjoL menggunakan arsitektur microservices yang terdiri dari:

- **Eureka Server** - Service Discovery
- **API Gateway** - Entry point untuk semua request
- **Auth Service** - Autentikasi dan otorisasi
- **User Service** - Manajemen user
- **Customer Service** - Manajemen data customer
- **Driver Service** - Manajemen data driver
- **Order Service** - Manajemen pesanan
- **Payment Service** - Manajemen pembayaran

### Event-Driven Architecture dengan Kafka
Sistem menggunakan Apache Kafka untuk komunikasi asynchronous antar microservices:
- **Order Events** - Event terkait pesanan (created, accepted, completed, cancelled)
- **Payment Events** - Event terkait pembayaran (created, completed, failed)

### Frontend
- **Single Page Application** dengan HTML, CSS, JavaScript
- **Responsive Design** menggunakan Tailwind CSS
- **Real-time Updates** untuk status pesanan

## 🚀 Teknologi yang Digunakan

### Backend
- **Spring Boot 3.2.0** - Framework utama
- **Spring Cloud 2023.0.0** - Microservices tools
- **Spring Security** - Keamanan aplikasi
- **JWT** - Token-based authentication
- **MySQL** - Database
- **JPA/Hibernate** - ORM
- **Eureka** - Service discovery
- **OpenFeign** - Service communication
- **Spring Cloud Gateway** - API Gateway
- **Apache Kafka** - Message broker untuk event-driven architecture

### Frontend
- **HTML5** - Markup
- **CSS3** - Styling
- **JavaScript (ES6+)** - Programming
- **Tailwind CSS** - Utility-first CSS framework
- **Font Awesome** - Icons
- **Chart.js** - Data visualization

## 📁 Struktur Proyek

```
ojol/
├── eureka-server/           # Service Discovery
├── api-gateway/            # API Gateway
├── auth-service/           # Authentication Service
├── user-service/           # User Management Service
├── customer-service/       # Customer Management Service
├── driver-service/         # Driver Management Service
├── order-service/          # Order Management Service
├── payment-service/        # Payment Management Service
├── frontend/              # Frontend Application
kafka
```

## 🔧 Konfigurasi Service

### Port Configuration
- **Eureka Server**: 8761
- **API Gateway**: 8080
- **Auth Service**: 8082
- **User Service**: 8081
- **Customer Service**: 8086
- **Driver Service**: 8083
- **Order Service**: 8085
- **Payment Service**: 8084
- **Frontend**: 3000
- **Kafka**: 9092
- **Kafka UI**: 8080

### Database Configuration
Setiap service menggunakan database terpisah:
- `user_db` - Auth Service
- `user_db` - User Service
- `customer_db` - Customer Service
- `driver_db` - Driver Service
- `order_db` - Order Service
- `payment_db` - Payment Service

## 🚀 Cara Menjalankan

### 1. Menjalankan Kafka
```bash
docker-compose up -d
```

### 2. Menjalankan Microservices
```bash
# Terminal 1 - Eureka Server
cd eureka-server && mvn spring-boot:run

# Terminal 2 - API Gateway
cd api-gateway && mvn spring-boot:run

# Terminal 3 - Order Service
cd order-service && mvn spring-boot:run

# Terminal 4 - Payment Service
cd payment-service && mvn spring-boot:run

# Terminal 5 - Driver Service
cd driver-service && mvn spring-boot:run
```

### 3. Monitoring Kafka
- Kafka UI: http://localhost:8080
- Monitor topics, consumers, dan messages

## 🎯 Fitur Utama

### 1. Authentication & Authorization
- **Login/Register** dengan email dan password
- **JWT Token** untuk autentikasi
- **Role-based access control** (Admin, Customer, Driver)
- **Token validation** untuk setiap request

### 2. Customer Features
- **Registrasi** dengan data lengkap
- **Buat pesanan** ojek online
- **Riwayat pesanan**
- **Update profile**
- **Pembayaran** online

### 3. Driver Features
- **Registrasi** dengan data kendaraan
- **Status online/offline**
- **Terima pesanan** dari customer
- **Update status** pesanan
- **Riwayat pesanan** yang dikerjakan
- **Statistik** pendapatan

### 4. Admin Features
- **Dashboard** dengan statistik sistem
- **Manajemen user** (CRUD)
- **Manajemen driver** (CRUD)
- **Monitoring** sistem real-time

### 5. Order Management
- **Status pesanan**: pending, accepted, in_progress, completed, cancelled
- **Real-time tracking**
- **Payment integration**
- **Event-driven updates** via Kafka

### 6. Payment System
- **Payment status tracking**
- **Payment history**
- **Integration** dengan order system
- **Event-driven processing** via Kafka

### 7. Event-Driven Architecture
- **Asynchronous communication** antar services
- **Real-time notifications** untuk driver dan customer
- **Reliable message delivery** dengan Kafka
- **Scalable event processing**

## 📊 Event Flow

### Order Created Flow:
1. Customer membuat order melalui Order Service
2. Order Service mengirim event `ORDER_CREATED` ke Kafka
3. Driver Service menerima event dan notifikasi driver yang tersedia
4. Payment Service menerima event dan membuat payment record

### Order Accepted Flow:
1. Driver menerima order
2. Order Service mengirim event `ORDER_ACCEPTED` ke Kafka
3. Driver Service update status driver
4. Payment Service update payment status

## 📝 Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

MIT License - lihat file LICENSE untuk detail

## 👨‍💻 Development Team

- **Backend Developer**: Spring Boot Microservices
- **Frontend Developer**: JavaScript, HTML, CSS
- **Database**: MySQL, JPA/Hibernate
- **Message Broker**: Apache Kafka

## 📞 Support

Untuk pertanyaan dan support:
- **Email**: dievoblokagung@gmail.com
- **Documentation**: [Wiki](https://github.com/ojol/wiki)
- **Issues**: [GitHub Issues](https://github.com/ojol/issues)
- **Kafka Documentation**: [KAFKA_INTEGRATION.md](KAFKA_INTEGRATION.md)

---

**OjoL** - Transportasi Online Terpercaya dengan Event-Driven Architecture 🚗💨 