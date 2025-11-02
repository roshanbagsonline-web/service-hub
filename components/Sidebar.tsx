
import React from 'react';
import type { Page } from '../App';

interface SidebarProps {
    currentPage: Page;
    navigate: (page: Page) => void;
}

const NavLink: React.FC<{
    page: Page;
    currentPage: Page;
    navigate: (page: Page) => void;
    icon: string;
    label: string;
}> = ({ page, currentPage, navigate, icon, label }) => {
    const isActive = currentPage === page;
    return (
        <li>
            <a
                href="#"
                onClick={(e) => {
                    e.preventDefault();
                    navigate(page);
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

const Sidebar: React.FC<SidebarProps> = ({ currentPage, navigate }) => {
    return (
        <aside className="w-64 h-full bg-gradient-to-b from-purple-800 to-indigo-900 shadow-lg text-white hidden md:flex flex-col">
            <div className="px-6 py-4 border-b border-purple-700">
                <h1 className="text-2xl font-bold flex items-center">
                    <i className="fas fa-cogs mr-3"></i>
                    Service Hub Pro
                </h1>
            </div>
            <nav className="flex-1 px-4 py-4">
                <ul className="space-y-2">
                    <NavLink page="entry" currentPage={currentPage} navigate={navigate} icon="fas fa-clipboard-list" label="Service Entry" />
                    <NavLink page="data" currentPage={currentPage} navigate={navigate} icon="fas fa-database" label="Service Data" />
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;
