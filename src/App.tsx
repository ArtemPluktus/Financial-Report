import React from 'react';
import { Routes, Route } from "react-router-dom";
import { Auth } from './components/Auth';
import { List } from './components/List';
import { AuthProvider } from './components/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';


const App: React.FC = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/list" element={<PrivateRoute><List /></PrivateRoute>} />
      </Routes>
    </AuthProvider>
  );
}

export { App };
