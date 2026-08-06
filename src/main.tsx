import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './App.css';
import { ToastProvider } from './components/ui/toast/ToastContext';
import { ToastContainer } from './components/ui/toast/ToastContainer';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ToastProvider>
      <App />
      <ToastContainer />
    </ToastProvider>
  </React.StrictMode>,
);
