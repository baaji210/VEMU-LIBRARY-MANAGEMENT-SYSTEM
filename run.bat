@echo off
echo ========================================================
echo   VEMU Library Management System - Startup Script
echo ========================================================
echo.

echo [1/3] Checking if frontend is built...
if not exist "frontend\dist" (
    echo Building the React frontend...
    cd frontend
    call npm install
    call npm run build
    cd ..
) else (
    echo Frontend is ready.
)

echo.
echo [2/3] Starting the Express server...
echo The application will be live at http://localhost:5000
echo press Ctrl+C to stop the server.
echo.

echo [3/3] Opening browser...
start http://localhost:5000

node backend/server.js
pause
