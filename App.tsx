
import React, { useState, useCallback, useRef, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ServiceEntryForm from './components/ServiceEntryForm';
import ServiceDataTable from './components/ServiceDataTable';
import UpdateServiceModal from './components/UpdateServiceModal';
import ServiceSlipModal from './components/ServiceSlipModal';
import PrintableSlip from './components/PrintableSlip';
import { downloadSlipAsPdf } from './utils/pdfUtils';
import type { ServiceData } from './types';

export type Page = 'entry' | 'data';

const App: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<Page>('entry');
    const [selectedService, setSelectedService] = useState<ServiceData | null>(null);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [refreshDataKey, setRefreshDataKey] = useState(0);
    const [showSlipFor, setShowSlipFor] = useState<ServiceData | null>(null);
    const [serviceToDownload, setServiceToDownload] = useState<ServiceData | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const downloadSlipRef = useRef<HTMLDivElement>(null);

    const handleEditService = (service: ServiceData) => {
        setSelectedService(service);
        setIsUpdateModalOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedService(null);
        setIsUpdateModalOpen(false);
    };

    const handleUpdateSuccess = () => {
        handleCloseModal();
        setRefreshDataKey(prevKey => prevKey + 1); // Refresh data table
    };

    const handleNewServiceSuccess = (newService: ServiceData) => {
        setShowSlipFor(newService);
    };

    const handleCloseSlipModal = () => {
        setShowSlipFor(null);
        setRefreshDataKey(prevKey => prevKey + 1);
        setCurrentPage('data'); // Navigate to data page after closing slip
    };

    const handleDownloadRequest = (service: ServiceData) => {
        setServiceToDownload(service);
    };

    // Effect to handle the PDF download when a service is selected for download
    useEffect(() => {
        if (serviceToDownload && downloadSlipRef.current) {
            const generatePdf = async () => {
                await downloadSlipAsPdf(
                    downloadSlipRef.current!, 
                    'a4', 
                    serviceToDownload.slipNo,
                    serviceToDownload.customerName
                );
                setServiceToDownload(null); // Reset after download
            };
            // Use a timeout to ensure the component has fully rendered before capturing
            setTimeout(generatePdf, 100); 
        }
    }, [serviceToDownload]);


    const navigate = (page: Page) => {
        setCurrentPage(page);
    };

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <Sidebar 
                currentPage={currentPage} 
                navigate={navigate} 
                isOpen={isSidebarOpen} 
                setIsOpen={setIsSidebarOpen}
            />
             <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white shadow p-4 flex justify-between items-center md:hidden">
                    <h1 className="text-xl font-bold text-gray-800">
                        {currentPage === 'entry' ? 'Service Entry' : 'Service Data'}
                    </h1>
                    <button 
                        onClick={() => setIsSidebarOpen(true)}
                        className="text-gray-600 focus:outline-none"
                        aria-label="Open sidebar"
                    >
                        <i className="fas fa-bars fa-lg"></i>
                    </button>
                </header>
                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                    {currentPage === 'entry' && <ServiceEntryForm onSuccess={handleNewServiceSuccess} />}
                    {currentPage === 'data' && <ServiceDataTable onEdit={handleEditService} onDownload={handleDownloadRequest} refreshKey={refreshDataKey} />}
                </main>
            </div>
            {isUpdateModalOpen && selectedService && (
                <UpdateServiceModal
                    isOpen={isUpdateModalOpen}
                    service={selectedService}
                    onClose={handleCloseModal}
                    onSuccess={handleUpdateSuccess}
                />
            )}
            {showSlipFor && (
                <ServiceSlipModal
                    service={showSlipFor}
                    onClose={handleCloseSlipModal}
                />
            )}
            {/* Hidden component for generating PDFs directly from the data table */}
            {serviceToDownload && (
                <div style={{ position: 'absolute', left: '-9999px', top: 0, zIndex: -100, width: '800px' }} className="bg-white">
                    <div ref={downloadSlipRef}>
                        <PrintableSlip service={serviceToDownload} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;
