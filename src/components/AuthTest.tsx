import { useState } from 'react';
import { register, login } from '../api/auth';

export default function AuthTest() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleRegister = async () => {
    const res = await register(email, password);
    setMessage(res.message);
  };

  const handleLogin = async () => {
    const res = await login(email, password);
    if (res.token) {
      localStorage.setItem('token', res.token);
      setMessage('Connecté ! Token sauvegardé.');
    } else {
      setMessage(res.message);
    }
  };

  return (
    <div>
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input placeholder="Mot de passe" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button onClick={handleRegister}>S'inscrire</button>
      <button onClick={handleLogin}>Se connecter</button>
      {message && <p>{message}</p>}
    </div>
  );
}