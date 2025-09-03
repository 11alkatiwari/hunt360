import React, { useState, useCallback } from 'react';
import * as apiService from '../../../api/campus.js';

const useInsertForm = ({ onClose, onAddRow }) => {
    const [formData, setFormData] = useState({
        College_Name: '',
        District: '',
        State: '',
        Anual_fees: '',
        Placement_fees: '',
        Ranking: '',
        Course: '',
        Phone: '',
        Address: '',
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Validate form fields
    const validateForm = useCallback(() => {
        const newErrors = {};
        if (!formData.College_Name.trim())
            newErrors.College_Name = 'College name is required';
        if (!formData.District.trim()) newErrors.District = 'City is required';
        if (!formData.State.trim()) newErrors.State = 'State is required';
        if (formData.Anual_fees && isNaN(formData.Anual_fees))
            newErrors.Anual_fees = 'Annual fees must be a number';
        if (formData.Placement_fees && isNaN(formData.Placement_fees))
            newErrors.Placement_fees = 'Placement fees must be a number';
        if (formData.Ranking && isNaN(formData.Ranking))
            newErrors.Ranking = 'Ranking must be a number';
        if (formData.Phone && !/^\+?\d{10,15}$/.test(formData.Phone))
            newErrors.Phone = 'Invalid phone number';
        return newErrors;
    }, [formData]);

    // Handle input changes
    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear error for the field being edited
        setErrors((prev) => ({ ...prev, [name]: '' }));
    }, []);

    // Handle form submission
    const handleInsert = useCallback(async () => {
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await apiService.addCollege(formData);
            alert('✅ Data inserted successfully');
            if (onAddRow) onAddRow(response);
            setFormData({
                College_Name: '',
                District: '',
                State: '',
                Anual_fees: '',
                Placement_fees: '',
                Ranking: '',
                Course: '',
                Phone: '',
                Address: '',
            });
            onClose();
        } catch (err) {
            console.error('❌ Error inserting data:', err);
            alert('❌ Failed to insert data');
        } finally {
            setIsSubmitting(false);
        }
    }, [formData, validateForm, onAddRow, onClose]);

    return { formData, errors, isSubmitting, handleChange, handleInsert };
};

