/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import axios from 'axios';
import Select from 'react-select';
import SingleEditForm from '../forms/SingleEditForm';
import { Plus } from 'lucide-react';
import Card from '../../../components/campus/Card';
import InserForm from '../forms/InsertForm';

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
  { value: 'Diploma in Engineering', label: 'Diploma in Engineering' },
  { value: 'B.Arch', label: 'B.Arch (Bachelor of Architecture)' },
  { value: 'M.Arch', label: 'M.Arch (Master of Architecture)' },
  { value: 'BSc', label: 'BSc (Bachelor of Science)' },
  { value: 'MSc', label: 'MSc (Master of Science)' },
  { value: 'BA', label: 'BA (Bachelor of Arts)' },
  { value: 'MA', label: 'MA (Master of Arts)' },
  { value: 'BCom', label: 'BCom (Bachelor of Commerce)' },
  { value: 'MCom', label: 'MCom (Master of Commerce)' },
  { value: 'LLB', label: 'LLB (Bachelor of Laws)' },
  { value: 'LLM', label: 'LLM (Master of Laws)' },
  { value: 'MBBS', label: 'MBBS' },
  { value: 'BDS', label: 'BDS (Dental Surgery)' },
  { value: 'BPT', label: 'BPT (Physiotherapy)' },
  { value: 'BAMS', label: 'BAMS (Ayurveda)' },
  { value: 'BHMS', label: 'BHMS (Homeopathy)' },
  { value: 'MD', label: 'MD (Doctor of Medicine)' },
  { value: 'B.Ed', label: 'B.Ed (Bachelor of Education)' },
  { value: 'M.Ed', label: 'M.Ed (Master of Education)' },
  { value: 'PGDM', label: 'PGDM (Post Graduate Diploma in Management)' },
  { value: 'CA', label: 'CA (Chartered Accountant)' },
  { value: 'CS', label: 'CS (Company Secretary)' },
  { value: 'CFA', label: 'CFA (Chartered Financial Analyst)' },
  { value: 'Diploma in Hotel Management', label: 'Diploma in Hotel Management' },
  { value: 'BHM', label: 'BHM (Bachelor of Hotel Management)' },
  { value: 'BFA', label: 'BFA (Fine Arts)' },
  { value: 'BJMC', label: 'BJMC (Journalism & Mass Communication)' },
  { value: 'B.Des', label: 'B.Des (Bachelor of Design)' },
  { value: 'M.Des', label: 'M.Des (Master of Design)' },
  { value: 'Diploma in Animation', label: 'Diploma in Animation' },
];

const API_BASE_URL = "https://hunt360-3.onrender.com/api/campus";

