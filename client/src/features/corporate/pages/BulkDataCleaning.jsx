import React, { useState, useEffect } from 'react';

const baseURL = 'https://hunt360-3.onrender.com/api/corporate';

const BulkDataCleaning = () => {
    const [file, setFile] = useState(null);
    const [stats, setStats] = useState({
        total: 0,
        missing: {
            company_name: 0,
            location: 0,
            job_title: 0,
            address: 0,
            phone_number: 0,
            website_link: 0,
        },
        duplicates: 0,
    });

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) {
            alert("Please select a file to upload.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch(`${baseURL}/upload`, {
                method: "POST",
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const result = await response.json();
            if (result.error) {
                throw new Error(result.error);
            }

            alert(result.message);
            await fetchStats();
            setFile(null);
            document.getElementById("fileInput").value = "";
        } catch (error) {
            console.error("Upload error:", error.message);
            alert(`Error uploading file: ${error.message}`);
        }
    };

    const handleCleanDuplicates = async () => {
        try {
            const response = await fetch(`${baseURL}/clean-duplicates`, {
                method: 'DELETE',
            });

            const result = await response.json();
            alert(result.message);
            fetchStats();
        } catch (error) {
            console.error('Error cleaning duplicates:', error);
            alert('Failed to clean duplicates.');
        }
    };

    const fetchStats = async () => {
        try {
            const response = await fetch(`${baseURL}/data-stats`);
            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.error('Failed to fetch stats', error);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    // responsive tailwind css
    return (
        <div className="p-4 sm:p-6 md:p-8 bg-[#ede7f6] rounded-[12px] min-h-screen">
            {/* Top Cards */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 mb-4 sm:mb-5">
                <div className="rounded-[12px] p-4 sm:p-5 shadow-md flex-1 bg-[#fff]">
                    <h3 className="text-[#4A148C] text-base sm:text-lg font-semibold mb-2">
                        Processing Dataset
                    </h3>
                    <p className="text-xs sm:text-sm mb-2">
                        Clean duplicate records
                    </p>
                    <button
                        className="bg-[#6A1B9A] hover:opacity-90 cursor-pointer rounded-md text-white border-none px-4 sm:px-5 py-2 sm:py-2 mt-2 sm:mt-3 w-full text-sm sm:text-base"
                        onClick={handleCleanDuplicates}
                    >
                        Clean Now
                    </button>
                </div>
                <div className="rounded-[12px] p-4 sm:p-5 shadow-md flex-1 bg-[#fff]">
                    <h3 className="text-[#4A148C] text-base sm:text-lg font-semibold mb-2">
                        Upload New Data
                    </h3>
                    <p className="text-xs sm:text-sm mb-2">
                        {file
                            ? `Selected file: ${file.name}`
                            : 'Import CSV, Excel or connect to your data source'}
                    </p>
                    <button
                        className="bg-[#6A1B9A] hover:opacity-90 cursor-pointer rounded-md text-white border-none px-4 sm:px-5 py-2 sm:py-2 mt-2 sm:mt-3 w-full text-sm sm:text-base"
                        onClick={() =>
                            document.getElementById('fileInput').click()
                        }
                    >
                        Choose File
                    </button>
                    <input
                        type="file"
                        id="fileInput"
                        accept=".csv, .xlsx, .xls"
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                    />
                    <button
                        className="bg-[#6A1B9A] hover:opacity-90 cursor-pointer rounded-md text-white border-none px-4 sm:px-5 py-2 sm:py-2 mt-2 sm:mt-3 w-full text-sm sm:text-base"
                        onClick={handleUpload}
                    >
                        Upload
                    </button>
                </div>
                <div className="rounded-[12px] p-4 sm:p-5 shadow-md flex-1 bg-[#fff]">
                    <h3 className="text-[#4A148C] text-base sm:text-lg font-semibold mb-2">
                        Missing Records
                    </h3>
                    <p className="text-xs sm:text-sm mb-2">
                        Refresh Issue Categories records
                    </p>
                    <button
                        className="bg-[#6A1B9A] hover:opacity-90 cursor-pointer rounded-md text-white border-none px-4 sm:px-5 py-2 sm:py-2 mt-2 sm:mt-3 w-full text-sm sm:text-base"
                        onClick={fetchStats}
                    >
                        Refresh Data
                    </button>
                </div>
            </div>
            <div className="p-3 sm:p-4 md:p-5 rounded-[12px] shadow-md mb-4 sm:mb-5 bg-[#fff]">
                <h2 className="text-[#4A148C] text-lg sm:text-xl font-semibold mb-2">
                    Issue Categories
                </h2>
                <ul className="list-none p-0 m-0 text-sm sm:text-base">
                    <li className="py-2 border-b border-[#eee]">
                        <strong>Total Records</strong> - {stats.total || 0}
                    </li>
                    <li className="py-2 border-b border-[#eee]">
                        <strong>Duplicate Records</strong> -{' '}
                        {stats.duplicates || 0}
                    </li>
                    <li className="py-2 border-b border-[#eee]">
                        <strong>Missing Fields:</strong>
                    </li>
                    <ul className="ml-4 sm:ml-5">
                        <li className="py-2 border-b border-[#eee]">
                            Company Name - {stats.missing.company_name || 0}
                        </li>
                        <li className="py-2 border-b border-[#eee]">
                            Location - {stats.missing.location || 0}
                        </li>
                        <li className="py-2 border-b border-[#eee]">
                            Job Title - {stats.missing.job_title || 0}
                        </li>
                        <li className="py-2 border-b border-[#eee]">
                            Address - {stats.missing.address || 0}
                        </li>
                        <li className="py-2 border-b border-[#eee]">
                            Phone Number - {stats.missing.phone_number || 0}
                        </li>
                        <li className="py-2 border-b border-[#eee]">
                            Website Link - {stats.missing.website_link || 0}
                        </li>
                    </ul>
                </ul>
            </div>
        </div>
    );
};

export default BulkDataCleaning;
