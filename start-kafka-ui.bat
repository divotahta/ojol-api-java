@echo off
echo Starting Kafka UI...
echo.

REM Set Kafka UI directory
set KAFKA_UI_DIR=C:\kafka-ui
set KAFKA_UI_JAR=kafka-ui-latest.jar
set KAFKA_UI_URL=https://github.com/provectus/kafka-ui/releases/latest/download/kafka-ui-latest.jar

REM Create directory if not exists
if not exist "%KAFKA_UI_DIR%" mkdir "%KAFKA_UI_DIR%"

cd /d %KAFKA_UI_DIR%

REM Check if JAR file exists
if not exist "%KAFKA_UI_JAR%" (
    echo Downloading Kafka UI...
    echo This may take a few minutes...
    
    REM Download using PowerShell
    powershell -Command "& {Invoke-WebRequest -Uri '%KAFKA_UI_URL%' -OutFile '%KAFKA_UI_JAR%'}"
    
    if %errorlevel% neq 0 (
        echo Error downloading Kafka UI!
        echo Please download manually from: https://github.com/provectus/kafka-ui/releases
        pause
        exit /b 1
    )
    
    echo Download completed!
) else (
    echo Kafka UI JAR file already exists.
)

echo.
echo Starting Kafka UI...
echo Kafka UI will be available at: http://localhost:9090
echo.
echo Press Ctrl+C to stop Kafka UI
echo.

REM Start Kafka UI
java -jar %KAFKA_UI_JAR% --server.port=9090 --kafka.clusters.0.name=local-kafka --kafka.clusters.0.bootstrap-servers=localhost:9092 --kafka.clusters.0.zookeeper=localhost:2181

pause 