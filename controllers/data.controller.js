import multer from 'multer';
import xlsx from 'xlsx';
import db from '../config/database.js';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

export const uploadFile = [
  upload.single('file'),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

        try {
      const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

      if (sheetData.length === 0) {
        return res.status(400).json({ message: "Empty file uploaded" });
      }

const insertQuery = `
        INSERT INTO scraped_data (
          company_name, location, address, phone_number, website_link, job_title, gst_number, post_date
        ) VALUES ?
      `;

      const parseDate = (dateStr) => {
        if (!dateStr || dateStr === "") return null;
        const date = new Date(dateStr);
        return isNaN(date.getTime()) ? null : date.toISOString().split('T')[0];
      };

      const values = sheetData.map((row) => [
        row["Company_Name"] || null,
        row.Location ? row.Location.split(",")[0].trim() : null,
        row["Address"] || null,
        row["Phone"] || null,
        row["Website"] || null,
        row["Job_Title"] || null,
        row["GST Number(s)"] ? row["GST Number(s)"].split(",")[0].trim() : null,
        parseDate(row["Post Date"]),
      ]);


            const [result] = await db.query(insertQuery, [values]);
      return res.json({
        message: `Uploaded ${result.affectedRows} records successfully`,
      }); } catch (error) {
      console.error("Error processing file:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        code: error.code,
        errno: error.errno,
        sqlState: error.sqlState,
        sqlMessage: error.sqlMessage
      });
      return res.status(500).json({ message: "Failed to process the uploaded file", error: error.message });
    }
    },
];

export const cleanDuplicates = async (req, res) => {
    try {
        const deleteQuery = `
      DELETE t1 FROM scraped_data t1
      INNER JOIN scraped_data t2 
      ON t1.company_name = t2.company_name 
      AND t1.location = t2.location
      WHERE t1.id > t2.id
    `;
        const [result] = await db.query(deleteQuery);
        res.json({
            message: `Removed ${result.affectedRows} duplicate records successfully`,
        });
    } catch (err) {
        console.error('Deduplication error:', err);
        res.status(500).json({ error: 'Failed to remove duplicates' });
    }
};

