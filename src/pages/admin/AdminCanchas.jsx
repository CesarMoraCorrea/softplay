import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { ArrowLeft, Building2, Edit, Layers3, MapPin, Plus, Trash2 } from "lucide-react";
import {
  fetchCanchas,
  createCancha,
  updateCancha,
  deleteCancha,
} from "../../redux/slices/canchasSlice.js";

const initialSedeForm = {
  nombre: "",
  direccion: "",
  barrio: "",
  lat: "",
  lng: "",
  servicios: [],
};

const initialEscenarioForm = {
  nombre: "",
  tipoDeporte: "Fútbol 5",
  superficie: "Sintética",
  precioPorHora: 0,
  activo: true,
};

const tiposDeporte = ["Fútbol", "Fútbol 5", "Fútbol 7", "Fútbol 11", "Tenis", "Padel", "Basquet", "Voley"];
const superficies = ["Sintética", "Natural", "Polvo de ladrillo", "Cemento", "Madera", "Acrílica"];
const serviciosCatalogo = ["Duchas", "Bar", "Parqueadero", "Wifi", "Cafetería", "Vestuarios", "Iluminación"];

const getCoordinates = (sede) => {
  const coordinates = sede?.ubicacion?.coordenadas?.coordinates;
  const lng = coordinates?.[0] ?? sede?.ubicacion?.lng ?? 0;
  const lat = coordinates?.[1] ?? sede?.ubicacion?.lat ?? 0;
  return { lat, lng };
};

const buildSedePayload = (base, escenarios = []) => {
  const { lat, lng } = getCoordinates(base);
  const rawLat = base?.lat ?? lat;
  const rawLng = base?.lng ?? lng;

  return {
    nombre: base?.nombre,
    ubicacion: {
      direccion: base?.direccion ?? base?.ubicacion?.direccion,
      barrio: base?.barrio ?? base?.ubicacion?.barrio,
      coordenadas: {
        type: "Point",
        coordinates: [Number(rawLng), Number(rawLat)],
      },
    },
    servicios: base?.servicios || [],
    escenarios,
    activa: base?.activa ?? true,
  };
};

