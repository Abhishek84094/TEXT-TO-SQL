import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import { supabase } from './services/supabase';
import { useAppStore } from './store/useAppStore';

function App() {
  const setUser = useAppStore(state => state.setUser);
  const setToken = useAppStore(state => state.setToken);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser({ id: session.user.id, email: session.user.email, name: session.user.user_metadata?.full_name });
        setToken(session.access_token);
        localStorage.setItem('token', session.access_token);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser({ id: session.user.id, email: session.user.email, name: session.user.user_metadata?.full_name });
        setToken(session.access_token);
        localStorage.setItem('token', session.access_token);
      } else {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser, setToken]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
