@echo off
echo ================================================
echo   My Hero Academia - Ultimate Hero Quiz
echo   Starting Development Server...
echo ================================================
echo.

cd /d "%~dp0"

echo Checking if node_modules exists...
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
    echo.
)

echo Starting Vite development server...
echo.
echo The quiz will open at: http://localhost:5173
echo.
echo Press Ctrl+C to stop the server
echo.
echo ================================================
echo   PLUS ULTRA!
echo ================================================
echo.

call npm run dev

pause
