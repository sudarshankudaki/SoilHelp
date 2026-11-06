@echo off
echo ========================================
echo Wake Up Render Backend
echo ========================================
echo.
echo Waking up: https://soilhelp.onrender.com
echo This may take 60 seconds if it's sleeping...
echo.

curl -s https://soilhelp.onrender.com/health

if %ERRORLEVEL% == 0 (
    echo.
    echo ========================================
    echo SUCCESS: Backend is awake!
    echo ========================================
    echo.
    echo Your backend is ready at:
    echo https://soilhelp.onrender.com
    echo.
    echo You can now use your app!
) else (
    echo.
    echo ========================================
    echo Backend is still waking up...
    echo ========================================
    echo.
    echo Waiting 30 more seconds...
    timeout /t 30 /nobreak
    echo.
    echo Trying again...
    curl -s https://soilhelp.onrender.com/health
    echo.
    echo.
    echo If still not responding, check Render dashboard:
    echo https://dashboard.render.com
)

echo.
pause
