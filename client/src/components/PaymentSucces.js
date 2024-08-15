import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { AuthData } from '../auth/AuthWrapper';
import Loading from '../components/Loading'; // Zakładam, że masz komponent Loading

const PaymentSuccess = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [session, setSession] = useState(null);
    const { user } = AuthData();
    const [transactionCreated, setTransactionCreated] = useState(false);
    const [loading, setLoading] = useState(true);

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
                setLoading(false);
            }
        } catch (error) {
            console.error('Error creating transaction or deactivating offer:', error);
            setLoading(false); // Ensure loading is set to false in case of error
        }
    };

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
            } else {
                setLoading(false); // Set loading to false if sessionId is not present
            }
        };

        fetchSessionAndCreateTransaction();
    }, [location.search, navigate]);

    if (loading) {
        return <Loading />; // Display loading spinner or message
    }

    return (
        <>
            {session ? (
                <div className="px-4 pt-32 mx-auto min-h-screen">
                    <div className="max-w-lg sm:text-center sm:mx-auto">
                        <a href="/" aria-label="Go Home" title="Logo" className="inline-block mb-4">
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100">
                                <svg className="w-10 h-10 text-deep-purple-accent-400" stroke="currentColor" viewBox="0 0 52 52">
                                    <polygon strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" points="29 13 14 29 25 29 23 39 38 23 27 23"></polygon>
                                </svg>
                            </div>
                        </a>
                        <h2 className="mb-6 font-sans text-3xl font-bold tracking-normal text-gray-900 sm:text-4xl sm:leading-none">
                            <span className="relative inline-block">
                                <svg viewBox="0 0 52 24" fill="currentColor" className="absolute top-0 left-0 z-0 hidden w-32 -mt-8 -ml-20 text-blue-gray-100 lg:w-32 lg:-ml-32 lg:-mt-10 sm:block">
                                    <defs>
                                        <pattern id="6b0188f3-b7a1-4e9b-b95e-cad916bb3042" x="0" y="0" width=".135" height=".30">
                                            <circle cx="1" cy="1" r=".7"></circle>
                                        </pattern>
                                    </defs>
                                    <rect fill="url(#6b0188f3-b7a1-4e9b-b95e-cad916bb3042)" width="52" height="24"></rect>
                                </svg>
                                <span className="relative bg-white">Thank you <span className="text-orange-600">{user.firstName}</span>!</span>
                            </span>
                            <br />
                            your order was placed successfully.
                        </h2>
                        <p className="text-base text-gray-700 md:text-lg">
                            You have ordered <span className="font-semibold text-orange-900">{session.lineItems[0].description}</span> for <span className="font-semibold text-orange-900">${session.lineItems[0].amount_total / 100}</span>.
                        </p>
                        <hr className="my-8 border-gray-300" />
                        <div className="flex items-center mb-3 sm:justify-center">
                            <a href="/" className="inline-block text-[#8B4513] border-b-2 border-[#8B4513] px-5 py-3 text-md font-medium focus:outline-none focus:ring">
                                Go Back Home
                            </a>
                            <a href="/account" className="ml-4 bg-[#8B4513] inline-block rounded px-5 py-3 text-md font-medium text-white focus:outline-none focus:ring">
                                Your account
                            </a>
                        </div>
                        <p className="max-w-xs text-xs text-gray-600 sm:text-sm sm:max-w-sm sm:mx-auto">
                            Go to home page or check your order details.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="flex flex-1 pt-32 pb-64 items-center justify-center">
                    <div className="mx-auto max-w-xl px-4 text-center">
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                            You are not authorized to view this page.
                        </h1>
                        <p className="mt-4 text-gray-500">
                            Go to your <a href='/account' className="font-bold text-[#8B4513]">account</a>.
                        </p>
                    </div>
                </div>
            )}
        </>
    );
};

export default PaymentSuccess;