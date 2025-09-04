import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Setting up ChromeDriver...');

// Detect platform (Windows vs Linux)
const isWin = process.platform === 'win32';
const chromedriverBinary = isWin ? 'chromedriver.exe' : 'chromedriver';

// Check if chromedriver is installed
try {
    const chromedriverPath = path.join(
        __dirname,
        '..',
        'node_modules',
        'chromedriver',
        'lib',
        'chromedriver',
        chromedriverBinary
    );

    if (fs.existsSync(chromedriverPath)) {
        console.log('ChromeDriver found:', chromedriverPath);
    } else {
        console.log('ChromeDriver not found, installing...');
        execSync('npm install chromedriver@latest', { stdio: 'inherit' });
    }
} catch (error) {
    console.error('Error setting up ChromeDriver:', error.message);
}

// Create a simple test script
const testScript = `
import { Builder } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import os from 'os';
import path from 'path';

async function testChromeDriver() {
    let driver;
    try {
        console.log('Testing ChromeDriver...');

        // Create unique Chrome profile folder
        const userDataDir = path.join(os.tmpdir(), 'chrome_profile_' + Date.now());

        const options = new chrome.Options().addArguments(
            '--headless=new',
            '--no-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--incognito',
            \`--user-data-dir=\${userDataDir}\`
        );

        driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .build();

        await driver.get('https://www.google.com');
        console.log('✅ ChromeDriver test successful!');
        await driver.quit();
    } catch (error) {
        console.error('❌ ChromeDriver test failed:', error.message);
        if (driver) await driver.quit();
    }
}

testChromeDriver();
`;

fs.writeFileSync(path.join(__dirname, '..', 'test-chromedriver.js'), testScript);
console.log('Test script created: test-chromedriver.js');
