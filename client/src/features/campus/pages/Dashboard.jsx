/* eslint-disable no-unused-vars */
import {
    BarChart2,
    Building,
    Calendar,
    Plus,
    RefreshCw,
    Search,
    TrendingUp,
    Users,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import * as apiService from '../../../api/campus.js';
import Card from '../../../components/campus/Card';
import InsertForm from '../forms/InsertForm.jsx';

const initialData = [
    { name: 'Colleges', value: 2000 },
    { name: 'Scraped', value: 5 },
    { name: 'Contacted', value: 1000 },
    { name: 'Students', value: 500 },
    { name: 'Placed', value: 100 },
];

// Custom hook for current time
const useCurrentTime = () => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return currentTime;
};

// Custom hook for fetching dashboard data
const useDashboardData = (filters) => {
    const [data, setData] = useState({
        totalColleges: 0,
        totalScraped: 0,
        totalCandidates: 0,
        totalPlacedCandidates: 0,
        totalHired: 0,
        rows: [],
        chartData: null,
        hrChartData: null,
        courseChartData: null,
        error: '',
        loading: false,
    });

    const fetchData = useCallback(async () => {
        setData((prev) => ({ ...prev, loading: true, error: '' }));
        try {
            const [
                collegeCount,
                totalScraped,
                totalCandidates,
                totalPlacedCandidates,
                totalHired,
                lastFiveRows,
                mteamChart,
                hrteamChart,
                courseCollege,
            ] = await Promise.all([
                apiService.fetchCollegeCount(filters),
                apiService.fetchTotalScraped(),
                apiService.fetchTotalCandidates(filters),
                apiService.fetchTotalPlacedCandidates(filters),
                apiService.fetchTotalHired(filters),
                apiService.fetchLastFiveRows(),
                apiService.fetchMteamChart(),
                apiService.fetchHrteamChart(),
                apiService.fetchCourseCollege(),
            ]);

            setData({
                totalColleges: collegeCount.total || 0,
                totalScraped: totalScraped.total || 0,
                totalCandidates: totalCandidates.total_candidates || 0,
                totalPlacedCandidates:
                    totalPlacedCandidates.total_candidates || 0,
                totalHired: totalHired.total_hired || 0,
                rows: Array.isArray(lastFiveRows) ? lastFiveRows : [],
                chartData: {
                    labels: mteamChart.map((item) => item.Marketing_team_name),
                    datasets: [
                        {
                            label: 'Total College',
                            data: mteamChart.map((item) => item.total_college),
                            backgroundColor: 'rgba(190, 178, 198, 0.7)',
                            borderWidth: 1,
                        },
                    ],
                },
                hrChartData: {
                    labels: hrteamChart.map((item) => item.Hr_team_name),
                    datasets: [
                        {
                            label: 'Total Hired Students',
                            data: hrteamChart.map((item) => item.total_hired),
                            fill: false,
                            borderColor: 'rgba(75, 192, 192, 1)',
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            borderWidth: 2,
                            tension: 0.4,
                        },
                    ],
                },
                courseChartData: {
                    labels: courseCollege.map((item) => item.Course),
                    datasets: [
                        {
                            label: 'Total Colleges',
                            data: courseCollege.map((item) =>
                                Number(item.total_College)
                            ),
                            backgroundColor: 'rgba(190, 178, 198, 0.7)',
                            borderWidth: 1,
                        },
                    ],
                },
                error: '',
                loading: false,
            });
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setData((prev) => ({
                ...prev,
                error: 'Unable to load dashboard data',
                loading: false,
            }));
        }
    }, [filters]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return data;
};

function Dashboard() {
    const navigate = useNavigate();
    const currentTime = useCurrentTime();
    const [filters, setFilters] = useState({
        year: '',
        team: '',
        state: '',
        month: '',
        district: '',
        course: '',
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const {
        totalColleges,
        totalScraped,
        totalCandidates,
        totalPlacedCandidates,
        totalHired,
        rows,
        chartData,
        hrChartData,
        courseChartData,
        error,
        loading,
    } = useDashboardData(filters);

    // Memoize chart options to prevent re-renders
    const chartOptions = useMemo(
        () => ({
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                },
            },
        }),
        []
    );

    const courseChartOptions = useMemo(
        () => ({
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top' },
                title: { display: true, text: 'Number of Colleges by Course' },
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 },
                },
                x: {
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45,
                    },
                },
            },
        }),
        []
    );

    // Handle filter changes
    const handleFilterChange = useCallback((key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    }, []);

    return (
        <div className="p-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-3 sm:mb-4 md:mb-5">
                Campus Recruitment Dashboard
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-gray-500 font-semibold mt-1">
                Manage colleges, companies, and recruitment activities in one
                place.
            </p>
            <div className="flex flex-wrap items-center gap-2 text-gray-400 text-sm sm:text-base">
                <Calendar />
                <p className="font-semibold mt-1 sm:mt-0">
                    {currentTime.toLocaleDateString()} |{' '}
                    {currentTime.toLocaleTimeString()}
                </p>
            </div>

            {/* Filters */}
            <div className="mt-4 flex flex-wrap gap-4">
                <select
                    value={filters.year}
                    onChange={(e) => handleFilterChange('year', e.target.value)}
                    className="p-2 border rounded-lg"
                >
                    <option value="">Select Year</option>
                    {[...Array(5)].map((_, i) => {
                        const year = new Date().getFullYear() - i;
                        return (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        );
                    })}
                </select>
                <select
                    value={filters.month}
                    onChange={(e) =>
                        handleFilterChange('month', e.target.value)
                    }
                    className="p-2 border rounded-lg"
                >
                    <option value="">Select Month</option>
                    {[
                        'January',
                        'February',
                        'March',
                        'April',
                        'May',
                        'June',
                        'July',
                        'August',
                        'September',
                        'October',
                        'November',
                        'December',
                    ].map((month, index) => (
                        <option key={month} value={index + 1}>
                            {month}
                        </option>
                    ))}
                </select>
                <input
                    type="text"
                    placeholder="State"
                    value={filters.state}
                    onChange={(e) =>
                        handleFilterChange('state', e.target.value)
                    }
                    className="p-2 border rounded-lg"
                />
                <input
                    type="text"
                    placeholder="District"
                    value={filters.district}
                    onChange={(e) =>
                        handleFilterChange('district', e.target.value)
                    }
                    className="p-2 border rounded-lg"
                />
                <input
                    type="text"
                    placeholder="Course"
                    value={filters.course}
                    onChange={(e) =>
                        handleFilterChange('course', e.target.value)
                    }
                    className="p-2 border rounded-lg"
                />
                <input
                    type="text"
                    placeholder="Team"
                    value={filters.team}
                    onChange={(e) => handleFilterChange('team', e.target.value)}
                    className="p-2 border rounded-lg"
                />
            </div>

            {/* Data Cards */}
            <div className="w-full mt-5 overflow-x-auto">
                <div className="flex gap-4 min-w-max px-2">
                    <Card className="min-w-[250px]">
                        <div className="flex items-center gap-5">
                            <Building className="w-14 h-14 shadow-md rounded-2xl p-2 bg-purple-100 hover:bg-purple-200 text-purple-800" />
                            <div>
                                <h1 className="text-lg font-semibold text-gray-400 mb-1">
                                    Total Colleges
                                </h1>
                                <h1 className="text-3xl font-bold">
                                    {loading ? 'Loading...' : totalColleges}
                                </h1>
                            </div>
                        </div>
                    </Card>
                    <Card className="min-w-[250px]">
                        <div className="flex items-center gap-5">
                            <TrendingUp className="w-14 h-14 shadow-md rounded-2xl p-2 bg-green-100 hover:bg-green-200 text-green-800" />
                            <div>
                                <h1 className="text-lg font-semibold text-gray-400">
                                    Total Data Scraped
                                </h1>
                                <h2 className="text-sm font-semibold text-gray-300 mb-1">
                                    State wise
                                </h2>
                                <h1 className="text-3xl font-bold">
                                    {loading ? 'Loading...' : totalScraped}
                                </h1>
                            </div>
                        </div>
                    </Card>
                    <Card className="min-w-[250px]">
                        <div className="flex items-center gap-5">
                            <BarChart2 className="w-14 h-14 shadow-md rounded-2xl p-2 bg-blue-100 hover:bg-blue-200 text-blue-800" />
                            <div>
                                <h1 className="text-lg font-semibold text-gray-400">
                                    Total Candidates
                                </h1>
                                <h1 className="text-3xl font-bold">
                                    {loading ? 'Loading...' : totalCandidates}
                                </h1>
                            </div>
                        </div>
                    </Card>
                    <Card className="min-w-[250px]">
                        <div className="flex items-center gap-5">
                            <Users className="w-14 h-14 shadow-md rounded-2xl p-2 bg-pink-100 hover:bg-pink-200 text-pink-800" />
                            <div>
                                <h1 className="text-lg font-semibold text-gray-400">
                                    Total Candidates Placed
                                </h1>
                                <h1 className="text-3xl font-bold">
                                    {loading
                                        ? 'Loading...'
                                        : totalPlacedCandidates}
                                </h1>
                            </div>
                        </div>
                    </Card>
                    <Card className="min-w-[250px]">
                        <div className="flex items-center gap-5">
                            <Users className="w-14 h-14 shadow-md rounded-2xl p-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800" />
                            <div>
                                <h1 className="text-lg font-semibold text-gray-400">
                                    Total Students Hired
                                </h1>
                                <h1 className="text-3xl font-bold">
                                    {loading ? 'Loading...' : totalHired}
                                </h1>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Recent Activities */}
            <div className="mt-5">
                <p className="text-2xl font-bold text-gray-800 mb-5">
                    Recent Activities
                </p>
                <Card className="max-h-[300px] overflow-y-auto shadow-md rounded-2xl p-4">
                    <p className="text-lg font-semibold text-gray-700 mb-4">
                        Latest Data Scraped
                    </p>
                    {error ? (
                        <p className="text-red-600">{error}</p>
                    ) : loading ? (
                        <p className="text-gray-500 text-center">
                            Loading data...
                        </p>
                    ) : rows.length > 0 ? (
                        <div className="w-full overflow-x-auto">
                            <table className="min-w-full border border-gray-300 text-sm">
                                <thead className="bg-gray-100 sticky top-0 z-10">
                                    <tr>
                                        {Object.keys(rows[0]).map(
                                            (key, i, arr) => (
                                                <th
                                                    key={key}
                                                    className={`px-2 py-1 text-left text-gray-600 ${i !== arr.length - 1
                                                            ? 'border-r border-gray-300'
                                                            : ''
                                                        }`}
                                                >
                                                    {key}
                                                </th>
                                            )
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((row, rowIndex) => (
                                        <tr
                                            key={rowIndex}
                                            className="hover:bg-gray-50"
                                        >
                                            {Object.values(row).map(
                                                (value, colIndex, arr) => (
                                                    <td
                                                        key={colIndex}
                                                        className={`px-2 py-1 text-gray-700 whitespace-nowrap ${colIndex !==
                                                                arr.length - 1
                                                                ? 'border-r border-gray-200'
                                                                : ''
                                                            }`}
                                                    >
                                                        {value}
                                                    </td>
                                                )
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center">
                            No data found.
                        </p>
                    )}
                </Card>
            </div>

            {/* Charts */}
            <div className="mt-5 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Card className="p-4">
                        <h3 className="text-xl font-semibold mb-4">
                            Colleges Reached By Each Marketing Team
                        </h3>
                        <div className="relative w-full h-[250px] sm:h-[300px] md:h-[350px]">
                            {loading ? (
                                <p className="text-gray-500">
                                    Loading chart...
                                </p>
                            ) : chartData ? (
                                <Bar data={chartData} options={chartOptions} />
                            ) : (
                                <p className="text-gray-500">
                                    No data available for chart.
                                </p>
                            )}
                        </div>
                    </Card>
                    <Card className="p-4">
                        <h3 className="text-xl font-semibold mb-4">
                            HR Team-wise Candidates Hired
                        </h3>
                        <div className="relative w-full h-[250px] sm:h-[300px] md:h-[350px]">
                            {loading ? (
                                <p className="text-gray-500">
                                    Loading chart...
                                </p>
                            ) : hrChartData ? (
                                <Line
                                    data={hrChartData}
                                    options={chartOptions}
                                />
                            ) : (
                                <p className="text-gray-500">
                                    No data available for chart.
                                </p>
                            )}
                        </div>
                    </Card>
                </div>
                <Card className="p-4">
                    <h3 className="text-xl font-semibold mb-4">
                        Course vs College Bar Chart
                    </h3>
                    <div className="relative w-full h-[250px] sm:h-[300px] md:h-[400px]">
                        {loading ? (
                            <p className="text-gray-500">Loading chart...</p>
                        ) : courseChartData ? (
                            <Bar
                                data={courseChartData}
                                options={courseChartOptions}
                            />
                        ) : (
                            <p className="text-gray-500">
                                Loading chart data...
                            </p>
                        )}
                    </div>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-4 rounded-2xl shadow-md mt-10">
                <p className="text-xl font-bold text-gray-600 mb-5">
                    Quick Actions
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <button
                        onClick={() => navigate('/dashboard/campus/single-editing')}
                        className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-950 text-white font-medium py-2 px-3 rounded-lg transition shadow-md text-sm sm:text-base"
                    >
                        <Search size={18} />
                        Search Colleges/Companies
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-950 text-white font-medium py-2 px-3 rounded-lg transition shadow-md text-sm sm:text-base"
                    >
                        <Plus size={18} />
                        Add Manual Entry
                    </button>
                    <button
                        onClick={() => navigate('/dashboard/campus/data-scraping')}
                        className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-950 text-white font-medium py-2 px-3 rounded-lg transition shadow-md text-sm sm:text-base"
                    >
                        <RefreshCw size={18} />
                        Start New Scraping
                    </button>
                    <button
                        onClick={() => navigate('/dashboard/campus/reports')}
                        className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-950 text-white font-medium py-2 px-3 rounded-lg transition shadow-md text-sm sm:text-base"
                    >
                        <BarChart2 size={18} />
                        View Full Report
                    </button>
                </div>
                {isModalOpen && (
                    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
                        <div className="relative bg-white p-6 rounded-lg shadow-lg w-[95%] max-w-4xl max-h-[90vh] overflow-y-auto">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="absolute top-3 right-4 text-gray-500 hover:text-gray-700 text-2xl"
                            >
                                ×
                            </button>
                            <InsertForm
                                onClose={() => setIsModalOpen(false)}
                                onAddRow={() => setIsModalOpen(false)}
                            />
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
}

export default Dashboard;
