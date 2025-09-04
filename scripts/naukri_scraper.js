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
let gstTracker = {};

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

async function closeAds(page) {
    try {
        await page.waitForSelector("span[class*='ns-']:has-text('Close')", { timeout: 5000 });
        await page.click("span[class*='ns-']:has-text('Close')");
        console.log('[INFO] Closed popup ad (Type 1).');
        await delay(1000);
    } catch {
        console.log('[INFO] Type 1 popup not found.');
    }

    try {
        await page.waitForSelector("#dismiss-button", { timeout: 5000 });
        await page.click("#dismiss-button");
        console.log('[INFO] Closed popup ad (Type 2).');
        await delay(1000);
    } catch {
        console.log('[INFO] Type 2 popup not found.');
    }
}

async function getGSTNumbers(browser, companyName, location) {
    let gstNumbers = [];
    let page;
    try {
        page = await browser.newPage();
        await page.goto('https://findgst.in/gstin-by-name');

        await delay(2000);
        await closeAds(page);

        await page.waitForSelector('#gstnumber', { timeout: 10000 });
        await page.type('#gstnumber', companyName);
        await page.click("input[value='Find GST number']");
        await delay(5000);
        await page.evaluate(() => window.scrollBy(0, 800));
        await delay(2000);

        const results = await page.$$eval(
            "p.yellow.lighten-5",
            elements => elements.map(el => el.textContent)
        );
        for (let text of results) {
            let matches = text.match(
                /\b\d{2}[A-Z0-9]{10}[1-9A-Z]{1}Z[0-9A-Z]{1}\b/g
            );
            if (matches) gstNumbers.push(...matches);
        }
    } catch (e) {
        console.log(`[GST] Error for ${companyName}: ${e}`);
    } finally {
        if (page) await page.close();
    }
    return [...new Set(gstNumbers)];
}

async function getGoogleMapsData(browser, companyName, location) {
    let page;
    try {
        page = await browser.newPage();
        await page.goto(
            `https://www.google.com/maps/search/${encodeURIComponent(
                companyName
            )} ${encodeURIComponent(location)}`
        );

        try {
            await page.waitForSelector("h1.DUwDvf.lfPIob", { timeout: 15000 });
        } catch {
            try {
                await page.waitForSelector("a[href*='/place/']", { timeout: 15000 });
                await page.click("a[href*='/place/']");
                await page.waitForSelector("h1.DUwDvf.lfPIob", { timeout: 15000 });
            } catch {
                throw new Error('No results found');
            }
        }

        const name = await page.$eval("h1.DUwDvf.lfPIob", el => el.textContent).catch(() => companyName);
        const address = await page.$eval("div.Io6YTe.fontBodyMedium", el => el.textContent).catch(() => 'N/A');
        const website = await page.$eval("a[aria-label*='Website']", el => el.href).catch(() => 'N/A');
        const phone = await page.$eval("div.Io6YTe:has-text(/^0/)", el => el.textContent).catch(() => 'N/A');

        return {
            Company_Name: name || companyName,
            Address: address,
            Phone: phone,
            Website: website,
        };
    } catch (e) {
        console.log(`[Maps] Error for ${companyName}: ${e}`);
        return {
            Company_Name: companyName,
            Address: 'N/A',
            Phone: 'N/A',
            Website: 'N/A',
        };
    } finally {
        if (page) await page.close();
    }
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

// Database connection configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'root',
    database: process.env.DB_NAME || 'corporate_db',
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

async function saveData(filePath) {
    await saveDataToDatabase();
    if (data.length === 0) return;

    const worksheet = xlsx.utils.json_to_sheet(data);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Naukri Data');
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
    const city = process.argv[3] || 'Mumbai';
    const fileName = `${industry}_${city}_Naukri`;
    const filePath = getUniquexlsxPath(fileName);

    try {
        const page = await browser.newPage();
        await page.goto(
            'https://www.naukri.com/nlogin/login?URL=https://www.naukri.com/mnjuser/homepage',
            { waitUntil: 'networkidle2' }
        );
        await delay(5000);

        await page.evaluate(() => {
            let overlays = document.querySelectorAll('.nI-gNb-sb__placeholder');
            overlays.forEach(el => el.remove());
        });

        await page.waitForSelector('.suggestor-input', { timeout: 10000 });
        await page.click('.suggestor-input');
        await page.type('.suggestor-input', `${industry}, ${city}`);
        await page.click('.nI-gNb-sb__icon-wrapper');
        await delay(5000);

        let noMorePages = false;

        while (!interrupted && !noMorePages) {
            await page.evaluate(() => window.scrollBy(0, document.body.scrollHeight));
            await delay(3000);

            const jobs = await page.$$eval('a.title', elements => elements.map(el => el.textContent || 'N/A'));
            const companies = await page.$$eval('div.row2 span a.comp-name', elements => elements.map(el => el.textContent || 'N/A'));
            const locations = await page.$$eval('div.row3 span.loc-wrap span.loc span.locWdth', elements => elements.map(el => el.textContent || 'N/A'));

            for (let i = 0; i < Math.min(companies.length, locations.length); i++) {
                const jobTitle = jobs[i] || 'N/A';
                const companyName = companies[i] || 'N/A';
                const location = locations[i] || 'N/A';
                const shortLocation = location.split(',')[0].trim();

                if (!data.some(d => d['Company_Name'] === companyName && d['Location'] === shortLocation)) {
                    const mapsInfo = await getGoogleMapsData(browser, companyName, shortLocation);
                    const gstNumbers = await getGSTNumbers(browser, companyName, shortLocation);
                    let gstToSave = 'N/A';

                    if (gstNumbers.length > 0) {
                        gstTracker[companyName] = gstTracker[companyName] || new Set();
                        for (let gst of gstNumbers) {
                            if (!gstTracker[companyName].has(gst)) {
                                gstToSave = gst;
                                gstTracker[companyName].add(gst);
                                break;
                            }
                        }
                    }

                    const record = {
                        Job_Title: jobTitle,
                        Company_Name: companyName,
                        Location: shortLocation,
                        Address: mapsInfo['Address'],
                        Phone: mapsInfo['Phone'],
                        Website: mapsInfo['Website'],
                        'GST Number(s)': gstToSave,
                    };

                    data.push(record);
                    console.log(`Found: ${jobTitle} -> ${companyName} -> ${shortLocation} -> ${mapsInfo['Address']} -> ${mapsInfo['Phone']} -> ${mapsInfo['Website']} -> ${gstToSave}`);
                }
            }

            try {
                await page.waitForSelector("a span:has-text('Next')", { timeout: 10000 });
                await page.click("a span:has-text('Next')");
                await delay(3000);
            } catch {
                console.log('No more pages.');
                noMorePages = true;
            }
        }
    } finally {
        await browser.close();
        console.log('Browser closed.');
        await saveData(filePath);
        console.log(`Final data saved in: ${filePath}`);
    }
})();


//correct code
