import axios from 'axios';
import { useEffect, useState } from 'react';
import { FaEdit, FaEye } from 'react-icons/fa';


const baseURL = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/linkedin`
  : 'http://localhost:3000/api/linkedin';


const SingleDataEdit = () => {
  const [showForm, setShowForm] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [filters, setFilters] = useState({ company: '', location: '', updated: '' });
  const [results, setResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showView, setShowView] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);


  const handleEdit = (company) => {
    setSelectedCompany(company);
    setShowForm(true);
  };

  const handleView = (company) => {
    setSelectedCompany(company);
    setShowView(true);
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
    setFilters((prev) => {
      const newFilters = { ...prev, [name]: value };
      sessionStorage.setItem('singleEdit_savedFilters', JSON.stringify(newFilters));
      return newFilters;
    });
  };

  const handleSearch = async (page = 1) => {
    try {
      // Normalize updated filter to match backend (Yes/No)
      const normalizedFilters = {
        ...filters,
        updated: filters.updated ? filters.updated.charAt(0).toUpperCase() + filters.updated.slice(1).toLowerCase() : '',
      };
      const params = new URLSearchParams({
        company: normalizedFilters.company || '',
        location: normalizedFilters.location || '',
        updated: normalizedFilters.updated || '',
        page,
        limit: 10,
      }).toString();
      console.log('SingleDataEdit Search params:', params);
      const response = await axios.get(`${baseURL}/search-companies?${params}`);
      console.log('SingleDataEdit Search response:', response.data);
      //console.log("Received updated_at:", response.data.data[0]?.updated_at);

      setResults(response.data.data || []);
      setTotalPages(response.data.totalPages || 1);
      setCurrentPage(response.data.currentPage || page);
      // Save state to sessionStorage
      sessionStorage.setItem('singleEdit_savedResults', JSON.stringify(response.data.data || []));
      sessionStorage.setItem('singleEdit_savedFilters', JSON.stringify(normalizedFilters));
      sessionStorage.setItem('singleEdit_savedPage', page.toString());
      sessionStorage.setItem('singleEdit_savedTotalPages', (response.data.totalPages || 1).toString());
    } catch (error) {
      console.error('SingleDataEdit Search failed:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      alert('Search failed. Check console for details.');
      setResults([]);
      sessionStorage.setItem('singleEdit_savedResults', '[]');
    }
  };

  const clearFilters = () => {
    const newFilters = { company: '', location: '', updated: '' };
    setFilters(newFilters);
    setResults([]);
    setCurrentPage(1);
    setTotalPages(1);
    // Save cleared state to sessionStorage
    sessionStorage.setItem('singleEdit_savedFilters', JSON.stringify(newFilters));
    sessionStorage.setItem('singleEdit_savedResults', '[]');
    sessionStorage.setItem('singleEdit_savedPage', '1');
    sessionStorage.setItem('singleEdit_savedTotalPages', '1');
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    handleSearch(newPage);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const companyToSubmit = {
      ...selectedCompany,

    };
    try {
      const res = await fetch(`${baseURL}/save-single-edit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(companyToSubmit),
      });

      const data = await res.json();
      if (res.ok) {
        alert('Form data saved successfully!');
        const updatedCompany = data.updatedCompany; // ✅ Now includes correct updated_at

        setResults((prev) =>
          prev.map((company) =>
            company.id === updatedCompany.id ? updatedCompany : company
          )
        );
        setSelectedCompany(updatedCompany); // ✅ This now includes latest updated_at
        setShowForm(false);

        sessionStorage.setItem(
          'singleEdit_savedResults',
          JSON.stringify(
            results.map((company) =>
              company.id === updatedCompany.id ? updatedCompany : company
            )
          )
        );
      }

      else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      alert('Network error. Try again later.');
      console.error('Submit error:', err);
    }
  };
  useEffect(() => {
    // Load saved state from sessionStorage
    const savedFilters = JSON.parse(sessionStorage.getItem('singleEdit_savedFilters') || '{}');
    const savedResults = JSON.parse(sessionStorage.getItem('singleEdit_savedResults') || '[]');
    const savedPage = parseInt(sessionStorage.getItem('singleEdit_savedPage') || '1', 10);
    const savedTotalPages = parseInt(sessionStorage.getItem('singleEdit_savedTotalPages') || '1', 10);

    // Set state
    setFilters(savedFilters);
    setResults(savedResults);
    setCurrentPage(savedPage);
    setTotalPages(savedTotalPages);

    // Trigger search if filters are non-empty to restore last state
    if (savedFilters.company || savedFilters.location || savedFilters.updated) {
      handleSearch(savedPage);
    }
  }, []);

  //console.log("Date of Contact value:", selectedCompany?.date_of_contact);

  // Function to handle adding new company
  const handleAddCompany = async () => {
    try {
      const res = await fetch(`${baseURL}/add-profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(selectedCompany), // selectedCompany holds form data
      });

      const data = await res.json();

      if (res.ok) {
        alert("Profile added successfully!");

        // Update the table to show new data instantly
        const newCompany = {
          ...selectedCompany,
          id: data.insertId, // if your backend returns insertId
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

  // Function to open empty form for adding
  const handleAddNewProfileClick = () => {
    setSelectedCompany({
      name: "",
      company: "",
      location: "",
      follower: "",
      connection: "",
      url: "",

    });
    setShowAddForm(true);
  };

  return (
    <div className="mt-5">
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 flex-wrap items-start sm:items-center">
        <div className="flex flex-col gap-1 sm:gap-[1px] mr-2 sm:mr-[10px] w-full sm:w-auto">
          <label className="block mb-1 sm:mb-[5px] font-bold text-[#17151b] text-sm sm:text-base">Company</label>
          <input
            type="text"
            name="company"
            value={filters.company}
            onChange={handleChange}
            placeholder="Enter company..."
            className="w-full sm:w-[200px] md:w-[250px] p-2 sm:p-[10px] border-1 border-black rounded-[6px] text-sm sm:text-base"
          />
        </div>

        <div className="flex flex-col gap-1 sm:gap-[5px] mr-2 sm:mr-[10px] w-full sm:w-auto">
          <label className="block mb-1 sm:mb-[5px] font-bold text-[#17151b] text-sm sm:text-base">Location</label>
          <input
            type="text"
            name="location"
            value={filters.location}
            onChange={handleChange}
            placeholder="Enter location..."
            className="w-full sm:w-[200px] md:w-[250px] p-2 sm:p-[10px] border-1 border-black rounded-[6px] text-sm sm:text-base"
          />
        </div>

        <div className="flex flex-col gap-1 sm:gap-[5px] mr-2 sm:mr-[10px] w-full sm:w-auto">
          <label className="block mb-1 sm:mb-[5px] font-bold text-[#17151b] text-sm sm:text-base">Updated</label>
          <select
            name="updated"
            value={filters.updated}
            onChange={handleChange}
            className="w-full sm:w-[200px] md:w-[250px] p-2 sm:p-[10px] border-1 border-black rounded-[6px] text-sm sm:text-base"
          >
            <option value="">Select</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>

        <div className="flex gap-2 sm:gap-[10px] items-center mt-2 sm:mt-[2.5px] w-full sm:w-auto">
          <button
            onClick={() => handleSearch(1)}
            className="bg-[#6A1B9A] text-white py-2 sm:py-[12px] font-bold px-4 sm:px-[20px] rounded-md text-sm sm:text-[15px] hover:opacity-90 cursor-pointer w-full sm:w-auto"
          >
            Search
          </button>
          <button
            onClick={clearFilters}
            className="bg-[#d3cce3] hover:bg-[#D1D5DB] font-bold text-black py-2 sm:py-[12px] px-4 sm:px-[20px] rounded-md text-sm sm:text-[15px] cursor-pointer w-full sm:w-auto"
          >
            Clear Filters
          </button>
        </div>
      </div>

      <div className="mt-4">
        <button
          className="bg-[#6A1B9A] text-white py-2 px-4 rounded-md text-sm font-medium hover:opacity-90 flex items-center gap-2"
          onClick={handleAddNewProfileClick}
        >
          <span className="text-lg">+</span>
          Add New Profile
        </button>
      </div>

      <div className="bg-white p-4 sm:p-[20px] rounded-[8px] shadow-[0_2px_5px_rgba(0,0,0,0.1)] mt-4 sm:mt-[20px] overflow-x-auto">
        <h3 className="text-[#17151b] text-base sm:text-lg font-bold mb-3 sm:mb-4">Search Results</h3>
        <table className="w-full min-w-[800px] border border-gray-300">
          <thead>
            <tr>
              <th className="bg-[#6a1b9a] text-white px-4 py-2 text-left text-sm border border-gray-300">Name</th>
              <th className="bg-[#6a1b9a] text-white px-4 py-2 text-left text-sm border border-gray-300">Company</th>
              <th className="bg-[#6a1b9a] text-white px-4 py-2 text-left text-sm border border-gray-300">Location</th>
              <th className="bg-[#6a1b9a] text-white px-4 py-2 text-left text-sm border border-gray-300">Follower</th>
              <th className="bg-[#6a1b9a] text-white px-4 py-2 text-left text-sm border border-gray-300">Connection</th>
              <th className="bg-[#6a1b9a] text-white px-4 py-2 text-left text-sm border border-gray-300">Url</th>
              <th className="bg-[#6a1b9a] text-white px-4 py-2 text-left text-sm border border-gray-300">Updated</th>
              <th className="bg-[#6a1b9a] text-white px-4 py-2 text-left text-sm border border-gray-300">Last Modified</th>
              <th className="bg-[#6a1b9a] text-white px-4 py-2 text-left text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {results.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-2 text-sm text-center border border-gray-300">
                  No results found.
                </td>
              </tr>
            ) : results.map((item) => (
              <tr key={item.id} className="border-t border-gray-200">
                <td className="px-4 py-2 text-sm border border-gray-300">{item.name}</td>
                <td className="px-4 py-2 text-sm border border-gray-300">{item.company}</td>
                <td className="px-4 py-2 text-sm border border-gray-300">{item.location}</td>
                <td className="px-4 py-2 text-sm border border-gray-300">{item.follower}</td>
                <td className="px-4 py-2 text-sm border border-gray-300">{item.connection}</td>
                <td className="px-4 py-2 text-sm border border-gray-300">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Link
                  </a>
                </td>
                <td className="px-4 py-2 text-sm border border-gray-300">{item.updated}</td>
                <td className="px-4 py-2 text-sm border border-gray-300">
                  {item.updated_at ? item.updated_at.slice(0, 10) : ""}
                </td>

                <td className="px-3 sm:px-4 py-1 sm:py-2 border border-gray-300">
                  <div className="flex items-center justify-center gap-2 sm:gap-3">
                    <FaEdit className="cursor-pointer text-green-500 text-lg sm:text-xl" onClick={() => handleEdit(item)} />
                    <FaEye className="cursor-pointer text-blue-500 text-lg sm:text-xl" onClick={() => handleView(item)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>

        </table>

        <div className="text-center mt-5">
          <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4 mb-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="bg-[#6A1B9A] text-white py-2 px-6 rounded-[6px] hover:opacity-90 text-sm sm:text-base disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="bg-[#6A1B9A] text-white py-2 px-6 rounded-[6px] hover:opacity-90 text-sm sm:text-base disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="font-bold text-sm sm:text-base">Page {currentPage} of {totalPages}</div>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[1000]">
          <div className="bg-[#f4eaff] p-4 sm:p-[30px_40px] rounded-[15px] w-full sm:w-[500px] max-w-[95%] sm:max-w-[90%] max-h-[90vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden shadow-[0_10px_25px_rgba(0,0,0,0.2)]">
            <div className="flex justify-between items-center mb-3 sm:mb-[20px]">
              <h2 className="text-[#5e2ca5] text-xl sm:text-[24px] font-bold">Edit Profile</h2>
              <span
                className="text-xl sm:text-[24px] font-bold cursor-pointer bg-transparent border-none p-0 ml-3 sm:ml-[20px]"
                onClick={closeForm}
              >
                ×
              </span>
            </div>
            <form className="flex flex-col gap-3 sm:gap-[20px]" onSubmit={handleSubmit}>
              <div>
                <label className="font-bold mb-1 sm:mb-[5px] block text-[#333] text-sm sm:text-base">Name</label>
                <input
                  type="text"
                  value={selectedCompany?.name || ''}
                  onChange={(e) => setSelectedCompany((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2 sm:p-[12px] border border-[#ccc] rounded-[8px] text-sm sm:text-[14px] focus:outline-none focus:border-[#7b3fe4]"
                />
              </div>
              <div>
                <label className="font-bold mb-1 sm:mb-[5px] block text-[#333] text-sm sm:text-base">Company</label>
                <input
                  type="text"
                  value={selectedCompany?.company || ''}
                  onChange={(e) => setSelectedCompany((prev) => ({ ...prev, company: e.target.value }))}
                  className="w-full p-2 sm:p-[12px] border border-[#ccc] rounded-[8px] text-sm sm:text-[14px] focus:outline-none focus:border-[#7b3fe4]"
                />
              </div>
              <div>
                <label className="font-bold mb-1 sm:mb-[5px] block text-[#333] text-sm sm:text-base">Location</label>
                <input
                  type="text"
                  value={selectedCompany?.location || ''}
                  onChange={(e) => setSelectedCompany((prev) => ({ ...prev, location: e.target.value }))}
                  className="w-full p-2 sm:p-[12px] border border-[#ccc] rounded-[8px] text-sm sm:text-[14px] focus:outline-none focus:border-[#7b3fe4]"
                />
              </div>
              <div>
                <label className="font-bold mb-1 sm:mb-[5px] block text-[#333] text-sm sm:text-base">Follower</label>
                <input
                  type="text"
                  value={selectedCompany?.follower || ''}
                  onChange={(e) => setSelectedCompany((prev) => ({ ...prev, follower: e.target.value }))}
                  className="w-full p-2 sm:p-[12px] border border-[#ccc] rounded-[8px] text-sm sm:text-[14px] focus:outline-none focus:border-[#7b3fe4]"
                />
              </div>
              <div>
                <label className="font-bold mb-1 sm:mb-[5px] block text-[#333] text-sm sm:text-base">Connection</label>
                <input
                  type="text"
                  value={selectedCompany?.connection || ''}
                  onChange={(e) => setSelectedCompany((prev) => ({ ...prev, connection: e.target.value }))}
                  className="w-full p-2 sm:p-[12px] border border-[#ccc] rounded-[8px] text-sm sm:text-[14px] focus:outline-none focus:border-[#7b3fe4]"
                />
              </div>
              <div>
                <label className="font-bold mb-1 sm:mb-[5px] block text-[#333] text-sm sm:text-base">Url</label>
                <input
                  type="text"
                  value={selectedCompany?.url || ''}
                  onChange={(e) => setSelectedCompany((prev) => ({ ...prev, url: e.target.value }))}
                  className="w-full p-2 sm:p-[12px] border border-[#ccc] rounded-[8px] text-sm sm:text-[14px] focus:outline-none focus:border-[#7b3fe4]"
                />
              </div>

              {/* Position */}
              <div>
                <label className="font-bold mb-1 sm:mb-[5px] block text-[#333] text-sm sm:text-base">Position</label>
                <input
                  type="text"
                  value={selectedCompany?.position || ''}
                  onChange={(e) => setSelectedCompany((prev) => ({ ...prev, position: e.target.value }))}
                  className="w-full p-2 sm:p-[12px] border border-[#ccc] rounded-[8px] text-sm sm:text-[14px] focus:outline-none focus:border-[#7b3fe4]"
                />
              </div>

              {/* Work From */}
              <div>
                <label className="font-bold mb-1 sm:mb-[5px] block text-[#333] text-sm sm:text-base">Work From</label>
                <select
                  value={selectedCompany?.work_from || ''}
                  onChange={(e) => setSelectedCompany((prev) => ({ ...prev, work_from: e.target.value }))}
                  className="w-full p-2 sm:p-[12px] border border-[#ccc] rounded-[8px] text-sm sm:text-[14px] focus:outline-none focus:border-[#7b3fe4]"
                >
                  <option value="">Select</option>
                  <option value="Onsite">Onsite</option>
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>

              {/* Education */}
              <div>
                <label className="font-bold mb-1 sm:mb-[5px] block text-[#333] text-sm sm:text-base">Education</label>
                <input
                  type="text"
                  value={selectedCompany?.education || ''}
                  onChange={(e) => setSelectedCompany((prev) => ({ ...prev, education: e.target.value }))}
                  className="w-full p-2 sm:p-[12px] border border-[#ccc] rounded-[8px] text-sm sm:text-[14px] focus:outline-none focus:border-[#7b3fe4]"
                />
              </div>

              {/* BD Name */}
              <div>
                <label className="font-bold mb-1 sm:mb-[5px] block text-[#333] text-sm sm:text-base">BD Name</label>
                <input
                  type="text"
                  value={selectedCompany?.bd_name || ''}
                  onChange={(e) => setSelectedCompany((prev) => ({ ...prev, bd_name: e.target.value }))}
                  className="w-full p-2 sm:p-[12px] border border-[#ccc] rounded-[8px] text-sm sm:text-[14px] focus:outline-none focus:border-[#7b3fe4]"
                />
              </div>

              {/* Date of Contact */}

              <div>
                <label className="font-bold mb-1 sm:mb-[5px] block text-[#333] text-sm sm:text-base">Date of contact</label>
                <input
                  type="text"
                  placeholder="YYYY-MM-DD"
                  value={selectedCompany?.date_of_contact || ''}
                  onChange={(e) => setSelectedCompany((prev) => ({ ...prev, date_of_contact: e.target.value }))}
                  className="w-full p-2 sm:p-[12px] border border-[#ccc] rounded-[8px] text-sm sm:text-[14px] focus:outline-none focus:border-[#7b3fe4]"
                />
              </div>
              {/* LinkedIn Message Date */}
              <div>
                <label className="font-bold mb-1 sm:mb-[5px] block text-[#333] text-sm sm:text-base">LinkedIn Message Date</label>
                <input
                  type="text"
                  placeholder="YYYY-MM-DD"
                  value={selectedCompany?.linkedin_message_date || ''}
                  onChange={(e) => setSelectedCompany((prev) => ({ ...prev, linkedin_message_date: e.target.value }))}
                  className="w-full p-2 sm:p-[12px] border border-[#ccc] rounded-[8px] text-sm sm:text-[14px] focus:outline-none focus:border-[#7b3fe4]"
                />
              </div>


              {/* Notes */}
              <div>
                <label className="font-bold mb-1 sm:mb-[5px] block text-[#333] text-sm sm:text-base">Notes</label>
                <textarea
                  value={selectedCompany?.notes || ''}
                  onChange={(e) => setSelectedCompany((prev) => ({ ...prev, notes: e.target.value }))}
                  className="w-full p-2 sm:p-[12px] border border-[#ccc] rounded-[8px] text-sm sm:text-[14px] focus:outline-none focus:border-[#7b3fe4]"
                ></textarea>
              </div>


              <div>
                <label className="font-bold mb-1 sm:mb-[5px] block text-[#333] text-sm sm:text-base">Updated</label>
                <select
                  value={selectedCompany?.updated || ""}
                  onChange={(e) =>
                    setSelectedCompany((prev) => ({ ...prev, updated: e.target.value }))
                  }
                  className="w-full p-2 sm:p-[12px] border border-[#ccc] rounded-[8px] text-sm sm:text-[14px] focus:outline-none focus:border-[#7b3fe4]"
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full sm:w-[150px] p-2 sm:p-[12px] bg-[#7019d2] text-white rounded-[8px] text-sm sm:text-[16px] font-bold hover:bg-[#5b13aa]"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      )}

      {showView && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[1000]">
          <div className="bg-[#f4eaff] p-4 sm:p-[30px_40px] rounded-[15px] w-full sm:w-[500px] max-w-[95%] sm:max-w-[90%] max-h-[90vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden shadow-[0_10px_25px_rgba(0,0,0,0.2)]">
            <div className="flex justify-between items-center mb-3 sm:mb-[20px]">
              <h2 className="text-[#5e2ca5] text-xl sm:text-[24px] font-bold">View Profile</h2>
              <span
                className="text-xl sm:text-[24px] font-bold cursor-pointer bg-transparent border-none p-0 ml-3 sm:ml-[20px]"
                onClick={() => setShowView(false)}
              >
                ×
              </span>
            </div>
            <div className="flex flex-col gap-3 sm:gap-[20px]">
              <div>
                <label className="font-bold mb-1 sm:mb-[5px] block text-[#333] text-sm sm:text-base">Name</label>
                <input
                  type="text"
                  value={selectedCompany?.name || ''}
                  readOnly
                  className="w-full p-2 sm:p-[12px] border border-[#ccc] rounded-[8px] text-sm sm:text-[14px]"
                />
              </div>
              <div>
                <label className="font-bold mb-1 sm:mb-[5px] block text-[#333] text-sm sm:text-base">Company</label>
                <input
                  type="text"
                  value={selectedCompany?.company || ''}
                  readOnly
                  className="w-full p-2 sm:p-[12px] border border-[#ccc] rounded-[8px] text-sm sm:text-[14px]"
                />
              </div>
              <div>
                <label className="font-bold mb-1 sm:mb-[5px] block text-[#333] text-sm sm:text-base">Location</label>
                <input
                  type="text"
                  value={selectedCompany?.location || ''}
                  readOnly
                  className="w-full p-2 sm:p-[12px] border border-[#ccc] rounded-[8px] text-sm sm:text-[14px]"
                />
              </div>
              <div>
                <label className="font-bold mb-1 sm:mb-[5px] block text-[#333] text-sm sm:text-base">Follower</label>
                <input
                  type="text"
                  value={selectedCompany?.follower || ''}
                  readOnly
                  className="w-full p-2 sm:p-[12px] border border-[#ccc] rounded-[8px] text-sm sm:text-[14px]"
                />
              </div>
              <div>
                <label className="font-bold mb-1 sm:mb-[5px] block text-[#333] text-sm sm:text-base">Connection</label>
                <input
                  type="text"
                  value={selectedCompany?.connection || ''}
                  readOnly
                  className="w-full p-2 sm:p-[12px] border border-[#ccc] rounded-[8px] text-sm sm:text-[14px]"
                />
              </div>
              <div>
                <label className="font-bold mb-1 sm:mb-[5px] block text-[#333] text-sm sm:text-base">Url</label>
                <input
                  type="text"
                  value={selectedCompany?.url || ''}
                  readOnly
                  className="w-full p-2 sm:p-[12px] border border-[#ccc] rounded-[8px] text-sm sm:text-[14px]"
                />
              </div>

              {/* Position */}
              <div>
                <label className="font-bold mb-1 sm:mb-[5px] block text-[#333] text-sm sm:text-base">Position</label>
                <input
                  type="text"
                  value={selectedCompany?.position || ''}
                  readOnly
                  className="w-full p-2 sm:p-[12px] border border-[#ccc] rounded-[8px] text-sm sm:text-[14px] "
                />
              </div>

              {/* Work From */}
              <div>
                <label className="font-bold mb-1 sm:mb-[5px] block text-[#333] text-sm sm:text-base">Work From</label>
                <input
                  type="text"
                  value={selectedCompany?.work_from || ''}
                  readOnly
                  className="w-full p-2 sm:p-[12px] border border-[#ccc] rounded-[8px] text-sm sm:text-[14px] "
                />
              </div>

              {/* Education */}
              <div>
                <label className="font-bold mb-1 sm:mb-[5px] block text-[#333] text-sm sm:text-base">Education</label>
                <input
                  type="text"
                  value={selectedCompany?.education || ''}
                  readOnly
                  className="w-full p-2 sm:p-[12px] border border-[#ccc] rounded-[8px] text-sm sm:text-[14px] "
                />
              </div>

              {/* BD Name */}
              <div>
                <label className="font-bold mb-1 sm:mb-[5px] block text-[#333] text-sm sm:text-base">BD Name</label>
                <input
                  type="text"
                  value={selectedCompany?.bd_name || ''}
                  readOnly
                  className="w-full p-2 sm:p-[12px] border border-[#ccc] rounded-[8px] text-sm sm:text-[14px] "
                />
              </div>

              {/* Date of Contact */}
              <div>
                <label className="font-bold mb-1 sm:mb-[5px] block text-[#333] text-sm sm:text-base">Date of Contact</label>
                <input
                  type="text"
                  value={selectedCompany?.date_of_contact || ''}
                  readOnly
                  className="w-full p-2 sm:p-[12px] border border-[#ccc] rounded-[8px] text-sm sm:text-[14px] "
                />
              </div>

              {/* Notes */}
              <div>
                <label className="font-bold mb-1 sm:mb-[5px] block text-[#333] text-sm sm:text-base">Notes</label>
                <textarea
                  value={selectedCompany?.notes || ''}
                  readOnly
                  rows={3}
                  className="w-full p-2 sm:p-[12px] border border-[#ccc] rounded-[8px] text-sm sm:text-[14px] "
                ></textarea>
              </div>

              {/* LinkedIn Message Date */}
              <div>
                <label className="font-bold mb-1 sm:mb-[5px] block text-[#333] text-sm sm:text-base">LinkedIn Message Date</label>
                <input
                  type="text"
                  value={selectedCompany?.linkedin_message_date || ''}
                  readOnly
                  className="w-full p-2 sm:p-[12px] border border-[#ccc] rounded-[8px] text-sm sm:text-[14px] "
                />
              </div>

              <button
                className="w-full sm:w-[150px] p-2 sm:p-[12px] bg-[#7019d2] text-white rounded-[8px] text-sm sm:text-[16px] font-bold hover:bg-[#5b13aa]"
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
          <div className="bg-[#f4eaff] p-4 rounded-[15px] w-full sm:w-[500px] max-w-[95%] max-h-[90vh] overflow-y-auto shadow-lg">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-[#5e2ca5] text-xl font-bold">
                {selectedCompany?.id ? "Edit Profile" : "Add New Profile"}
              </h2>
              <span
                className="text-xl font-bold cursor-pointer"
                onClick={() => setShowAddForm(false)}
              >
                ×
              </span>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={selectedCompany?.name || ''}
                  onChange={(e) =>
                    setSelectedCompany((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="border p-2 rounded w-full"
                />
              </div>

              <div>
                <label>Company</label>
                <input
                  type="text"
                  name="company"
                  value={selectedCompany?.company || ''}
                  onChange={(e) =>
                    setSelectedCompany((prev) => ({ ...prev, company: e.target.value }))
                  }
                  className="border p-2 rounded w-full"
                  required
                />
              </div>

              <div>
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  value={selectedCompany?.location || ''}
                  onChange={(e) =>
                    setSelectedCompany((prev) => ({ ...prev, location: e.target.value }))
                  }
                  className="border p-2 rounded w-full"
                  required
                />
              </div>

              <div>
                <label>Follower</label>
                <input
                  type="text"
                  name="follower"
                  value={selectedCompany?.follower || ''}
                  onChange={(e) =>
                    setSelectedCompany((prev) => ({ ...prev, follower: e.target.value }))
                  }
                  className="border p-2 rounded w-full"
                />
              </div>

              <div>
                <label>Connection</label>
                <input
                  type="text"
                  name="connection"
                  value={selectedCompany?.connection || ''}
                  onChange={(e) =>
                    setSelectedCompany((prev) => ({ ...prev, connection: e.target.value }))
                  }
                  className="border p-2 rounded w-full"
                />
              </div>

              <div>
                <label>URL</label>
                <input
                  type="text"
                  name="url"
                  value={selectedCompany?.url || ''}
                  onChange={(e) =>
                    setSelectedCompany((prev) => ({ ...prev, url: e.target.value }))
                  }
                  className="border p-2 rounded w-full"
                />
              </div>

              {/* Save Button */}
              <button
                onClick={handleAddCompany}
                className="bg-[#7019d2] text-white p-2 rounded font-bold hover:bg-[#5b13aa]"
              >
                Save
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
                className="bg-[#7019d2] text-white py-2 sm:py-[10px] px-4 sm:px-[20px] rounded-[6px] text-sm sm:text-base sm:text-center"
                onClick={confirmClose}
              >
                Yes
              </button>
              <button
                className="bg-[#f4f4f3] text-black py-2 sm:py-[10px] px-4 sm:px-[20px] rounded-[6px] text-sm sm:text-base sm:text-center"
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