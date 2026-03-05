import { useEffect, useMemo, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { ArrowLeft, Building2, Edit, Layers3, MapPin, Plus, Trash2, Image as ImageIcon, UploadCloud, X, Save, Clock, Info, CheckCircle, ChevronRight } from "lucide-react";
import {
  fetchCanchas,
  createCancha,
  updateCancha,
  deleteCancha,
} from "../../redux/slices/canchasSlice.js";

const getDefaultHorario = () => Array(7).fill(null).map(() => ({ isAbierto: true, apertura: "06:00", cierre: "22:00", descansos: [] }));

const initialSedeForm = {
  nombre: "",
  direccion: "",
  barrio: "",
  lat: "",
  lng: "",
  servicios: [],
  imagenes: [],
  configuracionHorario: { horarioPorDia: getDefaultHorario(), intervaloMinutos: 60 }
};

const initialEscenarioForm = {
  nombre: "",
  tipoDeporte: "Fútbol 5",
  superficie: "Sintética",
  precioPorHora: 0,
  activo: true,
  imagenes: [],
  usarHorarioPersonalizado: false,
  configuracionHorario: { horarioPorDia: getDefaultHorario(), intervaloMinutos: 60 }
};

const diasSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

function WeeklyScheduleEditor({ value, onChange }) {
  const handleDayChange = (dayIndex, field, val) => {
    const newHorario = [...value];
    newHorario[dayIndex] = { ...newHorario[dayIndex], [field]: val };
    onChange(newHorario);
  };

  const addDescanso = (dayIndex) => {
    const newHorario = [...value];
    const descansos = [...(newHorario[dayIndex].descansos || [])];
    descansos.push({ inicio: "13:00", fin: "14:00" });
    newHorario[dayIndex] = { ...newHorario[dayIndex], descansos };
    onChange(newHorario);
  };

  const removeDescanso = (dayIndex, descIndex) => {
    const newHorario = [...value];
    const descansos = [...(newHorario[dayIndex].descansos || [])];
    descansos.splice(descIndex, 1);
    newHorario[dayIndex] = { ...newHorario[dayIndex], descansos };
    onChange(newHorario);
  };

  const updateDescanso = (dayIndex, descIndex, field, val) => {
    const newHorario = [...value];
    const descansos = [...(newHorario[dayIndex].descansos || [])];
    descansos[descIndex] = { ...descansos[descIndex], [field]: val };
    newHorario[dayIndex] = { ...newHorario[dayIndex], descansos };
    onChange(newHorario);
  };

  const copyMondayToAll = () => {
    const monday = value[1];
    const newHorario = value.map((dia, idx) => {
      if (idx > 1) { // Apply Lunes(1) to Martes(2)-Sabado(6)
        return JSON.parse(JSON.stringify(monday));
      }
      return dia;
    });
    onChange(newHorario);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button type="button" onClick={copyMondayToAll} className="text-xs font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400">⎘ Copiar Lunes a resto de la semana</button>
      </div>
      {diasSemana.map((nombreDia, index) => {
        const conf = value[index] || { isAbierto: true, apertura: "06:00", cierre: "22:00", descansos: [] };
        return (
          <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-800 shadow-sm transition-all">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-3 w-32">
                <input type="checkbox" checked={conf.isAbierto} onChange={e => handleDayChange(index, "isAbierto", e.target.checked)} className="w-4 h-4 accent-blue-500" />
                <span className={`text-sm font-medium ${!conf.isAbierto ? 'text-gray-400 line-through' : 'text-gray-700 dark:text-gray-200'}`}>{nombreDia}</span>
              </div>

              {conf.isAbierto ? (
                <div className="flex-1 flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 text-right">Abre:</span>
                    <select className="border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm rounded px-2 py-1" value={conf.apertura} onChange={e => handleDayChange(index, "apertura", e.target.value)}>
                      {Array.from({ length: 48 }).map((_, i) => {
                        const h = Math.floor(i / 2).toString().padStart(2, "0");
                        const m = i % 2 === 0 ? "00" : "30";
                        const hm = `${h}:${m}`;
                        return <option key={hm} value={hm}>{hm}</option>;
                      })}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 text-right">Cierra:</span>
                    <select className="border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm rounded px-2 py-1" value={conf.cierre} onChange={e => handleDayChange(index, "cierre", e.target.value)}>
                      {Array.from({ length: 48 }).map((_, i) => {
                        const h = Math.floor(i / 2).toString().padStart(2, "0");
                        const m = i % 2 === 0 ? "00" : "30";
                        const hm = `${h}:${m}`;
                        return <option key={hm} value={hm}>{hm}</option>;
                      })}
                    </select>
                  </div>

                  <button type="button" onClick={() => addDescanso(index)} className="text-xs bg-orange-100 hover:bg-orange-200 dark:bg-orange-900/40 dark:hover:bg-orange-800 text-orange-700 dark:text-orange-300 px-3 py-1.5 rounded-lg border border-orange-200 dark:border-orange-800 transition-colors ml-auto md:ml-0">
                    + Pausa / Descanso
                  </button>
                </div>
              ) : (
                <div className="flex-1 text-sm text-red-500 font-semibold bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded inline-block">Día Cerrado</div>
              )}
            </div>

            {/* Descansos */}
            {conf.isAbierto && conf.descansos && conf.descansos.length > 0 && (
              <div className="mt-3 pl-8 md:pl-36 space-y-2">
                {conf.descansos.map((desc, dIdx) => (
                  <div key={dIdx} className="flex items-center gap-2 bg-gradient-to-r from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-900/10 p-2 rounded border border-orange-200/50 dark:border-orange-800/50 shadow-sm">
                    <span className="text-xs text-orange-800 dark:text-orange-300 font-medium">↳ Pausa:</span>
                    <select className="border border-orange-300 dark:border-orange-700 bg-white dark:bg-gray-800 text-xs rounded px-1.5 py-1" value={desc.inicio} onChange={e => updateDescanso(index, dIdx, "inicio", e.target.value)}>
                      {Array.from({ length: 48 }).map((_, i) => {
                        const h = Math.floor(i / 2).toString().padStart(2, "0");
                        const m = i % 2 === 0 ? "00" : "30";
                        const hm = `${h}:${m}`;
                        return <option key={hm} value={hm}>{hm}</option>;
                      })}
                    </select>
                    <span className="text-xs text-gray-500">hasta</span>
                    <select className="border border-orange-300 dark:border-orange-700 bg-white dark:bg-gray-800 text-xs rounded px-1.5 py-1" value={desc.fin} onChange={e => updateDescanso(index, dIdx, "fin", e.target.value)}>
                      {Array.from({ length: 48 }).map((_, i) => {
                        const h = Math.floor(i / 2).toString().padStart(2, "0");
                        const m = i % 2 === 0 ? "00" : "30";
                        const hm = `${h}:${m}`;
                        return <option key={hm} value={hm}>{hm}</option>;
                      })}
                    </select>
                    <button type="button" onClick={() => removeDescanso(index, dIdx)} className="text-xs bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-200 ml-auto px-2 py-1 rounded">Quitar</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Dummy/Placeholder para Drag&Drop de S3
function ImageUploader({ images, onChange }) {
  const handleUrlAdd = () => {
    const url = window.prompt("Introduce una URL de imagen temporal (Próximamente S3):", "https://via.placeholder.com/400x300");
    if (url) onChange([...(images || []), url]);
  };

  const removeImage = (index) => {
    const newImgs = [...images];
    newImgs.splice(index, 1);
    onChange(newImgs);
  };

  return (
    <div className="mt-4">
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
        <ImageIcon className="w-4 h-4" />
        Galería de Imágenes
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
        {(images || []).map((img, idx) => (
          <div key={idx} className="relative group rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 aspect-video">
            <img src={img} alt="Preview" className="w-full h-full object-cover" />
            <button type="button" onClick={() => removeImage(idx)} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleUrlAdd}
        className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-gray-800/50 hover:border-blue-500 transition-colors cursor-pointer"
      >
        <UploadCloud className="w-8 h-8 mb-2 opacity-50" />
        <span className="text-sm font-medium">Añadir imagen (Preparado para S3)</span>
        <span className="text-xs opacity-70 mt-1">Soporte Drag & Drop en próxima versión</span>
      </button>
    </div>
  );
}

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
    ...base, // include native fields safely
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
    configuracionHorario: base?.configuracionHorario
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

  // UX states
  const [isCreatingSede, setIsCreatingSede] = useState(false);
  const [activeTab, setActiveTab] = useState("info"); // info, horario, escenarios
  const [isEscenarioModalOpen, setIsEscenarioModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchCanchas());
  }, [dispatch]);

  const selectedSede = useMemo(() => {
    if (!selectedSedeId) return null;
    return sedes.find((s) => String(s._id) === String(selectedSedeId));
  }, [sedes, selectedSedeId]);

  const validateSedeForm = () => {
    if (!sedeForm.nombre || !sedeForm.direccion || !sedeForm.barrio) {
      alert("Por favor completa los campos obligatorios de la sede.");
      return false;
    }
    return true;
  };

  const handleSubmitSede = async () => {
    if (!validateSedeForm()) return;

    const payload = buildSedePayload(sedeForm, selectedSede?.escenarios || []);

    if (editingSedeId) {
      await dispatch(updateCancha({ id: editingSedeId, data: payload }));
      alert("Sede actualizada exitosamente");
    } else {
      await dispatch(createCancha(payload));
      setIsCreatingSede(false);
      resetSedeForm();
      alert("Sede creada exitosamente");
    }
    await dispatch(fetchCanchas());
  };

  const resetSedeForm = () => {
    setSedeForm(initialSedeForm);
    setEditingSedeId(null);
    setSelectedSedeId(null);
    setIsCreatingSede(false);
    setActiveTab("info");
  };

  const initCreateSede = () => {
    resetSedeForm();
    setIsCreatingSede(true);
    setActiveTab("info");
  };

  const handleEditSede = (sede) => {
    const { lat, lng } = getCoordinates(sede);
    setEditingSedeId(sede._id);
    setSelectedSedeId(sede._id);
    setIsCreatingSede(false);
    setActiveTab("info");

    setSedeForm({
      nombre: sede.nombre || "",
      direccion: sede?.ubicacion?.direccion || "",
      barrio: sede?.ubicacion?.barrio || "",
      lat: lat || "",
      lng: lng || "",
      servicios: sede.servicios || [],
      imagenes: sede.imagenes || [],
      activa: sede.activa ?? true,
      configuracionHorario: sede.configuracionHorario || { horarioPorDia: getDefaultHorario(), intervaloMinutos: 60 }
    });
  };

  const handleDeleteSede = async (e, sedeId) => {
    e.stopPropagation();
    if (!window.confirm("¿Eliminar esta sede y todos sus escenarios permanentemente?")) return;
    await dispatch(deleteCancha(sedeId));
    if (String(selectedSedeId) === String(sedeId)) {
      resetSedeForm();
    }
    await dispatch(fetchCanchas());
  };

  const toggleServicio = (servicio) => {
    setSedeForm((prev) => {
      const servicios = prev.servicios.includes(servicio)
        ? prev.servicios.filter((s) => s !== servicio)
        : [...prev.servicios, servicio];
      return { ...prev, servicios };
    });
  };

  const resetEscenarioForm = () => {
    setEscenarioForm(initialEscenarioForm);
    setEditingEscenarioId(null);
    setIsEscenarioModalOpen(false);
  };

  const openNewEscenarioModal = () => {
    resetEscenarioForm();
    setIsEscenarioModalOpen(true);
  };

  const handleSubmitEscenario = async () => {
    if (!selectedSede || !escenarioForm.nombre) return;

    let escenarios = [...(selectedSede.escenarios || [])];
    const newEscSettings = {
      nombre: escenarioForm.nombre,
      tipoDeporte: escenarioForm.tipoDeporte,
      superficie: escenarioForm.superficie,
      precioPorHora: Number(escenarioForm.precioPorHora),
      activo: Boolean(escenarioForm.activo),
      imagenes: escenarioForm.imagenes || [],
      usarHorarioPersonalizado: Boolean(escenarioForm.usarHorarioPersonalizado),
      configuracionHorario: escenarioForm.usarHorarioPersonalizado ? escenarioForm.configuracionHorario : undefined
    };

    if (editingEscenarioId) {
      escenarios = escenarios.map((escenario) =>
        String(escenario._id) === String(editingEscenarioId)
          ? { ...escenario, ...newEscSettings }
          : escenario
      );
    } else {
      escenarios.push(newEscSettings);
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
      imagenes: escenario.imagenes || [],
      usarHorarioPersonalizado: escenario.usarHorarioPersonalizado === true,
      configuracionHorario: escenario.configuracionHorario || initialEscenarioForm.configuracionHorario
    });
    setIsEscenarioModalOpen(true);
  };

  const handleDeleteEscenario = async (escenarioId) => {
    if (!selectedSede || !window.confirm("¿Estás seguro de eliminar este escenario?")) return;

    const escenarios = (selectedSede.escenarios || []).filter(
      (escenario) => String(escenario._id) !== String(escenarioId)
    );

    const payload = buildSedePayload(selectedSede, escenarios);
    await dispatch(updateCancha({ id: selectedSede._id, data: payload }));
    await dispatch(fetchCanchas());
  };

  const isMasterView = !selectedSedeId && !isCreatingSede;

  // Render components
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
      {/* Header General */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-5 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              to="/admin"
              className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">Centros Deportivos</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Administra tus sedes, horarios y escenarios</p>
            </div>
          </div>
          {isMasterView && (
            <button
              onClick={initCreateSede}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl shadow hover:shadow-lg transition-all flex items-center justify-center gap-2 font-medium"
            >
              <Plus className="w-5 h-5" /> Registrar Nueva Sede
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8">
        {isMasterView ? (
          /* VISTA MAESTRO: Lista de Sedes */
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => <div key={i} className="h-64 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse"></div>)}
              </div>
            ) : sedes.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700 p-12 text-center flex flex-col items-center justify-center shadow-sm">
                <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/30 text-blue-500 rounded-full flex items-center justify-center mb-5">
                  <Building2 className="w-12 h-12" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No tienes sedes registradas</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-8">Comienza registrando tu primer complejo deportivo para empezar a recibir reservas.</p>
                <button onClick={initCreateSede} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition shadow-md flex items-center gap-2">
                  <Plus className="w-5 h-5" /> Agregar Primera Sede
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sedes.map((sede) => (
                  <div key={sede._id} onClick={() => handleEditSede(sede)} className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all overflow-hidden group cursor-pointer flex flex-col h-full transform hover:-translate-y-1">
                    <div className="h-44 bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
                      {(sede.imagenes && sede.imagenes.length > 0) ? (
                        <img src={sede.imagenes[0]} alt={sede.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 gap-2"><ImageIcon className="w-10 h-10 opacity-40" /><span className="text-xs uppercase font-medium md:opacity-0 group-hover:opacity-100 transition-opacity">Sin Foto</span></div>
                      )}
                      <div className="absolute top-4 right-4 flex gap-2">
                        <button onClick={(e) => handleDeleteSede(e, sede._id)} className="bg-red-500/90 hover:bg-red-600 p-2 rounded-xl text-white shadow-lg backdrop-blur transition-colors opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                      </div>
                      <div className="absolute top-4 left-4">
                        <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm backdrop-blur ${sede.activa ? 'bg-green-500/90 text-white' : 'bg-gray-800/80 text-white'}`}>{sede.activa ? 'Operativa' : 'Cerrada'}</span>
                      </div>
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="font-bold text-xl text-gray-900 dark:text-white line-clamp-1 mb-1">{sede.nombre}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mb-5 line-clamp-1"><MapPin className="w-4 h-4 text-blue-500 flex-shrink-0" />{sede?.ubicacion?.direccion}, {sede?.ubicacion?.barrio}</p>

                      <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700/50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <Layers3 className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="block text-xs text-gray-500 uppercase font-semibold leading-none">Canchas</span>
                            <span className="block font-bold text-gray-900 dark:text-gray-100 leading-tight">{(sede.escenarios || []).length}</span>
                          </div>
                        </div>
                        <div className="text-blue-600 dark:text-blue-400 font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">Gestionar <ChevronRight className="w-4 h-4" /></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* VISTA DETALLE: Editor de Sede Individual */
          <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-5 sm:p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 dark:bg-blue-900/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
              <div className="flex gap-4 items-center relative z-10">
                <button onClick={resetSedeForm} className="p-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-full text-gray-600 dark:text-gray-300 transition-colors"><ArrowLeft className="w-5 h-5" /></button>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">{isCreatingSede ? 'Creador de Sede' : (sedeForm.nombre || 'Edición de Sede')}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{isCreatingSede ? 'Completa los datos del nuevo complejo' : 'Editor de parámetros y recursos'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto relative z-10">
                <button onClick={() => handleSubmitSede()} className="flex-1 md:flex-none justify-center bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all">
                  <Save className="w-5 h-5" /> {isCreatingSede ? 'Publicar Sede' : 'Guardar Cambios'}
                </button>
              </div>
            </div>

            {/* Pestañas / Tabs */}
            <div className="flex overflow-x-auto no-scrollbar gap-2 px-2">
              <button onClick={() => setActiveTab("info")} className={`px-6 py-4 font-semibold text-sm rounded-xl transition-all flex items-center gap-2.5 ${activeTab === 'info' ? 'bg-blue-600 text-white shadow-md' : 'bg-white dark:bg-gray-800 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white border border-gray-200 dark:border-gray-700'}`}>
                <Info className="w-4 h-4" /> Info General
              </button>
              <button onClick={() => setActiveTab("horario")} className={`px-6 py-4 font-semibold text-sm rounded-xl transition-all flex items-center gap-2.5 ${activeTab === 'horario' ? 'bg-blue-600 text-white shadow-md' : 'bg-white dark:bg-gray-800 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white border border-gray-200 dark:border-gray-700'}`}>
                <Clock className="w-4 h-4" /> Horarios de Atención
              </button>
              <button onClick={() => setActiveTab("escenarios")} disabled={isCreatingSede} className={`px-6 py-4 font-semibold text-sm rounded-xl transition-all flex items-center gap-2.5 ${activeTab === 'escenarios' ? 'bg-blue-600 text-white shadow-md' : 'bg-white dark:bg-gray-800 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white border border-gray-200 dark:border-gray-700'} ${isCreatingSede ? 'opacity-50 cursor-not-allowed hidden' : ''}`}>
                <Layers3 className="w-4 h-4" /> Escenarios {selectedSede && <span className={`ml-1 px-2.5 py-0.5 rounded-full text-xs ${activeTab === 'escenarios' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>{(selectedSede?.escenarios || []).length}</span>}
              </button>
            </div>

            {/* Contenido Pestañas */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 lg:p-10 animate-in fade-in duration-300">

              {/* TAB: INFO */}
              {activeTab === 'info' && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Nombre de la Sede</label>
                      <input className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 dark:text-white transition-all text-lg" placeholder="Ej. Complejo DeporVida" value={sedeForm.nombre} onChange={e => setSedeForm(p => ({ ...p, nombre: e.target.value }))} />
                    </div>
                    <div className="space-y-3 flex flex-col justify-end">
                      <label className={`inline-flex items-center gap-3 cursor-pointer p-4 rounded-xl border-2 transition-colors ${sedeForm.activa ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800/50' : 'bg-gray-50 border-gray-200 dark:bg-gray-900 dark:border-gray-700'}`}>
                        <input type="checkbox" checked={sedeForm.activa} onChange={e => setSedeForm(p => ({ ...p, activa: e.target.checked }))} className="w-6 h-6 accent-green-600 rounded" />
                        <div>
                          <span className="font-bold text-gray-900 dark:text-white block">Sede Operativa (Activa)</span>
                          <span className="text-sm text-gray-500">Muestra la sede al público y permite crear reservas.</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  <hr className="border-gray-100 dark:border-gray-700" />

                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><MapPin className="w-6 h-6 text-red-500" /> Ubicación y Coordenadas</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Dirección Exacta</label>
                        <input className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white" placeholder="Av. Principal #123" value={sedeForm.direccion} onChange={e => setSedeForm(p => ({ ...p, direccion: e.target.value }))} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Barrio / Sector</label>
                        <input className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white" placeholder="El Prado" value={sedeForm.barrio} onChange={e => setSedeForm(p => ({ ...p, barrio: e.target.value }))} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Latitud (G. Maps)</label>
                        <input className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white font-mono" placeholder="4.55123" value={sedeForm.lat} onChange={e => setSedeForm(p => ({ ...p, lat: e.target.value }))} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Longitud (G. Maps)</label>
                        <input className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white font-mono" placeholder="-74.3212" value={sedeForm.lng} onChange={e => setSedeForm(p => ({ ...p, lng: e.target.value }))} />
                      </div>
                    </div>
                  </div>

                  <hr className="border-gray-100 dark:border-gray-700" />

                  <div className="space-y-5">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Servicios de la Instalación</h3>
                    <div className="flex flex-wrap gap-3">
                      {serviciosCatalogo.map((servicio) => (
                        <button key={servicio} type="button" onClick={() => toggleServicio(servicio)} className={`px-5 py-2.5 rounded-full text-sm font-bold border-2 transition-all duration-300 flex items-center gap-2 ${sedeForm.servicios.includes(servicio) ? "bg-blue-500 text-white border-blue-500 shadow-md transform -translate-y-0.5" : "bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-blue-300 hover:text-blue-500"}`}>
                          {sedeForm.servicios.includes(servicio) && <CheckCircle className="w-4 h-4" />} {servicio}
                        </button>
                      ))}
                    </div>
                  </div>

                  <hr className="border-gray-100 dark:border-gray-700" />

                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Fotos del Establecimiento</h3>
                    <ImageUploader images={sedeForm.imagenes} onChange={(imgs) => setSedeForm(prev => ({ ...prev, imagenes: imgs }))} />
                  </div>
                </div>
              )}

              {/* TAB: HORARIOS */}
              {activeTab === 'horario' && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between border border-blue-100 dark:border-blue-800/50 shadow-sm">
                    <div>
                      <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 flex items-center gap-2"><Clock className="w-5 h-5" /> Granularidad de Turnos</h3>
                      <p className="text-sm text-blue-700/80 dark:text-blue-300 mt-1 max-w-lg">Determina el tamaño del bloque para crear reservas en tu sede. (1 hr = 06:00, 07:00. 30min = 06:00, 06:30, 07:00...)</p>
                    </div>
                    <select className="mt-4 md:mt-0 px-5 py-3 bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-gray-600 rounded-xl shadow-sm outline-none font-bold text-gray-800 dark:text-gray-200 w-full md:w-auto focus:border-blue-500" value={sedeForm.configuracionHorario.intervaloMinutos} onChange={(e) => setSedeForm(prev => ({ ...prev, configuracionHorario: { ...prev.configuracionHorario, intervaloMinutos: Number(e.target.value) } }))}>
                      <option value={30}>Turnos de 30 mins</option>
                      <option value={60}>Turnos de 60 mins</option>
                    </select>
                  </div>

                  <div className="pt-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Apertura y Cierre Diarios</h3>
                    <WeeklyScheduleEditor value={sedeForm.configuracionHorario.horarioPorDia || getDefaultHorario()} onChange={(newHorario) => setSedeForm(prev => ({ ...prev, configuracionHorario: { ...prev.configuracionHorario, horarioPorDia: newHorario } }))} />
                  </div>
                </div>
              )}

              {/* TAB: ESCENARIOS */}
              {activeTab === 'escenarios' && (
                <div className="space-y-8">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-200 dark:border-gray-700/50 gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Inventario de Canchas</h3>
                      <p className="text-gray-500 mt-1">Crea cada espacio deportivo (Cancha #1, Pista Pádel A, etc) individualmente.</p>
                    </div>
                    <button onClick={openNewEscenarioModal} className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl flex items-center gap-2 font-bold shadow-md shadow-emerald-500/20 transition-all transform hover:-translate-y-0.5 whitespace-nowrap">
                      <Plus className="w-5 h-5" /> Añadir Escenario
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(selectedSede?.escenarios || []).length === 0 ? (
                      <div className="col-span-full py-16 text-center text-gray-500 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
                        <Layers3 className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                        <h4 className="text-lg font-bold text-gray-600 dark:text-gray-300 mb-2">Sin escenarios creados</h4>
                        <p>Usa el botón verde para agregar tu primer escenario a esta sede.</p>
                      </div>
                    ) : (
                      selectedSede.escenarios.map(escenario => (
                        <div key={escenario._id} className={`group bg-white dark:bg-gray-800 rounded-3xl border-2 transition-all overflow-hidden flex flex-col shadow-sm hover:shadow-lg ${!escenario.activo ? 'border-gray-200 dark:border-gray-700 opacity-80' : 'border-emerald-100 dark:border-emerald-900/30 hover:border-emerald-300'}`}>
                          {escenario.imagenes && escenario.imagenes.length > 0 && <img src={escenario.imagenes[0]} className="w-full h-40 object-cover" alt="Pista" />}
                          <div className="p-6 flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-3">
                              <h4 className="font-bold text-xl text-gray-900 dark:text-white line-clamp-1 pr-2">{escenario.nombre}</h4>
                              <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border flex-shrink-0 ${escenario.activo ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:border-green-800/50 dark:text-green-400' : 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:border-gray-700'}`}>{escenario.activo ? 'Activo' : 'Cerrado'}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 mb-5">
                              <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700/50">
                                <span className="block text-xs text-gray-400 uppercase font-semibold mb-1">Deporte</span>
                                <span className="block font-medium text-gray-800 dark:text-gray-200">{escenario.tipoDeporte}</span>
                              </div>
                              <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700/50">
                                <span className="block text-xs text-gray-400 uppercase font-semibold mb-1">Superficie</span>
                                <span className="block font-medium text-gray-800 dark:text-gray-200">{escenario.superficie}</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between mb-4">
                              <span className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">${Number(escenario.precioPorHora || 0).toLocaleString("es-CO")}<span className="text-xs font-medium text-emerald-600/70 inline-block ml-1">/ hora</span></span>
                              {escenario.usarHorarioPersonalizado && <span className="px-2.5 py-1.5 text-xs font-bold uppercase bg-purple-50 border border-purple-200 text-purple-700 dark:bg-purple-900/30 dark:border-purple-800/50 dark:text-purple-300 rounded-lg flex items-center gap-1.5" title="Horario diferente al de la Sede"><Clock className="w-3.5 h-3.5" /> Indep.</span>}
                            </div>

                            <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700/50 flex gap-3">
                              <button onClick={() => handleEditEscenario(escenario)} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-600 dark:hover:text-white rounded-xl font-semibold transition-colors"><Edit className="w-4 h-4" /> Editar</button>
                              <button onClick={() => handleDeleteEscenario(escenario._id)} className="w-12 flex items-center justify-center bg-red-50 text-red-600 hover:bg-red-600 hover:text-white dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-600 dark:hover:text-white rounded-xl transition-colors"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal / Slider lateral para Edición de Escenario */}
      {isEscenarioModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center sm:justify-end p-0 sm:p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsEscenarioModalOpen(false)}></div>
          <div className="relative bg-white dark:bg-gray-800 w-full sm:w-[500px] md:w-[600px] h-full sm:h-auto sm:max-h-[95vh] sm:rounded-3xl shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800 z-10 sm:rounded-t-3xl">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{editingEscenarioId ? "Editar Escenario" : "Asistente de Escenario"}</h3>
                <p className="text-sm text-gray-500 mt-1">Configura las propiedades de esta cancha.</p>
              </div>
              <button onClick={() => setIsEscenarioModalOpen(false)} className="p-2.5 text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700/50 dark:hover:text-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-7 custom-scrollbar">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Nombre Público <span className="text-red-500">*</span></label>
                <input className="w-full px-5 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white font-medium" placeholder="Ej. Cancha Múltiple #1" value={escenarioForm.nombre} onChange={e => setEscenarioForm(p => ({ ...p, nombre: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Deporte</label>
                  <select className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-gray-900 dark:text-white font-medium" value={escenarioForm.tipoDeporte} onChange={e => setEscenarioForm(p => ({ ...p, tipoDeporte: e.target.value }))}>
                    {tiposDeporte.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Superficie</label>
                  <select className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-gray-900 dark:text-white font-medium" value={escenarioForm.superficie} onChange={e => setEscenarioForm(p => ({ ...p, superficie: e.target.value }))}>
                    {superficies.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Precio / Hr <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-emerald-500">$</span>
                    <input type="number" className="w-full pl-8 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-gray-900 dark:text-white font-bold" placeholder="80000" value={escenarioForm.precioPorHora} onChange={e => setEscenarioForm(p => ({ ...p, precioPorHora: e.target.value }))} />
                  </div>
                </div>
                <div className="space-y-2 flex flex-col justify-end">
                  <label className={`inline-flex items-center gap-3 cursor-pointer py-3 px-4 rounded-xl border-2 transition-colors flex-1 ${escenarioForm.activo ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800/50' : 'bg-gray-50 border-gray-200 dark:bg-gray-900 dark:border-gray-700'}`}>
                    <input type="checkbox" checked={escenarioForm.activo} onChange={e => setEscenarioForm(p => ({ ...p, activo: e.target.checked }))} className="w-5 h-5 accent-green-600 rounded" />
                    <span className="font-bold text-gray-900 dark:text-white">Escenario Activo</span>
                  </label>
                </div>
              </div>

              <hr className="border-gray-100 dark:border-gray-700" />

              <div className="space-y-4 bg-purple-50 dark:bg-purple-900/10 p-5 rounded-2xl border border-purple-100 dark:border-purple-800/30">
                <label className="inline-flex items-start gap-4 cursor-pointer w-full">
                  <input type="checkbox" checked={escenarioForm.usarHorarioPersonalizado} onChange={e => setEscenarioForm(p => ({ ...p, usarHorarioPersonalizado: e.target.checked }))} className="w-5 h-5 accent-purple-600 rounded mt-1" />
                  <div className="flex-1">
                    <span className="font-bold text-purple-900 dark:text-purple-100 block">Horario Independiente</span>
                    <span className="text-sm text-purple-700/80 dark:text-purple-300 block mt-1 leading-snug">Activa esto únicamente si este escenario opera con un horario totalmente distinto a la sede (Ej. Por mantenimientos bloqueados).</span>
                  </div>
                </label>

                {escenarioForm.usarHorarioPersonalizado && (
                  <div className="pt-4 border-t border-purple-200/50 dark:border-purple-800/50">
                    <WeeklyScheduleEditor value={escenarioForm.configuracionHorario?.horarioPorDia || getDefaultHorario()} onChange={newH => setEscenarioForm(p => ({ ...p, configuracionHorario: { ...p.configuracionHorario, horarioPorDia: newH } }))} />
                  </div>
                )}
              </div>

              <hr className="border-gray-100 dark:border-gray-700" />

              <div>
                <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">Imágenes del Escenario</h4>
                <ImageUploader images={escenarioForm.imagenes} onChange={imgs => setEscenarioForm(p => ({ ...p, imagenes: imgs }))} />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/90 sm:rounded-b-3xl flex justify-end gap-3 z-10">
              <button onClick={() => setIsEscenarioModalOpen(false)} className="px-5 py-3 rounded-xl font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition">Cancelar</button>
              <button onClick={handleSubmitEscenario} className="px-8 py-3 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 flex items-center gap-2 transition transform hover:-translate-y-0.5"><Save className="w-5 h-5" /> Guardar Cancha</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
