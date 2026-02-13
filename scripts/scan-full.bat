@echo off
echo ========================================
echo AIRBNB TARAMA BASLADI
echo JavaScript + CSS Analizi
echo ========================================
echo.

cd /d D:\Dev\v1yourblogbyozge

REM Tarih ve saat ile dosya ismi
set timestamp=%date:~-4%%date:~3,2%%date:~0,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set timestamp=%timestamp: =0%

set ESLINT_JSON=scripts\eslint-temp-%timestamp%.json
set STYLELINT_JSON=scripts\stylelint-temp-%timestamp%.json
set FINAL_REPORT=scripts\airbnb-report-%timestamp%.html

echo [1/3] JavaScript dosyalari taranıyor (ESLint)...
call npx eslint src --config eslint.config.mjs --format json --output-file %ESLINT_JSON% 2>&1

if %ERRORLEVEL% NEQ 0 (
  echo UYARI: ESLint bazi hatalar buldu veya calisirken sorun yasadi
)
set ESLINT_EXIT=%ERRORLEVEL%

echo.
echo [2/3] CSS dosyalari taranıyor (Stylelint)...
call npx stylelint "src/**/*.css" "src/**/*.scss" --config stylelint.config.mjs --formatter json --output-file %STYLELINT_JSON% 2>&1

if %ERRORLEVEL% NEQ 0 (
  echo UYARI: Stylelint bazi hatalar buldu veya calisirken sorun yasadi
)
set STYLELINT_EXIT=%ERRORLEVEL%

echo.
echo [3/3] Birlesmis HTML rapor olusturuluyor...

REM Kontrol: eslint.config.mjs var mı?
if not exist "eslint.config.mjs" (
  echo HATA: eslint.config.mjs dosyasi bulunamadi!
  echo Lutfen bu dosyayi ana klasore kopyalayin.
  pause
  exit /b 1
)

REM Kontrol: generate-combined-report.js var mı?
if not exist "scripts\generate-combined-report.js" (
  echo HATA: scripts\generate-combined-report.js dosyasi bulunamadi!
  echo Lutfen bu dosyayi scripts klasorune kopyalayin.
  pause
  exit /b 1
)

REM Kontrol: JSON dosyaları oluştu mu?
if not exist "%ESLINT_JSON%" (
  echo HATA: ESLint JSON dosyasi olusturulamadi!
  pause
  exit /b 1
)

if not exist "%STYLELINT_JSON%" (
  echo HATA: Stylelint JSON dosyasi olusturulamadi!
  pause
  exit /b 1
)

call node scripts\generate-combined-report.js %ESLINT_JSON% %STYLELINT_JSON% %FINAL_REPORT%

if %ERRORLEVEL% NEQ 0 (
  echo HATA: HTML rapor olusturulamadi!
  echo Node.js hatasi olabilir.
  pause
  exit /b 1
)

REM Gecici JSON dosyalarını sil
if exist "%ESLINT_JSON%" del "%ESLINT_JSON%"
if exist "%STYLELINT_JSON%" del "%STYLELINT_JSON%"

echo.
if %ESLINT_EXIT% EQU 0 (
  if %STYLELINT_EXIT% EQU 0 (
    echo ========================================
    echo TARAMA TAMAMLANDI - HATA YOK!
    echo ========================================
  ) else (
    echo ========================================
    echo TARAMA TAMAMLANDI - CSS HATALARI VAR
    echo ========================================
  )
) else (
  echo ========================================
  echo TARAMA TAMAMLANDI - HATALAR BULUNDU
  echo ========================================
)

echo.
echo Rapor Konumu: %FINAL_REPORT%
echo.

REM Rapor var mı kontrol et
if exist "%FINAL_REPORT%" (
  echo Rapor basariyla olusturuldu!
  echo Tarayicida aciliyor...
  start "" "%FINAL_REPORT%"
) else (
  echo HATA: Rapor dosyasi olusturulamadi!
  echo Lutfen yukaridaki hata mesajlarini kontrol edin.
)

echo.
pause
