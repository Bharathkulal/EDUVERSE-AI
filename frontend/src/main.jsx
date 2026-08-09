import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { VoiceAssistantProvider } from './context/VoiceContext';
import { NavigationHistoryProvider } from './context/NavigationContext';
import { validateEnvironment } from './utils/envValidation';
import './index.css';

// Run startup environment validation (logs to console, never throws)
validateEnvironment();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <VoiceAssistantProvider>
            <NavigationHistoryProvider>
              <App />
              <Toaster position="top-right" />
            </NavigationHistoryProvider>
          </VoiceAssistantProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
