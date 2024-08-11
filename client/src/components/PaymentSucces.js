import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { AuthData } from '../auth/AuthWrapper';

const PaymentSucces = () => {

    const navigate = useNavigate();
    const location = useLocation();
    const [session, setSession] = useState(null);
    const { user } = AuthData();
    const [transactionCreated, setTransactionCreated] = useState(false);

    const createTransaction = async (sessionData) => {
        try {
            if (!transactionCreated) {
                const response = await axios.post('http://localhost:13000/transactions/create', {
                    seller: sessionData.session.metadata.seller_id,
                    buyer: user.userID,
                    offer: sessionData.session.metadata.offer_id,
                    amount: sessionData.session.amount_total / 100
                });
                console.log('Transaction created:', response.data);
                setTransactionCreated(true);
                
                await axios.post('http://localhost:13000/offers/deactivate', {
                    offerId: sessionData.session.metadata.offer_id
                });
                console.log('Offer deactivated');
            }
        } catch (error) {
            console.error('Error creating transaction or deactivating offer:', error);
        }
    }

    useEffect(() => {
        const fetchSessionAndCreateTransaction = async () => {
            const query = new URLSearchParams(location.search);
            const sessionId = query.get('session_id');
        
            if (sessionId) {
                try {
                    const response = await axios.get(`http://localhost:13000/payment/checkout/${sessionId}`);
                    console.log('Session details:', response.data);
                    setSession(response.data);
                    await createTransaction(response.data);
                } catch (error) {
                    console.error('Error fetching session details:', error);
                    navigate('/payment/cancel');
                }
            }
        };

        fetchSessionAndCreateTransaction();
    }, [location.search, navigate]);


  return (
    <>
      {session ? (
        <div class="px-4 pt-32 mx-auto min-h-screen ">
            <div class="max-w-lg sm:text-center sm:mx-auto">
            <a href="/" aria-label="Go Home" title="Logo" class="inline-block mb-4">
                <div class="flex items-center justify-center w-12 h-12 rounded-full bg-green-100">
                <svg class="w-10 h-10 text-deep-purple-accent-400" stroke="currentColor" viewBox="0 0 52 52">
                    <polygon stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none" points="29 13 14 29 25 29 23 39 38 23 27 23"></polygon>
                </svg>
                </div>
            </a>
            <h2 class="mb-6 font-sans text-3xl font-bold tracking-normal text-gray-900 sm:text-4xl sm:leading-none">
                <span class="relative inline-block">
                <svg viewBox="0 0 52 24" fill="currentColor" class="absolute top-0 left-0 z-0 hidden w-32 -mt-8 -ml-20 text-blue-gray-100 lg:w-32 lg:-ml-32 lg:-mt-10 sm:block">
                    <defs>
                    <pattern id="6b0188f3-b7a1-4e9b-b95e-cad916bb3042" x="0" y="0" width=".135" height=".30">
                        <circle cx="1" cy="1" r=".7"></circle>
                    </pattern>
                    </defs>
                    <rect fill="url(#6b0188f3-b7a1-4e9b-b95e-cad916bb3042)" width="52" height="24"></rect>
                </svg>
                <span class="relative bg-white">Thank you <span class="text-orange-600">{user.firstName}</span>!
                </span>
                </span>
                <br/>
                your order was placed successfully.
            </h2>
            <p class="text-base text-gray-700 md:text-lg">
                You have ordered <span class="font-semibold text-orange-900">{session.lineItems[0].description}</span> for <span class="font-semibold text-orange-900">${session.lineItems[0].amount_total / 100}</span>.
            </p>
            <hr class="my-8 border-gray-300" />
            <div class="flex items-center mb-3 sm:justify-center">
                <a href="/" className=" inline-block text-[#8B4513] border-b-2 border-[#8B4513] px-5 py-3 text-md font-medium focus:outline-none focus:ring">
                    Go Back Home
                </a>
                <a href="/account" className=" ml-4 bg-[#8B4513] inline-block rounded px-5 py-3 text-md font-medium text-white focus:outline-none focus:ring">
                    Your account
                </a>
            </div>
            <p class="max-w-xs text-xs text-gray-600 sm:text-sm sm:max-w-sm sm:mx-auto">
                Go to home page or check your order details.
            </p>
            </div>
        </div>
      ) : (
        <div className='pt-64 text-4xl ml-64 items-center min-h-screen'>You are not supposed to be here...</div>
      )}
    </>
  );
};

export default PaymentSucces;