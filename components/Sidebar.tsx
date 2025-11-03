import React from 'react';
import type { Page } from '../App';

interface SidebarProps {
    currentPage: Page;
    navigate: (page: Page) => void;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const NavLink: React.FC<{
    page: Page;
    currentPage: Page;
    onNavigate: () => void;
    icon: string;
    label: string;
}> = ({ page, currentPage, onNavigate, icon, label }) => {
    const isActive = currentPage === page;
    return (
        <li>
            <a
                href="#"
                onClick={(e) => {
                    e.preventDefault();
                    onNavigate();
                }}
                className={`flex items-center p-4 text-base font-normal rounded-lg transition duration-75 group ${
                    isActive
                        ? 'bg-purple-700 text-white'
                        : 'text-purple-100 hover:bg-purple-700'
                }`}
            >
                <i className={`${icon} w-6 h-6 text-purple-200 transition duration-75 group-hover:text-white`}></i>
                <span className="ml-3">{label}</span>
            </a>
        </li>
    );
};

const Sidebar: React.FC<SidebarProps> = ({ currentPage, navigate, isOpen, setIsOpen }) => {
    
    const handleNavigate = (page: Page) => {
        navigate(page);
        setIsOpen(false); // Close sidebar on navigation
    };

    return (
        <>
            {/* Overlay for mobile */}
            <div
                className={`fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsOpen(false)}
                aria-hidden="true"
            ></div>
            
            <aside className={`fixed inset-y-0 left-0 z-40 w-64 h-full bg-gradient-to-b from-purple-800 to-indigo-900 shadow-lg text-white flex flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-purple-700">
                    <div className="flex items-center space-x-3">
                        <div className="bg-purple-600 p-2 rounded-lg">
                            <i className="fas fa-tools text-white text-xl fa-fw"></i>
                        </div>
                        <span className="text-xl font-bold text-white">Roshan Bags</span>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="text-purple-100 hover:text-white md:hidden" aria-label="Close sidebar">
                         <i className="fas fa-times fa-lg"></i>
                    </button>
                </div>
                <nav className="flex-1 px-4 py-4">
                    <ul className="space-y-2">
                        <NavLink page="entry" currentPage={currentPage} onNavigate={() => handleNavigate('entry')} icon="fas fa-clipboard-list" label="Service Entry" />
                        <NavLink page="data" currentPage={currentPage} onNavigate={() => handleNavigate('data')} icon="fas fa-database" label="Service Data" />
                    </ul>
                </nav>
            </aside>
        </>
    );
};

export default Sidebar;