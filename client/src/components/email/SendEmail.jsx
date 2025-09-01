/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import Papa from 'papaparse';

const baseURL = import.meta.env.VITE_API_BASE_URL
    ? `${import.meta.env.VITE_API_BASE_URL}/email-service`
    : 'https://hunt360-3.onrender.com/api/email-service';

const SendEmail = () => {
    const [formData, setFormData] = useState({
        describe: '',
        subject: '',
        body: '',
        numEmails: 1,
        sendIn: 0,
    });
    const [emailFile, setEmailFile] = useState(null);
    const [emailList, setEmailList] = useState([]);
    const [attachments, setAttachments] = useState([]);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const validateForm = () => {
        const newErrors = {};
        if (emailList.length === 0) newErrors.emailFile = 'Please upload a valid CSV file with email addresses';
        if (!formData.subject) newErrors.subject = 'Subject is required';
        if (!formData.body) newErrors.body = 'Body is required';
        if (formData.numEmails < 1) newErrors.numEmails = 'Number of emails must be at least 1';
        if (formData.sendIn < 0) newErrors.sendIn = 'Send time cannot be negative';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleCSVUpload = (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'text/csv') {
            setEmailFile(file);
            Papa.parse(file, {
                complete: (result) => {
                    const emails = result.data
                        .map(row => {
                            const email = row.email || row[0];
                            return email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
                        })
                        .filter(email => email);
                    setEmailList(emails);
                    setErrors((prev) => ({ ...prev, emailFile: emails.length === 0 ? 'No valid email addresses found in CSV' : '' }));
                },
                header: true,
                skipEmptyLines: true,
            });
        } else {
            setEmailFile(null);
            setEmailList([]);
            setErrors((prev) => ({ ...prev, emailFile: 'Please upload a valid CSV file' }));
        }
    };

    const addAttachment = () => {
        setAttachments([...attachments, null]);
    };

    const removeAttachment = (index) => {
        setAttachments(attachments.filter((_, i) => i !== index));
    };

    const updateAttachment = (file, index) => {
        const newAttachments = [...attachments];
        newAttachments[index] = file;
        setAttachments(newAttachments);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'numEmails' || name === 'sendIn' ? Number(value) : value,
        }));
        setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const showToast = (message, background) => {
        Toastify({
            text: message,
            duration: 3000,
            style: { background },
        }).showToast();
    };

    const sendEmail = async () => {
        if (!validateForm()) {
            showToast('Please fix the form errors before submitting', 'red');
            return;
        }

        setIsLoading(true);
        const data = new FormData();
        data.append('recipients', JSON.stringify(emailList)); // Send array of emails
        data.append('describe', String(formData.describe));
        data.append('subject', String(formData.subject));
        data.append('body', String(formData.body));
        data.append('numEmails', String(formData.numEmails));
        data.append('sendIn', String(formData.sendIn));
        data.append('userId', '1');

        attachments.forEach((file, index) => {
            if (file) data.append('attachments', file);
        });

        try {
            const response = await fetch(`${baseURL}/send-email`, {
                method: 'POST',
                body: data,
            });

            const result = await response.json();
            if (response.ok) {
                showToast(result.message || 'Email(s) scheduled successfully!', 'green');
                setFormData({
                    describe: '',
                    subject: '',
                    body: '',
                    numEmails: 1,
                    sendIn: 0,
                });
                setEmailFile(null);
                setEmailList([]);
                setAttachments([null]);
            } else {
                showToast(result.message || 'Failed to send email', 'red');
            }
        } catch (error) {
            showToast(`Error sending email: ${error.message}`, 'red');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl w-full bg-white shadow-lg rounded-lg p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Send Email</h2>
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Upload Email List (CSV)</label>
                        <input
                            type="file"
                            accept=".csv"
                            className={`mt-1 w-full border rounded-md px-3 py-2 focus:ring-purple-500 focus:border-purple-500 ${errors.emailFile ? 'border-red-500' : 'border-gray-300'}`}
                            onChange={handleCSVUpload}
                        />
                        {emailList.length > 0 && (
                            <p className="text-sm text-gray-600 mt-1">{emailList.length} email(s) loaded</p>
                        )}
                        {errors.emailFile && <p className="text-red-500 text-sm mt-1">{errors.emailFile}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Describe the Email</label>
                        <input
                            type="text"
                            name="describe"
                            className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
                            placeholder="Describe the email content"
                            value={formData.describe}
                            onChange={handleInputChange}
                        />
                    </div>

                    <button
                        className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition duration-200"
                        onClick={() => window.Toastify({ text: 'Generate email feature not implemented', duration: 3000, style: { background: 'orange' } }).showToast()}
                    >
                        Generate Email Content
                    </button>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Subject</label>
                        <input
                            type="text"
                            name="subject"
                            className={`mt-1 w-full border rounded-md px-3 py-2 focus:ring-purple-500 focus:border-purple-500 ${errors.subject ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="Email Subject"
                            value={formData.subject}
                            onChange={handleInputChange}
                        />
                        {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Body</label>
                        <textarea
                            name="body"
                            rows="6"
                            className={`mt-1 w-full border rounded-md px-3 py-2 focus:ring-purple-500 focus:border-purple-500 ${errors.body ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="Write the body of the email"
                            value={formData.body}
                            onChange={handleInputChange}
                        ></textarea>
                        {errors.body && <p className="text-red-500 text-sm mt-1">{errors.body}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Attachments</label>
                        <div className="mt-1 border border-gray-300 rounded-md p-4 space-y-3">
                            {attachments.map((file, index) => (
                                <div key={index} className="flex items-center space-x-3">
                                    <input
                                        type="file"
                                        className="w-full border border-gray-300 rounded-md p-1 text-sm"
                                        onChange={(e) => updateAttachment(e.target.files[0] || null, index)}
                                    />
                                    {index > 0 && (
                                        <button
                                            onClick={() => removeAttachment(index)}
                                            className="text-red-500 hover:text-red-700 font-bold"
                                            type="button"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addAttachment}
                                className="mt-2 bg-purple-600 text-white px-4 py-1 rounded-md hover:bg-purple-700 transition duration-200"
                            >
                                Add More Files
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Number of Emails</label>
                        <input
                            type="number"
                            name="numEmails"
                            min="1"
                            className={`mt-1 w-full border rounded-md px-3 py-2 focus:ring-purple-500 focus:border-purple-500 ${errors.numEmails ? 'border-red-500' : 'border-gray-300'}`}
                            value={formData.numEmails}
                            onChange={handleInputChange}
                        />
                        {errors.numEmails && <p className="text-red-500 text-sm mt-1">{errors.numEmails}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Send in (minutes)</label>
                        <input
                            type="number"
                            name="sendIn"
                            min="0"
                            className={`mt-1 w-full border rounded-md px-3 py-2 focus:ring-purple-500 focus:border-purple-500 ${errors.sendIn ? 'border-red-500' : 'border-gray-300'}`}
                            value={formData.sendIn}
                            onChange={handleInputChange}
                        />
                        {errors.sendIn && <p className="text-red-500 text-sm mt-1">{errors.sendIn}</p>}
                    </div>

                    <button
                        onClick={sendEmail}
                        disabled={isLoading}
                        className={`w-full bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700 transition duration-200 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        type="button"
                    >
                        {isLoading ? 'Sending...' : 'Send Emails'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SendEmail;