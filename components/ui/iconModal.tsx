"use client";

import { useState, type ReactNode } from "react";
import { Button } from '@/components/ui/button';
import Modal from "@/components/ui/Modal";

interface IconModalProps {
    icon: ReactNode;
    label: string;
    children: ReactNode;
}

const IconModal: React.FC<IconModalProps> = ({ icon, label, children }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            {/* Small Card with Icon & Label */}
            <Button
                variant="default"
                className="w-20 h-20 flex flex-col items-center justify-center"
                onClick={() => setIsModalOpen(true)}
                type="button"
            >
                {icon}
                <p className="text-xs mt-1">{label}</p>
            </Button>

            {/* Full-Screen Modal */}
            {isModalOpen && (
                <Modal onClose={() => setIsModalOpen(false)}>
                    <p className="text-sm font-semibold flex flex-col items-center justify-center">{label}</p>
                    <div className="flex-1 mt-6">{children}</div>
                </Modal>
            )}
        </>
    );
};

export default IconModal;