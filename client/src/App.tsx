import React, { useState } from 'react';
import { Spin } from 'antd';
import 'antd/dist/reset.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import ThinkingInterface from './components/ThinkingInterface.simple';
import AdminInterface from './components/AdminInterface';

const AppContent: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [currentPage, setCurrentPage] = useState<'thinking' | 'admin'>('thinking');
  const { user, loading } = useAuth();

  // 检查URL路径来确定当前页面
  React.useEffect(() => {
    const path = window.location.pathname;
    if (path === '/admin') {
      setCurrentPage('admin');
    } else {
      setCurrentPage('thinking');
    }
  }, []);

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#f5f5f5'
      }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!user) {
    return isLogin ? (
      <Login onSwitchToRegister={() => setIsLogin(false)} />
    ) : (
      <Register onSwitchToLogin={() => setIsLogin(true)} />
    );
  }

  if (currentPage === 'admin') {
    return <AdminInterface onBack={() => {
      setCurrentPage('thinking');
      window.history.pushState({}, '', '/');
    }} />;
  }

  return <ThinkingInterface onNavigateToAdmin={() => {
    setCurrentPage('admin');
    window.history.pushState({}, '', '/admin');
  }} />;
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
