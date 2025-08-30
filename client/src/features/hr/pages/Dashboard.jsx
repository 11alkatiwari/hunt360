import axios from 'axios';
import { useState } from 'react';
import { FaLinkedin } from 'react-icons/fa';
import styled from 'styled-components';
import EditContactForm from './EditContactForm';

const baseURL = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/hrhunt`
  : 'https://hunt360-3.onrender.com/api/hrhunt';

const purple = '#a000c8';
const darkPurple = '#8a00c2';

const DashboardContainer = styled.div`
  min-height: 100vh;
  padding-top: 80px;
`;

const MainContent = styled.div`
  padding: 2rem;
`;

const SectionTitle = styled.h3`
  color: ${purple};
  font-size: 1.4rem;
  margin-bottom: 1.5rem;
`;

const ContentSection = styled.div`
  display: flex;
  gap: 2rem;
  flex-direction: row;
`;

const FilterSection = styled.div`
  width: 300px;
  background-color: #fff;
  padding: 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(160, 0, 200, 0.3);
`;

const Select = styled.select`
  width: 100%;
  padding: 0.5rem;
  margin: 0.5rem 0 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.25rem;
  font-size: 1rem;
`;

const SearchButton = styled.button`
  background-color: ${purple};
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  font-size: 1rem;
  border-radius: 0.4rem;
  cursor: pointer;
  margin-top: 0.5rem;

  &:hover {
    background-color: ${darkPurple};
  }
`;

const ReportsSection = styled.div`
  flex: 1;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(160, 0, 200, 0.2);
`;

const TableHeader = styled.thead`
  background-color: rgba(160, 0, 200, 0.1);
`;

const Th = styled.th`
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #ccc;
`;

const Td = styled.td`
  padding: 1rem;
  border-bottom: 1px solid #eee;
`;

const EditButton = styled.button`
  background-color: ${purple};
  color: #fff;
  border: none;
  padding: 0.4rem 0.8rem;
  font-size: 0.9rem;
  border-radius: 0.3rem;
  cursor: pointer;

  &:hover {
    background-color: ${darkPurple};
  }
`;

const Dashboard = () => {
  const [professionals, setProfessionals] = useState([]);
  const [selected, setSelected] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [filters, setFilters] = useState({
    industry: '',
    location: '',
    designation: '',
    experience: ''
  });

  const industryOptions = [
    'Advertising',
    'Banking & Finance',
    'Coaching/Consulting',
    'Consulting',
    'IT',
    'Pharmaceutical',
    'Other'
  ];

  const locationOptions = [
    'Bengaluru',
    'Mumbai',
    'Delhi NCR',
    'Pune',
    'Bangalore',
    'Gurgaon',
    'Chennai',
    'Noida',
    'Ahmedabad',
    'Varanasi',
    'Other'
  ];

  const designationOptions = [
    'Senior HRBP',
    'Senior HR Manager',
    'HRBP Manager',
    'HRBP Lead',
    'HR Manager',
    'HR Director',
    'HR Business Partner',
    'Other'
  ];

  const experienceOptions = [
    '10–15 years',
    '15–20 years',
    '20–25 years',
    '25–30 years',
    '30+ years'
  ];

  const openEditModal = (professional) => {
    setSelected(professional);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelected(null);
    setIsModalOpen(false);
  };

  const handleSave = async (updatedData) => {
    try {
      const updatedList = professionals.map((item) =>
        item.name === selected?.name ? updatedData : item
      );
      setProfessionals(updatedList);
      closeModal();
    } catch (error) {
      console.error('Error updating:', error);
      alert('Failed to save changes. Please try again.');
    }
  };

  const handleSearch = async () => {
    try {
      const res = await axios.post(`${baseURL}/professionals/filter`, filters);
      setProfessionals(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Error fetching professionals:', error);
      setProfessionals([]);
    }
  };

  return (
    <div>
      <DashboardContainer>
        <MainContent>
          <ContentSection>
            <FilterSection>
              <SectionTitle>Filters</SectionTitle>

              <label>Industry</label>
              <Select value={filters.industry} onChange={(e) => setFilters({ ...filters, industry: e.target.value })}>
                <option value="">Select industry</option>
                {industryOptions.map((item, i) => (
                  <option key={i} value={item}>{item}</option>
                ))}
              </Select>

              <label>Location</label>
              <Select value={filters.location} onChange={(e) => setFilters({ ...filters, location: e.target.value })}>
                <option value="">Select location</option>
                {locationOptions.map((item, i) => (
                  <option key={i} value={item}>{item}</option>
                ))}
              </Select>

              <label>Designation</label>
              <Select value={filters.designation} onChange={(e) => setFilters({ ...filters, designation: e.target.value })}>
                <option value="">Select designation</option>
                {designationOptions.map((item, i) => (
                  <option key={i} value={item}>{item}</option>
                ))}
              </Select>

              <label>Experience</label>
              <Select value={filters.experience} onChange={(e) => setFilters({ ...filters, experience: e.target.value })}>
                <option value="">Select experience</option>
                {experienceOptions.map((item, i) => (
                  <option key={i} value={item}>{item}</option>
                ))}
              </Select>

              <SearchButton onClick={handleSearch}>Search</SearchButton>
            </FilterSection>

            <ReportsSection>
              <SectionTitle>Results</SectionTitle>
              <Table>
                <TableHeader>
                  <tr>
                    <Th>Name</Th>
                    <Th>Title</Th>
                    <Th>Company</Th>
                    <Th>Location</Th>
                    <Th>LinkedIn</Th>
                    <Th>Action</Th>
                  </tr>
                </TableHeader>
                <tbody>
                  {professionals.map((pro, index) => (
                    <tr key={index}>
                      <Td>{pro.name}</Td>
                      <Td>{pro.title}</Td>
                      <Td>{pro.company}</Td>
                      <Td>{pro.location}</Td>
                      <Td>
                        {pro.linkedin ? (
                          <a href={pro.linkedin} target="_blank" rel="noopener noreferrer">
                            <FaLinkedin size={20} color="#0e76a8" />
                          </a>
                        ) : (
                          '-'
                        )}
                      </Td>
                      <Td>
                        <EditButton onClick={() => openEditModal(pro)}>Edit</EditButton>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </ReportsSection>
          </ContentSection>
        </MainContent>

        {isModalOpen && (
          <EditContactForm
            contactData={selected}
            onClose={closeModal}
            onSave={handleSave}
          />
        )}
      </DashboardContainer>
    </div>
  );
};

export default Dashboard;