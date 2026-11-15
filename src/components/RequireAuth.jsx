import { useAuth } from '../auth.jsx';
import LoginView from './LoginView.jsx';

export default function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null; // Firebase is restoring the last session; avoids flashing the login page
  return user ? children : <LoginView />;
}
