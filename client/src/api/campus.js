import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
    ? `${import.meta.env.VITE_API_BASE_URL}/campus`
    : "https://hunt360-3.onrender.com/api/campus";

const buildQueryParams = (filters) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
    });
    return params.toString();
};
//checking api 

export const fetchCollegeCount = async (filters) => {
    const url = `${API_BASE_URL}/college-count?${buildQueryParams(filters)}`;
    console.log('Fetching college count from:', url);
    const response = await fetch(url);
    if (!response.ok) {
        console.error('Failed to fetch college count:', response.status, response.statusText);
        throw new Error('Failed to fetch college count');
    }
    return response.json();
};

export const fetchTotalScraped = async () => {
    const response = await fetch(`${API_BASE_URL}/total-scraped`);
    if (!response.ok) throw new Error('Failed to fetch total scraped');
    return response.json();
};

export const fetchTotalCandidates = async (filters) => {
    const response = await fetch(
        `${API_BASE_URL}/total-candidates?${buildQueryParams(filters)}`
    );
    if (!response.ok) throw new Error('Failed to fetch total candidates');
    return response.json();
};

export const fetchTotalPlacedCandidates = async (filters) => {
    const response = await fetch(
        `${API_BASE_URL}/placed-candidates?${buildQueryParams(filters)}`
    );
    if (!response.ok) throw new Error('Failed to fetch placed candidates');
    return response.json();
};

export const fetchTotalHired = async (filters) => {
    const response = await fetch(
        `${API_BASE_URL}/total-hired?${buildQueryParams(filters)}`
    );
    if (!response.ok) throw new Error('Failed to fetch total hired');
    return response.json();
};

export const fetchLastFiveRows = async () => {
    const response = await fetch(`${API_BASE_URL}/last-5-rows`);
    if (!response.ok) throw new Error('Failed to fetch last 5 rows');
    return response.json();
};

export const fetchMteamChart = async () => {
    const response = await axios.get(`${API_BASE_URL}/marketing-team-chart`);
    return response.data;
};

export const fetchHrteamChart = async () => {
    const response = await axios.get(`${API_BASE_URL}/hr-team-chart`);
    return response.data;
};

export const fetchCourseCollege = async () => {
    const response = await fetch(`${API_BASE_URL}/course-college`);
    if (!response.ok) throw new Error('Failed to fetch course-college data');
    return response.json();
};

export const addCollege = async (data) => {
    const response = await axios.post(`${API_BASE_URL}/add-college`, data);
    if (response.status !== 200) throw new Error('Failed to add college');
    return response.data;
};

export const fetchMeetings = async () => {
    const response = await axios.get(`${API_BASE_URL}/meetings`);
    return response.data;
};

export const addMeeting = async (meeting) => {
    const response = await axios.post(`${API_BASE_URL}/meetings`, meeting);
    if (response.status !== 201) throw new Error('Failed to add meeting');
    return response.data;
};

export const updateMeeting = async (meeting, index) => {
    const response = await axios.put(
        `${API_BASE_URL}/meetings/${index}`,
        meeting
    );
    if (response.status !== 200) throw new Error('Failed to update meeting');
    return response.data;
};

export const deleteMeeting = async (index) => {
    const response = await axios.delete(`${API_BASE_URL}/meetings/${index}`);
    if (response.status !== 200) throw new Error('Failed to delete meeting');
    return response.data;
};

export const fetchScrapeHistory = async () => {
    const response = await axios.get(`${API_BASE_URL}/distinct`);
    if (!response.ok) throw new Error('Failed to fetch scrape history');
    return response.data;
};

export const scrapeData = async (payload) => {
    const response = await axios.post(`${API_BASE_URL}/scrape`, payload);
    if (!response.ok) throw new Error('Failed to scrape data');
    return response.data;
};

export const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.post(`${API_BASE_URL}/upload`, formData);
    if (!response.ok) throw new Error('Failed to upload file');
    return response.data.message;
};

export const searchColleges = async (params) => {
    const response = await axios.get(`${API_BASE_URL}/search`, { params });
    return response.data;
};

export const updateCollege = async (collegeId, data) => {
    const response = await axios.put(
        `${API_BASE_URL}/update/${collegeId}`,
        data
    );
    return response.data;
};

export const deleteCollege = async (collegeId) => {
    const response = await axios.delete(`${API_BASE_URL}/delete/${collegeId}`);
    return response.data;
};
