@echo off
rem Ensure the script runs in the directory of the batch file itself
cd /d "%~dp0"
chcp 65001 > nul

echo ======================================================
echo     DEPLOYMENT UTILITY: GITHUB + CLOUDFLARE + SUPABASE
echo ======================================================
echo This utility will guide you through the following steps:
echo  1. Install ^& update npm packages
echo  2. Build your React/Vite front-end files into the 'dist' folder
echo  3. Synchronize with your GitHub repository
echo  4. Directly deploy static files to Cloudflare Pages
echo  5. Inspect and verify Supabase configuration
echo ======================================================
echo.

set /p start_choice="OK? Continue by pressing Y: "
if /i not "%start_choice%"=="Y" (
    echo Deployment cancelled by user.
    goto END_PAUSE
)

echo.
echo ------------------------------------------------------
echo STEP 1: Checking and Installing Dependencies
echo ------------------------------------------------------
set /p inst_choice="Run npm install? Press Y to continue: "
if /i "%inst_choice%"=="Y" (
    echo Installing node packages...
    call npm install
    if errorlevel 1 (
        echo Error: Package installation failed!
        goto ERROR_PAUSE
    )
    echo Packages installed successfully.
) else (
    echo Skipping package installation.
)

echo.
echo ------------------------------------------------------
echo STEP 2: Building Production Files
echo ------------------------------------------------------
set /p build_choice="Run npm run build:pages? Press Y to continue: "
if /i "%build_choice%"=="Y" (
    echo Building website...
    call npm run build:pages
    if errorlevel 1 (
        echo Error: Build failed! Please review console errors.
        goto ERROR_PAUSE
    )
    echo Build completed successfully! 'dist' folder is updated.
) else (
    echo Skipping build stage.
)

echo.
echo ------------------------------------------------------
echo STEP 3: Synchronizing Code with GitHub
echo ------------------------------------------------------
set /p git_choice="Stage, commit, and push to GitHub? Press Y to continue: "
if /i "%git_choice%"=="Y" (
    if not exist .git (
        echo Git repository not found in this folder. Initializing...
        git init
    )

    git add .
    git commit -m "Update project deployment files"

    set BRANCH=main
    for /f "tokens=*" %%i in ('git branch --show-current') do set BRANCH=%%i

    echo Pushing code to branch: %BRANCH%...
    git push origin %BRANCH%

    if errorlevel 1 (
        echo.
        echo ⚠️ Git Push Failed/Rejected!
        echo ------------------------------------------------------
        echo Your remote GitHub repository has changes that are not present locally,
        echo or the remote is not configured yet.
        echo.
        echo Select an action to proceed:
        echo  [1] Safe Pull ^& Merge: Fetch remote changes, merge them, and push ^(Recommended^)
        echo  [2] Force Push: Overwrite your remote GitHub repository with local files
        echo  [3] Skip GitHub upload
        echo.
        set /p git_err_choice="Enter your option (1, 2, or 3): "

        if "%git_err_choice%"=="1" (
            echo Pulling remote changes...
            git pull origin %BRANCH% --no-rebase
            if errorlevel 1 (
                echo Error: Pull failed due to merge conflicts. Please resolve manually.
                goto ERROR_PAUSE
            )
            echo Pull succeeded! Retrying push...
            git push origin %BRANCH%
        ) else if "%git_err_choice%"=="2" (
            set /p force_confirm="Are you sure you want to force push? This will overwrite remote files! (Y/N): "
            if /i "%force_confirm%"=="Y" (
                echo Force pushing to %BRANCH%...
                git push origin %BRANCH% --force
            ) else (
                echo Force push cancelled.
            )
        ) else (
            echo Skipping Git sync.
        )
    ) else (
        echo Success! Changes have been synchronized to GitHub.
    )
) else (
    echo Skipping Git synchronization.
)

echo.
echo ------------------------------------------------------
echo STEP 4: Deploying directly to Cloudflare Pages
echo ------------------------------------------------------
set /p cf_choice="Deploy 'dist' folder directly to Cloudflare via Wrangler? Press Y to continue: "
if /i "%cf_choice%"=="Y" (
    if not exist dist (
        echo Error: 'dist' folder does not exist! You must build the project first.
        goto ERROR_PAUSE
    )
    echo Launching Cloudflare Pages deployment with Wrangler...
    echo This will upload your build and give you a permanent production URL.
    call npx wrangler pages deploy dist
) else (
    echo Skipping direct Cloudflare deployment.
)

echo.
echo ------------------------------------------------------
echo STEP 5: Verifying Supabase Configuration
echo ------------------------------------------------------
if exist .env (
    findstr "VITE_SUPABASE_URL=" .env >nul
    if not errorlevel 1 (
        echo [SUCCESS] Supabase configuration variables are detected in your local .env file!
    ) else (
        goto NO_SUPABASE_CONFIG
    )
) else (
    :NO_SUPABASE_CONFIG
    echo [NOTICE] Supabase connection keys are not yet configured in your local environment.
    echo To connect to your database:
    echo  1. Make sure you create a '.env' file in this folder.
    echo  2. Add the following values to it:
    echo     VITE_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
    echo     VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_PUBLIC_KEY
    echo.
    echo  3. IMPORTANT: When deploying to Cloudflare Pages:
    echo     Go to your Cloudflare Dashboard -^> Workers ^& Pages -^> your-project -^> Settings -^> Variables,
    echo     and define VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Environment Variables.
)

echo.
echo ======================================================
echo Deployment Process Complete!
echo ======================================================
goto END_PAUSE

:ERROR_PAUSE
echo.
echo An error occurred during deployment.
pause
exit /b 1

:END_PAUSE
pause
exit /b 0
