import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios.js";
import CanchaMap from "../components/CanchaMap.jsx";
import { imageUrl } from "../utils/imageUrl.js";

export default function CanchaDetalle() {
  const { id } = useParams();
  const [c, setC] = useState(null);

  useEffect(() => {
    api.get(`/canchas/${id}`).then(({ data }) => setC(data));
  }, [id]);

  if (!c) return <p>Cargando...</p>;

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="card">
        {c.imagenes?.[0] && (
          <img
            src={imageUrl(c.imagenes[0])}
            alt={c.nombre}
            className="w-full h-40 object-cover rounded-xl mb-3"
          />
        )}
        <h1 className="text-2xl font-bold mt-4">{c.nombre}</h1>
        <p className="text-gray-700">{c.descripcion}</p>
        <p className="mt-2">{c.direccion}</p>
        <p className="mt-1 font-semibold">${c.precioHora} / hora</p>
        <Link to={`/reservar/${c._id}`} className="btn btn-primary mt-4 inline-block">
          Reservar
        </Link>
      </div>
      <div className="card">
        <h2 className="text-xl font-semibold mb-3">Ubicación</h2>
        {c.ubicacion?.lat && <CanchaMap lat={c.ubicacion.lat} lng={c.ubicacion.lng} />}
      </div>
    </div>
  );
}
