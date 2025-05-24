import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const scrape = (req, res) => {
    const { industry, state, website } = req.body;

    if (!industry || !state || !website) {
        return res
            .status(400)
            .json({ error: 'Industry, state, and website are required.' });
    }

    console.log(
        `Scraping started for industry: ${industry}, state: ${state}, website: ${website}`
    );

    let scriptPath;
    switch (website) {
        case 'naukri':
            scriptPath = path.join(
                __dirname,
                '../scripts',
                'naukri_scraper.js'
            );
            break;
        case 'hirist':
            scriptPath = path.join(
                __dirname,
                '../scripts',
                'hirist_scraper.js'
            );
            break;
        case 'intern':
            scriptPath = path.join(
                __dirname,
                '../scripts',
                'intern_scraper.js'
            );
            break;
        case 'foundit':
            scriptPath = path.join(
                __dirname,
                '../scripts',
                'foundit_scraper.js'
            );
            break;
        case 'glassdoor':
            scriptPath = path.join(
                __dirname,
                '../scripts',
                'glassdoor_scraper.js'
            );
            break;
        case 'shine':
            scriptPath = path.join(__dirname, '../scripts', 'shine_scraper.js');
            break;
        case 'timesjob':
            scriptPath = path.join(
                __dirname,
                '../scripts',
                'timesjob_scraper.js'
            );
            break;
        default:
            return res
                .status(400)
                .json({ error: 'Unsupported website selected.' });
    }

    const nodeProcess = spawn('node', [scriptPath, industry, state]);
    let scrapedData = '';
    let responded = false;

    nodeProcess.stdout.on('data', (data) => {
        scrapedData += data.toString();
        console.log('Raw Node Output:\n', data.toString());
    });

    nodeProcess.stderr.on('data', (data) => {
        console.error(`Node Error: ${data.toString()}`);
    });

    nodeProcess.on('close', async (code) => {
        if (responded) return;

        if (!scrapedData.trim()) {
            responded = true;
            return res.status(500).json({ error: 'No data scraped.' });
        }

        const rows = scrapedData
            .trim()
            .split('\n')
            .map((row) => {
                const match = row.match(
                    /Found:\s*(.+?)\s*->\s*(.+?)\s*->\s*(.+?)\s*->\s*(.+?)\s*->\s*(.+?)\s*->\s*(.+?)\s*->\s*(.+)/
                );
                return match
                    ? [
                          match[1].trim(), // job_title
                          match[2].trim(), // company
                          match[3].trim(), // location
                          match[4].trim(), // address
                          match[5].trim(), // phone
                          match[6].trim(), // website
                          match[7].trim(), // gst_number
                      ]
                    : null;
            })
            .filter(Boolean);

        responded = true;
        res.json({
            message: `Scraping completed and ${rows.length} records saved.`,
            data: rows.map(
                ([
                    job_title,
                    company,
                    location,
                    address,
                    phone,
                    website,
                    gst_number,
                ]) => ({
                    job_title,
                    company,
                    location,
                    address,
                    phone,
                    website,
                    gst_number,
                })
            ),
        });
    });

    nodeProcess.on('error', (err) => {
        console.error(`Failed to start Node script: ${err.message}`);
        if (!responded) {
            responded = true;
            res.status(500).json({ error: 'Failed to execute script' });
        }
    });
};
