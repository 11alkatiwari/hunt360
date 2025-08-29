/* eslint-disable no-unused-vars */

import axios from 'axios';
import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Tooltip } from 'chart.js';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useEffect, useRef, useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);


const baseURL = 'https://hunt360-3.onrender.com/api/linkedin';


const Reports = () => {
  const [data, setData] = useState({});
  const [analytics, setAnalytics] = useState({ status: [], locations: [], companies: [], followerRanges: [] });
  const [filters, setFilters] = useState({ date: '', status: '', location: '' });
  const [reportData, setReportData] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const tableRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    axios.get(`${baseURL}/dashboard`)
      .then((res) => setData(res.data || {}))
      .catch((err) => setError('Failed to load dashboard data'));

    axios.get(`${baseURL}/analytics`)
      .then((res) => setAnalytics(res.data || { status: [], locations: [], companies: [], followerRanges: [] }))
      .catch((err) => setError('Failed to load analytics data'));
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const generateReport = async () => {
    try {
      const filtersWithUpdated = {
        ...filters,
        updated: 'Yes' // Always enforce updated = 'Yes'
      };

      console.log('Sending filters:', filtersWithUpdated);

      const response = await axios.post(`${baseURL}/reports`, filtersWithUpdated);

      const processedData = response.data.map(row => ({
        ...row,
        company: row.company ? row.company.split(',')[0].trim() : 'N/A',
        location: row.location ? row.location.split(',')[0].trim() : 'N/A'
      }));

      setReportData(processedData);
      setError(null);
    } catch (err) {
      setError('Failed to generate report');
      console.error('Generate report error:', err);
    }
  };

  const exportPDF = async () => {
    try {
      const doc = new jsPDF();
      const tableColumnHeaders = ['ID', 'Name', 'Location', 'Follower', 'Connection', 'URL', 'Status', 'Updated', 'Updated At'];

      // Capture chart images using html2canvas
      const getChartImage = async (chartId) => {
        const chartElement = document.getElementById(chartId);
        if (chartElement) {
          const canvas = await html2canvas(chartElement, { scale: 2 });
          return canvas.toDataURL('image/png');
        }
        return null;
      };

      const [statusChartImg, locationChartImg, followerChartImg] = await Promise.all([
        getChartImage('status-chart'),
        getChartImage('location-chart'),
        getChartImage('follower-chart'),
      ]);

      // Add header text to the first page
      doc.setFontSize(16);
      doc.text('Talent Corner Corporate Data Search Report', 10, 10);
      doc.setFontSize(10);
      doc.text(`Generated on ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })}`, 10, 15);

      // Prepare table rows
      const tableRows = reportData.length > 0 ? reportData.map(row => {
        const updatedAt = row.updated_at
          ? new Date(row.updated_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })
          : 'N/A';
        return [
          row.id || 'N/A',
          row.name || 'N/A',
          row.location || 'N/A',
          row.follower || 'N/A',
          row.connection || 'N/A',
          row.url || 'N/A',
          row.status || 'N/A',
          row.updated || 'N/A',
          updatedAt
        ];
      }) : [];

      // Generate the table
      autoTable(doc, {
        head: [tableColumnHeaders],
        body: tableRows,
        startY: 25,
        theme: 'striped',
        headStyles: { fillColor: [106, 27, 154], textColor: [255, 255, 255], fontSize: 12 },
        bodyStyles: { fontSize: 10, cellPadding: 2 },
        columnStyles: {
          0: { cellWidth: 10 }, // ID
          1: { cellWidth: 25 }, // Name
          2: { cellWidth: 21 }, // Location
          3: { cellWidth: 21 }, // Follower
          4: { cellWidth: 20 }, // Connection
          5: { cellWidth: 35 }, // URL
          6: { cellWidth: 20 }, // Status
          7: { cellWidth: 21 }, // Updated
          8: { cellWidth: 21 }, // Updated At
        },
        margin: { top: 25 },
        didDrawPage: (data) => {
          // Add header to every page
          doc.setFontSize(16);
          doc.text('Talent Corner Corporate Data Search Report', 10, 10);
          doc.setFontSize(10);
          doc.text(`Generated on ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })}`, 10, 15);
        },
        didDrawCell: (data) => {
          if (data.section === 'body' && data.cell.raw === 'N/A') {
            data.cell.styles.fillColor = [200, 200, 200];
          }
        },
      });

      // Add a new page for charts
      doc.addPage();
      const pageWidth = doc.internal.pageSize.width; // Approximately 595 points
      const pageHeight = doc.internal.pageSize.height; // Approximately 842 points
      let chartY = (pageHeight - 230) / 2; // Center vertically, accounting for two pie charts (70 each) and bar chart (70) + titles

      // Add Status Breakdown pie chart with subtitle, left side of pair
      if (statusChartImg) {
        doc.setFontSize(14);
        const titleWidth = doc.getTextWidth('Status Breakdown');
        doc.text('Status Breakdown', (pageWidth / 2 - 105), chartY); // Left of center for first pie
        chartY += 10;
        doc.addImage(statusChartImg, 'PNG', (pageWidth / 2 - 100), chartY, 100, 70); // Left pie
      }

      // Add Location Distribution pie chart with subtitle, right side of pair
      if (locationChartImg) {
        doc.setFontSize(14);
        const titleWidth = doc.getTextWidth('Location Distribution');
        doc.text('Location Distribution', (pageWidth / 2 + 5), chartY - 10); // Align with Status title
        doc.addImage(locationChartImg, 'PNG', (pageWidth / 2 + 10), chartY, 100, 70); // Right pie, 10-unit gap
      }

      chartY += 80; // Move down after pie charts

      // Add Follower Ranges bar chart with subtitle, centered below
      if (followerChartImg) {
        doc.setFontSize(14);
        const titleWidth = doc.getTextWidth('Follower Ranges');
        doc.text('Follower Ranges', (pageWidth - titleWidth) / 2, chartY);
        chartY += 10;
        doc.addImage(followerChartImg, 'PNG', (pageWidth - 100) / 2, chartY, 100, 70); // Centered bar chart
      }

      if (reportData.length > 0) {
        doc.save('report.pdf');
      } else {
        setError('No report data available to export. Please generate a report first.');
      }
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError('Failed to generate PDF. Please try again.');
    }
  };

  const exportCSV = () => {
    const currentDate = new Date().toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata' });
    const csvContent = [
      `Talent Corner Corporate Data Search Report`,
      `Generated on ${currentDate}`,
      '',
      'Summary',
      `Total Profiles Scraped,${data?.totalProfiles?.count || 0}`,
      `Profiles Marked Updated,${data?.updatedProfiles?.count || 0}`,
      `New Profiles This Week,${data?.newThisWeek?.count || 0}`,
      `New Profiles This Month,${data?.newThisMonth?.count || 0}`,
      '',
      'Detailed Report',
      'ID,Name,Location,Follower,Connection,URL,Status,Updated,Updated At,Date of Contact,LinkedIn Message Date,Position,Work From,Education,BD Name,Notes',
      ...reportData.map(row => {
        const updatedAt = row.updated_at
          ? new Date(row.updated_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })
          : 'N/A';
        return `${row.id || ''},${row.name || ''},${row.location || ''},${row.follower || ''},${row.connection || ''},${row.url || ''},${row.status || ''},${row.updated || ''},${updatedAt},${row.date_of_contact || ''},${row.linkedin_message_date || ''},${row.position || ''},${row.work_from || ''},${row.education || ''},${row.bd_name || ''},${row.notes ? row.notes.replace(/[\n\r]+/g, ' ') : ''}`;
      }),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'report.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredStatus = analytics.status.filter(item => !filters.status || item.status === filters.status);
  const filteredLocations = analytics.locations.filter(item => !filters.location || item.location.split(',')[0].trim() === filters.location);
  const filteredFollowerRanges = analytics.followerRanges.filter(item => item.count > 0);

  const statusData = {
    labels: filteredStatus.map(item => item.status),
    datasets: [{ label: 'Status Breakdown', data: filteredStatus.map(item => item.count), backgroundColor: ['#f72585', '#4361ee', '#fca311'] }],
  };

  const locationData = {
    labels: filteredLocations.map(item => item.location.split(',')[0].trim()),
    datasets: [{ label: 'Location Distribution', data: filteredLocations.map(item => item.count), backgroundColor: ['#f72585', '#4361ee', '#fca311', '#4cc9f0', '#9d4edd'] }],
  };

  const followerRangeData = {
    labels: filteredFollowerRanges.map(item => item.rang),
    datasets: [{ label: 'Follower Count', data: filteredFollowerRanges.map(item => item.count), backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'] }],
  };

  return (
    <div className="bg-[#f9fafb] font-sans m-0 p-5  min-h-screen">
      <div className="p-6 bg-[#f5efff] rounded-lg shadow-md min-h-[230px]">
        <h2 className="text-xl pt-5 font-semibold mb-2.5 text-[#4b0082] pl-[16px] tracking-wide" style={{ wordSpacing: '0.2rem' }}>
          Reports Dashboard
        </h2>

        <div className="mt-[30px] mb-2.5 pl-[16px]">
          <h4 className="m-0 text-base font-semibold text-[#333] tracking-wide" style={{ wordSpacing: '0.2rem' }}>
            Filters
          </h4>
        </div>
        <div className="pl-[16px]">
          <div className="flex gap-[10px] mb-4">
            <input type="date" name="date" onChange={handleFilterChange} className="p-2 border rounded" />
            <select name="status" onChange={handleFilterChange} className="p-2 border rounded">
              <option value="">All Statuses</option>
              {analytics.status.map(s => <option key={s.status} value={s.status}>{s.status}</option>)}
            </select>
            <select name="location" onChange={handleFilterChange} className="p-2 border rounded">
              <option value="">All Locations</option>
              {analytics.locations.map(l => <option key={l.location} value={l.location.split(',')[0].trim()}>{l.location.split(',')[0].trim()}</option>)}
            </select>

          </div>
          <div className="flex justify-start">
            <button onClick={generateReport} className="px-4 py-2 bg-[#2f80ed] text-white rounded">Generate Report</button>
          </div>
        </div>

        <div className="mt-[30px] mb-2.5">
          <h4 className="m-0 text-base font-semibold text-[#333] tracking-wide pl-[12px]" style={{ wordSpacing: '0.2rem' }}>
            Summary
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
            Detailed Report
          </h4>
        </div>
        <div className="overflow-x-auto pl-[16px] mb-10">
          <table id="report-table" ref={tableRef} className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr className="bg-[#6a1b9a] text-white">
                <th className="border p-2">ID</th>
                <th className="border p-2">Name</th>
                <th className="border p-2">Location</th>
                <th className="border p-2">Follower</th>
                <th className="border p-2">Connection</th>
                <th className="border p-2">URL</th>
                <th className="border p-2">Status</th>
                <th className="border p-2">Updated</th>
                <th className="border p-2">Updated At</th>
                <th className="border p-2">Date of Contact</th>
                <th className="border p-2">LinkedIn Message Date</th>
                <th className="border p-2">Position</th>
                <th className="border p-2">Work From</th>
                <th className="border p-2">Education</th>
                <th className="border p-2">BD Name</th>
                <th className="border p-2">Notes</th>
              </tr>
            </thead>
            <tbody>
              {reportData.length > 0 ? (
                reportData.map((row, index) => (
                  <tr key={index} className="border">
                    <td className="border p-2">{row.id || 'N/A'}</td>
                    <td className="border p-2">{row.name || 'N/A'}</td>
                    <td className="border p-2">{row.location || 'N/A'}</td>
                    <td className="border p-2">{row.follower || 'N/A'}</td>
                    <td className="border p-2">{row.connection || 'N/A'}</td>
                    <td className="border p-2">{row.url || 'N/A'}</td>
                    <td className="border p-2">{row.status || 'N/A'}</td>
                    <td className="border p-2">{row.updated || 'N/A'}</td>
                    <td className="border p-2">{row.updated_at || 'N/A'}</td>
                    <td className="border p-2">{row.date_of_contact || 'N/A'}</td>
                    <td className="border p-2">{row.linkedin_message_date || 'N/A'}</td>
                    <td className="border p-2">{row.position || 'N/A'}</td>
                    <td className="border p-2">{row.work_from || 'N/A'}</td>
                    <td className="border p-2">{row.education || 'N/A'}</td>
                    <td className="border p-2">{row.bd_name || 'N/A'}</td>
                    <td className="border p-2">{row.notes || 'N/A'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="17" className="border p-2 text-center">No data available</td>
                </tr>
              )}
            </tbody>
          </table>

        </div>

        <div className="flex flex-col lg:flex-row gap-[16px] w-full">
          <div className="flex-1 min-w-0 bg-white p-[15px] rounded-[12px] shadow-[0_4px_10px_rgba(0,0,0,0.05)] flex flex-col sm:flex-row gap-[12px]">
            <div className="w-full sm:w-[160px] bg-[#f3dffb] p-[10px_12px] rounded-[12px] shadow-[0_0_8px_rgba(0,0,0,0.05)] font-semibold text-[16px]">
              <h4 className="m-0 mb-[10px] font-semibold text-[16px] text-[#4b0082]">Status Breakdown</h4>
              {filteredStatus.map(s => (
                <p key={s.status} className="my-[5px] text-[14px] text-[#444]">
                  {s.status}: {s.count}
                </p>
              ))}
            </div>
            <div className="flex-1 min-h-[200px] flex items-center justify-center" id="status-chart">
              <Pie
                data={statusData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: true,
                      position: 'bottom',
                      labels: {
                        boxWidth: 10,
                        padding: 10,
                      },
                    },
                  },
                }}
                className="w-full h-full"
              />
            </div>
          </div>

          <div className="flex-1 min-w-0 bg-white p-[15px] rounded-[12px] shadow-[0_4px_10px_rgba(0,0,0,0.05)] flex flex-col sm:flex-row gap-[12px]">
            <div className="w-full sm:w-[160px] bg-[#f3dffb] p-[10px_12px] rounded-[12px] shadow-[0_0_8px_rgba(0,0,0,0.05)] font-semibold text-[16px]">
              <h4 className="m-0 mb-[10px] font-semibold text-[16px] text-[#4b0082]">Location Distribution</h4>
              {filteredLocations.map(s => (
                <p key={s.location} className="my-[5px] text-[14px] text-[#444]">
                  {s.location.split(',')[0].trim()}: {s.count}
                </p>
              ))}
            </div>
            <div className="flex-1 min-h-[200px] flex items-center justify-center" id="location-chart">
              <Pie
                data={locationData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: true,
                      position: 'bottom',
                      labels: {
                        boxWidth: 10,
                        padding: 10,
                      },
                    },
                  },
                }}
                className="w-full h-full"
              />
            </div>
          </div>
        </div>

        <div className="w-full bg-white p-[15px] rounded-[12px] shadow-[0_4px_10px_rgba(0,0,0,0.05)] min-w-[320px] max-w-full flex flex-col sm:flex-row gap-[12px]">
          <div className="w-full sm:w-[160px] bg-[#f3dffb] p-[10px_12px] rounded-[12px] shadow-[0_0_8px_rgba(0,0,0,0.05)] font-semibold text-[16px]">
            <h4 className="m-0 mb-[10px] font-semibold text-[16px] text-[#4b0082]">Follower Ranges</h4>
            {filteredFollowerRanges.map(s => (
              <p key={s.rang} className="my-[5px] text-[14px] text-[#444]">{s.rang}: {s.count}</p>
            ))}
          </div>
          <div className="flex-1 min-h-[240px] flex items-center justify-center" id="follower-chart">
            <Bar
              data={followerRangeData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                      boxWidth: 10,
                      padding: 10,
                    },
                  },
                },
                scales: {
                  y: { beginAtZero: true, title: { display: true, text: 'Count' } },
                  x: { title: { display: true, text: 'Follower Range' } }
                }
              }}
              className="w-full h-full"
            />
          </div>
        </div>

        <div className="mt-4 pl-[16px]">
          <button onClick={exportPDF} className="px-4 py-2 bg-[#2f80ed] text-white rounded mr-2">Export PDF</button>
          <button onClick={exportCSV} className="px-4 py-2 bg-[#27ae60] text-white rounded">Export CSV</button>
        </div>

        <div className="mt-4 pl-[16px] text-gray-600">
          Last updated: {new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
        </div>
        {error && <div className="text-red-500 mt-4 pl-[16px]">{error}</div>}
      </div>
    </div>
  );
};

export default Reports;

