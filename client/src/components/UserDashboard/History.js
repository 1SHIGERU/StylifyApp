import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { AuthData } from "../../auth/AuthWrapper";
import Loading from '../Loading'

const History = () => {

    const [transactions, setTransactions] = useState([]);
    const [view, setView] = useState('bought');
    const { user } = AuthData();
    const [loading, setLoading] = useState(true);

    const fetchOfferDetails = async (offerId) => {
        try {
          const response = await axios.get(`${process.env.REACT_APP_API_URL}offers/${offerId}`);
          return response.data;
        } catch (error) {
          console.error('Error fetching offer details:', error);
          return null;
        }
    }

    const fetchTransactions = async (type) => {
        try {
          const response = await axios.get(`${process.env.REACT_APP_API_URL}transactions/history/${user.userID}`);
          const data = response.data.transactions;
          const transactionsWithDetails = await Promise.all(data.map(async (transaction) => {
            const offerDetails = await fetchOfferDetails(transaction.offer);
            return {
              ...transaction,
              Offer: offerDetails,
            };      
          }));   
          console.log(transactionsWithDetails);       
          
          if (type === 'bought') {
            setTransactions(transactionsWithDetails.filter(transaction => transaction.buyer === user.userID));
          } else if (type === 'sold') {
            setTransactions(transactionsWithDetails.filter(transaction => transaction.seller === user.userID));
          }
        } catch (error) {
          console.error('Error fetching transactions:', error);
        }
        setLoading(false);
    }

    useEffect(() => {
        fetchTransactions(view);
      }, [view]);

      if(loading){
        return <Loading />
      }

      return (
        <div className="flex">
          <aside className="w-1/4 p-6 bg-white pt-16">
            <h2 className="text-2xl font-bold mb-6">Orders history</h2>
            <ul>
              <li className="mb-4">
                <a onClick={() => setView('bought')} className={`flex text-lg px-4 transition cursor-pointer duration-200 text-gray-600 ${view === 'bought' ? 'text-orange-500 font-bold border-r-2 border-orange-500' : 'hover:scale-105'}`}>Bought</a>
              </li>
              <li>
                <a onClick={() => setView('sold')} className={`flex text-lg px-4 transition duration-200 cursor-pointer text-gray-600 ${view === 'sold' ? "text-orange-500 font-bold border-r-2 border-orange-500" : "hover:scale-105"}`}>Sold</a>
              </li>
            </ul>
          </aside>
    
    
          <main className="w-3/4 p-6">
            {view === 'sold' && (
             <>
              <h1 className="text-3xl text-gray-700 font-bold mb-4">These items have been delivered</h1>
             </>
            )}
            {view === 'bought' && (
             <>
              <h1 className="text-3xl text-gray-700 font-bold mb-4">You picked up these items</h1>
             </>
            )}
    
            <div className="space-y-4 2xl:mr-96 xl:mr-64">  
              {transactions.map(transaction => (
                <div className="flex transition duration-200 hover:scale-105 items-center bg-white border border-gray-200 shadow-md rounded-lg p-4 hover:shadow-lg transition">
                  <img src={transaction.Offer.OfferImages?.[0]?.imageUrl || 'https://pagedone.io/asset/uploads/1701167607.png'} alt="Product" class="w-20 h-20 rounded-lg object-cover" />
                  <div className="ml-4 flex-1">
                    <p className="text-gray-600 mb-2">{new Date(transaction.createdAt).toLocaleDateString()}</p>
                    <h3 className="text-lg font-semibold text-gray-800 truncate">{transaction.Offer.title}</h3>
                    <p className="text-gray-600">{transaction.amount} zł</p>
                    <p className="text-sm text-gray-400">
                      {view === 'bought' ? '' : ''}
                    </p>
                  </div>                 
                </div>
              ))}
            </div>
          </main>
        </div>
      );
};

export default History;