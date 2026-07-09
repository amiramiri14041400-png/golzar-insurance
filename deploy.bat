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
if errorlevel 1 goto PUSH_ERROR

echo ============================================
echo Success! Your project was pushed to GitHub.
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
