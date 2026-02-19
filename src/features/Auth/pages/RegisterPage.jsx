import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { registerThunk } from "../../../redux/slices/authSlice.js";
import { useNavigate } from "react-router-dom";
import RegisterView from "../views/RegisterView.jsx";

/**
 * RegisterPage
 * Página contenedora que maneja la lógica del registro
 * Comunica con Redux y renderiza RegisterView
 */
export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "usuario"
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [captchaId, setCaptchaId] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaVerified, setCaptchaVerified] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector(state => state.auth);

  const roles = [
    { value: "usuario", label: "Usuario", description: "Reservar canchas deportivas" },
    { value: "admin_cancha", label: "Administrador de Cancha", description: "Gestionar canchas y reservas" },
    { value: "admin_sistema", label: "Administrador de Sistema", description: "Control total del sistema" }
  ];

  // Validaciones en tiempo real
  useEffect(() => {
    const errors = {};

    if (touched.name && !formData.name.trim()) {
      errors.name = "El nombre es requerido";
    } else if (touched.name && formData.name.trim().length < 2) {
      errors.name = "El nombre debe tener al menos 2 caracteres";
    }

    if (touched.email && !formData.email) {
      errors.email = "El email es requerido";
    } else if (touched.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Formato de email inválido";
    }

    if (touched.password && !formData.password) {
      errors.password = "La contraseña es requerida";
    } else if (touched.password && formData.password.length < 8) {
      errors.password = "La contraseña debe tener al menos 8 caracteres";
    }

    if (touched.confirmPassword && formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Las contraseñas no coinciden";
    }

    if (touched.captcha && !captchaInput) {
      errors.captcha = "El código de verificación es requerido";
    }

    setFormErrors(errors);
  }, [formData, touched, captchaInput]);

  // Calcular fortaleza de contraseña
  useEffect(() => {
    const password = formData.password;
    let strength = 0;
    
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 12.5;
    if (/[^A-Za-z0-9]/.test(password)) strength += 12.5;
    
    setPasswordStrength(Math.min(strength, 100));
  }, [formData.password]);

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

  const handleToggleConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleCaptchaChange = (id, input) => {
    setCaptchaId(id);
    setCaptchaInput(input);
  };

  const handleCaptchaVerified = (isValid) => {
    setCaptchaVerified(isValid);
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 25) return "bg-red-500";
    if (passwordStrength < 50) return "bg-yellow-500";
    if (passwordStrength < 75) return "bg-blue-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 25) return "Muy débil";
    if (passwordStrength < 50) return "Débil";
    if (passwordStrength < 75) return "Buena";
    return "Fuerte";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Marcar todos los campos como tocados
    setTouched({ name: true, email: true, password: true, confirmPassword: true, captcha: true });
    
    // Verificar si hay errores
    if (Object.keys(formErrors).length === 0 && 
        formData.name && formData.email && formData.password && 
        formData.password === formData.confirmPassword && captchaInput && captchaVerified) {
      
      const { confirmPassword, ...dataToSend } = formData;
      const registerData = {
        ...dataToSend,
        captchaId,
        captchaInput
      };
      const result = await dispatch(registerThunk(registerData));
      
      if (result.type.endsWith('/fulfilled')) {
        navigate("/");
      }
    }
  };

  return (
    <RegisterView
      formData={formData}
      showPassword={showPassword}
      showConfirmPassword={showConfirmPassword}
      formErrors={formErrors}
      touched={touched}
      loading={loading}
      error={error}
      passwordStrength={passwordStrength}
      captchaVerified={captchaVerified}
      roles={roles}
      onInputChange={handleInputChange}
      onBlur={handleBlur}
      onTogglePassword={handleTogglePassword}
      onToggleConfirmPassword={handleToggleConfirmPassword}
      onCaptchaChange={handleCaptchaChange}
      onCaptchaVerified={handleCaptchaVerified}
      onSubmit={handleSubmit}
      getPasswordStrengthColor={getPasswordStrengthColor}
      getPasswordStrengthText={getPasswordStrengthText}
    />
  );
}
