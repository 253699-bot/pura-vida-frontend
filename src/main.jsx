import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './app/App.jsx';
import { BusinessConfigurationProvider } from './app/providers/BusinessConfigurationProvider.jsx';
import { AuthProvider } from './app/providers/AuthProvider.jsx';
import './shared/styles/global.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <BusinessConfigurationProvider>
          <App />
        </BusinessConfigurationProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
