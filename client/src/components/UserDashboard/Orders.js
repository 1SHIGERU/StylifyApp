import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { AuthData } from "../../auth/AuthWrapper";

const Orders = () => {
  const [transactions, setTransactions] = useState([]);
  const [view, setView] = useState('bought');
  const { user } = AuthData();

  const fetchOfferDetails = async (offerId) => {
    try {
      const response = await axios.get(`http://localhost:13000/offers/${offerId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching offer details:', error);
      return null;
    }
  }

  const changeStatus = async (transactionID, status) => {
    try {
      console.log(transactionID, status);
      const response = await axios.put('http://localhost:13000/transactions/changeStatus', {
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
      const response = await axios.put('http://localhost:13000/transactions/close', {
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
      const response = await axios.get(`http://localhost:13000/transactions/orders/${user.userID}`);
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
    <>
        <h1 className='text-4xl font-bold mb-4'>Your orders</h1>
        <h1 className='text-xl font-bold mb-2 text-orange-700'>{transactions.length} orders</h1>
        <hr />
      <section className="py-12 relative">
        <div className="w-full max-w-7xl px-4 md:px-5 lg-6 mx-auto">
          <div className="flex justify-between mb-6">
            <button
              onClick={() => setView('bought')}
              className={`rounded-full py-3 px-7 font-semibold text-sm leading-7 ${
                view === 'bought' ? 'bg-orange-600 text-white' : 'border-2 border-orange-600 text-orange-600'
              } shadow-sm transition-all duration-300 hover:shadow-[0_3px_10px_rgb(0,0,0,0.4)]`}
            >
              Bought
            </button>
            <button
              onClick={() => setView('sold')}
              className={`rounded-full py-3 px-7 font-semibold text-sm leading-7 ${
                view === 'sold' ? 'bg-orange-600 text-white' : 'border-2 border-orange-600 text-orange-600'
              } shadow-sm transition-all duration-500 hover:shadow-[0_3px_10px_rgb(0,0,0,0.4)]`}
            >
              Sold
            </button>
          </div>

          {transactions.map(transaction => (
            <div key={transaction.transactionID} className="main-box mb-4 border border-gray-200 rounded-xl pt-6 max-w-xl max-lg:mx-auto lg:max-w-full">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between px-6 pb-6 border-b border-gray-200">
                <div className="data">
                  <p className="font-semibold text-base leading-7 text-black">
                    Order ID: <span className="text-orange-600 font-medium">#{transaction.transactionID}</span>
                  </p>
                  <p className="font-semibold text-base leading-7 text-black mt-4">
                    Order Payment: <span className="text-gray-400 font-medium">{new Date(transaction.createdDate).toLocaleDateString()}</span>
                  </p>
                </div>
                {view === 'bought' ? (
                  <button
                    className="rounded-full py-3 px-7 font-semibold text-sm leading-7 text-white bg-orange-600 max-lg:mt-5 shadow-sm shadow-transparent transition-all duration-500 hover:shadow-indigo-400"
                    onClick={() => closeTransaction(transaction.transactionID)}
                  >
                    Mark as Received
                  </button>
                ) : (
                  <button
                    className="rounded-full py-3 px-7 font-semibold text-sm leading-7 text-white bg-orange-600 max-lg:mt-5 shadow-sm shadow-transparent transition-all duration-500 hover:shadow-indigo-400"
                    onClick={() => changeStatus(transaction.transactionID, 'shipped')}
                  >
                    Mark as Shipped
                  </button>
                )}
              </div>
              <div className="w-full px-3 min-[400px]:px-6">
                <div className="flex flex-col lg:flex-row items-center py-6 border-b border-gray-200 gap-6 w-full">
                  <div className="img-box max-lg:w-full">
                    <img
                      src={transaction.Offer.OfferImages?.[0]?.imageUrl || 'https://pagedone.io/asset/uploads/1701167607.png'}
                      alt={transaction.Offer.title}
                      className="aspect-square w-full lg:max-w-[140px]"
                    />
                  </div>
                  <div className="flex flex-row items-center w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-2 w-full">
                      <div className="flex items-center">
                        <div>
                          <h2 className="font-semibold text-2xl leading-8 text-black mb-3">
                            {transaction.Offer.title}
                          </h2>
                          <p className="font-normal text-lg leading-8 text-gray-500 mb-3">
                            By: {transaction.Seller.username}
                          </p>
                          <div className="flex items-center">
                            <p className="font-medium text-base leading-7 text-black pr-4 mr-4 border-r border-gray-200">
                              Category: <span className="text-orange-600">{transaction.Offer.category}</span>
                            </p>

                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-5">
                        <div className="col-span-5 lg:col-span-1 flex items-center max-lg:mt-3">
                          <div className="flex gap-3 lg:block">
                            <p className="font-medium text-sm leading-7 text-black">Price</p>
                            <p className="lg:mt-4 font-medium text-xl leading-7 text-orange-600">${transaction.amount}</p>
                          </div>                      
                        </div>
                        {view === 'bought' ? (
                                <>
                                </>
                              ) : (
                                <div className="address-box flex ml-4 p-2">
                                  <p className="font-medium text-sm text-black mt-6">Shipping address:</p>
                                  <div className='ml-4 text-gray-600 w-auto'>
                                    <span className=''>{street}</span> <br />
                                    <span className=''>{postcode} {city}, </span> 
                                    <span className=''>{country}</span>

                                  </div>
                                </div>
                            )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default Orders;
