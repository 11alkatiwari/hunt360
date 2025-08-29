import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const baseURL = 'https://hunt360-3.onrender.com/api/linkedin';


const DataScraping = () => {
  const [isScraping, setIsScraping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [previousScrapes, setPreviousScrapes] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const goToDashboard = () => navigate('/');

  const handleScrape = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a search query.');
      return;
    }

    setIsScraping(true);
    setError(null);

    try {
      const response = await fetch(`${baseURL}/scrape`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ search: searchQuery }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Scraping failed.');
      }

      console.log('Scraping result:', result);
      setSearchQuery(''); // Clear input after successful scrape
      fetchData(); // Refresh previous scrapes
    } catch (err) {
      setError(err.message);
    } finally {
      setIsScraping(false);
    }
  };

  const fetchData = async () => {
    try {
      const response = await fetch(`${baseURL}/previous-scrapes`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch previous scrapes.');
      }
      setPreviousScrapes(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  // Fetch previous scrapes on component mount
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen p-8 text-gray-800">
      {/* <div className="font-bold mb-6">
        <h1>Data Scraping</h1>
      </div> */}

      <div className="bg-white rounded-2xl shadow-md p-6 w-full max-w-4xl mx-auto">
        <h2 className="text-xl font-bold mb-4">Scraping Job</h2>

        {error && (
          <div className="text-red-600 mb-4">{error}</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">What to Search</label>
            <input
              type="text"
              placeholder="e.g. (CEO OR CTO) AND Fintech"
              className="border border-gray-300 rounded-lg p-2"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">Source</label>
            <input
              type="text"
              value="LinkedIn"
              className="input input-bordered w-full border border-gray-300 rounded-lg p-2"
              readOnly
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">Date Range</label>
            <input
              type="text"
              placeholder="Select range"
              className="input input-bordered w-full border border-gray-300 rounded-lg p-2"
              disabled
            />
          </div> */}
        </div>

        {/* Button Section */}
        <div className="flex flex-col sm:flex-row justify-center mt-4 sm:mt-6 flex-nowrap mx-4 sm:mx-6 lg:mx-[40px] gap-3 sm:gap-[15px]">
          <button
            className="bg-[#6A1B9A] text-white py-2 sm:py-[12px] px-4 sm:px-[20px] rounded-md text-sm sm:text-[16px] hover:opacity-90 cursor-pointer w-full sm:w-auto"
            onClick={handleScrape}
            disabled={isScraping}
          >
            {isScraping ? "Scraping..." : "Start Scraping"}
          </button>
          <button
            className="bg-[#6A1B9A] text-white py-2 sm:py-[12px] px-4 sm:px-[20px] rounded-md text-sm sm:text-[16px] hover:opacity-90 cursor-pointer w-full sm:w-auto"
            onClick={fetchData}
          >
            Previous Scrapes
          </button>
          <button
            className="bg-[#6A1B9A] text-white py-2 sm:py-[12px] px-4 sm:px-[20px] rounded-md text-sm sm:text-[16px] hover:opacity-90 cursor-pointer w-full sm:w-auto"
            onClick={goToDashboard}
          >
            Dashboard
          </button>
        </div>

        {/* Previous Scraped Data Section */}
        <div className="mx-4 sm:mx-6 lg:mx-[40px]">
          <h3 className="text-base sm:text-lg font-semibold mt-6 sm:mt-8 mb-1 sm:mb-2">📋 Previous Scrapes</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-[#f9f9f9] shadow-md text-xs sm:text-sm font-sans mt-4 sm:mt-5 min-w-[600px]">
              <thead>
                <tr className="bg-[#6a0dad]">
                  <th className="p-2 sm:p-[12px] text-[#ffffff] uppercase text-left border border-[#ddd] text-xs sm:text-sm">Name</th>
                  <th className="p-2 sm:p-[12px] text-[#ffffff] uppercase text-left border border-[#ddd] text-xs sm:text-sm">Company</th>
                  <th className="p-2 sm:p-[12px] text-[#ffffff] uppercase text-left border border-[#ddd] text-xs sm:text-sm">Location</th>
                  <th className="p-2 sm:p-[12px] text-[#ffffff] uppercase text-left border border-[#ddd] text-xs sm:text-sm">Followers</th>
                  <th className="p-2 sm:p-[12px] text-[#ffffff] uppercase text-left border border-[#ddd] text-xs sm:text-sm">Connections</th>
                  <th className="p-2 sm:p-[12px] text-[#ffffff] uppercase text-left border border-[#ddd] text-xs sm:text-sm">URL</th>
                </tr>
              </thead>
              <tbody>
                {previousScrapes.length > 0 ? (
                  previousScrapes.map((scrape, index) => (
                    <tr
                      key={index}
                      className={`${index % 2 === 0 ? 'bg-[#e6e6fa]' : ''} hover:bg-[#dcd0ff] transition duration-300`}
                    >
                      <td className="p-2 sm:p-[12px] border border-[#ddd]">{scrape.name}</td>
                      <td className="p-2 sm:p-[12px] border border-[#ddd]">{scrape.company}</td>
                      <td className="p-2 sm:p-[12px] border border-[#ddd]">{scrape.location}</td>
                      <td className="p-2 sm:p-[12px] border border-[#ddd]">{scrape.follower}</td>
                      <td className="p-2 sm:p-[12px] border border-[#ddd]">{scrape.connection}</td>
                      <td className="p-2 sm:p-[12px] border border-[#ddd]">
                        <a href={scrape.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          Link
                        </a>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-2 sm:p-[12px] border border-[#ddd] text-center">
                      No previous scrapes found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Scraping Jobs Section (Static Placeholder) */}

      </div>
    </div>
  );
};

export default DataScraping;