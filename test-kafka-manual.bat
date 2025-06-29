@echo off
echo Testing Kafka Installation...
echo.

REM Set Kafka home directory - Update sesuai path Anda
set KAFKA_HOME=C:\kafka\kafka_2.13-3.9.1
set PATH=%KAFKA_HOME%\bin\windows;%PATH%

echo Kafka Home: %KAFKA_HOME%
echo.

echo 1. Testing Zookeeper connection...
echo telnet localhost 2181
echo If you see "Escape character is '^]'" then Zookeeper is running
echo.

echo 2. Testing Kafka connection...
echo telnet localhost 9092
echo If you see "Escape character is '^]'" then Kafka is running
echo.

echo 3. Listing Kafka topics...
cd /d %KAFKA_HOME%
bin\windows\kafka-topics.bat --list --bootstrap-server localhost:9092

echo.
echo 4. Creating test topic...
bin\windows\kafka-topics.bat --create --topic test-topic --bootstrap-server localhost:9092 --partitions 1 --replication-factor 1

echo.
echo 5. Listing topics again to verify creation...
bin\windows\kafka-topics.bat --list --bootstrap-server localhost:9092

echo.
echo 6. Testing producer (sending message)...
echo Hello Kafka! | bin\windows\kafka-console-producer.bat --topic test-topic --bootstrap-server localhost:9092

echo.
echo 7. Testing consumer (receiving message)...
echo Press Ctrl+C to stop consumer
bin\windows\kafka-console-consumer.bat --topic test-topic --from-beginning --bootstrap-server localhost:9092

echo.
echo Kafka test completed!
pause 