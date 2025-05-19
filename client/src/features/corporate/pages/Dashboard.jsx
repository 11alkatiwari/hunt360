/* eslint-disable no-unused-vars */
import axios from 'axios';
import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, Legend, LineElement, LinearScale, PointElement, Tooltip } from 'chart.js';
import { useEffect, useState } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
const COLORS = ["#0088FE", "#FF8042"];

const baseURL = import.meta.env.VITE_API_BASE_URL
    ? `${import.meta.env.VITE_API_BASE_URL}/corporate`
    : 'http://localhost:3000/api/corporate';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement);

const Dashboard = () => {
    const [data, setData] = useState({});
    const [analytics, setAnalytics] = useState({ sectors: [], status: [] });
    const navigate = useNavigate();
    const [yearTrends, setYearTrends] = useState([]);
    const [companyTrends, setCompanyTrends] = useState([]);
    const [meetingNotifications, setMeetingNotifications] = useState([]);


    useEffect(() => {
        axios.get('http://localhost:3000/dashboard').then((res) => setData(res.data));
        axios.get('http://localhost:3000/analytics').then((res) => setAnalytics(res.data));
        axios.get("http://localhost:3000/trends/yearly").then((res) => setYearTrends(res.data));
        axios.get("http://localhost:3000/trends/company-year").then((res) => setCompanyTrends(res.data));


        fetch("http://localhost:3000/api/upcoming-meetings")

            .then((res) => res.json())
            .then((data) => {
                console.log("Fetched Meetings:", data); // Debugging
                setMeetingNotifications(data); // Works if backend returns plain array
            })
            .catch((err) => {
                console.error("Error fetching meetings:", err);
            });


    }, []);

    const filteredSectors = analytics.sectors.filter(item => item.count > 0);
    const filteredStatus = analytics.status.filter(item => item.count > 0);

    const sectorData = {
        labels: filteredSectors.map((item) => item.sectors),
        datasets: [
            {
                label: 'Sector Distribution',
                data: filteredSectors.map((item) => item.count),
                backgroundColor: ['#f72585', '#4361ee', '#fca311', '#4cc9f0', '#9d4edd'],
            },
        ],
    };

    const statusData = {
        labels: filteredStatus.map((item) => item.status),
        datasets: [
            {
                label: 'Status Breakdown',
                data: filteredStatus.map((item) => item.count),
                backgroundColor: ['#f72585', '#4361ee', '#fca311', '#00C49F'],
            },
        ],
    };

    const totalSectors = filteredSectors.reduce((acc, val) => acc + val.count, 0);
    const totalStatus = filteredStatus.reduce((acc, val) => acc + val.count, 0);

    const formatPercentage = (count, total) =>
        total ? `${Math.round((count / total) * 100)}%` : '0%';
    const hiringTrendData = {
        labels: yearTrends.map((item) => item.year),
        datasets: [
            {
                label: "Closed",
                data: yearTrends.map((item) => item.Closed),
                borderColor: "#00C49F",
                fill: false,
            },
            {
                label: "In Progress",
                data: yearTrends.map((item) => item.InProgress),
                borderColor: "#FF8042",
                fill: false,
            },
            {
                label: "Dropped",
                data: yearTrends.map((item) => item.Dropped),
                borderColor: "#f72585",
                fill: false,
            },
            {
                label: "New",
                data: yearTrends.map((item) => item.New),
                borderColor: "#4361ee",
                fill: false,
            },
        ],
    };

    const hiringTrendOptions = {
        responsive: true,
        plugins: {
            tooltip: {
                mode: 'index',
                intersect: false,
            },
            legend: {
                position: "top",
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: "Count",
                },
            },
            x: {
                title: {
                    display: true,
                    text: "Year",
                },
                ticks: {
                    padding: 20, // adds space between Y-axis and first point
                },
                grid: {
                    drawOnChartArea: false, // Optional: cleaner look
                },
                offset: true, // THIS pushes points away from edge!
            },

        },
    };
    const companyLabels = companyTrends.map((item) => item.year);
    const companyKeys = companyTrends.length > 0
        ? Object.keys(companyTrends[0]).filter((k) => k !== "year")
        : [];
    const companyDatasets = companyKeys.map((company, idx) => ({
        label: company,
        data: companyTrends.map((item) => item[company] || 0),
        borderColor: `hsl(${idx * 60}, 70%, 50%)`,
        fill: false,
    }));

    const companyChartData = {
        labels: companyLabels,
        datasets: companyDatasets,
    };

    const companyChartOptions = {
        responsive: true,
        plugins: {
            tooltip: {
                mode: 'index',
                intersect: false,
            },
            legend: {
                position: "top",
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                title: { display: true, text: "Count" },
            },
            x: {
                title: { display: true, text: "Year" },
                ticks: {
                    padding: 20, // adds space between Y-axis and first point
                },
                grid: {
                    drawOnChartArea: false, // Optional: cleaner look
                },
                offset: true, // THIS pushes points away from edge!
            },
        },
    };

    return (
        <div className="bg-[#f9fafb] font-sans m-0 p-4 sm:p-5 min-h-screen">
            <div className="flex-1 p-4 sm:p-6 relative overflow-hidden">
                <div className="p-4 sm:p-6 bg-[#f5efff] rounded-lg shadow-md min-h-[230px]">
                    <div className="absolute top-[30%] left-[40%] -translate-x-1/2 -translate-y-1/2 opacity-[0.08] -z-10 pointer-events-none">
                        <img src={`/logo.png`} alt="Watermark Logo" className="max-w-[900px] w-[200%] h-auto" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-semibold mb-2.5 text-[#4b0082] pl-4 tracking-wide">
                        Corporate Data Management
                    </h2>

                    <div className="mt-6 mb-2.5 pl-4">
                        <h4 className="m-0 text-sm sm:text-base font-semibold text-[#333] tracking-wide">
                            Upcoming Meetings
                        </h4>
                        {meetingNotifications.length > 0 ? (
                            <div className="bg-[#f0f4ff] border-l-4 border-[#4c8bf5] p-4 mt-4 rounded-lg mx-4 min-h-[150px] sm:min-h-[200px]">
                                <h3 className="mb-2 text-sm font-semibold tracking-wide">
                                    Upcoming Meetings
                                </h3>
                                <ul className="text-sm">
                                    {meetingNotifications.map((item, index) => (
                                        <li key={index} className="mb-1">
                                            <strong>{item.company_name}</strong> – {new Date(item.meeting_date).toLocaleDateString()}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : (
                            <div className="bg-[#f0f4ff] border-l-4 border-[#4c8bf5] p-4 mt-4 rounded-lg mx-4">
                                <h3 className="mb-2 text-sm font-semibold tracking-wide">
                                    No Upcoming Meetings
                                </h3>
                            </div>
                        )}
                    </div>

                    <div className="mt-6 mb-2.5 pl-4">
                        <h4 className="m-0 text-sm sm:text-base font-semibold text-[#333] tracking-wide">
                            Quick Actions
                        </h4>
                    </div>
                    <div className="flex flex-wrap justify-center items-center mt-2.5 gap-2 mx-4 mb-6">
                        <button
                            className="px-3 py-1.5 sm:px-4 sm:py-2 border-none rounded-md text-white cursor-pointer text-xs sm:text-sm bg-[#2f80ed] hover:bg-[#2563eb] tracking-wide"
                            onClick={() => navigate("/single-data-edit")}
                        >
                            Edit data
                        </button>
                        <button
                            className="px-3 py-1.5 sm:px-4 sm:py-2 border-none rounded-md text-white cursor-pointer text-xs sm:text-sm bg-[#27ae60] hover:bg-[#219653] tracking-wide"
                            onClick={() => navigate("/data-scraping")}
                        >
                            Import from Website
                        </button>
                        <button
                            className="px-3 py-1.5 sm:px-4 sm:py-2 border-none rounded-md text-white cursor-pointer text-xs sm:text-sm bg-[#a259ff] hover:bg-[#8b4ee6] tracking-wide"
                            onClick={() => navigate("/bulk-data-cleaning")}
                        >
                            Bulk Upload CSV
                        </button>
                        <button
                            className="px-3 py-1.5 sm:px-4 sm:py-2 border-none rounded-md text-white cursor-pointer text-xs sm:text-sm bg-[#eb3b7d] hover:bg-[#d4336f] tracking-wide"
                            onClick={() => navigate("/marketing-data")}
                        >
                            Send to Marketing
                        </button>
                    </div>
                </div>

                <div className="mt-6 mb-2.5">
                    <h4 className="m-0 text-sm sm:text-base font-semibold text-[#333] tracking-wide pl-3">
                        Overview
                    </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-8">
                    <div className="bg-[rgba(230,222,222,0.3)] rounded-[12px] p-4 sm:p-5 text-center shadow-[0_4px_8px_rgba(0,0,0,0.1)]">
                        <p className="text-xl sm:text-2xl font-bold text-[#2f80ed] tracking-wide">
                            {data?.total?.count || 0}
                        </p>
                        <h3 className="text-xs sm:text-sm font-semibold text-black tracking-wide">
                            Total Companies
                        </h3>
                    </div>
                    <div className="bg-[rgba(230,222,222,0.3)] rounded-[12px] p-4 sm:p-5 text-center shadow-[0_4px_8px_rgba(0,0,0,0.1)]">
                        <p className="text-xl sm:text-2xl font-bold text-[#27ae60] tracking-wide">
                            {data?.reviewed?.count || 0}
                        </p>
                        <h3 className="text-xs sm:text-sm font-semibold text-black tracking-wide">
                            Reviewed
                        </h3>
                    </div>
                    <div className="bg-[rgba(230,222,222,0.3)] rounded-[12px] p-4 sm:p-5 text-center shadow-[0_4px_8px_rgba(0,0,0,0.1)]">
                        <p className="text-xl sm:text-2xl font-bold text-[#f2994a] tracking-wide">
                            {data?.pending?.count || 0}
                        </p>
                        <h3 className="text-xs sm:text-sm font-semibold text-black tracking-wide">
                            Pending Review
                        </h3>
                    </div>
                    <div className="bg-[rgba(230,222,222,0.3)] rounded-[12px] p-4 sm:p-5 text-center shadow-[0_4px_8px_rgba(0,0,0,0.1)]">
                        <p className="text-xl sm:text-2xl font-bold text-[#eb5757] tracking-wide">
                            {data?.marketing?.count || 0}
                        </p>
                        <h3 className="text-xs sm:text-sm font-semibold text-black tracking-wide">
                            Assigned to Marketing
                        </h3>
                    </div>
                </div>

                <div className="mt-6 mb-2.5">
                    <h4 className="m-0 text-sm sm:text-base font-semibold text-[#333] tracking-wide pl-3">
                        KPIs
                    </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-8">
                    <div className="bg-[rgba(230,222,222,0.3)] rounded-[12px] p-4 sm:p-5 text-center shadow-[0_4px_8px_rgba(0,0,0,0.1)]">
                        <p className="text-xl sm:text-2xl font-bold text-[#2f80ed] tracking-wide">
                            {data?.growth?.rate || 0}%
                        </p>
                        <h3 className="text-xs sm:text-sm font-semibold text-black tracking-wide">
                            Growth Rate
                        </h3>
                    </div>
                    <div className="bg-[rgba(230,222,222,0.3)] rounded-[12px] p-4 sm:p-5 text-center shadow-[0_4px_8px_rgba(0,0,0,0.1)]">
                        <p className="text-xl sm:text-2xl font-bold text-[#f2994a] tracking-wide">
                            {data?.avgReview?.avg_review_time || 0} days
                        </p>
                        <h3 className="text-xs sm:text-sm font-semibold text-black tracking-wide">
                            Avg. Review Time
                        </h3>
                    </div>
                    <div className="bg-[rgba(230,222,222,0.3)] rounded-[12px] p-4 sm:p-5 text-center shadow-[0_4px_8px_rgba(0,0,0,0.1)]">
                        <p className="text-xl sm:text-2xl font-bold text-[#27ae60] tracking-wide">
                            {data?.completion?.completion_rate || 0}%
                        </p>
                        <h3 className="text-xs sm:text-sm font-semibold text-black tracking-wide">
                            Completion Rate
                        </h3>
                    </div>
                    <div className="bg-[rgba(230,222,222,0.3)] rounded-[12px] p-4 sm:p-5 text-center shadow-[0_4px_8px_rgba(0,0,0,0.1)]">
                        <p className="text-xl sm:text-2xl font-bold text-[#a259ff] tracking-wide">
                            {data?.members?.count || 0}
                        </p>
                        <h3 className="text-xs sm:text-sm font-semibold text-black tracking-wide">
                            Team Members
                        </h3>
                    </div>
                </div>

                <div className="mt-6 mb-2.5">
                    <h4 className="m-0 text-sm sm:text-base font-semibold text-[#333] tracking-wide pl-3">
                        Analytics
                    </h4>
                </div>
                <div className="flex flex-col gap-4 sm:gap-5 mt-6 bg-white p-4 sm:p-5 rounded-[20px]">
                    {/* Sector Distribution */}
                    <div className="w-full flex flex-col sm:flex-row gap-3 bg-white p-4 sm:p-5 rounded-[12px] shadow-[0_4px_10px_rgba(0,0,0,0.05)] min-w-[300px]">
                        <div className="w-full sm:w-[180px] bg-[#f3dffb] p-3 sm:p-4 rounded-[12px] shadow-[0_0_8px_rgba(0,0,0,0.05)]">
                            <h4 className="m-0 mb-2.5 font-semibold text-sm sm:text-base text-[#4b0082]">
                                Sector Distribution
                            </h4>
                            {analytics.sectors.map((s) => (
                                <p key={s.sectors} className="my-1.5 text-xs sm:text-sm text-[#444] tracking-wide">
                                    {s.sectors}
                                </p>
                            ))}
                        </div>
                        <div className="w-full h-[200px] sm:h-[250px]">
                            <Bar
                                data={sectorData}
                                options={{
                                    indexAxis: 'x',
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: { legend: { display: false } },
                                    scales: {
                                        y: { beginAtZero: true, title: { display: true, text: 'Count' } },
                                        x: { title: { display: true, text: 'Sectors' } },
                                    },
                                }}
                            />
                        </div>
                    </div>

                    {/* Status Breakdown */}
                    <div className="w-full flex flex-col sm:flex-row gap-3 bg-white p-4 sm:p-5 rounded-[12px] shadow-[0_4px_10px_rgba(0,0,0,0.05)] min-w-[300px]">
                        <div className="w-full sm:w-[180px] bg-[#f3dffb] p-3 sm:p-4 rounded-[12px] shadow-[0_0_8px_rgba(0,0,0,0.05)]">
                            <h4 className="m-0 mb-2.5 font-semibold text-sm sm:text-base text-[#4b0082]">
                                Status Breakdown
                            </h4>
                            {analytics.status.map((s) => (
                                <p key={s.status} className="my-1.5 text-xs sm:text-sm text-[#444] tracking-wide">
                                    {s.status}
                                </p>
                            ))}
                        </div>
                        <div className="w-full h-[200px] sm:h-[250px]">
                            <Bar
                                data={statusData}
                                options={{
                                    indexAxis: 'x',
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: { display: false },
                                        tooltip: {
                                            callbacks: {
                                                label: function (context) {
                                                    const count = context.raw;
                                                    const percentage = totalStatus ? ((count / totalStatus) * 100).toFixed(1) : 0;
                                                    return `${count}`;
                                                },
                                            },
                                        },
                                    },
                                    scales: {
                                        y: { beginAtZero: true, title: { display: true, text: 'Count' } },
                                        x: { title: { display: true, text: 'Status' } },
                                    },
                                }}
                            />
                        </div>
                    </div>

                    {/* Year-wise Hiring Trend */}
                    <div className="w-full flex flex-col sm:flex-row gap-3 bg-white p-4 sm:p-5 rounded-[12px] shadow-[0_4px_10px_rgba(0,0,0,0.05)] min-w-[300px]">
                        <div className="w-full sm:w-[180px] bg-[#f3dffb] p-3 sm:p-4 rounded-[12px] shadow-[0_0_8px_rgba(0,0,0,0.05)]">
                            <h4 className="m-0 mb-2.5 font-semibold text-sm sm:text-base text-[#4b0082]">
                                Year-wise Hiring Trend
                            </h4>
                            <div>
                                {yearTrends?.map((item, idx) => (
                                    <div key={idx} className="mb-1.5 text-xs sm:text-sm text-[#444] tracking-wide">
                                        <strong>{item.year}:</strong> New: {item.New}, Closed: {item.Closed}, In Progress: {item.InProgress}, Dropped: {item.Dropped}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="w-full h-[200px] sm:h-[250px]">
                            <Line data={hiringTrendData} options={hiringTrendOptions} />
                        </div>
                    </div>

                    {/* Company-Year Trends */}
                    <div className="w-full flex flex-col sm:flex-row gap-3 bg-white p-4 sm:p-5 rounded-[12px] shadow-[0_4px_10px_rgba(0,0,0,0.05)] min-w-[300px]">
                        <div className="w-full sm:w-[180px] bg-[#f3dffb] p-3 sm:p-4 rounded-[12px] shadow-[0_0_8px_rgba(0,0,0,0.05)]">
                            <h4 className="m-0 mb-2.5 font-semibold text-sm sm:text-base text-[#4b0082]">
                                Company-Year Trends
                            </h4>
                            <div>
                                {companyTrends?.map((item, idx) => (
                                    <div key={idx} className="mb-1.5 text-xs sm:text-sm text-[#444] tracking-wide">
                                        <strong>{item.year}:</strong>{" "}
                                        {Object.entries(item)
                                            .filter(([key]) => key !== "year")
                                            .map(([company, total]) => `${company}: ${total}`)
                                            .join(", ")}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="w-full h-[200px] sm:h-[250px]">
                            <Line data={companyChartData} options={companyChartOptions} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;