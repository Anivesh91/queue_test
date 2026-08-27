import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { AppRoutes } from './routes/AppRoutes';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'queueless-google-client-id-placeholder';

export const App = () => {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <SocketProvider>
              <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200">
                <Navbar />
                <div className="flex-1">
                  <AppRoutes />
                </div>
                <Footer />
              </div>
            </SocketProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
};

export default App;
