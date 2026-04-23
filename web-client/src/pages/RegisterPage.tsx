import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register, persistAuth } from '../api/auth';
import { useAuthStore } from '../store/auth';

export function RegisterPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = await register(name, phone, password);
      persistAuth(payload);
      setAuth(payload);
      navigate('/');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card narrow">
      <h2>Регистрация</h2>
      <form onSubmit={handleSubmit}>
        <input placeholder="Имя" value={name} onChange={(e) => setName(e.target.value)} />
        <input placeholder="Телефон" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <input type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error ? <p className="error">{error}</p> : null}
        <button disabled={loading}>{loading ? '...' : 'Создать аккаунт'}</button>
      </form>
      <p>Есть аккаунт? <Link to="/login">Войти</Link></p>
    </section>
  );
}
