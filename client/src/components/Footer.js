import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {

  return (
    <div class="container py-16">
      <div class="grid grid-cols-3">
        <div class="flex flex-col ml-64  flex-shrink-0">
          <div class="dark:text-white">
            <h1 class="text-3xl font-semibold leading-7 text-gray-800 dark:text-white">Stylify</h1>
          </div>
          <p class="text-sm leading-none text-gray-800 mt-4 dark:text-white">Copyright © 2024 Stylify</p>
          <p class="text-sm leading-none text-gray-800 mt-4 dark:text-white">All rights reserved</p>
        </div>
        <div class="ml-16 flex flex-col">
          <h2 class="text-base font-semibold leading-4 text-gray-800 dark:text-white">Company</h2>
          <a class="focus:outline-none focus:underline hover:text-[#D47C24] text-base leading-4 mt-6 text-gray-800 dark:text-white cursor-pointer">Blog</a>
          <a class="focus:outline-none focus:underline hover:text-[#D47C24] text-base leading-4 mt-6 text-gray-800 dark:text-white cursor-pointer">Pricing</a>
          <a class="focus:outline-none focus:underline hover:text-[#D47C24] text-base leading-4 mt-6 text-gray-800 dark:text-white cursor-pointer">About Us</a>
          <a class="focus:outline-none focus:underline hover:text-[#D47C24] text-base leading-4 mt-6 text-gray-800 dark:text-white cursor-pointer">Contact us</a>
          <a class="focus:outline-none focus:underline hover:text-[#D47C24] text-base leading-4 mt-6 text-gray-800 dark:text-white cursor-pointer">Testimonials</a>
        </div>
        <div class="flex flex-col">
          <h2 class="text-base font-semibold leading-4 text-gray-800 dark:text-white">Support</h2>
          <a class="focus:outline-none focus:underline hover:text-[#D47C24] text-base leading-4 mt-6 text-gray-800 dark:text-white cursor-pointer">Legal policy</a>
          <a class="focus:outline-none focus:underline hover:text-[#D47C24] text-base leading-4 mt-6 text-gray-800 dark:text-white cursor-pointer">Status policy</a>
          <a class="focus:outline-none focus:underline hover:text-[#D47C24] text-base leading-4 mt-6 text-gray-800 dark:text-white cursor-pointer">Privacy policy</a>
          <a class="focus:outline-none focus:underline hover:text-[#D47C24] text-base leading-4 mt-6 text-gray-800 dark:text-white cursor-pointer">Terms of service</a>
        </div>  
      </div>
    </div>
  );
};

export default Footer;