# Airbnb Tam Kod Tarama Scripti
## JavaScript + CSS Birleşik Analiz

## Kurulum Adımları

### 1. Paketleri Yükle
Projenin ana klasöründe `install-full.bat` dosyasını çalıştır:
```
install-full.bat
```

Bu şu paketleri yükleyecek:
**ESLint (JavaScript):**
- eslint
- eslint-config-airbnb
- eslint-plugin-import
- eslint-plugin-react
- eslint-plugin-react-hooks
- eslint-plugin-jsx-a11y

**Stylelint (CSS):**
- stylelint
- stylelint-config-standard
- stylelint-config-recommended
- postcss
- postcss-scss

### 2. Config Dosyalarını Kopyala
Ana klasöre (D:\Dev\v1yourblogbyozge\):
- `.eslintrc.airbnb.js`
- `.stylelintrc.js`

### 3. Script Dosyalarını Kopyala
`scripts` klasörüne (D:\Dev\v1yourblogbyozge\scripts\):
- `scan-full.bat`
- `generate-combined-report.js`

## Kullanım

### Tarama Başlat
```
cd D:\Dev\v1yourblogbyozge\scripts
scan-full.bat
```

Script:
✅ **JavaScript** tarayacak (.js, .jsx, .ts, .tsx)
✅ **CSS** tarayacak (.css, .scss)
✅ Airbnb kurallarına göre kontrol edecek
✅ **Tek birleşik** HTML dashboard raporu oluşturacak
✅ Raporu otomatik tarayıcıda açacak
✅ Rapor `scripts` klasöründe saklanacak

### Rapor Özellikleri
📊 **Dashboard İstatistikleri:**
- Toplam hata sayısı
- Toplam uyarı sayısı  
- Sorunlu dosya sayısı
- Genel kod durumu

📑 **Tab'lı Görünüm:**
- JavaScript sorunları
- CSS sorunları
- Tüm sorunlar (birleşik)

### Rapor İsmi
Her tarama için tarih-saat damgalı:
```
airbnb-report-20250212_143052.html
```

## Airbnb Kuralları

### JavaScript (ESLint)
Airbnb'nin JavaScript stil kuralları:
- Kod formatı ve indentasyon
- React best practices
- Import/Export düzeni
- Değişken isimlendirme
- Function yazımı
- ve 100+ kural daha...

### CSS (Stylelint)
CSS stil kuralları:
- Renk formatları (hex, rgb)
- Selector yazımı
- Property sıralaması
- Indentasyon ve boşluklar
- Media query formatı
- ve daha fazlası...

Kuralları özelleştirmek için:
- `.eslintrc.airbnb.js` (JavaScript)
- `.stylelintrc.js` (CSS)

## Tarama Kapsamı

✅ **JavaScript Dosyaları:**
- `.js` dosyaları
- `.jsx` dosyaları (React)
- `.ts` dosyaları (TypeScript)
- `.tsx` dosyaları (TypeScript + React)

✅ **CSS Dosyaları:**
- `.css` dosyaları
- `.scss` dosyaları (Sass)

❌ **Taranmayacak:**
- node_modules
- .next
- out
- build
- dist

## Sorun Giderme

**Hata: ESLint/Stylelint bulunamadı**
```
install-full.bat
```
tekrar çalıştır.

**HTML raporu açılmıyor**
Manuel aç:
```
D:\Dev\v1yourblogbyozge\scripts\airbnb-report-[TARIH].html
```

**Node.js hatası**
Node.js'in yüklü olduğundan emin ol:
```
node --version
```

**Generate script çalışmıyor**
`generate-combined-report.js` dosyasının `scripts` klasöründe olduğundan emin ol.
