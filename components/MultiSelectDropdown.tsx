import React, { useState, useRef, useEffect } from 'react';

interface MultiSelectDropdownProps {
    options: string[];
    selectedOptions: string[];
    onChange: (selected: string[]) => void;
    placeholder?: string;
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
    options,
    selectedOptions,
    onChange,
    placeholder = "Select services..."
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    const handleOptionToggle = (option: string) => {
        const newSelectedOptions = selectedOptions.includes(option)
            ? selectedOptions.filter(o => o !== option)
            : [...selectedOptions, option];
        onChange(newSelectedOptions);
    };

    const getButtonText = () => {
        if (selectedOptions.length === 0) {
            return placeholder;
        }
        if (selectedOptions.length === 1) {
            return selectedOptions[0];
        }
        return `${selectedOptions.length} services selected`;
    };

    return (
        <div className="relative w-full" ref={wrapperRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-left focus:outline-none focus:ring-purple-500 focus:border-purple-500 flex justify-between items-center"
            >
                <span className="truncate">{getButtonText()}</span>
                <i className={`fas fa-chevron-down transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}></i>
            </button>
            {isOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg border rounded-md max-h-60 overflow-y-auto">
                    <ul className="py-1">
                        {options.map(option => (
                            <li
                                key={option}
                                className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                                onClick={() => handleOptionToggle(option)}
                            >
                                <label className="flex items-center space-x-3 w-full cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={selectedOptions.includes(option)}
                                        readOnly
                                        className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 cursor-pointer"
                                    />
                                    <span>{option}</span>
                                </label>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default MultiSelectDropdown;
