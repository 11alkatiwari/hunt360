import xlsx from 'xlsx';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import db from '../config/database.js';
import ExcelJS from 'exceljs';
import puppeteer from 'puppeteer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- FILE & DATABASE OPERATIONS ---

export const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        if (sheetData.length === 0) {
            return res.status(400).json({ error: 'Empty file uploaded' });
        }

        const insertQuery =
            'INSERT INTO new_table (File, College_Name, State, District, Course, Anual_fees, Placement_fees, Ranking, Address, Phone) VALUES ?';
        const values = sheetData.map((row) => [
            row['File'] || req.file.originalname,
            row['College Name'] || '',
            row['State'] || '',
            row['District'] || '',
            row['Course'] || '',
            row['Anual_fees'] || null,
            row['Placement_fees'] || null,
            row['Ranking'] || null,
            row['Address'] || '',
            row['Phone'] || '',
        ]);

        const [result] = await db.query(insertQuery, [values]);
        res.json({
            message: `Uploaded ${result.affectedRows} records successfully`,
        });
    } catch (error) {
        console.error('Error processing file or inserting into database:', error.message, error.sqlMessage || '');
        res.status(500).json({
            error: 'Failed to process the uploaded file or insert data',
            details: error.message,
        });
    }
};

export const openFile = async (req, res) => {
    const { fileName } = req.query;

    if (!fileName) {
        return res.status(400).json({ error: 'Filename is required' });
    }

    const filePath = path.join(__dirname, '../scripts/exports', fileName);

    try {
        await fs.access(filePath);
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
        res.json({ results: sheetData });
    } catch (err) {
        console.error('Error reading Excel file:', err);
        res.status(err.code === 'ENOENT' ? 404 : 500).json({
            error:
                err.code === 'ENOENT'
                    ? 'File not found'
                    : 'Failed to read Excel file',
            details: err.message,
        });
    }
};

export const searchColleges = async (req, res) => {
    const { college, location, course } = req.query;

    try {
        let query = 'SELECT * FROM new_table WHERE 1=1';
        let values = [];

        if (college) {
            query += ' AND College_Name LIKE ?';
            values.push(`%${college}%`);
        }

        if (location) {
            const locations = location.split(',').map(loc => loc.trim());
            const placeholders = locations
                .map(() => '(State LIKE ? OR District LIKE ?)')
                .join(' OR ');
            query += ` AND (${placeholders})`;
            locations.forEach((loc) => {
                values.push(`%${loc}%`, `%${loc}%`);
            });
        }

        if (course) {
            const courses = course.split(',').map(c => c.trim());
            const placeholders = courses
                .map(() => '(Course LIKE ?)')
                .join(' OR ');
            query += ` AND (${placeholders})`;
            courses.forEach((c) => {
                values.push(`%${c}%`);
            });
        }

        console.log('Executing query:', query);
        console.log('With values:', values);

        const [results] = await db.query(query, values);
        res.json(results);
    } catch (err) {
        console.error('MySQL Search Error:', err);
        res.status(500).json({ error: err.message });
    }
};

