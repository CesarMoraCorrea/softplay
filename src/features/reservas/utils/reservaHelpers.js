/**
 * Utilidades compartidas para el flujo de reservas.
 * Usadas por NuevaReserva.jsx y SedeReservaForm.jsx
 */

/** "HH:mm" → número decimal (ej. "14:30" → 14.5) */
export const timeStringToFloat = (timeStr) => {
  if (!timeStr) return null;
  const [h, m] = timeStr.split(":").map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  return h + m / 60;
};

/** Número decimal → "HH:mm" (ej. 14.5 → "14:30") */
export const floatToTimeString = (floatHour) => {
  const h = Math.floor(floatHour);
  const m = Math.round((floatHour - h) * 60);
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
};

/**
 * Genera slots de horario disponibles para un escenario en una fecha dada.
 * @param {object} cancha - objeto con configuracionHorarioSede, usarHorarioPersonalizado, configuracionHorario
 * @param {string} fechaString - "YYYY-MM-DDTHH:mm"
 * @returns {{ cerrado: boolean, slots: number[] }}
 */
export const generarSlotsHorario = (cancha, fechaString) => {
  if (!fechaString || !fechaString.includes("T")) return { cerrado: false, slots: [] };

  const dateObj = new Date(fechaString.split("T")[0] + "T00:00:00");
  const dayOfWeek = dateObj.getDay();

  let configGlobal = cancha?.configuracionHorarioSede || {};
  if (cancha?.usarHorarioPersonalizado && cancha?.configuracionHorario) {
    configGlobal = cancha.configuracionHorario;
  }

  const dailyConfig = configGlobal.horarioPorDia?.[dayOfWeek] || {
    isAbierto: true,
    apertura: "06:00",
    cierre: "22:00",
    descansos: [],
  };

  if (!dailyConfig.isAbierto) return { cerrado: true, slots: [] };

  const startFloat = timeStringToFloat(dailyConfig.apertura) ?? 6.0;
  const endFloat = timeStringToFloat(dailyConfig.cierre) ?? 22.0;
  const intervalFloat = (configGlobal.intervaloMinutos || 60) / 60;

  const rests = (dailyConfig.descansos || []).map((d) => ({
    start: timeStringToFloat(d.inicio),
    end: timeStringToFloat(d.fin),
  }));

  const slots = [];
  for (let cur = startFloat; cur < endFloat; cur += intervalFloat) {
    const enDescanso = rests.some((r) => cur < r.end && cur + intervalFloat > r.start);
    if (!enDescanso) slots.push(cur);
  }
  return { cerrado: false, slots };
};

/** Ícono emoji por tipo de deporte */
export const DEPORTE_ICONS = {
  "Fútbol": "⚽",
  "Fútbol 5": "⚽",
  "Fútbol 7": "⚽",
  "Fútbol 11": "⚽",
  "Tenis": "🎾",
  "Padel": "🏸",
  "Basquet": "🏀",
  "Voley": "🏐",
};
