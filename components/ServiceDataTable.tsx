import React, { useState, useEffect, useMemo } from 'react';
import { getAllServices } from '../services/googleSheetService';
import type { ServiceData } from '../types';
import { ServiceStatus } from '../types';
import Spinner from './Spinner';
import ImagePreviewModal from './ImagePreviewModal';
import { getDirectGoogleDriveImageUrl } from '../utils/imageUtils';

interface ServiceDataTableProps {
    onEdit: (service: ServiceData) => void;
    onDownload: (service: ServiceData) => void;
    refreshKey: number;
}

/**
 * A simple validation function for date strings.
 * The backend now provides dates in YYYY-MM-DD format, so we just check for that.
 * @param dateInput The raw date value from the data source.
 * @returns A string in 'YYYY-MM-DD' format, or an empty string if invalid.
 */
const normalizeDateString = (dateInput: any): string => {
    if (!dateInput) return '';
    const dateStr = String(dateInput).trim();
    // A simple regex check is enough for validation.
    if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
        return dateStr.substring(0, 10);
    }
    return ''; // Return empty if format is unexpected
};


// Helper function to determine badge color based on status
const getStatusColor = (status: string): string => {
    switch (status) {
        case 'New':
            return 'bg-blue-100 text-blue-800';
        case 'In Service':
            return 'bg-yellow-100 text-yellow-800';
        case 'Completed':
            return 'bg-green-100 text-green-800';
        case 'Informed to Customer':
            return 'bg-indigo-100 text-indigo-800';
        case 'Delivered to Customer':
            return 'bg-gray-100 text-gray-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

const ServiceDataTable: React.FC<ServiceDataTableProps> = ({ onEdit, onDownload, refreshKey }) => {
    const [services, setServices] = useState<ServiceData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState('All');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: keyof ServiceData | null; direction: 'ascending' | 'descending' }>({ key: 'date', direction: 'descending' });


    useEffect(() => {
        const fetchServices = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await getAllServices();
                // FIX: Add a more robust filter to explicitly remove the header row.
                // The header might be passed from the script if it's not deployed correctly.
                // This filter ensures that only rows with a numeric slip number are processed.
                const processedData = data
                    .filter(row => row && row.slipNo && !isNaN(parseInt(String(row.slipNo), 10)))
                    .map(service => ({
                        ...service,
                        // Normalize function now just validates the expected format
                        date: normalizeDateString(service.date),
                        warrantyDate: normalizeDateString(service.warrantyDate),
                    }));
                setServices(processedData);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
                setError(`Failed to fetch services: ${errorMessage}`);
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
    }, [refreshKey]);

    const sortedAndFilteredServices = useMemo(() => {
        let filteredData = [...services];

        // Status filter
        if (statusFilter !== 'All') {
            filteredData = filteredData.filter(s => s.serviceStatus === statusFilter);
        }

        // Date range filter
        if (startDate || endDate) {
            filteredData = filteredData.filter(s => {
                if (!s.date) return false;
                const serviceDateStr = s.date;
                if (startDate && serviceDateStr < startDate) return false;
                if (endDate && serviceDateStr > endDate) return false;
                return true;
            });
        }

        // Search term filter
        if (searchTerm) {
            const lowercasedFilter = searchTerm.toLowerCase();
            filteredData = filteredData.filter(service =>
                Object.values(service).some(value =>
                    String(value).toLowerCase().includes(lowercasedFilter)
                )
            );
        }

        // Sorting
        if (sortConfig.key) {
            filteredData.sort((a, b) => {
                const aVal = a[sortConfig.key!];
                const bVal = b[sortConfig.key!];

                if (aVal === null || aVal === undefined) return 1;
                if (bVal === null || bVal === undefined) return -1;

                let comparison = 0;
                if (sortConfig.key === 'slipNo' || sortConfig.key === 'estimateAmount') {
                    comparison = parseInt(String(aVal) || '0', 10) - parseInt(String(bVal) || '0', 10);
                } else {
                    comparison = String(aVal).toLowerCase().localeCompare(String(bVal).toLowerCase());
                }

                return sortConfig.direction === 'ascending' ? comparison : -comparison;
            });
        }

        return filteredData;
    }, [services, searchTerm, statusFilter, startDate, endDate, sortConfig]);

    const requestSort = (key: keyof ServiceData) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key: keyof ServiceData) => {
        if (sortConfig.key !== key) {
            return <i className="fas fa-sort text-gray-400 ml-1"></i>;
        }
        if (sortConfig.direction === 'ascending') {
            return <i className="fas fa-sort-up ml-1 text-gray-800"></i>;
        }
        return <i className="fas fa-sort-down ml-1 text-gray-800"></i>;
    };

    const handleImageClick = (imageUrl: string) => {
        setPreviewImageUrl(getDirectGoogleDriveImageUrl(imageUrl));
    };

    const handleClosePreview = () => {
        setPreviewImageUrl(null);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spinner size="lg" />
            </div>
        );
    }

    if (error) {
        return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">{error}</div>;
    }

    return (
        <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-2xl shadow-lg">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Service Data</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <input
                    type="text"
                    placeholder="Search all fields..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 lg:col-span-2"
                />
                <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 bg-white"
                >
                    <option value="All">All Statuses</option>
                    {Object.values(ServiceStatus).map(status => (
                        <option key={status} value={status}>{status}</option>
                    ))}
                </select>
                <div className="grid grid-cols-2 gap-2">
                    <input
                        type="date"
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                        title="Filter by start date"
                    />
                    <input
                        type="date"
                        value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                        title="Filter by end date"
                    />
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => requestSort('slipNo')}>
                                Slip No {getSortIcon('slipNo')}
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => requestSort('date')}>
                                Date {getSortIcon('date')}
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => requestSort('customerName')}>
                                Customer {getSortIcon('customerName')}
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => requestSort('productName')}>
                                Product {getSortIcon('productName')}
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => requestSort('servicemanName')}>
                                Serviceman {getSortIcon('servicemanName')}
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Type</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => requestSort('serviceStatus')}>
                                Status {getSortIcon('serviceStatus')}
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {sortedAndFilteredServices.map(service => (
                            <tr key={service.serviceId || service.rowIndex}>
                                <td className="px-4 py-4 whitespace-nowrap">
                                    <img
                                        src={getDirectGoogleDriveImageUrl(service.imageUrl)}
                                        alt={service.productName}
                                        className="w-12 h-12 object-cover rounded-md cursor-pointer hover:opacity-80 transition-opacity"
                                        onClick={() => handleImageClick(service.imageUrl)}
                                    />
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{service.slipNo}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{service.date}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                                    <div className="font-medium">{service.customerName}</div>
                                    <div>{service.contact}</div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                                    <div className="font-medium">{service.productName}</div>
                                    <div>{service.brand}</div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{service.servicemanName || '-'}</td>
                                <td className="px-4 py-4 text-sm text-gray-500 max-w-xs truncate" title={service.serviceType}>{service.serviceType}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(service.serviceStatus)}`}>
                                        {service.serviceStatus}
                                    </span>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex items-center space-x-4">
                                        <button onClick={() => onEdit(service)} className="text-purple-600 hover:text-purple-900 flex items-center" title="Edit service">
                                            <i className="fas fa-pencil-alt"></i>
                                        </button>
                                        <button onClick={() => onDownload(service)} className="text-green-600 hover:text-green-900 flex items-center" title="Download Slip">
                                            <i className="fas fa-download"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {sortedAndFilteredServices.length === 0 && !loading && (
                    <div className="text-center py-8 text-gray-500">
                        <p className="font-semibold">No service records found.</p>
                        <p className="text-sm mt-1">Try adjusting your search or filters.</p>
                    </div>
                )}
            </div>
            {previewImageUrl && <ImagePreviewModal imageUrl={previewImageUrl} onClose={handleClosePreview} />}
        </div>
    );
};

export default ServiceDataTable;