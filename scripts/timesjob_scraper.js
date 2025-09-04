/*const fs = require("fs");
const path = require("path");
// const readlineSync = require("readline-sync");
const { Builder, By, until } = require("selenium-webdriver");
const xlsx = require("xlsx");
const mysql = require('mysql2/promise'); // Use mysql2/promise for async/await

// --- Args ---
if (process.argv.length !== 4) {
    console.log("Usage: node script.js <industry> <city>");
    process.exit(1);
}

const industry = process.argv[2];
const city = process.argv[3];

// --- Paths ---
const downloadsFolder = path.join(require("os").homedir(), "/Downloads");
if (!fs.existsSync(downloadsFolder)) fs.mkdirSync(downloadsFolder, { recursive: true });

function getUniqueExcelFileName(baseName) {
    const base = path.join(downloadsFolder, baseName + ".xlsx");
    if (!fs.existsSync(base)) return base;

    let counter = 1;
    while (true) {
        const altPath = path.join(downloadsFolder, `${baseName}(${counter}).xlsx`);
        if (!fs.existsSync(altPath)) return altPath;
        counter++;
    }
}

const baseName = `TimesJobs_${industry.replace(/ /g, "_")}_${city.replace(/ /g, "_")}`;
const excelPath = getUniqueExcelFileName(baseName);

// --- Globals ---
let seen = new Set();
let data = [];
let interrupted = false;
let gstTracker = {};

// Database connection configuration
const dbConfig = {
    host: 'localhost',
    user: 'root', // Replace with your MySQL username
    password: 'root', // Replace with your MySQL password
    database: 'corporate_db' // Replace with your database name
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
                record["Company_Name"],
                record["Location"],
                record["Job_Title"],
                record["Address"],
                record["Phone"],
                record["Website"],
                record["GST Number(s)"]
            ]);
        }
        console.log(`Saved ${data.length} records to database.`);
    } catch (e) {
        console.error(`[DB] Error saving data: ${e.message}`);
    } finally {
        if (connection) await connection.end();
    }
}

// --- Helpers ---
async function saveToExcel() {
    await saveDataToDatabase(); // Save to database first
    const ws = xlsx.utils.json_to_sheet(data);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Jobs");
    xlsx.writeFile(wb, excelPath);
    console.log(` Saved ${data.length} records to: ${excelPath}`);
}

async function closeAds(driver) {
    try {
        const closeBtn = await driver.wait(until.elementLocated(By.xpath("//span[contains(@class, 'ns-') and text()='Close']")), 5000);
        await closeBtn.click();
        console.log("[INFO] Closed popup ad (Type 1).");
    } catch {}

    try {
        const dismissBtn = await driver.wait(until.elementLocated(By.xpath("//div[@id='dismiss-button']")), 5000);
        await dismissBtn.click();
        console.log("[INFO] Closed popup ad (Type 2).");
    } catch {}
}

async function getGoogleMapsData(driver, companyName, location) {
    try {
        await driver.executeScript("window.open('');");
        const tabs = await driver.getAllWindowHandles();
        await driver.switchTo().window(tabs[1]);

        await driver.get(`https://www.google.com/maps/search/${companyName} ${location}`);

        try {
            await driver.wait(until.elementLocated(By.xpath("//h1[@class='DUwDvf lfPIob']")), 15000);
        } catch {
            try {
                const firstResult = await driver.wait(until.elementLocated(By.xpath("(//a[contains(@href, '/place/')])[1]")), 10000);
                await firstResult.click();
                await driver.wait(until.elementLocated(By.xpath("//h1[@class='DUwDvf lfPIob']")), 10000);
            } catch {
                throw new Error("No results found");
            }
        }

        const nameEl = await driver.findElement(By.xpath("//h1[@class='DUwDvf lfPIob']")).catch(() => null);
        const addressEl = await driver.findElement(By.xpath("//div[contains(@class,'Io6YTe') and contains(@class, 'fontBodyMedium')]")).catch(() => null);
        const websiteEl = await driver.findElement(By.xpath("//a[contains(@aria-label, 'Website')]")).catch(() => null);
        const phoneEl = await driver.findElement(By.xpath("//div[starts-with(text(), '0') and contains(@class, 'Io6YTe')]")).catch(() => null);

        const address = addressEl ? await addressEl.getText() : "N/A";
        const website = websiteEl ? await websiteEl.getAttribute("href") : "N/A";
        const phone = phoneEl ? await phoneEl.getText() : "N/A";

        return { Address: address, Phone: phone, Website: website };
    } catch (e) {
        console.log(`[Maps] Error for ${companyName}: ${e}`);
        return { Address: "N/A", Phone: "N/A", Website: "N/A" };
    } finally {
        const tabs = await driver.getAllWindowHandles();
        if (tabs.length > 1) {
            await driver.close();
            await driver.switchTo().window(tabs[0]);
        }
    }
}

async function getGSTNumbers(driver, companyName) {
    let gstNumbers = [];
    try {
        await driver.executeScript("window.open('');");
        const tabs = await driver.getAllWindowHandles();
        await driver.switchTo().window(tabs[1]);

        await driver.get("https://findgst.in/gstin-by-name");
        await driver.sleep(2000);
        await closeAds(driver);

        const searchInput = await driver.wait(until.elementLocated(By.id("gstnumber")), 10000);
        await searchInput.clear();
        await searchInput.sendKeys(companyName);

        const searchBtn = await driver.findElement(By.xpath("//input[@value='Find GST number']"));
        await searchBtn.click();
        await driver.sleep(5000);

        const results = await driver.findElements(By.xpath("//p[contains(@class, 'yellow') and contains(@class, 'lighten-5')]"));
        for (let block of results) {
            const text = await block.getText();
            const matches = text.match(/\b\d{2}[A-Z0-9]{10}[1-9A-Z]{1}Z[0-9A-Z]{1}\b/g);
            if (matches) gstNumbers.push(...matches);
        }
    } catch (e) {
        console.log(`[GST] Error for ${companyName}: ${e}`);
    } finally {
        const tabs = await driver.getAllWindowHandles();
        if (tabs.length > 1) {
            await driver.close();
            await driver.switchTo().window(tabs[0]);
        }
    }

    gstNumbers = [...new Set(gstNumbers)];
    let gstToSave = "N/A";

    if (gstNumbers.length) {
        if (!gstTracker[companyName]) gstTracker[companyName] = new Set();
        for (let gst of gstNumbers) {
            if (!gstTracker[companyName].has(gst)) {
                gstToSave = gst;
                gstTracker[companyName].add(gst);
                break;
            }
        }
    }

    return gstToSave;
}

// --- Main Scraping ---
(async () => {
    const driver = await new Builder().forBrowser("chrome").build();
    process.on("SIGINT", async () => {
        console.log("\n Interrupted. Saving data and quitting...");
        saveToExcel();
        await driver.quit();
        process.exit(0);
    });

    try {
        const url = `https://m.timesjobs.com/mobile/jobs-search-result.html?txtKeywords=${industry.replace(/ /g, "+")}&txtLocation=${city.replace(/ /g, "+")}`;
        await driver.get(url);
        await driver.sleep(2000);

        let lastHeight = await driver.executeScript("return document.body.scrollHeight");
        let scrollAttempts = 0;

        while (scrollAttempts < 10) {
            await driver.executeScript("window.scrollBy(0, 1200);");
            await driver.sleep(600);
            await driver.executeScript("window.scrollBy(0, -50);");
            await driver.sleep(600);

            let newHeight = await driver.executeScript("return document.body.scrollHeight");
            if (newHeight === lastHeight) {
                scrollAttempts++;
            } else {
                lastHeight = newHeight;
                scrollAttempts = 0;
            }
        }

        const jobs = await driver.findElements(By.xpath("//div[contains(@id, 'liDiv')]"));

        for (let job of jobs) {
            try {
                const title = await job.findElement(By.xpath(".//div[contains(@class, 'srp-job-heading')]/h3/a")).getText();
                const company = await job.findElement(By.xpath(".//span[@class='srp-comp-name']")).getText();
                const location = await job.findElement(By.xpath(".//div[@class='srp-loc']")).getText();
                const key = `${title}-${company}-${location}`;

                if (!seen.has(key)) {
                    seen.add(key);
                    const selectedLoc = location.split(',')[0].trim();

                    const mapsInfo = await getGoogleMapsData(driver, company, selectedLoc);
                    const gstInfo = await getGSTNumbers(driver, company);

                    data.push({
                        "Job_Title": title,
                        "Company_Name": company,
                        "Location": selectedLoc,
                        ...mapsInfo,
                        "GST Number(s)": gstInfo
                    });

                    console.log(` ${title} | ${company} | GST: ${gstInfo}`);
                }
            } catch (err) {
                console.log(" Error parsing job:", err.message);
                continue;
            }
        }

        saveToExcel();
    } finally {
        await driver.quit();
        console.log(" Scraping completed and browser closed.");
    }
})();*/

