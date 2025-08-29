import React, { useState, useEffect } from 'react';
import { Button, Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import Settings from './Settings';

const WelcomeModal = () => {
    const [language, setLanguage] = useState('en');
    const [isOpen, setIsOpen] = useState(true);

    useEffect(() => {
        const storedLanguage = localStorage.getItem('language_code') || 'en';
        setLanguage(storedLanguage);
    }, []);

    const togglePanel = () => {
        setIsOpen(false);
    };

    return (
        <>
            <Dialog open={isOpen} as="div" className="relative z-10 focus:outline-none" onClose={togglePanel}>
                <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity">
                    <div className="flex h-128 mt-32 justify-center p-4">
                        <DialogPanel
                        transition
                        className="w-full dark:bg-[#2d2d30] max-w-md rounded-xl bg-white p-6 backdrop-blur-2xl duration-300 ease-out data-[closed]:transform-[scale(95%)] data-[closed]:opacity-0"
                        >
                        <DialogTitle as="h3" className="text-orange-500 font-medium">
                            Information
                        </DialogTitle>
                        <p className="mt-2 text-sm dark:text-gray-300 text-gray-700">
                            Based on your localization, we have set the language to <b>{language}</b>. You can change it in the settings   
                        </p>
                        <div className="mt-4">
                            <button onClick={togglePanel}  className="flex relative mt-4 h-[35px] w-32 items-center justify-center overflow-hidden bg-gray-800 text-white shadow-2xl transition-all before:absolute before:h-0 before:w-0 before:rounded-full before:bg-orange-600 before:duration-500 before:ease-out hover:shadow-orange-600 hover:before:h-56 hover:before:w-56">
                                <span class="relative z-10">Got it, thanks</span>
                            </button>
                        </div>
                        </DialogPanel>
                    </div>
                </div>
            </Dialog>
        </>
    );
};

export default WelcomeModal;
