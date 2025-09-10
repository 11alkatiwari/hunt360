import { existsSync } from 'fs';
import { join } from 'path';
import XLSX from 'xlsx';
import { config } from '../config/config.js';

export async function saveDataToExcel(data, industry, city) {
    if (!data.length) return;

    const baseFileName = `${industry}_${city}_Foundit.xlsx`;
    let filePath = join(config.downloadsFolder, baseFileName);
    let fileIndex = 1;

    while (existsSync(filePath)) {
        filePath = join(
            config.downloadsFolder,
            `${baseFileName.replace('.xlsx', '')}(${fileIndex}).xlsx`
        );
        fileIndex++;
    }

    const headers = [
        'job_title',
        'company_Name',
        'Location',
        'Address',
        'Phone',
        'Website',
        'GST Number(s)',
    ];
    const rows = data.map((d) => [
        d.job_Title,
        d.company_name,
        d.Location,
        d.Address,
        d.Phone,
        d.Website,
        d['GST Number(s)'],
    ]);
    const worksheetData = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(worksheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Foundit Data');
    XLSX.writeFile(wb, filePath);

    console.log(`Data saved. Records: ${data.length}`);
    console.log(`Saved to: ${filePath}`);
}
