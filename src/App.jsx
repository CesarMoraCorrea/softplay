import { Routes, Route, Navigate } from "react-router-dom";
import { LoginPage, RegisterPage } from "./features/Auth/index.js";
import CanchasPage from "./pages/CanchasPage.jsx";
import NuevaReserva from "./pages/NuevaReserva.jsx";
import MisReservas from "./pages/MisReservas.jsx";
import ReservaDetalle from "./pages/ReservaDetalle.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import AdminCanchas from "./pages/admin/AdminCanchas.jsx";
import AdminSistema from "./pages/admin/AdminSistema.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import DashboardLayout from "./layouts/DashboardLayout.jsx";
import { ThemeProvider } from "./contexts/ThemeContext.jsx";
import { useSelector } from "react-redux";
import Hero from "./pages/home/Hero.jsx"; 

export default function App() {
  // Mantenemos el acceso al estado de autenticación para las rutas protegidas
  const { user } = useSelector((s) => s.auth);

  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Rutas públicas sin layout */}
        <Route
          path="/canchas"
          element={
            <DashboardLayout>
              <CanchasPage />
            </DashboardLayout>
          }
        />
        {/* Rutas protegidas con DashboardLayout */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Hero />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/reservar/:id"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <NuevaReserva />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/mis-reservas"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <MisReservas />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/reservas"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <MisReservas />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/reservas/:id"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <ReservaDetalle />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/canchas"
          element={
            <ProtectedRoute requireRoles={["admin_cancha", "admin_sistema"]}>
              <DashboardLayout>
                <AdminCanchas />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/sistema"
          element={
            <ProtectedRoute requireRoles={["admin_sistema"]}>
              <DashboardLayout>
                <AdminSistema />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </ThemeProvider>
  );
}