const SingleDataEdit = () => {
  const [college, setCollege] = useState('');
  const [location, setLocation] = useState([]);
  const [course, setCourse] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingCollege, setEditingCollege] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showUpdatedOnly, setShowUpdatedOnly] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [updatedData, setUpdatedData] = useState({
    College_Name: '',
    State: '',
    District: '',
    Course: '',
    Anual_fees: '', // ✅ fixed capitalization
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
    Data_updated_by_name: '',
    Term: '',
  });

  const handleSearch = async () => {
    if (!college && location.length === 0 && course.length === 0) {
      alert('Please enter College Name, Location, or Course.');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/search`, {
        params: {
          college,
          location: location.map((l) => l.value).join(','),
          course: course.map((c) => c.value).join(','),
        },
      });
      setColleges(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  const handleEdit = (collegeId) => {
    const collegeToEdit = colleges.find((col) => col.Clg_ID === collegeId);
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
      Update_timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
    };

    try {
      await axios.put(`${API_BASE_URL}/update/${editingCollege.Clg_ID}`, updatedCollege);
      setColleges((prev) =>
        prev.map((col) =>
          col.Clg_ID === editingCollege.Clg_ID ? { ...col, ...updatedCollege } : col
        )
      );
      setEditingCollege(null);
      setShowEditForm(false);
    } catch (error) {
      console.error('Error updating data:', error);
    }
  };

  const handleDelete = async (collegeId) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/delete/${collegeId}`);
      setColleges(colleges.filter((col) => col.Clg_ID !== collegeId));
    } catch (error) {
      console.error('Error deleting data:', error);
    }
  };

  const filteredColleges = showUpdatedOnly
    ? colleges.filter((college) => college.Update_timestamp !== null)
    : colleges;

  return (
    <div className="p-6 max-w-full">
      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-3 sm:mb-4 md:mb-5">
        Single Data Edit
      </h1>
      <p className="text-sm sm:text-base md:text-lg text-gray-500 font-semibold mt-1">
        Dashboard - Single data edit
      </p>

      {/* Search Section */}
      <Card className="mt-5 p-6">
        <p className="text-xl font-bold text-gray-400 mb-5">Single Data Search</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-xl mb-2 font-medium text-gray-700">
              College Name
            </label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              placeholder="Enter college name"
              value={college}
              onChange={(e) => setCollege(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xl mb-2 font-medium text-gray-700">
              Location/City
            </label>
            <Select
              isMulti
              isSearchable
              placeholder="Select locations"
              options={locationOptions}
              value={location}
              onChange={setLocation}
              menuPortalTarget={document.body}
              styles={{
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                container: (base) => ({ ...base, maxWidth: '100%' }),
                control: (base) => ({ ...base, minHeight: '38px' }),
              }}
            />
          </div>

          <div>
            <label className="block text-xl mb-2 font-medium text-gray-700">
              Courses
            </label>
            <Select
              isMulti
              isSearchable
              placeholder="Select Courses"
              options={courseOptions}
              value={course}
              onChange={setCourse}
              menuPortalTarget={document.body}
              styles={{
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                container: (base) => ({ ...base, maxWidth: '100%' }),
                control: (base) => ({ ...base, minHeight: '38px' }),
              }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 mb-6">
          <input
            type="checkbox"
            id="updated-data"
            checked={showUpdatedOnly}
            onChange={() => setShowUpdatedOnly(!showUpdatedOnly)}
            className="h-4 w-4"
          />
          <label htmlFor="updated-data" className="text-gray-700">
            Show Updated Data Only
          </label>
        </div>

        <div className="flex flex-wrap gap-4 mb-10">
          <button
            className="bg-gray-900 shadow-md text-white px-4 py-2 rounded hover:bg-gray-700"
            onClick={handleSearch}
          >
            Search
          </button>

          <button
            className="bg-gray-300 shadow-md text-black px-4 py-2 rounded hover:bg-gray-400"
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

        <div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-gray-900 shadow-md flex items-center gap-1 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            <Plus size={18} />
            Add New College
          </button>
        </div>
      </Card>

      {/* Search Results Table */}
      <Card className="mt-5">
        <div className="overflow-auto">
          <p className="text-xl font-bold text-gray-400 mb-5">Search Results</p>

          {loading ? (
            <p>Loading...</p>
          ) : filteredColleges.length > 0 ? (
            <table className="min-w-[1200px] w-full table-auto border border-gray-300">
              <thead>
                <tr className="bg-gray-100 text-sm">
                  {[
                    'College ID',
                    'Name',
                    'District',
                    'State',
                    'Courses',
                    'Anual Fees',
                    'Placement Fees',
                    'Ranking',
                    'Phone',
                    'Address',
                    'Director Name',
                    'Director Email',
                    'Director Contact',
                    'Coordinator Name',
                    'Coordinator Email',
                    'Coordinator Contact',
                    'Term',
                    'Updated By',
                    'Timestamp',
                    'Actions',
                  ].map((header, idx) => (
                    <th
                      key={idx}
                      className="border px-3 py-2 whitespace-nowrap text-left"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredColleges.map((college) => (
                  <tr
                    key={college.Clg_ID}
                    className="text-sm text-center border-t hover:bg-gray-50"
                  >
                    <td className="whitespace-nowrap px-3 py-2">{college.Clg_ID}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-left">
                      {college.College_Name}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2">{college.District}</td>
                    <td className="whitespace-nowrap px-3 py-2">{college.State}</td>
                    <td className="whitespace-nowrap px-3 py-2">{college.Course}</td>
                    <td className="whitespace-nowrap px-3 py-2">{college.Anual_fees}</td>
                    <td className="whitespace-nowrap px-3 py-2">{college.Placement_fees}</td>
                    <td className="whitespace-nowrap px-3 py-2">{college.Ranking}</td>
                    <td className="whitespace-nowrap px-3 py-2">{college.Phone}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-left">{college.Address}</td>
                    <td className="whitespace-nowrap px-3 py-2">{college.Director_name}</td>
                    <td className="whitespace-nowrap px-3 py-2">{college.Director_email}</td>
                    <td className="whitespace-nowrap px-3 py-2">{college.Director_number}</td>
                    <td className="whitespace-nowrap px-3 py-2">{college.Placement_coor_name}</td>
                    <td className="whitespace-nowrap px-3 py-2">{college.Placement_coor_email}</td>
                    <td className="whitespace-nowrap px-3 py-2">{college.Placement_coor_contact}</td>
                    <td className="whitespace-nowrap px-3 py-2">{college.Term}</td>
                    <td className="whitespace-nowrap px-3 py-2">{college.Data_updated_by_name}</td>
                    <td className="whitespace-nowrap px-3 py-2">{college.Update_timestamp}</td>
                    <td className="flex flex-col gap-1 justify-center items-center py-2 whitespace-nowrap">
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

      {/* Edit Modal */}
      {editingCollege && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-college-title"
        >
          <div
            className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6"
            style={{ minWidth: '320px' }}
          >
            <SingleEditForm
              college={editingCollege}
              updatedData={updatedData}
              setUpdatedData={setUpdatedData}
              onClose={handleCloseEditForm}
              onSave={handleUpdate}
            />
          </div>
        </div>
      )}

      {/* Add Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50  p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-3 right-4 text-gray-500 hover:text-gray-700 text-3xl leading-none"
              aria-label="Close modal"
            >
              &times;
            </button>
            <InserForm
              onClose={() => setIsModalOpen(false)}
              onAddRow={(newCollege) => {
                setIsModalOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SingleDataEdit;
