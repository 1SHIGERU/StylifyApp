import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { AuthData } from "../../auth/AuthWrapper";
import { toast } from 'react-toastify';

const Orders = () => {
  const [transactions, setTransactions] = useState([]);
  const [view, setView] = useState('bought');
  const { user } = AuthData();

  useEffect(() => {
    const fetchAddress = async () => {
      if (user && user.userID) {
        try {
          const res = await axios.get(`${process.env.REACT_APP_API_URL}users/ifAddressSet/${user.userID}`);
        } catch (error) {
          if (error.response && error.response.status === 404) {
            toast.warn('Please provide your shipping address on your profile page.',{position: "top-center"});
          } else {
            console.error('Error fetching address:', error);
          }
        }
      }
    };

    fetchAddress();
  }, [user]);

  const fetchOfferDetails = async (offerId) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}offers/${offerId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching offer details:', error);
      return null;
    }
  }

  const changeStatus = async (transactionID, status) => {
    try {
      console.log(transactionID, status);
      const response = await axios.put(`${process.env.REACT_APP_API_URL}transactions/changeStatus`, {
        transactionID,
        status
      });
      fetchTransactions();
    } catch (error) {
      console.error('Error changing transaction status:', error);
    }
    window.location.reload();
  };

  const closeTransaction = async (transactionID) => {
    try {
      const response = await axios.put(`${process.env.REACT_APP_API_URL}transactions/close`, {
        transactionID,
        isClosed: true
      });
      fetchTransactions();
    } catch (error) {
      console.error('Error closing transaction:', error);
    }
    changeStatus(transactionID, 'received');
    window.location.reload();
  };

  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [postcode, setPostcode] = useState('');
  const [country, setCountry] = useState('');

  const fetchTransactions = async (type) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}transactions/orders/${user.userID}`);
      const data = response.data;
      setStreet(data[0].Buyer.Address.street);
      setCity(data[0].Buyer.Address.city);
      setPostcode(data[0].Buyer.Address.postcode);
      setCountry(data[0].Buyer.Address.country);
      const transactionsWithDetails = await Promise.all(data.map(async (transaction) => {
      const offerDetails = await fetchOfferDetails(transaction.offer);
        return {
          ...transaction,
          Offer: offerDetails,
        };
      }));
      
      if (type === 'bought') {
        setTransactions(transactionsWithDetails.filter(transaction => transaction.buyer === user.userID));
      } else if (type === 'sold') {
        setTransactions(transactionsWithDetails.filter(transaction => transaction.seller === user.userID));
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  }

  useEffect(() => {
    fetchTransactions(view);
  }, [view]);

  return (
    <div className="flex">
      <aside className="w-1/4 p-6 bg-white pt-16">
        <h2 className="text-2xl font-bold mb-6">On-going orders</h2>
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
          <h1 className="text-3xl text-gray-700 font-bold mb-4">Send these items as soon as possible!</h1>
         </>
        )}
        {view === 'bought' && (
         <>
          <h1 className="text-3xl text-gray-700 font-bold mb-4">If you have received the item, click the appropriate button </h1>
         </>
        )}

        <div className="space-y-4">  
          {transactions.map(transaction => (
            <div className="flex transition duration-200 hover:scale-105 items-center bg-white border border-gray-200 shadow-md rounded-lg p-4 hover:shadow-lg transition">
              <img src={transaction.Offer.OfferImages?.[0]?.imageUrl || 'https://pagedone.io/asset/uploads/1701167607.png'} alt="Product" class="w-20 h-20 rounded-lg object-cover" />
              <div className="ml-4 flex-1">
                <p className="text-gray-600 mb-2">{new Date(transaction.createdAt).toLocaleDateString()}</p>
                <h3 className="text-lg font-semibold text-gray-800 truncate">{transaction.Offer.title}</h3>
                <p className="text-gray-600">{transaction.amount} zł</p>
                <p className="text-sm text-gray-400">{transaction.status}</p>
              </div>
              {view === 'sold' && (
               <>
                <div className="flex mr-8 p-2">  
                  <div className='px-2 text-gray-600 w-auto'>
                  <p className="font-medium text-sm text-black ">Shipping address:</p>
                    <span className=''>{street}</span> <br />
                    <span className=''>{postcode} {city}, </span> 
                    <span className=''>{country}</span>
                  </div>
                </div>
                <div className="text-gray-400">
                  <button onClick={() => changeStatus(transaction.transactionID, 'shipped')}
                    className="ml-auto rounded-md relative mt-4 flex h-[50px] w-40 items-center justify-center border-2 border-orange-500 overflow-hidden bg-white text-orange-400 shadow-2xl transition-all before:absolute before:h-0 before:w-0 before:rounded-full before:bg-orange-600 before:duration-500 before:ease-out hover:shadow-orange-600 hover:before:h-56 hover:before:w-56">
                      <span class="relative z-11">package sent</span>
                  </button>
                </div>
               </>
              )}
              {view === 'bought' && (
               <>            
                <div className="text-gray-400">
                  <button onClick={() => closeTransaction(transaction.transactionID)}
                    className="ml-auto rounded-md relative mt-4 flex h-[50px] w-40 items-center justify-center border-2 border-orange-500 overflow-hidden bg-white text-orange-400 shadow-2xl transition-all before:absolute before:h-0 before:w-0 before:rounded-full before:bg-orange-600 before:duration-500 before:ease-out hover:shadow-orange-600 hover:before:h-56 hover:before:w-56">
                      <span class="relative z-11">received</span>
                  </button>
                </div>
               </>
              )}
              
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Orders;
