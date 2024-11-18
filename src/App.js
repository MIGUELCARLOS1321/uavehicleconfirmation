import React, { useState } from 'react';
import { db } from './firebase/firebase'; 
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './YourComponent.css';
import Confirmation from './pages/Confirmation';
import SearchConfirmation from './pages/SearchConfirmation';

export default function App (){
  return(
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Confirmation />} />
          <Route path="/search" element={<SearchConfirmation />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}