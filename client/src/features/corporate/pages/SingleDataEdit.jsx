/* eslint-disable react-hooks/exhaustive-deps */
import axios from 'axios';
import { useEffect, useState } from 'react';
import { FaEdit, FaEye } from 'react-icons/fa';

const baseURL = 'https://hunt360-3.onrender.com/api/corporate';

const SingleDataEdit = () => {
    const [showForm, setShowForm] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showView, setShowView] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [filters, setFilters] = useState({ name: "", city: "", job_title: "", updated: "" });
    const [results, setResults] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedCompany, setSelectedCompany] = useState(null);

    const handleEdit = (company) => {
        setSelectedCompany(company);
        setShowForm(true);
    };

    const closeForm = () => setShowConfirmModal(true);
    const confirmClose = () => {
        setShowForm(false);
        setShowConfirmModal(false);
        setSelectedCompany(null);
    };
    const cancelClose = () => setShowConfirmModal(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleSearch = async (page = 1) => {
        try {
            const params = new URLSearchParams();
            if (filters.name) params.append('name', filters.name);
            if (filters.city) params.append('city', filters.city);
            if (filters.job_title) params.append('job_title', filters.job_title);
            if (filters.updated) params.append('updated', filters.updated);
            params.append('page', page);
            params.append('limit', 10);

            const response = await axios.get(`${baseURL}/search-companies?${params}`);
            setResults(response.data.data || []);
            setTotalPages(response.data.totalPages || 1);
            setCurrentPage(response.data.currentPage || 1);
        } catch (error) {
            console.error("Search failed:", error);
        }
    };

    const clearFilters = () => {
        setFilters({ name: "", city: "", job_title: "", updated: "" });
        setResults([]);
        setCurrentPage(1);
        setTotalPages(1);
    };

    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > totalPages) return;
        setCurrentPage(newPage);
        handleSearch(newPage);
    };

    useEffect(() => {
        if (results.length > 0) {
            handleSearch(currentPage);
        }
    }, []);

    useEffect(() => {
        const savedResults = JSON.parse(sessionStorage.getItem("savedResults") || "[]");
        const savedFilters = JSON.parse(sessionStorage.getItem("savedFilters") || "{}");

        if (savedResults.length > 0) {
            setResults(savedResults);
            setFilters(savedFilters);
        }
    }, []);

    useEffect(() => {
        return () => {
            sessionStorage.setItem("savedResults", JSON.stringify(results));
            sessionStorage.setItem("savedFilters", JSON.stringify(filters));
        };
    }, [results, filters]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${baseURL}/save-form`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(selectedCompany),
            });

            const data = await res.json();

            if (res.ok) {
                alert("Form data saved successfully!");
                const updatedCompany = {
                    ...selectedCompany,
                    updated_at: new Date().toISOString(),
                };

                const updatedResults = results.map((company) =>
                    company.company_name === selectedCompany.company_name &&
                    company.location === selectedCompany.location
                        ? updatedCompany
                        : company
                );

                setResults(updatedResults);
                setSelectedCompany(updatedCompany);
                setShowForm(false);
            } else {
                alert("Error: " + data.error);
            }
        } catch (err) {
            alert("Network error. Try again later.");
            console.error("Submit error:", err);
        }
    };

    const handleView = (company) => {
        setSelectedCompany(company);
        setShowView(true);
    };

    const handleAddCompany = async () => {
        try {
            const res = await fetch(`${baseURL}/add-company`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(selectedCompany),
            });

            const data = await res.json();

            if (res.ok) {
                alert("Company added successfully!");
                const newCompany = {
                    ...selectedCompany,
                    id: data.insertId,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                };

                setResults((prevResults) => [newCompany, ...prevResults]);
                setShowAddForm(false);
                setSelectedCompany(null);
            } else {
                alert("Error: " + data.error);
            }
        } catch (err) {
            alert("Network error. Try again later.");
            console.error("Add company error:", err);
        }
    };

    const handleAddNewCompanyClick = () => {
        setSelectedCompany({
            company_name: "",
            location: "",
            address: "",
            phone_number: "",
            website_link: "",
            job_title: "",
            gst_number: "",
            contact_person_name: "",
            email: "",
            state: "",
            country: "",
            pincode: "",
            sub_industry: "",
            post_date: "",
            updated: "",
        });
        setShowAddForm(true);
    };

    return (
        <div className="bg-purple-100 p-4 sm:p-6 md:p-8 rounded-xl max-w-full sm:max-w-5xl md:max-w-6xl font-sans pt-10 sm:pt-12 ml-2 sm:ml-4">
            <h2 className="text-[#17151b] text-xl sm:text-2xl font-bold mb-4">Data Edit</h2>
            <div className="flex flex-col sm:flex-row gap-2 flex-wrap items-start sm:items-center">
                <div className="flex flex-col gap-1 mr-2 w-full sm:w-auto">
                    <label className="block mb-1 font-bold text-[#17151b] text-sm sm:text-base">Job Title</label>
                    <input
                        type="text"
                        name="job_title"
                        value={filters.job_title}
                        onChange={handleChange}
                        placeholder="Enter Job Title"
                        className="w-full sm:w-[200px] md:w-[250px] p-2 border border-purple-300 rounded-[6px] outline-none text-sm sm:text-base"
                    />
                </div>
                <div className="flex flex-col gap-1 mr-2 w-full sm:w-auto">
                    <label className="block mb-1 font-bold text-[#17151b] text-sm sm:text-base">Company Name</label>
                    <input
                        type="text"
                        name="name"
                        value={filters.name}
                        onChange={handleChange}
                        placeholder="Enter company name"
                        className="w-full sm:w-[200px] md:w-[250px] p-2 border border-purple-300 rounded-[6px] outline-none text-sm sm:text-base"
                    />
                </div>
                <div className="flex flex-col gap-1 mr-2 w-full sm:w-auto">
                    <label className="block mb-1 font-bold text-[#17151b] text-sm sm:text-base">Location/City</label>
                    <input
                        type="text"
                        name="city"
                        value={filters.city}
                        onChange={handleChange}
                        placeholder="Enter location or city"
                        className="w-full sm:w-[200px] md:w-[200px] p-2 border border-purple-300 rounded-[6px] outline-none text-sm sm:text-base"
                    />
                </div>
                <div className="flex flex-col gap-1 mr-2 w-full sm:w-auto">
                    <label className="block mb-1 font-bold text-[#17151b] text-sm sm:text-base">Updated</label>
                    <select
                        name="updated"
                        value={filters.updated}
                        onChange={handleChange}
                        className="w-full sm:w-[200px] md:w-[250px] p-2 border border-purple-300 rounded-[6px] text-sm sm:text-base"
                    >
                        <option value="">Select</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                    </select>
                </div>
                <div className="flex gap-2 items-center mt-2 w-full sm:w-auto">
                    <button
                        className="bg-[#6A1B9A] text-white py-2 px-4 rounded-md text-sm font-bold hover:opacity-90 cursor-pointer w-full sm:w-auto"
                        onClick={() => handleSearch(1)}
                    >
                        Search
                    </button>
                    <button
                        className="bg-[#d3cce3] hover:bg-[#D1D5DB] text-black py-2 px-4 rounded-md text-sm font-bold cursor-pointer w-full sm:w-auto"
                        onClick={clearFilters}
                    >
                        Clear Filters
                    </button>
                </div>
            </div>
            <div className="mt-4">
                <button
                    className="bg-[#6A1B9A] text-white py-2 px-4 rounded-md text-sm font-medium hover:opacity-90 flex items-center gap-2"
                    onClick={handleAddNewCompanyClick}
                >
                    <span className="text-lg">+</span>
                    Add New Company
                </button>
            </div>

            <div className="bg-white p-4 rounded-[8px] shadow-[0_2px_5px_rgba(0,0,0,0.1)] mt-4 overflow-x-auto">
                <h3 className="text-[#17151b] text-lg font-bold mb-4">Search Results</h3>
                <table className="w-full min-w-[600px]">
                    <thead>
                        <tr>
                            <th className="bg-[#6a1b9a] text-white p-3 border border-gray-300 text-sm">Company Name</th>
                            <th className="bg-[#6a1b9a] text-white p-3 border border-gray-300 text-sm">Location</th>
                            <th className="bg-[#6a1b9a] text-white p-3 border border-gray-300 text-sm">Updated</th>
                            <th className="bg-[#6a1b9a] text-white p-3 border border-gray-300 text-sm">Last Modified</th>
                            <th className="bg-[#6a1b9a] text-white p-3 border border-gray-300 text-sm">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {results.map((company, index) => (
                            <tr key={index} className="border-b border-[#d3cce3]">
                                <td className="p-2 border border-gray-300 text-sm">{company.company_name}</td>
                                <td className="p-2 border border-gray-300 text-sm">{company.location}</td>
                                <td className="p-2 border border-gray-300 text-sm">{company.updated}</td>
                                <td className="p-2 border border-gray-300 text-sm">
                                    {company.updated_at ? new Date(company.updated_at).toLocaleString() : "N/A"}
                                </td>
                                <td className="p-2 border border-gray-300">
                                    <div className="flex items-center justify-center gap-3">
                                        <FaEdit className="cursor-pointer text-green-500 text-lg" onClick={() => handleEdit(company)} />
                                        <FaEye className="cursor-pointer text-blue-500 text-lg" onClick={() => handleView(company)} />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {results.length > 0 && (
                    <div className="text-center mt-4">
                        <div className="flex flex-col sm:flex-row justify-center gap-2 mb-2">
                            <button
                                className="bg-[#6A1B9A] text-white py-2 px-6 rounded-[6px] hover:opacity-90 cursor-pointer text-sm w-full sm:w-auto"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </button>
                            <button
                                className="bg-[#6A1B9A] text-white py-2 px-6 rounded-[6px] hover:opacity-90 cursor-pointer text-sm w-full sm:w-auto"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </button>
                        </div>
                        <div className="font-bold text-sm">Page {currentPage} of {totalPages}</div>
                    </div>
                )}
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[1000]">
                    <div className="bg-[#f4eaff] p-6 rounded-[15px] w-full sm:w-[500px] max-w-[95%] max-h-[90vh] overflow-y-auto shadow-[0_10px_25px_rgba(0,0,0,0.2)]">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-[#5e2ca5] text-xl font-bold">Edit Company</h2>
                            <span
                                className="text-xl font-bold cursor-pointer"
                                onClick={closeForm}
                            >
                                ×
                            </span>
                        </div>
                        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                            <div>
                                <label className="font-bold mb-1 block text-[#333] text-sm">Job Title</label>
                                <input
                                    type="text"
                                    value={selectedCompany?.job_title || ""}
                                    onChange={(e) =>
                                        setSelectedCompany((prev) => ({ ...prev, job_title: e.target.value }))
                                    }
                                    className="w-full p-2 border border-[#ccc] rounded-[8px] text-sm focus:outline-none focus:border-[#7b3fe4]"
                                />
                            </div>
                            <div>
                                <label className="font-bold mb-1 block text-[#333] text-sm">Company Name</label>
                                <input
                                    type="text"
                                    value={selectedCompany?.company_name || ""}
                                    onChange={(e) =>
                                        setSelectedCompany((prev) => ({ ...prev, company_name: e.target.value }))
                                    }
                                    className="w-full p-2 border border-[#ccc] rounded-[8px] text-sm focus:outline-none focus:border-[#7b3fe4]"
                                />
                            </div>
                            <h4 className="text-[#5e2ca5] font-bold text-base">Contact Details</h4>
                            <div>
                                <label className="font-bold mb-1 block text-[#333] text-sm">Contact Person Name</label>
                                <input
                                    type="text"
                                    value={selectedCompany?.contact_person_name || ""}
                                    onChange={(e) =>
                                        setSelectedCompany((prev) => ({ ...prev, contact_person_name: e.target.value }))
                                    }
                                    className="w-full p-2 border border-[#ccc] rounded-[8px] text-sm focus:outline-none focus:border-[#7b3fe4]"
                                />
                            </div>
                            <div>
                                <label className="font-bold mb-1 block text-[#333] text-sm">Mobile Number</label>
                                <input
                                    type="tel"
                                    value={selectedCompany?.phone_number || ""}
                                    onChange={(e) =>
                                        setSelectedCompany((prev) => ({ ...prev, phone_number: e.target.value }))
                                    }
                                    className="w-full p-2 border border-[#ccc] rounded-[8px] text-sm focus:outline-none focus:border-[#7b3fe4]"
                                />
                            </div>
                            <div>
                                <label className="font-bold mb-1 block text-[#333] text-sm">Email ID</label>
                                <input
                                    type="email"
                                    value={selectedCompany?.email || ""}
                                    onChange={(e) =>
                                        setSelectedCompany((prev) => ({ ...prev, email: e.target.value }))
                                    }
                                    className="w-full p-2 border border-[#ccc] rounded-[8px] text-sm focus:outline-none focus:border-[#7b3fe4]"
                                />
                            </div>
                            <h4 className="text-[#5e2ca5] font-bold text-base">Location Info</h4>
                            <div>
                                <label className="font-bold mb-1 block text-[#333] text-sm">Location/City</label>
                                <input
                                    type="text"
                                    value={selectedCompany?.location || ""}
                                    onChange={(e) =>
                                        setSelectedCompany((prev) => ({ ...prev, location: e.target.value }))
                                    }
                                    className="w-full p-2 border border-[#ccc] rounded-[8px] text-sm focus:outline-none focus:border-[#7b3fe4]"
                                />
                            </div>
                            <div>
                                <label className="font-bold mb-1 block text-[#333] text-sm">State</label>
                                <input
                                    type="text"
                                    value={selectedCompany?.state || ""}
                                    onChange={(e) =>
                                        setSelectedCompany((prev) => ({ ...prev, state: e.target.value }))
                                    }
                                    className="w-full p-2 border border-[#ccc] rounded-[8px] text-sm focus:outline-none focus:border-[#7b3fe4]"
                                />
                            </div>
                            <div>
                                <label className="font-bold mb-1 block text-[#333] text-sm">Country</label>
                                <input
                                    type="text"
                                    value={selectedCompany?.country || ""}
                                    onChange={(e) =>
                                        setSelectedCompany((prev) => ({ ...prev, country: e.target.value }))
                                    }
                                    className="w-full p-2 border border-[#ccc] rounded-[8px] text-sm focus:outline-none focus:border-[#7b3fe4]"
                                />
                            </div>
                            <div>
                                <label className="font-bold mb-1 block text-[#333] text-sm">Pincode</label>
                                <input
                                    type="text"
                                    value={selectedCompany?.pincode || ""}
                                    onChange={(e) =>
                                        setSelectedCompany((prev) => ({ ...prev, pincode: e.target.value }))
                                    }
                                    className="w-full p-2 border border-[#ccc] rounded-[8px] text-sm focus:outline-none focus:border-[#7b3fe4]"
                                />
                            </div>
                            <div>
                                <label className="font-bold mb-1 block text-[#333] text-sm">Address</label>
                                <input
                                    type="text"
                                    value={selectedCompany?.address || ""}
                                    onChange={(e) =>
                                        setSelectedCompany((prev) => ({ ...prev, address: e.target.value }))
                                    }
                                    className="w-full p-2 border border-[#ccc] rounded-[8px] text-sm focus:outline-none focus:border-[#7b3fe4]"
                                />
                            </div>
                            <h4 className="text-[#5e2ca5] font-bold text-base">Business Info</h4>
                            <div>
                                <label className="font-bold mb-1 block text-[#333] text-sm">GST Number</label>
                                <input
                                    type="text"
                                    value={selectedCompany?.gst_number || ""}
                                    onChange={(e) =>
                                        setSelectedCompany((prev) => ({ ...prev, gst_number: e.target.value }))
                                    }
                                    className="w-full p-2 border border-[#ccc] rounded-[8px] text-sm focus:outline-none focus:border-[#7b3fe4]"
                                />
                            </div>
                            <div>
                                <label className="font-bold mb-1 block text-[#333] text-sm">Industry</label>
                                <input
                                    type="text"
                                    value={selectedCompany?.job_title || ""}
                                    onChange={(e) =>
                                        setSelectedCompany((prev) => ({ ...prev, job_title: e.target.value }))
                                    }
                                    className="w-full p-2 border border-[#ccc] rounded-[8px] text-sm focus:outline-none focus:border-[#7b3fe4]"
                                />
                            </div>
                            <div>
                                <label className="font-bold mb-1 block text-[#333] text-sm">Sub Industry</label>
                                <input
                                    type="text"
                                    value={selectedCompany?.sub_industry || ""}
                                    onChange={(e) =>
                                        setSelectedCompany((prev) => ({ ...prev, sub_industry: e.target.value }))
                                    }
                                    className="w-full p-2 border border-[#ccc] rounded-[8px] text-sm focus:outline-none focus:border-[#7b3fe4]"
                                />
                            </div>
                            <div>
                                <label className="font-bold mb-1 block text-[#333] text-sm">Website</label>
                                <input
                                    type="text"
                                    value={selectedCompany?.website_link || ""}
                                    onChange={(e) =>
                                        setSelectedCompany((prev) => ({ ...prev, website_link: e.target.value }))
                                    }
                                    className="w-full p-2 border border-[#ccc] rounded-[8px] text-sm focus:outline-none focus:border-[#7b3fe4]"
                                />
                            </div>
                            <div>
                                <label className="font-bold mb-1 block text-[#333] text-sm">Job Posted At</label>
                                <input
                                    type="text"
                                    value={selectedCompany?.post_date || ""}
                                    onChange={(e) =>
                                        setSelectedCompany((prev) => ({ ...prev, post_date: e.target.value }))
                                    }
                                    className="w-full p-2 border border-[#ccc] rounded-[8px] text-sm focus:outline-none focus:border-[#7b3fe4]"
                                />
                            </div>
                            <div>
                                <label className="font-bold mb-1 block text-[#333] text-sm">Updated</label>
                                <select
                                    value={selectedCompany?.updated || ""}
                                    onChange={(e) =>
                                        setSelectedCompany((prev) => ({ ...prev, updated: e.target.value }))
                                    }
                                    className="w-full p-2 border border-[#ccc] rounded-[8px] text-sm focus:outline-none focus:border-[#7b3fe4]"
                                >
                                    <option value="yes">Yes</option>
                                    <option value="no">No</option>
                                </select>
                            </div>
                            <button
                                type="submit"
                                className="w-full p-2 bg-[#7019d2] text-white rounded-[8px] text-sm font-bold hover:bg-[#5b13aa]"
                            >
                                Save
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {showView && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[1000]">
                    <div className="bg-[#f4eaff] p-6 rounded-[15px] w-full sm:w-[500px] max-w-[95%] max-h-[90vh] overflow-y-auto shadow-[0_10px_25px_rgba(0,0,0,0.2)]">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-[#5e2ca5] text-xl font-bold">View Company</h2>
                            <span
                                className="text-xl font-bold cursor-pointer"
                                onClick={() => setShowView(false)}
                            >
                                ×
                            </span>
                        </div>
                        <div className="flex flex-col gap-4">
                            <div>
                                <label className="font-bold mb-1 block text-[#333] text-sm">Job Title</label>
                                <input
                                    type="text"
                                    value={selectedCompany?.job_title || ""}
                                    readOnly
                                    className="w-full p-2 border border-[#ccc] rounded-[8px] text-sm"
                                />
                            </div>
                            <div>
                                <label className="font-bold mb-1 block text-[#333] text-sm">Company Name</label>
                                <input
                                    type="text"
                                    value={selectedCompany?.company_name || ""}
                                    readOnly
                                    className="w-full p-2 border border-[#ccc] rounded-[8px] text-sm"
                                />
                            </div>
                            <h4 className="text-[#5e2ca5] font-bold text-base">Contact Details</h4>
                            <div>
                                <label className="font-bold mb-1 block text-[#333] text-sm">Contact Person Name</label>
                                <input
                                    type="text"
                                    value={selectedCompany?.contact_person_name || ""}
                                    readOnly
                                    className="w-full p-2 border border-[#ccc] rounded-[8px] text-sm"
                                />
                            </div>
                            <div>
                                <label className="font-bold mb-1 block text-[#333] text-sm">Mobile Number</label>
                                <input
                                    type="tel"
                                    value={selectedCompany?.phone_number || ""}
                                    readOnly
                                    className="w-full p-2 border border-[#ccc] rounded-[8px] text-sm"
                                />
                            </div>
                            <div>
                                <label className="font-bold mb-1 block text-[#333] text-sm">Email ID</label>
                                <input
                                    type="email"
                                    value={selectedCompany?.email || ""}
                                    readOnly
                                    className="w-full p-2 border border-[#ccc] rounded-[8px] text-sm"
                                />
                            </div>
                            <h4 className="text-[#5e2ca5] font-bold text-base">Location Info</h4>
                            <div>
                                <label className="font-bold mb-1 block text-[#333] text-sm">Location/City</label>
                                <input
                                    type="text"
                                    value={selectedCompany?.location || ""}
                                    readOnly
                                    className="w-full p-2 border border-[#ccc] rounded-[8px] text-sm"
                                />
                            </div>
                            <div>
                                <label className="font-bold mb-1 block text-[#333] text-sm">State</label>
                                <input
                                    type="text"
                                    value={selectedCompany?.state || ""}
                                    readOnly
                                    className="w-full p-2 border border-[#ccc] rounded-[8px] text-sm"
                                />
                            </div>
                            <div>
                                <label className="font-bold mb-1 block text-[#333] text-sm">Country</label>
                                <input
                                    type="text"
                                    value={selectedCompany?.country || ""}
                                    readOnly
                                    className="w-full p-2 border border-[#ccc] rounded-[8px] text-sm"
                                />
                            </div>
                            <div>
                                <label className="font-bold mb-1 block text-[#333] text-sm">Pincode</label>
                                <input
                                    type="text"
                                    value={selectedCompany?.pincode || ""}
                                    readOnly
                                    className="w-full p-2 border border-[#ccc] rounded-[8px] text-sm"
                                />
                            </div>
                            <div>
                                <label className="font-bold mb-1 block text-[#333] text-sm">Address</label>
                                <input
                                    type="text"
                                    value={selectedCompany?.address || ""}
                                    readOnly
                                    className="w-full p-2 border border-[#ccc] rounded-[8px] text-sm"
                                />
                            </div>
                            <h4 className="text-[#5e2ca5] font-bold text-base">Business Info</h4>
                            <div>
                                <label className="font-bold mb-1 block text-[#333] text-sm">GST Number</label>
                                <input
                                    type="text"
                                    value={selectedCompany?.gst_number || ""}
                                    readOnly
                                    className="w-full p-2 border border-[#ccc] rounded-[8px] text-sm"
                                />
                            </div>
                            <div>
                                <label className="font-bold mb-1 block text-[#333] text-sm">Industry</label>
                                <input
                                    type="text"
                                    value={selectedCompany?.job_title || ""}
                                    readOnly
                                    className="w-full p-2 border border-[#ccc] rounded-[8px] text-sm"
                                />
                            </div>
                            <div>
                                <label className="font-bold mb-1 block text-[#333] text-sm">Sub Industry</label>
                                <input
                                    type="text"
                                    value={selectedCompany?.sub_industry || ""}
                                    readOnly
                                    className="w-full p-2 border border-[#ccc] rounded-[8px] text-sm"
                                />
                            </div>
                            <div>
                                <label className="font-bold mb-1 block text-[#333] text-sm">Website</label>
                                <input
                                    type="text"
                                    value={selectedCompany?.website_link || ""}
                                    readOnly
                                    className="w-full p-2 border border-[#ccc] rounded-[8px] text-sm"
                                />
                            </div>
                            <div>
                                <label className="font-bold mb-1 block text-[#333] text-sm">Job Posted At</label>
                                <input
                                    type="text"
                                    value={selectedCompany?.post_date || ""}
                                    readOnly
                                    className="w-full p-2 border border-[#ccc] rounded-[8px] text-sm"
                                />
                            </div>
                            <div>
                                <label className="font-bold mb-1 block text-[#333] text-sm">Updated</label>
                                <input
                                    type="text"
                                    value={selectedCompany?.updated || ""}
                                    readOnly
                                    className="w-full p-2 border border-[#ccc] rounded-[8px] text-sm"
                                />
                            </div>
                            <button
                                className="w-full p-2 bg-[#7019d2] text-white rounded-[8px] text-sm font-bold hover:bg-[#5b13aa]"
                                onClick={() => setShowView(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showAddForm && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[1000]">
                    <div className="bg-[#f4eaff] p-6 rounded-[15px] w-full sm:w-[500px] max-w-[95%] max-h-[90vh] overflow-y-auto shadow-[0_10px_25px_rgba(0,0,0,0.2)]">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-[#5e2ca5] text-xl font-bold">Add New Company</h2>
                            <span
                                className="text-xl font-bold cursor-pointer"
                                onClick={() => setShowAddForm(false)}
                            >
                                ×
                            </span>
                        </div>
                        <div className="flex flex-col gap-4">
                            <div>
                                <label className="font-bold mb-1 block text-[#333] text-sm">Job Title</label>
                                <input
                                    type="text"
                                    placeholder="Job Title"
                                    value={selectedCompany?.job_title || ""}
                                    onChange={(e) =>
                                        setSelectedCompany((prev) => ({ ...prev, job_title: e.target.value }))
                                    }
                                    className="w-full p-2 border border-[#ccc] rounded-[8px] text-sm focus:outline-none focus:border-[#7b3fe4]"
                                />
                            </div>
                            <div>
                                <label className="font-bold mb-1 block text-[#333] text-sm">Company Name</label>
                                <input
                                    type="text"
                                    placeholder="Company Name"
                                    value={selectedCompany?.company_name || ""}
                                    onChange={(e) =>
                                        setSelectedCompany((prev) => ({ ...prev, company_name: e.target.value }))
                                    }
                                    className="w-full p-2 border border-[#ccc] rounded-[8px] text-sm focus:outline-none focus:border-[#7b3fe4]"
                                />
                            </div>
                            <div>
                                <label className="font-bold mb-1 block text-[#333] text-sm">Location</label>
                                <input
                                    type="text"
                                    placeholder="Location"
                                    value={selectedCompany?.location || ""}
                                    onChange={(e) =>
                                        setSelectedCompany((prev) => ({ ...prev, location: e.target.value }))
                                    }
                                    className="w-full p-2 border border-[#ccc] rounded-[8px] text-sm focus:outline-none focus:border-[#7b3fe4]"
                                />
                            </div>
                            <div>
                                <label className="font-bold mb-1 block text-[#333] text-sm">Address</label>
                                <input
                                    type="text"
                                    placeholder="Address"
                                    value={selectedCompany?.address || ""}
                                    onChange={(e) =>
                                        setSelectedCompany((prev) => ({ ...prev, address: e.target.value }))
                                    }
                                    className="w-full p-2 border border-[#ccc] rounded-[8px] text-sm focus:outline-none focus:border-[#7b3fe4]"
                                />
                            </div>
                            <div>
                                <label className="font-bold mb-1 block text-[#333] text-sm">Phone Number</label>
                                <input
                                    type="text"
                                    placeholder="Phone Number"
                                    value={selectedCompany?.phone_number || ""}
                                    onChange={(e) =>
                                        setSelectedCompany((prev) => ({ ...prev, phone_number: e.target.value }))
                                    }
                                    className="w-full p-2 border border-[#ccc] rounded-[8px] text-sm focus:outline-none focus:border-[#7b3fe4]"
                                />
                            </div>
                            <div>
                                <label className="font-bold mb-1 block text-[#333] text-sm">Website Link</label>
                                <input
                                    type="text"
                                    placeholder="Website Link"
                                    value={selectedCompany?.website_link || ""}
                                    onChange={(e) =>
                                        setSelectedCompany((prev) => ({ ...prev, website_link: e.target.value }))
                                    }
                                    className="w-full p-2 border border-[#ccc] rounded-[8px] text-sm focus:outline-none focus:border-[#7b3fe4]"
                                />
                            </div>
                            <div>
                                <label className="font-bold mb-1 block text-[#333] text-sm">GST Number</label>
                                <input
                                    type="text"
                                    placeholder="GST Number"
                                    value={selectedCompany?.gst_number || ""}
                                    onChange={(e) =>
                                        setSelectedCompany((prev) => ({ ...prev, gst_number: e.target.value }))
                                    }
                                    className="w-full p-2 border border-[#ccc] rounded-[8px] text-sm focus:outline-none focus:border-[#7b3fe4]"
                                />
                            </div>
                            <div>
                                <label className="font-bold mb-1 block text-[#333] text-sm">Job Posted At</label>
                                <input
                                    type="text"
                                    placeholder="Job Posted At"
                                    value={selectedCompany?.post_date || ""}
                                    onChange={(e) =>
                                        setSelectedCompany((prev) => ({ ...prev, post_date: e.target.value }))
                                    }
                                    className="w-full p-2 border border-[#ccc] rounded-[8px] text-sm focus:outline-none focus:border-[#7b3fe4]"
                                />
                            </div>
                            <button
                                onClick={handleAddCompany}
                                className="w-full p-2 bg-[#7019d2] text-white rounded-[8px] text-sm font-bold hover:bg-[#5b13aa]"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showConfirmModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[1000]">
                    <div className="bg-[#f4eaff] p-6 rounded-[15px] w-full sm:w-[400px] max-w-[95%] shadow-[0_10px_25px_rgba(0,0,0,0.2)]">
                        <h3 className="text-[#5e2ca5] text-lg font-bold mb-4">Are you sure you want to discard changes?</h3>
                        <div className="flex flex-col sm:flex-row gap-2 justify-center">
                            <button
                                className="bg-[#7019d2] text-white py-2 px-4 rounded-[6px] font-bold hover:bg-[#5b13aa] text-sm w-full sm:w-auto"
                                onClick={confirmClose}
                            >
                                Yes
                            </button>
                            <button
                                className="bg-[#f4f1fa] text-black py-2 px-4 rounded-[6px] font-bold border border-[#d3cce3] hover:bg-[#eae4f4] text-sm w-full sm:w-auto"
                                onClick={cancelClose}
                            >
                                No
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SingleDataEdit;