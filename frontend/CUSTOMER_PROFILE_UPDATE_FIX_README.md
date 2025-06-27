# Perbaikan Update Customer Profile

## Masalah yang Diperbaiki

Error 404 terjadi saat mencoba update customer profile karena:

1. **ID yang Salah**: Kode menggunakan user ID (28) untuk update customer, padahal seharusnya menggunakan customer ID
2. **Endpoint yang Tidak Tepat**: Mencoba update ke `/customers/28` (user ID) padahal seharusnya menggunakan customer ID yang benar
3. **Data Mapping yang Tidak Konsisten**: Field `date_of_birth` vs `dateOfBirth`

## Solusi yang Diterapkan

### 1. Perbaikan Logika Pengambilan Data

**Sebelumnya:**
```javascript
const customerData = await api.getUserProfile(); // Mengembalikan user data dengan customer info
const profileId = customerData.id; // Ini adalah user ID, bukan customer ID
```

**Sekarang:**
```javascript
const userData = await api.getUserProfile(); // Ambil user data
const customerData = await api.getCustomerByUserId(userData.id); // Ambil customer data berdasarkan user ID
const customerId = customerData.id; // Ini adalah customer ID yang benar
```

### 2. Perbaikan Data yang Dikirim

**Sebelumnya:**
```javascript
const profileData = {
  phone: document.getElementById("edit-profile-phone").value,
  address: document.getElementById("edit-profile-address").value,
  gender: document.getElementById("edit-profile-gender").value,
  date_of_birth: document.getElementById("edit-profile-dob").value, // Field name salah
};
```

**Sekarang:**
```javascript
const profileData = {
  userId: userId, // Tambahkan userId untuk konsistensi
  phone: document.getElementById("edit-profile-phone").value,
  address: document.getElementById("edit-profile-address").value,
  gender: document.getElementById("edit-profile-gender").value,
  dateOfBirth: document.getElementById("edit-profile-dob").value, // Format: YYYY-MM-DD
};
```

### 3. File yang Diperbaiki

- `frontend/js/customer-dashboard.js`

### 4. Endpoint yang Digunakan

- **GET**: `/users/{userId}/with-customer` - Untuk mengambil data user dengan customer info
- **GET**: `/customers/user/{userId}` - Untuk mengambil data customer berdasarkan user ID
- **PUT**: `/customers/{customerId}` - Untuk update customer profile

## Flow Update Profile yang Benar

1. **Load Edit Form**:
   - Ambil user data dari `/users/{userId}/with-customer`
   - Ambil customer data dari `/customers/user/{userId}`
   - Tampilkan form dengan data customer yang benar

2. **Submit Update**:
   - Gunakan customer ID (bukan user ID) untuk endpoint update
   - Kirim data dengan format yang sesuai dengan backend
   - Handle error dengan pesan yang lebih informatif

## Testing

Untuk memastikan perbaikan berfungsi:

1. Login sebagai customer
2. Akses customer dashboard
3. Klik "Edit Profile"
4. Ubah data (phone, address, gender, date of birth)
5. Klik "Update Profile"
6. Pastikan tidak ada error 404 ✅
7. Pastikan data berhasil diupdate ✅
8. Pastikan tampilan profile terupdate ✅

## Error Handling

Sekarang error handling lebih informatif:
- Menampilkan pesan error yang spesifik
- Logging yang lebih detail untuk debugging
- Validasi data sebelum dikirim ke backend 