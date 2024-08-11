import { useState, useEffect } from 'react';  
import { Link } from 'react-router-dom';
import Image from '../../assets/bck.jpg';
import { AuthData } from '../../auth/AuthWrapper';
import axios from 'axios';

export const Home = () => {

     const { user } = AuthData();

return (
     <>
     <div className="pt-18 min-h-screen flex justify-center items-center">
          <div style={{ '--image-url': `url(${Image})` }} className="w-1/2 min-h-screen bg-[image:var(--image-url)]"></div>
          <div className="w-1/2 justify-center items-center p-32">
               <h1 className="text-4xl font-bold">
               An <span className='text-[#D47C24] '>interesting</span> fact about clothing is that the average person regularly uses only about 20-30% of their wardrobe, while 70-80% remains <span className='text-[#D47C24] '> rarely </span>worn in the closet.</h1>
               <p className="text-xl mt-4">Stylify is here to help you make the most of your wardrobe. We provide you with the latest fashion trends and help you create the perfect outfit for any occasion.</p>
               
               {user.isAuthenticated ? 
                    <>
                         <Link to="/addOffer"> 
                         <button className="mr-8 border-b-2 border-[#D47C24] text-[#D47C24] px-12 py-4 tracking-widest font-bold bg-transparent hover:border-[#D47C24] hover:border-b-2 dark:text-neutral-200 transition duration-250 mt-8">
                              Add an offer 
                         </button></Link>
                         
                         <Link to="/market">
                         <button className="border-b-2 border-[#D47C24] text-[#D47C24] px-12 py-4 tracking-widest font-bold bg-transparent hover:border-[#D47C24] hover:border-b-2 dark:text-neutral-200 transition duration-250 mt-8">
                               Go to market
                         </button></Link>
                    </>
                    :
                    <>
                         <Link to="/login">
                         <button className=" mr-8 border-b-2 border-[#D47C24] text-[#D47C24] px-12 py-4 tracking-widest font-bold bg-transparent hover:border-[#D47C24] hover:border-b-2 dark:text-neutral-200 transition duration-250 mt-8">
                              Get started
                         </button></Link>

                         <Link to="/market">
                         <button className="border-b-2 border-[#D47C24] text-[#D47C24] px-12 py-4 tracking-widest font-bold bg-transparent hover:border-[#D47C24] hover:border-b-2 dark:text-neutral-200 transition duration-250 mt-8">
                              Go to market
                         </button></Link>
                    </>
               }               
               
          </div>
     </div>
     <div class="flex justify-center items-center mt-12">       
          <div class="2xl:mx-auto 2xl:container py-12 px-4 sm:px-6 xl:px-20 2xl:px-0 w-full">
          <div class="flex flex-col jusitfy-center items-center space-y-10">
               <div class="flex flex-col justify-center items-center ">
               <h1 class="text-3xl xl:text-4xl font-semibold leading-7 xl:leading-9 text-gray-800 dark:text-white">Shop By Category</h1>
               </div>
               <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 md:gap-x-4 md:gap-x-8 w-full">
               <div class="group flex justify-center items-center h-full w-full">
                              
               </div>

               <div class="flex flex-col space-y-4 md:space-y-8 mt-4 md:mt-0">
                    <div class="group relative flex justify-center items-center h-full w-full overflow-hidden">
                         <img class="object-center object-cover h-full w-full transition-transform duration-250 group-hover:scale-110" src="https://i.ibb.co/SXZvYHs/irene-kredenets-DDqx-X0-7v-KE-unsplash-1.png" alt="shoe-image" />
                         <button class="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-250 text-white bg-black bg-opacity-50 px-4 py-2">Shoes</button>
                    </div>

                    <div class="group relative flex justify-center items-center h-full w-full overflow-hidden">
                         <img class="object-center object-cover h-full w-full transition-transform duration-250 group-hover:scale-110" src="https://i.ibb.co/Hd1pVxW/louis-mornaud-Ju-6-TPKXd-Bs-unsplash-1-2.png" alt="watch-image" />
                         <button class="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-250 text-white bg-black bg-opacity-50 px-4 py-2">Watches</button>
                    </div>
               </div>

               <div class=" group relative justify-center items-center h-full w-full hidden lg:flex overflow-hidden">
                    <img class="object-center object-cover h-full w-full hover:scale-[120%] transition duration-250" src="https://i.ibb.co/PTtRBLL/olive-tatiane-Im-Ez-F9-B91-Mk-unsplash-1.png" alt="girl-image" />
                    <button class="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-250 text-white bg-black bg-opacity-50 px-4 py-2">Ubrania</button>
               </div>
               <div class=" group flex justify-center items-center h-full w-full mt-4 md:hidden overflow-hidden md:mt-8 lg:hidden">
                    <img class="object-center object-cover h-full w-full hidden md:block hover:scale-[120%] transition duration-250" src="https://i.ibb.co/6FjW19n/olive-tatiane-Im-Ez-F9-B91-Mk-unsplash-2.png" alt="girl-image" />
                    <img class="object-center object-cover h-full w-full md:hidden hover:scale-[120%] transition duration-250" src="https://i.ibb.co/sQgHwHn/olive-tatiane-Im-Ez-F9-B91-Mk-unsplash-1.png" alt="olive-tatiane-Im-Ez-F9-B91-Mk-unsplash-2" />
                    
               </div>
               </div>
               <div class=" group hidden md:flex justify-center items-center h-full w-full overflow-hidden mt-4 md:mt-8 lg:hidden">
                    <img class="object-center object-cover h-full w-full hidden md:block hover:scale-[120%] transition duration-250" src="https://i.ibb.co/6FjW19n/olive-tatiane-Im-Ez-F9-B91-Mk-unsplash-2.png" alt="girl-image" />
                    <img class="object-center object-cover h-full w-full sm:hidden hover:scale-[120%] transition duration-250" src="https://i.ibb.co/sQgHwHn/olive-tatiane-Im-Ez-F9-B91-Mk-unsplash-1.png" alt="olive-tatiane-Im-Ez-F9-B91-Mk-unsplash-2" />          
               </div>
          </div>
          </div>
          </div>
          <section class="py-10 bg-white sm:py-16 lg:py-24">
               <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div class="max-w-2xl mx-auto text-center">
                         <h2 class="text-3xl font-bold leading-tight text-black sm:text-4xl lg:text-5xl">How does it work?</h2>
                         <p class="max-w-lg mx-auto mt-4 text-base leading-relaxed text-gray-600">Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis.</p>
                    </div>

                    <div class="relative mt-12 lg:mt-20">
                         <div class="absolute inset-x-0 hidden xl:px-44 top-2 md:block md:px-20 lg:px-28">
                              <img class="w-full" src="https://cdn.rareblocks.xyz/collection/celebration/images/steps/2/curved-dotted-line.svg" alt="" />
                         </div>

                         <div class="relative grid grid-cols-1 text-center gap-y-12 md:grid-cols-3 gap-x-12">
                              <div>
                                   <div class="flex items-center justify-center w-16 h-16 mx-auto bg-white border-2 border-gray-200 rounded-full shadow">
                                   <span class="text-xl font-semibold text-gray-700"> 1 </span>
                                   </div>
                                   <a href='/register'>
                                        <h3 class="mt-6 text-xl font-semibold leading-tight text-black md:mt-10">List an item!</h3>
                                   </a>
                                   <p class="mt-4 text-base text-gray-600">To list an item, you must have a user account</p>
                              </div>

                              <div>
                                   <div class="flex items-center justify-center w-16 h-16 mx-auto bg-white border-2 border-gray-200 rounded-full shadow">
                                   <span class="text-xl font-semibold text-gray-700"> 2 </span>
                                   </div>
                                   <h3 class="mt-6 text-xl font-semibold leading-tight text-black md:mt-10">Sell and send!</h3>
                                   <p class="mt-4 text-base text-gray-600">When someone buys your item, you will have to send it within 3 working days</p>
                              </div>

                              <div>
                                   <div class="flex items-center justify-center w-16 h-16 mx-auto bg-white border-2 border-gray-200 rounded-full shadow">
                                   <span class="text-xl font-semibold text-gray-700"> 3 </span>
                                   </div>
                                   <h3 class="mt-6 text-xl font-semibold leading-tight text-black md:mt-10">Paycheck time!</h3>
                                   <p class="mt-4 text-base text-gray-600">When the buyer receives your order, the entire amount goes to your account!</p>
                              </div>
                         </div>
                    </div>
               </div>
          </section>

          <div class="2xl:mx-auto 2xl:container mx-4 py-16">
               <div class="w-full relative flex items-center justify-center">
                    <img src="https://i.ibb.co/4sYZ8gC/img-2.png" alt="dining" class="w-full h-full absolute z-0 hidden xl:block" />
                    <img src="https://i.ibb.co/bbS3J9C/pexels-max-vakhtbovych-6301182-1.png" alt="dining" class="w-full h-full absolute z-0 hidden sm:block xl:hidden" />
                    <img src="https://i.ibb.co/JKkzGDs/pexels-max-vakhtbovych-6301182-1.png" alt="dining" class="w-full h-full absolute z-0 sm:hidden" />
                         <div class="bg-[#D47C24] bg-opacity-80 md:my-16 lg:py-16 py-10 w-full md:mx-24 md:px-12 px-4 flex flex-col items-center justify-center relative z-40">
                              <h1 class="text-4xl font-semibold leading-9 text-white text-center">Don’t miss out!</h1>
                              <p class="text-base leading-normal text-center text-white mt-6">
                                   Subscribe to your newsletter to stay in the loop. Our newsletter is sent once in <br />
                                   a week on every friday so subscribe to get latest news and updates.
                              </p>
                              <div class="sm:border border-white flex-col sm:flex-row flex items-center lg:w-5/12 w-full mt-12 space-y-4 sm:space-y-0">
                                   <input class="border border-white sm:border-transparent text-base w-full font-medium leading-none text-white p-4 focus:outline-none bg-transparent placeholder-white" placeholder="Email Address" />
                                   <button class="focus:outline-none focus:ring-offset-2 focus:ring border border-white sm:border-transparent w-full sm:w-auto bg-white py-4 px-6 hover:bg-opacity-75">Subscribe</button>
                              </div>
                         </div>
               </div>
          </div>
     </>
     
);
}