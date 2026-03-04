import { useState, useMemo } from "react";
import { Calendar, Clock, ChevronLeft, ChevronRight, Check } from "lucide-react";

// Helper para convertir "HH:mm" a valor numérico de horas (ej. "14:30" -> 14.5)
const timeToDecimal = (timeString) => {
  if (!timeString) return 0;
  const [h, m] = timeString.split(":").map(Number);
  return h + (m / 60);
};

// Componente mejorado para seleccionar fecha y hora
export default function DateTimeSelector({ value, onChange, horasOcupadas = [], duracionSeleccionada = 1 }) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [viewMonth, setViewMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(
    value ? new Date(value) : null
  );
  const [step, setStep] = useState(value ? "time" : "date"); // Iniciar en "time" si ya hay valor precargado

  // Generar presets de fecha
  const datePresets = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return [
      {
        label: "Hoy",
        date: new Date(today),
      },
      {
        label: "Mañana",
        date: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
      {
        label: "En 3 días",
        date: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000),
      },
      {
        label: "En 7 días",
        date: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
      },
    ];
  }, []);

  // Generar horarios disponibles (6am a 10pm)
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 6; hour <= 22; hour++) {
      slots.push({
        hour,
        label: `${hour.toString().padStart(2, "0")}:00`,
      });
    }
    return slots;
  }, []);

  // Generar días del calendario
  const calendarDays = useMemo(() => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Días del mes anterior
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false,
      });
    }

    // Días del mes actual
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    // Días del mes siguiente
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return days;
  }, [viewMonth]);

  const handleDatePreset = (presetDate) => {
    const newDate = new Date(presetDate);
    newDate.setHours(0, 0, 0, 0);
    setSelectedDate(newDate);
    updateDateTime(newDate);
    setShowCalendar(false); // Auto-cierra el calendario al elegir preset
  };

  const handleCalendarDayClick = (date) => {
    if (date < new Date(new Date().setHours(0, 0, 0, 0))) return;

    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    setSelectedDate(newDate);
    updateDateTime(newDate);
    setShowCalendar(false); // Auto-cierra el calendario al elegir día
  };

  const handleTimeSelect = (hour) => {
    if (!selectedDate) return;

    const newDate = new Date(selectedDate);
    newDate.setHours(hour, 0, 0, 0);
    setSelectedDate(newDate);
    updateDateTime(newDate);
  };

  const updateDateTime = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const localString = `${year}-${month}-${day}T${hours}:${minutes}`;
    onChange(localString);
  };

  const isPastDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelectedDate = (date) => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const formatDisplayDate = () => {
    if (!selectedDate || !value) return "Selecciona una fecha";

    // Si solo falta elegir hora, mostramos la fecha limpia
    const options = {
      weekday: "long",
      month: "short",
      day: "numeric",
    };
    return selectedDate.toLocaleDateString("es-AR", options);
  };

  // Novedad: Comprobar si un 'slot' horario choca con las reservas existentes enviadas por props
  const isTimeOccupied = (slotHour) => {
    const startPropuesto = slotHour;
    const endPropuesto = slotHour + duracionSeleccionada;

    return horasOcupadas.some(ocupada => {
      const ocStart = timeToDecimal(ocupada.horaInicio);
      const ocEnd = timeToDecimal(ocupada.horaFin);

      // Existe traslape si: Inicio propuesto < Fin Ocupada Y Fin Propuesto > Inicio Ocupada
      // Ejemplo: ocupado=14:00-16:00 (14-16), propuesto=15:00-17:00 (15-17). (15 < 16 && 17 > 14) -> Choque.
      return (startPropuesto < ocEnd && endPropuesto > ocStart);
    });
  };

  return (
    <div className="w-full space-y-4">
      {/* Display actual */}
      <div
        onClick={() => {
          setShowCalendar(!showCalendar);
        }}
        className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium cursor-pointer hover:border-primary transition-colors flex items-center gap-3"
      >
        <Calendar className="w-5 h-5 text-primary" />
        <span>{formatDisplayDate()}</span>
      </div>

      {/* Selector expandible */}
      {showCalendar && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 md:p-6 border border-gray-200 dark:border-gray-700 space-y-4 md:space-y-6 animate-slideUp">
          {/* Presets de fecha rápida */}
          <div>
            <p className="text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 md:mb-3">
              Fechas frecuentes
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {datePresets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleDatePreset(preset.date)}
                  className={`px-2 md:px-3 py-2 rounded-lg font-medium text-xs md:text-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${isSelectedDate(preset.date)
                    ? "bg-blue-600 dark:bg-blue-700 text-white shadow-lg"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Calendario Compacto */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() =>
                  setViewMonth(
                    new Date(
                      viewMonth.getFullYear(),
                      viewMonth.getMonth() - 1
                    )
                  )
                }
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              >
                <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
              </button>

              <h3 className="font-semibold text-gray-800 dark:text-white text-xs md:text-sm text-center min-w-[120px] md:min-w-[180px]">
                {viewMonth.toLocaleDateString("es-AR", {
                  month: "short",
                  year: "numeric",
                })}
              </h3>

              <button
                onClick={() =>
                  setViewMonth(
                    new Date(
                      viewMonth.getFullYear(),
                      viewMonth.getMonth() + 1
                    )
                  )
                }
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              >
                <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>

            {/* Encabezado de días - Compacto */}
            <div className="grid grid-cols-7 gap-0.5 mb-1 md:mb-2">
              {["D", "L", "M", "M", "J", "V", "S"].map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-bold text-gray-600 dark:text-gray-400 py-1 md:py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Días del calendario - Compacto */}
            <div className="grid grid-cols-7 gap-0.5">
              {calendarDays.map((day, idx) => {
                const isDisabled = isPastDate(day.date);
                const isSelectedDay = isSelectedDate(day.date);
                const isTodayDate = isToday(day.date);

                return (
                  <button
                    key={idx}
                    onClick={() => !isDisabled && handleCalendarDayClick(day.date)}
                    disabled={isDisabled}
                    className={`aspect-square rounded text-xs md:text-sm font-medium transition-all duration-200 flex items-center justify-center relative focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${isDisabled
                      ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                      : isSelectedDay
                        ? "bg-blue-600 dark:bg-blue-700 text-white shadow-lg font-bold"
                        : isTodayDate
                          ? "bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 font-bold"
                          : day.isCurrentMonth
                            ? "bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600"
                            : "text-gray-400 dark:text-gray-600 bg-gray-50 dark:bg-gray-700/50"
                      }`}
                  >
                    {day.date.getDate()}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Botón para cerrar calendarios */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setShowCalendar(false)}
              className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
