@echo off
echo ========================================
echo RESTARTING USER SERVICE
echo ========================================

echo.
echo Building User Service...
cd user-service
mvn clean install

echo.
echo Starting User Service on port 8082...
mvn spring-boot:run

pause 