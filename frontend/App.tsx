
import React, { useState } from 'react';
import { ViewState } from './types';
import { StoreProvider } from './contexts/StoreContext';
import { AuthProvider } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import FloatingCalculator from './components/FloatingCalculator';

export default function App() {
  const [view, setView] = useState<ViewState>(ViewState.LANDING);

  return (
    <AuthProvider>
      <StoreProvider>
        <FloatingCalculator />
        
        {view === ViewState.LANDING && (
          <LandingPage onNavigateToLogin={() => setView(ViewState.AUTH)} />
        )}
        
        {view === ViewState.AUTH && (
          <AuthPage 
            onLoginSuccess={() => setView(ViewState.DASHBOARD)} 
            onBack={() => setView(ViewState.LANDING)}
          />
        )}
        
        {view !== ViewState.LANDING && view !== ViewState.AUTH && (
          <DashboardPage onLogout={() => setView(ViewState.LANDING)} />
        )}
      </StoreProvider>
    </AuthProvider>
  );
}
