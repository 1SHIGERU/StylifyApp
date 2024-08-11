import React, { useState, useEffect } from 'react';
import {BrowserRouter} from 'react-router-dom'
import {AuthWrapper} from './auth/AuthWrapper';
import './App.css';

function App() {
  return (
    <>
      <BrowserRouter>
        <AuthWrapper />
      </BrowserRouter>
    </>
  )
}

export default App