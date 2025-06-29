@echo off
echo Testing Kafka Integration with OJOL...
echo.

echo ========================================
echo 1. Checking Prerequisites
echo ========================================
echo.

REM Check if Kafka is running
cd C:\kafka\kafka_2.13-3.9.1
echo Testing Kafka connection...
bin\windows\kafka-topics.bat --list --bootstrap-server localhost:9092 >nul 2>&1

if %errorlevel% neq 0 (
    echo ERROR: Kafka is not running!
    echo Please start Kafka first: clean-restart-kafka.bat
    pause
    exit /b 1
)

echo Kafka is running ✓

REM Check if order-events topic exists
echo Checking order-events topic...
bin\windows\kafka-topics.bat --list --bootstrap-server localhost:9092 | findstr order-events >nul 2>&1

if %errorlevel% neq 0 (
    echo Creating order-events topic...
    bin\windows\kafka-topics.bat --create --topic order-events --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1
) else (
    echo order-events topic exists ✓
)

echo.
echo ========================================
echo 2. Testing Manual Message Send
echo ========================================
echo.

echo Sending test message to verify Kafka is working...
echo {"orderId":999,"customerId":1,"eventType":"TEST_MESSAGE","timestamp":"2024-01-01T10:00:00"} | bin\windows\kafka-console-producer.bat --topic order-events --bootstrap-server localhost:9092

echo.
echo ========================================
echo 3. Instructions for Testing
echo ========================================
echo.

echo Now follow these steps:
echo.
echo 1. Start Order Service with debug logging:
echo    cd order-service
echo    mvn spring-boot:run
echo.
echo 2. Watch the logs for these messages:
echo    - "Attempting to send order created event to Kafka"
echo    - "Order created event sent to Kafka"
echo    - Any error messages
echo.
echo 3. Create an order through the frontend
echo.
echo 4. Check Kafka UI at: http://localhost:9090
echo.
echo 5. Monitor messages with:
echo    bin\windows\kafka-console-consumer.bat --topic order-events --from-beginning --bootstrap-server localhost:9092
echo.

echo ========================================
echo 4. Common Issues and Solutions
echo ========================================
echo.

echo If no Kafka messages appear:
echo 1. Check if KafkaProducerService is injected (no null pointer exceptions)
echo 2. Check if KafkaTemplate is properly configured
echo 3. Check if order-events topic exists
echo 4. Check if Kafka is accessible from Order Service
echo 5. Check application.yml Kafka configuration
echo.

echo ========================================
echo 5. Starting Message Monitor
echo ========================================
echo.

echo Starting Kafka message monitor...
echo You should see the test message and any new order events
echo Press Ctrl+C to stop monitoring
echo.

bin\windows\kafka-console-consumer.bat --topic order-events --from-beginning --bootstrap-server localhost:9092

pause 