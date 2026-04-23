import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth';

export function Shell({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const auth = useAuthStore();

  return (
    <div className="app-shell">
      <header className="topbar">
        <h1>Angren Taxi Web</h1>
        <div>
          {auth.isAuthenticated ? (
            <span>{auth.user?.name}</span>
          ) : (
            <Link to="/login">Войти</Link>
          )}
        </div>
      </header>
      <main>{children}</main>
      <nav className="tabs">
        <Link className={location.pathname === '/' ? 'active' : ''} to="/">Главная</Link>
        <Link className={location.pathname === '/history' ? 'active' : ''} to="/history">История</Link>
        <Link className={location.pathname === '/register' ? 'active' : ''} to="/register">Регистрация</Link>
      </nav>
    </div>
  );
}
