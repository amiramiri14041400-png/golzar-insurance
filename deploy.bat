@echo off
rem 
chcp 65001 > nul



rem ۱

call npm install
if errorlevel 1 goto INSTALL_ERROR

rem

call npm run build:pages
if errorlevel 1 goto BUILD_ERROR



rem 
if exist .git goto GIT_OK

git init
:GIT_OK


git add .
git commit -m "Update website from AI Studio (Vite + React)"

rem
set BRANCH=main
for /f "tokens=*" %%i in ('git branch --show-current') do set BRANCH=%%i


git push origin %BRANCH%
if errorlevel 1 goto PUSH_ERROR
 
goto END_SCRIPT

:INSTALL_ERROR

goto PAUSE_END

:BUILD_ERROR

goto PAUSE_END

:PUSH_ERROR

goto PAUSE_END

:PAUSE_END
pause
exit /b 1

:END_SCRIPT
pause
