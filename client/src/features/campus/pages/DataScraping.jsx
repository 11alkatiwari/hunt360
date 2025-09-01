/* eslint-disable no-unused-vars */
import React, { useState, useRef, useCallback, useEffect, memo } from 'react';
import PropTypes from 'prop-types';
import Card from '../../../components/campus/Card';
import * as apiService from '../../../api/campus.js';

const useScrapingForm = () => {
    const [activeTab, setActiveTab] = useState('scrape');
    const [selectedSite, setSelectedSite] = useState('');
    const [customState, setCustomState] = useState('');
    const [customCity, setCustomCity] = useState('');
    const [customStream, setCustomStream] = useState('');
    const fileInputRef = useRef(null);

    const states = [
        'Andhra Pradesh',
        'Arunachal Pradesh',
        'Assam',
        'Bihar',
        'Chhattisgarh',
        'Goa',
        'Gujarat',
        'Haryana',
        'Himachal Pradesh',
        'Jharkhand',
        'Karnataka',
        'Kerala',
        'Madhya Pradesh',
        'Maharashtra',
        'Manipur',
        'Meghalaya',
        'Mizoram',
        'Nagaland',
        'Odisha',
        'Punjab',
        'Rajasgotra',
        'Sikkim',
        'Tamil Nadu',
        'Telangana',
        'Tripura',
        'Uttar Pradesh',
        'Uttarakhand',
        'West Bengal',
        'Andaman and Nicobar Islands',
        'Chandigarh',
        'Dadra and Nagar Haveli and Daman and Diu',
        'Lakshadweep',
        'Delhi',
        'Puducherry',
        'Ladakh',
        'Jammu and Kashmir',
    ];

    const cities = {
        Maharashtra: ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik'],
        Karnataka: ['Bengaluru', 'Mysuru', 'Hubballi', 'Mangaluru'],
        'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli'],
        Telangana: ['Hyderabad', 'Warangal', 'Nizamabad'],
        'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol'],
        Delhi: ['Delhi', 'New Delhi', 'Dwarka'],
        Gujarat: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot'],
        Rajasthan: ['Jaipur', 'Udaipur', 'Jodhpur', 'Kota'],
        'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Meerut'],
        'Madhya Pradesh': ['Bhopal', 'Indore', 'Gwalior', 'Jabalpur'],
        Bihar: ['Patna', 'Gaya', 'Muzaffarpur', 'Bhagalpur'],
        Odisha: ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Puri'],
        Chandigarh: ['Chandigarh', 'Panchkula', 'Mohali'],
        'Himachal Pradesh': ['Shimla', 'Dharamshala', 'Solan'],
        Jharkhand: ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro'],
        Kerala: ['Thiruvananthapuram', 'Kochi', 'Kozhikode'],
        'Arunachal Pradesh': ['Itanagar', 'Tawang'],
        Assam: ['Dispur', 'Guwahati', 'Dibrugarh'],
        Mizoram: ['Aizawl', 'Lunglei'],
        Meghalaya: ['Shillong', 'Tura'],
        Manipur: ['Imphal'],
        Nagaland: ['Kohima', 'Dimapur'],
        Sikkim: ['Gangtok'],
        'Andaman and Nicobar Islands': ['Port Blair', 'South Andamans'],
        Puducherry: ['Puducherry', 'Karaikal'],
        Ladakh: ['Leh', 'Kargil'],
        'Jammu and Kashmir': ['Srinagar', 'Jammu'],
    };

    const streams = [
        'Engineering',
        'Management',
        'Science',
        'Arts',
        'Commerce',
        'BE/B.Tech',
    ];

    const availableCities = customState ? cities[customState] || [] : [];

    const resetForm = useCallback(() => {
        setSelectedSite('');
        setCustomState('');
        setCustomCity('');
        setCustomStream('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    }, []);

    return {
        activeTab,
        setActiveTab,
        selectedSite,
        setSelectedSite,
        customState,
        setCustomState,
        customCity,
        setCustomCity,
        customStream,
        setCustomStream,
        fileInputRef,
        states,
        availableCities,
        streams,
        resetForm,
    };
};

const useScrapingLogic = ({
    selectedSite,
    customState,
    customCity,
    customStream,
    fileInputRef,
    resetForm,
}) => {
    const [scrapedData, setScrapedData] = useState([]);
    const [logs, setLogs] = useState([]);
    const [finalFile, setFinalFile] = useState('');
    const [isScraping, setIsScraping] = useState(false);
    const [files, setFiles] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchFiles = async () => {
            try {
                const data = await apiService.fetchScrapeHistory();
                setFiles(data);
                setError('');
            } catch (err) {
                console.error('Error fetching scrape history:', err);
                setError('Failed to load scrape history');
            }
        };
        fetchFiles();
    }, []);

    const handleScrape = useCallback(async () => {
        if (selectedSite === 'AISHE') {
            if (!customState || !customCity) {
                setError('Please select a state and city.');
                return;
            }
        } else if (selectedSite === 'College Dunia') {
            if (!customState || !customCity || !customStream) {
                setError('Please select a state, city, and stream.');
                return;
            }
        } else {
            setError('Please select a data source.');
            return;
        }

        setLogs(['Scraping has started...']);
        setFinalFile('');
        setIsScraping(true);
        setError('');

        try {
            const data = await apiService.scrapeData({
                site: selectedSite,
                state: customState,
                city: customCity,
                stream: selectedSite === 'College Dunia' ? customStream : undefined,
            });
            setScrapedData(data.results || []);
            if (data.fileName) setFinalFile(data.fileName);
            setLogs((prev) => [...prev, 'Scraping done!']);
            resetForm();
        } catch (err) {
            console.error('Scraping Error:', err.message);
            setLogs((prev) => [
                ...prev,
                'Error occurred while scraping. Please try again.',
            ]);
            setError('Error occurred while scraping. Please try again.');
        } finally {
            setIsScraping(false);
        }
    }, [selectedSite, customState, customCity, customStream, resetForm]);

    const handleUpload = useCallback(async () => {
        if (!fileInputRef.current?.files[0]) {
            setError('Please select a file to upload.');
            return;
        }

        setIsScraping(true);
        setError('');

        try {
            const file = fileInputRef.current.files[0];
            const message = await apiService.uploadFile(file);
            setLogs((prev) => [...prev, message]);
            fileInputRef.current.value = '';
        } catch (err) {
            console.error('Upload Error:', err);
            setError('Failed to upload file.');
        } finally {
            setIsScraping(false);
        }
    }, [fileInputRef]);

    return {
        scrapedData,
        logs,
        finalFile,
        isScraping,
        files,
        error,
        handleScrape,
        handleUpload,
    };
};

