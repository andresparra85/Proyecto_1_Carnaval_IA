import React from 'react';
import { Calendar } from 'lucide-react';
import { useMap } from 'react-leaflet';
import { SENDA_OFICIAL_COORDS } from '../../data/sendaCoords';

export interface CarnivalDayOption {
  id: string;
  dateLabel: string;
  name: string;
  color: string;
  description: string;
  badge: string;
}

export const OFFICIAL_CARNIVAL_DATES: CarnivalDayOption[] = [
  {
    id: '03-ene',
    dateLabel: '3 Ene',
    name: 'Canto a la Tierra',
    color: '#F59E0B', // Ámbar
    description: 'Recorrido completo por la Senda con trazo Ámbar',
    badge: 'Colectivos Coreográficos'
  },
  {
    id: '04-ene',
    dateLabel: '4 Ene',
    name: 'Familia Castañeda',
    color: '#D946EF', // Magenta
    description: 'Recorrido completo por la Senda con trazo Magenta',
    badge: 'Estampas y Carretas'
  },
  {
    id: '05-ene',
    dateLabel: '5 Ene',
    name: 'Día de Negros',
    color: '#38BDF8', // Cyan festivo / Tablados
    description: 'Tablados y zonas de juego en Plaza del Carnaval y Plaza de Nariño',
    badge: 'Juego de Cosmético'
  },
  {
    id: '06-ene',
    dateLabel: '6 Ene',
    name: 'Desfile Magno',
    color: '#E11D48', // Rojo Carmesí
    description: 'Recorrido oficial completo con trazo Rojo Carmesí y todos los hitos',
    badge: 'Carrozas Monumentales'
  }
];

export function CarnavalDaySelector({
  selectedDay,
  onSelectDay,
}: {
  selectedDay: string;
  onSelectDay: (dayId: string) => void;
}) {
  return (
    <div className="flex items-center gap-1 sm:gap-1.5 p-1 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-white/10 shadow-lg overflow-x-auto no-scrollbar pointer-events-auto">
      <div className="hidden sm:flex items-center gap-1.5 pl-2.5 pr-1.5 text-xs font-bold text-amber-400 select-none">
        <Calendar className="w-3.5 h-3.5" />
        <span className="text-[11px] uppercase tracking-wider">Fechas:</span>
      </div>

      {OFFICIAL_CARNIVAL_DATES.map((day) => {
        const isSelected = selectedDay === day.id;
        return (
          <button
            key={day.id}
            type="button"
            onClick={() => onSelectDay(day.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 cursor-pointer whitespace-nowrap ${
              isSelected
                ? 'text-white shadow-md ring-2 ring-white/30 scale-[1.02]'
                : 'text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5'
            }`}
            style={
              isSelected
                ? {
                    backgroundColor: day.color,
                    boxShadow: `0 0 16px ${day.color}80`,
                  }
                : {}
            }
            title={`${day.dateLabel} - ${day.name}: ${day.description}`}
          >
            <span>{day.dateLabel}</span>
            <span className="hidden md:inline text-[10px] font-semibold opacity-90">
              {day.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Controlador de Leaflet que encuadra la cámara con fitBounds cada vez que cambia el día oficial
 */
export function DayCameraController({ selectedDay }: { selectedDay: string }) {
  const map = useMap();

  React.useEffect(() => {
    if (!map) return;
    try {
      if (typeof map.fitBounds === 'function') {
        map.fitBounds(SENDA_OFICIAL_COORDS as any, {
          padding: [50, 50],
          animate: true,
          duration: 1.2,
        });
      }
    } catch (err) {
      console.warn('Error ejecutando fitBounds en cambio de día:', err);
    }
  }, [map, selectedDay]);

  return null;
}

export default CarnavalDaySelector;