const InsertForm = ({ onClose, onAddRow }) => {
    const { formData, errors, isSubmitting, handleChange, handleInsert } =
        useInsertForm({
            onClose,
            onAddRow,
        });

    const inputClass =
        'w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100';
    const labelClass = 'block font-medium text-gray-700 mb-1';
    const errorClass = 'text-red-600 text-sm mt-1';

    return (
        <div className="max-w-4xl mx-auto p-8 bg-white rounded-2xl shadow-lg space-y-10">
            <h2 className="text-3xl font-bold text-center text-gray-800">
                Add College Details
            </h2>

            <section aria-labelledby="basic-info">
                <h3
                    id="basic-info"
                    className="text-2xl font-semibold text-gray-700 mb-6"
                >
                    Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="College_Name" className={labelClass}>
                            Name of College
                        </label>
                        <input
                            id="College_Name"
                            type="text"
                            name="College_Name"
                            placeholder="Enter college name"
                            className={inputClass}
                            value={formData.College_Name}
                            onChange={handleChange}
                            disabled={isSubmitting}
                            aria-invalid={!!errors.College_Name}
                            aria-describedby={
                                errors.College_Name
                                    ? 'College_Name-error'
                                    : undefined
                            }
                        />
                        {errors.College_Name && (
                            <p id="College_Name-error" className={errorClass}>
                                {errors.College_Name}
                            </p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="District" className={labelClass}>
                            City
                        </label>
                        <input
                            id="District"
                            type="text"
                            name="District"
                            placeholder="Enter city"
                            className={inputClass}
                            value={formData.District}
                            onChange={handleChange}
                            disabled={isSubmitting}
                            aria-invalid={!!errors.District}
                            aria-describedby={
                                errors.District ? 'District-error' : undefined
                            }
                        />
                        {errors.District && (
                            <p id="District-error" className={errorClass}>
                                {errors.District}
                            </p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="State" className={labelClass}>
                            State / Country
                        </label>
                        <input
                            id="State"
                            type="text"
                            name="State"
                            placeholder="Enter state and country"
                            className={inputClass}
                            value={formData.State}
                            onChange={handleChange}
                            disabled={isSubmitting}
                            aria-invalid={!!errors.State}
                            aria-describedby={
                                errors.State ? 'State-error' : undefined
                            }
                        />
                        {errors.State && (
                            <p id="State-error" className={errorClass}>
                                {errors.State}
                            </p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="Anual_fees" className={labelClass}>
                            Annual Fees
                        </label>
                        <input
                            id="Anual_fees"
                            type="text"
                            name="Anual_fees"
                            placeholder="Enter annual fees"
                            className={inputClass}
                            value={formData.Anual_fees}
                            onChange={handleChange}
                            disabled={isSubmitting}
                            aria-invalid={!!errors.Anual_fees}
                            aria-describedby={
                                errors.Anual_fees
                                    ? 'Anual_fees-error'
                                    : undefined
                            }
                        />
                        {errors.Anual_fees && (
                            <p id="Anual_fees-error" className={errorClass}>
                                {errors.Anual_fees}
                            </p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="Placement_fees" className={labelClass}>
                            Placement Fees
                        </label>
                        <input
                            id="Placement_fees"
                            type="text"
                            name="Placement_fees"
                            placeholder="Enter placement fees"
                            className={inputClass}
                            value={formData.Placement_fees}
                            onChange={handleChange}
                            disabled={isSubmitting}
                            aria-invalid={!!errors.Placement_fees}
                            aria-describedby={
                                errors.Placement_fees
                                    ? 'Placement_fees-error'
                                    : undefined
                            }
                        />
                        {errors.Placement_fees && (
                            <p id="Placement_fees-error" className={errorClass}>
                                {errors.Placement_fees}
                            </p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="Ranking" className={labelClass}>
                            Ranking
                        </label>
                        <input
                            id="Ranking"
                            type="text"
                            name="Ranking"
                            placeholder="National ranking (if available)"
                            className={inputClass}
                            value={formData.Ranking}
                            onChange={handleChange}
                            disabled={isSubmitting}
                            aria-invalid={!!errors.Ranking}
                            aria-describedby={
                                errors.Ranking ? 'Ranking-error' : undefined
                            }
                        />
                        {errors.Ranking && (
                            <p id="Ranking-error" className={errorClass}>
                                {errors.Ranking}
                            </p>
                        )}
                    </div>

                    <div className="md:col-span-2">
                        <label htmlFor="Course" className={labelClass}>
                            Courses
                        </label>
                        <textarea
                            id="Course"
                            name="Course"
                            placeholder="List major courses separated by commas"
                            className={inputClass}
                            rows={3}
                            value={formData.Course}
                            onChange={handleChange}
                            disabled={isSubmitting}
                        />
                    </div>
                </div>
            </section>

            <section aria-labelledby="contact-info">
                <h3
                    id="contact-info"
                    className="text-2xl font-semibold text-gray-700 mb-6"
                >
                    Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="Phone" className={labelClass}>
                            Phone Number
                        </label>
                        <input
                            id="Phone"
                            type="text"
                            name="Phone"
                            placeholder="Contact Number"
                            className={inputClass}
                            value={formData.Phone}
                            onChange={handleChange}
                            disabled={isSubmitting}
                            aria-invalid={!!errors.Phone}
                            aria-describedby={
                                errors.Phone ? 'Phone-error' : undefined
                            }
                        />
                        {errors.Phone && (
                            <p id="Phone-error" className={errorClass}>
                                {errors.Phone}
                            </p>
                        )}
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="Address" className={labelClass}>
                            Address
                        </label>
                        <textarea
                            id="Address"
                            name="Address"
                            placeholder="Enter full address"
                            className={inputClass}
                            rows={3}
                            value={formData.Address}
                            onChange={handleChange}
                            disabled={isSubmitting}
                        />
                    </div>
                </div>
            </section>

            <div className="flex justify-end space-x-4 pt-6">
                <button
                    className="bg-blue-600 text-white font-medium px-6 py-2 rounded-xl hover:bg-blue-700 transition duration-200 disabled:bg-blue-400"
                    onClick={handleInsert}
                    disabled={isSubmitting}
                >
                    Insert
                </button>
                <button
                    className="bg-gray-400 text-white font-medium px-6 py-2 rounded-xl hover:bg-gray-500 transition duration-200 disabled:bg-gray-300"
                    onClick={onClose}
                    disabled={isSubmitting}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default InsertForm;
