import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'redux';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import LoginView from '../views/LoginView';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authService.login({
        email,
        password,
        captchaInput: captcha
      });

      if (response.token) {
        navigate('/home');
      }
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginView
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      captcha={captcha}
      setCaptcha={setCaptcha}
      loading={loading}
      error={error}
      onSubmit={handleSubmit}
    />
  );
}