import fs from 'fs';
import path from 'path';
// import readlineSync from 'readline-sync';  // Uncomment if needed
import { By, until } from 'selenium-webdriver';
import xlsx from 'xlsx';
import mysql from 'mysql2/promise';
import { fileURLToPath } from 'url';
import createDriver from './setup-chromedriver.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Args ---
if (process.argv.length !== 4) {
    console.log('Usage: node script.js <industry> <city>');
    process.exit(1);
}

const industry = process.argv[2];
const city = process.argv[3];

// --- Paths ---
const downloadsFolder = path.join(__dirname, 'exports');
if (!fs.existsSync(downloadsFolder)) fs.mkdirSync(downloadsFolder);

function getUniqueExcelFileName(baseName) {
    const base = path.join(downloadsFolder, baseName + '.xlsx');
    if (!fs.existsSync(base)) return base;

    let counter = 1;
    while (true) {
        const altPath = path.join(
            downloadsFolder,
            `${baseName}(${counter}).xlsx`
        );
        if (!fs.existsSync(altPath)) return altPath;
        counter++;
    }
}

const baseName = `TimesJobs_${industry.replace(/ /g, '_')}_${city.replace(/ /g, '_')}`;
const excelPath = getUniqueExcelFileName(baseName);

// --- Globals ---
let seen = new Set();
let data = [];
let interrupted = false;
let gstTracker = {};

