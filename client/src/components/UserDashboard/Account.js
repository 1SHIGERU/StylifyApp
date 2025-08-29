import React, { useEffect, useState, useRef } from 'react';
import { AuthData } from "../../auth/AuthWrapper"
import Avatar from "../../assets/avatar.jpg";
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
              const res = await axios.get(`${process.env.REACT_APP_API_URL}users/getAddress/${user.userID}`);
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
            await axios.put(`${process.env.REACT_APP_API_URL}users/updateAddress`, {
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
              const res = await axios.get(`${process.env.REACT_APP_API_URL}transactions/sumTransactions/${user.userID}`);
              setTransactionSums(res.data);
          } catch (err) {
              console.error(err.message);
          }
        } 

     const fetchTransactions = async () => {
          try {
              const res = await axios.get(`${process.env.REACT_APP_API_URL}transactions/countTransactions/${user.userID}`);
              setTransactionCounts(res.data);
          } catch (err) {
              console.error(err.message);
          }
        }

     const fetchActiveOffers = async () => {
          try {
              const res = await axios.get(`${process.env.REACT_APP_API_URL}offers/countOffers/${user.userID}`);
              setActiveOffers(res.data.count);
          } catch (err) {
              console.error(err.message);
          }
      };

      {/* ZMIANA HASŁA */}

      const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
      const [oldPassword, setOldPassword] = useState('');
      const [newPassword, setNewPassword] = useState('');
      const [newPasswordRepeat, setNewPasswordRepeat] = useState('');

      const handlePasswordChange = () => {
        setIsPasswordModalOpen(true);
      }

      const changePassword = async (e) => {
        e.preventDefault();
      
        try {
          const response = await axios.post(`${process.env.REACT_APP_API_URL}users/updatePassword`, {
            userID: user.userID,
            currentPassword: oldPassword,
            newPassword: newPassword,
            repeatPassword: newPasswordRepeat,
          });
      
          if (response.status === 200) {
            toast.success('Password changed successfully! 🎉', { position: "top-center" });
            setIsPasswordModalOpen(false);
          }
        } catch (error) {
          if (error.response) {
            const { status, data } = error.response;
      
            if (status === 400 && data.message === "Current password is incorrect") {
              toast.error('Current password is incorrect', { position: "top-center" });
            } else if (status === 405 && data.message === "Passwords do not match") {
              toast.error('New password and repeat password are not the same', { position: "top-center" });
            } else {
              toast.error('An unknown error occurred', { position: "top-center" });
            }
          } else {
            toast.error('Network error. Please try again.', { position: "top-center" });
          }
        }
      };
      

      {/* MODAL oraz dane w nim*/}
      
      const [isModalOpen, setIsModalOpen] = useState(false);
      const [selectedImage, setSelectedImage] = useState(user.avatar);
      const [username, setUsername] = useState(user.username);
      const [email, setEmail] = useState(user.email);
      const [description, setDescription] = useState(user.description);   

      const fileInputRef = useRef(null);

      const handleEditClick = () => {
        setIsModalOpen(true);
      };

      const closeModal = () => {
        setIsModalOpen(false);
      };

      const handleFileChange = (event) => {
        if (event.target.files && event.target.files[0]) {
          const file = event.target.files[0];
          const imageUrl = URL.createObjectURL(file);
          setSelectedImage(imageUrl);
        }
      };

      const handleImageClick = () => {
        fileInputRef.current.click();
      };

      const handleSubmit = async () => {
        const formData = new FormData();
        formData.append('avatar', fileInputRef.current.files[0]); 
        formData.append('username', username); 
        formData.append('email', email); 
        formData.append('description', description);
        formData.append('userID', user.userID);

        try {
          const response = await axios.post(`${process.env.REACT_APP_API_URL}users/update`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data', 
            },
          });

          if (response.status === 200) {
            toast.success('Profile updated successfully! 🎉', {position:"top-center"});
            closeModal();        
          } else {
            console.error('Error uploading data:', response.data);
          }
        } catch (error) {
          console.error('Error uploading data:', error);

        }

      };

     const renderContent = () => {
          switch (activeTab) {
            case 'account':
              return (
                <div className='px-8'>
                  <div class="flex mt-8 items-center">
                    <img src={user.avatar || Avatar} alt="avatar" class="w-32 h-32 rounded-full" />
                    <div className='flex space-y-4 flex-col ml-4'>
                      <h1 class="ml-4 dark:text-[#F6C177] text-2xl font-bold">{user.username}</h1>
                      <hr class="text-orange-600" />
                      <h2 className='ml-4 text-xl dark:text-gray-300 text-gray-800'> {user.description} </h2>
                    </div>
                    <button
                      onClick={handleEditClick}
                      className="ml-auto relative mt-4 flex h-[50px] w-40 items-center justify-center border-2 border-orange-500 overflow-hidden bg-white text-orange-400 shadow-2xl transition-all before:absolute before:h-0 before:w-0 before:rounded-full before:bg-orange-600 before:duration-500 before:ease-out hover:shadow-orange-600 hover:before:h-56 hover:before:w-56">
                      <span class="relative z-11">Edit profile</span>
                    </button>
                    <button
                      onClick={handlePasswordChange}
                      className="relative ml-4 mt-4 flex h-[50px] w-40 items-center justify-center border-2 border-orange-500 overflow-hidden bg-white text-orange-400 shadow-2xl transition-all before:absolute before:h-0 before:w-0 before:rounded-full before:bg-orange-600 before:duration-500 before:ease-out hover:shadow-orange-600 hover:before:h-56 hover:before:w-56">
                      <span class="relative z-10">Change password</span>
                    </button>
                  </div>
                  <hr class="my-10" />
                  <div class="grid grid-cols-2 gap-x-20">
                    <div className='border-r-2 border-gray-200 pr-16'>
                      <h2 class="text-2xl dark:text-[#F6C177] font-bold mb-4">Stats</h2>
                      <div class="grid grid-cols-2 gap-4">
                        <div class="col-span-2">
                          <div class="shadow-xl p-6 dark:bg-[#252526] rounded-lg duration-300 hover:scale-105 hover:shadow-[0_3px_10px_rgb(0,0,0,0.2)]">
                            <div class="font-bold dark:text-gray-300 text-xl text-gray-800 leading-none">Good morning, <br />{user.username}</div>
                            <div class="mt-5">                        
                              <button onClick={() => setActiveTab('activeOffers')} type="button" class="inline-flex dark:text-gray-300 items-center justify-center py-2 text-gray-800 text-sm font-semibold transition duration-200 hover:border-b-2 hover:dark:border-[#F6C177] hover:border-orange-500">
                                Active offers: <span className='text-orange-600 dark:text-[#F6C177] ml-2'> {activeOffers} </span>
                              </button>
                            </div>
                          </div>
                        </div>
                        <div class="shadow-xl p-6 dark:bg-[#252526] rounded-lg duration-300 hover:scale-105 hover:shadow-[0_3px_10px_rgb(0,0,0,0.2)]">
                          <div class="font-bold text-2xl dark:text-[#F6C177] text-orange-500 leading-none">{transactionCounts.soldCount}</div>
                          <div class="mt-2 dark:text-gray-300">Items sold</div>
                        </div>
                        <div class="shadow-xl p-6 dark:bg-[#252526] rounded-lg duration-300 hover:scale-105 hover:shadow-[0_3px_10px_rgb(0,0,0,0.2)]">
                          <div class="font-bold text-2xl dark:text-[#F6C177] text-orange-500 leading-none">{transactionCounts.boughtCount}</div>
                          <div class="mt-2 dark:text-gray-300">Items bought</div>
                        </div>
                        <div class="col-span-2"> 
                          <div class="shadow-xl p-6 dark:bg-[#252526] rounded-lg duration-300 hover:scale-105 hover:shadow-[0_3px_10px_rgb(0,0,0,0.2)]">    
                            <div class="font-bold text-xl mb-4 dark:text-gray-300 text-gray-800 leading-none">Financial balance: <span className='dark:text-[#F6C177] text-orange-500'>{bilans} zł </span></div> 
                              <div className='flex'>                    
                                   <div className='w-1/2'>
                                        <h1 className='font-bold dark:text-gray-300'>Earned:</h1>
                                        <h2 className='text-green-500'>+{transactionSums.soldSum}zł</h2>
                                   </div>
                                   <div className='w-1/2'>
                                        <h1 className='font-bold dark:text-gray-300'>Spent:</h1>
                                        <h2 className='text-red-500'>-{transactionSums.boughtSum}zł</h2>
                                   </div>
                              </div>  
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div class="">
                    <div class="flex justify-center py-10 items-center">
                    <form class="">
                          <h1 class="text-gray-800 dark:text-[#F6C177] font-bold text-3xl mb-1">Shipping details</h1>
                          <p class="text-md font-normal dark:text-gray-300 text-gray-600 mb-7">Seller is gonna need it</p>
                      <div class="flex items-center dark:text-gray-300 w-96 border-2 py-2 px-3 rounded-2xl mb-4 focus-within:border-orange-500">
                        <div class="pr-2">
                          🏡
                        </div>
                        <input onChange={(e) => setStreet(e.target.value)} value={street} required minLength={3} maxLength={50} class="pl-2 border-none bg-transparent focus:outline-none w-full" type="text" name="street" id="street" placeholder="Street" />
                      </div>

                      <div class="flex items-center dark:text-gray-300 border-2 py-2 px-3 rounded-2xl mb-4 focus-within:border-orange-500">
                        <div class="pr-2">
                          🏙️
                        </div>
                        <input onChange={(e) => setCity(e.target.value)} value={city} pattern="[A-Za-z\s]+" minLength={2} maxLength={50} class="pl-2 border-none bg-transparent bg-transparent focus:outline-none w-full" type="text" name="city" id="city" placeholder="City" />
                      </div>

                      <div class="flex items-center dark:text-gray-300 border-2 py-2 px-3 rounded-2xl mb-4 focus-within:border-orange-500">
                        <div class="pr-2">
                          📯
                        </div>
                        <input onChange={(e) => setPostcode(e.target.value)} value={postcode} title="Please enter a valid postcode (e.g., 12-345)"  required pattern="[0-9]{2}-[0-9]{3}" class="pl-2 border-none bg-transparent focus:outline-none w-full" type="text" name="postcode" id="postcode" placeholder="Postcode" />
                      </div>

                      <div class="flex items-center dark:text-gray-300 border-2 py-2 px-3 rounded-2xl focus-within:border-orange-500">
                        <div class="pr-2 text-gray-700">
                          🌍
                        </div>
                        <input onChange={(e) => setCountry(e.target.value)} value={country} pattern="[A-Za-z\s]+" minlength="2" maxlength="50" required class="pl-2 border-none bg-transparent focus:outline-none w-full" type="text" name="country" id="country" placeholder="Country" />
                      </div>
                          <button onClick={handleUploadAddress} class="relative mx-auto mt-4 flex h-[50px] w-40 items-center justify-center overflow-hidden bg-gray-800 text-white shadow-2xl transition-all before:absolute before:h-0 before:w-0 before:rounded-full before:bg-orange-600 before:duration-500 before:ease-out hover:shadow-orange-600 hover:before:h-56 hover:before:w-56">
                            <span class="relative z-10">Save address</span>
                          </button>       
                    </form>
                    </div>
                  </div>
                </div>
                {isModalOpen && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-55">
                    <div className="grid sm:grid-cols-2 items-center gap-16 p-8 mx-auto  max-w-4xl dark:bg-[#2d2d30] bg-white shadow-[0_2px_10px_-3px_rgba(6,81,237,0.3)] rounded-md text-[#333] font-[sans-serif]">
                      <div>                                    
                        <input
                          type="file"
                          ref={fileInputRef}
                          className='hidden'
                          onChange={handleFileChange}
                        />  
                        <img
                          src={selectedImage || Avatar}
                          alt="avatar"
                          className="mb-4 w-32 h-32 cursor-pointer rounded-full border-2 border-orange-500"
                          onClick={handleImageClick} 
                        />
                        <h1 className="text-3xl dark:text-[#F6C177] font-extrabold">{username}</h1>
                        <p className="text-sm text-gray-400 mt-3">{description}</p>
                        <div className="mt-12">
                          <h2 className="text-lg dark:text-[#F6C177] font-extrabold">Email</h2>
                          <ul className="mt-3">
                            <li className="flex items-center">
                              <div className="bg-[#e6e6e6cf] h-10 w-10 rounded-full flex items-center justify-center shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="#FFA500" viewBox="0 0 479.058 479.058">
                                  <path
                                    d="M434.146 59.882H44.912C20.146 59.882 0 80.028 0 104.794v269.47c0 24.766 20.146 44.912 44.912 44.912h389.234c24.766 0 44.912-20.146 44.912-44.912v-269.47c0-24.766-20.146-44.912-44.912-44.912zm0 29.941c2.034 0 3.969.422 5.738 1.159L239.529 264.631 39.173 90.982a14.902 14.902 0 0 1 5.738-1.159zm0 299.411H44.912c-8.26 0-14.971-6.71-14.971-14.971V122.615l199.778 173.141c2.822 2.441 6.316 3.655 9.81 3.655s6.988-1.213 9.81-3.655l199.778-173.141v251.649c-.001 8.26-6.711 14.97-14.971 14.97z"
                                    data-original="#000000"
                                  />
                                </svg>
                              </div>
                              <a className="text-orange-500 text-sm ml-3">
                                <small className="block">{email}</small>
                              </a>
                            </li>
                          </ul>
                        </div>
                      </div>
                      
                      <form className="ml-auto space-y-4" onSubmit={handleSubmit}>
                        <h1 onClick={closeModal} className="cursor-pointer text-md text-red-700 text-right ">X</h1> 
                        <input                        
                          maxLength={20}
                          type="text"
                          placeholder="New username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)} 
                          className="w-full rounded-md py-2.5 px-4 border text-sm outline-[#FFA500]"
                        />
                        <input                          
                          type="email"
                          maxlength={30}
                          placeholder="New email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)} 
                          className="w-full rounded-md py-2.5 px-4 border text-sm outline-[#FFA500]"
                        />
                        <textarea                 
                          placeholder="Description"
                          maxLength={200}
                          rows="4"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)} 
                          className="w-full rounded-md px-4 border text-sm pt-2.5 outline-[#FFA500]"
                        ></textarea>
                        <button
                          type="submit"
                          className="text-white bg-[#FFA500] hover:bg-orange-500 font-semibold rounded-md text-sm px-4 py-2.5 w-full"
                        >
                          Save
                        </button>
                      </form>
                    </div>
                  </div>
                )}

                {isPasswordModalOpen && (
                   <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="items-center p-8 mx-auto max-w-md bg-white dark:bg-[#2d2d30]  shadow-[0_2px_10px_-3px_rgba(6,81,237,0.3)] rounded-md text-[#333] font-[sans-serif]">
                    <p className='text-right cursor-pointer text-red-700' onClick={() => setIsPasswordModalOpen(false)}>X</p>
                    <h2 className='text-2xl dark:text-[#F6C177] text-brown-700 font-bold text-center mb-4'>Change your password</h2>
                    <form className="ml-auto space-y-4" onSubmit={changePassword}>
                        <input
                          required
                          maxLength={20}
                          type="password"
                          placeholder="Your acctual password"
                          onChange={(e) => setOldPassword(e.target.value)} 
                          className="w-full dark:text-gray-300 rounded-md py-2.5 px-4 border text-sm outline-[#FFA500]"
                        />
                        <input
                          required
                          maxLength={20}
                          type="password"
                          placeholder="New password"
                          onChange={(e) => setNewPassword(e.target.value)} 
                          className="w-full dark:text-gray-300 rounded-md py-2.5 px-4 border text-sm outline-[#FFA500]"
                        />
                        <input
                          required
                          maxLength={20}
                          type="password"
                          placeholder="Repeat new password"
                          onChange={(e) => setNewPasswordRepeat(e.target.value)} 
                          className="w-full dark:text-gray-300 rounded-md py-2.5 px-4 border text-sm outline-[#FFA500]"
                        /> 
                        <button
                          type="submit"
                          className="text-white bg-[#FFA500] hover:bg-orange-500 font-semibold rounded-md text-sm px-4 py-2.5 w-full">
                          Save
                        </button>
                      </form>
                    </div>
                  </div>
                )}
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
          <div className="flex min-h-screen pt-16">
              <div className="text-gray-500 dark:bg-[#2d2d30] w-1/5 p-6 shadow-md dark:shadow-[9px_0px_16px_1px_#F6C177]">                     
                      <h2 class="lg:text-3xl dark:text-[#F6C177] mb-8 text-[#8B4513] text-4xl font-extrabold lg:leading-[55px]">
                        User Dashboard
                      </h2>           
                      <ul class="space-y-6">
                         <li onClick={() => setActiveTab('account')} className={`flex transition dark:text-[#F6C177] duration-200 items-center gap-4 cursor-pointer p-2 ${
                              activeTab === 'account' ? 'text-gray-800 border-r-2 border-orange-500 dark:border-[#F6C177] font-bold' : 'hover:scale-105'
                              }`}>    
                            <span className="text-xl">🏠</span>
                            <span className="text-lg">General</span>         
                         </li>

                         <li onClick={() => setActiveTab('favourites')} className={`flex transition dark:text-[#F6C177] duration-200  items-center gap-4 cursor-pointer p-2 ${
                              activeTab === 'favourites' ? 'text-gray-800 border-r-2 border-orange-500 dark:border-[#F6C177] font-bold' : 'hover:scale-105'
                              }`}>    
                            <span className="text-xl">🤍</span>
                            <span className="text-lg">Favourites</span>         
                         </li>

                         <li onClick={() => setActiveTab('orders')} className={`flex transition dark:text-[#F6C177] duration-200  items-center gap-4 cursor-pointer p-2 ${
                              activeTab === 'orders' ? 'text-gray-800 border-r-2 border-orange-500 dark:border-[#F6C177] font-bold' : 'hover:scale-105'
                              }`}>    
                            <span className="text-xl">📦</span>
                            <span className="text-lg">Orders</span>         
                         </li>

                         <li onClick={() => setActiveTab('history')} className={`flex transition dark:text-[#F6C177] duration-200 items-center gap-4 cursor-pointer p-2 ${
                              activeTab === 'history' ? 'text-gray-800 border-r-2 border-orange-500 dark:border-[#F6C177] font-bold' : 'hover:scale-105'
                              }`}>    
                            <span className="text-xl">🕰️</span>
                            <span className="text-lg">History</span>         
                         </li>

                         <li onClick={() => setActiveTab('activeOffers')} className={`flex transition dark:text-[#F6C177] duration-200 items-center gap-4 cursor-pointer p-2 ${
                              activeTab === 'activeOffers' ? 'text-gray-800 border-r-2 border-orange-500 dark:border-[#F6C177] font-bold' : 'hover:scale-105'
                              }`}>    
                            <span className="text-xl">🟢</span>
                            <span className="text-lg">Active offers</span>         
                         </li>

                         <li onClick={() => setActiveTab('wallet')} className={`flex transition dark:text-[#F6C177] duration-200 items-center gap-4 cursor-pointer p-2 ${
                              activeTab === 'wallet' ? 'text-gray-800 border-r-2 border-orange-500 dark:border-[#F6C177] font-bold' : 'hover:scale-105'
                              }`}>    
                            <span className="text-xl">💳</span>
                            <span className="text-lg">Wallet</span>         
                         </li>
                      </ul>                
              </div>  

              <div className="flex-1 p-8 dark:bg-[#1e1e1e]">
                  {renderContent()}
              </div>          
          </div>
        );
      };