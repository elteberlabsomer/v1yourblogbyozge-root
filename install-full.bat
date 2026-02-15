@echo off
echo ========================================
echo ESLint + Stylelint Kurulumu Basliyor...
echo (Airbnb Kurallari)
echo ========================================
echo.

cd /d D:\Dev\v1yourblogbyozge

echo [1/2] ESLint paketleri yukleniyor...
call npm install --save-dev ^
  eslint ^
  eslint-config-airbnb ^
  eslint-plugin-import ^
  eslint-plugin-react ^
  eslint-plugin-react-hooks ^
  eslint-plugin-jsx-a11y ^
  eslint-html-reporter

echo.
echo [2/2] Stylelint paketleri yukleniyor...
call npm install --save-dev ^
  stylelint ^
  stylelint-config-standard ^
  stylelint-config-recommended ^
  postcss ^
  postcss-scss

echo.
echo ========================================
echo Kurulum Tamamlandi!
echo ========================================
pause
