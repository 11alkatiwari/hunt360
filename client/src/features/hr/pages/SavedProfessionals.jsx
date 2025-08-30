import React from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useEffect, useState } from 'react';

const baseURL = import.meta.env.VITE_API_BASE_URL
    ? `${import.meta.env.VITE_API_BASE_URL}/hrhunt`
    : 'https://hunt360-3.onrender.com/api/hrhunt';

const purple = '#a000c8';
const darkPurple = '#8a00c2';

const Container = styled.div`
  min-height: 100vh;
  padding: 80px 2rem 2rem 2rem;
  background-color: #fff;
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: ${purple};
  text-align: center;
  margin-bottom: 2rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
`;

const Th = styled.th`
  background-color: ${purple};
  color: white;
  padding: 10px;
  border: 1px solid ${darkPurple};
`;

const Td = styled.td`
  padding: 10px;
  border: 1px solid #ccc;
  text-align: left;
`;

const DownloadButton = styled.button`
  background-color: ${purple};
  color: white;
  border: none;
  padding: 10px 16px;
  font-size: 1rem;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 20px;

  &:hover {
    background-color: ${darkPurple};
  }
`;



const SavedProfessionals = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
        // Fetch data from the backend
        const fetchData = async () => {
            try {
                const response = await axios.get(`${baseURL}/response`);
                setData(response.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    const downloadCSV = () => {
        const headers = ['Name', 'Contact', 'Date of Contact', 'Times Contacted', 'Contacted By', 'Contacted Person', 'Notes'];
        const rows = data.map(item =>
            [
                item.name,
                item.contact,
                item.date_of_contact,
                item.number_of_times_contacted,
                item.contacted_by,
                item.contacted_person,
                item.feedback_notes
            ]
        );

        let csvContent = "data:text/csv;charset=utf-8,"
            + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "contact_report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div>
            <Container>
                <Title>Reports</Title>
                <Table>
                    <thead>
                        <tr>
                            <Th>Name</Th>
                            <Th>Contact</Th>
                            <Th>Date of Contact</Th>
                            <Th>Times Contacted</Th>
                            <Th>Contacted By</Th>
                            <Th>Contacted Person</Th>
                            <Th>Notes</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((person, index) => (
                            <tr key={index}>
                                <Td>{person.name}</Td>
                                <Td>{person.contact}</Td>
                                <Td>{person.date_of_contact}</Td>
                                <Td>{person.number_of_times_contacted}</Td>
                                <Td>{person.contacted_by}</Td>
                                <Td>{person.contacted_person}</Td>
                                <Td>{person.feedback_notes}</Td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
                <DownloadButton onClick={downloadCSV}>Download CSV</DownloadButton>
            </Container>
        </div>
    );
};

export default SavedProfessionals;