import { Builder } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import os from 'os';
import path from 'path';

async function createDriver() {
  // Generate a unique profile dir for every run
  const userDataDir = path.join(os.tmpdir(), 'chrome_profile_' + Date.now());

  const options = new chrome.Options().addArguments(
    '--headless=new',              // Required for Render (no display)
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--incognito',
    `--user-data-dir=${userDataDir}` // 👈 fixes "already in use" error
  );

  return await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();
}

export default createDriver;
