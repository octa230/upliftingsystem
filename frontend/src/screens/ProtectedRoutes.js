import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { Store } from '../utils/Store';
export default function ProtectedRoute({ children }) {
  const { state } = useContext(Store);
  const { userInfoToken } = state;
  return userInfoToken ? children : <Navigate to="/" />;
}
