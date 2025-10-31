import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { ArrowLeft, Upload, MapPin, DollarSign, Tag, Clock, Star, Wifi, Car, LightbulbIcon, ShoppingBag, Droplets, Coffee, Edit, Trash2 } from "lucide-react";
import { fetchCanchas, createCancha, updateCancha, deleteCancha, uploadFiles } from "../../redux/slices/canchasSlice.js";
import { imageUrl } from "../../utils/imageUrl.js";

export default function AdminCanchas(){
  const dispatch = useDispatch();
  const { list } = useSelector(s=>s.canchas);
  const [form, setForm] = useState({ 
    nombre:"", 
    descripcion:"", 
    direccion:"", 
    precioHora:0, 
    lat:"", 
    lng:"", 
    imagenes:[],
    tipoCancha: "",
    servicios: [],
    horarios: []
  });
  const [editingCancha, setEditingCancha] = useState(null);

  // Catálogos
  const tiposCanchas = ["Fútbol 5", "Fútbol 7", "Fútbol 11", "Tenis", "Padel", "Basquet"];
  const serviciosCatalogo = [
    { id: "aparcamiento", nombre: "Aparcamiento", icon: <Car className="w-4 h-4" /> },
    { id: "iluminacion", nombre: "Iluminación", icon: <LightbulbIcon className="w-4 h-4" /> },
    { id: "vestuarios", nombre: "Vestuarios", icon: <ShoppingBag className="w-4 h-4" /> },
    { id: "duchas", nombre: "Duchas", icon: <Droplets className="w-4 h-4" /> },
    { id: "wifi", nombre: "WiFi", icon: <Wifi className="w-4 h-4" /> },
    { id: "cafeteria", nombre: "Cafetería", icon: <Coffee className="w-4 h-4" /> },
  ];
  const horariosDisponibles = ["Mañana (6-12h)", "Tarde (12-18h)", "Noche (18-24h)"];

  useEffect(()=>{ 
    dispatch(fetchCanchas()); 
  }, [dispatch]);

  const onFiles = async (e)=>{
    const urls = await uploadFiles(e.target.files);
    setForm(prev => ({ ...prev, imagenes:[...prev.imagenes, ...urls] }));
  };

  const submit = async ()=>{
    const payload = { 
      ...form, 
      ubicacion: { lat:Number(form.lat), lng:Number(form.lng) } 
    };
    
    if (editingCancha) {
      await dispatch(updateCancha({ id: editingCancha, data: payload }));
      setEditingCancha(null);
    } else {
      await dispatch(createCancha(payload));
    }
    
    setForm({ 
      nombre:"", 
      descripcion:"", 
      direccion:"", 
      precioHora:0, 
      lat:"", 
      lng:"", 
      imagenes:[],
      tipoCancha: "",
      servicios: [],
      horarios: []
    });
    dispatch(fetchCanchas());
  };

  const toggleServicio = (servicioId) => {
    const servicios = [...form.servicios];
    if (servicios.includes(servicioId)) {
      setForm({...form, servicios: servicios.filter(s => s !== servicioId)});
    } else {
      setForm({...form, servicios: [...servicios, servicioId]});
    }
  };

  const toggleHorario = (horario) => {
    const horarios = [...form.horarios];
    if (horarios.includes(horario)) {
      setForm({...form, horarios: horarios.filter(h => h !== horario)});
    } else {
      setForm({...form, horarios: [...horarios, horario]});
    }
  };

  const handleEditCancha = (cancha) => {
    setEditingCancha(cancha._id);
    setForm({
      nombre: cancha.nombre,
      descripcion: cancha.descripcion,
      direccion: cancha.direccion,
      precioHora: cancha.precioHora,
      lat: cancha.ubicacion?.lat || "",
      lng: cancha.ubicacion?.lng || "",
      imagenes: cancha.imagenes || [],
      tipoCancha: cancha.tipoCancha || "",
      servicios: cancha.servicios || [],
      horarios: cancha.horarios || []
    });
  };

  const handleDeleteCancha = async (canchaId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta cancha?')) {
      await dispatch(deleteCancha(canchaId));
      dispatch(fetchCanchas());
    }
  };

  const cancelEdit = () => {
    setEditingCancha(null);
    setForm({ 
      nombre:"", 
      descripcion:"", 
      direccion:"", 
      precioHora:0, 
      lat:"", 
      lng:"", 
      imagenes:[],
      tipoCancha: "",
      servicios: [],
      horarios: []
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Header con botón de volver */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center gap-4 mb-6">
          <Link 
            to="/admin" 
            className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver al Panel</span>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestión de Canchas</h1>
            <p className="text-gray-600 dark:text-gray-400">Administra y crea nuevas canchas deportivas</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Formulario de nueva cancha */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Tag className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {editingCancha ? 'Editar Cancha' : 'Nueva Cancha'}
              </h2>
            </div>

            <div className="space-y-6">
              {/* Información básica */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Información Básica
                </h3>
                
                <input 
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" 
                  placeholder="Nombre de la cancha" 
                  value={form.nombre} 
                  onChange={e=>setForm({...form, nombre:e.target.value})} 
                />
                
                <textarea 
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none" 
                  rows="3"
                  placeholder="Descripción de la cancha" 
                  value={form.descripcion} 
                  onChange={e=>setForm({...form, descripcion:e.target.value})} 
                />
                
                <input 
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" 
                  placeholder="Dirección completa" 
                  value={form.direccion} 
                  onChange={e=>setForm({...form, direccion:e.target.value})} 
                />
                
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input 
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" 
                    type="number" 
                    placeholder="Precio por hora" 
                    value={form.precioHora} 
                    onChange={e=>setForm({...form, precioHora:Number(e.target.value)})} 
                  />
                </div>
              </div>

              {/* Tipo de cancha */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Tag className="w-5 h-5 text-primary" />
                  Tipo de Cancha
                </h3>
                <select 
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={form.tipoCancha}
                  onChange={e=>setForm({...form, tipoCancha:e.target.value})}
                >
                  <option value="">Selecciona el tipo de cancha</option>
                  {tiposCanchas.map(tipo => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
              </div>

              {/* Servicios */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Servicios Disponibles</h3>
                <div className="grid grid-cols-2 gap-3">
                  {serviciosCatalogo.map(servicio => (
                    <button
                      key={servicio.id}
                      type="button"
                      onClick={() => toggleServicio(servicio.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                        form.servicios.includes(servicio.id)
                          ? 'bg-primary text-white border-primary'
                          : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                      }`}
                    >
                      {servicio.icon}
                      <span className="text-sm font-medium">{servicio.nombre}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Horarios */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Horarios Disponibles
                </h3>
                <div className="flex flex-wrap gap-2">
                  {horariosDisponibles.map(horario => (
                    <button
                      key={horario}
                      type="button"
                      onClick={() => toggleHorario(horario)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        form.horarios.includes(horario)
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {horario}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ubicación */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Coordenadas
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <input 
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" 
                    placeholder="Latitud" 
                    value={form.lat} 
                    onChange={e=>setForm({...form, lat:e.target.value})} 
                  />
                  <input 
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" 
                    placeholder="Longitud" 
                    value={form.lng} 
                    onChange={e=>setForm({...form, lng:e.target.value})} 
                  />
                </div>
              </div>

              {/* Imágenes */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Upload className="w-5 h-5 text-primary" />
                  Imágenes
                </h3>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-primary transition-colors">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Arrastra imágenes aquí o haz clic para seleccionar</p>
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*"
                    onChange={onFiles}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark"
                  />
                </div>
                {form.imagenes.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {form.imagenes.map((img, idx) => (
                      <img key={idx} src={imageUrl(img)} alt={`Preview ${idx}`} className="w-full h-20 object-cover rounded-lg" />
                    ))}
                  </div>
                )}
              </div>

              {/* Botones de acción */}
              <div className="space-y-3">
                <button 
                  className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg"
                  onClick={submit}
                >
                  <Tag className="w-5 h-5" />
                  {editingCancha ? 'Actualizar Cancha' : 'Crear Cancha'}
                </button>
                {editingCancha && (
                  <button 
                    className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                    onClick={cancelEdit}
                  >
                    Cancelar Edición
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Lista de canchas existentes */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Star className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Tus Canchas</h2>
                <p className="text-gray-600 dark:text-gray-400">{list.length} canchas registradas</p>
              </div>
            </div>

            <div className="space-y-4 max-h-[800px] overflow-y-auto">
              {list.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Tag className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No hay canchas registradas</h3>
                  <p className="text-gray-600 dark:text-gray-400">Crea tu primera cancha usando el formulario</p>
                </div>
              ) : (
                list.map(c => (
                  <div key={c._id} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow">
                    <div className="flex gap-4">
                      {c.imagenes?.[0] && (
                        <img 
                          src={imageUrl(c.imagenes[0])} 
                          alt={c.nombre}
                          className="w-24 h-24 object-cover rounded-lg flex-shrink-0" 
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">{c.nombre}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">{c.descripcion}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span className="truncate">{c.direccion}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            <span className="font-semibold text-primary">${c.precioHora}/h</span>
                          </div>
                        </div>
                        {c.tipoCancha && (
                          <div className="mt-2">
                            <span className="inline-block bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium">
                              {c.tipoCancha}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        <button
                          onClick={() => handleEditCancha(c)}
                          className="flex items-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteCancha(c._id)}
                          className="flex items-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}