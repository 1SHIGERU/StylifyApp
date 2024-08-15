import React, { useEffect, useState } from 'react';
import {AuthData} from '../../auth/AuthWrapper';
import { useLocation } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import axios from 'axios'
import Loading from '../Loading';

const stripePromise = loadStripe('pk_test_51PAvWC1PDN4klyO5gI9rRb7hQLFi1nqNazo5L5K2pmbRu6SDCwCLe4bo9Udj5uPqSXrA6mNeMDEfP75sfPLHaX05006ffHvcb3');

const Payment = () => {

    const { user } = AuthData();
    const location = useLocation();
    const { product } = location.state || {};

    useEffect(() => {
        const createCheckoutSession = async () => {
          try {
            const response = await axios.post('http://localhost:13000/payment/', {
              product
            });
            const session = response.data;
            const stripe = await stripePromise;
            const { error } = await stripe.redirectToCheckout({
                sessionId: session.id,
            });

            if (error) {
                console.error('Error:', error);
            }
        } catch (error) {
                console.error('Error:', error);
        }
    }
    createCheckoutSession();
    }
    , [product]);
     
    return (
        <>
            <Loading />
        </>
    )
}
export default Payment;
