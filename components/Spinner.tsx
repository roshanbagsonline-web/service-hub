
import React from 'react';

interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg';
}

const Spinner: React.FC<SpinnerProps> = ({ size = 'md' }) => {
    const sizeClasses = {
        sm: 'h-5 w-5 border-2',
        md: 'h-8 w-8 border-4',
        lg: 'h-16 w-16 border-8',
    };

    return (
        <div className={`animate-spin rounded-full ${sizeClasses[size]} border-purple-500 border-t-transparent`}></div>
    );
};

export default Spinner;
