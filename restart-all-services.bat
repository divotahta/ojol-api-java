@echo off
echo ========================================
echo RESTARTING ALL SERVICES
echo ========================================

echo.
echo Stopping all services...
taskkill /f /im java.exe 2>nul
timeout /t 3 /nobreak >nul

echo.
echo Starting Eureka Server...
start "Eureka Server" cmd /k "cd eureka-server && mvn spring-boot:run"

echo.
echo Waiting for Eureka Server to start...
timeout /t 10 /nobreak >nul

echo.
echo Starting API Gateway...
start "API Gateway" cmd /k "cd api-gateway && mvn spring-boot:run"

echo.
echo Waiting for API Gateway to start...
timeout /t 10 /nobreak >nul

echo.
echo Starting Auth Service...
start "Auth Service" cmd /k "cd auth-service && mvn spring-boot:run"

echo.
echo Starting User Service...
start "User Service" cmd /k "cd user-service && mvn spring-boot:run"

echo.
echo Starting Driver Service...
start "Driver Service" cmd /k "cd driver-service && mvn spring-boot:run"

echo.
echo Starting Order Service...
start "Order Service" cmd /k "cd order-service && mvn spring-boot:run"

echo.
echo Starting Payment Service...
start "Payment Service" cmd /k "cd payment-service && mvn spring-boot:run"

echo.
echo ========================================
echo ALL SERVICES STARTED
echo ========================================
echo.
echo Services running on:
echo - Eureka Server: http://localhost:8761
echo - API Gateway: http://localhost:8080
echo - Auth Service: http://localhost:8081
echo - User Service: http://localhost:8082
echo - Driver Service: http://localhost:8083
echo - Order Service: http://localhost:8084
echo - Payment Service: http://localhost:8085
echo.
echo Frontend: http://localhost:3000
echo.
echo Waiting for all services to be ready...
timeout /t 30 /nobreak >nul
echo.
echo All services should be ready now!
pause 