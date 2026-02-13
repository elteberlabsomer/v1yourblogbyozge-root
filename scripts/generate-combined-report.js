const fs = require('fs');
const path = require('path');

// Komut satırından dosya yollarını al
const [,, eslintJsonPath, stylelintJsonPath, outputHtmlPath] = process.argv;

console.log('Raporlar birlestiriliyor...');

// JSON dosyalarını oku
let eslintResults = [];
let stylelintResults = [];

try {
  if (fs.existsSync(eslintJsonPath)) {
    eslintResults = JSON.parse(fs.readFileSync(eslintJsonPath, 'utf8'));
  }
} catch (e) {
  console.warn('ESLint sonuçları okunamadı:', e.message);
}

try {
  if (fs.existsSync(stylelintJsonPath)) {
    stylelintResults = JSON.parse(fs.readFileSync(stylelintJsonPath, 'utf8'));
  }
} catch (e) {
  console.warn('Stylelint sonuçları okunamadı:', e.message);
}

// İstatistikleri hesapla
let totalErrors = 0;
let totalWarnings = 0;
let jsErrors = 0;
let jsWarnings = 0;
let cssErrors = 0;
let cssWarnings = 0;
let filesWithIssues = new Set();

// ESLint istatistikleri
eslintResults.forEach(file => {
  if (file.errorCount > 0 || file.warningCount > 0) {
    filesWithIssues.add(file.filePath);
  }
  jsErrors += file.errorCount || 0;
  jsWarnings += file.warningCount || 0;
});

// Stylelint istatistikleri
stylelintResults.forEach(file => {
  if (file.warnings && file.warnings.length > 0) {
    filesWithIssues.add(file.source);
    file.warnings.forEach(warning => {
      if (warning.severity === 'error') {
        cssErrors++;
      } else {
        cssWarnings++;
      }
    });
  }
});

totalErrors = jsErrors + cssErrors;
totalWarnings = jsWarnings + cssWarnings;

