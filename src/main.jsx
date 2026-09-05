import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './mock/mockAuthUsers';
import App from './App';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
