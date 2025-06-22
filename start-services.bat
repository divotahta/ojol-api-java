@echo off
echo ========================================
echo    Sistem Ojek Online - Microservices
echo ========================================
echo.

echo Memulai semua services...
echo.

echo [1/6] Memulai Eureka Server...
start "Eureka Server" cmd /k "cd eureka-server && mvn spring-boot:run"
timeout /t 10 /nobreak > nul

echo [2/6] Memulai API Gateway...
start "API Gateway" cmd /k "cd api-gateway && mvn spring-boot:run"
timeout /t 10 /nobreak > nul

echo [3/6] Memulai User Service...
start "User Service" cmd /k "cd user-service && mvn spring-boot:run"
timeout /t 10 /nobreak > nul

echo [4/6] Memulai Driver Service...
start "Driver Service" cmd /k "cd driver-service && mvn spring-boot:run"
timeout /t 10 /nobreak > nul

echo [5/6] Memulai Order Service...
start "Order Service" cmd /k "cd order-service && mvn spring-boot:run"
timeout /t 10 /nobreak > nul

echo [6/6] Memulai Payment Service...
start "Payment Service" cmd /k "cd payment-service && mvn spring-boot:run"
timeout /t 10 /nobreak > nul

echo.
echo ========================================
echo Semua services telah dimulai!
echo.
echo Akses aplikasi di:
echo - Frontend: http://localhost:3000
echo - Eureka Dashboard: http://localhost:8761
echo - API Gateway: http://localhost:8080
echo.
echo Untuk menjalankan frontend, buka terminal baru dan jalankan:
echo cd frontend
echo python -m http.server 3000
echo.
echo Tekan tombol apa saja untuk keluar...
pause > nul 