#!/bin/bash

echo "========================================"
echo "   Sistem Ojek Online - Microservices"
echo "========================================"
echo

echo "Memulai semua services..."
echo

# Function to start service
start_service() {
    local service_name=$1
    local service_dir=$2
    echo "[$3/6] Memulai $service_name..."
    gnome-terminal --title="$service_name" -- bash -c "cd $service_dir && mvn spring-boot:run; exec bash" 2>/dev/null || \
    xterm -title "$service_name" -e "cd $service_dir && mvn spring-boot:run; bash" 2>/dev/null || \
    osascript -e "tell app \"Terminal\" to do script \"cd $(pwd)/$service_dir && mvn spring-boot:run\"" 2>/dev/null || \
    echo "Tidak dapat membuka terminal baru. Jalankan manual: cd $service_dir && mvn spring-boot:run"
    sleep 10
}

# Start all services
start_service "Eureka Server" "eureka-server" "1"
start_service "API Gateway" "api-gateway" "2"
start_service "User Service" "user-service" "3"
start_service "Driver Service" "driver-service" "4"
start_service "Order Service" "order-service" "5"
start_service "Payment Service" "payment-service" "6"

echo
echo "========================================"
echo "Semua services telah dimulai!"
echo
echo "Akses aplikasi di:"
echo "- Frontend: http://localhost:3000"
echo "- Eureka Dashboard: http://localhost:8761"
echo "- API Gateway: http://localhost:8080"
echo
echo "Untuk menjalankan frontend, buka terminal baru dan jalankan:"
echo "cd frontend"
echo "python3 -m http.server 3000"
echo
echo "Tekan Enter untuk keluar..."
read 