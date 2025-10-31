import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  FiCalendar, 
  FiMapPin, 
  FiDollarSign, 
  FiUsers,
  FiTrendingUp,
  FiClock,
  FiActivity
} from 'react-icons/fi';
import StatsCard from '../components/ui/StatsCard';
import { SectionLoader } from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import AnimatedContainer, { AnimatedList, HoverCard } from '../components/ui/AnimatedContainer';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useSelector(state => state.auth);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalReservas: 0,
    reservasActivas: 0,
    ingresosMes: 0,
    canchasDisponibles: 0
  });

  useEffect(() => {
    // Simular carga de datos
    const loadDashboardData = async () => {
      try {
        // Aquí irían las llamadas reales a la API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setStats({
          totalReservas: 156,
          reservasActivas: 23,
          ingresosMes: 45600,
          canchasDisponibles: 12
        });
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  if (loading) {
    return <SectionLoader text="Cargando dashboard..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header de bienvenida */}
      <AnimatedContainer direction="fade" duration={600}>
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">
                {getGreeting()}, {user?.nombre || 'Usuario'}! 👋
              </h1>
              <p className="text-blue-100">
                Aquí tienes un resumen de tu actividad reciente
              </p>
            </div>
            <div className="hidden md:block">
              <FiActivity className="w-16 h-16 text-blue-200" />
            </div>
          </div>
        </div>
      </AnimatedContainer>

      {/* Estadísticas principales */}
      <AnimatedContainer delay={200} direction="up">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <HoverCard>
            <StatsCard
              title="Total Reservas"
              value={stats.totalReservas}
              change="+12% vs mes anterior"
              changeType="positive"
              icon={FiCalendar}
              description="Reservas realizadas este mes"
            />
          </HoverCard>
          
          <HoverCard>
            <StatsCard
              title="Reservas Activas"
              value={stats.reservasActivas}
              change="+5 nuevas hoy"
              changeType="positive"
              icon={FiClock}
              description="Reservas confirmadas pendientes"
            />
          </HoverCard>
          
          <HoverCard>
            <StatsCard
              title="Ingresos del Mes"
              value={formatCurrency(stats.ingresosMes)}
              change="+8.2% vs mes anterior"
              changeType="positive"
              icon={FiDollarSign}
              description="Ingresos generados este mes"
            />
          </HoverCard>
          
          <HoverCard>
            <StatsCard
              title="Canchas Disponibles"
              value={stats.canchasDisponibles}
              change="2 nuevas agregadas"
              changeType="neutral"
              icon={FiMapPin}
              description="Canchas activas en el sistema"
            />
          </HoverCard>
        </div>
      </AnimatedContainer>

      {/* Acciones rápidas */}
      <AnimatedContainer delay={400} direction="up">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reservas recientes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FiCalendar className="w-5 h-5 text-blue-600" />
              Reservas Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <FiMapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Cancha de Fútbol #{item}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Hoy, 18:00 - 19:00
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-medium rounded-full">
                    Confirmada
                  </span>
                </div>
              ))}
              
              <Link to="/mis-reservas">
                <Button variant="outline" className="w-full">
                  Ver todas las reservas
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Acciones rápidas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FiTrendingUp className="w-5 h-5 text-green-600" />
              Acciones Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Link to="/canchas">
                <Button className="w-full justify-start" variant="outline">
                  <FiMapPin className="w-4 h-4 mr-2" />
                  Buscar Canchas
                </Button>
              </Link>
              
              <Link to="/nueva-reserva">
                <Button className="w-full justify-start" variant="outline">
                  <FiCalendar className="w-4 h-4 mr-2" />
                  Nueva Reserva
                </Button>
              </Link>
              
              <Link to="/mis-reservas">
                <Button className="w-full justify-start" variant="outline">
                  <FiClock className="w-4 h-4 mr-2" />
                  Mis Reservas
                </Button>
              </Link>
              
              {user?.rol === 'admin' && (
                <Link to="/admin/reportes">
                  <Button className="w-full justify-start" variant="outline">
                    <FiTrendingUp className="w-4 h-4 mr-2" />
                    Ver Reportes
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
        </div>
      </AnimatedContainer>

      {/* Gráfico de actividad (placeholder) */}
      <AnimatedContainer delay={600} direction="up">
        <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FiTrendingUp className="w-5 h-5 text-purple-600" />
            Actividad de Reservas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <FiTrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                Gráfico de actividad próximamente
              </p>
            </div>
          </div>
        </CardContent>
        </Card>
      </AnimatedContainer>
    </div>
  );
};

export default Dashboard;