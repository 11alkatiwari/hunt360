/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import axios from 'axios';
import { useEffect, useState } from 'react';
import { FaEdit, FaEye, FaTrash } from 'react-icons/fa';

const baseURL = import.meta.env.VITE_API_BASE_URL
    ? `${import.meta.env.VITE_API_BASE_URL}/corporate`
    : 'https://hunt360-3.onrender.com/api/corporate';


const MarketingData = () => {
    const [showForm, setShowForm] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [filters, setFilters] = useState({ name: "", city: "", updated: "", communication_status: "", lead_status: "", bd_name: "" });
    const [results, setResults] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [showView, setShowView] = useState(false);

    const [communicationStatus, setCommunicationStatus] = useState(selectedCompany?.communication_status || "");
    const [notes, setNotes] = useState(selectedCompany?.notes || "");
    const [meetingDate, setMeetingDate] = useState(selectedCompany?.meeting_date || "");
    const [leadStatus, setLeadStatus] = useState(selectedCompany?.lead_status || "");

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
            const params = new URLSearchParams({
                ...filters,
                page,
                limit: 10,
            }).toString();
            const response = await axios.get(`${baseURL}/search-marketing-data?${params}`);
            setResults(response.data.data || []);
            setTotalPages(response.data.totalPages || 1);
            setCurrentPage(response.data.currentPage || 1);
        } catch (error) {
            console.error("Search failed:", error);
        }
    };

    const clearFilters = () => {
        setFilters({ name: "", city: "", updated: "", communication_status: "", lead_status: "", bd_name: "" });
        setResults([]);
        setCurrentPage(1);
        setTotalPages(1);
    };

    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > totalPages) return;
        handleSearch(newPage);
    };

    useEffect(() => {
        if (results.length > 0) {
            handleSearch(currentPage);
        }
    }, []);

    useEffect(() => {
        const savedResults = JSON.parse(sessionStorage.getItem("marketingSavedResults") || "[]");
        const savedFilters = JSON.parse(sessionStorage.getItem("marketingSavedFilters") || "{}");

        if (savedResults.length > 0) {
            setResults(savedResults);
            setFilters(savedFilters);
        }
    }, []);

    useEffect(() => {
        return () => {
            sessionStorage.setItem("marketingSavedResults", JSON.stringify(results));
            sessionStorage.setItem("marketingSavedFilters", JSON.stringify(filters));

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

                // Update the results so the table shows the new data instantly
                const updatedCompany = {
                    ...selectedCompany,
                    //updated_at: new Date().toISOString(), // set latest time manually
                };

                const updatedResults = results.map((company) => {
                    if (
                        company.company_name === selectedCompany.company_name &&
                        company.location === selectedCompany.location
                    ) {
                        return updatedCompany;
                    }
                    return company;
                });

                setResults(updatedResults);

                // Set updated company in state in case user opens form again
                setSelectedCompany(updatedCompany);

                // Close form
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


    const handleDelete = async (item) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this record?");
        if (confirmDelete) {
            try {
                // Send DELETE request to the backend with the id of the item
                await axios.delete(`${baseURL}/api/delete/${item.id}`);

                // Remove the deleted item from the frontend state
                const updatedRecords = results.filter(record => record.id !== item.id);
                setResults(updatedRecords); // Update state to refresh the UI
            } catch (error) {
                console.error("Error deleting record:", error);
            }
        }
    };

    //responsive tailwind css

    return (
        <div className="bg-purple-100 p-4 sm:p-5 md:p-6 rounded-xl max-w-full sm:max-w-5xl md:max-w-6xl font-sans pt-10 sm:pt-12 ml-2 sm:ml-[10px]">
            <p className="mb-4 sm:mb-5 text-sm sm:text-base">Search and manage marketing data</p>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-start sm:items-center flex-wrap">
                <div className="w-full sm:w-44">
                    <label className="font-bold mb-1 sm:mb-[5px] block text-sm sm:text-base">Company</label>
                    <input
                        type="text"
                        name="name"
                        value={filters.name}
                        onChange={handleChange}
                        placeholder="Enter company name"
                        className="w-full p-1.5 sm:p-2 text-sm sm:text-base  border-1 border-purple-300 rounded-lg"
                    />
                </div>
                <div className="w-full sm:w-44">
                    <label className="font-bold mb-1 sm:mb-[5px] block text-sm sm:text-base">Location</label>
                    <input
                        type="text"
                        name="city"
                        value={filters.city}
                        onChange={handleChange}
                        placeholder="Enter city or location"
                        className="w-full p-1.5 sm:p-2 text-sm sm:text-base  border-1 border-purple-300 rounded-lg"
                    />
                </div>
                <div className="w-full sm:w-44">
                    <label className="font-bold mb-1 sm:mb-[5px] block text-sm sm:text-base">Communication Status</label>
                    <select
                        name="communication_status"
                        value={filters.communication_status}
                        onChange={handleChange}
                        className="w-full p-1.5 sm:p-2 text-sm sm:text-base border-1 border-purple-300 rounded-lg "
                    >
                        <option value="">-- Select --</option>
                        <option value="Interested">Interested</option>
                        <option value="Not Interested">Not Interested</option>
                        <option value="Follow-up Needed">Follow-up Needed</option>
                        <option value="Pending Call">Pending Call</option>
                    </select>
                </div>
                <div className="w-full sm:w-44">
                    <label className="font-bold mb-1 sm:mb-[5px] block text-sm sm:text-base">Lead Status</label>
                    <select
                        name="lead_status"
                        value={filters.lead_status}
                        onChange={handleChange}
                        className="w-full p-1.5 sm:p-2 text-sm sm:text-base  border-1 border-purple-300 rounded-lg "
                    >
                        <option value="">-- Select --</option>
                        <option value="New">New</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Dropped">Dropped</option>
                        <option value="Closed">Closed</option>
                    </select>
                </div>

                <div className="flex flex-col gap-1 sm:gap-[5px] mr-2 sm:mr-[10px] w-full sm:w-auto">
                    <label className="block mb-1 sm:mb-[5px] font-bold text-[#17151b] text-sm sm:text-base">BD Name</label>
                    <input
                        type="text"
                        name="bd_name"
                        value={filters.bd_name}
                        onChange={handleChange}
                        placeholder="Enter BD Name..."
                        className="w-full sm:w-[200px] md:w-[250px] p-2 sm:p-[10px] border-1 border-black rounded-[6px] text-sm sm:text-base"
                    />
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-2.5 mt-2 sm:mt-2.5 items-start sm:items-center">
                <button
                    className="bg-[#6A1B9A] text-white py-2 sm:py-[12px] font-bold px-4 sm:px-[20px] rounded-md text-sm sm:text-[15px] hover:opacity-90 cursor-pointer w-full sm:w-auto"
                    onClick={() => handleSearch(1)}
                >
                    Apply Filters
                </button>
                <button
                    className="bg-[#d3cce3] hover:bg-[#D1D5DB] font-bold text-black py-2 sm:py-[12px] px-4 sm:px-[20px] rounded-md text-sm sm:text-[15px] cursor-pointer w-full sm:w-auto"
                    onClick={clearFilters}
                >
                    Reset
                </button>
            </div>

            <div className="mt-4 sm:mt-5 overflow-x-auto">
                <h3 className="text-base sm:text-lg font-bold">Search Results</h3>
                <table className="w-full min-w-[600px]">
                    <thead>
                        <tr className="bg-[#6a1b9a] text-white">
                            <th className="p-2 sm:p-3 text-left border border-gray-300 px-3 sm:px-4 py-1 sm:py-2 text-sm sm:text-base">Company Name</th>
                            <th className="p-2 sm:p-3 text-left border border-gray-300 px-3 sm:px-4 py-1 sm:py-2 text-sm sm:text-base">Location</th>
                            <th className="p-2 sm:p-3 text-left border border-gray-300 px-3 sm:px-4 py-1 sm:py-2 text-sm sm:text-base">Manager</th>
                            <th className="p-2 sm:p-3 text-left border border-gray-300 px-3 sm:px-4 py-1 sm:py-2 text-sm sm:text-base">Phone no.</th>
                            <th className="p-2 sm:p-3 text-left border border-gray-300 px-3 sm:px-4 py-1 sm:py-2 text-sm sm:text-base">BD name</th>
                            <th className="p-2 sm:p-3 text-left border border-gray-300 px-3 sm:px-4 py-1 sm:py-2 border-r text-sm sm:text-base">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {results.map((item) => (
                            <tr key={item.id} className="border-b border-purple-200 bg-[#ffff]">
                                <td className="p-2 sm:p-[10px] border border-gray-300 px-3 sm:px-4 py-1 sm:py-2 text-sm sm:text-base">{item.company_name}</td>
                                <td className="p-2 sm:p-[10px] border border-gray-300 px-3 sm:px-4 py-1 sm:py-2 text-sm sm:text-base">{item.location}</td>
                                <td className="p-2 sm:p-[10px] border border-gray-300 px-3 sm:px-4 py-1 sm:py-2 text-sm sm:text-base">{item.contact_person_name}</td>
                                <td className="p-2 sm:p-[10px] border border-gray-300 px-3 sm:px-4 py-1 sm:py-2 text-sm sm:text-base">{item.phone_number}</td>
                                <td className="p-2 sm:p-[10px] border border-gray-300 px-3 sm:px-4 py-1 sm:py-2 text-sm sm:text-base">{item.bd_name}</td>
                                <td className="px-3 sm:px-4 py-1 sm:py-2 border border-gray-300 last:border-r">
                                    <div className="flex items-center justify-center gap-2 sm:gap-3">
                                        <FaEdit
                                            className="text-green-500 cursor-pointer text-lg sm:text-xl hover:scale-110"
                                            onClick={() => handleEdit(item)}
                                        />
                                        <FaEye
                                            className="text-blue-500 cursor-pointer text-lg sm:text-xl hover:scale-110"
                                            onClick={() => handleView(item)}
                                        />
                                        <FaTrash
                                            className="text-red-500 cursor-pointer text-lg sm:text-xl hover:scale-110"
                                            onClick={() => handleDelete(item)}
                                        />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {results.length > 0 && (
                    <div className="text-center mt-3 sm:mt-[20px]">
                        <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-[10px] mb-1 sm:mb-[5px]">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="bg-[#6A1B9A] text-white py-2 sm:py-[10px] px-6 sm:px-[50px] md:px-[100px] rounded-[6px] hover:opacity-90 cursor-pointer text-sm sm:text-base w-full sm:w-auto"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="bg-[#6A1B9A] text-white py-2 sm:py-[10px] px-6 sm:px-[50px] md:px-[100px] rounded-[6px] hover:opacity-90 cursor-pointer text-sm sm:text-base w-full sm:w-auto"
                            >
                                Next
                            </button>
                        </div>
                        <div className="font-bold mt-1 sm:mt-[5px] text-sm sm:text-base">Page {currentPage} of {totalPages}</div>
                    </div>
                )}
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[1000]">
                    <div className="bg-[#f4eaff] p-4 sm:p-[30px_40px] rounded-[15px] w-full sm:w-[500px] max-w-[95%] sm:max-w-[90%] max-h-[90vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden shadow-[0_10px_25px_rgba(0,0,0,0.2)]">
                        <div className="flex justify-between items-center mb-3 sm:mb-5">
                            <h2 className="text-xl sm:text-2xl font-bold text-purple-700">Edit Campaign</h2>
                            <span className="text-xl sm:text-2xl cursor-pointer font-bold" onClick={closeForm}>
                                ×
                            </span>
                        </div>
                        <div className="flex flex-col gap-3 sm:gap-5">

                            <div>
                                <label className="font-bold mb-1 sm:mb-[5px] block text-gray-800 text-sm sm:text-base">Company Name</label>
                                <input
                                    type="text"
                                    value={selectedCompany?.company_name || ""}
                                    onChange={(e) =>
                                        setSelectedCompany((prev) => ({ ...prev, company_name: e.target.value }))
                                    }
                                    className="w-full p-2 sm:p-3 mb-2 sm:mb-5 border border-gray-300 rounded-lg text-sm sm:text-[14px] focus:outline-none focus:border-purple-500"
                                />
                            </div>

                            <div>
                                <label className="font-bold mb-1 sm:mb-[5px] block text-gray-800 text-sm sm:text-base">Gst Number</label>
                                <input
                                    type="text"
                                    value={selectedCompany?.gst_number || ""}
                                    onChange={(e) =>
                                        setSelectedCompany((prev) => ({ ...prev, gst_number: e.target.value }))
                                    }
                                    className="w-full p-2 sm:p-3 mb-2 sm:mb-5 border border-gray-300 rounded-lg text-sm sm:text-[14px] focus:outline-none focus:border-purple-500"
                                />
                            </div>

                            <div>
                                <label className="font-bold mb-1 sm:mb-[5px] block text-gray-800 text-sm sm:text-base">Location (city)</label>
                                <input
                                    type="text"
                                    value={selectedCompany?.location || ""}
                                    onChange={(e) =>
                                        setSelectedCompany((prev) => ({ ...prev, location: e.target.value }))
                                    }
                                    className="w-full p-2 sm:p-3 mb-2 sm:mb-5 border border-gray-300 rounded-lg text-sm sm:text-[14px] focus:outline-none focus:border-purple-500"
                                />
                            </div>

                            <div>
                                <label className="font-bold mb-1 sm:mb-[5px] block text-gray-800 text-sm sm:text-base">Contact Person Name</label>
                                <input
                                    type="text"
                                    value={selectedCompany?.contact_person_name || ""}
                                    onChange={(e) =>
                                        setSelectedCompany((prev) => ({ ...prev, contact_person_name: e.target.value }))
                                    }
                                    className="w-full p-2 sm:p-3 mb-2 sm:mb-5 border border-gray-300 rounded-lg text-sm sm:text-[14px] focus:outline-none focus:border-purple-500"
                                />
                            </div>

                            <div>
                                <label className="font-bold mb-1 sm:mb-[5px] block text-gray-800 text-sm sm:text-base">contact person Mobile Number</label>
                                <input
                                    type="text"
                                    value={selectedCompany?.phone_number || ""}
                                    onChange={(e) =>
                                        setSelectedCompany((prev) => ({ ...prev, phone_number: e.target.value }))
                                    }
                                    className="w-full p-2 sm:p-3 mb-2 sm:mb-5 border border-gray-300 rounded-lg text-sm sm:text-[14px] focus:outline-none focus:border-purple-500"
                                />
                            </div>

                            <div>
                                <label className="font-bold mb-1 sm:mb-[5px] block text-gray-800 text-sm sm:text-base">Email</label>
                                <input
                                    type="text"
                                    value={selectedCompany?.email || ""}
                                    onChange={(e) =>
                                        setSelectedCompany((prev) => ({ ...prev, email: e.target.value }))
                                    }
                                    className="w-full p-2 sm:p-3 mb-2 sm:mb-5 border border-gray-300 rounded-lg text-sm sm:text-[14px] focus:outline-none focus:border-purple-500"
                                />
                            </div>

                            <div>
                                <label className="font-bold mb-1 sm:mb-[5px] block text-gray-800 text-sm sm:text-base">Industry</label>
                                <input
                                    type="tel"
                                    value={selectedCompany?.industry || ""}
                                    onChange={(e) =>
                                        setSelectedCompany((prev) => ({ ...prev, industry: e.target.value }))
                                    }
                                    className="w-full p-2 sm:p-3 mb-2 sm:mb-5 border border-gray-300 rounded-lg text-sm sm:text-[14px] focus:outline-none focus:border-purple-500"
                                />
                            </div>

                            <div>
                                <label className="font-bold mb-1 sm:mb-[5px] block text-gray-800 text-sm sm:text-base"> Sub Industry</label>
                                <input
                                    type="tel"
                                    value={selectedCompany?.sub_industry || ""}
                                    onChange={(e) =>
                                        setSelectedCompany((prev) => ({ ...prev, sub_industry: e.target.value }))
                                    }
                                    className="w-full p-2 sm:p-3 mb-2 sm:mb-5 border border-gray-300 rounded-lg text-sm sm:text-[14px] focus:outline-none focus:border-purple-500"
                                />
                            </div>

                            <div>
                                <label className="font-bold mb-1 sm:mb-[5px] block text-gray-800 text-sm sm:text-base">Website</label>
                                <input
                                    type="tel"
                                    value={selectedCompany?.website_link || ""}
                                    onChange={(e) =>
                                        setSelectedCompany((prev) => ({ ...prev, website_link: e.target.value }))
                                    }
                                    className="w-full p-2 sm:p-3 mb-2 sm:mb-5 border border-gray-300 rounded-lg text-sm sm:text-[14px] focus:outline-none focus:border-purple-500"
                                />
                            </div>

                            <div>
                                <label className="font-bold mb-1 sm:mb-[5px] block text-gray-800 text-sm sm:text-base">job posted at</label>
                                <input
                                    type="tel"
                                    value={selectedCompany?.post_date || ""}
                                    onChange={(e) =>
                                        setSelectedCompany((prev) => ({ ...prev, post_date: e.target.value }))
                                    }
                                    className="w-full p-2 sm:p-3 mb-2 sm:mb-5 border border-gray-300 rounded-lg text-sm sm:text-[14px] focus:outline-none focus:border-purple-500"
                                />
                            </div>

                            <div>
                                <label className="font-bold mb-1 sm:mb-[5px] block text-gray-800 text-sm sm:text-base">BD Name</label>
                                <input
                                    type="text"
                                    value={selectedCompany?.bd_name || ""}
                                    onChange={(e) =>
                                        setSelectedCompany((prev) => ({ ...prev, bd_name: e.target.value }))
                                    }
                                    className="w-full p-2 sm:p-3 mb-2 sm:mb-5 border border-gray-300 rounded-lg text-sm sm:text-[14px] focus:outline-none focus:border-purple-500"
                                />
                            </div>
                            <div>
                                <label className="font-bold mb-1 sm:mb-[5px] block text-gray-800 text-sm sm:text-base">BD Contact Number</label>
                                <input
                                    type="tel"
                                    value={selectedCompany?.mobile || ""}
                                    onChange={(e) =>
                                        setSelectedCompany((prev) => ({ ...prev, mobile: e.target.value }))
                                    }
                                    className="w-full p-2 sm:p-3 mb-2 sm:mb-5 border border-gray-300 rounded-lg text-sm sm:text-[14px] focus:outline-none focus:border-purple-500"
                                />
                            </div>

                            <div>
                                <label className="font-bold mb-1 sm:mb-[5px] block text-gray-800 text-sm sm:text-base">Communication Status</label>
                                <select
                                    value={selectedCompany?.communication_status || ""}
                                    onChange={(e) =>
                                        setSelectedCompany((prev) => ({
                                            ...prev,
                                            communication_status: e.target.value,
                                        }))
                                    }
                                    className="w-full p-2 sm:p-3 mb-2 sm:mb-5 border border-gray-300 rounded-lg text-sm sm:text-[14px] focus:outline-none focus:border-purple-500 bg-white"
                                >
                                    <option value="">-- Select --</option>
                                    <option value="Interested">Interested</option>
                                    <option value="Not Interested">Not Interested</option>
                                    <option value="Follow-up needed">Follow-up Needed</option>
                                    <option value="Pending call">Pending Call</option>
                                </select>
                            </div>
                            <div>
                                <label className="font-bold mb-1 sm:mb-[5px] block text-gray-800 text-sm sm:text-base">Notes</label>
                                <textarea
                                    rows="3"
                                    placeholder="Add notes here..."
                                    value={selectedCompany?.notes || ""}
                                    onChange={(e) =>
                                        setSelectedCompany((prev) => ({ ...prev, notes: e.target.value }))
                                    }
                                    className="w-full p-2 sm:p-3 mb-2 sm:mb-5 border border-gray-300 rounded-lg text-sm sm:text-[14px] resize-y min-h-[80px] focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(76,154,255,0.2)]"
                                />
                            </div>
                            <div>
                                <label className="font-bold mb-1 sm:mb-[5px] block text-gray-800 text-sm sm:text-base">Meeting Date</label>
                                <input
                                    type="date"
                                    value={
                                        selectedCompany?.date_of_contact
                                            ? new Date(selectedCompany.date_of_contact).toISOString().split("T")[0]
                                            : ""
                                    }
                                    onChange={(e) =>
                                        setSelectedCompany((prev) => ({ ...prev, date_of_contact: e.target.value }))
                                    }
                                    className="w-full p-2 sm:p-3 mb-2 sm:mb-5 border border-gray-300 rounded-lg text-sm sm:text-[14px] focus:outline-none focus:border-purple-500"
                                />
                            </div>
                            <div>
                                <label className="font-bold mb-1 sm:mb-[5px] block text-gray-800 text-sm sm:text-base">Lead Status</label>
                                <select
                                    value={selectedCompany?.lead_status || ""}
                                    onChange={(e) =>
                                        setSelectedCompany((prev) => ({ ...prev, lead_status: e.target.value }))
                                    }
                                    className="w-full p-2 sm:p-3 mb-2 sm:mb-5 border border-gray-300 rounded-lg text-sm sm:text-[14px] focus:outline-none focus:border-purple-500 bg-white"
                                >
                                    <option value="">-- Select --</option>
                                    <option value="New">New</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Closed">Closed</option>
                                    <option value="Dropped">Dropped</option>
                                </select>
                            </div>
                            <button
                                type="submit"
                                className="w-full sm:w-36 p-2 sm:p-3 bg-purple-700 text-white rounded-lg font-bold text-sm sm:text-base hover:bg-purple-800"
                                onClick={handleSubmit}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showView && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[1000]">
                    <div className="bg-[#f4eaff] p-4 sm:p-[30px_40px] rounded-[15px] w-full sm:w-[500px] max-w-[95%] sm:max-w-[90%] max-h-[90vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden shadow-[0_10px_25px_rgba(0,0,0,0.2)]">
                        <div className="flex justify-between items-center mb-3 sm:mb-5">
                            <h2 className="text-xl sm:text-2xl font-bold text-purple-700">View Company</h2>
                            <span className="text-xl sm:text-2xl cursor-pointer font-bold" onClick={() => setShowView(false)}>
                                ×
                            </span>
                        </div>
                        <div className="flex flex-col gap-2 sm:gap-2.5">
                            <div>
                                <label className="font-bold mb-1 sm:mb-[5px] block text-sm sm:text-base">Company Name</label>
                                <input
                                    type="text"
                                    value={selectedCompany?.company_name || ""}
                                    readOnly
                                    className="w-full p-2 sm:p-2 mb-2 sm:mb-2.5 border border-gray-300 rounded-lg text-sm sm:text-[14px]"
                                />
                            </div>
                            <h4 className="mt-3 sm:mt-5 font-bold text-base sm:text-lg">Contact Details</h4>
                            <div>
                                <label className="font-bold mb-1 sm:mb-[5px] block text-sm sm:text-base">Contact Person Name</label>
                                <input
                                    type="text"
                                    value={selectedCompany?.contact_person_name || ""}
                                    readOnly
                                    className="w-full p-2 sm:p-2 mb-2 sm:mb-2.5 border border-gray-300 rounded-lg text-sm sm:text-[14px]"
                                />
                            </div>
                            <div>
                                <label className="font-bold mb-1 sm:mb-[5px] block text-sm sm:text-base">Contact Person number</label>
                                <input
                                    type="tel"
                                    value={selectedCompany?.phone_number || ""}
                                    readOnly
                                    className="w-full p-2 sm:p-2 mb-2 sm:mb-2.5 border border-gray-300 rounded-lg text-sm sm:text-[14px]"
                                />
                            </div>
                            <div>
                                <label className="font-bold mb-1 sm:mb-[5px] block text-sm sm:text-base">Email ID</label>
                                <input
                                    type="email"
                                    value={selectedCompany?.email || ""}
                                    readOnly
                                    className="w-full p-2 sm:p-2 mb-2 sm:mb-2.5 border border-gray-300 rounded-lg text-sm sm:text-[14px]"
                                />
                            </div>
                            <h4 className="mt-3 sm:mt-5 font-bold text-base sm:text-lg">Location Info</h4>
                            <div>
                                <label className="font-bold mb-1 sm:mb-[5px] block text-sm sm:text-base">Location/City</label>
                                <input
                                    type="text"
                                    value={selectedCompany?.location || ""}
                                    readOnly
                                    className="w-full p-2 sm:p-2 mb-2 sm:mb-2.5 border border-gray-300 rounded-lg text-sm sm:text-[14px]"
                                />
                            </div>
                            <div>
                                <label className="font-bold mb-1 sm:mb-[5px] block text-sm sm:text-base">State</label>
                                <input
                                    type="text"
                                    value={selectedCompany?.state || ""}
                                    readOnly
                                    className="w-full p-2 sm:p-2 mb-2 sm:mb-2.5 border border-gray-300 rounded-lg text-sm sm:text-[14px]"
                                />
                            </div>
                            <div>
                                <label className="font-bold mb-1 sm:mb-[5px] block text-sm sm:text-base">Country</label>
                                <input
                                    type="text"
                                    value={selectedCompany?.country || ""}
                                    readOnly
                                    className="w-full p-2 sm:p-2 mb-2 sm:mb-2.5 border border-gray-300 rounded-lg text-sm sm:text-[14px]"
                                />
                            </div>
                            <div>
                                <label className="font-bold mb-1 sm:mb-[5px] block text-sm sm:text-base">Pincode</label>
                                <input
                                    type="text"
                                    value={selectedCompany?.pincode || ""}
                                    readOnly
                                    className="w-full p-2 sm:p-2 mb-2 sm:mb-2.5 border border-gray-300 rounded-lg text-sm sm:text-[14px]"
                                />
                            </div>
                            <div>
                                <label className="font-bold mb-1 sm:mb-[5px] block text-sm sm:text-base">Address</label>
                                <input
                                    type="text"
                                    value={selectedCompany?.address || ""}
                                    readOnly
                                    className="w-full p-2 sm:p-2 mb-2 sm:mb-2.5 border border-gray-300 rounded-lg text-sm sm:text-[14px]"
                                />
                            </div>
                            <h4 className="mt-3 sm:mt-5 font-bold text-base sm:text-lg">Business Info</h4>
                            <div>
                                <label className="font-bold mb-1 sm:mb-[5px] block text-sm sm:text-base">GST Number</label>
                                <input
                                    type="text"
                                    value={selectedCompany?.gst_number || ""}
                                    readOnly
                                    className="w-full p-2 sm:p-2 mb-2 sm:mb-2.5 border border-gray-300 rounded-lg text-sm sm:text-[14px]"
                                />
                            </div>
                            <div>
                                <label className="font-bold mb-1 sm:mb-[5px] block text-sm sm:text-base">Industry</label>
                                <input
                                    type="text"
                                    value={selectedCompany?.industry || ""}
                                    readOnly
                                    className="w-full p-2 sm:p-2 mb-2 sm:mb-2.5 border border-gray-300 rounded-lg text-sm sm:text-[14px]"
                                />
                            </div>
                            <div>
                                <label className="font-bold mb-1 sm:mb-[5px] block text-sm sm:text-base">Sub Industry</label>
                                <input
                                    type="text"
                                    value={selectedCompany?.sub_industry || ""}
                                    readOnly
                                    className="w-full p-2 sm:p-2 mb-2 sm:mb-2.5 border border-gray-300 rounded-lg text-sm sm:text-[14px]"
                                />
                            </div>
                            <div>
                                <label className="font-bold mb-1 sm:mb-[5px] block text-sm sm:text-base">Website</label>
                                <input
                                    type="text"
                                    value={selectedCompany?.website_link || ""}
                                    readOnly
                                    className="w-full p-2 sm:p-2 mb-2 sm:mb-2.5 border border-gray-300 rounded-lg text-sm sm:text-[14px]"
                                />
                            </div>
                            <div>
                                <label className="font-bold mb-1 sm:mb-[5px] block text-[#333] text-sm sm:text-base">Job post at</label>
                                <input
                                    type="text"
                                    value={selectedCompany?.post_date || ""}
                                    readOnly
                                    className="w-full p-2 sm:p-[12px] border border-[#ccc] rounded-[8px] text-sm sm:text-[14px]"
                                />
                            </div>
                            <h4 className="mt-3 sm:mt-5 font-bold text-base sm:text-lg">Communication Details</h4>
                            <div>
                                <label className="font-bold mb-1 sm:mb-[5px] block text-sm sm:text-base">BD Name</label>
                                <input
                                    type="text"
                                    value={selectedCompany?.bd_name || ""}
                                    readOnly
                                    className="w-full p-2 sm:p-2 mb-2 sm:mb-2.5 border border-gray-300 rounded-lg text-sm sm:text-[14px]"
                                />
                            </div>
                            <div>
                                <label className="font-bold mb-1 sm:mb-[5px] block text-sm sm:text-base">BD Contact Number</label>
                                <input
                                    type="tel"
                                    value={selectedCompany?.mobile || ""}
                                    readOnly
                                    className="w-full p-2 sm:p-2 mb-2 sm:mb-2.5 border border-gray-300 rounded-lg text-sm sm:text-[14px]"
                                />
                            </div>
                            <div>
                                <label className="font-bold mb-1 sm:mb-[5px] block text-sm sm:text-base">Communication Status</label>
                                <input
                                    type="text"
                                    value={selectedCompany?.communication_status || ""}
                                    readOnly
                                    className="w-full p-2 sm:p-2 mb-2 sm:mb-2.5 border border-gray-300 rounded-lg text-sm sm:text-[14px]"
                                />
                            </div>
                            <div>
                                <label className="font-bold mb-1 sm:mb-[5px] block text-sm sm:text-base">Notes</label>
                                <textarea
                                    rows="3"
                                    value={selectedCompany?.notes || ""}
                                    readOnly
                                    className="w-full p-2 sm:p-2 mb-2 sm:mb-2.5 border border-gray-300 rounded-lg min-h-[100px] resize-y text-sm sm:text-[14px]"
                                />
                            </div>
                            <div>
                                <label className="font-bold mb-1 sm:mb-[5px] block text-sm sm:text-base">Meeting Date</label>
                                <input
                                    type="text"
                                    value={
                                        selectedCompany?.meeting_date
                                            ? new Date(selectedCompany.meeting_date).toISOString().split("T")[0]
                                            : ""
                                    }
                                    readOnly
                                    className="w-full p-2 sm:p-2 mb-2 sm:mb-2.5 border border-gray-300 rounded-lg text-sm sm:text-[14px]"
                                />
                            </div>
                            <div>
                                <label className="font-bold mb-1 sm:mb-[5px] block text-sm sm:text-base">Lead Status</label>
                                <input
                                    type="text"
                                    value={selectedCompany?.lead_status || ""}
                                    readOnly
                                    className="w-full p-2 sm:p-2 mb-2 sm:mb-2.5 border border-gray-300 rounded-lg text-sm sm:text-[14px]"
                                />
                            </div>
                            <button
                                onClick={() => setShowView(false)}
                                className="w-full sm:w-36 p-2 sm:p-2 bg-purple-700 text-white rounded-lg font-bold text-sm sm:text-base hover:bg-purple-800"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showConfirmModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[1000]">
                    <div className="bg-[#f4eaff] p-4 sm:p-[30px_40px] rounded-[15px] shadow-[0_10px_25px_rgba(0,0,0,0.2)] w-full sm:w-auto max-w-[95%] sm:max-w-[400px]">
                        <h3 className="text-[#5e2ca5] text-base sm:text-lg font-bold mb-3 sm:mb-4">Are you sure you want to discard changes?</h3>
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-[10px] justify-center">
                            <button
                                className="bg-[#7019d2] text-white py-2 sm:py-[10px] px-4 sm:px-[20px] rounded-[6px] font-bold hover:bg-[#5b13aa] w-full sm:w-auto text-sm sm:text-base"
                                onClick={confirmClose}
                            >
                                Yes
                            </button>
                            <button
                                className="bg-[#f4f1fa] text-black py-2 sm:py-[10px] px-4 sm:px-[20px] rounded-[6px] font-bold border border-[#d3cce3] hover:bg-[#eae4f4] w-full sm:w-auto text-sm sm:text-base"
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

export default MarketingData;