// Database connection configuration

let ca;
try {
    ca = fs.readFileSync(path.join(__dirname, '..', 'certs', 'ca.pem'));
} catch (err) {
    console.error('Error loading certificate:', err.message);
    process.exit(1);
}

// Database configuration
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

// --- Helpers ---
async function saveToExcel() {
    await saveDataToDatabase();
    const ws = xlsx.utils.json_to_sheet(data);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Jobs');
    xlsx.writeFile(wb, excelPath);
    console.log(` Saved ${data.length} records to: ${excelPath}`);
}

async function closeAds(driver) {
    try {
        const closeBtn = await driver.wait(
            until.elementLocated(
                By.xpath("//span[contains(@class, 'ns-') and text()='Close']")
            ),
            5000
        );
        await closeBtn.click();
        console.log('[INFO] Closed popup ad (Type 1).');
    } catch {}

    try {
        const dismissBtn = await driver.wait(
            until.elementLocated(By.xpath("//div[@id='dismiss-button']")),
            5000
        );
        await dismissBtn.click();
        console.log('[INFO] Closed popup ad (Type 2).');
    } catch {}
}

async function getGoogleMapsData(driver, companyName, location) {
    try {
        await driver.executeScript("window.open('');");
        const tabs = await driver.getAllWindowHandles();
        await driver.switchTo().window(tabs[1]);

        await driver.get(
            `https://www.google.com/maps/search/${companyName} ${location}`
        );

        try {
            await driver.wait(
                until.elementLocated(By.xpath("//h1[@class='DUwDvf lfPIob']")),
                15000
            );
        } catch {
            try {
                const firstResult = await driver.wait(
                    until.elementLocated(
                        By.xpath("(//a[contains(@href, '/place/')])[1]")
                    ),
                    10000
                );
                await firstResult.click();
                await driver.wait(
                    until.elementLocated(
                        By.xpath("//h1[@class='DUwDvf lfPIob']")
                    ),
                    10000
                );
            } catch {
                throw new Error('No results found');
            }
        }

        const nameEl = await driver
            .findElement(By.xpath("//h1[@class='DUwDvf lfPIob']"))
            .catch(() => null);
        const addressEl = await driver
            .findElement(
                By.xpath(
                    "//div[contains(@class,'Io6YTe') and contains(@class, 'fontBodyMedium')]"
                )
            )
            .catch(() => null);
        const websiteEl = await driver
            .findElement(By.xpath("//a[contains(@aria-label, 'Website')]"))
            .catch(() => null);
        const phoneEl = await driver
            .findElement(
                By.xpath(
                    "//div[starts-with(text(), '0') and contains(@class, 'Io6YTe')]"
                )
            )
            .catch(() => null);

        const address = addressEl ? await addressEl.getText() : 'N/A';
        const website = websiteEl
            ? await websiteEl.getAttribute('href')
            : 'N/A';
        const phone = phoneEl ? await phoneEl.getText() : 'N/A';

        return { Address: address, Phone: phone, Website: website };
    } catch (e) {
        console.log(`[Maps] Error for ${companyName}: ${e}`);
        return { Address: 'N/A', Phone: 'N/A', Website: 'N/A' };
    } finally {
        const tabs = await driver.getAllWindowHandles();
        if (tabs.length > 1) {
            await driver.close();
            await driver.switchTo().window(tabs[0]);
        }
    }
}

