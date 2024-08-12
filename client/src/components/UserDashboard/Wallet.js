import React, {useState,useEffect} from 'react';
import img from '../../assets/wardrobe.jpeg';
import axios from 'axios';
import { AuthData } from '../../auth/AuthWrapper';

const Wallet = () => {

  const [balance, setBalance] = React.useState(0);
  const { user } = AuthData();
  const [transactionCounts, setTransactionCounts] = useState({ soldCount: 0, boughtCount: 0 });

  const fetchBalance = async () => {
    try {
      const { data: balance } = await axios.get(`http://localhost:13000/users/balance/${user.userID}`);
      setBalance(balance);
    } catch (error) {
      console.error('Error fetching balance:', error.message);
    }
  }

  const fetchTransactionCounts = async () => {
    try {
      const res = await axios.get(`http://localhost:13000/transactions/countTransactions/${user.userID}`);
      setTransactionCounts(res.data);
    } catch (error) {
      console.error('Error fetching transaction counts:', error.message);
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      if (user && user.userID) {
        await fetchBalance();
        await fetchTransactionCounts();
      }
    };

    fetchData();
  }
  , [user]);

  return (
    <div className=''>
      <h1 className='text-4xl font-bold mb-4'>Wallet</h1>
      <hr />
      <section class="py-10 sm:py-16 lg:py-24">
        <div class="px-4 mx-auto sm:px-6 lg:px-8 max-w-7xl">
            <div class="max-w-2xl mx-auto text-left sm:text-center">
                <h2 class="text-3xl font-bold leading-tight text-black sm:text-4xl lg:text-5xl">Withdraw what you've earned!</h2>
                
            </div>

            <div class="mt-8 space-y-8 sm:space-x-12 sm:mt-12 sm:flex sm:items-start sm:justify-center sm:space-y-0 md:space-x-20 lg:mt-20">
                <div class="flex items-start">
                    <svg class="flex-shrink-0 text-orange-400 w-7 h-7" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                    <div class="ml-4">
                        <h3 class="text-xl font-semibold text-black">Your balance:</h3>
                        <p class="mt-1.5 text-base text-gray-600"> <span className='font-bold text-xl'>{balance} </span>PLN</p>
                    </div>
                </div>

                <div class="flex items-start">
                    <svg class="flex-shrink-0 text-orange-400 w-7 h-7" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                    <div class="ml-4">
                        <h3 class="text-xl font-semibold text-black">You've sold</h3>
                        <p class="mt-1.5 text-base text-gray-600">{transactionCounts.soldCount} items</p>
                    </div>
                </div>

                <div class="flex items-start">
                    <svg class="flex-shrink-0 text-orange-400 w-7 h-7" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                    <div class="ml-4">
                        <h3 class="text-xl font-semibold text-black">You've bought</h3>
                        <p class="mt-1.5 text-base text-gray-600">{transactionCounts.boughtCount} items</p>
                    </div>
                </div>
            </div>
            
            <form action="#" method="POST" class="max-w-xl mx-auto mt-12">
                <div class="sp-2 bg-white border-1 border-orange-500 rounded-full">
                    <div class="flex flex-col items-start sm:flex-row sm:justify-center">
                      
                        <div class="flex-1 w-full min-w-0">
                            <div class="relative text-gray-400 focus-within:text-orange-600">
                                <label for="email" class="sr-only"></label>
                                <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                  <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M6 14h2m3 0h5M3 7v10a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1Z"/>
                                  </svg>
                                </div>                  
                                <input
                                    type="tel"
                                    inputmode="numeric"
                                    name="email"
                                    id="email"
                                    pattern="[0-9\s]{13,19}"
                                    autocomplete="cc-number"
                                    maxlength="19"
                                    placeholder="xxxx xxxx xxxx xxxx"
                                    class="block w-full py-4 pl-10 pr-4 text-base text-black placeholder-gray-500 transition-all duration-200 border-transparent rounded-full focus:border-transparent focus:ring-0 caret-blue-600"
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" class="inline-flex items-center justify-center w-auto px-4 py-4 mt-4 font-semibold text-white transition-all duration-200 bg-orange-600 border border-transparent rounded-full sm:ml-4 sm:mt-0 sm:w-auto hover:bg-white hover:text-orange-600  hover:border-orange-500 focus:bg-blue-700">
                            Withdraw
                            <svg class="w-5 h-5 ml-3 -mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>
            </form>

            <div class="flex items-center justify-start mt-8 sm:justify-center sm:px-0">
                <svg class="flex-shrink-0 w-5 h-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
                <span class="ml-2 text-sm text-gray-600"> Your data is complely secured with us. We don’t share with anyone. </span>
            </div>
        </div>
    </section>

    </div>
  );
};

export default Wallet;