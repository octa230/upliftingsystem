import React from 'react';
import ReactDOM from 'react-dom/client';
import { StoreProvider } from './utils/Store';
import App from './App'
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <StoreProvider>
        <App />
    </StoreProvider>
  </React.StrictMode>
);
ServiceWorkerRegistration.register()

