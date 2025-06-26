# OjoL Frontend - Sistem Ojek Online

Frontend untuk sistem Ojek Online (OjoL) yang terhubung dengan backend microservices Spring Boot.

## 🚀 Fitur Utama

### 🔐 Autentikasi & Keamanan
- Login dengan email dan password
- Role-based access control (Admin, Customer, Driver)
- JWT token authentication
- Auto-redirect berdasarkan role
- Session management

### 👤 Customer Dashboard
- **Halaman Terpisah**: `customer-dashboard.html`
- Buat pesanan baru dengan lokasi pickup dan tujuan
- Lihat pesanan aktif dan riwayat pesanan
- Profil customer dengan informasi lengkap
- Statistik pesanan (aktif, selesai, total pembayaran)
- Real-time update status pesanan

### 🏍️ Driver Dashboard
- **Halaman Terpisah**: `driver-dashboard.html`
- Kontrol status driver (Online/Offline)
- Lihat pesanan tersedia dan terima pesanan
- Kelola pesanan yang sedang berlangsung
- Informasi kendaraan dan profil driver
- Statistik pendapatan dan pesanan

### 🛡️ Admin Dashboard
- **Halaman Terpisah**: `admin-dashboard.html`
- Manajemen user (tambah, edit, hapus)
- Manajemen driver (tambah, edit, hapus)
- Monitoring pesanan dan pembayaran
- Statistik sistem real-time
- Filter dan pencarian data

## 📁 Struktur File

```
frontend/
├── index.html                 # Halaman login utama
├── customer-dashboard.html    # Dashboard customer
├── driver-dashboard.html      # Dashboard driver
├── admin-dashboard.html       # Dashboard admin
├── css/
│   └── styles.css            # Custom CSS styles
├── js/
│   ├── config.js             # Konfigurasi aplikasi
│   ├── login.js              # Handler login
│   ├── customer-dashboard.js # Logic customer dashboard
│   ├── driver-dashboard.js   # Logic driver dashboard
│   ├── admin-dashboard.js    # Logic admin dashboard
│   └── utils/
│       ├── auth.js           # Authentication utilities
│       ├── api.js            # API communication
│       └── ui.js             # UI utilities
├── start.bat                 # Script start Windows
├── start.sh                  # Script start Linux/Mac
└── README.md                 # Dokumentasi ini
```

## 🎨 Desain & UI

