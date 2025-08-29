import React from 'react';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { Transition, Switch } from '@headlessui/react';
import {AuthData} from '../auth/AuthWrapper';
import { useNavigate } from 'react-router-dom';

const Settings = () => {

    const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

    const [isOpen, setIsOpen] = useState(false);

    const togglePanel = () => {
        setIsOpen(!isOpen);
      };

    useEffect(() => {
        if (theme === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
        localStorage.setItem("theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(theme === "light" ? "dark" : "light");
      };

    return (
        <>
          <div className="relative">
            <svg onClick={togglePanel} class="w-6 h-6 dark:text-[#EAEAEA] text-gray-800" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13v-2a1 1 0 0 0-1-1h-.757l-.707-1.707.535-.536a1 1 0 0 0 0-1.414l-1.414-1.414a1 1 0 0 0-1.414 0l-.536.535L14 4.757V4a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v.757l-1.707.707-.536-.535a1 1 0 0 0-1.414 0L4.929 6.343a1 1 0 0 0 0 1.414l.536.536L4.757 10H4a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h.757l.707 1.707-.535.536a1 1 0 0 0 0 1.414l1.414 1.414a1 1 0 0 0 1.414 0l.536-.535 1.707.707V20a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-.757l1.707-.708.536.536a1 1 0 0 0 1.414 0l1.414-1.414a1 1 0 0 0 0-1.414l-.535-.536.707-1.707H20a1 1 0 0 0 1-1Z"/>
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/>
            </svg>
          </div>  

        {isOpen && (
            <div
            onClick={togglePanel}
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-200 z-40">       
            </div>
        )}

        <Transition
                show={isOpen}
                enter="transform transition-transform duration-200"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition-transform duration-200"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
                className="fixed right-0 top-0 h-full w-1/4 bg-white dark:bg-[#1E1E1E] shadow-lg z-50"
        >


        <div className="p-6 items-center justify-center">
            <h2 className="text-2xl dark:text-[#F6C177] border-b font-semibold mb-4">Page settings</h2> 
            <div className="flex h-32 flex-col">
                <div className="flex flex-1 items-center justify-center">
                    <div className="mx-auto border-b pb-4 max-w-xl px-4 text-center">
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-[#EAEAEA] sm:text-4xl">
                            Adjust your theme.
                        </h1>
                        <button
                            onClick={toggleTheme}
                            className="p-2 mt-4 rounded-lg bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white transition"
                            >
                            {theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
                        </button>                     
                    </div>
                   
                </div>
            </div>
            
        </div>
        </Transition>
        </>
    )
}

export default Settings;