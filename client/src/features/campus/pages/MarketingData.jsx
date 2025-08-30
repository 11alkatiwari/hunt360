import React, { useState } from 'react';
import axios from 'axios';
import Select from 'react-select';
import SingleEditForm from '../forms/SingleEditForm';
import Card from "../../../components/campus/Card";
import MarketingForm from '../forms/MarketingForm';

const baseURL = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/campus`
  : 'https://hunt360-3.onrender.com/api/campus';

const locationOptions = [
  { value: 'Mumbai', label: 'Mumbai' },
  { value: 'Pune', label: 'Pune' },
  { value: 'Nagpur', label: 'Nagpur' },
  { value: 'Thane', label: 'Thane' },
  { value: 'Nashik', label: 'Nashik' },
  { value: 'Bengaluru', label: 'Bengaluru' },
  { value: 'Mysuru', label: 'Mysuru' },
  { value: 'Hubballi', label: 'Hubballi' },
  { value: 'Mangaluru', label: 'Mangaluru' },
  { value: 'Chennai', label: 'Chennai' },
  { value: 'Coimbatore', label: 'Coimbatore' },
  { value: 'Madurai', label: 'Madurai' },
  { value: 'Tiruchirappalli', label: 'Tiruchirappalli' },
  { value: 'Hyderabad', label: 'Hyderabad' },
  { value: 'Warangal', label: 'Warangal' },
  { value: 'Nizamabad', label: 'Nizamabad' },
  { value: 'Kolkata', label: 'Kolkata' },
  { value: 'Howrah', label: 'Howrah' },
  { value: 'Durgapur', label: 'Durgapur' },
  { value: 'Asansol', label: 'Asansol' },
  { value: 'Delhi', label: 'Delhi' },
  { value: 'New Delhi', label: 'New Delhi' },
  { value: 'Dwarka', label: 'Dwarka' },
  { value: 'Ahmedabad', label: 'Ahmedabad' },
  { value: 'Surat', label: 'Surat' },
  { value: 'Vadodara', label: 'Vadodara' },
  { value: 'Rajkot', label: 'Rajkot' },
  { value: 'Jaipur', label: 'Jaipur' },
  { value: 'Udaipur', label: 'Udaipur' },
  { value: 'Jodhpur', label: 'Jodhpur' },
  { value: 'Kota', label: 'Kota' },
  { value: 'Lucknow', label: 'Lucknow' },
  { value: 'Kanpur', label: 'Kanpur' },
  { value: 'Agra', label: 'Agra' },
  { value: 'Varanasi', label: 'Varanasi' },
  { value: 'Meerut', label: 'Meerut' },
  { value: 'Bhopal', label: 'Bhopal' },
  { value: 'Indore', label: 'Indore' },
  { value: 'Gwalior', label: 'Gwalior' },
  { value: 'Jabalpur', label: 'Jabalpur' },
  { value: 'Patna', label: 'Patna' },
  { value: 'Gaya', label: 'Gaya' },
  { value: 'Muzaffarpur', label: 'Muzaffarpur' },
  { value: 'Bhagalpur', label: 'Bhagalpur' },
  { value: 'Bhubaneswar', label: 'Bhubaneswar' },
  { value: 'Cuttack', label: 'Cuttack' },
  { value: 'Rourkela', label: 'Rourkela' },
  { value: 'Puri', label: 'Puri' },
  { value: 'Chandigarh', label: 'Chandigarh' },
  { value: 'Panchkula', label: 'Panchkula' },
  { value: 'Mohali', label: 'Mohali' },
  { value: 'Shimla', label: 'Shimla' },
  { value: 'Dharamshala', label: 'Dharamshala' },
  { value: 'Solan', label: 'Solan' },
  { value: 'Ranchi', label: 'Ranchi' },
  { value: 'Jamshedpur', label: 'Jamshedpur' },
  { value: 'Dhanbad', label: 'Dhanbad' },
  { value: 'Bokaro', label: 'Bokaro' },
  { value: 'Thiruvananthapuram', label: 'Thiruvananthapuram' },
  { value: 'Kochi', label: 'Kochi' },
  { value: 'Kozhikode', label: 'Kozhikode' },
  { value: 'Itanagar', label: 'Itanagar' },
  { value: 'Tawang', label: 'Tawang' },
  { value: 'Dispur', label: 'Dispur' },
  { value: 'Guwahati', label: 'Guwahati' },
  { value: 'Dibrugarh', label: 'Dibrugarh' },
  { value: 'Aizawl', label: 'Aizawl' },
  { value: 'Lunglei', label: 'Lunglei' },
  { value: 'Shillong', label: 'Shillong' },
  { value: 'Tura', label: 'Tura' },
  { value: 'Imphal', label: 'Imphal' },
  { value: 'Kohima', label: 'Kohima' },
  { value: 'Dimapur', label: 'Dimapur' },
  { value: 'Gangtok', label: 'Gangtok' },
  { value: 'Port Blair', label: 'Port Blair' },
  { value: 'South Andmans', label: 'South Andmans' },
  { value: 'Puducherry', label: 'Puducherry' },
  { value: 'Karaikal', label: 'Karaikal' },
  { value: 'Leh', label: 'Leh' },
  { value: 'Kargil', label: 'Kargil' },
  { value: 'Srinagar', label: 'Srinagar' },
  { value: 'Jammu', label: 'Jammu' },
];


const courseOptions = [
  { value: 'BE/B.Tech', label: 'BE/B.Tech' },
  { value: 'MTech', label: 'MTech' },
  { value: 'MBA', label: 'MBA' },
  { value: 'BCA', label: 'BCA' },
  { value: 'MCA', label: 'MCA' },
  { value: 'BSc IT', label: 'BSc IT' },
  { value: 'Pharmacy', label: 'Pharmacy' },

  // Engineering & Technology
  { value: 'Diploma in Engineering', label: 'Diploma in Engineering' },
  { value: 'B.Arch', label: 'B.Arch (Bachelor of Architecture)' },
  { value: 'M.Arch', label: 'M.Arch (Master of Architecture)' },

  // Science
  { value: 'BSc', label: 'BSc (Bachelor of Science)' },
  { value: 'MSc', label: 'MSc (Master of Science)' },

  // Arts & Humanities
  { value: 'BA', label: 'BA (Bachelor of Arts)' },
  { value: 'MA', label: 'MA (Master of Arts)' },

  // Commerce & Business
  { value: 'BCom', label: 'BCom (Bachelor of Commerce)' },
  { value: 'MCom', label: 'MCom (Master of Commerce)' },

  // Law
  { value: 'LLB', label: 'LLB (Bachelor of Laws)' },
  { value: 'LLM', label: 'LLM (Master of Laws)' },

  // Medicine & Health
  { value: 'MBBS', label: 'MBBS' },
  { value: 'BDS', label: 'BDS (Dental Surgery)' },
  { value: 'BPT', label: 'BPT (Physiotherapy)' },
  { value: 'BAMS', label: 'BAMS (Ayurveda)' },
  { value: 'BHMS', label: 'BHMS (Homeopathy)' },
  { value: 'MD', label: 'MD (Doctor of Medicine)' },

  // Education
  { value: 'B.Ed', label: 'B.Ed (Bachelor of Education)' },
  { value: 'M.Ed', label: 'M.Ed (Master of Education)' },

  // Management & Professional
  { value: 'PGDM', label: 'PGDM (Post Graduate Diploma in Management)' },
  { value: 'CA', label: 'CA (Chartered Accountant)' },
  { value: 'CS', label: 'CS (Company Secretary)' },
  { value: 'CFA', label: 'CFA (Chartered Financial Analyst)' },

  // Vocational & Others
  { value: 'Diploma in Hotel Management', label: 'Diploma in Hotel Management' },
  { value: 'BHM', label: 'BHM (Bachelor of Hotel Management)' },
  { value: 'BFA', label: 'BFA (Fine Arts)' },
  { value: 'BJMC', label: 'BJMC (Journalism & Mass Communication)' },
  { value: 'B.Des', label: 'B.Des (Bachelor of Design)' },
  { value: 'M.Des', label: 'M.Des (Master of Design)' },
  { value: 'Diploma in Animation', label: 'Diploma in Animation' },
];


const MarketingData = () => {
  const [college, setCollege] = useState('');
  const [location, setLocation] = useState([]);
  const [course, setCourse] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingCollege, setEditingCollege] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showUpdatedOnly, setShowUpdatedOnly] = useState(false);

  const [updatedData, setUpdatedData] = useState({
    College_Name: '',
    State: '',
    District: '',
    Course: '',
    Anual_fees: '',
    Placement_fees: '',
    Ranking: '',
    Address: '',
    Phone: '',
    Director_name: '',
    Director_number: '',
    Director_email: '',
    Placement_coor_name: '',
    Placement_coor_contact: '',
    Placement_coor_email: '',
    Marketing_team_name: '',
    Total_num_candidates: '',
    Placed_candidates: '',
    Date_of_Contact: '',
    Date_of_Next_Contact: '',
    Hiring: '',
    Hiring_from_consultant: '',
    Send_proposal: '',
    Total_payment: '',
    Payment_received: '',
    Payment_period: '',
    Replacement_period: '',
    Data_updated_by_name: '',
    Term: ''

  });


  const handleSearch = async () => {
    if (!college && location.length === 0 && course.length === 0) {
      alert('Please enter College Name, Location, or Course.');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(`${baseURL}/search`, {
        params: {
          college,
          location: location.map(l => l.value).join(','),
          course: course.map(c => c.value).join(','),
        }
      });
      setColleges(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  const handleEdit = (collegeId) => {
    const collegeToEdit = colleges.find(col => col.Clg_ID === collegeId);
    setEditingCollege(collegeToEdit);
    setShowEditForm(true);
    setUpdatedData({ ...collegeToEdit });
  };

  const handleCloseEditForm = () => {
    setShowEditForm(false);
    setEditingCollege(null);
  };

  const handleUpdate = async () => {
    const updatedCollege = {
      ...updatedData,
      Update_timestamp: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };

    try {
      await axios.put(`${baseURL}/update/${editingCollege.Clg_ID}`, updatedCollege);
      setColleges(prev =>
        prev.map(col => (col.Clg_ID === editingCollege.Clg_ID ? { ...col, ...updatedCollege } : col))
      );
      setEditingCollege(null);
      setShowEditForm(false);
    } catch (error) {
      console.error('Error updating data:', error);
    }
  };

  const handleDelete = async (collegeId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this record?');
    if (!confirmDelete) return;

    try {
      await axios.delete(`${baseURL}/delete/${collegeId}`);
      setColleges(colleges.filter(col => col.Clg_ID !== collegeId));
    } catch (error) {
      console.error('Error deleting data:', error);
    }
  };

  const filteredColleges = showUpdatedOnly
    ? colleges.filter(college => college.Update_timestamp !== null)
    : colleges;

  return (
    <div className="p-6 max-w-full">
      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-3 sm:mb-4 md:mb-5">Marketing Data  Editing </h1>
      <p className="text-sm sm:text-base md:text-lg text-gray-500 font-semibold mt-1">
        Dashboard - Marketing data edit
      </p>
      <Card className="mt-5 p-5">
        <p className="text-xl font-bold text-gray-400 mb-5">Marketing Data Search</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-lg m-1 font-medium text-gray-700">College Name</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-600"
              placeholder="Enter college name"
              value={college}
              onChange={(e) => setCollege(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-lg m-1 font-medium text-gray-700">Location/City</label>
            <Select
              isMulti
              isSearchable
              placeholder="Select locations"
              options={locationOptions}
              value={location}
              onChange={setLocation}
              menuPortalTarget={document.body}
              styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
            />
          </div>

          <div>
            <label className="block text-lg m-1 font-medium text-gray-700">Courses</label>
            <Select
              isMulti
              isSearchable
              placeholder="Select Courses"
              options={courseOptions}
              value={course}
              onChange={setCourse}
              menuPortalTarget={document.body}
              styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
            />
          </div>
        </div>

        {/* Search Filters */}
        <div className="flex items-center gap-2 mb-6">
          <input
            type="checkbox"
            id="updated-data"
            checked={showUpdatedOnly}
            onChange={() => setShowUpdatedOnly(!showUpdatedOnly)}
            className="w-4 h-4"
          />
          <label htmlFor="updated-data" className="select-none cursor-pointer">
            Show Updated Data Only
          </label>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          <button
            className="bg-gray-900 shadow-md text-white px-4 py-2 rounded hover:bg-gray-700 transition"
            onClick={handleSearch}
          >
            Search
          </button>

          <button
            className="bg-gray-300 shadow-md text-black px-4 py-2 rounded hover:bg-gray-400 transition"
            onClick={() => {
              setCollege('');
              setLocation([]);
              setCourse([]);
              setShowUpdatedOnly(false);
              setColleges([]);
            }}
          >
            Clear Filters
          </button>
        </div>
      </Card>



      {/* Results Table */}
      <Card className="mt-5 p-4">
        <p className="text-xl font-bold text-gray-400 mb-5">Search Results</p>
        <div className="overflow-auto max-h-[600px]">
          {loading ? (
            <p>Loading...</p>
          ) : filteredColleges.length > 0 ? (
            <table className="min-w-[1200px] w-full table-auto border border-gray-300">
              <thead className="bg-gray-100 text-sm sticky top-0 z-10">
                <tr>
                  {[
                    'College ID', 'College Name', 'District', 'State', 'Courses',
                    'Annual Fees', 'Placement Fees', 'Ranking', 'Phone', 'Address',
                    'Director Name', 'Director Email', 'Director Contact',
                    'Placement Coordinator Name', 'Placement Coordinator Email', 'Placement Coordinator Contact',
                    'Marketing team name', 'Date of Contact', 'Date of Next Contact', 'Hiring',
                    'Hiring from consultant', 'Send proposal', 'Total number of Candidates',
                    'Placed Candidates', 'Total payment', 'Payment received', 'Payment period',
                    'Replacement period', 'Term', 'Update By', 'Update Timestamp', 'Update'
                  ].map((header, idx) => (
                    <th key={idx} className="border px-3 py-2 whitespace-nowrap text-center">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredColleges.map((college) => (
                  <tr key={college.Clg_ID} className="text-sm text-center border-t hover:bg-gray-50">
                    <td className="px-2 py-1 whitespace-nowrap">{college.Clg_ID}</td>
                    <td className="px-2 py-1 whitespace-nowrap">{college.College_Name}</td>
                    <td className="px-2 py-1 whitespace-nowrap">{college.District}</td>
                    <td className="px-2 py-1 whitespace-nowrap">{college.State}</td>
                    <td className="px-2 py-1 whitespace-nowrap">{college.Course}</td>
                    <td className="px-2 py-1 whitespace-nowrap">{college.Anual_fees}</td>
                    <td className="px-2 py-1 whitespace-nowrap">{college.Placement_fees}</td>
                    <td className="px-2 py-1 whitespace-nowrap">{college.Ranking}</td>
                    <td className="px-2 py-1 whitespace-nowrap">{college.Phone}</td>
                    <td className="px-2 py-1 whitespace-nowrap">{college.Address}</td>
                    <td className="px-2 py-1 whitespace-nowrap">{college.Director_name}</td>
                    <td className="px-2 py-1 whitespace-nowrap">{college.Director_email}</td>
                    <td className="px-2 py-1 whitespace-nowrap">{college.Director_number}</td>
                    <td className="px-2 py-1 whitespace-nowrap">{college.Placement_coor_name}</td>
                    <td className="px-2 py-1 whitespace-nowrap">{college.Placement_coor_email}</td>
                    <td className="px-2 py-1 whitespace-nowrap">{college.Placement_coor_contact}</td>
                    <td className="px-2 py-1 whitespace-nowrap">{college.Marketing_team_name}</td>
                    <td className="px-2 py-1 whitespace-nowrap">{college.Date_of_Contact}</td>
                    <td className="px-2 py-1 whitespace-nowrap">{college.Date_of_Next_Contact}</td>
                    <td className="px-2 py-1 whitespace-nowrap">{college.Hiring}</td>
                    <td className="px-2 py-1 whitespace-nowrap">{college.Hiring_from_consultant}</td>
                    <td className="px-2 py-1 whitespace-nowrap">{college.Send_proposal}</td>
                    <td className="px-2 py-1 whitespace-nowrap">{college.Total_num_candidates}</td>
                    <td className="px-2 py-1 whitespace-nowrap">{college.Placed_candidates}</td>
                    <td className="px-2 py-1 whitespace-nowrap">{college.Total_payment}</td>
                    <td className="px-2 py-1 whitespace-nowrap">{college.Payment_received}</td>
                    <td className="px-2 py-1 whitespace-nowrap">{college.Payment_period}</td>
                    <td className="px-2 py-1 whitespace-nowrap">{college.Replacement_period}</td>
                    <td className="px-2 py-1 whitespace-nowrap">{college.Term}</td>
                    <td className="px-2 py-1 whitespace-nowrap">{college.Data_updated_by_name}</td>
                    <td className="px-2 py-1 whitespace-nowrap">{college.Update_timestamp}</td>
                    <td className="flex flex-col gap-1 justify-center items-center py-2">
                      <button
                        onClick={() => handleEdit(college.Clg_ID)}
                        className="bg-yellow-400 shadow-md text-sm px-3 py-1 rounded hover:bg-yellow-500"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(college.Clg_ID)}
                        className="bg-red-500 shadow-md text-white text-sm px-3 py-1 rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No results found</p>
          )}
        </div>
      </Card>


      {showEditForm && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 "
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-form-title"
          onClick={(e) => {
            // Close modal if click is outside the form container
            if (e.target === e.currentTarget) handleCloseEditForm();
          }}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-lg w-[95%] max-w-4xl max-h-[800px] overflow-y-auto"
            // prevent modal content clicks from triggering backdrop click
            onClick={(e) => e.stopPropagation()}
          >
            <MarketingForm
              college={editingCollege}
              updatedData={updatedData}
              setUpdatedData={setUpdatedData}
              onClose={handleCloseEditForm}
              onSave={handleUpdate}
            />
          </div>
        </div>
      )}

    </div>
  );
};

export default MarketingData;
