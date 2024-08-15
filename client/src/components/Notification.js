import React from 'react';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { Transition } from '@headlessui/react';
import { formatDistanceToNow } from 'date-fns';
import {AuthData} from '../auth/AuthWrapper';

const Notification = () => {

    const { user } = AuthData();

    const [notifications, setNotifications] = useState([]);
    const [isBouncing, setIsBouncing] = useState(false);

    const fetchNotifications = async () => {
        try {
            const response = await axios.get(`http://localhost:13000/notifications/${user.userID}`);
            const newNotifications = response.data;
            setNotifications(newNotifications);

            const hasUnread = newNotifications.some(notification => !notification.isRead);

            if (hasUnread) {
                setIsBouncing(true);
            } else {
                setIsBouncing(false);
            }

        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    }

    const setRead = async (id) => {
        try {
            const response = await axios.put('http://localhost:13000/notifications/set-read', { id });
            fetchNotifications();
        } catch (error) {
            console.error('Error setting notification as read:', error);
        }
        
    }

    const deleteNotification = async (id) => {
        try {
            const response = await axios.delete(`http://localhost:13000/notifications/${id}`);
            fetchNotifications();
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    }

    const [isOpen, setIsOpen] = useState(false);

    const togglePanel = () => {
      setIsOpen(!isOpen);
    };

    useEffect(() => {
        fetchNotifications();
        const intervalId = setInterval(fetchNotifications, 30000);
        return () => clearInterval(intervalId);
    }
    , []);

  return (
    <>
    <div className="relative">
        <svg onClick={togglePanel} className={`${isBouncing?'animate-bounce' : ''} w-6 h-6 text-gray-800 dark:text-white`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5.365V3m0 2.365a5.338 5.338 0 0 1 5.133 5.368v1.8c0 2.386 1.867 2.982 1.867 4.175 0 .593 0 1.292-.538 1.292H5.538C5 18 5 17.301 5 16.708c0-1.193 1.867-1.789 1.867-4.175v-1.8A5.338 5.338 0 0 1 12 5.365ZM8.733 18c.094.852.306 1.54.944 2.112a3.48 3.48 0 0 0 4.646 0c.638-.572 1.236-1.26 1.33-2.112h-6.92Z"/>
        </svg>
    </div>

     {/* Przyciemnienie reszty ekranu */}
     {isOpen && (
        <div
          onClick={togglePanel}
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-200 z-40"
        ></div>
      )}

      <Transition
        show={isOpen}
        enter="transform transition-transform duration-200"
        enterFrom="translate-x-full"
        enterTo="translate-x-0"
        leave="transform transition-transform duration-200"
        leaveFrom="translate-x-0"
        leaveTo="translate-x-full"
        className="fixed right-0 top-0 h-full w-1/4 bg-white shadow-lg z-50"
      >
            <div className="p-6">
                    <h2 className="text-2xl border-b font-semibold mb-4">Notifications</h2>
                    {notifications.length === 0 && <div className="flex h-64 flex-col bg-white">
                                <div className="flex flex-1 items-center justify-center">
                                    <div className="mx-auto max-w-xl px-4 text-center">
                                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                                            You don't have any notifications at the moment.
                                        </h1>
                                        <p className="mt-4 text-gray-500">
                                            Go to <a href='/market' className="font-bold text-[#8B4513]">market</a> to find some offers you like.
                                        </p>                
                                    </div>
                                </div>
                        </div>}
                    <ul>
                        {notifications.map(notification => (
                            <li
                                key={notification.notificationID}
                                onClick={() => setRead(notification.notificationID)}
                                className={`p-4 rounded-xl mb-2 border-b border-gray-200 cursor-pointer flex justify-between items-center ${
                                    notification.isRead
                                        ? 'bg-gray-100 text-gray-700'
                                        : 'bg-orange-100 text-orange-800'
                                }`}
                            >
                                <span>{notification.message}</span>
                                <span className="text-sm text-gray-400">
                                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                </span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevent click event from bubbling to the parent element
                                        deleteNotification(notification.notificationID);
                                    }}
                                    className="text-gray-400 hover:text-gray-600">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
      </Transition> 

    </>
    );
};

export default Notification;