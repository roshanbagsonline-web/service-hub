import React, { useState, useEffect } from 'react';
import { updateService } from '../services/googleSheetService';
import type { ServiceData, UpdateServicePayload } from '../types';
import Spinner from './Spinner';
import MultiSelectDropdown from './MultiSelectDropdown';
import { getDirectGoogleDriveImageUrl } from '../utils/imageUtils';

interface UpdateServiceModalProps {
    service: ServiceData;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const UpdateServiceModal: React.FC<UpdateServiceModalProps> = ({ service, isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState<ServiceData>(service);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [selectedServices, setSelectedServices] = useState<string[]>([]);
    const [color, setColor] = useState('');
    const [size, setSize] = useState('');

    useEffect(() => {
        if (service) {
            // The `service` prop now has pre-normalized dates from ServiceDataTable.
            // We can use the data directly without further processing.
            setFormData(service);

            const directUrl = getDirectGoogleDriveImageUrl(service.imageUrl);
            setImagePreview(directUrl);
            setImageFile(null);
            
            const serviceTypes = service.serviceType ? service.serviceType.split(',').map(s => s.trim()) : [];
            setSelectedServices(serviceTypes);

            const [colorVal = '', sizeVal = ''] = service.colorAndSize ? service.colorAndSize.split(' / ') : [];
            setColor(colorVal);
            setSize(sizeVal);
        }
    }, [service]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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

        try {
            // Ensure warrantyDate is cleared if status is not 'Warranty'
            const finalWarrantyDate = formData.warrantyStatus === 'Warranty' ? formData.warrantyDate : '';

            const payload: UpdateServicePayload = { 
                ...formData,
                warrantyDate: finalWarrantyDate,
                serviceType: selectedServices.join(', '),
                colorAndSize: `${color} / ${size}`
            };

            if (imageFile) {
                payload.image = await fileToBase64(imageFile);
                payload.imageName = imageFile.name;
                payload.imageMimeType = imageFile.type;
            } else {
                 payload.imageUrl_existing = service.imageUrl;
            }

            await updateService(payload);
            alert('Service updated successfully!');
            onSuccess();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(`Update failed: ${errorMessage}`);
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;
    
    const serviceStatusOptions = ['New', 'In Service', 'Completed', 'Informed to Customer', 'Delivered to Customer'];
    const serviceOptions = [
        "Stitching", "Zip Repair/Replacement", "Runner Replacement", "Handle Repair/Replacement", 
        "Strolly Wheel/Handle Repair", "Buckle Repair/Replacement", "Professional Cleaning", 
        "Strap Adjustment/Replacement", "Lock Repair/Replacement", "Bags"
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
                <div className="p-6 border-b sticky top-0 bg-white z-10">
                    <div className="flex justify-between items-center">
                        <h3 className="text-2xl font-semibold text-gray-800">Edit Service Record (Slip No: {service.slipNo})</h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <i className="fas fa-times fa-lg"></i>
                        </button>
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                    <div className="p-6 space-y-6">
                        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">{error}</div>}
                        
                        <div className="p-6 border border-gray-200 rounded-lg">
                            <h3 className="text-lg font-semibold text-gray-700 mb-4">Customer & Product Information <span className="text-sm font-normal text-gray-500">(Read-Only)</span></h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <InputField label="Customer Name" name="customerName" value={formData.customerName} onChange={handleChange} disabled />
                                <InputField label="Contact" name="contact" value={formData.contact} onChange={handleChange} disabled />
                                <InputField label="Product Name" name="productName" value={formData.productName} onChange={handleChange} disabled />
                                <InputField label="Brand" name="brand" value={formData.brand} onChange={handleChange} disabled />
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Color</label>
                                    <input type="text" value={color} onChange={e => setColor(e.target.value)} disabled className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-purple-500"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Size</label>
                                    <input type="text" value={size} onChange={e => setSize(e.target.value)} disabled className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-purple-500"/>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border border-gray-200 rounded-lg">
                            <h3 className="text-lg font-semibold text-gray-700 mb-4">Service & Warranty Details</h3>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Warranty Status</label>
                                    <select name="warrantyStatus" value={formData.warrantyStatus} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                                        <option value="Non-Warranty">Non-Warranty</option>
                                        <option value="Warranty">Warranty</option>
                                    </select>
                                </div>
                                {formData.warrantyStatus === 'Non-Warranty' ? (
                                    <InputField label="Estimate Amount" name="estimateAmount" type="number" value={formData.estimateAmount} onChange={handleChange} />
                                ) : (
                                    <>
                                        <InputField label="Warranty Invoice Number" name="warrantyInvoiceNumber" value={formData.warrantyInvoiceNumber} onChange={handleChange} />
                                        <InputField label="Warranty Date" name="warrantyDate" type="date" value={formData.warrantyDate} onChange={handleChange} />
                                    </>
                                )}
                             </div>
                             <div className="mt-6">
                                <h4 className="text-md font-semibold text-gray-700 mb-2">Service Description</h4>
                                <MultiSelectDropdown
                                    options={serviceOptions}
                                    selectedOptions={selectedServices}
                                    onChange={setSelectedServices}
                                />
                            </div>
                        </div>

                         <div className="p-6 border border-gray-200 rounded-lg">
                            <h3 className="text-lg font-semibold text-gray-700 mb-4">Service Status & Billing</h3>
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Service Status</label>
                                    <select name="serviceStatus" value={formData.serviceStatus} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                                        {serviceStatusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <InputField label="Serviceman Amount" name="servicemanAmount" type="number" value={formData.servicemanAmount} onChange={handleChange} />
                                <InputField label="Serviceman Name" name="servicemanName" value={formData.servicemanName} onChange={handleChange} />
                                <InputField label="Customer Paid Amount" name="customerPaidAmount" type="number" value={formData.customerPaidAmount} onChange={handleChange} />
                                <InputField label="Final Invoice Number" name="invoiceNumber" value={formData.invoiceNumber} onChange={handleChange} />
                            </div>
                        </div>
                        
                        <div className="p-6 border border-gray-200 rounded-lg">
                             <h4 className="text-lg font-semibold text-gray-700 mb-4">Product Image</h4>
                            <input type="file" name="image" id="image_update" accept="image/*" onChange={handleImageChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"/>
                            {imagePreview && (
                                <div className="mt-4">
                                    <img src={imagePreview} alt="Product Preview" className="max-h-48 rounded-lg border border-gray-300 p-1"/>
                                </div>
                            )}
                        </div>

                    </div>
                    <div className="px-6 py-4 bg-gray-50 border-t flex justify-end items-center space-x-4 sticky bottom-0 z-10">
                        <button type="button" onClick={onClose} className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            Cancel
                        </button>
                        <button type="submit" disabled={submitting} className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-purple-300">
                             {submitting ? <><Spinner size="sm" /> Updating...</> : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const InputField: React.FC<{
    label: string, 
    name: string, 
    value: string, 
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, 
    type?: string,
    disabled?: boolean,
    placeholder?: string,
}> = ({label, name, value, onChange, type = 'text', disabled = false, placeholder = ''}) => (
    <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <input 
            type={type} 
            name={name} 
            value={value || ''} 
            onChange={onChange} 
            disabled={disabled}
            placeholder={placeholder}
            className={`mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        />
    </div>
);

export default UpdateServiceModal;