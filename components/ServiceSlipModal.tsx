import React from 'react';
import type { ServiceData } from '../types';

interface ServiceSlipModalProps {
    service: ServiceData | null;
    onClose: () => void;
}

const DetailItem: React.FC<{ label: string; value?: string | number | null }> = ({ label, value }) => (
    <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-semibold text-gray-800">{value || '-'}</p>
    </div>
);

const ServiceSlipModal: React.FC<ServiceSlipModalProps> = ({ service, onClose }) => {
    if (!service) return null;

    const handlePrint = () => {
        const printContents = document.getElementById('printable-slip')?.innerHTML;
        if (printContents) {
            const originalContents = document.body.innerHTML;
            document.body.innerHTML = printContents;
            window.print();
            document.body.innerHTML = originalContents;
            window.location.reload(); // Reload to restore styles and event handlers
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="p-4 border-b">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-semibold text-gray-800">Service Request Created Successfully!</h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <i className="fas fa-times fa-lg"></i>
                        </button>
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6" id="printable-slip">
                    <style>{`
                        @media print {
                            body * { visibility: hidden; }
                            #printable-slip, #printable-slip * { visibility: visible; }
                            #printable-slip { position: absolute; left: 0; top: 0; width: 100%; }
                            .print-no-break { page-break-inside: avoid; }
                        }
                    `}</style>
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">Service Slip</h1>
                        <p className="text-gray-500">Thank you for your business!</p>
                    </div>
                    
                    <div className="space-y-6">
                        <div className="p-4 border border-gray-200 rounded-lg print-no-break">
                            <h4 className="font-bold text-lg text-purple-700 mb-3">Service Details</h4>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                <DetailItem label="Slip No." value={service.slipNo} />
                                <DetailItem label="Date" value={service.date.split('T')[0]} />
                                <DetailItem label="Service ID" value={service.serviceId} />
                                <DetailItem label="Status" value={service.serviceStatus} />
                            </div>
                        </div>

                        <div className="p-4 border border-gray-200 rounded-lg print-no-break">
                            <h4 className="font-bold text-lg text-purple-700 mb-3">Customer Information</h4>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                <DetailItem label="Customer Name" value={service.customerName} />
                                <DetailItem label="Contact Number" value={service.contact} />
                            </div>
                        </div>
                        
                        <div className="p-4 border border-gray-200 rounded-lg print-no-break">
                            <h4 className="font-bold text-lg text-purple-700 mb-3">Product Information</h4>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                <DetailItem label="Product Name" value={service.productName} />
                                <DetailItem label="Brand" value={service.brand} />
                                <DetailItem label="Color / Size" value={service.colorAndSize} />
                                <div className="col-span-2">
                                    <DetailItem label="Service Required" value={service.serviceType} />
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-4 border border-gray-200 rounded-lg print-no-break">
                            <h4 className="font-bold text-lg text-purple-700 mb-3">Warranty & Estimate</h4>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                <DetailItem label="Warranty Status" value={service.warrantyStatus} />
                                {service.warrantyStatus === 'Warranty' ? (
                                    <>
                                        <DetailItem label="Warranty Invoice" value={service.warrantyInvoiceNumber} />
                                        <DetailItem label="Warranty Date" value={service.warrantyDate.split('T')[0]} />
                                    </>
                                ) : (
                                    <DetailItem label="Estimate Amount" value={service.estimateAmount ? `₹${service.estimateAmount}` : '-'} />
                                )}
                            </div>
                        </div>
                    </div>
                     <div className="text-center mt-8 text-xs text-gray-400">
                        <p>This is a computer-generated slip and does not require a signature.</p>
                        <p>Please keep this slip for future reference.</p>
                    </div>
                </div>

                <div className="p-4 bg-gray-50 border-t flex justify-end items-center space-x-4">
                    <button type="button" onClick={onClose} className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        Close
                    </button>
                    <button type="button" onClick={handlePrint} className="inline-flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                        <i className="fas fa-print mr-2"></i> Print Slip
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ServiceSlipModal;
