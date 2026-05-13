import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { registerThunk } from "../../../redux/slices/authSlice.js";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaUserTag, FaSpinner, FaCheckCircle, FaChevronDown } from "react-icons/fa";
import Captcha from "../../../components/common/Captcha.jsx";
import AuthSplitLayout from "../layouts/AuthSplitLayout.jsx";

export default function RegisterPage() {
  const location = useLocation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: location.state?.role || "usuario"
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [captchaId, setCaptchaId] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector(state => state.auth);
  // Capturar la ruta de retorno guardada por ProtectedRoute
  const from = location.state?.from || null;

  const roles = [
    { value: "usuario", label: "Usuario" },
    { value: "admin_cancha", label: "Administrador de Cancha" }
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
        const registeredUser = result.payload?.user;
        // Si había una ruta de retorno guardada (deep-linking), ir allí primero
        if (from) {
          navigate(from, { replace: true });
        } else if (registeredUser?.role === 'admin_sistema') {
          navigate('/admin/sistema');
        } else if (registeredUser?.role === 'admin_cancha') {
          navigate('/admin/canchas');
        } else {
          navigate('/canchas');
        }
      }
    }
  };

  return (
    <AuthSplitLayout>
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-1 transition-colors duration-300">
          Soft<span className="text-blue-600 dark:text-blue-400">play</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 font-medium transition-colors duration-300">Únete y comienza a reservar canchas</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Name Field */}
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 transition-colors duration-300">
            Nombre completo
          </label>
          <div className="relative shadow-sm rounded-xl">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FaUser className="text-gray-400 dark:text-gray-500 transition-colors duration-300" />
            </div>
            <input
              id="name"
              type="text"
              className={`w-full pl-11 pr-4 py-2.5 bg-white dark:bg-gray-800 border-2 rounded-xl focus:outline-none transition-colors duration-300 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${
                formErrors.name 
                  ? 'border-red-300 dark:border-red-600 focus:border-red-500 bg-red-50/50 dark:bg-red-900/20' 
                  : 'border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-500 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              placeholder="Juan Pérez"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              onBlur={() => handleBlur('name')}
              disabled={loading}
            />
          </div>
          {formErrors.name && (
            <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1 mt-1 transition-colors duration-300">
              <span className="w-1 h-1 bg-red-600 dark:bg-red-400 rounded-full"></span>
              {formErrors.name}
            </p>
          )}
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 transition-colors duration-300">
            Correo electrónico
          </label>
          <div className="relative shadow-sm rounded-xl">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FaEnvelope className="text-gray-400 dark:text-gray-500 transition-colors duration-300" />
            </div>
            <input
              id="email"
              type="email"
              className={`w-full pl-11 pr-4 py-2.5 bg-white dark:bg-gray-800 border-2 rounded-xl focus:outline-none transition-colors duration-300 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${
                formErrors.email 
                  ? 'border-red-300 dark:border-red-600 focus:border-red-500 bg-red-50/50 dark:bg-red-900/20' 
                  : 'border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-500 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              placeholder="tu@email.com"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              disabled={loading}
            />
          </div>
          {formErrors.email && (
            <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1 mt-1 transition-colors duration-300">
              <span className="w-1 h-1 bg-red-600 dark:bg-red-400 rounded-full"></span>
              {formErrors.email}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 transition-colors duration-300">
            Contraseña
          </label>
          <div className="relative shadow-sm rounded-xl">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FaLock className="text-gray-400 dark:text-gray-500 transition-colors duration-300" />
            </div>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              className={`w-full pl-11 pr-12 py-2.5 bg-white dark:bg-gray-800 border-2 rounded-xl focus:outline-none transition-colors duration-300 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${
                formErrors.password 
                  ? 'border-red-300 dark:border-red-600 focus:border-red-500 bg-red-50/50 dark:bg-red-900/20' 
                  : 'border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-500 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              onBlur={() => handleBlur('password')}
              disabled={loading}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors duration-300 p-2"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          
          {/* Password Strength Indicator */}
          {formData.password && (
            <div className="space-y-1 mt-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden transition-colors duration-300">
                  <div 
                    className={`h-1.5 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                    style={{ width: `${passwordStrength}%` }}
                  ></div>
                </div>
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 w-16 text-right transition-colors duration-300">
                  {getPasswordStrengthText()}
                </span>
              </div>
            </div>
          )}
          
          {formErrors.password && (
            <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1 mt-1 transition-colors duration-300">
              <span className="w-1 h-1 bg-red-600 dark:bg-red-400 rounded-full"></span>
              {formErrors.password}
            </p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 transition-colors duration-300">
            Confirmar contraseña
          </label>
          <div className="relative shadow-sm rounded-xl">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FaCheckCircle className="text-gray-400 dark:text-gray-500 transition-colors duration-300" />
            </div>
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              className={`w-full pl-11 pr-12 py-2.5 bg-white dark:bg-gray-800 border-2 rounded-xl focus:outline-none transition-colors duration-300 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${
                formErrors.confirmPassword 
                  ? 'border-red-300 dark:border-red-600 focus:border-red-500 bg-red-50/50 dark:bg-red-900/20' 
                  : formData.confirmPassword && formData.password === formData.confirmPassword
                    ? 'border-blue-300 dark:border-blue-600 focus:border-blue-500 dark:focus:border-blue-500 bg-blue-50/30 dark:bg-blue-900/10'
                    : 'border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-500 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              onBlur={() => handleBlur('confirmPassword')}
              disabled={loading}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors duration-300 p-2"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={loading}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {formErrors.confirmPassword && (
            <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1 mt-1 transition-colors duration-300">
              <span className="w-1 h-1 bg-red-600 dark:bg-red-400 rounded-full"></span>
              {formErrors.confirmPassword}
            </p>
          )}
        </div>

        {/* Role Selection (Dropdown) */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 transition-colors duration-300">
            <FaUserTag className="text-gray-400 dark:text-gray-500 transition-colors duration-300" />
            Tipo de cuenta
          </label>
          <div className="relative shadow-sm rounded-xl">
            <div 
              onClick={() => !loading && setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className={`w-full px-4 py-2.5 bg-white dark:bg-gray-800 border-2 ${isRoleDropdownOpen ? 'border-blue-500 dark:border-blue-500' : 'border-gray-200 dark:border-gray-700'} rounded-xl focus:outline-none hover:border-gray-300 dark:hover:border-gray-600 transition-colors duration-300 text-gray-900 dark:text-white cursor-pointer flex justify-between items-center ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span className="font-medium">{roles.find(r => r.value === formData.role)?.label || "Seleccionar..."}</span>
              <FaChevronDown className={`text-gray-400 dark:text-gray-500 transition-transform duration-300 ${isRoleDropdownOpen ? 'rotate-180' : ''}`} />
            </div>
            
            {/* Custom Dropdown Menu */}
            {isRoleDropdownOpen && !loading && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsRoleDropdownOpen(false)}
                />
                <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden animate-fadeIn">
                  {roles.map((role) => (
                    <div
                      key={role.value}
                      onClick={() => {
                        handleInputChange('role', role.value);
                        setIsRoleDropdownOpen(false);
                      }}
                      className={`px-4 py-3 cursor-pointer transition-colors duration-200 flex items-center gap-2 ${
                        formData.role === role.value 
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-bold' 
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full ${formData.role === role.value ? 'bg-blue-500' : 'bg-transparent'}`} />
                      {role.label}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* CAPTCHA */}
        <div className="pt-2">
          <Captcha 
            onCaptchaChange={handleCaptchaChange}
            onVerifiedChange={handleCaptchaVerified}
            error={formErrors.captcha}
            disabled={loading}
          />
        </div>

        {/* Server Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 transition-colors duration-300">
            <p className="text-red-700 dark:text-red-400 text-sm font-medium text-center">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || Object.keys(formErrors).length > 0 || !captchaVerified}
          className="w-full bg-blue-600 text-white py-2.5 px-6 rounded-xl font-semibold
                   hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900
                   disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 transition-all duration-300
                   shadow-lg hover:shadow-blue-600/30 mt-2"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <FaSpinner className="animate-spin" />
              Creando cuenta...
            </span>
          ) : (
            "Crear cuenta"
          )}
        </button>
      </form>

      {/* Login Link */}
      <div className="text-center mt-4">
        <p className="text-gray-600 dark:text-gray-400 font-medium transition-colors duration-300">
          ¿Ya tienes una cuenta?{' '}
          <Link 
            to="/login"
            state={{ from }}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-bold hover:underline transition-colors duration-300 ml-1"
          >
            Inicia sesión
          </Link>
        </p>
      </div>
    </AuthSplitLayout>
  );
}
