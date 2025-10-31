const puppeteer = require('puppeteer');

async function createGitHub() {
  console.log('🚀 Iniciando navegador para GitHub...');
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--window-size=1920,1080'
    ],
    ignoreDefaultArgs: ['--enable-automation'],
  });

  const page = await browser.newPage();

  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', {
      get: () => false,
    });
  });

  console.log('📧 Navegando a GitHub signup...');
  await page.goto('https://github.com/signup', {
    waitUntil: 'networkidle2',
  });

  await new Promise(resolve => setTimeout(resolve, 2000));

  try {
    // Email
    console.log('✍️  Ingresando email...');
    await page.waitForSelector('#email', { timeout: 10000 });
    await page.type('#email', 'carlossjuarezz2006@gmail.com', { delay: 100 });
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Click Continue
    const continueBtn1 = await page.$('button[type="submit"]');
    if (continueBtn1) {
      await continueBtn1.click();
      console.log('👆 Continue (email)...');
    }

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Password
    console.log('🔑 Ingresando contraseña...');
    await page.waitForSelector('#password', { timeout: 10000 });
    await page.type('#password', 'siette777', { delay: 100 });
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const continueBtn2 = await page.$('button[type="submit"]');
    if (continueBtn2) {
      await continueBtn2.click();
      console.log('👆 Continue (password)...');
    }

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Username
    console.log('👤 Ingresando username...');
    await page.waitForSelector('#login', { timeout: 10000 });
    await page.type('#login', 'carlosjuarez-dev', { delay: 100 });
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const continueBtn3 = await page.$('button[type="submit"]');
    if (continueBtn3) {
      await continueBtn3.click();
      console.log('👆 Continue (username)...');
    }

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Opt-out de emails
    console.log('📧 Opt-out de emails promocionales...');
    const optOutBtn = await page.$('button[type="submit"]');
    if (optOutBtn) {
      await optOutBtn.click();
      console.log('👆 Continue (opt-out)...');
    }

    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('✅ Proceso de signup completado.');
    console.log('⚠️  Ahora debes verificar el email y completar el captcha manualmente.');
    console.log('⏳ Navegador permanecerá abierto por 10 minutos...');

    await new Promise(resolve => setTimeout(resolve, 600000)); // 10 minutos

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('📸 Tomando screenshot...');
    await page.screenshot({ path: '/home/mike/Descargas/carlos-portfolio/error-github.png', fullPage: true });
    
    console.log('⏳ Navegador permanecerá abierto por 5 minutos para completar manualmente...');
    await new Promise(resolve => setTimeout(resolve, 300000));
  }

  await browser.close();
}

createGitHub().catch(console.error);