// HTML rapor oluştur
const html = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Airbnb Kod Tarama Raporu</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 20px;
      color: #333;
    }
    
    .container {
      max-width: 1400px;
      margin: 0 auto;
    }
    
    header {
      text-align: center;
      color: white;
      margin-bottom: 40px;
    }
    
    header h1 {
      font-size: 3em;
      margin-bottom: 10px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
    }
    
    header p {
      font-size: 1.2em;
      opacity: 0.9;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }
    
    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 30px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      transition: transform 0.3s ease;
    }
    
    .stat-card:hover {
      transform: translateY(-5px);
    }
    
    .stat-card h3 {
      font-size: 0.9em;
      text-transform: uppercase;
      color: #666;
      margin-bottom: 10px;
      letter-spacing: 1px;
    }
    
    .stat-card .number {
      font-size: 3em;
      font-weight: bold;
      margin-bottom: 5px;
    }
    
    .stat-card.errors .number { color: #e74c3c; }
    .stat-card.warnings .number { color: #f39c12; }
    .stat-card.files .number { color: #3498db; }
    .stat-card.success .number { color: #2ecc71; }
    
    .section {
      background: white;
      border-radius: 12px;
      padding: 30px;
      margin-bottom: 30px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    }
    
    .section h2 {
      font-size: 1.8em;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 3px solid #667eea;
      color: #667eea;
    }
    
    .file-group {
      margin-bottom: 30px;
      border-left: 4px solid #ddd;
      padding-left: 20px;
    }
    
    .file-path {
      font-family: 'Courier New', monospace;
      font-size: 1.1em;
      color: #2c3e50;
      margin-bottom: 15px;
      font-weight: bold;
    }
    
    .issue {
      background: #f8f9fa;
      border-radius: 6px;
      padding: 15px;
      margin-bottom: 10px;
      border-left: 4px solid #ddd;
    }
    
    .issue.error {
      border-left-color: #e74c3c;
      background: #ffebee;
    }
    
    .issue.warning {
      border-left-color: #f39c12;
      background: #fff8e1;
    }
    
    .issue-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    
    .issue-severity {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 0.85em;
      font-weight: bold;
      text-transform: uppercase;
    }
    
    .issue-severity.error {
      background: #e74c3c;
      color: white;
    }
    
    .issue-severity.warning {
      background: #f39c12;
      color: white;
    }
    
    .issue-location {
      font-family: 'Courier New', monospace;
      color: #7f8c8d;
      font-size: 0.9em;
    }
    
    .issue-message {
      color: #2c3e50;
      margin-bottom: 5px;
      line-height: 1.6;
    }
    
    .issue-rule {
      font-family: 'Courier New', monospace;
      color: #7f8c8d;
      font-size: 0.85em;
    }
    
    .no-issues {
      text-align: center;
      padding: 60px 20px;
      color: #2ecc71;
    }
    
    .no-issues-icon {
      font-size: 5em;
      margin-bottom: 20px;
    }
    
    .no-issues h3 {
      font-size: 2em;
      margin-bottom: 10px;
    }
    
    footer {
      text-align: center;
      color: white;
      margin-top: 40px;
      opacity: 0.8;
    }
    
    .tabs {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
      border-bottom: 2px solid #eee;
    }
    
    .tab {
      padding: 12px 24px;
      cursor: pointer;
      border: none;
      background: none;
      font-size: 1em;
      font-weight: 600;
      color: #666;
      border-bottom: 3px solid transparent;
      transition: all 0.3s ease;
    }
    
    .tab:hover {
      color: #667eea;
    }
    
    .tab.active {
      color: #667eea;
      border-bottom-color: #667eea;
    }
    
    .tab-content {
      display: none;
    }
    
    .tab-content.active {
      display: block;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>🎯 Airbnb Kod Tarama Raporu</h1>
      <p>JavaScript & CSS Kalite Analizi</p>
      <p style="font-size: 0.9em; margin-top: 10px;">Tarih: ${new Date().toLocaleString('tr-TR')}</p>
    </header>
    
    <div class="stats-grid">
      <div class="stat-card errors">
        <h3>Toplam Hata</h3>
        <div class="number">${totalErrors}</div>
        <p>Düzeltilmeli</p>
      </div>
      
      <div class="stat-card warnings">
        <h3>Toplam Uyarı</h3>
        <div class="number">${totalWarnings}</div>
        <p>İncelenmeli</p>
      </div>
      
      <div class="stat-card files">
        <h3>Sorunlu Dosya</h3>
        <div class="number">${filesWithIssues.size}</div>
        <p>Gözden geçir</p>
      </div>
      
      <div class="stat-card ${totalErrors === 0 && totalWarnings === 0 ? 'success' : 'files'}">
        <h3>Durum</h3>
        <div class="number">${totalErrors === 0 && totalWarnings === 0 ? '✓' : '⚠'}</div>
        <p>${totalErrors === 0 && totalWarnings === 0 ? 'Temiz Kod' : 'İyileştir'}</p>
      </div>
    </div>
    
    ${totalErrors === 0 && totalWarnings === 0 ? `
    <div class="section no-issues">
      <div class="no-issues-icon">🎉</div>
      <h3>Mükemmel!</h3>
      <p>Kodunuz Airbnb standartlarına uygun.</p>
    </div>
    ` : `
    <div class="section">
      <div class="tabs">
        <button class="tab active" onclick="showTab('js')">
          JavaScript (${jsErrors + jsWarnings} sorun)
        </button>
        <button class="tab" onclick="showTab('css')">
          CSS (${cssErrors + cssWarnings} sorun)
        </button>
        <button class="tab" onclick="showTab('all')">
          Tümü (${totalErrors + totalWarnings} sorun)
        </button>
      </div>
      
      <div id="js-content" class="tab-content active">
        <h2>JavaScript Sorunları</h2>
        ${generateESLintHTML(eslintResults)}
      </div>
      
      <div id="css-content" class="tab-content">
        <h2>CSS Sorunları</h2>
        ${generateStylelintHTML(stylelintResults)}
      </div>
      
      <div id="all-content" class="tab-content">
        <h2>Tüm Sorunlar</h2>
        ${generateESLintHTML(eslintResults)}
        ${generateStylelintHTML(stylelintResults)}
      </div>
    </div>
    `}
    
    <footer>
      <p>Airbnb ESLint & Stylelint Raporu</p>
    </footer>
  </div>
  
  <script>
    function showTab(tabName) {
      // Tab butonları
      const tabs = document.querySelectorAll('.tab');
      tabs.forEach(tab => tab.classList.remove('active'));
      event.target.classList.add('active');
      
      // Tab içerikleri
      const contents = document.querySelectorAll('.tab-content');
      contents.forEach(content => content.classList.remove('active'));
      document.getElementById(tabName + '-content').classList.add('active');
    }
  </script>
</body>
</html>`;

// HTML dosyasını kaydet
fs.writeFileSync(outputHtmlPath, html, 'utf8');
console.log('✓ Birleşmiş rapor oluşturuldu:', outputHtmlPath);

// ESLint HTML üret
function generateESLintHTML(results) {
  if (!results || results.length === 0) {
    return '<p style="color: #2ecc71; padding: 20px; text-align: center;">✓ JavaScript dosyalarında sorun bulunamadı!</p>';
  }
  
  const filesWithIssues = results.filter(f => f.errorCount > 0 || f.warningCount > 0);
  
  if (filesWithIssues.length === 0) {
    return '<p style="color: #2ecc71; padding: 20px; text-align: center;">✓ JavaScript dosyalarında sorun bulunamadı!</p>';
  }
  
  return filesWithIssues.map(file => {
    const relativePath = file.filePath.replace(/\\/g, '/');
    return `
      <div class="file-group">
        <div class="file-path">${relativePath}</div>
        ${file.messages.map(msg => `
          <div class="issue ${msg.severity === 2 ? 'error' : 'warning'}">
            <div class="issue-header">
              <span class="issue-severity ${msg.severity === 2 ? 'error' : 'warning'}">
                ${msg.severity === 2 ? 'HATA' : 'UYARI'}
              </span>
              <span class="issue-location">Satır ${msg.line}:${msg.column}</span>
            </div>
            <div class="issue-message">${msg.message}</div>
            ${msg.ruleId ? `<div class="issue-rule">Kural: ${msg.ruleId}</div>` : ''}
          </div>
        `).join('')}
      </div>
    `;
  }).join('');
}

// Stylelint HTML üret
function generateStylelintHTML(results) {
  if (!results || results.length === 0) {
    return '<p style="color: #2ecc71; padding: 20px; text-align: center;">✓ CSS dosyalarında sorun bulunamadı!</p>';
  }
  
  const filesWithIssues = results.filter(f => f.warnings && f.warnings.length > 0);
  
  if (filesWithIssues.length === 0) {
    return '<p style="color: #2ecc71; padding: 20px; text-align: center;">✓ CSS dosyalarında sorun bulunamadı!</p>';
  }
  
  return filesWithIssues.map(file => {
    const relativePath = (file.source || '').replace(/\\/g, '/');
    return `
      <div class="file-group">
        <div class="file-path">${relativePath}</div>
        ${file.warnings.map(warning => `
          <div class="issue ${warning.severity === 'error' ? 'error' : 'warning'}">
            <div class="issue-header">
              <span class="issue-severity ${warning.severity === 'error' ? 'error' : 'warning'}">
                ${warning.severity === 'error' ? 'HATA' : 'UYARI'}
              </span>
              <span class="issue-location">Satır ${warning.line}:${warning.column}</span>
            </div>
            <div class="issue-message">${warning.text}</div>
            ${warning.rule ? `<div class="issue-rule">Kural: ${warning.rule}</div>` : ''}
          </div>
        `).join('')}
      </div>
    `;
  }).join('');
}
