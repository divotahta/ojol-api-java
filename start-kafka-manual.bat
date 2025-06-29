@echo off
echo Starting Kafka and Zookeeper without ...
echo.

REM Set Kafka home directory - Update sesuai path Anda
set KAFKA_HOME=C:\kafka\kafka_2.13-3.9.1
set PATH=%KAFKA_HOME%\bin\windows;%PATH%

echo Kafka Home: %KAFKA_HOME%
echo.

REM Check if Java is installed
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Java is not installed or not in PATH!
    echo Please install Java 8 or newer and add it to PATH.
    pause
    exit /b 1
)

echo Java version:
java -version
echo.

REM Create directories if they don't exist
if not exist "%KAFKA_HOME%\kafka-logs" mkdir "%KAFKA_HOME%\kafka-logs"
if not exist "%KAFKA_HOME%\zookeeper-data" mkdir "%KAFKA_HOME%\zookeeper-data"

echo Starting Zookeeper...
start "Zookeeper" cmd /k "cd /d %KAFKA_HOME% && bin\windows\zookeeper-server-start.bat config\zookeeper.properties"

echo Waiting for Zookeeper to start...
timeout /t 10 /nobreak >nul

echo Starting Kafka...
start "Kafka" cmd /k "cd /d %KAFKA_HOME% && bin\windows\kafka-server-start.bat config\server.properties"

echo.
echo Kafka and Zookeeper are starting up...
echo.
echo Kafka Broker: localhost:9092
echo Zookeeper: localhost:2181
echo.
echo To stop Kafka and Zookeeper, close the command windows that opened.
echo.
echo To test Kafka, open a new command prompt and run:
echo   %KAFKA_HOME%\bin\windows\kafka-topics.bat --list --bootstrap-server localhost:9092
echo.
pause 