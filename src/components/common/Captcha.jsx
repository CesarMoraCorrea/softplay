import React, { useState, useEffect } from 'react';
import { FaRedo, FaShieldAlt } from 'react-icons/fa';
import axios from 'axios';

const Captcha = ({ onCaptchaChange, error, disabled = false }) => {
  const [captchaData, setCaptchaData] = useState(null);
  const [captchaInput, setCaptchaInput] = useState('');
  const [loading, setLoading] = useState(false);

  const generateCaptcha = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/captcha/generate');
      setCaptchaData(response.data);
      setCaptchaInput('');
      // Notificar al componente padre sobre el cambio
      onCaptchaChange(response.data.captchaId, '');
    } catch (error) {
      console.error('Error generando CAPTCHA:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (value) => {
    setCaptchaInput(value);
    onCaptchaChange(captchaData?.captchaId, value);
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  return (
    <div className="space-y-3">
      <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
        <FaShieldAlt className="text-gray-400" />
        Verificación de seguridad
      </label>
      
      {/* CAPTCHA Display */}
      <div className="flex items-center gap-3">
        <div className="flex-1 bg-gray-50 border-2 border-gray-200 rounded-xl p-3 min-h-[60px] flex items-center justify-center">
          {loading ? (
            <div className="flex items-center gap-2 text-gray-500">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span className="text-sm">Generando...</span>
            </div>
          ) : captchaData ? (
            <div 
              dangerouslySetInnerHTML={{ __html: captchaData.captchaSvg }}
              className="captcha-svg"
            />
          ) : (
            <span className="text-gray-400 text-sm">Error cargando CAPTCHA</span>
          )}
        </div>
        
        {/* Refresh Button */}
        <button
          type="button"
          onClick={generateCaptcha}
          disabled={loading || disabled}
          className="p-3 bg-gray-100 hover:bg-gray-200 border-2 border-gray-200 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Generar nuevo CAPTCHA"
        >
          <FaRedo className={`text-gray-600 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
      
      {/* Input Field */}
      <div className="relative">
        <input
          type="text"
          placeholder="Ingresa el código mostrado arriba"
          value={captchaInput}
          onChange={(e) => handleInputChange(e.target.value)}
          disabled={disabled || loading}
          className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl focus:outline-none transition-colors ${
            error 
              ? 'border-red-300 focus:border-red-500 bg-red-50' 
              : 'border-gray-200 focus:border-blue-500 focus:bg-white'
          }`}
        />
      </div>
      
      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <span className="w-1 h-1 bg-red-600 rounded-full"></span>
          {error}
        </p>
      )}
      
      {/* Help Text */}
      <p className="text-xs text-gray-500">
        Ingresa exactamente los caracteres que ves en la imagen. No distingue entre mayúsculas y minúsculas.
      </p>
    </div>
  );
};

export default Captcha;