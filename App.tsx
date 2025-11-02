
import React, { useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import ServiceEntryForm from './components/ServiceEntryForm';
import ServiceDataTable from './components/ServiceDataTable';
import UpdateServiceModal from './components/UpdateServiceModal';
import type { ServiceData } from './types';

export type Page = 'entry' | 'data';

const App: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<Page>('entry');
    const [selectedService, setSelectedService] = useState<ServiceData | null>(null);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [refreshDataKey, setRefreshDataKey] = useState(0);

    const handleEditService = (service: ServiceData) => {
        setSelectedService(service);
        setIsUpdateModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsUpdateModalOpen(false);
        setSelectedService(null);
    };

    const handleUpdateSuccess = () => {
        handleCloseModal();
        setRefreshDataKey(prev => prev + 1); // Trigger data refresh in table
    };

    const handleNewServiceSuccess = () => {
        setRefreshDataKey(prev => prev + 1); // Trigger data refresh in table
        setCurrentPage('data'); // Switch to data view after successful entry
    };

    const navigate = useCallback((page: Page) => {
        setCurrentPage(page);
    }, []);

    return (
        <div className="flex h-screen bg-slate-100 font-sans">
            <Sidebar currentPage={currentPage} navigate={navigate} />
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                <div className={`${currentPage === 'entry' ? 'block' : 'hidden'}`}>
                    <ServiceEntryForm onSuccess={handleNewServiceSuccess} />
                </div>
                <div className={`${currentPage === 'data' ? 'block' : 'hidden'}`}>
                    <ServiceDataTable onEdit={handleEditService} refreshKey={refreshDataKey} />
                </div>
            </main>
            {isUpdateModalOpen && selectedService && (
                <UpdateServiceModal
                    service={selectedService}
                    isOpen={isUpdateModalOpen}
                    onClose={handleCloseModal}
                    onSuccess={handleUpdateSuccess}
                />
            )}
        </div>
    );
};

export default App;
