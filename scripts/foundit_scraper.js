import puppeteer from 'puppeteer';
import fs from 'fs-extra';
import path from 'path';
import xlsx from 'xlsx';
import mysql from 'mysql2/promise';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.argv.length !== 4) {
    console.log('Usage: node script.js <industry> <city>');
    process.exit(1);
}

const industry = process.argv[2];
const city = process.argv[3];
const data = [];
const gstTracker = {};

const downloadsFolder = path.join(__dirname, 'exports');
if (!fs.existsSync(downloadsFolder)) fs.mkdirSync(downloadsFolder);

const baseFileName = `${industry}_${city}_Foundit.xlsx`;
let filePath = path.join(downloadsFolder, baseFileName);

let fileIndex = 1;
while (fs.existsSync(filePath)) {
    filePath = path.join(
        downloadsFolder,
        `${baseFileName.replace('.xlsx', '')}(${fileIndex}).xlsx`
    );
    fileIndex++;
}

let ca;
try {
    ca = fs.readFileSync(path.join(__dirname, '..', 'certs', 'ca.pem'));
} catch (err) {
    console.error('Error loading certificate:', err.message);
    process.exit(1);
}

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    ssl: {
        ca: ca,
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
};

async function saveDataToDatabase() {
    if (data.length === 0) return;

    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        for (let record of data) {
            const query = `
                INSERT INTO scraped_data (company_name, location, job_title, address, phone_number, website_link, gst_number)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
            await connection.execute(query, [
                record['Company_Name'],
                record['Location'],
                record['Job_Title'],
                record['Address'],
                record['Phone'],
                record['Website'],
                record['GST Number(s)'],
            ]);
        }
        console.log(`Saved ${data.length} records to database.`);
    } catch (e) {
        console.error(`[DB] Error saving data: ${e.message}`);
    } finally {
        if (connection) await connection.end();
    }
}

async function saveData() {
    await saveDataToDatabase();
    if (data.length > 0) {
        const headers = [
            'Job_Title',
            'Company_Name',
            'Location',
            'Address',
            'Phone',
            'Website',
            'GST Number(s)',
        ];

        const rows = data.map((d) => [
            d['Job_Title'],
            d['Company_Name'],
            d['Location'],
            d['Address'],
            d['Phone'],
            d['Website'],
            d['GST Number(s)'],
        ]);
        const worksheetData = [headers, ...rows];
        const ws = xlsx.utils.aoa_to_sheet(worksheetData);
        const wb = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb, ws, 'Foundit Data');
        xlsx.writeFile(wb, filePath);
        console.log(`Data saved. Records: ${data.length}`);
        console.log(`Saved to: ${filePath}`);
    }
}

async function scrapeData() {
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

    try {
        const page = await browser.newPage();
        await page.goto('https://www.foundit.in/', { waitUntil: 'networkidle2' });

        await page.waitForSelector('#heroSectionDesktop-skillsAutoComplete--input', { timeout: 10000 });
        await page.type('#heroSectionDesktop-skillsAutoComplete--input', `${industry}, ${city}`);

        await page.click("button:has-text('Search')");
        await page.waitForTimeout(5000);

        let interrupted = false;
        process.on('SIGINT', () => {
            console.log('\nInterrupted! Saving progress...');
            interrupted = true;
        });

        while (!interrupted) {
            await page.waitForSelector('div.jobTitle', { timeout: 10000 });

            const jobTitles = await page.$$eval('div.jobTitle', els => els.map(el => el.textContent || 'N/A'));
            const companies = await page.$$eval("div.infoSection div.companyName p", els => els.map(el => el.textContent || 'N/A'));
            const locations = await page.$$eval('div.details.location', els => els.map(el => el.textContent || 'N/A'));

            for (let i = 0; i < Math.min(jobTitles.length, companies.length, locations.length); i++) {
                const jobTitle = jobTitles[i];
                const company = companies[i];
                const location = locations[i];

                if (!data.some(d => d['Company_Name'] === company && d['Location'] === location)) {
                    const gmapInfo = await getGoogleMapsData(company, location);
                    const gstNumbers = await getGstNumbers(company, location);

                    let gstToSave = 'N/A';
                    if (gstNumbers.length > 0) {
                        if (!gstTracker[company]) {
                            gstTracker[company] = new Set();
                        }

                        for (const gst of gstNumbers) {
                            if (!gstTracker[company].has(gst)) {
                                gstToSave = gst;
                                gstTracker[company].add(gst);
                                break;
                            }
                        }
                    }

                    gmapInfo['Job_Title'] = jobTitle;
                    gmapInfo['Company_Name'] = company;
                    gmapInfo['Location'] = location;
                    gmapInfo['GST Number(s)'] = gstToSave;

                    data.push(gmapInfo);
                    console.log(`[SCRAPED] ${jobTitle} | ${company} | ${location} | GST: ${gstToSave}`);
                }
            }

            await saveData();

            try {
                const nextBtn = await page.$('div.arrow.arrow-right');
                if (!nextBtn) {
                    console.log('No more pages.');
                    break;
                }
                await nextBtn.click();
                await page.waitForTimeout(4000);
            } catch (err) {
                console.log('No more pages.');
                break;
            }
        }
    } catch (err) {
        console.error(`Error occurred: ${err}`);
    } finally {
        await browser.close();
        await saveData();
        console.log('Scraping completed.');
    }
}

async function getGoogleMapsData(company, location) {
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
    let page;
    try {
        page = await browser.newPage();
        await page.goto(`https://www.google.com/maps/search/${encodeURIComponent(company)} ${encodeURIComponent(location)}`);

        try {
            await page.waitForSelector('h1.DUwDvf.lfPIob', { timeout: 15000 });
        } catch {
            try {
                await page.waitForSelector("a[href*='/place/']", { timeout: 15000 });
                await page.click("a[href*='/place/']");
                await page.waitForSelector('h1.DUwDvf.lfPIob', { timeout: 15000 });
            } catch {
                throw new Error('No results found');
            }
        }

        const name = await page.$eval('h1.DUwDvf.lfPIob', el => el.textContent).catch(() => company);
        const address = await page.$eval('div.Io6YTe.fontBodyMedium', el => el.textContent).catch(() => 'N/A');
        const website = await page.$eval("a[aria-label*='Website']", el => el.href).catch(() => 'N/A');
        const phone = await page.$eval("div.Io6YTe:has-text(/^0/)", el => el.textContent).catch(() => 'N/A');

        return {
            Company_Name: name || company,
            Address: address,
            Phone: phone,
            Website: website,
        };
    } catch (err) {
        console.error(`[Google Maps] Error for ${company}: ${err}`);
        return {
            Company_Name: company,
            Address: 'N/A',
            Phone: 'N/A',
            Website: 'N/A',
        };
    } finally {
        if (page) await page.close();
        if (browser) await browser.close();
    }
}

async function getGstNumbers(company, location) {
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
    let page;
    try {
        page = await browser.newPage();
        await page.goto('https://findgst.in/gstin-by-name');
        await page.waitForTimeout(2000);

        await page.waitForSelector('#gstnumber', { timeout: 10000 });
        await page.type('#gstnumber', company);

        await page.click("input[value='Find GST number']");
        await page.waitForTimeout(3000);

        const results = await page.$$eval(
            "p.yellow.lighten-5",
            elements => elements.map(el => el.textContent)
        );

        let gstNumbers = [];
        for (let text of results) {
            let matches = text.match(/\b\d{2}[A-Z0-9]{10}[1-9A-Z]{1}Z[0-9A-Z]{1}\b/g);
            if (matches) gstNumbers.push(...matches);
        }
        return gstNumbers;
    } catch (err) {
        console.error(`[GST] Error for ${company}: ${err}`);
        return [];
    } finally {
        if (page) await page.close();
        if (browser) await browser.close();
    }
}

// Start scraping
