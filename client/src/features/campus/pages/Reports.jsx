/* eslint-disable no-unused-vars */
import {
    ArcElement,
    Chart,
    Chart as ChartJS,
    Legend,
    Tooltip,
    registerables,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { useState } from 'react';
import { FaChartBar, FaChartLine, FaMapMarkerAlt } from 'react-icons/fa';
import College_chart from '../reports/CollegeChart';
import Hr_chart from '../reports/HRChart';
import Marketing_chart from '../reports/MarketingChart';
Chart.register(...registerables);

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);


const baseURL = import.meta.env.VITE_API_BASE_URL
    ? `${import.meta.env.VITE_API_BASE_URL}/campus`
    : 'https://hunt360-3.onrender.com/api/campus';

const Reports = () => {
    const [activeTab, setActiveTab] = useState('college');
    const [year, setYear] = useState('');
    const [month, setMonth] = useState('');
    const [state, setState] = useState('');
    const [district, setDistrict] = useState('');
    const [course, setCourse] = useState('');
    const [chartData, setChartData] = useState([]);

    const handleUpdateReport = async () => {
        const response = await fetch(
            `${baseURL}/chart-data?` +
            new URLSearchParams({
                year,
                month,
                state,
                district,
                course,
            }),
            {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            }
        );
        const data = await response.json();
        setChartData(data.chartData);
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    return (
        <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-3 sm:mb-4 md:mb-5">
                Reports & Analytics
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-gray-500 font-semibold mt-1">
                Comprehensive insights and visualizations of educational
                institution data
            </p>

            {/* Tabs */}

            <div className="grid grid-cols-3 gap-3 p-2 rounded-2xl bg-gray-200 mb-5">
                {[
                    { key: 'college', icon: <FaChartBar />, label: 'College' },
                    {
                        key: 'marketing',
                        icon: <FaMapMarkerAlt />,
                        label: 'Marketing Team',
                    },
                    { key: 'hr', icon: <FaChartLine />, label: 'HR Team' },
                ].map(({ key, icon, label }) => (
                    <div
                        key={key}
                        className={`py-2 sm:py-3 px-2 sm:px-4 md:px-6 rounded-xl text-sm sm:text-base md:text-lg flex gap-2 sm:gap-3 items-center justify-center cursor-pointer transition-all duration-300 ${activeTab === key
                            ? 'bg-white text-black'
                            : 'text-gray-700'
                            }`}
                        onClick={() => handleTabChange(key)}
                    >
                        {icon} <span>{label}</span>
                    </div>
                ))}
            </div>

            {/* Tab Content */}
            <div>
                {activeTab === 'college' && <College_chart />}
                {activeTab === 'marketing' && <Marketing_chart />}
                {activeTab === 'hr' && <Hr_chart />}
            </div>
        </div>
    );
};

export default Reports;
