import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/slices/authSlice.js";
import { MapPin, Calendar, X, LayoutGrid, UserCog } from "lucide-react";

export default function Sidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);

  return (
    <aside>
      <div className="rounded-xl bg-slate-800 border border-slate-700 p-4">
        {/* Marca + Usuario + Navegación + Logout en una sola tarjeta */}
        <div className="space-y-4">
          {/* Marca */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
              SP
            </div>
            <div>
              <div className="font-semibold text-white">SoftPlay</div>
              <div className="text-sm text-slate-400">Sistema de Reservas</div>
            </div>
          </div>

          <div className="h-px bg-slate-700" />

          {/* Usuario */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-semibold">
              U
            </div>
            <div>
              <div className="font-semibold text-white">Hola, {user?.name || "Invitado"}</div>
              <div className="text-sm text-slate-300">{user?.email || "usuario@gmail.com"}</div>
              <span className="mt-2 inline-block text-xs bg-slate-700 text-slate-200 px-2 py-1 rounded">
                Usuario
              </span>
            </div>
          </div>

          <div className="h-px bg-slate-700" />

          {/* Navegación (en la misma tarjeta) */}
          <nav className="space-y-2">
            <Link
              to="/canchas"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-700 text-slate-200"
            >
              <MapPin className="w-5 h-5" />
              <span>Canchas</span>
            </Link>
            <Link
              to="/reservas"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-700 text-slate-200"
            >
              <Calendar className="w-5 h-5" />
              <span>Mis Reservas</span>
            </Link>
            {user?.role === "admin_sistema" && (
              <Link
                to="/admin/sistema"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-700 text-slate-200"
              >
                <UserCog className="w-5 h-5" />
                <span>Admin Sistema</span>
              </Link>
            )}
            {user?.role === "admin_sistema" && (
              <Link
                to="/admin/canchas"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-700 text-slate-200"
              >
                <LayoutGrid className="w-5 h-5" />
                <span>Admin Canchas</span>
              </Link>
            )}
          </nav>

          <div className="h-px bg-slate-700" />

          {/* Cerrar sesión */}
          <button
            onClick={() => {
              dispatch(logout());
              navigate("/login");
            }}
            className="w-full flex items-center gap-3 p-3 rounded-lg text-red-400 hover:text-red-300"
          >
            <X className="w-5 h-5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
