import { useState, useEffect } from "react";
import { FaSun, FaMoon } from "react-icons/fa";
import { useTheme } from "../../../contexts/ThemeContext.jsx";

const slides = [
  {
    image: "/assets/auth/soccer_court.png",
    text: "Gestiona tu club con un solo clic",
  },
  {
    image: "/assets/auth/tennis_court.png",
    text: "Más de 10,000 usuarios activos",
  },
  {
    image: "/assets/auth/padel_court.png",
    text: "Presencia en más de 15 ciudades",
  }
];

export default function AuthSplitLayout({ children }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white dark:bg-gray-900 font-sans transition-colors duration-300">
      {/* Left Panel: Dynamic Carousel (60%) */}
      <div className="hidden lg:flex lg:w-[60%] relative overflow-hidden bg-gray-900">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            {/* Ken Burns Effect Wrapper */}
            <div 
              className={`w-full h-full transform transition-transform duration-[6000ms] ease-linear ${
                index === currentSlide ? "scale-110" : "scale-100"
              }`}
            >
              <img
                src={slide.image}
                alt={`Softplay ${index}`}
                className="object-cover w-full h-full"
              />
            </div>

            {/* Overlays: Deep Blue + Dark Gradient */}
            <div className="absolute inset-0 bg-blue-900/50 mix-blend-multiply" />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/20 to-transparent opacity-90" />
            
            {/* Text Overlay */}
            <div className="absolute bottom-24 left-16 z-20 max-w-xl">
              <h2 
                className={`text-5xl font-bold text-white mb-4 leading-tight drop-shadow-md transform transition-all duration-700 ease-out ${
                  index === currentSlide ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                }`}
                style={{ transitionDelay: index === currentSlide ? '300ms' : '0ms' }}
              >
                {slide.text}
              </h2>
              <div className="h-1 w-20 bg-blue-500 rounded-full mb-6"></div>
              <p 
                className={`text-xl text-gray-200 font-medium tracking-wide transform transition-all duration-700 ease-out ${
                  index === currentSlide ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                }`}
                style={{ transitionDelay: index === currentSlide ? '500ms' : '0ms' }}
              >
                Únete a la plataforma deportiva líder y lleva la administración de tus canchas al siguiente nivel.
              </p>
            </div>
          </div>
        ))}

        {/* Carousel Indicators */}
        <div className="absolute bottom-8 left-16 z-20 flex gap-3">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentSlide ? "w-8 bg-blue-500" : "w-2 bg-white/50 hover:bg-white"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Right Panel: Form Area (40%) */}
      <div className="w-full lg:w-[40%] flex flex-col justify-center bg-white dark:bg-gray-900 relative overflow-y-auto min-h-screen transition-colors duration-300">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="absolute top-4 right-6 p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors shadow-sm"
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <FaSun size={20} /> : <FaMoon size={20} />}
        </button>

        <div className="w-full px-8 py-6 sm:px-12 lg:px-16 mx-auto max-w-xl">
          {children}
        </div>
      </div>
    </div>
  );
}
