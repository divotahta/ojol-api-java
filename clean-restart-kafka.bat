@echo off
echo Clean Restart Kafka - Safe Mode
echo.

echo ========================================
echo 1. Stopping Existing Kafka Processes
echo ========================================
echo.

echo Stopping Kafka processes...
taskkill /f /im java.exe 2>nul
if %errorlevel% equ 0 (
    echo Kafka processes stopped ✓
) else (
    echo No Kafka processes found or already stopped
)

echo.
echo Waiting 3 seconds for cleanup...
timeout /t 3 /nobreak >nul

echo ========================================
echo 2. Checking Port Availability
echo ========================================
echo.

echo Checking if ports 9092 and 2181 are available...
netstat -an | findstr ":9092" >nul
if %errorlevel% equ 0 (
    echo WARNING: Port 9092 is still in use
    echo Trying to free the port...
    timeout /t 2 /nobreak >nul
) else (
    echo Port 9092 is available ✓
)

netstat -an | findstr ":2181" >nul
if %errorlevel% equ 0 (
    echo WARNING: Port 2181 is still in use
    echo Trying to free the port...
    timeout /t 2 /nobreak >nul
) else (
    echo Port 2181 is available ✓
)

echo ========================================
echo 3. Starting Zookeeper
echo ========================================
echo.

cd /d C:\kafka\kafka_2.13-3.9.1

echo Starting Zookeeper...
echo This may take a few seconds...
echo.

start "Zookeeper" cmd /k "bin\windows\zookeeper-server-start.bat config\zookeeper.properties"

echo Waiting for Zookeeper to start...
timeout /t 10 /nobreak >nul

echo ========================================
echo 4. Starting Kafka
echo ========================================
echo.

echo Starting Kafka...
echo This may take a few seconds...
echo.

start "Kafka" cmd /k "bin\windows\kafka-server-start.bat config\server.properties"

echo Waiting for Kafka to start...
timeout /t 15 /nobreak >nul

echo ========================================
echo 5. Testing Kafka Connection
echo ========================================
echo.

echo Testing Kafka connection...
timeout /t 5 /nobreak >nul

bin\windows\kafka-topics.bat --list --bootstrap-server localhost:9092 2>nul
if %errorlevel% equ 0 (
    echo.
    echo SUCCESS: Kafka is running properly ✓
    echo.
    echo Available topics:
    bin\windows\kafka-topics.bat --list --bootstrap-server localhost:9092
    echo.
    echo Kafka is ready for OJOL testing!
) else (
    echo.
    echo WARNING: Kafka connection failed
    echo.
    echo Troubleshooting steps:
    echo 1. Check if Java is installed: java -version
    echo 2. Check Kafka logs in the opened windows
    echo 3. Try running: debug-kafka-safe.bat
    echo 4. Check Windows Firewall settings
)

echo.
echo ========================================
echo 6. Next Steps
echo ========================================
echo.

echo To test OJOL with Kafka:
echo.
echo 1. Start Order Service: cd order-service && mvn spring-boot:run
echo 2. Start Payment Service: cd payment-service && mvn spring-boot:run
echo 3. Start Driver Service: cd driver-service && mvn spring-boot:run
echo 4. Create order through frontend
echo 5. Check Kafka UI: http://localhost:9090
echo.

echo Kafka restart completed!
echo Keep the Zookeeper and Kafka windows open while testing.
pause 