import { useAuth } from '../auth.jsx';
import LoginView from './LoginView.jsx';

export default function RequireAuth({ children }) {
  const { user } = useAuth();
  return user ? children : <LoginView />;
}
