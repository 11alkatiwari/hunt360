import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import Card from '../../../components/campus/Card';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_BASE_URL = "https://hunt360-3.onrender.com/api/campus";

const BulkEditing = () => {
  const [recentDataset, setRecentDataset] = useState([]);
  const [missingValues, setMissingValues] = useState({});
  const [cleanedData, setCleanedData] = useState([]);
  const [fileName, setFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const fileInputRef = useRef(null);
  const newFileInputRef = useRef(null);

  // Handle file upload for cleaning
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();

      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = XLSX.utils.sheet_to_json(
          workbook.Sheets[sheetName],
          { defval: '' }
        );

        setRecentDataset(sheet);
        detectMissingValues(sheet);
      };

      reader.readAsArrayBuffer(file);
    }
  };

  // Track file selected for upload
  const handleNewFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    console.log('Selected file:', file.name); // Debug
  }
  setSelectedFile(file || null);
};

  // Detect missing values in dataset
  const detectMissingValues = (dataset) => {
    let missingCounts = {};
    dataset.forEach((row) => {
      Object.keys(row).forEach((column) => {
        if (!row[column] || row[column] === '') {
          missingCounts[column] = (missingCounts[column] || 0) + 1;
        }
      });
    });
    setMissingValues(missingCounts);
  };

  // Clean data by replacing missing values and normalizing text
  const cleanData = () => {
    let cleaned = recentDataset.map((row) => {
      let newRow = { ...row };
      Object.keys(newRow).forEach((column) => {
        const value = newRow[column];

        if (
          value === null ||
          value === undefined ||
          value === '' ||
          value === ' ' ||
          (typeof value === 'string' &&
            (value.toUpperCase() === 'N/A' || value.toUpperCase() === '-'))
        ) {
          newRow[column] = 'NULL';
        } else if (typeof value === 'string') {
          newRow[column] = value.toUpperCase();
        }
      });
      return newRow;
    });

    setCleanedData(cleaned);
    toast.success('✅ Data cleaned successfully! Missing values replaced with NULL.');
  };

  // Download cleaned data
  const downloadCleanedData = () => {
    if (!fileName) {
      toast.error('No file uploaded to clean.');
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(cleanedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Cleaned Data');

    const cleanedFileName = `Clean_${fileName.split('.').slice(0, -1).join('.')}.xlsx`;

    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = cleanedFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    const cleanedFile = new File([blob], cleanedFileName, { type: blob.type });
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(cleanedFile);
    newFileInputRef.current.files = dataTransfer.files;

    setFileName(cleanedFileName);

    setTimeout(() => {
      const event = new Event('change', { bubbles: true });
      newFileInputRef.current.dispatchEvent(event);
    }, 500);
  };

  // Upload file to server
  const uploadFileToServer = async () => {
    if (!selectedFile) {
      toast.error('No file selected for upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      setUploading(true);
      toast.info('📤 Uploading file, please wait...');

      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed! ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      toast.success(`✅ ${result.message}`);
    } catch (error) {
      console.error('❌ Error uploading file:', error);
      toast.error(`❌ Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bulk-data-cleaning-container">
      <ToastContainer />
      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-3 sm:mb-4 md:mb-5">
        Bulk Editing
      </h1>

      <div className="flex flex-col md:flex-row gap-6 p-4">
        {/* File Upload for Cleaning */}
        <Card width="w-full md:w-1/2">
          <h3 className="text-xl font-semibold mb-2">Recent Dataset</h3>
          {fileName ? (
            <p className="text-gray-700 mb-4 break-words">{fileName}</p>
          ) : (
            <p className="text-gray-500 mb-4">No dataset uploaded</p>
          )}
          <input
            type="file"
            accept=".xlsx, .csv"
            onChange={handleFileUpload}
            ref={fileInputRef}
            className="hidden"
            aria-label="Upload recent dataset"
          />
          <button
            onClick={() => fileInputRef.current.click()}
            className="bg-gray-900 shadow-md hover:bg-gray-700 text-white px-4 py-2 rounded transition"
          >
            Select Dataset to Clean
          </button>
        </Card>

        {/* Upload Cleaned/New File */}
        <Card width="w-full md:w-1/2">
          <h3 className="text-xl font-semibold mb-2">Upload New Data</h3>
          <p className="text-gray-600 mb-4">Import CSV, Excel, or connect to your data source</p>
          <input
            type="file"
            accept=".xlsx, .csv"
            ref={newFileInputRef}
            className="hidden"
            onChange={handleNewFileChange}
          />
          <div className="flex gap-4">
            <button
              onClick={() => newFileInputRef.current.click()}
              className="bg-gray-900 shadow-md hover:bg-gray-700 text-white px-4 py-2 rounded transition"
            >
              Choose File
            </button>
            <button
              onClick={uploadFileToServer}
              className={`shadow-md text-white px-4 py-2 rounded transition ${
                selectedFile
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
              disabled={!selectedFile || uploading}
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </Card>
      </div>

      {/* Missing Values */}
      <Card>
        <p className="text-xl font-bold text-gray-600 mb-5">Issue Categories</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Object.entries(missingValues).map(([column, count]) => (
            <div key={column} className="text-center p-3 rounded-md shadow-sm">
              <div className="text-lg font-semibold text-gray-700">{column}</div>
              <div className="text-sm text-red-600">{count} Missing values</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Buttons */}
      <div className="bottom-buttons flex gap-4 m-5">
        <button
          className="start-cleaning shadow-md bg-gray-900 hover:bg-gray-700 text-white px-4 py-2 rounded"
          onClick={cleanData}
        >
          Start New Cleaning Job
        </button>

        {cleanedData.length > 0 && (
          <button
            className="download-data shadow-md bg-blue-900 hover:bg-blue-700 text-white px-4 py-2 rounded"
            onClick={downloadCleanedData}
          >
            Download Cleaned Data
          </button>
        )}
      </div>

      {/* Cleaned Data Table */}
      {cleanedData.length > 0 && (
        <Card className="mt-5">
          <div className="cleaning-tools m-5">
            <h2 className="text-xl font-semibold mb-4">Cleaned Data</h2>
            <div className="table-container overflow-auto">
              <table className="min-w-full border border-gray-300 table-auto">
                <thead className="bg-gray-100">
                  <tr>
                    {Object.keys(cleanedData[0]).map((col) => (
                      <th
                        key={col}
                        className="px-4 py-2 border-b text-left whitespace-nowrap"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cleanedData.map((row, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                    >
                      {Object.keys(cleanedData[0]).map((col) => (
                        <td
                          key={col}
                          className="px-4 py-2 border-b whitespace-nowrap"
                        >
                          {row[col]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default BulkEditing;
