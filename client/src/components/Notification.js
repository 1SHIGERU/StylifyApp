import React from 'react';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { Transition } from '@headlessui/react';
import { formatDistanceToNow } from 'date-fns';
import {AuthData} from '../auth/AuthWrapper';
import Stars from './ratingSystem/Stars';
import Img from '../assets/avatar.jpg';

const Notification = () => {

    const { user } = AuthData();

    const [notifications, setNotifications] = useState([]);
    const [isBouncing, setIsBouncing] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

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

    const handleNotificationClick = (notification) => { 
        if (notification.type === 'rate') {
            setIsModalOpen(true);
        }        
        setRead(notification.notificationID);
        fetchTransactions(notification.transactionID);
    };

    const [owner, setOwner] = useState({});

    const fetchOwner = async (ownerId) => {
        try {
            const response = await axios.get(`http://localhost:13000/users/user/${ownerId}`);
            setOwner(response.data);
            console.log(owner);
        } catch (error) {
            console.error('Error fetching owner:', error);
        }
    }

    const fetchOfferDetails = async (offerId) => {
        try {
          const response = await axios.get(`http://localhost:13000/offers/${offerId}`);
          fetchOwner(response.data.ownerID);
          return response.data;

        } catch (error) {
          console.error('Error fetching offer details:', error);
          return null;
        }
    }

    const [itemData, setItemData] = useState({});

    const fetchTransactions = async (id) => {
        try {
            const response = await axios.get(`http://localhost:13000/transactions/getTransaction/${id}`);
            const data = response.data;
            const transactionWithDetails = await fetchOfferDetails(data.offer);
            setItemData(transactionWithDetails); 

        } catch (error) {
            console.error('Error fetching transactions:', error);
        }
    }
            

    const Modal = () => (
        <div className={`fixed inset-0 flex items-center justify-center z-50 ${isModalOpen ? 'block' : 'hidden'}`}>
            <div
            className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none"
          >
            <div className="relative w-3/4 my-6 mx-auto max-w-4xl">
              <div className="border-0 rounded-lg shadow-lg relative p-6 flex flex-col w-full bg-white outline-none focus:outline-none">
                <div className="flex items-start justify-between p-2 border-b border-solid border-blueGray-200 rounded-t">
                  <h3 className="text-3xl font-semibold">
                    Rate the seller 
                  </h3>
          
                  <button
                    className="p-1 ml-auto bg-transparent border-0 text-black opacity-50 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                    onClick={closeModal}>
                    X
                  </button>
                  
                </div>
                <div className="flex">
                  <div className="w-1/3 h-96 py-4 px-4 relative group">
                    <h3 className="product text-very-dark-blue  text-2xl py-2">
                      refers to:
                    </h3>
                    {itemData?.OfferImages?.[0] ? (
                        <img
                        src={itemData.OfferImages[0].imageUrl}
                        alt="product"
                        className="w-3/4 rounded-xl w-3/4 object-cover"
                        />
                    ) : (
                        <p>No image available</p>
                    )}
                    
                  </div>
                  <div className="w-2/3 p-6 ml-8 overflow-y-auto max-h-96 border-l border-blueGray-200 flex flex-col items-center justify-center">
                    
                    <div className="flex items-center space-x-4 cursor-pointer pt-2">
                        <img src={owner.avatarURL || Img} alt="avatar" className="w-24 h-24 rounded-full" />
                        <div className="text-black text-lg">{owner.username}</div>
                    </div>
                    <div className="w-full mt-4 flex flex-col items-center">
                        <Stars />
                    </div>
                    <textarea
                        placeholder="Leave a comment, if you want"
                        maxLength={200}
                        rows="4"
                        className="w-full rounded-md px-4 border text-sm pt-2.5 outline-[#FFA500] mt-4"
                    ></textarea>
                    <button
                        className="bg-orange-500 text-white px-4 py-2 rounded-md mt-4"
                    >
                        Rate
                    </button>
                    </div>
                </div>
              </div>
            </div>
          </div>
          <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
        </div>
    );

    const closeModal = () => setIsModalOpen(false);

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
                                onClick={() => handleNotificationClick(notification)}
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
                                        e.stopPropagation();
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
                
            {isModalOpen && <Modal />}
    </>
    );
};

export default Notification;