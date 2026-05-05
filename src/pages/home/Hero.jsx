import React from "react";
import { Link } from "react-router-dom";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";

export default function Hero() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-140px)] w-full">
      <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 sm:p-8 md:p-10 w-full max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
        Reserva tu cancha ahora
      </h1>

      <p className="mt-4 text-gray-600 dark:text-gray-300 text-base sm:text-lg md:text-xl max-w-2xl">
        Encuentra y reserva las mejores canchas deportivas cerca de ti. Fútbol, tenis, básquet,
        pádel y más deportes disponibles con reserva inmediata.
      </p>

      <div className="mt-8 flex flex-col sm:flex-row gap-4">
        <Link to="/canchas" className="w-full sm:w-auto">
          <Button variant="primary" size="lg" className="w-full sm:w-auto hover:shadow-lg">
            Reservar ahora
          </Button>
        </Link>
        <Link to="/reservas" className="w-full sm:w-auto">
          <Button variant="outline" size="lg" className="w-full sm:w-auto">
            Mis reservas
          </Button>
        </Link>
      </div>

      <div className="mt-8 md:mt-12">
        <Link to="/canchas" aria-label="Ir a listado de canchas" className="block max-w-sm sm:max-w-md md:max-w-2xl mx-auto opacity-80 hover:opacity-100 transition-opacity">
          <div className="text-center text-gray-800 dark:text-white font-semibold text-sm md:text-base mb-1 md:mb-2">SoftPlay</div>
          <svg
            viewBox="0 0 400 240"
            className="w-full h-auto rounded-xl bg-transparent text-blue-600 dark:text-blue-400"
          >
            <rect
              x="10"
              y="10"
              width="380"
              height="220"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            />
            <line x1="200" y1="10" x2="200" y2="230" stroke="currentColor" strokeWidth="2" />
            <circle cx="200" cy="120" r="26" fill="none" stroke="currentColor" strokeWidth="2" />
            <rect
              x="40"
              y="70"
              width="60"
              height="100"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
            <rect
              x="300"
              y="70"
              width="60"
              height="100"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        </Link>
      </div>
    </section>
    </div>
  );
}
