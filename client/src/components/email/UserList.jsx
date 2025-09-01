import React, { useState, useEffect } from 'react';
import 'toastify-js/src/toastify.css';

const baseURL = "https://hunt360-3.onrender.com/api/email-service";

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [editUserId, setEditUserId] = useState(null);
    const [editedUser, setEditedUser] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 10;

    const fetchUsers = async (pageNum) => {
        setIsLoading(true);
        try {
            const response = await fetch(`${baseURL}/users?page=${pageNum}&pageSize=${pageSize}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
            const result = await response.json();
            if (response.ok) {
                setUsers(result.data);
                setTotalPages(result.totalPages);
            } else {
                throw new Error(result.message || 'Failed to fetch users');
            }
        } catch (err) {
            setError(err.message);
            window.Toastify({
                text: `Error: ${err.message}`,
                duration: 3000,
                style: { background: 'red' },
            }).showToast();
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers(page);
    }, [page]);

    const validateUser = () => {
        const errors = {};
        if (!editedUser.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editedUser.email)) {
            errors.email = 'Valid email is required';
        }
        if (!editedUser.name) errors.name = 'Name is required';
        if (editedUser.phone && !/^\+?\d{10,15}$/.test(editedUser.phone)) {
            errors.phone = 'Valid phone number is required (10-15 digits)';
        }
        if (!editedUser.role) errors.role = 'Role is required';
        return errors;
    };

    const handleEdit = (user) => {
        setEditUserId(user.userId);
        setEditedUser({ ...user });
    };

    const handleCancel = () => {
        setEditUserId(null);
        setEditedUser({});
    };

    const handleSave = async () => {
        const errors = validateUser();
        if (Object.keys(errors).length > 0) {
            Object.values(errors).forEach((error) => {
                window.Toastify({
                    text: error,
                    duration: 3000,
                    style: { background: 'red' },
                }).showToast();
            });
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`${baseURL}/users/${editedUser.userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editedUser),
            });
            const result = await response.json();
            if (response.ok) {
                setUsers(users.map((u) => (u.userId === editedUser.userId ? editedUser : u)));
                window.Toastify({
                    text: 'User updated successfully',
                    duration: 3000,
                    style: { background: 'green' },
                }).showToast();
                handleCancel();
            } else {
                throw new Error(result.message || 'Failed to update user');
            }
        } catch (err) {
            window.Toastify({
                text: `Error: ${err.message}`,
                duration: 3000,
                style: { background: 'red' },
            }).showToast();
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;

        setIsLoading(true);
        try {
            const response = await fetch(`${baseURL}/users/${userId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            });
            const result = await response.json();
            if (response.ok) {
                setUsers(users.filter((user) => user.userId !== userId));
                window.Toastify({
                    text: 'User deleted successfully',
                    duration: 3000,
                    style: { background: 'green' },
                }).showToast();
            } else {
                throw new Error(result.message || 'Failed to delete user');
            }
        } catch (err) {
            window.Toastify({
                text: `Error: ${err.message}`,
                duration: 3000,
                style: { background: 'red' },
            }).showToast();
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedUser((prev) => ({ ...prev, [name]: value }));
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl w-full bg-white shadow-lg rounded-lg p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">User List</h2>

                {isLoading ? (
                    <div className="text-center py-6">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
                    </div>
                ) : error ? (
                    <div className="text-center py-6 text-red-500">{error}</div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-purple-600 text-white">
                                    <tr>
                                        <th className="p-4 text-sm font-medium">User ID</th>
                                        <th className="p-4 text-sm font-medium">Email</th>
                                        <th className="p-4 text-sm font-medium">Name</th>
                                        <th className="p-4 text-sm font-medium">Phone</th>
                                        <th className="p-4 text-sm font-medium">Role</th>
                                        <th className="p-4 text-sm font-medium">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="text-center py-6 text-gray-500">
                                                No users available.
                                            </td>
                                        </tr>
                                    ) : (
                                        users.map((user) => (
                                            <tr key={user.userId} className="border-t hover:bg-gray-50 transition duration-150">
                                                {editUserId === user.userId ? (
                                                    <>
                                                        <td className="p-4 text-sm text-gray-700">{user.userId}</td>
                                                        <td className="p-4">
                                                            <input
                                                                type="email"
                                                                name="email"
                                                                value={editedUser.email}
                                                                onChange={handleChange}
                                                                className={`w-full border rounded-md px-3 py-2 focus:ring-purple-500 focus:border-purple-500 ${validateUser().email && editedUser.email ? 'border-red-500' : 'border-gray-300'
                                                                    }`}
                                                                placeholder="user@example.com"
                                                            />
                                                        </td>
                                                        <td className="p-4">
                                                            <input
                                                                type="text"
                                                                name="name"
                                                                value={editedUser.name}
                                                                onChange={handleChange}
                                                                className={`w-full border rounded-md px-3 py-2 focus:ring-purple-500 focus:border-purple-500 ${validateUser().name && !editedUser.name ? 'border-red-500' : 'border-gray-300'
                                                                    }`}
                                                                placeholder="Name"
                                                            />
                                                        </td>
                                                        <td className="p-4">
                                                            <input
                                                                type="text"
                                                                name="phone"
                                                                value={editedUser.phone || ''}
                                                                onChange={handleChange}
                                                                className={`w-full border rounded-md px-3 py-2 focus:ring-purple-500 focus:border-purple-500 ${validateUser().phone && editedUser.phone ? 'border-red-500' : 'border-gray-300'
                                                                    }`}
                                                                placeholder="Phone number"
                                                            />
                                                        </td>
                                                        <td className="p-4">
                                                            <select
                                                                name="role"
                                                                value={editedUser.role}
                                                                onChange={handleChange}
                                                                className={`w-full border rounded-md px-3 py-2 focus:ring-purple-500 focus:border-purple-500 ${validateUser().role && !editedUser.role ? 'border-red-500' : 'border-gray-300'
                                                                    }`}
                                                            >
                                                                <option value="">Select Role</option>
                                                                <option value="Admin">Admin</option>
                                                                <option value="User">User</option>
                                                                <option value="Manager">Manager</option>
                                                            </select>
                                                        </td>
                                                        <td className="p-4 space-x-2">
                                                            <button
                                                                onClick={handleSave}
                                                                disabled={isLoading}
                                                                className={`bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-200 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                            >
                                                                Save
                                                            </button>
                                                            <button
                                                                onClick={handleCancel}
                                                                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition duration-200"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </td>
                                                    </>
                                                ) : (
                                                    <>
                                                        <td className="p-4 text-sm text-gray-700">{user.userId}</td>
                                                        <td className="p-4 text-sm text-gray-700">{user.email}</td>
                                                        <td className="p-4 text-sm text-gray-700">{user.name}</td>
                                                        <td className="p-4 text-sm text-gray-700">{user.phone || 'N/A'}</td>
                                                        <td className="p-4 text-sm text-gray-700">{user.role}</td>
                                                        <td className="p-4 space-x-2">
                                                            <button
                                                                onClick={() => handleEdit(user)}
                                                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(user.userId)}
                                                                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-200"
                                                            >
                                                                Delete
                                                            </button>
                                                        </td>
                                                    </>
                                                )}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-between items-center mt-6">
                                <button
                                    onClick={() => handlePageChange(page - 1)}
                                    disabled={page === 1}
                                    className={`px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition duration-200 ${page === 1 ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                >
                                    Previous
                                </button>
                                <span className="text-sm text-gray-700">
                                    Page {page} of {totalPages}
                                </span>
                                <button
                                    onClick={() => handlePageChange(page + 1)}
                                    disabled={page === totalPages}
                                    className={`px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition duration-200 ${page === totalPages ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div >
    );
};

export default UserList;