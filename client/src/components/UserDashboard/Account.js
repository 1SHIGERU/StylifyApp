import React, { useEffect, useState } from 'react';
import { AuthData } from "../../auth/AuthWrapper"
import Img from "../../assets/avatar.jpg"
import Favourites from './Favourites';
import ActiveOffers from './ActiveOffers';
import Wallet from './Wallet';
import Orders from './Orders';
import History from './History';
import axios from 'axios';

export const Account = () => {

     const { user } = AuthData();
     const [activeTab, setActiveTab] = useState('account');
     const [activeOffers, setActiveOffers] = useState(0);
     const [transactionCounts, setTransactionCounts] = useState({ soldCount: 0, boughtCount: 0 });

     const fetchTransactions = async () => {
          try {
              const res = await axios.get(`http://localhost:13000/transactions/countTransactions/${user.userID}`);
              setTransactionCounts(res.data);
              console.log(res.data);
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
                          <div class="font-bold text-2xl leading-none">20</div>
                          <div class="mt-2">Items sold</div>
                        </div>
                        <div class="p-4 bg-yellow-100 rounded-xl text-gray-800">
                          <div class="font-bold text-2xl leading-none">22</div>
                          <div class="mt-2">Items bought</div>
                        </div>
                        <div class="col-span-2">
                          
                          <div class="p-4 bg-yellow-200 rounded-xl">    
                            <div class="font-bold text-xl text-gray-800 leading-none">Bilans finansowy</div> 
                              <div className='flex p-6'>                    
                                   <div className='w-1/2'>
                                        Zarobiono: 1000zł
                                   </div>
                                   <div className='w-1/2'>
                                        Wydano: 500zł
                                   </div>
                              </div>  
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h2 class="text-2xl font-bold mb-4">Your shipping details</h2>
                      <div class="space-y-4">
                        x
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
          fetchActiveOffers();
          fetchTransactions();
        }
        , []);

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
                              Active offers                            
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