@echo off
echo ========================================
echo    Sistem Ojek Online - Frontend
echo ========================================
echo.

echo Memulai frontend server...
echo.

cd frontend

echo Mencoba menjalankan dengan Python...
python -m http.server 3000 2>nul
if %errorlevel% neq 0 (
    echo Python tidak ditemukan, mencoba dengan Node.js...
    npx http-server -p 3000 2>nul
    if %errorlevel% neq 0 (
        echo Node.js tidak ditemukan, mencoba dengan PHP...
        php -S localhost:3000 2>nul
        if %errorlevel% neq 0 (
            echo Tidak dapat menjalankan server.
            echo Pastikan Python, Node.js, atau PHP terinstall.
            pause
            exit /b 1
        )
    )
)

echo.
echo Frontend berhasil dimulai!
echo Buka browser dan akses: http://localhost:3000
echo.
echo Tekan Ctrl+C untuk menghentikan server...
pause 