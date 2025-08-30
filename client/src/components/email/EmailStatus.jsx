import React, { useState, useEffect } from 'react';
import 'toastify-js/src/toastify.css';

const baseURL = import.meta.env.VITE_API_BASE_URL
    ? `${import.meta.env.VITE_API_BASE_URL}/email-service`
    : 'https://hunt360-3.onrender.com/api/auth/email-service';

const EmailStatus = () => {
    const [emailData, setEmailData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 10;

    const fetchEmailStatus = async (pageNum) => {
        setIsLoading(true);
        try {
            const response = await fetch(`${baseURL}/email-status?page=${pageNum}&pageSize=${pageSize}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
            const result = await response.json();
            if (response.ok) {
                setEmailData(result.data);
                setTotalPages(result.totalPages);
            } else {
                throw new Error(result.message || 'Failed to fetch email status');
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
        fetchEmailStatus(page);
    }, [page]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl w-full bg-white shadow-lg rounded-lg p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Email Status</h2>

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
                                        <th className="p-4 text-sm font-medium">#</th>
                                        <th className="p-4 text-sm font-medium">Recipient</th>
                                        <th className="p-4 text-sm font-medium">Subject</th>
                                        <th className="p-4 text-sm font-medium">Status</th>
                                        <th className="p-4 text-sm font-medium">Timestamp</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {emailData.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="text-center py-6 text-gray-500">
                                                No records found.
                                            </td>
                                        </tr>
                                    ) : (
                                        emailData.map((email, index) => (
                                            <tr key={email.logId} className="border-t hover:bg-gray-50 transition duration-150">
                                                <td className="p-4 text-sm text-gray-700">{(page - 1) * pageSize + index + 1}</td>
                                                <td className="p-4 text-sm text-gray-700">{email.recipient}</td>
                                                <td className="p-4 text-sm text-gray-700">{email.subject}</td>
                                                <td className="p-4 text-sm">
                                                    <span
                                                        className={`px-2 py-1 rounded-full text-xs font-medium ${email.status === 'Sent'
                                                            ? 'bg-green-100 text-green-800'
                                                            : email.status === 'Failed'
                                                                ? 'bg-red-100 text-red-800'
                                                                : 'bg-yellow-100 text-yellow-800'
                                                            }`}
                                                    >
                                                        {email.status}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-sm text-gray-700">{new Date(email.timestamp).toLocaleString()}</td>
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
        </div>
    );
};

export default EmailStatus;