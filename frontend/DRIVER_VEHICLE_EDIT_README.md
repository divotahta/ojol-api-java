# Fitur Edit Informasi Kendaraan - Driver Dashboard

## Overview
Fitur ini memungkinkan driver untuk mengedit informasi kendaraan mereka melalui modal yang user-friendly di dashboard driver.

## Fitur yang Ditambahkan

### 1. Tombol Edit di Vehicle Info Section
- Tombol edit (ikon pensil) ditambahkan di sebelah kanan informasi kendaraan
- Tombol memiliki hover effect dan transisi yang smooth
- Hanya menampilkan informasi kendaraan yang relevan

### 2. Modal Edit Informasi Kendaraan
- Modal dengan form yang lengkap untuk edit kendaraan
- Field yang tersedia:
  - **Jenis Kendaraan**: Dropdown dengan opsi "Motor" dan "Mobil"
  - **Merek Kendaraan**: Input text untuk brand kendaraan
  - **Model Kendaraan**: Input text untuk model kendaraan
  - **Nomor Plat**: Input text dengan validasi format

### 3. Validasi Form
- **Validasi Required**: Semua field wajib diisi
- **Validasi Format Plat**: Menggunakan regex untuk memastikan format plat yang benar
  - Format: `B 1234 ABC` (huruf besar, spasi, angka, spasi, huruf besar)
  - Contoh valid: `B 1234 ABC`, `D 5678 XYZ`
  - Contoh invalid: `b 1234 abc`, `B1234ABC`

### 4. API Endpoint Baru
- **Backend**: `PUT /drivers/{id}/vehicle`
- **Frontend**: `api.updateDriverVehicle(vehicleData)`
- Endpoint khusus untuk update vehicle info saja (lebih aman)

## Implementasi Teknis

### Frontend Changes

#### 1. Driver Dashboard (`driver-dashboard.js`)
```javascript
// Fungsi untuk menampilkan modal edit
async editVehicleInfo() {
    // Load data kendaraan dan tampilkan modal
}

// Fungsi untuk submit perubahan
async submitEditVehicleInfo() {
    // Validasi dan submit ke API
}
```

#### 2. API Utils (`api.js`)
```javascript
// Endpoint baru untuk update vehicle
async updateDriverVehicle(vehicleData) {
    const userId = localStorage.getItem("ojol_userId");
    const driverData = await this.getDriverVehicle();
    const driverId = driverData.id;
    return this.request(`/drivers/${driverId}/vehicle`, {
        method: "PUT",
        body: JSON.stringify(vehicleData),
    });
}
```

### Backend Changes

#### Driver Controller (`DriverController.java`)
```java
@PutMapping("/{id}/vehicle")
public ResponseEntity<Driver> updateDriverVehicle(@PathVariable Long id, 
    @Valid @RequestBody Map<String, String> vehicleData) {
    // Update hanya field vehicle
}
```

## UI/UX Features

### 1. Visual Design
- Modal dengan desain yang konsisten dengan dashboard
- Form layout yang rapi dan mudah dibaca
- Icon yang relevan untuk setiap section

### 2. User Experience
- Loading state saat memuat data dan submit
- Feedback toast untuk success/error
- Auto-refresh data setelah update berhasil
- Modal bisa ditutup dengan tombol "Batal"

### 3. Responsive Design
- Modal responsive untuk berbagai ukuran layar
- Form elements yang mudah digunakan di mobile

## Error Handling

### 1. Frontend Validation
- Validasi client-side untuk format plat
- Validasi required fields
- User-friendly error messages

### 2. Backend Error Handling
- Proper HTTP status codes
- Descriptive error messages
- Validation untuk data integrity

## Testing Scenarios

### 1. Happy Path
- Driver membuka modal edit
- Mengisi semua field dengan data valid
- Submit berhasil dan data terupdate

### 2. Validation Testing
- Submit dengan field kosong
- Submit dengan format plat invalid
- Submit dengan data yang sama

### 3. Error Scenarios
- Network error saat submit
- Backend validation error
- Driver tidak ditemukan

## Security Considerations

### 1. Authorization
- Hanya driver yang bisa mengedit kendaraan mereka sendiri
- Validasi driver ID dari token

### 2. Data Validation
- Server-side validation untuk semua input
- Sanitasi data untuk mencegah injection

### 3. Rate Limiting
- Implementasi rate limiting untuk mencegah spam

## Future Enhancements

### 1. Additional Features
- Upload foto kendaraan
- Validasi STNK
- History perubahan kendaraan

### 2. UI Improvements
- Drag & drop untuk upload foto
- Preview foto kendaraan
- Auto-complete untuk brand/model

### 3. Integration
- Integrasi dengan sistem STNK
- Notifikasi ke admin saat ada perubahan
- Audit log untuk perubahan kendaraan

## Dependencies
- FontAwesome untuk icons
- Tailwind CSS untuk styling
- Custom API utilities
- Modal system yang sudah ada

## Files Modified
- `frontend/js/driver-dashboard.js`
- `frontend/js/utils/api.js`
- `driver-service/src/main/java/com/ojol/driver/controller/DriverController.java` 