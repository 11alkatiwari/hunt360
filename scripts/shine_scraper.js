import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import fs from 'fs-extra';
import path from 'path';
import xlsx from 'xlsx';
import mysql from 'mysql2/promise'; // Use mysql2/promise for async/await
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// === Configuration ===
const industry = process.argv[2] || 'Data Science';
const city = process.argv[3] || 'Mumbai';
const downloadsFolder = path.join(__dirname, 'exports');
if (!fs.existsSync(downloadsFolder)) fs.mkdirSync(downloadsFolder);

const baseName = `${industry}_${city}_Shine_Data`;

// === Generate Unique Excel Filename ===
function getUniqueExcelPath(base) {
    let index = 0;
    let fullPath = path.join(downloadsFolder, `${base}.xlsx`);
    while (fs.existsSync(fullPath)) {
        index++;
        fullPath = path.join(downloadsFolder, `${base}(${index}).xlsx`);
    }
    return fullPath;
}
const filePath = getUniqueExcelPath(baseName);

// === Utility: Save Data to Excel ===
async function saveDataToExcel(data) {
    await saveDataToDatabase(data); // Save to database first
    const ws = xlsx.utils.json_to_sheet(data);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Jobs');
    xlsx.writeFile(wb, filePath);
    console.log(` Saved ${data.length} records to: ${filePath}`);
}

// === Utility: Scrape Google Maps ===
async function getGoogleMapsData(driver, companyName, location) {
    try {
        await driver.executeScript("window.open('');");
        const tabs = await driver.getAllWindowHandles();
        await driver.switchTo().window(tabs[1]);

        const query = encodeURIComponent(`${companyName} ${location}`);
        await driver.get(`https://www.google.com/maps/search/${query}`);
        await driver.sleep(5000);

        // Click the first result if multiple entries appear
        const resultCards = await driver.findElements(By.css('div.Nv2PK'));
        if (resultCards.length > 0) {
            await resultCards[0].click();
            await driver.sleep(5000); // Wait for the detail panel to load
        }

        const name = await driver
            .findElement(By.xpath("//h1[@class='DUwDvf lfPIob']"))
            .getText()
            .catch(() => companyName);
        const address = await driver
            .findElement(
                By.xpath(
                    "//div[contains(@class, 'Io6YTe') and contains(text(), ',')]"
                )
            )
            .getText()
            .catch(() => 'N/A');
        const phone = await driver
            .findElement(
                By.xpath(
                    "//div[contains(@class, 'Io6YTe') and starts-with(text(), '0')]"
                )
            )
            .getText()
            .catch(() => 'N/A');
        const website = await driver
            .findElement(By.xpath("//a[contains(@aria-label, 'Website')]"))
            .getAttribute('href')
            .catch(() => 'N/A');

        await driver.close();
        await driver.switchTo().window(tabs[0]);

        return { name, address, phone, website };
    } catch (err) {
        console.error(`[Maps Error] ${companyName}:`, err);
        try {
            await driver.close();
            const tabs = await driver.getAllWindowHandles();
            await driver.switchTo().window(tabs[0]);
        } catch {}
        return {
            name: companyName,
            address: 'N/A',
            phone: 'N/A',
            website: 'N/A',
        };
    }
}

// === Utility: Scrape GST from findgst.in ===
async function getGSTNumber(driver, companyName) {
    try {
        await driver.executeScript("window.open('');");
        const tabs = await driver.getAllWindowHandles();
        await driver.switchTo().window(tabs[1]);

        await driver.get('https://findgst.in/gstin-by-name');
        await driver.sleep(2000);

        const input = await driver.findElement(By.id('gstnumber'));
        await input.clear();
        await input.sendKeys(companyName);

        const button = await driver.findElement(
            By.xpath("//input[@value='Find GST number']")
        );
        await button.click();
        await driver.sleep(4000);

        const elements = await driver.findElements(
            By.xpath(
                "//p[contains(@class, 'yellow') and contains(@class, 'lighten-5')]"
            )
        );
        for (const el of elements) {
            const text = await el.getText();
            const match = text.match(
                /\b\d{2}[A-Z0-9]{10}[1-9A-Z]{1}Z[0-9A-Z]{1}\b/
            );
            if (match) {
                await driver.close();
                await driver.switchTo().window(tabs[0]);
                return match[0];
            }
        }

        await driver.close();
        await driver.switchTo().window(tabs[0]);
        return 'N/A';
    } catch (err) {
        console.error(`[GST Error] ${companyName}:`, err);
        return 'N/A';
    }
}

// === Main Scraper ===
(async function main() {
    const driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(
            new chrome.Options().addArguments(
                '--incognito',
                '--start-maximized'
            )
        )
        .build();

    let collectedData = [];

    try {
        await driver.get('https://www.shine.com/');
        await driver.sleep(5000);

        const jobInputBox = await driver.findElement(
            By.xpath("//input[@placeholder='Job title, skills']")
        );
        await jobInputBox.click();
        await driver.sleep(1000);

        const jobInput = await driver.findElement(By.id('id_q'));
        await jobInput.clear();
        await jobInput.sendKeys(industry);

        const locationInput = await driver.findElement(By.id('id_loc'));
        await locationInput.clear();
        await locationInput.sendKeys(city);

        const searchBtn = await driver.findElement(
            By.xpath("//button[text()='Search jobs']")
        );
        await searchBtn.click();
        await driver.sleep(5000);

        let nextExists = true;

        while (nextExists) {
            await driver.executeScript(
                'window.scrollTo(0, document.body.scrollHeight)'
            );
            await driver.sleep(3000);

            const jobCards = await driver.findElements(
                By.css('.jobCardNova_bigCard__W2xn3.jdbigCard')
            );

            for (const card of jobCards) {
                try {
                    const title = await card
                        .findElement(By.css("a[href*='/jobs/']"))
                        .getText();
                    const company = await card
                        .findElement(
                            By.xpath(
                                ".//span[contains(@class, 'jobCardNova_bigCardTopTitleName')]"
                            )
                        )
                        .getText();
                    const locElem = await card.findElement(
                        By.xpath(".//div[contains(@class, 'Location')]/span")
                    );
                    const location = await locElem.getText();
                    const cityParsed = location.split(',')[0];

                    console.log(
                        `[INFO] Processing: ${company} @ ${cityParsed}`
                    );

                    // Use the company name to fetch additional info from Google Maps
                    const mapsInfo = await getGoogleMapsData(
                        driver,
                        company,
                        cityParsed
                    );

                    // Get GST number (if available) from findgst.in
                    const gstNumber = await getGSTNumber(driver, company);

                    // Push the collected data into the array
                    collectedData.push({
                        Job_Title: title,
                        Company_Name: company, // Save the company name scraped from Shine
                        Location: cityParsed,
                        Address: mapsInfo.address,
                        Phone: mapsInfo.phone,
                        Website: mapsInfo.website,
                        'GST Number(s)': gstNumber,
                    });
                } catch (e) {
                    console.error(`[Card Error]`, e);
                }
            }

            try {
                const nextBtn = await driver.findElement(
                    By.xpath("//img[@class='paginationNova_rs__MYIE_']")
                );
                await nextBtn.click();
                await driver.sleep(4000);
            } catch {
                nextExists = false;
                console.log(`[INFO] No more pages.`);
            }
        }

        saveDataToExcel(collectedData);
    } catch (err) {
        console.error(`[Fatal Error]:`, err);
    } finally {
        await driver.quit();
    }
})();

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

async function saveDataToDatabase(data) {
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
