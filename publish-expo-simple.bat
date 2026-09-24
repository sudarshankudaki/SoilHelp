@echo off
title SoilHelp - Quick Expo Publish
color 0A

echo ============================================
echo    SoilHelp - Quick Publish Tool
echo ============================================
echo.
echo This script will publish your app using Expo Classic.
echo Your teammates will be able to access it from anywhere!
echo.

REM Check if logged in
echo [1/3] Checking login status...
npx expo whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] Not logged in. Starting login process...
    echo.
    npx expo login
    if %errorlevel% neq 0 (
        echo [X] Login failed. Exiting.
        pause
        exit /b 1
    )
    echo [?] Login successful!
)
echo [?] Logged in
echo.

REM Publish the app
echo [2/3] Publishing SoilHelp to Expo...
echo [*] This will take a few minutes...
echo.
npx expo publish --release-channel production

if %errorlevel% equ 0 (
    echo.
    echo ============================================
    echo    ? PUBLISHED SUCCESSFULLY!
    echo ============================================
    echo.
    echo Your app is now live!
    echo.
    echo To share with teammates:
    echo   1. Visit: https://expo.dev
    echo   2. Find your project: soilhelp
    echo   3. Share the QR code or link
    echo.
    echo Or scan the QR code shown above!
    echo.
) else (
    echo.
    echo [X] Publishing failed.
)

echo [3/3] Opening Expo dashboard...
start https://expo.dev

echo.
pause
