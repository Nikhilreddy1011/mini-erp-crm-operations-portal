import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppLayout } from './layouts/AppLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Customers } from './pages/Customers';
import { CustomerDetail } from './pages/CustomerDetail';
import { Products } from './pages/Products';
import { Inventory } from './pages/Inventory';
import { Challans } from './pages/Challans';
import { ChallanDetail } from './pages/ChallanDetail';
import { ChallanForm } from './pages/ChallanForm';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            
            <Route path="/customers" element={<Customers />} />
            <Route path="/customers/:id" element={<CustomerDetail />} />

            <Route path="/products" element={<Products />} />
            
            <Route path="/inventory" element={<Inventory />} />

            <Route path="/challans" element={<Challans />} />
            <Route path="/challans/new" element={<ChallanForm />} />
            <Route path="/challans/:id" element={<ChallanDetail />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
