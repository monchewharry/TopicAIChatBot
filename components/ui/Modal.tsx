import React from "react";

interface ModalProps {
    onClose: () => void;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ onClose, children }) => {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-background w-11/12 md:w-3/4 lg:w-1/2 max-h-[90vh] p-6 flex flex-col shadow-lg rounded-lg overflow-y-auto">
                {/* Flex container for close button and content */}
                <div className="flex justify-end">
                    <button
                        className="text-gray-600 text-2xl hover:text-gray-800"
                        onClick={onClose}
                        type="button"
                    >
                        ✕
                    </button>
                </div>

                {/* modal Content */}
                <div className="mt-2">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;