async function getGSTNumbers(driver, companyName) {
    let gstNumbers = [];
    try {
        await driver.executeScript("window.open('');");
        const tabs = await driver.getAllWindowHandles();
        await driver.switchTo().window(tabs[1]);

        await driver.get('https://findgst.in/gstin-by-name');
        await driver.sleep(2000);
        await closeAds(driver);

        const searchInput = await driver.wait(
            until.elementLocated(By.id('gstnumber')),
            10000
        );
        await searchInput.clear();
        await searchInput.sendKeys(companyName);

        const searchBtn = await driver.findElement(
            By.xpath("//input[@value='Find GST number']")
        );
        await searchBtn.click();
        await driver.sleep(5000);

        const results = await driver.findElements(
            By.xpath(
                "//p[contains(@class, 'yellow') and contains(@class, 'lighten-5')]"
            )
        );
        for (let block of results) {
            const text = await block.getText();
            const matches = text.match(
                /\b\d{2}[A-Z0-9]{10}[1-9A-Z]{1}Z[0-9A-Z]{1}\b/g
            );
            if (matches) gstNumbers.push(...matches);
        }
    } catch (e) {
        console.log(`[GST] Error for ${companyName}: ${e}`);
    } finally {
        const tabs = await driver.getAllWindowHandles();
        if (tabs.length > 1) {
            await driver.close();
            await driver.switchTo().window(tabs[0]);
        }
    }

    gstNumbers = [...new Set(gstNumbers)];
    let gstToSave = 'N/A';

    if (gstNumbers.length) {
        if (!gstTracker[companyName]) gstTracker[companyName] = new Set();
        for (let gst of gstNumbers) {
            if (!gstTracker[companyName].has(gst)) {
                gstToSave = gst;
                gstTracker[companyName].add(gst);
                break;
            }
        }
    }

    return gstToSave;
}

// --- Main Scraping ---
(async () => {
    const driver = await createDriver();
    process.on('SIGINT', async () => {
        console.log('\n Interrupted. Saving data and quitting...');
        saveToExcel();
        await driver.quit();
        process.exit(0);
    });

    try {
        const url = `https://m.timesjobs.com/mobile/jobs-search-result.html?txtKeywords=${industry.replace(/ /g, '+')}&txtLocation=${city.replace(/ /g, '+')}`;
        await driver.get(url);
        await driver.sleep(2000);

        let lastHeight = await driver.executeScript(
            'return document.body.scrollHeight'
        );
        let scrollAttempts = 0;

        while (scrollAttempts < 10) {
            await driver.executeScript('window.scrollBy(0, 1200);');
            await driver.sleep(600);
            await driver.executeScript('window.scrollBy(0, -50);');
            await driver.sleep(600);

            let newHeight = await driver.executeScript(
                'return document.body.scrollHeight'
            );
            if (newHeight === lastHeight) {
                scrollAttempts++;
            } else {
                lastHeight = newHeight;
                scrollAttempts = 0;
            }
        }

        const jobs = await driver.findElements(
            By.xpath("//div[contains(@id, 'liDiv')]")
        );

        for (let job of jobs) {
            try {
                const title = await job
                    .findElement(
                        By.xpath(
                            ".//div[contains(@class, 'srp-job-heading')]/h3/a"
                        )
                    )
                    .getText();
                const company = await job
                    .findElement(By.xpath(".//span[@class='srp-comp-name']"))
                    .getText();
                const location = await job
                    .findElement(By.xpath(".//div[@class='srp-loc']"))
                    .getText();
                const key = `${title}-${company}-${location}`;

                if (!seen.has(key)) {
                    seen.add(key);
                    const selectedLoc = location.split(',')[0].trim();

                    const mapsInfo = await getGoogleMapsData(
                        driver,
                        company,
                        selectedLoc
                    );
                    const gstInfo = await getGSTNumbers(driver, company);

                    data.push({
                        Job_Title: title,
                        Company_Name: company,
                        Location: selectedLoc,
                        ...mapsInfo,
                        'GST Number(s)': gstInfo,
                    });

                    console.log(` ${title} | ${company} | GST: ${gstInfo}`);
                }
            } catch (err) {
                console.log(' Error parsing job:', err.message);
                continue;
            }
        }

        saveToExcel();
    } finally {
        await driver.quit();
        console.log(' Scraping completed and browser closed.');
    }
})();
