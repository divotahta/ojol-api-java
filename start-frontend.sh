#!/bin/bash

echo "========================================"
echo "   Sistem Ojek Online - Frontend"
echo "========================================"
echo

echo "Memulai frontend server..."
echo

cd frontend

# Try Python 3 first
if command -v python3 &> /dev/null; then
    echo "Menjalankan dengan Python 3..."
    python3 -m http.server 3000
elif command -v python &> /dev/null; then
    echo "Menjalankan dengan Python..."
    python -m http.server 3000
elif command -v node &> /dev/null; then
    echo "Menjalankan dengan Node.js..."
    npx http-server -p 3000
elif command -v php &> /dev/null; then
    echo "Menjalankan dengan PHP..."
    php -S localhost:3000
else
    echo "Tidak dapat menjalankan server."
    echo "Pastikan Python, Node.js, atau PHP terinstall."
    exit 1
fi

echo
echo "Frontend berhasil dimulai!"
echo "Buka browser dan akses: http://localhost:3000"
echo
echo "Tekan Ctrl+C untuk menghentikan server..." 