export const getDataStats = async (req, res) => {
    try {
        const [totalResult] = await db.query(
            'SELECT COUNT(*) AS total FROM scraped_data'
        );
        const stats = { total: totalResult[0].total };

        const [missingResult] = await db.query(`
      SELECT 
        COUNT(*) AS total,
        SUM(company_name IS NULL OR company_name = '' OR company_name IN ('N/A','-')) AS company_name,
        SUM(location IS NULL OR location = '' OR location IN ('N/A','-')) AS location,
        SUM(job_title IS NULL OR job_title = '' OR job_title IN ('N/A','-')) AS job_title,
        SUM(address IS NULL OR address = '' OR address IN ('N/A','-')) AS address,
        SUM(phone_number IS NULL OR phone_number = '' OR phone_number IN ('N/A','-')) AS phone_number,
        SUM(website_link IS NULL OR website_link = '' OR website_link IN ('N/A','-')) AS website_link
      FROM scraped_data
    `);

        stats.missing = {
            company_name: missingResult[0].company_name,
            location: missingResult[0].location,
            job_title: missingResult[0].job_title,
            address: missingResult[0].address,
            phone_number: missingResult[0].phone_number,
            website_link: missingResult[0].website_link,
        };

        const [dupResult] = await db.query(`
      SELECT SUM(dupe_count - 1) AS duplicates FROM (
        SELECT COUNT(*) AS dupe_count
        FROM scraped_data
        GROUP BY TRIM(LOWER(company_name)), TRIM(LOWER(location))
        HAVING COUNT(*) > 1
      ) AS dup
    `);

        stats.duplicates = dupResult[0].duplicates;
        res.json(stats);
    } catch (err) {
        console.error('Stats error:', err);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
};

export const getPreviousScrapes = async (req, res) => {
    try {
        const [results] = await db.query(`
      SELECT job_title, company_name, location 
      FROM scraped_data 
      ORDER BY id DESC 
      LIMIT 10
    `);
        res.json(results);
    } catch (err) {
        console.error('Fetch error:', err);
        res.status(500).json({
            error: 'Failed to fetch previous scraped data',
        });
    }
};

export const searchCompanies = async (req, res) => {
    const {
        name = '',
        city = '',
        updated = '',
        page = 1,
        limit = 10,
    } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let baseQuery = 'FROM scraped_data WHERE 1=1';
    const values = [];

    if (name) {
        baseQuery += ' AND LOWER(company_name) LIKE ?';
        values.push(`%${name.toLowerCase()}%`);
    }

    if (city) {
        baseQuery += ' AND LOWER(location) LIKE ?';
        values.push(`%${city.toLowerCase()}%`);
    }

    if (updated.toLowerCase() === 'yes') {
        baseQuery += " AND updated = 'yes'";
    } else if (updated.toLowerCase() === 'no') {
        baseQuery += " AND (updated = 'no' OR updated IS NULL)";
    }

    try {
        const [data] = await db.query(
            `SELECT *, updated_at ${baseQuery} LIMIT ? OFFSET ?`,
            [...values, parseInt(limit), offset]
        );
        const [count] = await db.query(
            `SELECT COUNT(*) AS total ${baseQuery}`,
            values
        );
        const total = count[0].total;
        res.json({
            data,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            limit: parseInt(limit),
        });
    } catch (err) {
        console.error('Search error:', err);
        res.status(500).json({ error: 'Search failed' });
    }
};

export const searchMarketingData = async (req, res) => {
    try {
        const { name = "", city = "", communication_status = "", lead_status = "", bd_name = "", page = 1, limit = 10 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        let baseQuery = "FROM scraped_data WHERE updated = 'yes'";
        const values = [];

        if (name) {
            baseQuery += " AND LOWER(company_name) LIKE ?";
            values.push(`%${name.toLowerCase()}%`);
        }

        if (city) {
            baseQuery += " AND LOWER(location) LIKE ?";
            values.push(`%${city.toLowerCase()}%`);
        }

        if (communication_status) {
            baseQuery += " AND communication_status = ?";
            values.push(communication_status);
        }

        if (lead_status) {
            baseQuery += " AND lead_status = ?";
            values.push(lead_status);
        }

        if (bd_name) {
            baseQuery += " AND LOWER(bd_name) LIKE ?";
            values.push(`%${bd_name.toLowerCase()}%`);
        }

        const dataQuery = `SELECT * ${baseQuery} LIMIT ? OFFSET ?`;
        const countQuery = `SELECT COUNT(*) AS total ${baseQuery}`;
        const dataParams = [...values, parseInt(limit), offset];

        const [results] = await db.query(dataQuery, dataParams);
        const [countResult] = await db.query(countQuery, values);

        const total = countResult[0].total;
        const totalPages = Math.ceil(total / parseInt(limit));

        res.json({
            data: results,
            total,
            totalPages,
            currentPage: parseInt(page),
            limit: parseInt(limit),
        });
    } catch (error) {
        console.error("Search marketing data error:", error);
        res.status(500).json({ error: "Search failed" });
    }
};

export const saveForm = async (req, res) => {
    try {
        const {
            id, company_name, contact_person_name, mobile, email, location, state, country,
            pincode, gst_number, bd_name, phone_number, industry, sub_industry, website_link,
            updated, communication_status, notes, meeting_date, lead_status, post_date, address
        } = req.body;

        if (!id) {
            return res.status(400).json({ error: "Missing company ID" });
        }

        const parseDate = (dateStr) => {
            if (!dateStr || dateStr === "") return null;
            const date = new Date(dateStr);
            return isNaN(date.getTime()) ? null : date.toISOString().split('T')[0];
        };

        let formattedMeetingDate = parseDate(meeting_date);
        let formattedPostDate = parseDate(post_date);

        const updateQuery = `
        UPDATE scraped_data SET
          company_name = ?, contact_person_name = ?, mobile = ?, email = ?, location = ?,
          state = ?, country = ?, pincode = ?, gst_number = ?, bd_name = ?, phone_number = ?,
          industry = ?, sub_industry = ?, website_link = ?, updated = ?, communication_status = ?,
          notes = ?, meeting_date = ?, lead_status = ?, post_date = ?, address = ?,
          updated_at = NOW()
        WHERE id = ?
      `;

        const values = [
            company_name, contact_person_name, mobile, email, location, state, country,
            pincode, gst_number, bd_name, phone_number, industry, sub_industry, website_link,
            updated, communication_status, notes, formattedMeetingDate, lead_status, formattedPostDate, address, id
        ];

        const [result] = await db.query(updateQuery, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "No matching record found to update" });
        }

        res.json({ message: "Form data updated successfully!" });
    } catch (error) {
        console.error("Update form error:", error);
        return res.status(500).json({ error: "Failed to update form data" });
    }
};


export const deleteRecord = async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await db.query(
            'DELETE FROM scraped_data WHERE id = ?',
            [id]
        );
        res.status(200).json({ message: 'Record deleted successfully' });
    } catch (err) {
        console.error('Delete error:', err);
        res.status(500).json({ error: 'Failed to delete the record' });
    }
};

export const addCompany = async (req, res) => {
    const { company_name, location, address, phone_number, website_link, job_title, gst_number, post_date } = req.body;

    if (!company_name || !location) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const parseDate = (dateStr) => {
        if (!dateStr || dateStr === "") return null;
        const date = new Date(dateStr);
        return isNaN(date.getTime()) ? null : date.toISOString().split('T')[0];
    };

    const insertQuery = `
      INSERT INTO scraped_data
      (company_name, location, address, phone_number, website_link, job_title, gst_number, updated, created_at, updated_at, post_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'no', NOW(), NOW(), ?)
    `;

    const values = [company_name, location, address, phone_number, website_link, job_title, gst_number, parseDate(post_date)];

    try {
        const [result] = await db.query(insertQuery, values);
        res.json({ message: "Company added successfully!", insertId: result.insertId });
    } catch (error) {
        console.error("Add company error:", error);
        return res.status(500).json({ error: "Failed to add company" });
    }
};
