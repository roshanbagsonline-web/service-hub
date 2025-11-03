
import React, { useRef } from 'react';
import type { ServiceData } from '../types';
import { downloadSlipAsPdf } from '../utils/pdfUtils';
import PrintableSlip from './PrintableSlip';

interface ServiceSlipModalProps {
    service: ServiceData | null;
    onClose: () => void;
}

const ServiceSlipModal: React.FC<ServiceSlipModalProps> = ({ service, onClose }) => {
    const slipRef = useRef<HTMLDivElement>(null);

    if (!service) return null;

    const handlePrint = () => {
        window.print();
    };

    const handleDownload = async (format: 'a4' | 'a5') => {
        if (slipRef.current) {
            try {
                await downloadSlipAsPdf(slipRef.current, format, service.slipNo, service.customerName);
            } catch (error) {
                console.error(`Failed to download PDF in ${format} format:`, error);
                alert('Sorry, there was an error creating the PDF.');
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="p-4 border-b print:hidden">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-semibold text-gray-800">Service Request Created Successfully!</h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <i className="fas fa-times fa-lg"></i>
                        </button>
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto" >
                    <div ref={slipRef}>
                        <PrintableSlip service={service} />
                    </div>
                </div>

                <div className="p-4 bg-gray-50 border-t flex flex-wrap justify-end items-center gap-2 print:hidden">
                    <button type="button" onClick={onClose} className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        Close
                    </button>
                    <button type="button" onClick={() => handleDownload('a5')} className="inline-flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                        Download A5 PDF
                    </button>
                    <button type="button" onClick={() => handleDownload('a4')} className="inline-flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                        Download A4 PDF
                    </button>
                     <button type="button" onClick={handlePrint} className="inline-flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        Print Slip
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ServiceSlipModal;