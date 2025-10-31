// frontend/src/utils/imageUrl.js

/**
 * Construye la URL absoluta de una imagen desde backend.
 * Soporta:
 * - IDs de GridFS (24 hex) -> /api/upload/files/:id
 * - URLs absolutas (http/https) -> se retornan tal cual
 * - rutas locales /uploads y nombres de archivo (modo dev)
 */
export const imageUrl = (filename) => {
  if (!filename) {
    console.warn("imageUrl: No filename provided");
    return "/no-image.png";
  }

  // URLs absolutas (Cloudinary/S3) se usan tal cual
  if (/^https?:\/\//.test(filename)) {
    return filename;
  }

  const apiBase = import.meta.env.VITE_API_URL || "/api";
  const baseUrl = apiBase.replace("/api", "");

  // Si es un ObjectId de Mongo (24 hex), usar endpoint público GridFS
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
    console.error("Error checking image:", error);
    return false;
  }
};