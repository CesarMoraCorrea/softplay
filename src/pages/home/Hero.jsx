import React from "react";
import { Link } from "react-router-dom";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";

export default function Hero() {
  return (
    <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-8 md:p-10">
      <h1 className="text-4xl md:text-5xl font-extrabold leading-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
        Reserva tu cancha ahora
      </h1>

      <p className="mt-4 text-gray-600 dark:text-gray-300 text-lg max-w-2xl">
        Encuentra y reserva las mejores canchas deportivas cerca de ti. Fútbol, tenis, básquet,
        pádel y más deportes disponibles con reserva inmediata.
      </p>

      <div className="mt-8 flex flex-wrap gap-4">
        <Link to="/canchas">
          <Button variant="primary" size="lg" className="hover:shadow-lg">
            Reservar ahora
          </Button>
        </Link>
        <Link to="/reservas">
          <Button variant="outline" size="lg">
            Mis reservas
          </Button>
        </Link>
      </div>

      <Link to="/canchas" aria-label="Ir a listado de canchas" className="block">
        <div className="text-center text-gray-800 dark:text-white font-semibold mb-2">SoftPlay</div>
        <svg
          viewBox="0 0 400 240"
          className="w-full h-[240px] rounded-xl bg-transparent text-blue-600 dark:text-blue-400"
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
    </section>
  );
}
