import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/hrhunt`
  : 'https://hunt360-3.onrender.com/api/hrhunt';

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
`;

const ModalBox = styled.div`
  background-color: white;
  padding: 2rem;
  border-radius: 1rem;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
`;

const FieldGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  font-weight: bold;
`;

const SubText = styled.div`
  font-size: 0.75rem;
  color: gray;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.6rem;
  margin-top: 0.3rem;
  border: 1px solid #ccc;
  border-radius: 0.4rem;
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.6rem;
  margin-top: 0.3rem;
  border: 1px solid #ccc;
  border-radius: 0.4rem;
`;

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const Button = styled.button`
  padding: 0.6rem 1.5rem;
  background-color: ${props => props.cancel ? '#ccc' : '#6a1b9a'};
  color: ${props => props.cancel ? '#000' : '#fff'};
  border: none;
  border-radius: 0.4rem;
  font-weight: bold;
  cursor: pointer;
`;

const Message = styled.div`
  margin-top: 1rem;
  text-align: center;
  font-weight: bold;
  color: ${props => props.success ? 'green' : 'red'};
`;

const EditContactForm = ({ contactData = {}, onClose, onSave }) => {
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState('');

  useEffect(() => {
    setFormData(contactData);
  }, [contactData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        contact: formData.contact,
        date_of_contact: formData.date,
        number_of_times_contacted: formData.times,
        contacted_by: formData.contactedBy,
        contacted_person: formData.contactedPerson,
        feedback_notes: formData.notes
      };

      const res = await axios.post(`${baseURL}/response`, payload);
      setMessage(res.data.message || 'Saved to Reports');
      onSave(formData);
      setTimeout(() => {
        setMessage('');
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
      setMessage('Failed to save');
    }
  };

  return (
    <Overlay>
      <ModalBox>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Label>Name</Label>
            <Input name="name" value={formData.name || ''} onChange={handleChange} />
          </FieldGroup>

          <FieldGroup>
            <Label>Contact</Label>
            <Input name="contact" value={formData.contact || ''} onChange={handleChange} />
          </FieldGroup>

          <FieldGroup>
            <Label>Date of contact</Label>
            <Input name="date" type="date" value={formData.date || ''} onChange={handleChange} />
          </FieldGroup>

          <FieldGroup>
            <Label>Number of times contacted</Label>
            <Input name="times" type="number" value={formData.times || ''} onChange={handleChange} />
          </FieldGroup>

          <FieldGroup>
            <Label>Contacted By</Label>
            <SubText>(Person who initiated the contact)</SubText>
            <Input name="contactedBy" value={formData.contactedBy || ''} onChange={handleChange} />
          </FieldGroup>

          <FieldGroup>
            <Label>Contacted Person</Label>
            <SubText>(Person who was contacted)</SubText>
            <Input name="contactedPerson" value={formData.contactedPerson || ''} onChange={handleChange} />
          </FieldGroup>

          <FieldGroup>
            <Label>Feedback / Notes</Label>
            <Textarea name="notes" rows="3" value={formData.notes || ''} onChange={handleChange} />
          </FieldGroup>

          <Footer>
            <Button cancel type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit">Save</Button>
          </Footer>

          {message && <Message success={message === 'Saved to Reports'}>{message}</Message>}
        </form>
      </ModalBox>
    </Overlay>
  );
};

export default EditContactForm;