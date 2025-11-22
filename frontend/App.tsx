
import React, { useEffect, useState } from 'react';
import { Toaster } from 'sonner';
import { ViewState } from './types';
import { StoreProvider } from './contexts/StoreContext';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import SmartCalc from './components/SmartCalc';

function AppShell() {
  const [view, setView] = useState<ViewState>(ViewState.LANDING);
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;
    if (isSignedIn && view !== ViewState.DASHBOARD) {
      setView(ViewState.DASHBOARD);
    } else if (!isSignedIn && view !== ViewState.AUTH && view !== ViewState.LANDING) {
      setView(ViewState.LANDING);
    }
  }, [isLoaded, isSignedIn, view]);

  return (
    <StoreProvider>
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
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <AppShell />
      <SmartCalc />
    </AuthProvider>
  );
}
