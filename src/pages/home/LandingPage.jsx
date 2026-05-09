import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaCalendarCheck, FaMoneyBillWave, FaChartBar, FaMobileAlt, FaUserFriends, FaHistory, FaArrowRight, FaUsers, FaMapMarkerAlt, FaCheckCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';
import api from '../../api/axios';

export default function LandingPage() {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [stats, setStats] = useState({ users: 0, sedes: 0, reservas: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/stats');
        if (data.success) {
          setStats(data.data);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };
    fetchStats();
  }, []);

  const handleRegisterClick = (e) => {
    e.preventDefault();
    if (user && (user.role === 'admin_cancha' || user.role === 'admin_sistema')) {
      navigate('/admin/canchas');
    } else {
      navigate('/register', { state: { role: 'admin_cancha' } });
    }
  };

  // Variantes de animación
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-900 font-sans overflow-x-hidden transition-colors duration-300">
      
      {/* HERO SECTION */}
      <section 
        className="relative min-h-[600px] h-[85vh] w-full flex items-center justify-center overflow-hidden bg-white dark:bg-gray-900 transition-colors duration-300"
        style={{ clipPath: "polygon(0 0, 100% 0, 100% 90%, 0 100%)" }}
      >
        {/* Background Image & Overlays */}
        <div className="absolute inset-0 z-0">
          <motion.img 
            initial={{ scale: 1.1 }}
            animate={{ scale: 1.05 }}
            transition={{ duration: 10, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
            src="/assets/auth/soccer_court.png" 
            alt="Softplay Sports Ground" 
            className="w-full h-full object-cover object-center"
          />
          {/* Overlay for contrast (Light/Dark aware) */}
          <div className="absolute inset-0 bg-white/85 dark:bg-gray-900/70 mix-blend-normal dark:mix-blend-multiply transition-colors duration-300" />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 dark:from-gray-900 dark:via-gray-900/80 to-transparent transition-colors duration-300" />
        </div>

        {/* Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-12 flex flex-col lg:flex-row items-center gap-12">
          
          {/* Left Text */}
          <motion.div 
            initial="hidden" animate="visible" variants={staggerContainer}
            className="lg:w-1/2"
          >
            <motion.span variants={fadeUp} className="inline-block py-1.5 px-4 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 font-bold text-xs uppercase tracking-wider mb-6 border border-blue-200 dark:border-blue-500/30 shadow-sm transition-colors duration-300">
              La evolución del deporte amateur
            </motion.span>
            
            <motion.h1 variants={fadeUp} className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 dark:text-white leading-[1.1] mb-6 drop-shadow-sm transition-colors duration-300">
              Transformamos la{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-500 dark:from-blue-400 dark:to-green-400">
                gestión deportiva
              </span>
            </motion.h1>
            
            <motion.p variants={fadeUp} className="text-lg sm:text-xl text-gray-700 dark:text-gray-300 mb-10 max-w-xl leading-relaxed drop-shadow-sm transition-colors duration-300">
              La plataforma definitiva que conecta a dueños de canchas con deportistas apasionados. Gestiona, reserva y juega sin complicaciones.
            </motion.p>
            
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/canchas" 
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-2xl font-bold transition-all transform hover:-translate-y-1 shadow-[0_0_20px_rgba(37,99,235,0.3)] dark:shadow-[0_0_20px_rgba(37,99,235,0.4)]"
              >
                Explorar Canchas
                <FaArrowRight />
              </Link>
              <button 
                onClick={handleRegisterClick}
                className="flex items-center justify-center gap-2 bg-white/60 dark:bg-white/10 hover:bg-white/90 dark:hover:bg-white/20 backdrop-blur-md text-gray-900 dark:text-white border border-gray-200 dark:border-white/20 px-8 py-4 rounded-2xl font-bold transition-all transform hover:-translate-y-1 shadow-sm dark:shadow-lg"
              >
                Registrar mi Sede
              </button>
            </motion.div>
          </motion.div>

          {/* Right Floating Stats (Glassmorphism) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.4 }}
            className="hidden lg:flex lg:w-1/2 relative h-full items-center justify-center"
          >
            {/* Stat 1 */}
            <motion.div 
              animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-10 right-20 bg-white/70 dark:bg-gray-800/60 backdrop-blur-xl border border-white/40 dark:border-gray-600/50 p-6 rounded-3xl shadow-xl flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center text-green-600 dark:text-green-400">
                <FaMapMarkerAlt className="text-xl" />
              </div>
              <div>
                <p className="text-3xl font-black text-gray-900 dark:text-white">+{stats.sedes}</p>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-widest">Sedes Activas</p>
              </div>
            </motion.div>

            {/* Stat 2 */}
            <motion.div 
              animate={{ y: [0, 10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-10 right-40 bg-white/70 dark:bg-gray-800/60 backdrop-blur-xl border border-white/40 dark:border-gray-600/50 p-6 rounded-3xl shadow-xl flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500/20 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
                <FaUsers className="text-xl" />
              </div>
              <div>
                <p className="text-3xl font-black text-gray-900 dark:text-white">+{stats.users}</p>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-widest">Deportistas</p>
              </div>
            </motion.div>

            {/* Stat 3 */}
            <motion.div 
              animate={{ y: [0, -8, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              className="absolute top-1/2 left-0 transform -translate-y-1/2 bg-white/70 dark:bg-gray-800/60 backdrop-blur-xl border border-white/40 dark:border-gray-600/50 p-5 rounded-3xl shadow-xl flex items-center gap-4"
            >
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <FaCalendarCheck className="text-lg" />
              </div>
              <div>
                <p className="text-2xl font-black text-gray-900 dark:text-white">+{stats.reservas}</p>
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-widest">Reservas</p>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </section>

      {/* ADMINISTRATOR BLOCK (Bento Box Design) */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900 relative mt-[-5vh] transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 relative z-10 pt-16">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={fadeUp}
            className="text-center mb-16"
          >
            <h2 className="text-sm font-black text-green-600 dark:text-green-400 tracking-[0.2em] uppercase mb-3 transition-colors duration-300">Para el Administrador</h2>
            <h3 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white transition-colors duration-300">Lleva tu club al siguiente nivel</h3>
          </motion.div>

          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Main Feature - Spans 2 columns */}
            <motion.div variants={fadeUp} className="md:col-span-2 md:row-span-2 bg-white dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 p-10 rounded-[2.5rem] hover:border-green-400/50 hover:shadow-[0_0_40px_rgba(74,222,128,0.15)] transition-all duration-500 group flex flex-col justify-center">
              <div className="w-20 h-20 rounded-[1.5rem] bg-green-100 dark:bg-green-400/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 border border-green-200 dark:border-green-400/20">
                <FaCalendarCheck className="text-4xl text-green-600 dark:text-green-400" />
              </div>
              <h4 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-6 transition-colors duration-300">Sincronización Total en Tiempo Real</h4>
              <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed transition-colors duration-300 max-w-2xl">
                Agenda digital y control de turnos centralizado. Dile adiós al papel, a los cruces de horarios y gestiona todo tu complejo deportivo desde un solo lugar, accesible en cualquier dispositivo.
              </p>
            </motion.div>

            {/* Secondary Feature 1 */}
            <motion.div variants={fadeUp} className="md:col-span-1 bg-white dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 p-8 rounded-[2rem] hover:border-blue-400/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] transition-all duration-500 group">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-400/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 border border-blue-200 dark:border-blue-400/20">
                <FaMoneyBillWave className="text-2xl text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3 transition-colors duration-300">Cero Pérdidas</h4>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed transition-colors duration-300 text-sm">
                Gestión de pagos anticipados integrados. Asegura la asistencia y evita las molestas cancelaciones de último minuto que afectan tu rentabilidad.
              </p>
            </motion.div>

            {/* Secondary Feature 2 */}
            <motion.div variants={fadeUp} className="md:col-span-1 bg-white dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 p-8 rounded-[2rem] hover:border-indigo-400/50 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)] transition-all duration-500 group">
              <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-400/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 border border-indigo-200 dark:border-indigo-400/20">
                <FaChartBar className="text-2xl text-indigo-600 dark:text-indigo-400" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3 transition-colors duration-300">Estadísticas Clave</h4>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed transition-colors duration-300 text-sm">
                Reportes automáticos de ingresos, métricas de ocupación semanal y análisis profundo para que tomes decisiones basadas en datos reales.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* PLAYER BLOCK (Floating Interactive UI Elements) */}
      <section className="py-24 bg-white dark:bg-gray-900 relative transition-colors duration-300 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-16">
            
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={staggerContainer}
              className="md:w-1/2"
            >
              <motion.h2 variants={fadeUp} className="text-sm font-black text-blue-600 dark:text-blue-400 tracking-[0.2em] uppercase mb-3 transition-colors duration-300">Para el Jugador</motion.h2>
              <motion.h3 variants={fadeUp} className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight transition-colors duration-300">Tu próximo partido a un toque de distancia</motion.h3>
              <motion.p variants={fadeUp} className="text-lg text-gray-600 dark:text-gray-400 mb-12 leading-relaxed transition-colors duration-300">
                Diseñado para la comunidad. Organizar a tu equipo nunca había sido tan fácil, rápido y transparente. Todo desde tu teléfono.
              </motion.p>

              <div className="space-y-10">
                <motion.div variants={fadeUp} className="flex gap-6 items-start group">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center shrink-0 group-hover:bg-blue-600 transition-colors duration-300">
                    <FaMobileAlt className="text-2xl text-blue-600 dark:text-blue-400 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">Reserva Fácil</h4>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed transition-colors duration-300">Explora disponibilidad en tiempo real y asegura tu cancha favorita desde tu móvil en cuestión de segundos.</p>
                  </div>
                </motion.div>

                <motion.div variants={fadeUp} className="flex gap-6 items-start group">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center shrink-0 group-hover:bg-blue-600 transition-colors duration-300">
                    <FaUserFriends className="text-2xl text-blue-600 dark:text-blue-400 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">Pagos Compartidos</h4>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed transition-colors duration-300">Divide la cuenta automáticamente con tus amigos desde la app. Se acabó el estrés de cobrarle a cada uno.</p>
                  </div>
                </motion.div>

                <motion.div variants={fadeUp} className="flex gap-6 items-start group">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center shrink-0 group-hover:bg-blue-600 transition-colors duration-300">
                    <FaHistory className="text-2xl text-blue-600 dark:text-blue-400 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">Seguimiento</h4>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed transition-colors duration-300">Lleva un historial detallado de todos los partidos jugados, tus canchas favoritas y próximos encuentros.</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
              className="md:w-1/2 w-full mt-12 md:mt-0 relative"
            >
              {/* Decorative blob behind image */}
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-[2rem] blur-3xl opacity-30 dark:opacity-20 animate-pulse"></div>
              
              <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800">
                <img 
                  src="/assets/auth/padel_court.png" 
                  alt="Jugadores en acción" 
                  className="w-full h-[600px] object-cover"
                />
              </div>

              {/* Floating Fake UI Elements */}
              <motion.div 
                animate={{ y: [0, -10, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/4 -left-8 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 flex items-center gap-3"
              >
                <FaCheckCircle className="text-green-500 text-2xl" />
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">Reserva Confirmada</p>
                  <p className="text-xs text-gray-500">Pádel - 18:00 hrs</p>
                </div>
              </motion.div>

              <motion.div 
                animate={{ y: [0, 15, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-1/4 -right-8 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 flex items-center gap-3"
              >
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-blue-200 border-2 border-white dark:border-gray-800"></div>
                  <div className="w-8 h-8 rounded-full bg-green-200 border-2 border-white dark:border-gray-800"></div>
                  <div className="w-8 h-8 rounded-full bg-indigo-200 border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs font-bold">+2</div>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">Pago Dividido</p>
                  <p className="text-xs text-green-500">100% Completado</p>
                </div>
              </motion.div>

            </motion.div>

          </div>
        </div>
      </section>

      {/* CTA SECTION (New) */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-br from-blue-900 to-indigo-900">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-4xl md:text-5xl font-black text-white mb-6"
          >
            ¿Listo para entrar a la cancha?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="text-xl text-blue-100 mb-10"
          >
            Únete a la revolución deportiva. Miles de jugadores y administradores ya están ahorrando tiempo con Softplay.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button 
              onClick={handleRegisterClick}
              className="bg-white text-blue-900 px-8 py-4 rounded-2xl font-black text-lg hover:bg-gray-100 transition-colors shadow-xl transform hover:scale-105 duration-300"
            >
              Registrar mi Complejo Deportivo
            </button>
            <Link 
              to="/register" 
              className="bg-blue-800 text-white border border-blue-600 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-colors shadow-lg"
            >
              Soy Deportista
            </Link>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-100 dark:bg-gray-900 py-10 border-t border-gray-200 dark:border-gray-800 text-center transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4">
            Soft<span className="text-blue-600 dark:text-blue-400">play</span>
          </div>
          <p className="text-gray-500 text-sm">© 2026 Softplay. Todos los derechos reservados.</p>
        </div>
      </footer>

    </div>
  );
}
