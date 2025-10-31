const puppeteer = require('puppeteer');

async function createLinkedIn() {
  console.log('🚀 Iniciando navegador para LinkedIn...');
  
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

  console.log('📧 Navegando a LinkedIn signup...');
  await page.goto('https://www.linkedin.com/signup', {
    waitUntil: 'networkidle2',
  });

  await new Promise(resolve => setTimeout(resolve, 2000));

  try {
    // Email
    console.log('✍️  Ingresando email...');
    await page.waitForSelector('#email-address', { timeout: 10000 });
    await page.type('#email-address', 'carlossjuarezz2006@gmail.com', { delay: 100 });
    await new Promise(resolve => setTimeout(resolve, 500));

    // Password
    console.log('🔑 Ingresando contraseña...');
    await page.waitForSelector('#password', { timeout: 10000 });
    await page.type('#password', 'siette777', { delay: 100 });
    await new Promise(resolve => setTimeout(resolve, 500));

    // Click Agree & Join
    console.log('👆 Haciendo clic en Agree & Join...');
    const joinBtn = await page.$('button[type="submit"]');
    if (joinBtn) {
      await joinBtn.click();
    }

    await new Promise(resolve => setTimeout(resolve, 3000));

    // Nombre
    console.log('👤 Ingresando nombre...');
    const firstNameInput = await page.$('#first-name');
    if (firstNameInput) {
      await firstNameInput.type('Carlos Alberto', { delay: 100 });
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    // Apellido
    console.log('👤 Ingresando apellido...');
    const lastNameInput = await page.$('#last-name');
    if (lastNameInput) {
      await lastNameInput.type('Juarez', { delay: 100 });
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    // Continue
    const continueBtn = await page.$('button[type="submit"]');
    if (continueBtn) {
      await continueBtn.click();
      console.log('👆 Continue (nombre)...');
    }

    await new Promise(resolve => setTimeout(resolve, 3000));

    // Ubicación
    console.log('📍 Ingresando ubicación...');
    const locationInput = await page.$('#location');
    if (locationInput) {
      await locationInput.type('Tafí Viejo, Tucumán, Argentina', { delay: 100 });
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Seleccionar primera opción del dropdown
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    const continueBtn2 = await page.$('button[type="submit"]');
    if (continueBtn2) {
      await continueBtn2.click();
      console.log('👆 Continue (ubicación)...');
    }

    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('✅ Proceso de signup completado.');
    console.log('⚠️  Ahora debes verificar el email y completar el perfil manualmente.');
    console.log('⏳ Navegador permanecerá abierto por 10 minutos...');

    await new Promise(resolve => setTimeout(resolve, 600000)); // 10 minutos

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('📸 Tomando screenshot...');
    await page.screenshot({ path: '/home/mike/Descargas/carlos-portfolio/error-linkedin.png', fullPage: true });
    
    console.log('⏳ Navegador permanecerá abierto por 5 minutos para completar manualmente...');
    await new Promise(resolve => setTimeout(resolve, 300000));
  }

  await browser.close();
}

createLinkedIn().catch(console.error);

