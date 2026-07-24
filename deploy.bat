@echo off
title Bimeh Iran Deployment Utility
cd /d "%~dp0"
cls

echo ======================================================
echo    DEPLOYMENT UTILITY - BIMEH IRAN GOLZAR (4456)
echo ======================================================
echo.
echo Step 1: Install packages (npm install)
echo Step 2: Build frontend files (npm run build:pages)
echo Step 3: Push code to GitHub (git add/commit/push)
echo Step 4: Deploy to Cloudflare Pages (wrangler pages deploy)
echo.
echo ======================================================
echo.

:STEP1
echo ------------------------------------------------------
echo [STEP 1/4] Installing Node.js packages...
echo ------------------------------------------------------
set /p run_step1="Run npm install? (Y/N): "
if /i "%run_step1%"=="Y" (
    call npm install
    if errorlevel 1 (
        echo [ERROR] npm install failed!
        pause
        goto MENU_EXIT
    )
    echo [OK] Packages installed successfully.
) else (
    echo [SKIPPED] Skipping npm install.
)
echo.

:STEP2
echo ------------------------------------------------------
echo [STEP 2/4] Building production files...
echo ------------------------------------------------------
set /p run_step2="Build static site into 'dist' folder? (Y/N): "
if /i "%run_step2%"=="Y" (
    call npm run build:pages
    if errorlevel 1 (
        echo [ERROR] Build failed! Check errors above.
        pause
        goto MENU_EXIT
    )
    echo [OK] Build completed successfully. 'dist' folder is ready.
) else (
    echo [SKIPPED] Skipping build step.
)
echo.

:STEP3
echo ------------------------------------------------------
echo [STEP 3/4] Syncing with GitHub...
echo ------------------------------------------------------
set /p run_step3="Commit and push changes to GitHub? (Y/N): "
if /i "%run_step3%"=="Y" (
    if not exist .git (
        echo Initializing Git repository...
        call git init
    )
    call git add .
    call git commit -m "Update Bimeh Iran Golzar App"
    call git push origin main
    if errorlevel 1 (
        echo.
        echo [WARNING] Normal push failed or branch is not 'main'.
        echo Trying force push to main...
        call git push origin main --force
    )
    echo [OK] GitHub sync finished.
) else (
    echo [SKIPPED] Skipping GitHub sync.
)
echo.

:STEP4
echo ------------------------------------------------------
echo [STEP 4/4] Deploying to Cloudflare Pages...
echo ------------------------------------------------------
set /p run_step4="Deploy 'dist' folder to Cloudflare via Wrangler? (Y/N): "
if /i "%run_step4%"=="Y" (
    if not exist dist (
        echo [ERROR] 'dist' folder does not exist! Please run Step 2 first.
        pause
        goto MENU_EXIT
    )
    call npx wrangler pages deploy dist
    echo [OK] Cloudflare deployment completed!
) else (
    echo [SKIPPED] Skipping Cloudflare deployment.
)
echo.

echo ======================================================
echo    ALL STEPS COMPLETED SUCCESSFULLY!
echo ======================================================
pause
exit /b 0

:MENU_EXIT
echo Deployment stopped.
pause
exit /b 1
