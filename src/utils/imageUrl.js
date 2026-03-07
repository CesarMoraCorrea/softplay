/**
 * Construye la URL absoluta de una imagen desde backend.
 * Soporta:
 * - URLs absolutas (AWS S3, Cloudinary) -> se retornan tal cual
 * - Fallbacks seguros si no hay imagen
 */
export const imageUrl = (filename) => {
  if (!filename) {
    return 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=2670&auto=format&fit=crop';
  }

  // URLs absolutas de AWS S3 o Cloudinary se usan tal cual
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    return filename;
  }

  // Esto es para retro-compatibilidad por si aún hay fotos subidas via el endpoint de Uploads antiguo
  const apiBase = import.meta.env.VITE_API_URL || "/api";
  const baseUrl = apiBase.replace("/api", "");

  // Si es un ObjectId de Mongo (24 hex), antigua estrategia GridFS
  if (/^[a-f0-9]{24}$/.test(filename)) {
    return `${apiBase}/upload/files/${filename}`;
  }

  // Compatibilidad con /uploads (modo local)
  if (filename.startsWith("/uploads")) {
    return `${baseUrl}${filename}`;
  }

  return `${baseUrl}/uploads/${filename}`;
};

export const checkImageExists = async (url) => {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return response.ok;
  } catch (error) {
    return false;
  }
};
