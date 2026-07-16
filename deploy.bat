@echo off
rem This script tests the build and pushes the changes to GitHub.
chcp 65001 > nul

rem Ensure the script runs in the directory of the batch file itself
cd /d "%~dp0"

echo ============================================
echo Starting deployment check and git push...
echo ============================================

echo Checking and installing packages...
call npm install
if errorlevel 1 goto INSTALL_ERROR

echo Building front-end project...
call npm run build:pages
if errorlevel 1 goto BUILD_ERROR

echo Build completed successfully. Folder 'dist' is ready.

if exist .git goto GIT_OK
echo Git repository not found. Initializing git...
git init
:GIT_OK

echo Staging and committing changes...
git add .
git commit -m "Update website from AI Studio (Vite + React)"

set BRANCH=main
for /f "tokens=*" %%i in ('git branch --show-current') do set BRANCH=%%i

echo Pushing to branch: %BRANCH%...
git push origin %BRANCH%
if errorlevel 1 goto PUSH_FAILED

echo ============================================
echo Success! Your project was pushed to GitHub.
echo Cloudflare will build and publish it shortly.
echo ============================================
goto END_SCRIPT

:PUSH_FAILED
echo.
echo ============================================
echo ⚠️ Git Push Rejected!
echo ============================================
echo This usually happens because the remote repository (GitHub) has commits
echo that you do not have locally.
echo.
echo What would you like to do?
echo [1] Try to pull remote changes and merge (Safe)
echo [2] Force Push (Overwrites GitHub with your current local files - recommended if AI Studio is your source of truth)
echo [3] Exit
echo.

set choice=
set /p choice="Enter option (1, 2, or 3): "

if "%choice%"=="1" goto PULL_AND_PUSH
if "%choice%"=="2" goto FORCE_PUSH
goto PAUSE_END

:PULL_AND_PUSH
echo.
echo Trying to pull remote changes...
git pull origin %BRANCH% --no-rebase
if errorlevel 1 (
    echo.
    echo Error: Pull failed due to conflicts. Please resolve them manually.
    goto PAUSE_END
)
echo.
echo Pull succeeded! Retrying push...
git push origin %BRANCH%
if errorlevel 1 goto PUSH_ERROR
echo ============================================
echo Success! Your project was pushed to GitHub.
echo Cloudflare will build and publish it shortly.
echo ============================================
goto END_SCRIPT

:FORCE_PUSH
echo.
echo Warning: This will overwrite files on GitHub!
set /p confirm="Are you sure you want to force push? (Y/N): "
if /i "%confirm%"=="Y" goto FORCE_PUSH_DO
echo Cancelled.
goto PAUSE_END

:FORCE_PUSH_DO
echo Force pushing to branch %BRANCH%...
git push origin %BRANCH% --force
if errorlevel 1 goto PUSH_ERROR
echo ============================================
echo Success! Your project was force-pushed to GitHub.
echo Cloudflare will build and publish it shortly.
echo ============================================
goto END_SCRIPT

:INSTALL_ERROR
echo Error: Failed to install npm packages!
goto PAUSE_END

:BUILD_ERROR
echo Error: Build failed! Please inspect logs.
goto PAUSE_END

:PUSH_ERROR
echo Error: Failed to push to GitHub. Check connection or remote repo settings.
goto PAUSE_END

:PAUSE_END
pause
exit /b 1

:END_SCRIPT
pause
