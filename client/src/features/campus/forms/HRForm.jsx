/* eslint-disable no-unused-vars */
import React, { useCallback, useState, memo } from 'react';
import PropTypes from 'prop-types';

const inputClass =
    'w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100';
const labelClass = 'block font-medium text-gray-700 mb-1';
const errorClass = 'text-red-600 text-sm mt-1';

// Custom hook for form state and validation
const useHrForm = ({ updatedData, setUpdatedData, onSave }) => {
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = useCallback(
        (e) => {
            const { name, value } = e.target;
            setUpdatedData((prev) => ({ ...prev, [name]: value }));
            // Clear error for the field on change
            setErrors((prev) => ({ ...prev, [name]: '' }));
        },
        [setUpdatedData]
    );

    const validateForm = useCallback(() => {
        const newErrors = {};
        if (!updatedData.College_Name.trim()) {
            newErrors.College_Name = 'College Name is required';
        }
        if (!updatedData.District.trim()) {
            newErrors.District = 'City is required';
        }
        if (!updatedData.State.trim()) {
            newErrors.State = 'State is required';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [updatedData]);

    const handleSubmit = useCallback(
        async (e) => {
            e.preventDefault();
            if (!validateForm()) return;

            setIsSubmitting(true);
            try {
                await onSave();
                setErrors({});
            } catch (err) {
                setErrors({
                    form: 'Failed to save changes. Please try again.',
                });
            } finally {
                setIsSubmitting(false);
            }
        },
        [onSave, validateForm]
    );

    return { errors, isSubmitting, handleChange, handleSubmit };
};

/**
 * HrForm component for editing HR-related college data.
 * @param {Object} props - Component props
 * @param {Object} props.college - The college object being edited
 * @param {Object} props.updatedData - Current form data
 * @param {Function} props.setUpdatedData - Function to update form data
 * @param {Function} props.onClose - Function to close the form
 * @param {Function} props.onSave - Function to save changes
 * @returns {JSX.Element} HrForm component
 */
const HrForm = ({ college, updatedData, setUpdatedData, onClose, onSave }) => {
    const { errors, isSubmitting, handleChange, handleSubmit } = useHrForm({
        updatedData,
        setUpdatedData,
        onSave,
    });

    return (
        <form
            onSubmit={handleSubmit}
            className="max-w-4xl mx-auto p-8 bg-white rounded-2xl shadow-lg space-y-10"
            aria-labelledby="formTitle"
        >
            <h2
                id="formTitle"
                className="text-3xl font-bold text-center text-gray-800"
            >
                Edit Hiring Team Details
            </h2>
            {errors.form && <p className={errorClass}>{errors.form}</p>}

            {/* Section: Basic Information */}
            <section>
                <h3 className="text-2xl font-semibold text-gray-700 mb-6">
                    Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="College_Name" className={labelClass}>
                            Name of College
                        </label>
                        <input
                            id="College_Name"
                            name="College_Name"
                            type="text"
                            placeholder="Enter college name"
                            className={inputClass}
                            value={updatedData.College_Name || ''}
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
                            name="District"
                            type="text"
                            placeholder="Enter city"
                            className={inputClass}
                            value={updatedData.District || ''}
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
                            name="State"
                            type="text"
                            placeholder="Enter state and country"
                            className={inputClass}
                            value={updatedData.State || ''}
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
                        <label htmlFor="Annual_fees" className={labelClass}>
                            Annual Fees
                        </label>
                        <input
                            id="Annual_fees"
                            name="Annual_fees"
                            type="text"
                            placeholder="Enter annual fees"
                            className={inputClass}
                            value={updatedData.Annual_fees || ''} // Fixed typo: Anual_fees → Annual_fees
                            onChange={handleChange}
                            disabled={isSubmitting}
                        />
                    </div>

                    <div>
                        <label htmlFor="Placement_fees" className={labelClass}>
                            Placement Fees
                        </label>
                        <input
                            id="Placement_fees"
                            name="Placement_fees"
                            type="text"
                            placeholder="Enter placement fees"
                            className={inputClass}
                            value={updatedData.Placement_fees || ''}
                            onChange={handleChange}
                            disabled={isSubmitting}
                        />
                    </div>

                    <div>
                        <label htmlFor="Ranking" className={labelClass}>
                            Ranking
                        </label>
                        <input
                            id="Ranking"
                            name="Ranking"
                            type="text"
                            placeholder="National ranking (if available)"
                            className={inputClass}
                            value={updatedData.Ranking || ''}
                            onChange={handleChange}
                            disabled={isSubmitting}
                        />
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
                            value={updatedData.Course || ''}
                            onChange={handleChange}
                            disabled={isSubmitting}
                        />
                    </div>
                </div>
            </section>

            {/* Section: Contact Information */}
            <section>
                <h3 className="text-2xl font-semibold text-gray-700 mb-6">
                    Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="Phone" className={labelClass}>
                            Phone Number
                        </label>
                        <input
                            id="Phone"
                            name="Phone"
                            type="tel"
                            placeholder="Contact Number"
                            className={inputClass}
                            value={updatedData.Phone || ''}
                            onChange={handleChange}
                            disabled={isSubmitting}
                        />
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
                            value={updatedData.Address || ''}
                            onChange={handleChange}
                            disabled={isSubmitting}
                        />
                    </div>
                </div>
            </section>

            {/* Section: Director Details */}
            <section>
                <h3 className="text-2xl font-semibold text-gray-700 mb-6">
                    Director Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label htmlFor="Director_name" className={labelClass}>
                            Name
                        </label>
                        <input
                            id="Director_name"
                            name="Director_name"
                            type="text"
                            placeholder="Director's full name"
                            className={inputClass}
                            value={updatedData.Director_name || ''}
                            onChange={handleChange}
                            disabled={isSubmitting}
                        />
                    </div>
                    <div>
                        <label htmlFor="Director_number" className={labelClass}>
                            Phone Number
                        </label>
                        <input
                            id="Director_number"
                            name="Director_number"
                            type="tel"
                            placeholder="Contact number"
                            className={inputClass}
                            value={updatedData.Director_number || ''}
                            onChange={handleChange}
                            disabled={isSubmitting}
                        />
                    </div>
                    <div>
                        <label htmlFor="Director_email" className={labelClass}>
                            Email Address
                        </label>
                        <input
                            id="Director_email"
                            name="Director_email"
                            type="email"
                            placeholder="Email"
                            className={inputClass}
                            value={updatedData.Director_email || ''}
                            onChange={handleChange}
                            disabled={isSubmitting}
                        />
                    </div>
                </div>
            </section>

            {/* Section: Placement Coordinator */}
            <section>
                <h3 className="text-2xl font-semibold text-gray-700 mb-6">
                    Placement Coordinator
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label
                            htmlFor="Placement_coor_name"
                            className={labelClass}
                        >
                            Name
                        </label>
                        <input
                            id="Placement_coor_name"
                            name="Placement_coor_name"
                            type="text"
                            placeholder="Coordinator name"
                            className={inputClass}
                            value={updatedData.Placement_coor_name || ''}
                            onChange={handleChange}
                            disabled={isSubmitting}
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="Placement_coor_contact"
                            className={labelClass}
                        >
                            Phone Number
                        </label>
                        <input
                            id="Placement_coor_contact"
                            name="Placement_coor_contact"
                            type="tel"
                            placeholder="Contact number"
                            className={inputClass}
                            value={updatedData.Placement_coor_contact || ''}
                            onChange={handleChange}
                            disabled={isSubmitting}
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="Placement_coor_email"
                            className={labelClass}
                        >
                            Email Address
                        </label>
                        <input
                            id="Placement_coor_email"
                            name="Placement_coor_email"
                            type="email"
                            placeholder="Email"
                            className={inputClass}
                            value={updatedData.Placement_coor_email || ''}
                            onChange={handleChange}
                            disabled={isSubmitting}
                        />
                    </div>
                </div>
            </section>

            {/* Section: Hiring Team Information */}
            <section>
                <h3 className="text-2xl font-semibold text-gray-700 mb-6">
                    Hiring Team Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="Hr_team_name" className={labelClass}>
                            Name of Hiring Team
                        </label>
                        <input
                            id="Hr_team_name"
                            name="Hr_team_name"
                            type="text"
                            placeholder="Enter name"
                            className={inputClass}
                            value={updatedData.Hr_team_name || ''}
                            onChange={handleChange}
                            disabled={isSubmitting}
                        />
                    </div>
                    <div>
                        <label htmlFor="Date_of_Contact" className={labelClass}>
                            Date of Contact
                        </label>
                        <input
                            id="Date_of_Contact"
                            name="Date_of_Contact"
                            type="date"
                            className={inputClass}
                            value={updatedData.Date_of_Contact || ''}
                            onChange={handleChange}
                            disabled={isSubmitting}
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="Date_of_Next_Contact"
                            className={labelClass}
                        >
                            Date of Next Contact
                        </label>
                        <input
                            id="Date_of_Next_Contact"
                            name="Date_of_Next_Contact"
                            type="date"
                            className={inputClass}
                            value={updatedData.Date_of_Next_Contact || ''}
                            onChange={handleChange}
                            disabled={isSubmitting}
                        />
                    </div>
                    <div>
                        <label htmlFor="Total_payment" className={labelClass}>
                            Total Payment
                        </label>
                        <input
                            id="Total_payment"
                            name="Total_payment"
                            type="text"
                            placeholder="Enter amount"
                            className={inputClass}
                            value={updatedData.Total_payment || ''}
                            onChange={handleChange}
                            disabled={isSubmitting}
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="Payment_received"
                            className={labelClass}
                        >
                            Payment Received
                        </label>
                        <select
                            id="Payment_received"
                            name="Payment_received"
                            className={inputClass}
                            value={updatedData.Payment_received || ''}
                            onChange={handleChange}
                            disabled={isSubmitting}
                        >
                            <option value="">Select</option>
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="Payment_period" className={labelClass}>
                            Payment Period
                        </label>
                        <input
                            id="Payment_period"
                            name="Payment_period"
                            type="text"
                            placeholder="Enter period"
                            className={inputClass}
                            value={updatedData.Payment_period || ''}
                            onChange={handleChange}
                            disabled={isSubmitting}
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="Replacement_period"
                            className={labelClass}
                        >
                            Replacement Period
                        </label>
                        <input
                            id="Replacement_period"
                            name="Replacement_period"
                            type="text"
                            placeholder="Enter period"
                            className={inputClass}
                            value={updatedData.Replacement_period || ''}
                            onChange={handleChange}
                            disabled={isSubmitting}
                        />
                    </div>
                    <div>
                        <label htmlFor="Send_proposal" className={labelClass}>
                            Send Proposal
                        </label>
                        <select
                            id="Send_proposal"
                            name="Send_proposal"
                            className={inputClass}
                            value={updatedData.Send_proposal || ''}
                            onChange={handleChange}
                            disabled={isSubmitting}
                        >
                            <option value="">Select</option>
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                        </select>
                    </div>
                </div>
            </section>

            {/* Section: Placement Details */}
            <section>
                <h3 className="text-2xl font-semibold text-gray-700 mb-6">
                    Placement Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label
                            htmlFor="Spoke_for_placement"
                            className={labelClass}
                        >
                            Spoke for Placement
                        </label>
                        <select
                            id="Spoke_for_placement"
                            name="Spoke_for_placement"
                            className={inputClass}
                            value={updatedData.Spoke_for_placement || ''}
                            onChange={handleChange}
                            disabled={isSubmitting}
                        >
                            <option value="">Select</option>
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="Resume_received" className={labelClass}>
                            Resume Received
                        </label>
                        <select
                            id="Resume_received"
                            name="Resume_received"
                            className={inputClass}
                            value={updatedData.Resume_received || ''}
                            onChange={handleChange}
                            disabled={isSubmitting}
                        >
                            <option value="">Select</option>
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                        </select>
                    </div>
                    <div>
                        <label
                            htmlFor="Interview_status"
                            className={labelClass}
                        >
                            Interview Status
                        </label>
                        <input
                            id="Interview_status"
                            name="Interview_status"
                            type="text"
                            placeholder="Enter status"
                            className={inputClass}
                            value={updatedData.Interview_status || ''}
                            onChange={handleChange}
                            disabled={isSubmitting}
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="Total_num_students"
                            className={labelClass}
                        >
                            Total Number of Students
                        </label>
                        <input
                            id="Total_num_students"
                            name="Total_num_students"
                            type="number"
                            placeholder="Enter number"
                            className={inputClass}
                            value={updatedData.Total_num_students || ''}
                            onChange={handleChange}
                            disabled={isSubmitting}
                        />
                    </div>
                    <div>
                        <label htmlFor="Hired_students" className={labelClass}>
                            Hired Students
                        </label>
                        <input
                            id="Hired_students"
                            name="Hired_students"
                            type="number"
                            placeholder="Enter number"
                            className={inputClass}
                            value={updatedData.Hired_students || ''}
                            onChange={handleChange}
                            disabled={isSubmitting}
                        />
                    </div>
                    <div>
                        <label htmlFor="Term" className={labelClass}>
                            Term
                        </label>
                        <input
                            id="Term"
                            name="Term"
                            type="text"
                            placeholder="Enter term"
                            className={inputClass}
                            value={updatedData.Term || ''}
                            onChange={handleChange}
                            disabled={isSubmitting}
                        />
                    </div>
                    <div>
                        <label htmlFor="Placed_on_Month" className={labelClass}>
                            Placed on Month
                        </label>
                        <input
                            id="Placed_on_Month"
                            name="Placed_on_Month"
                            type="text"
                            placeholder="Enter month"
                            className={inputClass}
                            value={updatedData.Placed_on_Month || ''}
                            onChange={handleChange}
                            disabled={isSubmitting}
                        />
                    </div>
                    <div>
                        <label htmlFor="Placed_on_Year" className={labelClass}>
                            Placed on Year
                        </label>
                        <input
                            id="Placed_on_Year"
                            name="Placed_on_Year"
                            type="text"
                            placeholder="Enter year"
                            className={inputClass}
                            value={updatedData.Placed_on_Year || ''}
                            onChange={handleChange}
                            disabled={isSubmitting}
                        />
                    </div>
                </div>
            </section>

            {/* Section: Database Information */}
            <section>
                <h3 className="text-2xl font-semibold text-gray-700 mb-6">
                    Database Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label
                            htmlFor="Data_updated_by_name"
                            className={labelClass}
                        >
                            Name of Updater
                        </label>
                        <input
                            id="Data_updated_by_name"
                            name="Data_updated_by_name"
                            type="text"
                            placeholder="Updater name"
                            className={inputClass}
                            value={updatedData.Data_updated_by_name || ''}
                            onChange={handleChange}
                            disabled={isSubmitting}
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="Update_timestamp"
                            className={labelClass}
                        >
                            Date of Last Update
                        </label>
                        <input
                            id="Update_timestamp"
                            name="Update_timestamp"
                            type="datetime-local"
                            className={inputClass}
                            value={updatedData.Update_timestamp || ''}
                            onChange={handleChange}
                            disabled={isSubmitting}
                        />
                    </div>
                    <div>
                        <label htmlFor="Clg_ID" className={labelClass}>
                            College ID
                        </label>
                        <input
                            id="Clg_ID"
                            name="Clg_ID"
                            type="text"
                            placeholder="College ID"
                            className={inputClass}
                            value={updatedData.Clg_ID || ''}
                            onChange={handleChange}
                            disabled
                        />
                    </div>
                </div>
            </section>

            {/* Buttons */}
            <div className="flex justify-end space-x-4 pt-6">
                <button
                    type="submit"
                    className="bg-blue-600 text-white font-medium px-6 py-2 rounded-xl hover:bg-blue-700 transition duration-200 disabled:opacity-50"
                    disabled={isSubmitting}
                    aria-label="Save changes"
                >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                    type="button"
                    className="bg-gray-400 text-white font-medium px-6 py-2 rounded-xl hover:bg-gray-500 transition duration-200 disabled:opacity-50"
                    onClick={onClose}
                    disabled={isSubmitting}
                    aria-label="Cancel"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
};

HrForm.propTypes = {
    college: PropTypes.object,
    updatedData: PropTypes.shape({
        College_Name: PropTypes.string,
        District: PropTypes.string,
        State: PropTypes.string,
        Annual_fees: PropTypes.string,
        Placement_fees: PropTypes.string,
        Ranking: PropTypes.string,
        Course: PropTypes.string,
        Phone: PropTypes.string,
        Address: PropTypes.string,
        Director_name: PropTypes.string,
        Director_number: PropTypes.string,
        Director_email: PropTypes.string,
        Placement_coor_name: PropTypes.string,
        Placement_coor_contact: PropTypes.string,
        Placement_coor_email: PropTypes.string,
        Hr_team_name: PropTypes.string,
        Date_of_Contact: PropTypes.string,
        Date_of_Next_Contact: PropTypes.string,
        Total_payment: PropTypes.string,
        Payment_received: PropTypes.string,
        Payment_period: PropTypes.string,
        Replacement_period: PropTypes.string,
        Send_proposal: PropTypes.string,
        Spoke_for_placement: PropTypes.string,
        Resume_received: PropTypes.string,
        Interview_status: PropTypes.string,
        Total_num_students: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number,
        ]),
        Hired_students: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number,
        ]),
        Term: PropTypes.string,
        Data_updated_by_name: PropTypes.string,
        Placed_on_Month: PropTypes.string,
        Placed_on_Year: PropTypes.string,
        Update_timestamp: PropTypes.string,
        Clg_ID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }).isRequired,
    setUpdatedData: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
};

// Memoize to prevent unnecessary re-renders
export default memo(HrForm);
