import React, { useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import ServiceEntryForm from './components/ServiceEntryForm';
import ServiceDataTable from './components/ServiceDataTable';
import UpdateServiceModal from './components/UpdateServiceModal';
import ServiceSlipModal from './components/ServiceSlipModal';
import type { ServiceData } from './types';

export type Page = 'entry' | 'data';

const App: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<Page>('entry');
    const [selectedService, setSelectedService] = useState<ServiceData | null>(null);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [refreshDataKey, setRefreshDataKey] = useState(0);
    const [showSlipFor, setShowSlipFor] = useState<ServiceData | null>(null);

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

    const navigate = (page: Page) => {
        setCurrentPage(page);
    };

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <Sidebar currentPage={currentPage} navigate={navigate} />
            <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                {currentPage === 'entry' && <ServiceEntryForm onSuccess={handleNewServiceSuccess} />}
                {currentPage === 'data' && <ServiceDataTable onEdit={handleEditService} refreshKey={refreshDataKey} />}
            </main>
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
        </div>
    );
};

export default App;