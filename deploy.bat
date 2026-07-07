@echo off
:: این اسکریپت برای تست بیلد پروژه و ارسال خودکار کدهای جدید به گیت‌هاب در ویندوز است.
chcp 65001 > null

echo ============================================
echo 🎯 شروع فرآیند تست و ارسال پروژه به گیت‌هاب...
echo ============================================

:: ۱. نصب پکیج‌ها
echo 📦 در حال نصب پکیج‌های پروژه...
call npm install
if %errorlevel% neq 0 (
    echo ❌ خطا در نصب پکیج‌ها!
    pause
    exit /b %errorlevel%
)

:: ۲. تست بیلد لوکال
echo 🛠️ در حال تست بیلد فرانت‌اند...
call npm run build:pages
if %errorlevel% neq 0 (
    echo ❌ خطا: بیلد پروژه با شکست مواجه شد! لطفاً خطاها را بررسی کنید.
    pause
    exit /b %errorlevel%
)

echo ✅ تست بیلد با موفقیت انجام شد و پوشه dist ساخته شد.

:: ۳. بررسی و فرستادن به گیت
if not exist .git (
    echo ⚠️ اخطار: پوشه .git یافت نشد. در حال راه‌اندازی گیت...
    git init
)

echo 📤 در حال آماده‌سازی و ارسال کدها به گیت‌هاب...
git add .
git commit -m "Update website from AI Studio (Vite + React)"

:: ارسال به شاخه پیش‌فرض
for /f "tokens=*" %%i in ('git branch --show-current') do set BRANCH=%%i
if "%BRANCH%"=="" set BRANCH=main

echo 🚀 در حال پوش کردن به شاخه %BRANCH%...
git push origin %BRANCH%

if %errorlevel% eq 0 (
    echo ============================================
    echo 🎉 عالیه! پروژه‌تون با موفقیت به گیت‌هاب ارسال شد.
    echo حالا کلودفلر به طور خودکار شروع به بیلد و انتشار می‌کنه.
    echo ============================================
) else (
    echo ❌ خطا در ارسال به گیت‌هاب. مطمئن شوید که دسترسی‌های لازم را دارید.
)

pause
