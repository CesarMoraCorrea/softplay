import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginThunk } from "../../../redux/slices/authSlice.js";
import { Navigate, Link, useLocation } from "react-router-dom";
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaSpinner } from "react-icons/fa";
import Captcha from "../../../components/common/Captcha.jsx";
import AuthSplitLayout from "../layouts/AuthSplitLayout.jsx";

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
  const location = useLocation();
  const from = location.state?.from || null;
  const authMessage = location.state?.message || null;

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

  if (user) {
    if (from) return <Navigate to={from} replace />;
    
    if (user.role === "admin_sistema") return <Navigate to="/admin/sistema?tab=reportes" replace />;
    if (user.role === "admin_cancha") return <Navigate to="/home" replace />;
    return <Navigate to="/canchas" replace />; // Usuario
  }

  return (
    <AuthSplitLayout>
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-1 transition-colors duration-300">
          Soft<span className="text-blue-600 dark:text-blue-400">play</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 font-medium transition-colors duration-300">Ingresa a tu cuenta para continuar</p>
      </div>

      {authMessage && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-4 transition-colors duration-300">
          <p className="text-blue-700 dark:text-blue-400 text-sm font-medium text-center">{authMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
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
          {formErrors.password && (
            <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1 mt-1 transition-colors duration-300">
              <span className="w-1 h-1 bg-red-600 dark:bg-red-400 rounded-full"></span>
              {formErrors.password}
            </p>
          )}
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

        {/* Forgot Password */}
        <div className="flex justify-end">
          <Link 
            to="/forgot-password"
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold hover:underline transition-colors duration-300"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || Object.keys(formErrors).length > 0 || !captchaVerified}
          className="w-full bg-blue-600 text-white py-2.5 px-6 rounded-xl font-semibold
                   hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900
                   disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 transition-all duration-300
                   shadow-lg hover:shadow-blue-600/30"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <FaSpinner className="animate-spin" />
              Ingresando...
            </span>
          ) : (
            "Iniciar sesión"
          )}
        </button>
      </form>

      {/* Register Link */}
      <div className="text-center mt-4">
        <p className="text-gray-600 dark:text-gray-400 font-medium transition-colors duration-300">
          ¿No tienes una cuenta?{' '}
          <Link 
            to="/register"
            state={{ from }}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-bold hover:underline transition-colors duration-300 ml-1"
          >
            Regístrate
          </Link>
        </p>
      </div>
    </AuthSplitLayout>
  );
}
