# Update Role System - OjoL

## Perubahan Role

### Sebelumnya:
- **admin**: Akses ke AdminDashboard
- **user**: Akses ke CustomerDashboard  
- **driver**: Akses ke DriverDashboard

### Sekarang:
- **admin**: Akses ke AdminDashboard
- **customer**: Akses ke CustomerDashboard  
- **driver**: Akses ke DriverDashboard

## Perubahan yang Dilakukan

### 1. Backend (auth-service)
- File: `auth-service/src/main/java/com/ojol/auth/AuthServiceApplication.java`
- Mengubah role default dari `"user"` menjadi `"customer"`
- Mengaktifkan kembali data default

### 2. Frontend
- File: `frontend/js/customer-dashboard.js`
- Mengubah `requireAuth('user')` menjadi `requireAuth('customer')`
- File: `frontend/js/utils/auth.js`
- Mengubah redirect logic untuk menggunakan `'customer'`

### 3. Database
- Script: `auth-service/update-roles.sql`
- Update role existing user dari `'user'` ke `'customer'`

## Cara Update Database

### Opsi 1: Menggunakan MySQL Command Line
```bash
mysql -u root -p ojol_auth
source auth-service/update-roles.sql
```

### Opsi 2: Menggunakan MySQL Workbench
1. Buka MySQL Workbench
2. Connect ke database `ojol_auth`
3. Jalankan script dari file `auth-service/update-roles.sql`

### Opsi 3: Restart Application
1. Hapus data lama dari database
2. Restart auth-service
3. Data default akan dibuat otomatis dengan role yang benar

## Data Login Default (Updated)

- **Admin**: admin@example.com / admin123
- **Customer**: john@example.com / password123  
- **Driver**: driver@example.com / driver123

## Testing

1. Restart auth-service
2. Restart frontend server
3. Login dengan data default
4. Pastikan redirect ke dashboard sesuai role

## Troubleshooting

### Jika masih redirect loop:
1. Clear localStorage di browser
2. Pastikan database sudah diupdate
3. Restart semua services

### Jika role tidak sesuai:
1. Cek response dari API login
2. Pastikan backend mengembalikan role `'customer'`
3. Cek localStorage di browser developer tools 