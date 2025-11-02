import React, { useState, useEffect, useCallback } from 'react';
import { getLastSlipNumber, submitService } from '../services/googleSheetService';
import type { NewServicePayload, ServiceData } from '../types';
import Spinner from './Spinner';
import MultiSelectDropdown from './MultiSelectDropdown';

interface ServiceEntryFormProps {
    onSuccess: (newService: ServiceData) => void;
}

const initialFormData = {
    date: new Date().toISOString().split('T')[0],
    customerName: '',
    contact: '',
    productName: '',
    brand: '',
    color: '',
    size: '',
    estimateAmount: '',
    warrantyInvoiceNumber: '',
    warrantyDate: '',
};

const ServiceEntryForm: React.FC<ServiceEntryFormProps> = ({ onSuccess }) => {
    const [formData, setFormData] = useState(initialFormData);
    const [slipNo, setSlipNo] = useState<string>('');
    const [loadingSlip, setLoadingSlip] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [selectedServices, setSelectedServices] = useState<string[]>([]);
    const [warrantyStatus, setWarrantyStatus] = useState<'Non-Warranty' | 'Warranty'>('Non-Warranty');

    const fetchSlip = useCallback(async () => {
        setLoadingSlip(true);
        try {
            const lastSlip = await getLastSlipNumber();
            setSlipNo((lastSlip + 1).toString());
        } catch (err) {
            setError('Failed to fetch slip number. Please try again.');
            console.error(err);
        } finally {
            setLoadingSlip(false);
        }
    }, []);

    useEffect(() => {
        fetchSlip();
    }, [fetchSlip]);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setImageFile(null);
            setImagePreview(null);
        }
    };

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve((reader.result as string).split(',')[1]);
            reader.onerror = error => reject(error);
        });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        if (!imageFile) {
            setError("Product image is required.");
            setSubmitting(false);
            return;
        }

        if (selectedServices.length === 0) {
            setError("Please select at least one service description.");
            setSubmitting(false);
            return;
        }

        try {
            const base64Image = await fileToBase64(imageFile);
            
            const payload: NewServicePayload = {
                date: formData.date,
                slipNo: slipNo,
                customerName: formData.customerName,
                contact: formData.contact,
                productName: formData.productName,
                brand: formData.brand,
                colorAndSize: `${formData.color} / ${formData.size}`,
                serviceType: selectedServices.join(', '),
                warrantyStatus: warrantyStatus,
                estimateAmount: warrantyStatus === 'Non-Warranty' ? formData.estimateAmount : '',
                warrantyInvoiceNumber: warrantyStatus === 'Warranty' ? formData.warrantyInvoiceNumber : '',
                warrantyDate: warrantyStatus === 'Warranty' ? formData.warrantyDate : '',
                image: base64Image,
                imageName: imageFile.name,
                imageMimeType: imageFile.type,
                servicemanAmount: '',
                customerPaidAmount: '',
                invoiceNumber: '',
            };

            const response = await submitService(payload);
            
            // FIX: Construct ServiceData compatible object by excluding properties from NewServicePayload that are not in ServiceData.
            // The original code created an object with extra properties ('image', 'imageName', 'imageMimeType'), causing a type error.
            const { image, imageName, imageMimeType, ...serviceDataFromPayload } = payload;
            const newServiceData: ServiceData = {
                ...serviceDataFromPayload,
                serviceId: response.serviceId,
                rowIndex: 0, // rowIndex is not available here, but not critical for the slip
                serviceStatus: 'New',
                imageUrl: imagePreview || '', // Use preview for immediate display
                servicemanName: '',
            };
            
            // alert('Service request submitted successfully!'); // Replaced by modal
            (e.target as HTMLFormElement).reset();
            setFormData(initialFormData);
            setSelectedServices([]);
            setImagePreview(null);
            setImageFile(null);
            fetchSlip();
            onSuccess(newServiceData);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(`Submission failed: ${errorMessage}`);
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };
    
    const serviceOptions = [
        "Stitching", "Zip Repair/Replacement", "Runner Replacement", "Handle Repair/Replacement", 
        "Strolly Wheel/Handle Repair", "Buckle Repair/Replacement", "Professional Cleaning", 
        "Strap Adjustment/Replacement", "Lock Repair/Replacement", "Bags"
    ];

    return (
         <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
            <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">New Service Entry</h2>
            <p className="text-center text-gray-500 mb-8">Fill in the details below to create a new service request.</p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                 {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">{error}</div>}
                
                <div className="p-6 border border-gray-200 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center"><i className="fas fa-info-circle mr-3 text-purple-500"></i>General Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date *</label>
                            <input type="date" name="date" id="date" value={formData.date} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"/>
                        </div>
                        <div>
                            <label htmlFor="slipNo" className="block text-sm font-medium text-gray-700">Slip No</label>
                             <div className="mt-1 flex items-center w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md">
                                {loadingSlip ? <Spinner size="sm" /> : <span className="text-gray-800">{slipNo}</span>}
                             </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 border border-gray-200 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center"><i className="fas fa-user-tag mr-3 text-purple-500"></i>Customer & Product Information</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">Customer Name *</label>
                            <input type="text" name="customerName" id="customerName" value={formData.customerName} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"/>
                        </div>
                         <div>
                            <label htmlFor="contact" className="block text-sm font-medium text-gray-700">Contact Number *</label>
                            <input type="tel" name="contact" id="contact" value={formData.contact} onChange={handleInputChange} required pattern="[0-9]{10,}" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"/>
                        </div>
                        <div>
                            <label htmlFor="productName" className="block text-sm font-medium text-gray-700">Product Name</label>
                            <input type="text" name="productName" id="productName" value={formData.productName} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"/>
                        </div>
                        <div>
                            <label htmlFor="brand" className="block text-sm font-medium text-gray-700">Brand</label>
                            <input type="text" name="brand" id="brand" value={formData.brand} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"/>
                        </div>
                        <div>
                            <label htmlFor="color" className="block text-sm font-medium text-gray-700">Color</label>
                            <input type="text" name="color" id="color" value={formData.color} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"/>
                        </div>
                        <div>
                            <label htmlFor="size" className="block text-sm font-medium text-gray-700">Size</label>
                            <input type="text" name="size" id="size" value={formData.size} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"/>
                        </div>
                     </div>
                </div>

                <div className="p-6 border border-gray-200 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center"><i className="fas fa-tools mr-3 text-purple-500"></i>Service Description *</h3>
                     <MultiSelectDropdown
                        options={serviceOptions}
                        selectedOptions={selectedServices}
                        onChange={setSelectedServices}
                        placeholder="Select required services..."
                    />
                </div>

                <div className="p-6 border border-gray-200 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center"><i className="fas fa-shield-alt mr-3 text-purple-500"></i>Warranty Status</h3>
                    <select value={warrantyStatus} onChange={e => setWarrantyStatus(e.target.value as 'Non-Warranty' | 'Warranty')} className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500">
                        <option value="Non-Warranty">Non-Warranty</option>
                        <option value="Warranty">Warranty</option>
                    </select>
                    
                    {warrantyStatus === 'Non-Warranty' && (
                        <div className="mt-4">
                            <label htmlFor="estimateAmount" className="block text-sm font-medium text-gray-700">Estimate Amount *</label>
                            <input type="number" name="estimateAmount" id="estimateAmount" value={formData.estimateAmount} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"/>
                        </div>
                    )}

                    {warrantyStatus === 'Warranty' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                            <div>
                                <label htmlFor="warrantyInvoiceNumber" className="block text-sm font-medium text-gray-700">Warranty Invoice Number *</label>
                                <input type="text" name="warrantyInvoiceNumber" id="warrantyInvoiceNumber" value={formData.warrantyInvoiceNumber} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"/>
                            </div>
                            <div>
                                <label htmlFor="warrantyDate" className="block text-sm font-medium text-gray-700">Warranty Date *</label>
                                <input type="date" name="warrantyDate" id="warrantyDate" value={formData.warrantyDate} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"/>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 border border-gray-200 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center"><i className="fas fa-camera mr-3 text-purple-500"></i>Product Image *</h3>
                    <input type="file" name="image" id="image" accept="image/*" capture="environment" onChange={handleImageChange} required className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"/>
                    {imagePreview && (
                        <div className="mt-4">
                            <img src={imagePreview} alt="Product Preview" className="max-h-48 rounded-lg border border-gray-300 p-1"/>
                        </div>
                    )}
                </div>

                <div className="flex justify-center">
                    <button type="submit" disabled={submitting || loadingSlip} className="w-full md:w-auto flex justify-center items-center py-3 px-6 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-purple-300 disabled:cursor-not-allowed">
                        {submitting ? <><Spinner size="sm" /> Submitting...</> : 'Submit Service Request'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ServiceEntryForm;