const DataScraping = ({ className = '' }) => {
    const {
        activeTab,
        setActiveTab,
        selectedSite,
        setSelectedSite,
        customState,
        setCustomState,
        customCity,
        setCustomCity,
        customStream,
        setCustomStream,
        fileInputRef,
        states,
        availableCities,
        streams,
        resetForm,
    } = useScrapingForm();

    const {
        scrapedData,
        logs,
        finalFile,
        isScraping,
        files,
        error,
        handleScrape,
        handleUpload,
    } = useScrapingLogic({
        selectedSite,
        customState,
        customCity,
        customStream,
        fileInputRef,
        resetForm,
    });

    const handleRefresh = useCallback(() => {
        window.location.reload();
    }, []);

    return (
        <div className={`min-h-screen bg-gray-100 p-6 ${className}`}>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-3 sm:mb-4 md:mb-5">
                Educational Data Scraping
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-gray-500 font-semibold mt-1">
                Gather educational institution data for targeted marketing
                campaigns
            </p>

            {/* Tabs and Refresh */}
            <div className="flex flex-wrap justify-between items-center mt-5 mb-4 gap-3">
                <div className="flex flex-wrap gap-4">
                    <button
                        onClick={() => setActiveTab('scrape')}
                        className={`px-4 py-2 shadow-md rounded-lg transition ${
                            activeTab === 'scrape'
                                ? 'bg-gray-900 text-white hover:bg-gray-700'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        } disabled:opacity-50`}
                        disabled={isScraping}
                        aria-label="Switch to Data Scrape tab"
                    >
                        Data Scrape
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`px-4 py-2 shadow-md rounded-lg transition ${
                            activeTab === 'history'
                                ? 'bg-gray-900 text-white hover:bg-gray-700'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        } disabled:opacity-50`}
                        disabled={isScraping}
                        aria-label="Switch to Scrape History tab"
                    >
                        Scrape History
                    </button>
                </div>
                <button
                    className="px-4 py-2 bg-gray-900 hover:bg-gray-700 text-white rounded-lg shadow-md transition disabled:opacity-50"
                    onClick={handleRefresh}
                    disabled={isScraping}
                    aria-label="Refresh data"
                >
                    🔄 Refresh Data
                </button>
            </div>

            {/* Main Content */}
            <Card className="bg-white shadow-md rounded-2xl p-6 mb-8 w-full">
                <div className="space-y-6">
                    {activeTab === 'scrape' ? (
                        <div>
                            <h2 className="text-xl font-bold text-gray-600 mb-5">
                                Collect educational institution data from
                                various sources
                            </h2>
                            {error && (
                                <p className="text-red-600 mb-4">{error}</p>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label
                                        htmlFor="data-source"
                                        className="block text-xl font-medium text-gray-700 mb-1"
                                    >
                                        Data Source
                                    </label>
                                    <select
                                        id="data-source"
                                        value={selectedSite}
                                        onChange={(e) => {
                                            setSelectedSite(e.target.value);
                                            setCustomState('');
                                            setCustomCity('');
                                            setCustomStream('');
                                        }}
                                        className="mt-1 block w-full h-10 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                                        disabled={isScraping}
                                        aria-describedby={
                                            error
                                                ? 'data-source-error'
                                                : undefined
                                        }
                                    >
                                        <option value="" disabled>
                                            Select a Site
                                        </option>
                                        <option value="AISHE">AISHE</option>
                                        <option value="College Dunia">
                                            College Dunia
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label
                                        htmlFor="state"
                                        className="block text-xl font-medium text-gray-700 mb-1"
                                    >
                                        State
                                    </label>
                                    <select
                                        id="state"
                                        value={customState}
                                        onChange={(e) => {
                                            setCustomState(e.target.value);
                                            setCustomCity('');
                                        }}
                                        className="mt-1 block w-full h-10 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                                        disabled={isScraping}
                                        aria-describedby={
                                            error ? 'state-error' : undefined
                                        }
                                    >
                                        <option value="">Select a State</option>
                                        {states.map((state) => (
                                            <option key={state} value={state}>
                                                {state}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {availableCities.length > 0 && (
                                    <div>
                                        <label
                                            htmlFor="city"
                                            className="block text-xl font-medium text-gray-700 mb-1"
                                        >
                                            City
                                        </label>
                                        <select
                                            id="city"
                                            value={customCity}
                                            onChange={(e) =>
                                                setCustomCity(e.target.value)
                                            }
                                            className="mt-1 block w-full h-10 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                                            disabled={isScraping}
                                            aria-describedby={
                                                error ? 'city-error' : undefined
                                            }
                                        >
                                            <option value="">
                                                Select a City
                                            </option>
                                            {availableCities.map((city) => (
                                                <option key={city} value={city}>
                                                    {city}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {selectedSite === 'College Dunia' && (
                                    <div>
                                        <label
                                            htmlFor="stream"
                                            className="block text-xl font-medium text-gray-700 mb-1"
                                        >
                                            Stream
                                        </label>
                                        <select
                                            id="stream"
                                            value={customStream}
                                            onChange={(e) =>
                                                setCustomStream(e.target.value)
                                            }
                                            className="mt-1 block w-full h-10 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                                            disabled={isScraping}
                                            aria-describedby={
                                                error
                                                    ? 'stream-error'
                                                    : undefined
                                            }
                                        >
                                            <option value="">
                                                Select Stream
                                            </option>
                                            {streams.map((stream) => (
                                                <option
                                                    key={stream}
                                                    value={stream}
                                                >
                                                    {stream}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 flex flex-wrap gap-4">
                                <button
                                    onClick={handleScrape}
                                    className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition disabled:opacity-50"
                                    disabled={isScraping}
                                    aria-label="Start scraping"
                                >
                                    {isScraping
                                        ? 'Scraping...'
                                        : 'Start Scraping'}
                                </button>
                                <div>
                                    <label
                                        htmlFor="file-upload"
                                        className="block text-xl font-medium text-gray-700 mb-1"
                                    >
                                        Upload File
                                    </label>
                                    <input
                                        id="file-upload"
                                        type="file"
                                        ref={fileInputRef}
                                        className="mt-1 block w-full border border-gray-300 rounded-md"
                                        disabled={isScraping}
                                        aria-describedby={
                                            error
                                                ? 'file-upload-error'
                                                : undefined
                                        }
                                    />
                                    <button
                                        onClick={handleUpload}
                                        className="mt-2 px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition disabled:opacity-50"
                                        disabled={isScraping}
                                        aria-label="Upload file"
                                    >
                                        {isScraping
                                            ? 'Uploading...'
                                            : 'Upload File'}
                                    </button>
                                </div>
                            </div>

                            {logs.length > 0 && (
                                <div className="mt-6">
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                        Logs
                                    </h3>
                                    <ul className="space-y-2">
                                        {logs.map((log, index) => (
                                            <li
                                                key={index}
                                                className="text-gray-600"
                                            >
                                                {log}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div>
                            <h2 className="text-2xl font-semibold mb-2">
                                Scrape History
                            </h2>
                            <p className="text-gray-700 mb-4">
                                View previously scraped data
                            </p>
                            {error ? (
                                <p className="text-red-600">{error}</p>
                            ) : files.length === 0 ? (
                                <p className="text-gray-500">
                                    No scrape history available.
                                </p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full border border-gray-300 rounded-lg text-left">
                                        <thead className="bg-gray-100">
                                            <tr>
                                                <th className="px-4 py-2 border-b border-gray-300">
                                                    File Name
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {files.map((item, idx) => (
                                                <tr
                                                    key={idx}
                                                    className={
                                                        idx % 2 === 0
                                                            ? 'bg-white'
                                                            : 'bg-gray-50'
                                                    }
                                                >
                                                    <td className="px-4 py-2 border-b border-gray-300">
                                                        {item.File}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </Card>

            {/* Latest Scraped File */}
            <Card className="mt-5 p-6 bg-white shadow-md rounded-2xl">
                <h2 className="text-xl font-bold text-gray-600 mb-5">
                    Latest Scraped File
                </h2>
                {finalFile ? (
                    <p className="text-xl text-green-700 flex items-center gap-2">
                        <span>✅</span>
                        Final file ready: <strong>{finalFile}</strong>
                    </p>
                ) : (
                    <p className="text-gray-500 italic">No file scraped yet.</p>
                )}
            </Card>
        </div>
    );
};

DataScraping.propTypes = {
    className: PropTypes.string,
};

// Memoize to prevent unnecessary re-renders
export default memo(DataScraping);