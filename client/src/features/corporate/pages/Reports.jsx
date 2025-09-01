/* eslint-disable no-unused-vars */

import axios from 'axios';
import Chart from 'chart.js/auto';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useEffect, useRef, useState } from 'react';

const baseURL = 'https://hunt360-3.onrender.com/api/corporate';

function Reports() {
    const leadStatusChartRef = useRef(null);
    const communicationStatusChartRef = useRef(null);
    const cityLeadChartRef = useRef(null);
    const stateBdChartRef = useRef(null);
    const leadStatusChartInstance = useRef(null);
    const communicationStatusChartInstance = useRef(null);
    const cityLeadChartInstance = useRef(null);
    const stateBdChartInstance = useRef(null);

    const [leadStatusData, setLeadStatusData] = useState([]);
    const [communicationStatusData, setCommunicationStatusData] = useState([]);
    const [cityLeadData, setCityLeadData] = useState([]);
    const [stateBdData, setStateBdData] = useState([]);
    const [reportData, setReportData] = useState([]);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage] = useState(10);

    const [filters, setFilters] = useState({
        name: "",
        location: "",
        communication_status: "",
        lead_status: "",
        bd_name: "",
        state: ""
    });

    const [summary, setSummary] = useState({
        hrContacts: 0,
        campaigns: 0,
        recordsEdited: 0,
    });
    const [latestCommunication, setLatestCommunication] = useState([]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleSearch = () => {
        fetchAllChartData();
        generateReport();
    };

    const handleClear = () => {
        setFilters({
            name: "",
            location: "",
            communication_status: "",
            lead_status: "",
            bd_name: "",
            state: ""
        });
        fetchAllChartData();
        generateReport();
    };

    const generateReport = async () => {
        try {
            const response = await axios.post(`${baseURL}/reports`, filters);
            if (response.data.length === 0) {
                const allDataResponse = await axios.post(`${baseURL}/reports`, {});
                setReportData(allDataResponse.data.map(row => ({
                    ...row,
                    location: row.location ? row.location.split(',')[0].trim() : 'N/A',
                    name: row.name ? row.name.split(',')[0].trim() : 'N/A'
                })));
            } else {
                setReportData(response.data.map(row => ({
                    ...row,
                    location: row.location ? row.location.split(',')[0].trim() : 'N/A',
                    name: row.name ? row.name.split(',')[0].trim() : 'N/A'
                })));
            }
            setCurrentPage(1);
            setError(null);
        } catch (err) {
            setError('Failed to generate report');
            console.error('Generate report error:', err);
        }
    };

    const escapeCsvValue = (value) => {
        if (value === null || value === undefined) return 'N/A';
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r'))) {
            return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
    };

    const exportCSV = () => {
        const currentDate = new Date().toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata' });
        const csvRows = [
            ['Talent Corner Corporate Data Search Report'],
            [`Generated on ${currentDate}`],
            [''],
            ['Detailed Report'],
            [
                'ID', 'Company Name', 'Name', 'Location', 'Job Title', 'Address', 'Phone Number', 'URL',
                'Contact Person Name', 'Email', 'State', 'Country', 'Pincode', 'GST Number', 'BD Name',
                'Industry', 'Sub Industry', 'Communication Status', 'Notes', 'Meeting Date', 'Lead Status',
                'Created At', 'Updated At', 'Mobile'
            ],
            ...reportData.map(row => {
                const meetingDate = row.meeting_date ? new Date(row.meeting_date).toLocaleDateString('en-US') : 'N/A';
                const createdAt = row.created_at ? new Date(row.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }) : 'N/A';
                const updatedAt = row.updated_at ? new Date(row.updated_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }) : 'N/A';
                return [
                    row.id || '',
                    row.company_name || '',
                    row.name || '',
                    row.location || '',
                    row.job_title || '',
                    row.address || '',
                    row.phone_number || '',
                    row.url || '',
                    row.contact_person_name || '',
                    row.email || '',
                    row.state || '',
                    row.country || '',
                    row.pincode || '',
                    row.gst_number || '',
                    row.bd_name || '',
                    row.industry || '',
                    row.sub_industry || '',
                    row.communication_status || '',
                    row.notes || '',
                    meetingDate,
                    row.lead_status || '',
                    createdAt,
                    updatedAt,
                    row.mobile || ''
                ].map(escapeCsvValue);
            })
        ];

        const csvContent = csvRows.map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'report.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const exportPDF = async () => {
        try {
            const doc = new jsPDF();
            const tableColumnHeaders = [
                'ID', 'Company Name', 'Location', 'Job Title', 'Address', 'Phone Number', 'URL',
                'Contact Person Name', 'Email', 'GST Number', 'BD Name', 'Industry', 'Sub Industry',
                'Communication Status', 'Notes', 'Lead Status', 'Mobile'
            ];

            // Dynamically calculate max width for each column based on content
            const maxWidths = tableColumnHeaders.reduce((acc, header) => ({ ...acc, [header]: 10 }), {});
            reportData.forEach(row => {
                tableColumnHeaders.forEach((header, index) => {
                    const value = row[header.toLowerCase().replace(' ', '_')] || 'N/A';
                    const textWidth = doc.getTextWidth(value.toString());
                    maxWidths[header] = Math.max(maxWidths[header], textWidth + 5); // Increased padding to 5mm
                });
            });

            // Adjust total width to fit page (A4 width is ~190mm with 10mm margins on each side)
            const totalWidth = Object.values(maxWidths).reduce((sum, width) => sum + width, 0);
            const availableWidth = 190; // 190mm page width - 10mm margins on each side
            const scaleFactor = totalWidth > availableWidth ? availableWidth / totalWidth : 1;
            const adjustedColumnStyles = tableColumnHeaders.reduce((acc, header, index) => ({
                ...acc,
                [index]: { cellWidth: maxWidths[header] * scaleFactor, halign: 'left' }
            }), {});

            const tableRows = reportData.length > 0 ? reportData.map(row => {
                const meetingDate = row.meeting_date ? new Date(row.meeting_date).toLocaleDateString('en-US') : 'N/A';
                return [
                    row.id || 'N/A',
                    row.company_name || 'N/A',
                    row.location || 'N/A',
                    row.job_title || 'N/A',
                    row.address || 'N/A',
                    row.phone_number || 'N/A',
                    row.url || 'N/A',
                    row.contact_person_name || 'N/A',
                    row.email || 'N/A',
                    row.gst_number || 'N/A',
                    row.bd_name || 'N/A',
                    row.industry || 'N/A',
                    row.sub_industry || 'N/A',
                    row.communication_status || 'N/A',
                    row.notes || 'N/A',
                    row.lead_status || 'N/A',
                    row.mobile || 'N/A'
                ];
            }) : [];

            // Add header only on page 1
            doc.setFontSize(20);
            doc.setFont('helvetica', 'bold');
            doc.text('Talent Corner Corporate Data Search Report', 105, 20, { align: 'center' });
            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            doc.text(`Generated on: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'full', timeStyle: 'medium' })}`, 105, 30, { align: 'center' });

            // Add table starting on page 1
            let tableStartY = 40;
            autoTable(doc, {
                head: [tableColumnHeaders],
                body: tableRows,
                startY: tableStartY,
                theme: 'striped',
                headStyles: { fillColor: [106, 27, 154], textColor: [255, 255, 255], fontSize: 10, halign: 'center' },
                bodyStyles: { fontSize: 8, cellPadding: 2, halign: 'left', valign: 'middle' },
                columnStyles: adjustedColumnStyles,
                margin: { horizontal: 10 },
                didDrawPage: (data) => {
                    if (data.pageNumber === 1) {
                        doc.setFontSize(20);
                        doc.setFont('helvetica', 'bold');
                        doc.text('Talent Corner Corporate Data Search Report', 105, 20, { align: 'center' });
                        doc.setFontSize(12);
                        doc.setFont('helvetica', 'normal');
                        doc.text(`Generated on: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'full', timeStyle: 'medium' })}`, 105, 30, { align: 'center' });
                    }
                    if (data.pageCount > 1) {
                        doc.setFontSize(10);
                        doc.text(`Page ${data.pageNumber} of ${data.pageCount}`, 105, 290, { align: 'center' });
                    }
                },
                didDrawCell: (data) => {
                    if (data.section === 'body' && data.cell.raw === 'N/A') {
                        data.cell.styles.fillColor = [200, 200, 200];
                    }
                },
            });

            // Add all four charts on the last page
            doc.addPage();
            const chartWidth = 80;
            const chartHeight = 60;
            const startX = (doc.internal.pageSize.width - chartWidth * 2 - 10) / 2; // Center with 10mm gap
            const startY = 30;

            const [leadStatusImg, commStatusImg, cityLeadImg, stateBdImg] = await Promise.all([
                getChartImage('leadStatusChart'),
                getChartImage('communicationStatusChart'),
                getChartImage('cityLeadChart'),
                getChartImage('stateBdChart'),
            ]);

            if (leadStatusImg) {
                doc.addImage(leadStatusImg, 'PNG', startX, startY, chartWidth, chartHeight);
                doc.setFontSize(14);
                doc.text('Lead Status Distribution', startX + chartWidth / 2, startY - 5, { align: 'center' });
            }
            if (commStatusImg) {
                doc.addImage(commStatusImg, 'PNG', startX + chartWidth + 10, startY, chartWidth, chartHeight);
                doc.setFontSize(14);
                doc.text('Communication Status Overview', startX + chartWidth + 10 + chartWidth / 2, startY - 5, { align: 'center' });
            }
            if (cityLeadImg) {
                doc.addImage(cityLeadImg, 'PNG', startX, startY + chartHeight + 20, chartWidth, chartHeight); // Below first row
                doc.setFontSize(14);
                doc.text('Location-wise Lead Count', startX + chartWidth / 2, startY + chartHeight + 15, { align: 'center' });
            }
            if (stateBdImg) {
                doc.addImage(stateBdImg, 'PNG', startX + chartWidth + 10, startY + chartHeight + 20, chartWidth, chartHeight);
                doc.setFontSize(14);
                doc.text('State-wise BD Activities', startX + chartWidth + 10 + chartWidth / 2, startY + chartHeight + 15, { align: 'center' });
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

    const getChartImage = async (chartId) => {
        const chartElement = document.getElementById(chartId);
        if (chartElement) {
            const canvas = await html2canvas(chartElement, { scale: 2 });
            return canvas.toDataURL('image/png');
        }
        return null;
    };

    const fetchAllChartData = () => {
        const params = new URLSearchParams(filters).toString();

        axios.get(`${baseURL}/lead-status-distribution?${params}`)
            .then((res) => setLeadStatusData(res.data.chartData))
            .catch((err) => console.error("Failed to fetch lead status data:", err));

        axios.get(`${baseURL}/communication-status-overview?${params}`)
            .then((res) => setCommunicationStatusData(res.data.chartData))
            .catch((err) => console.error("Failed to fetch communication status data:", err));

        axios.get(`${baseURL}/location-wise-lead-count?${params}`)
            .then((res) => setCityLeadData(res.data.chartData))
            .catch((err) => console.error("Failed to fetch location lead data:", err));

        axios.get(`${baseURL}/state-wise-bd-activities?${params}`)
            .then((res) => setStateBdData(res.data.chartData))
            .catch((err) => console.error("Failed to fetch state BD data:", err));
    };

    useEffect(() => {
        axios.get(`${baseURL}/report-summary`)
            .then((res) => setSummary(res.data))
            .catch((err) => console.error("Failed to load report summary:", err));

        axios.get(`${baseURL}/latest-communication`)
            .then((res) => setLatestCommunication(res.data))
            .catch((err) => console.error("Failed to fetch latest communication:", err));

        fetchAllChartData();
        generateReport();
    }, []);

    useEffect(() => {
        if (!leadStatusData || leadStatusData.length === 0) {
            if (leadStatusChartInstance.current) {
                leadStatusChartInstance.current.destroy();
                leadStatusChartInstance.current = null;
            }
            return;
        }

        if (leadStatusChartInstance.current) {
            leadStatusChartInstance.current.destroy();
        }

        leadStatusChartInstance.current = new Chart(leadStatusChartRef.current.getContext('2d'), {
            type: 'bar',
            data: {
                labels: leadStatusData.map(item => item.lead_status || 'Unknown'),
                datasets: [{
                    label: 'Lead Count',
                    data: leadStatusData.map(item => item.count),
                    backgroundColor: 'rgba(75, 192, 192, 0.7)',
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: { display: true, text: 'Lead Status Distribution' },
                },
                scales: {
                    y: { beginAtZero: true, title: { display: true, text: 'Count' } },
                    x: { title: { display: true, text: 'Lead Status' } }
                }
            }
        });
    }, [leadStatusData]);

    useEffect(() => {
        if (!communicationStatusData || communicationStatusData.length === 0) {
            if (communicationStatusChartInstance.current) {
                communicationStatusChartInstance.current.destroy();
                communicationStatusChartInstance.current = null;
            }
            return;
        }

        if (communicationStatusChartInstance.current) {
            communicationStatusChartInstance.current.destroy();
        }

        communicationStatusChartInstance.current = new Chart(communicationStatusChartRef.current.getContext('2d'), {
            type: 'pie',
            data: {
                labels: communicationStatusData.map(item => item.communication_status || 'Unknown'),
                datasets: [{
                    label: 'Communication Count',
                    data: communicationStatusData.map(item => item.count),
                    backgroundColor: [
                        '#f28b82',
                        '#81e6d9',
                        '#facc15',
                        '#60a5fa',
                        '#ff99ac',
                    ]
                }]
            },
            options: {
                responsive: false,
                maintainAspectRatio: false,
                plugins: {
                    title: { display: true, text: 'Communication Status Overview' },
                    legend: { display: false }
                }
            }
        });
    }, [communicationStatusData]);

    useEffect(() => {
        if (!cityLeadData || cityLeadData.length === 0) {
            if (cityLeadChartInstance.current) {
                cityLeadChartInstance.current.destroy();
                cityLeadChartInstance.current = null;
            }
            return;
        }

        if (cityLeadChartInstance.current) {
            cityLeadChartInstance.current.destroy();
        }

        cityLeadChartInstance.current = new Chart(cityLeadChartRef.current.getContext('2d'), {
            type: 'bar',
            data: {
                labels: cityLeadData.map(item => item.location || 'Unknown'),
                datasets: [{
                    label: 'Lead Count',
                    data: cityLeadData.map(item => item.count),
                    backgroundColor: 'rgba(153, 102, 255, 0.7)',
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: { display: true, text: 'Location-wise Lead Count' },
                },
                scales: {
                    y: { beginAtZero: true, title: { display: true, text: 'Count' } },
                    x: { title: { display: true, text: 'Location' } }
                }
            }
        });
    }, [cityLeadData]);

    useEffect(() => {
        if (!stateBdData || stateBdData.length === 0) {
            if (stateBdChartInstance.current) {
                stateBdChartInstance.current.destroy();
                stateBdChartInstance.current = null;
            }
            return;
        }

        if (stateBdChartInstance.current) {
            stateBdChartInstance.current.destroy();
        }

        stateBdChartInstance.current = new Chart(stateBdChartRef.current.getContext('2d'), {
            type: 'bar',
            data: {
                labels: stateBdData.map(item => item.state || 'Unknown'),
                datasets: [{
                    label: 'Activity Count',
                    data: stateBdData.map(item => item.count),
                    backgroundColor: 'rgba(255, 159, 64, 0.7)',
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: { display: true, text: 'State-wise BD Activities' },
                },
                scales: {
                    y: { beginAtZero: true, title: { display: true, text: 'Count' } },
                    x: { title: { display: true, text: 'State' } }
                }
            }
        });
    }, [stateBdData]);

    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = reportData.slice(indexOfFirstRecord, indexOfLastRecord);
    const totalPages = Math.ceil(reportData.length / recordsPerPage);

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handleBackPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    return (
        <div className="bg-[#f9f9fc] text-[#1a202c] pt-[50px] p-8 overflow-x-hidden">
            <main className="max-w-[1200px] mx-auto w-full flex flex-col">
                {/* <h1 className="text-[32px] font-bold pl-[12px]">Reports</h1> */}
                <h2 className="text-[#4c1d95] mb-4 text-[24px] font-bold pl-[12px]">Reports Overview</h2>
                <div className="flex justify-start gap-[10px] mb-8 flex-nowrap pl-[12px] overflow-x-auto mt-[16px]">
                    <div className="bg-[#f3e8ff] mt-[16px] border-l-6 border-[#6a0080] rounded-[12px] p-[20px] w-full max-w-[300px] min-w-[250px] shadow-[0_4px_10px_rgba(0,0,0,0.08)] text-left flex flex-col justify-between transition-transform duration-200 hover:-translate-y-[5px] gap-[6px]">
                        <h4 className="m-0 text-[0.95rem] text-[#6a0080] uppercase tracking-[0.5px] font-[700]">HR</h4>
                        <h3 className="my-[0.4rem] mt-0 mb-0 text-[20px] font-[700] text-black">Contacts Added</h3>
                        <p className="text-[0.95rem] my-[0.4rem] mb-4 text-[#555]">{summary.hrContacts} total HR contacts</p>
                    </div>
                    <div className="bg-[#f3e8ff] mt-[16px] border-l-6 border-[#6a0080] rounded-[12px] p-[20px] w-full max-w-[300px] min-w-[250px] shadow-[0_4px_10px_rgba(0,0,0,0.08)] text-left flex flex-col justify-between transition-transform duration-200 hover:-translate-y-[5px] gap-[6px]">
                        <h4 className="m-0 text-[0.95rem] text-[#6a0080] uppercase tracking-[0.5px] font-[700]">Marketing</h4>
                        <h3 className="my-[0.4rem] mt-0 mb-0 text-[20px] font-[700] text-black">Campaigns Sent</h3>
                        <p className="text-[0.95rem] my-[0.4rem] mb-4 text-[#555]">{summary.campaigns} campaigns completed</p>
                    </div>
                    <div className="bg-[#f3e8ff] mt-[16px] border-l-6 border-[#6a0080] rounded-[12px] p-[20px] w-full max-w-[300px] min-w-[250px] shadow-[0_4px_10px_rgba(0,0,0,0.08)] text-left flex flex-col justify-between transition-transform duration-200 hover:-translate-y-[5px] gap-[6px]">
                        <h4 className="m-0 text-[0.95rem] text-[#6a0080] uppercase tracking-[0.5px] font-[700]">Data Edits</h4>
                        <h3 className="my-[0.4rem] mt-0 mb-0 text-[20px] font-[700] text-black">Records Updated</h3>
                        <p className="text-[0.95rem] my-[0.4rem] mb-4 text-[#555]">{summary.recordsEdited} records edited</p>
                    </div>
                </div>
                <div className="flex gap-x-5 gap-y-3 items-end mb-5 flex-wrap pl-[12px]" style={{ wordSpacing: '0.2rem' }}>
                    <div className="flex-1 basis-[150px] max-w-[200px] gap-[6px]">
                        <label className="block mb-1 text-[13px] font-medium text-[#333] mt-[16px] gap-[6px]">Industry</label>
                        <input
                            className="w-full py-[6px] px-2 text-sm border border-[#d3cce3] rounded-md box-border bg-white pl-[12px] gap-[6px]"
                            type="text"
                            name="name"
                            value={filters.name}
                            onChange={handleChange}
                            placeholder="Enter Industry name"
                        />
                    </div>
                    <div className="flex-1 basis-[150px] max-w-[200px] gap-[6px]">
                        <label className="block mb-1 text-[13px] font-medium text-[#333] mt-[16px] gap-[6px]">Location</label>
                        <input
                            className="w-full py-[6px] px-2 text-sm border border-[#d3cce3] rounded-md box-border bg-white gap-[6px]"
                            type="text"
                            name="location"
                            value={filters.location}
                            onChange={handleChange}
                            placeholder="Enter city or location"
                        />
                    </div>
                    <div className="flex-1 basis-[150px] max-w-[200px]">
                        <label className="block mb-1 text-[13px] font-medium text-[#333] mt-[16px] gap-[6px]">Communication Status</label>
                        <select
                            className="w-full py-[6px] px-2 text-sm border border-[#d3cce3] rounded-md box-border bg-white gap-[6px]"
                            name="communication_status"
                            value={filters.communication_status}
                            onChange={handleChange}
                        >
                            <option value="">-- Select --</option>
                            <option value="Interested">Interested</option>
                            <option value="Not Interested">Not Interested</option>
                            <option value="Follow-up needed">Follow-up needed</option>
                            <option value="Pending call">Pending call</option>
                        </select>
                    </div>
                    <div className="flex-1 basis-[150px] max-w-[200px]">
                        <label className="block mb-1 text-[13px] font-medium text-[#333] mt-[16px] gap-[6px]">Lead Status</label>
                        <select
                            className="w-full py-[6px] px-2 text-sm border border-[#d3cce3] rounded-md box-border bg-white gap-[6px]"
                            name="lead_status"
                            value={filters.lead_status}
                            onChange={handleChange}
                        >
                            <option value="">-- Select --</option>
                            <option value="New">New</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Dropped">Dropped</option>
                            <option value="Closed">Closed</option>
                        </select>
                    </div>
                    <div className="flex-1 basis-[150px] max-w-[200px]">
                        <label className="block mb-1 text-[13px] font-medium text-[#333] mt-[16px] gap-[6px]">BD Name</label>
                        <input
                            className="w-full py-[6px] px-2 text-sm border border-[#d3cce3] rounded-md box-border bg-white gap-[6px]"
                            type="text"
                            name="bd_name"
                            value={filters.bd_name}
                            onChange={handleChange}
                            placeholder="Enter BD name"
                        />
                    </div>
                    <div className="flex-1 basis-[150px] max-w-[200px]">
                        <label className="block mb-1 text-[13px] font-medium text-[#333] mt-[16px] gap-[6px]">State</label>
                        <input
                            className="w-full py-[6px] px-2 text-sm border border-[#d3cce3] rounded-md box-border bg-white gap-[6px]"
                            type="text"
                            name="state"
                            value={filters.state}
                            onChange={handleChange}
                            placeholder="Enter state"
                        />
                    </div>
                </div>
                <div className="flex gap-[10px] mt-[10px] items-center pl-[12px]">
                    <button className="bg-[#6a1b9a] pl-[12px] text-white border-none rounded-lg py-[2px] px-[10px] cursor-pointer font-bold text-sm w-[150px] h-[35px] hover:bg-[#6a1b9a]" onClick={handleSearch}>Search</button>
                    <button className="bg-[#f4f1fa] pl-[12px] text-[black] border border-[#d3cce3] rounded-lg py-1 px-[10px] cursor-pointer font-bold text-sm w-[100px] h-[35px] hover:bg-[#eae4f4]" onClick={handleClear}>Clear</button>
                </div>
                <div className="activity-trends-container">
                    <h3 className="text-[#4c1d95] mb-4 pl-[12px] text-[20px] font-[700] mt-[12px]">Activity Trends</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-white rounded-xl p-5 shadow-[0_4px_12px_rgba(0,0,0,0.1)] overflow-x-hidden">
                        <div className="bg-white p-[15px] rounded-[10px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] relative min-w-[320px]">
                            <h4 className="text-lg font-semibold mb-2 text-[#4c1d95]">Lead Status Distribution</h4>
                            <canvas
                                className="max-w-full h-[300px]"
                                id="leadStatusChart"
                                ref={leadStatusChartRef}
                            ></canvas>
                        </div>
                        <div className="bg-white p-[15px] rounded-[10px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] relative min-w-[320px] flex flex-col items-center justify-center h-[350px]">
                            <h4 className="text-lg font-semibold mb-2 text-[#4c1d95]">Communication Status Overview</h4>
                            <canvas
                                className="w-[300px] h-[300px]"
                                id="communicationStatusChart"
                                ref={communicationStatusChartRef}
                            ></canvas>
                        </div>
                        <div className="bg-white p-[15px] rounded-[10px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] relative min-w-[320px]">
                            <h4 className="text-lg font-semibold mb-2 text-[#4c1d95]">Location-wise Lead Count</h4>
                            <canvas
                                className="max-w-full h-[300px]"
                                id="cityLeadChart"
                                ref={cityLeadChartRef}
                            ></canvas>
                        </div>
                        <div className="bg-white p-[15px] rounded-[10px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] relative min-w-[320px]">
                            <h4 className="text-lg font-semibold mb-2 text-[#4c1d95]">State-wise BD Activities</h4>
                            <canvas
                                className="max-w-full h-[300px]"
                                id="stateBdChart"
                                ref={stateBdChartRef}
                            ></canvas>
                        </div>
                    </div>
                </div>
                <div>
                    <h3 className="text-[#4c1d95] mb-4 pl-[12px] font-[700] mt-[16px]" style={{ wordSpacing: '0.2rem' }}>
                        Latest Communication
                    </h3>
                    <table
                        className="w-full mt-[16px] border-collapse mb-16 bg-white rounded-lg overflow-hidden shadow-[0_2px_6px_rgba(0,0,0,0.05)]"
                        style={{ wordSpacing: '0.2rem' }}
                    >
                        <thead className="pl-[12px]">
                            <tr>
                                <th className="py-3 px-4 text-left border-b border-[#e2e8f0] bg-[#f1e4ff] text-[#4c1d95] font-semibold pl-[12px]">
                                    BD Name
                                </th>
                                <th className="py-3 px-4 text-left border-b border-[#e2e8f0] bg-[#f1e4ff] text-[#4c1d95] font-semibold pl-[12px]">
                                    Company Name
                                </th>
                                <th className="py-3 px-4 text-left border-b border-[#e2e8f0] bg-[#f1e4ff] text-[#4c1d95] font-semibold pl-[12px]">
                                    Date
                                </th>
                                <th className="py-3 px-4 text-left border-b border-[#e2e8f0] bg-[#f1e4ff] text-[#4c1d95] font-semibold pl-[12px]">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {latestCommunication.slice(0, 3).map((item) => (
                                <tr key={item.id}>
                                    <td className="py-3 px-4 text-left border-b border-[#e2e8f0]">{item.bd_name}</td>
                                    <td className="py-3 px-4 text-left border-b border-[#e2e8f0]">{item.company_name}</td>
                                    <td className="py-3 px-4 text-left border-b border-[#e2e8f0]">
                                        {new Date(item.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </td>
                                    <td className="py-3 px-4 text-left border-b border-[#e2e8f0]">{item.communication_status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="mt-[30px] mb-2.5">
                    <h4 className="m-0 text-base font-semibold text-[#333] tracking-wide pl-[12px]" style={{ wordSpacing: '0.2rem' }}>
                        Detailed Report
                    </h4>
                </div>
                <div className="overflow-x-auto pl-[16px] mb-10">
                    <table className="min-w-full bg-white border border-gray-300">
                        <thead>
                            <tr className="bg-[#6a1b9a] text-white">
                                <th className="border p-2">ID</th>
                                <th className="border p-2">Company Name</th>
                                <th className="border p-2">Name</th>
                                <th className="border p-2">Location</th>
                                <th className="border p-2">Job Title</th>
                                <th className="border p-2">Address</th>
                                <th className="border p-2">Phone Number</th>
                                <th className="border p-2">URL</th>
                                <th className="border p-2">Contact Person Name</th>
                                <th className="border p-2">Email</th>
                                <th className="border p-2">State</th>
                                <th className="border p-2">Country</th>
                                <th className="border p-2">Pincode</th>
                                <th className="border p-2">GST Number</th>
                                <th className="border p-2">BD Name</th>
                                <th className="border p-2">Industry</th>
                                <th className="border p-2">Sub Industry</th>
                                <th className="border p-2">Communication Status</th>
                                <th className="border p-2">Notes</th>
                                <th className="border p-2">Meeting Date</th>
                                <th className="border p-2">Lead Status</th>
                                <th className="border p-2">Created At</th>
                                <th className="border p-2">Updated At</th>
                                <th className="border p-2">Mobile</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentRecords.length > 0 ? (
                                currentRecords.map((row, index) => (
                                    <tr key={index} className="border">
                                        <td className="border p-2">{row.id || 'N/A'}</td>
                                        <td className="border p-2">{row.company_name || 'N/A'}</td>
                                        <td className="border p-2">{row.name || 'N/A'}</td>
                                        <td className="border p-2">{row.location || 'N/A'}</td>
                                        <td className="border p-2">{row.job_title || 'N/A'}</td>
                                        <td className="border p-2">{row.address || 'N/A'}</td>
                                        <td className="border p-2">{row.phone_number || 'N/A'}</td>
                                        <td className="border p-2">{row.url || 'N/A'}</td>
                                        <td className="border p-2">{row.contact_person_name || 'N/A'}</td>
                                        <td className="border p-2">{row.email || 'N/A'}</td>
                                        <td className="border p-2">{row.state || 'N/A'}</td>
                                        <td className="border p-2">{row.country || 'N/A'}</td>
                                        <td className="border p-2">{row.pincode || 'N/A'}</td>
                                        <td className="border p-2">{row.gst_number || 'N/A'}</td>
                                        <td className="border p-2">{row.bd_name || 'N/A'}</td>
                                        <td className="border p-2">{row.industry || 'N/A'}</td>
                                        <td className="border p-2">{row.sub_industry || 'N/A'}</td>
                                        <td className="border p-2">{row.communication_status || 'N/A'}</td>
                                        <td className="border p-2">{row.notes || 'N/A'}</td>
                                        <td className="border p-2">{row.meeting_date ? new Date(row.meeting_date).toLocaleDateString('en-US') : 'N/A'}</td>
                                        <td className="border p-2">{row.lead_status || 'N/A'}</td>
                                        <td className="border p-2">{row.created_at ? new Date(row.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }) : 'N/A'}</td>
                                        <td className="border p-2">{row.updated_at ? new Date(row.updated_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }) : 'N/A'}</td>
                                        <td className="border p-2">{row.mobile || 'N/A'}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="24" className="border p-2 text-center">No data available</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="pl-[16px] mb-10 flex justify-center gap-4">
                    <button
                        onClick={handleBackPage}
                        className="px-4 py-2 bg-[#6a0080] text-white rounded disabled:bg-gray-400"
                        disabled={currentPage === 1}
                    >
                        Back
                    </button>
                    <button
                        onClick={handleNextPage}
                        className="px-4 py-2 bg-[#6a0080] text-white rounded disabled:bg-gray-400"
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </button>
                </div>
                <div className="mt-4 pl-[16px] flex justify-center gap-4">
                    <button
                        onClick={exportPDF}
                        className="px-4 py-2 bg-[#2f80ed] text-white rounded mr-2"
                    >
                        Export PDF
                    </button>
                    <button
                        onClick={exportCSV}
                        className="px-4 py-2 bg-[#27ae60] text-white rounded"
                    >
                        Export CSV
                    </button>
                    <button
                        onClick={handleClear}
                        className="px-4 py-2 bg-[#e53e3e] text-white rounded"
                    >
                        Reset
                    </button>
                </div>
                {error && <div className="text-red-500 mt-4 pl-[16px]">{error}</div>}
            </main>
        </div>
    );
}

export default Reports;
