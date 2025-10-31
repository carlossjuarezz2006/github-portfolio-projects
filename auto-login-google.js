const puppeteer = require('puppeteer');

async function loginToGoogle() {
  console.log('🚀 Iniciando navegador...');
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--disable-dev-shm-usage',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
      '--window-size=1920,1080'
    ],
    ignoreDefaultArgs: ['--enable-automation'],
  });

  const page = await browser.newPage();

  // Ocultar webdriver
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', {
      get: () => false,
    });
    
    window.navigator.chrome = {
      runtime: {},
    };
    
    Object.defineProperty(navigator, 'plugins', {
      get: () => [1, 2, 3, 4, 5],
    });
    
    Object.defineProperty(navigator, 'languages', {
      get: () => ['es-AR', 'es', 'en'],
    });
  });

  await page.setUserAgent(
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36'
  );

  console.log('📧 Navegando a Gmail...');
  await page.goto('https://accounts.google.com/signin/v2/identifier?service=mail', {
    waitUntil: 'networkidle2',
  });

  await page.waitForSelector('input[type="email"]', { timeout: 10000 });

  console.log('✍️  Ingresando email...');
  await page.type('input[type="email"]', 'carlossjuarezz2006@gmail.com', { delay: 100 });

  await new Promise(resolve => setTimeout(resolve, 1000));

  console.log('👆 Haciendo clic en Siguiente...');
  const nextButton1 = await page.$('#identifierNext');
  if (nextButton1) {
    await nextButton1.click();
  } else {
    await page.click('button[type="button"]');
  }

  await new Promise(resolve => setTimeout(resolve, 3000));

  // Esperar campo de contraseña
  try {
    await page.waitForSelector('input[type="password"]', { timeout: 15000 });
    console.log('🔑 Ingresando contraseña...');
    await page.type('input[type="password"]', 'siette777', { delay: 100 });

    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('👆 Haciendo clic en Siguiente (contraseña)...');
    const nextButton2 = await page.$('#passwordNext');
    if (nextButton2) {
      await nextButton2.click();
    } else {
      await page.click('button[type="button"]');
    }

    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log('✅ Proceso completado. Verifica manualmente si necesita 2FA.');
    console.log('⏳ Navegador permanecerá abierto por 5 minutos para que completes 2FA si es necesario...');

    await new Promise(resolve => setTimeout(resolve, 300000)); // 5 minutos

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('📸 Tomando screenshot...');
    await page.screenshot({ path: '/home/mike/Descargas/carlos-portfolio/error-login.png', fullPage: true });
  }

  await browser.close();
}

loginToGoogle().catch(console.error);

