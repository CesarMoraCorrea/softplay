import { Link } from "react-router-dom";
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaUserTag, FaSpinner, FaCheckCircle } from "react-icons/fa";
import Captcha from "../../../components/common/Captcha.jsx";

/**
 * RegisterView
 * Componente de vista presentacional para el formulario de registro
 * Recibe props con datos y handlers del componente padre
 */
export default function RegisterView({
  formData,
  showPassword,
  showConfirmPassword,
  formErrors,
  touched,
  loading,
  error,
  passwordStrength,
  captchaVerified,
  roles,
  onInputChange,
  onBlur,
  onTogglePassword,
  onToggleConfirmPassword,
  onCaptchaChange,
  onCaptchaVerified,
  onSubmit,
  getPasswordStrengthColor,
  getPasswordStrengthText
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-green-600 to-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <FaUser className="text-white text-2xl" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Crear cuenta</h1>
          <p className="text-gray-600">Únete y comienza a reservar canchas</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Name Field */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <FaUser className="text-gray-400" />
                Nombre completo
              </label>
              <input
                id="name"
                type="text"
                className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl focus:outline-none transition-colors ${
                  formErrors.name 
                    ? 'border-red-300 focus:border-red-500 bg-red-50' 
                    : 'border-gray-200 focus:border-blue-500 focus:bg-white'
                }`}
                placeholder="Juan Pérez"
                value={formData.name}
                onChange={(e) => onInputChange('name', e.target.value)}
                onBlur={() => onBlur('name')}
                disabled={loading}
              />
              {formErrors.name && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                  {formErrors.name}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <FaEnvelope className="text-gray-400" />
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl focus:outline-none transition-colors ${
                  formErrors.email 
                    ? 'border-red-300 focus:border-red-500 bg-red-50' 
                    : 'border-gray-200 focus:border-blue-500 focus:bg-white'
                }`}
                placeholder="tu@email.com"
                value={formData.email}
                onChange={(e) => onInputChange('email', e.target.value)}
                onBlur={() => onBlur('email')}
                disabled={loading}
              />
              {formErrors.email && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                  {formErrors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <FaLock className="text-gray-400" />
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className={`w-full px-4 py-3 pr-12 bg-gray-50 border-2 rounded-xl focus:outline-none transition-colors ${
                    formErrors.password 
                      ? 'border-red-300 focus:border-red-500 bg-red-50' 
                      : 'border-gray-200 focus:border-blue-500 focus:bg-white'
                  }`}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => onInputChange('password', e.target.value)}
                  onBlur={() => onBlur('password')}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={onTogglePassword}
                  disabled={loading}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                        style={{ width: `${passwordStrength}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-medium text-gray-600">
                      {getPasswordStrengthText()}
                    </span>
                  </div>
                </div>
              )}
              
              {formErrors.password && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                  {formErrors.password}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <FaCheckCircle className="text-gray-400" />
                Confirmar contraseña
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  className={`w-full px-4 py-3 pr-12 bg-gray-50 border-2 rounded-xl focus:outline-none transition-colors ${
                    formErrors.confirmPassword 
                      ? 'border-red-300 focus:border-red-500 bg-red-50' 
                      : formData.confirmPassword && formData.password === formData.confirmPassword
                        ? 'border-green-300 focus:border-green-500 bg-green-50'
                        : 'border-gray-200 focus:border-blue-500 focus:bg-white'
                  }`}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => onInputChange('confirmPassword', e.target.value)}
                  onBlur={() => onBlur('confirmPassword')}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={onToggleConfirmPassword}
                  disabled={loading}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {formErrors.confirmPassword && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                  {formErrors.confirmPassword}
                </p>
              )}
            </div>

            {/* Role Selection */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <FaUserTag className="text-gray-400" />
                Tipo de cuenta
              </label>
              <div className="space-y-2">
                {roles.map((role) => (
                  <label
                    key={role.value}
                    className={`flex items-start gap-3 p-3 border-2 rounded-xl cursor-pointer transition-colors ${
                      formData.role === role.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={role.value}
                      checked={formData.role === role.value}
                      onChange={(e) => onInputChange('role', e.target.value)}
                      className="mt-1 text-blue-600 focus:ring-blue-500"
                      disabled={loading}
                    />
                    <div>
                      <div className="font-medium text-gray-800">{role.label}</div>
                      <div className="text-sm text-gray-600">{role.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* CAPTCHA */}
            <Captcha 
              onCaptchaChange={onCaptchaChange}
              onVerifiedChange={onCaptchaVerified}
              error={formErrors.captcha}
              disabled={loading}
            />

            {/* Server Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || Object.keys(formErrors).length > 0 || !captchaVerified}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-6 rounded-xl font-semibold
                       hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200
                       disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all
                       shadow-lg hover:shadow-xl"
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
        </div>

        {/* Login Link */}
        <div className="text-center mt-8">
          <p className="text-gray-600">
            ¿Ya tienes una cuenta?{' '}
            <Link 
              to="/login" 
              className="text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-colors"
            >
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
