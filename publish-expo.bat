@echo off
title SoilHelp - Expo Publish Script
color 0B

echo ============================================
echo    SoilHelp - Expo Publishing Tool
echo ============================================
echo.

REM Step 1: Check if logged in
echo [1/4] Checking Expo login status...
eas whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo [!] Not logged in to Expo.
    echo [*] Please login with your Expo account:
    echo.
    eas login
    if %errorlevel% neq 0 (
        echo [X] Login failed. Exiting.
        pause
        exit /b 1
    )
    echo.
    echo [?] Login successful!
)
echo [?] Already logged in
echo.

REM Step 2: Initialize project (if needed)
echo [2/4] Initializing EAS project...
eas init --non-interactive >nul 2>&1
if %errorlevel% equ 0 (
    echo [?] EAS project initialized
) else (
    echo [i] EAS project already exists
)
echo.

REM Step 3: Configure EAS Update (if needed)
echo [3/4] Configuring EAS Update...
if not exist eas.json (
    echo [*] Creating eas.json configuration...
    eas update:configure
    echo [?] Configuration created
) else (
    echo [?] Configuration already exists
)
echo.

REM Step 4: Publish the app
echo [4/4] Publishing your app to Expo...
echo [*] This may take a few minutes...
echo.
eas update --branch production --message "SoilHelp - Published from script"

if %errorlevel% equ 0 (
    echo.
    echo ============================================
    echo    ? PUBLISHED SUCCESSFULLY!
    echo ============================================
    echo.
    echo Your app is now live and accessible from anywhere!
    echo.
    echo To view your app:
    echo   1. Visit: https://expo.dev
    echo   2. Go to Projects ? soilhelp
    echo   3. Share the QR code with your teammates
    echo.
    echo Or run: eas update:view
    echo.
) else (
    echo.
    echo [X] Publishing failed. Check the errors above.
)

echo.
pause
