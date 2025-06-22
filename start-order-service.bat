@echo off
echo ========================================
echo STARTING ORDER SERVICE
echo ========================================

echo.
echo Building Order Service...
cd order-service
mvn clean install

echo.
echo Starting Order Service on port 8084...
mvn spring-boot:run

pause 