export const addCollege = async (req, res) => {
    const data = req.body;

    const insertQuery = `
        INSERT INTO new_table (
            College_Name, State, District, Course,
            Anual_fees, Placement_fees, Ranking,
            Address, Phone
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;

    const selectQuery = `SELECT * FROM new_table WHERE Clg_ID = LAST_INSERT_ID();`;

    try {
        await db.query(insertQuery, [
            data.College_Name,
            data.State,
            data.District,
            data.Course,
            data.Anual_fees,
            data.Placement_fees,
            data.Ranking,
            data.Address,
            data.Phone,
        ]);

        const [result] = await db.query(selectQuery);
        res.status(200).json(result[0]);
    } catch (err) {
        console.error('Insert Error:', err);
        res.status(500).json({ error: 'Insert failed' });
    }
};

export const updateCollege = async (req, res) => {
    const collegeId = Number(req.params.id);

    if (isNaN(collegeId)) {
        return res
            .status(400)
            .json({ error: 'Invalid college ID. It must be a number.' });
    }
    
    console.log('Received data for update:', req.body);
    const updatedData = req.body;

    // CORRECTED: The order of columns in SET now matches the values array.
    const updateQuery = `
        UPDATE new_table
        SET
            College_Name = ?, 
            State = ?, 
            District = ?, 
            Course = ?, 
            Anual_fees = ?, 
            Placement_fees = ?, 
            Ranking = ?, 
            Address = ?, 
            Phone = ?, 
            Update_timestamp = ?, 
            Director_name = ?, 
            Director_number = ?, 
            Director_email = ?, 
            Placement_coor_name = ?, 
            Placement_coor_contact = ?, 
            Placement_coor_email = ?, 
            Data_updated_by_name = ?, 
            Marketing_team_name = ?, 
            Hiring = ?, 
            Hiring_from_consultant = ?, 
            Final_outcome = ?, 
            Send_proposal = ?, 
            Spoke_for_placement = ?, 
            Resume_received = ?, 
            Interview_status = ?, 
            Total_num_candidates = ?, 
            Placed_candidates = ?, 
            Total_num_students = ?, 
            Hired_students = ?, 
            Hr_team_name = ?, 
            Total_payment = ?, 
            Payment_received = ?, 
            Replacement_period = ?, 
            Term = ?, 
            Date_of_Contact = ?, 
            Date_of_Next_Contact = ?, 
            Placed_on_Year = ?, 
            Placed_on_Month = ?
        WHERE Clg_ID = ?`;

    try {
        // CORRECTED: The order of values now matches the updated query string.
        const values = [
            updatedData.College_Name,
            updatedData.State,
            updatedData.District,
            updatedData.Course,
            updatedData.Anual_fees,
            updatedData.Placement_fees,
            updatedData.Ranking,
            updatedData.Address,
            updatedData.Phone,
            new Date().toISOString().slice(0, 19).replace('T', ' '),
            updatedData.Director_name,
            updatedData.Director_number,
            updatedData.Director_email,
            updatedData.Placement_coor_name,
            updatedData.Placement_coor_contact,
            updatedData.Placement_coor_email,
            updatedData.Data_updated_by_name,
            updatedData.Marketing_team_name,
            updatedData.Hiring,
            updatedData.Hiring_from_consultant,
            updatedData.Final_outcome,
            updatedData.Send_proposal,
            updatedData.Spoke_for_placement,
            updatedData.Resume_received,
            updatedData.Interview_status,
            updatedData.Total_num_candidates,
            updatedData.Placed_candidates,
            updatedData.Total_num_students,
            updatedData.Hired_students,
            updatedData.Hr_team_name,
            updatedData.Total_payment,
            updatedData.Payment_received,
            updatedData.Replacement_period,
            updatedData.Term,
            updatedData.Date_of_Contact,
            updatedData.Date_of_Next_Contact,
            updatedData.Placed_on_Year,
            updatedData.Placed_on_Month,
            collegeId,
        ];

        const [result] = await db.query(updateQuery, values);
        if (result.affectedRows > 0) {
            res.json({ message: 'Data updated successfully' });
        } else {
            res.status(404).json({
                message: 'No record found with that ID to update.',
            });
        }
    } catch (err) {
        console.error('MySQL Update Error:', err);
        res.status(500).json({ error: 'Database update failed', details: err.message });
    }
};

export const deleteCollege = async (req, res) => {
    const collegeId = req.params.id;

    try {
        const deleteQuery = `DELETE FROM new_table WHERE Clg_ID = ?`;
        const [result] = await db.query(deleteQuery, [collegeId]);
        if (result.affectedRows > 0) {
            res.json({ message: 'Data deleted successfully' });
        } else {
            res.status(404).json({
                message: 'College not found or already deleted',
            });
        }
    } catch (err) {
        console.error('MySQL Delete Error:', err);
        res.status(500).json({ error: 'Database delete failed' });
    }
};

// --- DASHBOARD & ANALYTICS ---

export const getCollegeCount = async (req, res) => {
    const { year, month, state, district, course } = req.query;

    try {
        let query = 'SELECT COUNT(*) AS total FROM new_table WHERE 1=1';
        const params = [];

        if (year) {
            query += ' AND Placed_on_Year = ?';
            params.push(year);
        }
        if (month) {
            query += ' AND Placed_on_Month = ?';
            params.push(month);
        }
        if (state) {
            query += ' AND state = ?';
            params.push(state);
        }
        if (district) {
            query += ' AND district = ?';
            params.push(district);
        }
        if (course) {
            query += ' AND course = ?';
            params.push(course);
        }

        const [results] = await db.query(query, params);
        res.json(results[0]);
    } catch (err) {
        console.error('MySQL Query Error:', err);
        res.status(500).json({ error: err.message });
    }
};

export const getTotalCandidates = async (req, res) => {
    const { year, month, state, district, course } = req.query;

    try {
        let query =
            'SELECT SUM(Total_num_candidates) AS total_candidates FROM new_table WHERE 1=1';
        const params = [];

        if (year) {
            query += ' AND Placed_on_Year = ?';
            params.push(year);
        }
        if (month) {
            query += ' AND Placed_on_Month = ?';
            params.push(month);
        }
        if (state) {
            query += ' AND state = ?';
            params.push(state);
        }
        if (district) {
            query += ' AND district = ?';
            params.push(district);
        }
        if (course) {
            query += ' AND course = ?';
            params.push(course);
        }

        const [results] = await db.query(query, params);
        res.json(results[0]);
    } catch (err) {
        console.error('MySQL Query Error:', err);
        res.status(500).json({ error: err.message });
    }
};

export const getPlacedCandidates = async (req, res) => {
    const { year, month, state, district, course } = req.query;

    try {
        let query =
            'SELECT SUM(Placed_candidates) AS total_candidates FROM new_table WHERE 1=1';
        const params = [];

        if (year) {
            query += ' AND Placed_on_Year = ?';
            params.push(year);
        }
        if (month) {
            query += ' AND Placed_on_Month = ?';
            params.push(month);
        }
        if (state) {
            query += ' AND state = ?';
            params.push(state);
        }
        if (district) {
            query += ' AND district = ?';
            params.push(district);
        }
        if (course) {
            query += ' AND course = ?';
            params.push(course);
        }

        const [results] = await db.query(query, params);
        res.json(results[0]);
    } catch (err) {
        console.error('MySQL Query Error:', err);
        res.status(500).json({ error: err.message });
    }
};

export const getPaymentReceived = async (req, res) => {
    const { year, month, state, district, course } = req.query;

    try {
        let query =
            "SELECT SUM(CAST(Total_payment AS UNSIGNED)) AS total_payment FROM new_table WHERE Payment_received = 'yes'";
        const params = [];

        if (year) {
            query += ' AND Placed_on_Year = ?';
            params.push(year);
        }
        if (month) {
            query += ' AND Placed_on_Month = ?';
            params.push(month);
        }
        if (state) {
            query += ' AND state = ?';
            params.push(state);
        }
        if (district) {
            query += ' AND district = ?';
            params.push(district);
        }
        if (course) {
            query += ' AND course = ?';
            params.push(course);
        }

        const [results] = await db.query(query, params);
        res.json(results[0]);
    } catch (err) {
        console.error('MySQL Query Error:', err);
        res.status(500).json({ error: err.message });
    }
};

export const getChartData = async (req, res) => {
    const { year, month, state, district, course } = req.query;

    try {
        let query =
            'SELECT Course, SUM(Placed_candidates) AS total_placed FROM new_table WHERE 1=1';
        let values = [];

        if (year) {
            query += ' AND Placed_on_Year = ?';
            values.push(year);
        }
        if (month) {
            query += ' AND Placed_on_Month = ?';
            values.push(month);
        }
        if (state) {
            query += ' AND State = ?';
            values.push(state);
        }
        if (district) {
            query += ' AND District = ?';
            values.push(district);
        }
        if (course) {
            query += ' AND Course = ?';
            values.push(course);
        }

        query += ' GROUP BY Course';

        const [results] = await db.query(query, values);
        const chartData = results.map((row) => ({
            course: row.Course,
            total_placed:
                row.total_placed === null ? 0 : parseInt(row.total_placed, 10),
        }));

        res.json({ chartData });
    } catch (err) {
        console.error('MySQL Chart Data Error (Placed Students):', err);
        res.status(500).json({ error: err.message });
    }
};

// --- SCRAPING OPERATIONS ---

export const scrapeData = (req, res) => {
    const { state, city, stream } = req.body;

    if (!state || !city) {
        return res.status(400).json({ error: 'State and City are required.' });
    }

    const isFullSearch = state && city && stream;
    const scriptToRun = isFullSearch
        ? '../scripts/clgd_scrap.js'
        : '../scripts/scrape.js';
    const scriptArgs = isFullSearch ? [state, city, stream] : [state, city];
    const scriptPath = path.resolve(__dirname, scriptToRun);

    console.log(
        `Running script: ${scriptPath} with args: ${scriptArgs.join(', ')}`
    );

    const jsProcess = spawn('node', [scriptPath, ...scriptArgs]);

    let dataBuffer = '';
    let generatedFileName = null;

    jsProcess.stdout.on('data', (data) => {
        const output = data.toString();
        console.log(`Output: ${output}`);
        dataBuffer += output;

        const match = output.match(/Saving data to:\s*(.*\.xlsx)/);
        if (match && match[1]) {
            generatedFileName = match[1].trim();
            console.log(`File detected: ${generatedFileName}`);
        }
    });

    jsProcess.stderr.on('data', (data) => {
        console.error(`Error: ${data.toString()}`);
    });

    jsProcess.on('close', (code) => {
        console.log(`Script exited with code ${code}`);
        res.status(200).json({
            message: 'Scraping completed',
            data: dataBuffer.trim(),
            fileName: generatedFileName,
        });
    });

    jsProcess.on('error', (err) => {
        console.error(`Failed to run script: ${err.message}`);
        res.status(500).json({ error: 'Failed to execute script' });
    });
};
