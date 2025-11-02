
import React from 'react';

interface ImagePreviewModalProps {
    imageUrl: string;
    onClose: () => void;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ imageUrl, onClose }) => {
    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4"
            onClick={onClose}
        >
            <div 
                className="relative bg-white p-4 rounded-lg max-w-3xl max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <img src={imageUrl} alt="Service product" className="w-full h-full object-contain"/>
                <button 
                    onClick={onClose}
                    className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full w-8 h-8 flex items-center justify-center hover:bg-opacity-75"
                    aria-label="Close image preview"
                >
                    <i className="fas fa-times"></i>
                </button>
            </div>
        </div>
    );
};

export default ImagePreviewModal;
