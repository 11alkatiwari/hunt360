import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const baseURL = 'https://hunt360-3.onrender.com/api/corporate';

const DataScraping = () => {
    const [customIndustry, setCustomIndustry] = useState('');
    const [customCity, setCustomCity] = useState('');
    const [selectedWebsite, setSelectedWebsite] = useState('');
    const [scrapedData, setScrapedData] = useState([]);
    const [logs, setLogs] = useState([]);
    const [finalFile, setFinalFile] = useState('');
    const [isScraping, setIsScraping] = useState(false);

    const navigate = useNavigate();
    const goToDashboard = () => navigate('/');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await axios.get(`${baseURL}/previous-scrapes`);
            setScrapedData(response.data || []);
        } catch (error) {
            console.error('❌ Error fetching previous scrapes:', error);
        }
    };

    const websites = [
        { name: 'Naukri', value: 'naukri' },
        { name: 'Hirist', value: 'hirist' },
        { name: 'Internshala', value: 'intern' },
        { name: 'FoundIt', value: 'foundit' },
        { name: 'Glassdoor', value: 'glassdoor' },
        { name: 'Shine', value: 'shine' },
        { name: 'TimesJob', value: 'timesjob' },
    ];

    const handleScrape = async () => {
        const trimmedIndustry = customIndustry.trim();
        const trimmedCity = customCity.trim();
        const trimmedWebsite = selectedWebsite.trim();

        console.log("Sending payload:", {
        industry: trimmedIndustry,
        city: trimmedCity,
        website: trimmedWebsite,
    });

        setLogs(['⏳ Scraping has started...']);
        setFinalFile('');
        setIsScraping(true);

        try {
            const response = await axios.post(`${baseURL}/scrape`, {
                industry: trimmedIndustry,
                city: trimmedCity,
                website: trimmedWebsite,
            });

            if (response.data.error) throw new Error(response.data.error);

            setScrapedData(response.data.data || []);
            setLogs((prevLogs) => [
                ...prevLogs,
                '✅ Scraping completed successfully!',
            ]);
            if (response.data.fileName) setFinalFile(response.data.fileName);
        } catch (error) {
            const errorData = error.response?.data;
            console.error('❌ Scraping Error:', errorData?.error || error.message);
            if (errorData?.exitCode !== undefined) {
                console.error('Exit Code:', errorData.exitCode);
            }
            if (errorData?.stderr) {
                console.error('Stderr:', errorData.stderr);
            }
            setLogs((prevLogs) => [
                ...prevLogs,
                `❌ Error occurred while scraping: ${errorData?.error || error.message}`,
            ]);
            alert(`Error occurred while scraping: ${errorData?.error || error.message}`);
        }

        setIsScraping(false);
    };

    return (
        <div
            className="min-h-screen px-4 sm:px-6 lg:px-8 py-4 sm:py-0 overflow-y-auto overflow-x-hidden"
            style={{ backgroundColor: '#ede7f6' }}
        >
            <div className="rounded-xl">
                {/* Scraping Configuration */}
                <div
                    className="py-4 sm:py-6 px-6 sm:px-8 rounded-md mb-4 sm:mb-6 shadow mx-4 sm:mx-6 lg:mx-[40px]"
                    style={{
                        backgroundColor: '#e6e0f8',
                        marginTop: '64px',
                        padding: '15px',
                        marginBottom: '20px',
                    }}
                >
                    <h2 className="text-lg sm:text-xl font-bold text-black">
                        Scraping Configuration
                    </h2>
                    <p className="text-xs sm:text-sm text-black">
                        Enter criteria for scraping data.
                    </p>
                </div>

                {/* Content Section */}
                <div
                    className="p-4 sm:p-6 rounded-md border-purple-200 mx-4 sm:mx-6 lg:mx-[40px] bg-[#f3e5f5] shadow-[0_2px_5px_rgba(0,0,0,0.1)]"
                    style={{ padding: '20px' }}
                >
                    <label className="block text-xs sm:text-sm font-bold text-[#4A148C] mb-1">
                        Industry
                    </label>
                    <input
                        type="text"
                        value={customIndustry}
                        onChange={(e) => setCustomIndustry(e.target.value)}
                        placeholder="Enter Industry"
                        className="w-full py-2 sm:py-3 px-3 sm:px-4 border border-[#d3cce3] rounded-md mb-3 sm:mb-4 focus:outline-none focus:ring-2 focus:ring-[#6a0dad] text-base sm:text-lg placeholder:text-base sm:placeholder:text-lg"
                    />

                    <label className="block text-xs sm:text-sm font-bold text-[#4A148C] mb-1">
                        City
                    </label>
                    <input
                        type="text"
                        value={customCity}
                        onChange={(e) => setCustomCity(e.target.value)}
                        placeholder="Enter City"
                        className="w-full py-2 sm:py-3 px-3 sm:px-4 border border-[#d3cce3] rounded-md mb-3 sm:mb-4 focus:outline-none focus:ring-2 focus:ring-[#6a0dad] text-base sm:text-lg placeholder:text-base sm:placeholder:text-lg"
                    />

                    <label className="block text-xs sm:text-sm font-bold text-[#4A148C] mb-1">
                        Website
                    </label>
                    <select
                        value={selectedWebsite}
                        onChange={(e) => setSelectedWebsite(e.target.value)}
                        className="w-full py-2 sm:py-3 px-3 sm:px-4 border border-[#d3cce3] rounded-md mb-3 sm:mb-4  focus:outline-none focus:ring-2 focus:ring-[#6a0dad] appearance-none text-base sm:text-lg"
                        style={{ height: '40px sm:height-[50px]' }}
                    >
                        <option value="">Select a Website</option>
                        {websites.map((website, index) => (
                            <option key={index} value={website.value}>
                                {website.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Button Section */}
                <div className="flex flex-col sm:flex-row justify-center mt-4 sm:mt-6 flex-nowrap mx-4 sm:mx-6 lg:mx-[40px] gap-3 sm:gap-[15px]">
                    <button
                        className="bg-[#6A1B9A] text-white py-2 sm:py-[12px] px-4 sm:px-[20px] rounded-md text-sm sm:text-[16px] hover:opacity-90 cursor-pointer w-full sm:w-auto"
                        onClick={handleScrape}
                        disabled={isScraping}
                    >
                        {isScraping ? ' Scraping...' : ' Start Scraping '}
                    </button>
                    <button
                        className="bg-[#6A1B9A] text-white py-2 sm:py-[12px] px-4 sm:px-[20px] rounded-md text-sm sm:text-[16px] hover:opacity-90 cursor-pointer w-full sm:w-auto"
                        onClick={fetchData}
                    >
                        Previous Scrapes
                    </button>
                    <button
                        className="bg-[#6A1B9A] text-white py-2 sm:py-[12px] px-4 sm:px-[20px] rounded-md text-sm sm:text-[16px] hover:opacity-90 cursor-pointer w-full sm:w-auto"
                        onClick={() => navigate('/dashboard/corporate/')}
                    >
                        Dashboard
                    </button>
                </div>

                {/* Logs Section */}
                <div className="mt-4 sm:mt-6 text-xs sm:text-sm text-gray-800 mx-4 sm:mx-6 lg:mx-[40px]">
                    {logs.length > 0 ? (
                        logs.map((log, index) => <p key={index}>{log}</p>)
                    ) : finalFile ? (
                        <p>
                            Scraped Data Saved: <strong>{finalFile}</strong>
                        </p>
                    ) : (
                        <p>No data available.</p>
                    )}
                </div>

                {/* Previous Scraped Data Section */}
                <div className="mx-4 sm:mx-6 lg:mx-[40px]">
                    <h3 className="text-base sm:text-lg font-semibold mt-6 sm:mt-8 mb-1 sm:mb-2">
                        📌 Previous Scraped Data
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse bg-[#f9f9f9] shadow-md text-xs sm:text-sm font-sans mt-4 sm:mt-5 min-w-[600px]">
                            <thead>
                                <tr className="bg-[#6a0dad]">
                                    <th className="p-2 sm:p-[12px] text-[#ffffff] uppercase text-left border border-[#ddd] text-xs sm:text-sm">
                                        Job Title
                                    </th>
                                    <th className="p-2 sm:p-[12px] text-[#ffffff] uppercase text-left border border-[#ddd] text-xs sm:text-sm">
                                        Company
                                    </th>
                                    <th className="p-2 sm:p-[12px] text-[#ffffff] uppercase text-left border border-[#ddd] text-xs sm:text-sm">
                                        Location
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {scrapedData.length > 0 ? (
                                    scrapedData.map((row, index) => (
                                        <tr
                                            key={index}
                                            className={`${index % 2 === 0 ? 'bg-[#e6e6fa]' : ''} hover:bg-[#dcd0ff] transition duration-300`}
                                        >
                                            <td className="p-2 sm:p-[12px] border border-[#ddd]">
                                                {row.job_title}
                                            </td>
                                            <td className="p-2 sm:p-[12px] border border-[#ddd]">
                                                {row.company_name}
                                            </td>
                                            <td className="p-2 sm:p-[12px] border border-[#ddd]">
                                                {row.location}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="3"
                                            className="text-center p-3 sm:p-4 text-red-600"
                                        >
                                            ⚠️ No previous scrapes available.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DataScraping;
