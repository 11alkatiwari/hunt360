import puppeteer from 'puppeteer';
import fs from 'fs-extra';
import path from 'path';
import xlsx from 'xlsx';
import mysql from 'mysql2/promise';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let interrupted = false;
let data = [];

process.on('SIGINT', () => {
    console.log('\nScript interrupted! Saving the data...');
    interrupted = true;
});
process.on('SIGTERM', () => {
    console.log('\nScript terminated! Saving the data...');
    interrupted = true;
});

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getUniquexlsxPath(baseName) {
    const downloadsFolder = path.join(__dirname, 'exports');
    if (!fs.existsSync(downloadsFolder)) fs.mkdirSync(downloadsFolder);

    const base = path.join(downloadsFolder, baseName + '.xlsx');
    if (!fs.existsSync(base)) return base;

    let i = 1;
    let newPath;
    do {
        newPath = path.join(downloadsFolder, `${baseName}(${i}).xlsx`);
        i++;
    } while (fs.existsSync(newPath));
    return newPath;
}

async function saveData(filePath) {
    if (data.length === 0) return;

    const worksheet = xlsx.utils.json_to_sheet(data);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Hirist Data');
    xlsx.writeFile(workbook, filePath);

    console.log(`Saved ${data.length} records to: ${filePath}`);
}

(async function main() {
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ]
    });

    const industry = process.argv[2] || 'IT Services';
    const city = process.argv[3] || 'Bangalore';
    const fileName = `${industry}_${city}_Hirist`;
    const filePath = getUniquexlsxPath(fileName);

    try {
        const page = await browser.newPage();
        await page.goto('https://www.hirist.com/', { waitUntil: 'networkidle2' });
        await delay(3000);

        // Search for jobs
        await page.waitForSelector('#keyword', { timeout: 10000 });
        await page.type('#keyword', industry);

        await page.waitForSelector('#location', { timeout: 10000 });
        await page.type('#location', city);

        await page.click('.search-btn');
        await delay(5000);

        const jobs = await page.$$('.job-list');

        for (let job of jobs) {
            try {
                const jobTitle = await job.$eval('.job-title', el => el.textContent || 'N/A');
                const companyName = await job.$eval('.company-name', el => el.textContent || 'N/A');
                const location = await job.$eval('.location', el => el.textContent || 'N/A');

                const record = {
                    Job_Title: jobTitle,
                    Company_Name: companyName,
                    Location: location,
                    Address: 'N/A',
                    Phone: 'N/A',
                    Website: 'N/A',
                    'GST Number(s)': 'N/A'
                };

                data.push(record);
                console.log(`Found: ${jobTitle} -> ${companyName} -> ${location}`);
            } catch (e) {
                console.log('Error processing job:', e.message);
            }
        }

    } finally {
        await browser.close();
        console.log('Browser closed.');
        await saveData(filePath);
        console.log(`Final data saved in: ${filePath}`);
    }
})();
