import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { 
  FiCalendar, 
  FiDollarSign, 
  FiTrendingUp, 
  FiClock, 
  FiActivity, 
  FiMapPin, 
  FiTrendingDown 
} from "react-icons/fi";
import { BarChart3, TrendingUp, HelpCircle } from "lucide-react";
import StatsCard from "../../components/ui/StatsCard";
import { SectionLoader } from "../../components/ui/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import AnimatedContainer from "../../components/ui/AnimatedContainer";
import api from "../../api/axios.js";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
  Cell
} from "recharts";

const COLORS = [
  "#3b82f6", // Blue
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#6366f1", // Indigo
  "#06b6d4"  // Cyan
];

export default function AdminStats() {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("weekly");
  const [sedeId, setSedeId] = useState("");
  const [data, setData] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const params = { period };
      if (sedeId) params.sedeId = sedeId;

      const response = await api.get("/admin/stats", { params });
      if (response.data?.success) {
        setData(response.data.data);
      }
    } catch (error) {
      console.error("Error al cargar estadísticas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [period, sedeId]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getPeriodLabel = () => {
    if (period === "weekly") return "los últimos 7 días";
    if (period === "monthly") return "los últimos 30 días";
    return "el último año";
  };

  if (loading && !data) {
    return <SectionLoader text="Cargando panel de estadísticas..." />;
  }

  const global = data?.global || { totalRevenue: 0, totalReservations: 0, averageTicket: 0 };
  const topCanchas = data?.topCanchas || [];
  const daysDemand = data?.daysDemand || [];
  const peakHours = data?.peakHours || [];
  const evolution = data?.evolution || [];
  const sedesList = data?.sedes || [];

  const mostPopularCancha = topCanchas[0]?.name || "Ninguna";

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header y Filtros */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 dark:bg-blue-900/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        
        <div className="relative z-10">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            Dashboard de Estadísticas
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Analiza el rendimiento, ingresos y reservas de tus establecimientos deportivos.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto relative z-10">
          {/* Selector de Sede */}
          <div className="flex-1 sm:flex-none">
            <select
              value={sedeId}
              onChange={(e) => setSedeId(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none text-sm font-semibold text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas las Sedes</option>
              {sedesList.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Selector de Periodo */}
          <div className="bg-gray-100 dark:bg-gray-700 p-1 rounded-xl flex gap-1 w-full sm:w-auto">
            <button
              onClick={() => setPeriod("weekly")}
              className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                period === "weekly"
                  ? "bg-white dark:bg-gray-600 text-blue-600 dark:text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setPeriod("monthly")}
              className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                period === "monthly"
                  ? "bg-white dark:bg-gray-600 text-blue-600 dark:text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              Mes
            </button>
            <button
              onClick={() => setPeriod("yearly")}
              className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                period === "yearly"
                  ? "bg-white dark:bg-gray-600 text-blue-600 dark:text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              Año
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-10">
          <SectionLoader text="Actualizando datos..." />
        </div>
      )}

      {!loading && data && (
        <>
          {/* KPI Cards */}
          <AnimatedContainer direction="up" delay={100}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="Ingresos Totales"
                value={formatCurrency(global.totalRevenue)}
                change="Ingresos reales cobrados"
                changeType="positive"
                icon={FiDollarSign}
                description={`Reservas confirmadas y pagadas en ${getPeriodLabel()}`}
              />
              <StatsCard
                title="Total de Reservas"
                value={`${global.totalReservations} reservaciones`}
                change="Excluye bloqueos y cancelados"
                changeType="positive"
                icon={FiCalendar}
                description={`Reservaciones agendadas en ${getPeriodLabel()}`}
              />
              <StatsCard
                title="Ticket Promedio"
                value={formatCurrency(global.averageTicket)}
                change="Ingreso medio por reserva"
                changeType="neutral"
                icon={FiActivity}
                description="Total de ingresos / total de reservas"
              />
              <StatsCard
                title="Cancha Más Popular"
                value={mostPopularCancha}
                change="Mayor cantidad de alquileres"
                changeType="neutral"
                icon={FiMapPin}
                description="La cancha preferida por tus clientes"
              />
            </div>
          </AnimatedContainer>

          {/* Gráfico 1: Evolución Temporal */}
          <AnimatedContainer direction="up" delay={200}>
            <Card className="p-6">
              <CardHeader className="px-0 pt-0 pb-4">
                <CardTitle className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Evolución Temporal de Ingresos y Reservas
                </CardTitle>
              </CardHeader>
              <CardContent className="px-0 pb-0 h-80">
                {evolution.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <FiActivity className="w-12 h-12 mb-2 opacity-50" />
                    <span>No hay datos suficientes para mostrar la evolución temporal.</span>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={evolution} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-gray-700" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#9ca3af" 
                        fontSize={11} 
                        tickLine={false} 
                      />
                      <YAxis 
                        yAxisId="left" 
                        stroke="#3b82f6" 
                        fontSize={11} 
                        tickLine={false} 
                        axisLine={false}
                        tickFormatter={(v) => `$${v / 1000}k`}
                      />
                      <YAxis 
                        yAxisId="right" 
                        orientation="right" 
                        stroke="#8b5cf6" 
                        fontSize={11} 
                        tickLine={false} 
                        axisLine={false}
                      />
                      <RechartsTooltip 
                        contentStyle={{ 
                          backgroundColor: '#1f2937', 
                          border: 'none', 
                          borderRadius: '12px',
                          color: '#fff',
                          fontSize: '12px'
                        }}
                        formatter={(value, name) => {
                          if (name === "Ingresos") return [formatCurrency(value), name];
                          return [value, "Reservas"];
                        }}
                      />
                      <Legend iconType="circle" />
                      <Area 
                        yAxisId="left" 
                        type="monotone" 
                        dataKey="revenue" 
                        name="Ingresos" 
                        stroke="#3b82f6" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorRevenue)" 
                      />
                      <Bar 
                        yAxisId="right" 
                        dataKey="reservationsCount" 
                        name="Reservas" 
                        fill="#8b5cf6" 
                        radius={[4, 4, 0, 0]} 
                        maxBarSize={30}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </AnimatedContainer>

          {/* Gráfico 2: Top Canchas y Días de Mayor Demanda */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Top Canchas */}
            <AnimatedContainer direction="up" delay={300}>
              <Card className="p-6 h-full flex flex-col">
                <CardHeader className="px-0 pt-0 pb-4">
                  <CardTitle className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                    <FiMapPin className="w-5 h-5 text-purple-600" />
                    Top Canchas Más Reservadas
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-0 pb-0 flex-1 h-80">
                  {topCanchas.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                      <FiMapPin className="w-12 h-12 mb-2 opacity-50" />
                      <span>No hay canchas registradas en el período.</span>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={topCanchas}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" className="dark:stroke-gray-700" />
                        <XAxis type="number" stroke="#9ca3af" fontSize={11} tickLine={false} />
                        <YAxis 
                          type="category" 
                          dataKey="name" 
                          stroke="#9ca3af" 
                          fontSize={10} 
                          width={140}
                          tickLine={false}
                        />
                        <RechartsTooltip
                          contentStyle={{ 
                            backgroundColor: '#1f2937', 
                            border: 'none', 
                            borderRadius: '12px',
                            color: '#fff',
                            fontSize: '12px'
                          }}
                          formatter={(value) => [value, "Reservas"]}
                        />
                        <Bar dataKey="reservationsCount" name="Reservas" radius={[0, 4, 4, 0]}>
                          {topCanchas.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </AnimatedContainer>

            {/* Días de Mayor Demanda */}
            <AnimatedContainer direction="up" delay={400}>
              <Card className="p-6 h-full flex flex-col">
                <CardHeader className="px-0 pt-0 pb-4">
                  <CardTitle className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                    <FiCalendar className="w-5 h-5 text-emerald-600" />
                    Días de Mayor Demanda
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-0 pb-0 flex-1 h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={daysDemand} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-gray-700" />
                      <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} tickLine={false} />
                      <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                      <RechartsTooltip
                        contentStyle={{ 
                          backgroundColor: '#1f2937', 
                          border: 'none', 
                          borderRadius: '12px',
                          color: '#fff',
                          fontSize: '12px'
                        }}
                        formatter={(value) => [value, "Reservas"]}
                      />
                      <Bar dataKey="reservationsCount" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </AnimatedContainer>
          </div>

          {/* Gráfico 3: Horarios Pico */}
          <AnimatedContainer direction="up" delay={500}>
            <Card className="p-6">
              <CardHeader className="px-0 pt-0 pb-4">
                <CardTitle className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                  <FiClock className="w-5 h-5 text-amber-500" />
                  Horarios Pico de Afluencia
                </CardTitle>
              </CardHeader>
              <CardContent className="px-0 pb-0 h-72">
                {peakHours.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <FiClock className="w-12 h-12 mb-2 opacity-50" />
                    <span>No hay datos de horarios para el período seleccionado.</span>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={peakHours} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-gray-700" />
                      <XAxis dataKey="hour" stroke="#9ca3af" fontSize={11} tickLine={false} />
                      <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                      <RechartsTooltip
                        contentStyle={{ 
                          backgroundColor: '#1f2937', 
                          border: 'none', 
                          borderRadius: '12px',
                          color: '#fff',
                          fontSize: '12px'
                        }}
                        formatter={(value) => [value, "Reservas"]}
                      />
                      <Bar dataKey="reservationsCount" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </AnimatedContainer>
        </>
      )}
    </div>
  );
}
