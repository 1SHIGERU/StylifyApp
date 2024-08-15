import React, { useEffect, useState } from 'react';
import { AuthData } from "../../auth/AuthWrapper"
import Img from "../../assets/avatar.jpg"
import Favourites from './Favourites';
import ActiveOffers from './ActiveOffers';
import Wallet from './Wallet';
import Orders from './Orders';
import History from './History';
import axios from 'axios';
import { toast } from 'react-toastify';

export const Account = () => {

     const { user } = AuthData();
     const [activeOffers, setActiveOffers] = useState(0);
     const [transactionCounts, setTransactionCounts] = useState({ soldCount: 0, boughtCount: 0 });
     const [transactionSums, setTransactionSums] = useState({ soldSum: 0, boughtSum: 0 });

     const bilans = transactionSums.soldSum - transactionSums.boughtSum;

     const [street, setStreet] = useState('');
     const [city, setCity] = useState('');
     const [postcode, setPostcode] = useState('');
     const [country, setCountry] = useState('');

     const savedTab = localStorage.getItem('activeTab') || 'account';
     const [activeTab, setActiveTab] = useState(savedTab);

     const getAddress = async () => {
          try {
              const res = await axios.get(`http://localhost:13000/users/getAddress/${user.userID}`);
              setStreet(res.data[0].street);
              setCity(res.data[0].city);
              setPostcode(res.data[0].postcode);
              setCountry(res.data[0].country); 
          } catch (err) {              
              console.error(err.message);
          }
        };

        const handleUploadAddress = async (e) => {
          e.preventDefault();
          try {
            await axios.put(`http://localhost:13000/users/updateAddress`, {
              userID: user.userID,
              street,
              city,
              postcode,
              country,
            });
            toast.success('Address updated successfully! 🎉', {position:"top-center"});
          } catch (err) {
            console.error(err.message);
            toast.error('Failed to update address 😢', {position:"top-center"});
          }
        };

     const fetchSum = async () => {
          try {
              const res = await axios.get(`http://localhost:13000/transactions/sumTransactions/${user.userID}`);
              setTransactionSums(res.data);
          } catch (err) {
              console.error(err.message);
          }
        } 

     const fetchTransactions = async () => {
          try {
              const res = await axios.get(`http://localhost:13000/transactions/countTransactions/${user.userID}`);
              setTransactionCounts(res.data);
          } catch (err) {
              console.error(err.message);
          }
        }

     const fetchActiveOffers = async () => {
          try {
              const res = await axios.get(`http://localhost:13000/offers/countOffers/${user.userID}`);
              setActiveOffers(res.data);
          } catch (err) {
              console.error(err.message);
          }
      };

     const renderContent = () => {
          switch (activeTab) {
            case 'account':
              return (
                <div>
                  <div class="flex items-center">
                    <img src={Img} alt="avatar" class="w-32 h-32 rounded-full" />
                    
                    <h1 class="text-2xl font-bold">{user.username}</h1>
                    {/* TUTAJ OPIS UŻYTKOWNIKA (a'la O MNIE) */}
                  </div>
                  <hr class="my-10" />
                  <div class="grid grid-cols-2 gap-x-20">
                    <div>
                      <h2 class="text-2xl font-bold mb-4">Stats</h2>
                      <div class="grid grid-cols-2 gap-4">
                        <div class="col-span-2">
                          <div class="p-4 bg-yellow-200 rounded-xl">
                            <div class="font-bold text-xl text-gray-800 leading-none">Good day, <br />{user.username}</div>
                            <div class="mt-5">                        
                              <button onClick={() => setActiveTab('activeOffers')} type="button" class="inline-flex items-center justify-center py-2 px-3 rounded-xl bg-white text-gray-800 text-sm font-semibold transition">
                                Active offers: <span className='text-orange-600 ml-2'> {activeOffers} </span>
                              </button>
                            </div>
                          </div>
                        </div>
                        <div class="p-4 bg-yellow-100 rounded-xl text-gray-800">
                          <div class="font-bold text-2xl leading-none">{transactionCounts.soldCount}</div>
                          <div class="mt-2">Items sold</div>
                        </div>
                        <div class="p-4 bg-yellow-100 rounded-xl text-gray-800">
                          <div class="font-bold text-2xl leading-none">{transactionCounts.boughtCount}</div>
                          <div class="mt-2">Items bought</div>
                        </div>
                        <div class="col-span-2"> 
                          <div class="p-4 bg-yellow-200 rounded-xl">    
                            <div class="font-bold text-xl mb-4 text-gray-800 leading-none">Bilans finansowy: <span className='text-orange-500'>{bilans} zł </span></div> 
                              <div className='flex'>                    
                                   <div className='w-1/2'>
                                        <h1 className='font-bold'>Earned:</h1>
                                        <h2 className='text-green-500'>+{transactionSums.soldSum}zł</h2>
                                   </div>
                                   <div className='w-1/2'>
                                        <h1 className='font-bold'>Spent:</h1>
                                        <h2 className='text-red-500'>-{transactionSums.boughtSum}zł</h2>
                                   </div>
                              </div>  
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div class="overflow-hidden bg-white rounded-xl">
                    <h3 class="text-3xl font-semibold text-center text-gray-900">Your shipping details</h3>
                      <div class="px-6 sm:p-12">
                          <form action="#" method="POST" class="mt-14">
                              <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
                                  <div>
                                      <label for="" class="text-base font-medium text-gray-900"> Street </label>
                                      <div class="mt-2.5 relative">
                                          <input onChange={(e) => setStreet(e.target.value)} value={street} required minLength={3} maxLength={50} type="text" name="" id="" placeholder="Enter your full street" class="block w-full px-4 py-4 text-black placeholder-gray-500 transition-all duration-200 bg-white border border-gray-200 rounded-md focus:outline-none focus:border-orange-500" />
                                      </div>
                                  </div>

                                  <div>
                                      <label for="" class="text-base font-medium text-gray-900"> City </label>
                                      <div class="mt-2.5 relative">
                                          <input onChange={(e) => setCity(e.target.value)} value={city} pattern="[A-Za-z\s]+" minLength={2} maxLength={50}  required type="text" name="" id="" placeholder="Enter your city" class="block w-full px-4 py-4 text-black placeholder-gray-500 transition-all duration-200 bg-white border border-gray-200 rounded-md focus:outline-none focus:border-orange-500" />
                                      </div>
                                  </div>

                                  <div>
                                      <label for="" class="text-base font-medium text-gray-900"> Postcode </label>
                                      <div class="mt-2.5 relative">
                                          <input onChange={(e) => setPostcode(e.target.value)} value={postcode} title="Please enter a valid postcode (e.g., 12-345)"  required pattern="[0-9]{2}-[0-9]{3}"  type="text" name="" id="" placeholder="Enter your postcode" class="block w-full px-4 py-4 text-black placeholder-gray-500 transition-all duration-200 bg-white border border-gray-200 rounded-md focus:outline-none focus:border-orange-500" />
                                      </div>
                                  </div>

                                  <div>
                                      <label for="" class="text-base font-medium text-gray-900"> Country </label>
                                      <div class="mt-2.5 relative">
                                          <input onChange={(e) => setCountry(e.target.value)} value={country} pattern="[A-Za-z\s]+" minlength="2" maxlength="50" required type="text" name="" id="" placeholder="Enter your country" class="block w-full px-4 py-4 text-black placeholder-gray-500 transition-all duration-200 bg-white border border-gray-200 rounded-md focus:outline-none focus:border-orange-500" />
                                      </div>
                                  </div>
                                  <div class="sm:col-span-2">
                                      <button onClick={handleUploadAddress} class="mt-4 bg-white w-full text-gray-800 font-bold rounded border-b-2 border-green-500 hover:border-green-600 hover:bg-green-500 hover:text-white shadow-md py-2 px-6 inline-flex items-center justify-center">
                                        <span class="mr-2">Apply</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                          <path fill="currentcolor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
                                        </svg>
                                      </button>
                                  </div>
                              </div>
                          </form>
                      </div>
                  </div>
                </div>
              </div>
              );
            case 'favourites':
              return <Favourites/>;
            case 'activeOffers':
              return <ActiveOffers/>;
            case 'wallet':
              return <Wallet />;
            case 'orders':
              return <Orders />;
            case 'history':
              return <History />
          }
        };



        useEffect(() => {
          localStorage.setItem('activeTab', activeTab);
          fetchActiveOffers();
          fetchTransactions();
          fetchSum();
          getAddress();
        }
        , [activeTab]);

        return (
          <div className="relative bg-yellow-50 overflow-hidden max-h-screen">
              <aside class="fixed inset-y-0 left-0 bg-white shadow-md max-h-screen w-54">
               <div class="flex flex-col justify-between h-full">
                    <div class="flex-grow">
                    <div class="px-4 py-6 text-center border-b">
                         <h1 class="text-xl font-bold leading-none"><span class="text-yellow-700">Task Manager</span> App</h1>
                    </div>
                    <div class="p-4">
                         <ul class="space-y-4">
                         <li>
                         <a onClick={() => setActiveTab('account')} className={`cursor-pointer flex items-center font-bold text-sm py-2 px-4 w-full text-left ${
                              activeTab === 'account' ? 'border-b-2 border-orange-500' : 'bg-white hover:bg-yellow-50 text-gray-900'
                         }`}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" className="mr-4" viewBox="0 0 448 512"><path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z"/></svg>
                              Account                            
                         </a>
                         </li>

                         <li>
                         <a onClick={() => setActiveTab('favourites')} className={`cursor-pointer flex items-center  font-bold text-sm py-3 px-4 w-full text-left ${
                              activeTab === 'favourites' ? 'border-b-2 border-orange-500' : 'bg-white hover:bg-yellow-50 text-gray-900'
                         }`}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" className=" mr-4" viewBox="0 0 512 512"><path d="M47.6 300.4L228.3 469.1c7.5 7 17.4 10.9 27.7 10.9s20.2-3.9 27.7-10.9L464.4 300.4c30.4-28.3 47.6-68 47.6-109.5v-5.8c0-69.9-50.5-129.5-119.4-141C347 36.5 300.6 51.4 268 84L256 96 244 84c-32.6-32.6-79-47.5-124.6-39.9C50.5 55.6 0 115.2 0 185.1v5.8c0 41.5 17.2 81.2 47.6 109.5z"/></svg>
                              Favourites
                         </a>
                         </li>

                         <li>
                         <a onClick={() => setActiveTab('activeOffers')} className={`cursor-pointer flex items-center  font-bold text-sm py-3 px-4 w-full text-left ${
                              activeTab === 'activeOffers' ? 'border-b-2 border-orange-500' : 'bg-white hover:bg-yellow-50 text-gray-900'
                         }`}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" className=" mr-4" viewBox="0 0 512 512"><path d="M64 64c0-17.7-14.3-32-32-32S0 46.3 0 64V400c0 44.2 35.8 80 80 80H480c17.7 0 32-14.3 32-32s-14.3-32-32-32H80c-8.8 0-16-7.2-16-16V64zm406.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L320 210.7l-57.4-57.4c-12.5-12.5-32.8-12.5-45.3 0l-112 112c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L240 221.3l57.4 57.4c12.5 12.5 32.8 12.5 45.3 0l128-128z"/></svg>
                              My offers                            
                         </a>
                         </li>

                         <li>
                         <a onClick={() => setActiveTab('wallet')} className={`cursor-pointer flex items-center font-bold text-sm py-3 px-4 w-full text-left ${
                              activeTab === 'wallet' ? 'border-b-2 border-orange-500' : 'bg-white hover:bg-yellow-50 text-gray-900'
                         }`}>
                         <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" className=" mr-4" viewBox="0 0 512 512"><path d="M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V192c0-35.3-28.7-64-64-64H80c-8.8 0-16-7.2-16-16s7.2-16 16-16H448c17.7 0 32-14.3 32-32s-14.3-32-32-32H64zM416 272a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"/></svg> 
                              Wallet
                         </a>
                         </li>

                         <li>
                         <a onClick={() => setActiveTab('orders')} className={`cursor-pointer flex items-center  font-bold text-sm py-3 px-4 w-full text-left ${
                              activeTab === 'orders' ? 'border-b-2 border-orange-500' : 'bg-white hover:bg-yellow-50 text-gray-900'
                         }`}>
                         <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" className=" mr-4" viewBox="0 0 512 512"><path d="M0 96C0 78.3 14.3 64 32 64H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 128 0 113.7 0 96zM0 256c0-17.7 14.3-32 32-32H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H416c17.7 0 32 14.3 32 32z"/></svg> 
                              Orders
                         </a>
                         </li>
                         <li>
                         <a onClick={() => setActiveTab('history')} className={`cursor-pointer flex items-center  font-bold text-sm py-3 px-4 w-full text-left ${
                              activeTab === 'history' ? 'border-b-2 border-orange-500' : 'bg-white hover:bg-yellow-50 text-gray-900'
                         }`}>
                         <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" className=" mr-4" viewBox="0 0 512 512"><path d="M75 75L41 41C25.9 25.9 0 36.6 0 57.9V168c0 13.3 10.7 24 24 24H134.1c21.4 0 32.1-25.9 17-41l-30.8-30.8C155 85.5 203 64 256 64c106 0 192 86 192 192s-86 192-192 192c-40.8 0-78.6-12.7-109.7-34.4c-14.5-10.1-34.4-6.6-44.6 7.9s-6.6 34.4 7.9 44.6C151.2 495 201.7 512 256 512c141.4 0 256-114.6 256-256S397.4 0 256 0C185.3 0 121.3 28.7 75 75zm181 53c-13.3 0-24 10.7-24 24V256c0 6.4 2.5 12.5 7 17l72 72c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-65-65V152c0-13.3-10.7-24-24-24z"/></svg> 
                              History
                         </a>
                         </li>
                         </ul>
                    </div>
                    </div>                  
               </div>
              </aside>
      
            <main className="ml-60 pt-16 max-h-screen overflow-auto">
              <div className="px-6 py-8">
                <div className="w-5/6 mx-auto">
                  <div className="bg-white rounded-3xl p-8 mb-5">
                    {renderContent()}
                  </div>
                </div>
              </div>
            </main>
          </div>
        );
      };