export default function AdminCanchas() {
  const dispatch = useDispatch();
  const { list: sedes, loading } = useSelector((state) => state.canchas);

  const [sedeForm, setSedeForm] = useState(initialSedeForm);
  const [escenarioForm, setEscenarioForm] = useState(initialEscenarioForm);

  const [editingSedeId, setEditingSedeId] = useState(null);
  const [selectedSedeId, setSelectedSedeId] = useState(null);
  const [editingEscenarioId, setEditingEscenarioId] = useState(null);

  useEffect(() => {
    dispatch(fetchCanchas());
  }, [dispatch]);

  const selectedSede = useMemo(
    () => sedes.find((sede) => String(sede._id) === String(selectedSedeId)) || null,
    [sedes, selectedSedeId]
  );

  const resetSedeForm = () => {
    setSedeForm(initialSedeForm);
    setEditingSedeId(null);
  };

  const resetEscenarioForm = () => {
    setEscenarioForm(initialEscenarioForm);
    setEditingEscenarioId(null);
  };

  const toggleServicio = (servicio) => {
    setSedeForm((prev) => ({
      ...prev,
      servicios: prev.servicios.includes(servicio)
        ? prev.servicios.filter((item) => item !== servicio)
        : [...prev.servicios, servicio],
    }));
  };

  const handleSubmitSede = async () => {
    if (!sedeForm.nombre || !sedeForm.direccion || !sedeForm.barrio) return;

    const basePayload = {
      ...sedeForm,
      activa: true,
    };

    if (editingSedeId) {
      const currentSede = sedes.find((sede) => String(sede._id) === String(editingSedeId));
      const payload = buildSedePayload(basePayload, currentSede?.escenarios || []);
      await dispatch(updateCancha({ id: editingSedeId, data: payload }));
    } else {
      const payload = buildSedePayload(basePayload, []);
      await dispatch(createCancha(payload));
    }

    resetSedeForm();
    await dispatch(fetchCanchas());
  };

  const handleEditSede = (sede) => {
    const { lat, lng } = getCoordinates(sede);
    setEditingSedeId(sede._id);
    setSedeForm({
      nombre: sede.nombre || "",
      direccion: sede?.ubicacion?.direccion || "",
      barrio: sede?.ubicacion?.barrio || "",
      lat: lat || "",
      lng: lng || "",
      servicios: sede.servicios || [],
      activa: sede.activa,
    });
  };

  const handleDeleteSede = async (sedeId) => {
    if (!window.confirm("¿Eliminar esta sede y todos sus escenarios?")) return;
    await dispatch(deleteCancha(sedeId));
    if (String(selectedSedeId) === String(sedeId)) {
      setSelectedSedeId(null);
      resetEscenarioForm();
    }
    await dispatch(fetchCanchas());
  };

  const handleSelectSede = (sedeId) => {
    setSelectedSedeId(sedeId);
    resetEscenarioForm();
  };

  const handleSubmitEscenario = async () => {
    if (!selectedSede || !escenarioForm.nombre) return;

    let escenarios = [...(selectedSede.escenarios || [])];
    if (editingEscenarioId) {
      escenarios = escenarios.map((escenario) =>
        String(escenario._id) === String(editingEscenarioId)
          ? {
              ...escenario,
              nombre: escenarioForm.nombre,
              tipoDeporte: escenarioForm.tipoDeporte,
              superficie: escenarioForm.superficie,
              precioPorHora: Number(escenarioForm.precioPorHora),
              activo: Boolean(escenarioForm.activo),
            }
          : escenario
      );
    } else {
      escenarios.push({
        nombre: escenarioForm.nombre,
        tipoDeporte: escenarioForm.tipoDeporte,
        superficie: escenarioForm.superficie,
        precioPorHora: Number(escenarioForm.precioPorHora),
        activo: Boolean(escenarioForm.activo),
      });
    }

    const payload = buildSedePayload(selectedSede, escenarios);
    await dispatch(updateCancha({ id: selectedSede._id, data: payload }));
    resetEscenarioForm();
    await dispatch(fetchCanchas());
  };

  const handleEditEscenario = (escenario) => {
    setEditingEscenarioId(escenario._id);
    setEscenarioForm({
      nombre: escenario.nombre,
      tipoDeporte: escenario.tipoDeporte,
      superficie: escenario.superficie,
      precioPorHora: escenario.precioPorHora,
      activo: escenario.activo !== false,
    });
  };

  const handleDeleteEscenario = async (escenarioId) => {
    if (!selectedSede || !window.confirm("¿Eliminar este escenario?")) return;

    const escenarios = (selectedSede.escenarios || []).filter(
      (escenario) => String(escenario._id) !== String(escenarioId)
    );

    const payload = buildSedePayload(selectedSede, escenarios);
    await dispatch(updateCancha({ id: selectedSede._id, data: payload }));
    resetEscenarioForm();
    await dispatch(fetchCanchas());
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Link
            to="/admin"
            className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver al Panel</span>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestión de Sedes y Escenarios</h1>
            <p className="text-gray-600 dark:text-gray-400">Administra sedes deportivas y sus escenarios</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              {editingSedeId ? "Editar Sede" : "Nueva Sede"}
            </h2>

            <div className="space-y-4">
              <input
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Nombre de la sede"
                value={sedeForm.nombre}
                onChange={(e) => setSedeForm((prev) => ({ ...prev, nombre: e.target.value }))}
              />
              <input
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Dirección"
                value={sedeForm.direccion}
                onChange={(e) => setSedeForm((prev) => ({ ...prev, direccion: e.target.value }))}
              />
              <input
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Barrio"
                value={sedeForm.barrio}
                onChange={(e) => setSedeForm((prev) => ({ ...prev, barrio: e.target.value }))}
              />

              <div className="grid grid-cols-2 gap-3">
                <input
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Latitud"
                  value={sedeForm.lat}
                  onChange={(e) => setSedeForm((prev) => ({ ...prev, lat: e.target.value }))}
                />
                <input
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Longitud"
                  value={sedeForm.lng}
                  onChange={(e) => setSedeForm((prev) => ({ ...prev, lng: e.target.value }))}
                />
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Servicios</p>
                <div className="flex flex-wrap gap-2">
                  {serviciosCatalogo.map((servicio) => (
                    <button
                      key={servicio}
                      type="button"
                      onClick={() => toggleServicio(servicio)}
                      className={`px-3 py-1.5 rounded-full text-sm border ${
                        sedeForm.servicios.includes(servicio)
                          ? "bg-primary text-white border-primary"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"
                      }`}
                    >
                      {servicio}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSubmitSede}
                  className="flex-1 bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-lg"
                >
                  {editingSedeId ? "Actualizar Sede" : "Crear Sede"}
                </button>
                {editingSedeId && (
                  <button
                    onClick={resetSedeForm}
                    className="px-4 py-3 rounded-lg bg-gray-500 hover:bg-gray-600 text-white font-semibold"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          </section>

          <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Sedes registradas</h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">{sedes.length} sedes</span>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {loading ? (
                <p className="text-gray-500 dark:text-gray-400">Cargando sedes...</p>
              ) : sedes.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">Aún no hay sedes registradas.</p>
              ) : (
                sedes.map((sede) => (
                  <div
                    key={sede._id}
                    className={`p-4 rounded-lg border ${
                      String(selectedSedeId) === String(sede._id)
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{sede.nombre}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-1">
                          <MapPin className="w-4 h-4" />
                          {sede?.ubicacion?.direccion} · {sede?.ubicacion?.barrio}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {(sede.escenarios || []).length} escenarios
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSelectSede(sede._id)}
                          className="px-2 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-xs"
                        >
                          <Layers3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditSede(sede)}
                          className="px-2 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-xs"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSede(sede._id)}
                          className="px-2 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Gestión de Escenarios</h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {selectedSede ? `Sede: ${selectedSede.nombre}` : "Selecciona una sede"}
            </span>
          </div>

          {!selectedSede ? (
            <p className="text-gray-500 dark:text-gray-400">Selecciona una sede para crear o editar sus escenarios.</p>
          ) : (
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {editingEscenarioId ? "Editar Escenario" : "Nuevo Escenario"}
                </h3>

                <input
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Nombre del escenario"
                  value={escenarioForm.nombre}
                  onChange={(e) => setEscenarioForm((prev) => ({ ...prev, nombre: e.target.value }))}
                />

                <select
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={escenarioForm.tipoDeporte}
                  onChange={(e) => setEscenarioForm((prev) => ({ ...prev, tipoDeporte: e.target.value }))}
                >
                  {tiposDeporte.map((tipo) => (
                    <option key={tipo} value={tipo}>
                      {tipo}
                    </option>
                  ))}
                </select>

                <select
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={escenarioForm.superficie}
                  onChange={(e) => setEscenarioForm((prev) => ({ ...prev, superficie: e.target.value }))}
                >
                  {superficies.map((superficie) => (
                    <option key={superficie} value={superficie}>
                      {superficie}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Precio por hora"
                  value={escenarioForm.precioPorHora}
                  onChange={(e) => setEscenarioForm((prev) => ({ ...prev, precioPorHora: Number(e.target.value) }))}
                />

                <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={escenarioForm.activo}
                    onChange={(e) => setEscenarioForm((prev) => ({ ...prev, activo: e.target.checked }))}
                  />
                  Escenario activo
                </label>

                <div className="flex gap-3">
                  <button
                    onClick={handleSubmitEscenario}
                    className="flex-1 bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-lg inline-flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    {editingEscenarioId ? "Actualizar Escenario" : "Crear Escenario"}
                  </button>
                  {editingEscenarioId && (
                    <button
                      onClick={resetEscenarioForm}
                      className="px-4 py-3 rounded-lg bg-gray-500 hover:bg-gray-600 text-white font-semibold"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-3 max-h-[420px] overflow-y-auto">
                {(selectedSede.escenarios || []).length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400">Esta sede aún no tiene escenarios.</p>
                ) : (
                  selectedSede.escenarios.map((escenario) => (
                    <div
                      key={escenario._id}
                      className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">{escenario.nombre}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {escenario.tipoDeporte} · {escenario.superficie}
                          </p>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                            ${Number(escenario.precioPorHora || 0).toLocaleString("es-CO")}/hora
                          </p>
                          <span
                            className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${
                              escenario.activo
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                            }`}
                          >
                            {escenario.activo ? "Activo" : "Inactivo"}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditEscenario(escenario)}
                            className="px-2 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteEscenario(escenario._id)}
                            className="px-2 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
