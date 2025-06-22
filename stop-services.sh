#!/bin/bash

echo "========================================"
echo "   Menghentikan Semua Services"
echo "========================================"
echo

echo "Menghentikan semua Java processes..."
pkill -f "spring-boot:run" 2>/dev/null
pkill -f "java.*ojol" 2>/dev/null

echo
echo "Semua services telah dihentikan!"
echo 