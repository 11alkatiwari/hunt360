/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import bgLogo from "../../../public/logo.png";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const baseURL = 'https://hunt360-3.onrender.com/api/linkedin';

const Dashboard = () => {
  const [data, setData] = useState({});
  const [analytics, setAnalytics] = useState({ status: [], locations: [], companies: [], followerRanges: [] });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch KPIs
    axios.get(`${baseURL}/dashboard`)
      .then((res) => {
        console.log('Dashboard data:', res.data);
        setData(res.data || {});
      })
      .catch((err) => {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      });

    // Fetch analytics data
    axios.get(`${baseURL}/analytics`)
      .then((res) => {
        console.log('Analytics data:', res.data);
        setAnalytics(res.data || { status: [], locations: [], companies: [], followerRanges: [] });
      })
      .catch((err) => {
        console.error('Error fetching analytics data:', err);
        setError(prev => prev ? `${prev}\nFailed to load analytics data` : 'Failed to load analytics data');
      });
  }, []);

  // Status Breakdown Pie Chart
  const filteredStatus = analytics.status.filter(item => item.count > 0);
  const statusData = {
    labels: filteredStatus.length > 0 ? filteredStatus.map((item) => item.status) : ['No Data'],
    datasets: [
      {
        label: 'Status Breakdown',
        data: filteredStatus.length > 0 ? filteredStatus.map((item) => item.count) : [1],
        backgroundColor: ['#f72585', '#4361ee', '#fca311'],
      },
    ],
  };
  const totalStatus = filteredStatus.reduce((acc, val) => acc + val.count, 0);

  // Location-Based Pie Chart
  const filteredLocations = analytics.locations.filter(item => item.count > 0);
  const locationData = {
    labels: filteredLocations.length > 0 ? filteredLocations.map((item) => item.location.split(',')[0].trim()) : ['No Data'],
    datasets: [
      {
        label: 'Location Distribution',
        data: filteredLocations.length > 0 ? filteredLocations.map((item) => item.count) : [1],
        backgroundColor: ['#f72585', '#4361ee', '#fca311', '#4cc9f0', '#9d4edd'],
      },
    ],
  };

  // Company-Wise Bar Chart (Top 5)
  const filteredCompanies = analytics.companies.filter(item => item.count > 0);
  const companyData = {
    labels: filteredCompanies.length > 0 ? filteredCompanies.map((item) => item.company) : ['No Data'],
    datasets: [
      {
        label: 'Top 5 Companies',
        data: filteredCompanies.length > 0 ? filteredCompanies.map((item) => item.count) : [1],
        backgroundColor: '#4361ee',
      },
    ],
  };

  // Follower Range Bar Chart
  const filteredFollowerRanges = analytics.followerRanges.filter(item => item.rang !== 'Unknown' || item.count > 0);
  const followerRangeData = {
    labels: filteredFollowerRanges.length > 0 ? filteredFollowerRanges.map((item) => item.rang) : ['No Data'],
    datasets: [
      {
        label: 'Follower Count',
        data: filteredFollowerRanges.length > 0 ? filteredFollowerRanges.map((item) => item.count) : [0],
        backgroundColor: filteredFollowerRanges.length > 0 ? ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'] : ['#CCCCCC'],
      },
    ],
  };

  return (
    <div className="bg-[#f9fafb] font-sans m-0 p-5  min-h-screen">
      <div className="flex-1 p-5 pt-0 relative overflow-hidden ml-12">
        <div className="p-6 bg-[#f5efff] rounded-lg shadow-md min-h-[230px]">
          <div className="absolute top-[30%] left-[40%] -translate-x-1/2 -translate-y-1/2 opacity-[0.08] -z-10 pointer-events-none">
            <img src={bgLogo} alt="Watermark Logo" className="max-w-[900px] w-[200%] h-auto" />
          </div>
          <h2 className="text-xl pt-5 font-semibold mb-2.5 text-[#4b0082] pl-[16px] tracking-wide" style={{ wordSpacing: '0.2rem' }}>
            Senior Profiles Dashboard
          </h2>

          <div className="mt-[30px] mb-2.5 pl-[16px]">
            <h4 className="m-0 text-base font-semibold text-[#333] tracking-wide" style={{ wordSpacing: '0.2rem' }}>
              Quick Actions
            </h4>
          </div>
          <div className="flex flex-nowrap overflow-x-auto justify-center items-center mt-2.5 gap-[6px] mx-4 mb-6">
            <button
      className="px-4 py-2 border-none rounded-md text-white cursor-pointer text-sm whitespace-nowrap flex-shrink-0 m-0 w-auto min-w-0 bg-[#2f80ed] hover:bg-[#2563eb] tracking-wide"
      style={{ wordSpacing: "0.2rem" }}
      onClick={() => navigate("/dashboard/senior-management/single-data-edit")}
    >
      Edit Profile
    </button>            <button
              className="px-4 py-2 border-none rounded-md text-white cursor-pointer text-sm whitespace-nowrap flex-shrink-0 m-0 w-auto min-w-0 bg-[#27ae60] hover:bg-[#219653] tracking-wide"
              style={{ wordSpacing: '0.2rem' }}
              onClick={() => navigate("/dashboard/senior-management/data-scraping")}>Import from LinkedIn</button>
           <button
        className="px-4 py-2 border-none rounded-md text-white cursor-pointer text-sm whitespace-nowrap flex-shrink-0 m-0 w-auto min-w-0 bg-[#a259ff] hover:bg-[#8b4ee6] tracking-wide"
        style={{ wordSpacing: "0.2rem" }}
        onClick={() => navigate("/dashboard/senior-management/bulk-data-cleaning")}
      >
        Bulk Upload CSV
      </button>

      <button
        className="px-4 py-2 border-none rounded-md text-white cursor-pointer text-sm whitespace-nowrap flex-shrink-0 m-0 w-auto min-w-0 bg-[#faa033] hover:bg-[#faa033] tracking-wide"
        style={{ wordSpacing: "0.2rem" }}
        onClick={() => navigate("/dashboard/senior-management/final-profiles")}
      >
        Final Profile
      </button>          </div>
        </div>

        <div className="mt-[30px] mb-2.5">
          <h4 className="m-0 text-base font-semibold text-[#333] tracking-wide pl-[12px]" style={{ wordSpacing: '0.2rem' }}>
            KPIs
          </h4>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-[6px] mb-8">
          <div className="bg-[rgba(230,222,222,0.3)] backdrop-blur-md rounded-[12px] p-[20px] text-center shadow-[0_4px_8px_rgba(0,0,0,0.1)]">
            <p className="text-2xl font-bold text-black tracking-wide" style={{ wordSpacing: '0.2rem', color: '#2f80ed', fontSize: '21px', fontWeight: 'bold' }}>
              {data?.totalProfiles?.count || 0}
            </p>
            <h3 className="text-sm font-semibold text-black tracking-wide" style={{ wordSpacing: '0.2rem' }}>
              Total Profiles Scraped
            </h3>
          </div>
          <div className="bg-[rgba(230,222,222,0.3)] backdrop-blur-md rounded-[12px] p-[20px] text-center shadow-[0_4px_8px_rgba(0,0,0,0.1)]">
            <p className="text-2xl font-bold text-black tracking-wide" style={{ wordSpacing: '0.2rem', color: '#27ae60', fontSize: '21px', fontWeight: 'bold' }}>
              {data?.updatedProfiles?.count || 0}
            </p>
            <h3 className="text-sm font-semibold text-black tracking-wide" style={{ wordSpacing: '0.2rem' }}>
              Profiles Marked Updated
            </h3>
          </div>
          <div className="bg-[rgba(230,222,222,0.3)] backdrop-blur-md rounded-[12px] p-[20px] text-center shadow-[0_4px_8px_rgba(0,0,0,0.1)]">
            <p className="text-2xl font-bold text-black tracking-wide" style={{ wordSpacing: '0.2rem', color: '#f2994a', fontSize: '21px', fontWeight: 'bold' }}>
              {data?.newThisWeek?.count || 0}
            </p>
            <h3 className="text-sm font-semibold text-black tracking-wide" style={{ wordSpacing: '0.2rem' }}>
              New Profiles This Week
            </h3>
          </div>
          <div className="bg-[rgba(230,222,222,0.3)] backdrop-blur-md rounded-[12px] p-[20px] text-center shadow-[0_4px_8px_rgba(0,0,0,0.1)]">
            <p className="text-2xl font-bold text-black tracking-wide" style={{ wordSpacing: '0.2rem', color: '#a259ff', fontSize: '21px', fontWeight: 'bold' }}>
              {data?.newThisMonth?.count || 0}
            </p>
            <h3 className="text-sm font-semibold text-black tracking-wide" style={{ wordSpacing: '0.2rem' }}>
              New Profiles This Month
            </h3>
          </div>
        </div>

        <div className="mt-[30px] mb-2.5">
          <h4 className="m-0 text-base font-semibold text-[#333] tracking-wide pl-[12px]" style={{ wordSpacing: '0.2rem' }}>
            Analytics
          </h4>
        </div>
        <div className="flex flex-wrap gap-[15px] mt-[30px] bg-[white] p-[15px] rounded-[20px] justify-between">
          {/* Status Breakdown Pie Chart */}
          {/*<div className="w-full flex gap-[12px] bg-white p-[15px] rounded-[12px] shadow-[0_4px_10px_rgba(0,0,0,0.05)] min-w-[320px] max-w-full">
            <div className="w-[200px] bg-[#f3dffb] p-[10px_12px] rounded-[12px] shadow-[0_0_8px_rgba(0,0,0,0.05)] font-semibold text-[16px]">
              <h4 className="m-0 mb-[10px] font-semibold text-[16px] text-[#4b0082]">Status Breakdown</h4>
              {filteredStatus.length > 0 ? (
                filteredStatus.map((s) => (
                  <p key={s.status} className="my-[5px] text-[14px] text-[#444]" style={{ wordSpacing: '0.2rem' }}>
                    {s.status}: {s.count}
                  </p>
                ))
              ) : (
                <p className="my-[5px] text-[14px] text-[#444]" style={{ wordSpacing: '0.2rem' }}>
                  Status data not available 
                </p>
              )}
            </div>
            <Pie
              data={statusData}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'top' },
                  tooltip: {
                    callbacks: {
                      label: function (context) {
                        const count = context.raw;
                        const percentage = totalStatus ? ((count / totalStatus) * 100).toFixed(1) : 0;
                        return `${context.label}: ${count} (${percentage}%)`;
                      },
                    },
                  },
                },
              }}
              className="max-w-[500px] h-[150px]"
            />
          </div> */}

          {/* Location-Based Pie Chart */}
          <div className="w-full flex flex-col sm:flex-row gap-[12px] bg-white p-[15px] rounded-[12px] shadow-[0_4px_10px_rgba(0,0,0,0.05)] min-w-[320px] max-w-full">
            <div className="w-full sm:w-[160px] bg-[#f3dffb] p-[10px_12px] rounded-[12px] shadow-[0_0_8px_rgba(0,0,0,0.05)] font-semibold text-[16px]">
              <h4 className="m-0 mb-[10px] text-[16px] text-[#4b0082]">Location Distribution</h4>
              {filteredLocations.length > 0 ? (
                filteredLocations.map((s) => (
                  <p key={s.location} className="my-[5px] text-[14px] text-[#444] tracking-wide">
                    {s.location.split(',')[0].trim()}: {s.count}
                  </p>
                ))
              ) : (
                <p className="my-[5px] text-[14px] text-[#444] tracking-wide">No location data available</p>
              )}
            </div>
            <div className="flex-1 min-h-[240px]">
              <Pie
                data={locationData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'top' } },
                }}
              />
            </div>
          </div>

          {/* Company-Wise Bar Chart */}
          <div className="w-full flex flex-col sm:flex-row gap-[12px] bg-white p-[15px] rounded-[12px] shadow-[0_4px_10px_rgba(0,0,0,0.05)] min-w-[320px] max-w-full">
            <div className="w-full sm:w-[160px] bg-[#f3dffb] p-[10px_12px] rounded-[12px] shadow-[0_0_8px_rgba(0,0,0,0.05)] font-semibold text-[16px]">
              <h4 className="m-0 mb-[10px] text-[16px] text-[#4b0082]">Top 5 Companies</h4>
              {filteredCompanies.length > 0 ? (
                filteredCompanies.map((s) => (
                  <p key={s.company} className="my-[5px] text-[14px] text-[#444] tracking-wide">
                    {s.company}: {s.count}
                  </p>
                ))
              ) : (
                <p className="my-[5px] text-[14px] text-[#444] tracking-wide">No company data available</p>
              )}
            </div>
            <div className="flex-1 min-h-[240px]">
              <Bar
                data={companyData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    y: { beginAtZero: true, title: { display: true, text: 'Count' } },
                    x: { title: { display: true, text: 'Company' } },
                  },
                }}
              />
            </div>
          </div>

          {/* Follower Range Bar Chart */}
          <div className="w-full flex flex-col sm:flex-row gap-[12px] bg-white p-[15px] rounded-[12px] shadow-[0_4px_10px_rgba(0,0,0,0.05)] min-w-[320px] max-w-full">
            <div className="w-full sm:w-[160px] bg-[#f3dffb] p-[10px_12px] rounded-[12px] shadow-[0_0_8px_rgba(0,0,0,0.05)] font-semibold text-[16px]">
              <h4 className="m-0 mb-[10px] text-[16px] text-[#4b0082]">Follower Ranges</h4>
              {filteredFollowerRanges.length > 0 ? (
                filteredFollowerRanges.map((s) => (
                  <p key={s.rang} className="my-[5px] text-[14px] text-[#444] tracking-wide">
                    {s.rang}: {s.count}
                  </p>
                ))
              ) : (
                <p className="my-[5px] text-[14px] text-[#444] tracking-wide">No follower data available</p>
              )}
            </div>
            <div className="flex-1 min-h-[240px]">
              <Bar
                data={{
                  labels: filteredFollowerRanges.length > 0 ? filteredFollowerRanges.map((item) => item.rang) : ['No Data'],
                  datasets: [{
                    label: 'Follower Count',
                    data: filteredFollowerRanges.length > 0 ? filteredFollowerRanges.map((item) => item.count) : [0],
                    backgroundColor: filteredFollowerRanges.length > 0 ? ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'] : ['#CCCCCC'],
                  }],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    y: { beginAtZero: true, title: { display: true, text: 'Count' } },
                    x: { title: { display: true, text: 'Follower Range' } },
                  },
                }}
              />
            </div>
          </div>
        </div>
        {error && <div className="text-red-500 mt-4">{error}</div>}
      </div>
    </div>
  );
};

export default Dashboard;
