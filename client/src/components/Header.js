import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthData } from '../auth/AuthWrapper';
import Avatar from '../assets/avatar.jpg';
import { MdLogout } from "react-icons/md";
import Notification from './Notification';
import axios from 'axios';

const Header = () => {

  const { user, logout } = AuthData(); 
  const [howMuchUnreadMessages, setHowMuchUnreadMessages] = useState(0);

  useEffect(() => {
    const fetchUnreadMessages = async () => {
      if (!user || !user.userID) return;
  
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}chat/checkUnread/${user.userID}`);
        setHowMuchUnreadMessages(response.data.unreadCount);
      } catch (error) {
        console.error('Błąd przy sprawdzaniu wiadomości:', error);
      }
    };
  
    if (user && user.userID) {
      const interval = setInterval(fetchUnreadMessages, 5000);
  
      return () => clearInterval(interval);
    }
  }, [user]); 
  

  return (
    <header class="fixed w-full shadow-lg px-24 py-4 z-50 bg-white shadow-[rgba(0,_0,_0,_0.1)_0px_60px_40px_-7px]  ">
      <nav class="flex justify-between">
        <div class="w-[130px] md:w-[200px] flex items-center">
          <Link to='/'><h1 className='text-3xl'> Stylify </h1> </Link>
        </div>
        <div class="flex items-center gap-3">
          <div class="navLinks duration-500 absolute md:static md:w-auto w-full md:h-auto h-[85vh] bg-white flex md:items-center gap-[1.5vw] top-[100%] left-[-100%] px-5 md:py-0 py-5 ">
            <ul class="flex md:flex-row flex-col md:items-center md:gap-[2vw] gap-8">
            <Link to='/'><li class="relative max-w-fit pr-3 md:pr-0 py-1 after:bg-[#D47C24] after:absolute after:h-1 after:w-0 after:bottom-0 after:left-0 hover:after:w-full after:transition-all after:duration-300">Home</li></Link>
            <Link to='/market'><li class="relative max-w-fit pr-3 md:pr-0 py-1 after:bg-[#D47C24]  after:absolute after:h-1 after:w-0 after:bottom-0 after:left-0 hover:after:w-full after:transition-all after:duration-300">Market</li></Link>
            <Link to='/contact'> <li class="relative max-w-fit pr-3 md:pr-0 py-1 after:bg-[#D47C24]  after:absolute after:h-1 after:w-0 after:bottom-0 after:left-0 hover:after:w-full after:transition-all after:duration-300">Contact us</li></Link>
            {user.isAuthenticated ? <Link to='/addOffer'><li class="relative max-w-fit pr-3 md:pr-0 py-1 after:bg-[#D47C24]  after:absolute after:h-1 after:w-0 after:bottom-0 after:left-0 hover:after:w-full after:transition-all after:duration-300">Add offer</li></Link> : null}
            {user.isAuthenticated ?<div className='cursor-pointer '> <Notification/></div> : null}
            {user.isAuthenticated ? 
            <Link to='/chat'> 
              <div className=''>
              {howMuchUnreadMessages > 0 ? (<span class="relative flex h-3 w-3">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
              </span>) : null}
                <svg className={`w-6 h-6 cursor-pointer text-gray-800 ${howMuchUnreadMessages > 0 ? 'mb-2' : ''}`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7.556 8.5h8m-8 3.5H12m7.111-7H4.89a.896.896 0 0 0-.629.256.868.868 0 0 0-.26.619v9.25c0 .232.094.455.26.619A.896.896 0 0 0 4.89 16H9l3 4 3-4h4.111a.896.896 0 0 0 .629-.256.868.868 0 0 0 .26-.619v-9.25a.868.868 0 0 0-.26-.619.896.896 0 0 0-.63-.256Z"/>
                </svg>
              </div>
            </Link>
            :
            null}
            </ul>
          </div>
          <div class="flex items-center gap-2">
            {user.isAuthenticated ? 
            <>
              {user.isAdmin ? 
              <>
                <div className="relative inline-block">
                  <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-3xl">👑</span>
                  <Link to="/adminDashboard">
                    <img
                      src={user.avatar || Avatar}
                      alt="avatar"
                      className="w-10 h-10 rounded-full"
                    />
                  </Link>
                </div>
                <Link to="/adminDashboard">
                  <p>{user.username}</p>
                </Link>
              </>
              : 
              <>
                <Link to='/account'><img src={user.avatar || Avatar} alt='avatar' className='w-10 h-10 ml- rounded-full' /></Link>
                <Link to='/account'><p>{user.username}</p></Link>
              </>
              }
       
              <button onClick={logout} className='transition-all duration-200 text-red-500 ml-6 hover:scale-[120%]'><MdLogout size={25} /></button>
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