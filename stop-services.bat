@echo off
echo ========================================
echo    Menghentikan Semua Services
echo ========================================
echo.

echo Menghentikan semua Java processes...
taskkill /f /im java.exe 2>nul

echo.
echo Semua services telah dihentikan!
echo.
pause 