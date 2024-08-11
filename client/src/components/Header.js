import React from 'react';
import { Link } from 'react-router-dom';
import { AuthData } from '../auth/AuthWrapper';
import Avatar from '../assets/avatar.jpg';
import { MdLogout } from "react-icons/md";

const Header = () => {

  const { user, logout } = AuthData(); 

  return (
    <header class="fixed w-full shadow-lg px-24 py-4 z-50 bg-white shadow-[rgba(0,_0,_0,_0.1)_0px_60px_40px_-7px]  ">
      <nav class="flex justify-between">
        <div class="w-[130px] md:w-[200px] flex items-center">
          <Link to='/' ><h1 className='text-3xl  '> Stylify </h1> </Link>
        </div>
        <div class="flex items-center gap-3">
          <div class="navLinks duration-500 absolute md:static md:w-auto w-full md:h-auto h-[85vh] bg-white flex md:items-center gap-[1.5vw] top-[100%] left-[-100%] px-5 md:py-0 py-5 ">
            <ul class="flex md:flex-row flex-col md:items-center md:gap-[2vw] gap-8">
            <Link to='/'><li class="relative max-w-fit pr-3 md:pr-0 py-1 after:bg-[#D47C24] after:absolute after:h-1 after:w-0 after:bottom-0 after:left-0 hover:after:w-full after:transition-all after:duration-300">Home</li></Link>
            <Link to='/market'><li class="relative max-w-fit pr-3 md:pr-0 py-1 after:bg-[#D47C24]  after:absolute after:h-1 after:w-0 after:bottom-0 after:left-0 hover:after:w-full after:transition-all after:duration-300">Market</li></Link>
            <Link to='/about'> <li class="relative max-w-fit pr-3 md:pr-0 py-1 after:bg-[#D47C24]  after:absolute after:h-1 after:w-0 after:bottom-0 after:left-0 hover:after:w-full after:transition-all after:duration-300">About Us</li></Link>
            <Link to='/contact'> <li class="relative max-w-fit pr-3 md:pr-0 py-1 after:bg-[#D47C24]  after:absolute after:h-1 after:w-0 after:bottom-0 after:left-0 hover:after:w-full after:transition-all after:duration-300">Contact us</li></Link>
            {user.isAuthenticated ? <Link to='/addOffer'><li class="relative max-w-fit pr-3 md:pr-0 py-1 after:bg-[#D47C24]  after:absolute after:h-1 after:w-0 after:bottom-0 after:left-0 hover:after:w-full after:transition-all after:duration-300">Add offer</li></Link> : null}
            
            </ul>
          </div>
          <div class="flex items-center gap-2">
            {user.isAuthenticated ? 
            <>
              <Link to='/account'><img src={Avatar} alt='avatar' className='w-10 h-10 ml-12 rounded-full' /></Link>
              <Link to='/account'><p>{user.username}</p></Link>
              <button onClick={logout} className='transition-all duration-100 text-red-500 ml-6 hover:scale-[120%]'><MdLogout size={25} /></button>
            </>
            :
            <>
              <Link to='/login'><button type="button" class="transition-all duration-300 hover:border-[#D47C24] hover:text-[#D47C24] hover:bg-clip-text bg-[#D47C24] border-solid border-2 border-white font-bold text-white px-5 py-2 rounded-full ">Sign in</button></Link>
            </>
            }
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;