@echo off
echo ========================================
echo TypeScript ESLint Paketi Yukleniyor...
echo ========================================
echo.

cd /d D:\Dev\v1yourblogbyozge

echo TypeScript ESLint yukleniyor...
call npm install --save-dev typescript-eslint

echo.
echo ========================================
echo Kurulum Tamamlandi!
echo ========================================
echo.
echo Simdi tekrar dene:
echo npx eslint src --config eslint.config.mjs --fix
echo.
pause
