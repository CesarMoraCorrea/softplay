import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginThunk } from "../../../redux/slices/authSlice.js";
import { Navigate } from "react-router-dom";
import LoginView from "../views/LoginView.jsx";

/**
 * LoginPage
 * Página contenedora que maneja la lógica del login
 * Comunica con Redux y renderiza LoginView
 */
export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [captchaId, setCaptchaId] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaVerified, setCaptchaVerified] = useState(false);

  const dispatch = useDispatch();
  const { user, loading, error } = useSelector(state => state.auth);

  // Validaciones en tiempo real
  useEffect(() => {
    const errors = {};
    
    if (touched.email && !formData.email) {
      errors.email = "El email es requerido";
    } else if (touched.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Formato de email inválido";
    }

    if (touched.password && !formData.password) {
      errors.password = "La contraseña es requerida";
    }

    if (touched.captcha && !captchaInput) {
      errors.captcha = "El código de verificación es requerido";
    }

    setFormErrors(errors);
  }, [formData, touched, captchaInput]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBlur = (field) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleCaptchaChange = (id, input) => {
    setCaptchaId(id);
    setCaptchaInput(input);
  };

  const handleCaptchaVerified = (isValid) => {
    setCaptchaVerified(isValid);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Marcar todos los campos como tocados
    setTouched({ email: true, password: true, captcha: true });
    
    // Verificar si hay errores
    if (Object.keys(formErrors).length === 0 && formData.email && formData.password && captchaInput && captchaVerified) {
      const loginData = {
        ...formData,
        captchaId,
        captchaInput
      };
      dispatch(loginThunk(loginData));
    }
  };

  // Si ya está logueado, redirige al home
  if (user) return <Navigate to="/home" />;

  // Renderiza la vista con los datos y handlers
  return (
    <LoginView
      formData={formData}
      showPassword={showPassword}
      formErrors={formErrors}
      touched={touched}
      loading={loading}
      error={error}
      captchaVerified={captchaVerified}
      onInputChange={handleInputChange}
      onBlur={handleBlur}
      onTogglePassword={handleTogglePassword}
      onCaptchaChange={handleCaptchaChange}
      onCaptchaVerified={handleCaptchaVerified}
      onSubmit={handleSubmit}
    />
  );
}
