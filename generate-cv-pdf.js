const puppeteer = require('puppeteer');
const { marked } = require('marked');
const fs = require('fs');
const path = require('path');

async function generatePDF() {
  const mdContent = fs.readFileSync(
    path.join(__dirname, 'CV-CarlosAlbertoJuarez.md'),
    'utf-8'
  );

  const htmlContent = marked.parse(mdContent);

  const fullHTML = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CV - Carlos Alberto Juarez</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
    }
    h1 {
      font-size: 32px;
      margin-bottom: 10px;
      color: #0066cc;
      border-bottom: 3px solid #0066cc;
      padding-bottom: 10px;
    }
    h2 {
      font-size: 22px;
      margin-top: 30px;
      margin-bottom: 15px;
      color: #0066cc;
      border-bottom: 2px solid #e0e0e0;
      padding-bottom: 5px;
    }
    h3 {
      font-size: 18px;
      margin-top: 20px;
      margin-bottom: 10px;
      color: #333;
    }
    p, li {
      margin-bottom: 10px;
      font-size: 14px;
    }
    ul {
      margin-left: 20px;
      margin-bottom: 15px;
    }
    strong {
      color: #0066cc;
    }
    hr {
      border: none;
      border-top: 1px solid #e0e0e0;
      margin: 20px 0;
    }
    code {
      background: #f4f4f4;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 13px;
    }
  </style>
</head>
<body>
  ${htmlContent}
</body>
</html>
  `;

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setContent(fullHTML, { waitUntil: 'networkidle0' });

  await page.pdf({
    path: path.join(__dirname, 'CV-CarlosAlbertoJuarez.pdf'),
    format: 'A4',
    printBackground: true,
    margin: {
      top: '20mm',
      right: '15mm',
      bottom: '20mm',
      left: '15mm'
    }
  });

  await browser.close();
  console.log('✅ CV PDF generado: CV-CarlosAlbertoJuarez.pdf');
}

generatePDF().catch(console.error);