### Design System
- **Framework**: Tailwind CSS
- **Icons**: Font Awesome 6
- **Color Scheme**:
  - Primary: Blue (#3B82F6)
  - Success: Green (#10B981)
  - Warning: Yellow (#F59E0B)
  - Danger: Red (#EF4444)
  - Admin: Red (#DC2626)
  - Driver: Green (#059669)

### Responsive Design
- Mobile-first approach
- Responsive grid layouts
- Touch-friendly interface
- Optimized untuk berbagai ukuran layar

### User Experience
- Loading indicators
- Toast notifications
- Confirmation dialogs
- Form validation
- Error handling
- Auto-refresh data

## 🔧 Teknologi

### Frontend Stack
- **HTML5**: Semantic markup
- **CSS3**: Modern styling dengan Tailwind
- **JavaScript ES6+**: Modern JavaScript features
- **Fetch API**: HTTP requests
- **Local Storage**: Session management

### Dependencies
- **Tailwind CSS**: Utility-first CSS framework
- **Font Awesome**: Icon library
- **Google Fonts**: Typography

## 🚀 Cara Menjalankan

### Prerequisites
- Backend services harus sudah running
- Python 3.x atau Node.js (untuk HTTP server)

### Backend Services
Pastikan semua service backend sudah running:
```bash
# Eureka Server
http://localhost:8761

# API Gateway
http://localhost:8080

# Auth Service
http://localhost:8081

# User Service
http://localhost:8082

# Driver Service
http://localhost:8083

# Order Service
http://localhost:8084

# Payment Service
http://localhost:8085
```

### Menjalankan Frontend

#### Windows
```bash
# Double click file start.bat
# Atau jalankan di Command Prompt:
cd frontend
start.bat
```

#### Linux/Mac
```bash
# Berikan permission execute
chmod +x start.sh

# Jalankan script
cd frontend
./start.sh
```

#### Manual (Alternatif)
```bash
# Dengan Python
python -m http.server 3000

# Dengan Node.js
npx http-server -p 3000

# Dengan PHP
php -S localhost:3000
```

### Akses Aplikasi
Buka browser dan kunjungi: `http://localhost:3000`

## 👥 Akun Demo

### Admin
- **Email**: admin@example.com
- **Password**: admin123
- **Role**: Administrator
- **Akses**: Full system management

### Customer
- **Email**: john@example.com
- **Password**: password123
- **Role**: Customer
- **Akses**: Order management

### Driver
- **Email**: driver@example.com
- **Password**: driver123
- **Role**: Driver
- **Akses**: Order acceptance & delivery

## 🔄 Workflow Aplikasi

### 1. Login Flow
```
User Login → Role Check → Redirect to Dashboard
```

### 2. Customer Flow
```
Login → Customer Dashboard → Create Order → Track Order → Complete
```

### 3. Driver Flow
```
Login → Driver Dashboard → Go Online → Accept Order → Complete Delivery
```

### 4. Admin Flow
```
Login → Admin Dashboard → Manage Users/Drivers → Monitor System
```

## 📱 Halaman Terpisah

### Keuntungan Struktur Terpisah
- **Security**: Role-based access control yang ketat
- **Performance**: Load hanya komponen yang diperlukan
- **Maintainability**: Kode terorganisir per role
- **Scalability**: Mudah menambah fitur per role
- **User Experience**: Interface yang fokus per role

### Routing System
- **index.html**: Halaman login dan redirect
- **customer-dashboard.html**: Dashboard khusus customer
- **driver-dashboard.html**: Dashboard khusus driver
- **admin-dashboard.html**: Dashboard khusus admin

### Authentication Flow
1. User login di `index.html`
2. Sistem validasi role
3. Redirect ke dashboard sesuai role
4. Session management per halaman

## 🔒 Security Features

### Authentication
- JWT token validation
- Role-based access control
- Session timeout handling
- Secure logout

### Authorization
- Route protection per role
- API endpoint security
- Data access control

### Data Protection
- Input validation
- XSS prevention
- CSRF protection
- Secure API calls

## 🧪 Testing

### Manual Testing
1. **Login Testing**
   - Test semua akun demo
   - Test invalid credentials
   - Test role-based redirect

2. **Customer Testing**
   - Create order
   - Track order status
   - View order history

3. **Driver Testing**
   - Toggle online/offline status
   - Accept orders
   - Update order status

4. **Admin Testing**
   - View all data
   - Manage users/drivers
   - Monitor system

### Browser Testing
- Chrome (recommended)
- Firefox
- Safari
- Edge

## 🐛 Troubleshooting

### Common Issues

#### 1. Backend Connection Error
```
Error: Failed to fetch
```
**Solution**: Pastikan backend services running

#### 2. CORS Error
```
Access to fetch blocked by CORS policy
```
**Solution**: Backend harus mengizinkan CORS dari localhost:3000

#### 3. Authentication Error
```
401 Unauthorized
```
**Solution**: Check JWT token dan backend auth service

#### 4. Page Not Found
```
404 Not Found
```
**Solution**: Pastikan semua file HTML ada di folder yang benar

### Debug Mode
Buka Developer Tools (F12) untuk:
- Console logs
- Network requests
- Error messages
- Performance monitoring

## 📈 Performance

### Optimization
- Lazy loading untuk data besar
- Efficient API calls
- Minimal DOM manipulation
- Optimized CSS/JS

### Monitoring
- Network request timing
- Page load performance
- Memory usage
- Error tracking

## 🔄 Updates & Maintenance

### Version Control
- Git repository
- Feature branches
- Code review process
- Automated testing

### Deployment
- Static file hosting
- CDN integration
- Cache optimization
- SSL certificate

## 📞 Support

### Documentation
- API documentation
- Code comments
- User guides
- Troubleshooting guides

### Contact
- Developer: [Your Name]
- Email: [your.email@example.com]
- Repository: [GitHub URL]

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**OjoL Frontend** - Sistem Ojek Online Terpercaya 🏍️ 