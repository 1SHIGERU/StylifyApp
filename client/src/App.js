import React, { useState, useEffect } from 'react';
import 'react-toastify/dist/ReactToastify.css';
import {BrowserRouter} from 'react-router-dom'
import {AuthWrapper} from './auth/AuthWrapper';
import './App.css';
import { ToastContainer } from 'react-toastify';

function App() {
  return (
    <>
      <BrowserRouter>
        <AuthWrapper />
      </BrowserRouter>

      <ToastContainer 
        stacked
        position="top-right"
        autoClose={3000} // Automatyczne zamykanie po 5 sekundach
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        
      />
    </>
  )
}

export default App