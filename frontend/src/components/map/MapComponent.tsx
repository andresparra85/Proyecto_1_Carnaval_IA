import L from 'leaflet';

/**
 * Generador de pines SVG modernos y festivos con resplandor para los Hitos de la Senda del Carnaval
 */
export function createSvgLandmarkPin({
  type,
  label,
}: {
  type: 'inicio' | 'intermedio' | 'fin' | 'plaza' | 'salud';
  label?: string;
}) {
  let pinColor = '#F59E0B'; // Ámbar por defecto
  let shadowColor = 'rgba(245, 158, 11, 0.6)';
  let iconSvg = '';
  let subText = 'Hito';

  if (type === 'inicio') {
    // Verde Esmeralda con icono de Bandera de Salida
    pinColor = '#10B981';
    shadowColor = 'rgba(16, 185, 129, 0.65)';
    subText = 'Salida';
    iconSvg = `
      <svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
        <path d="M4 2v20h2v-8h14l-2-6 2-6H6V2H4z"/>
      </svg>
    `;
  } else if (type === 'fin') {
    // Carmesí festivo con icono de Meta / Llegada
    pinColor = '#E11D48';
    shadowColor = 'rgba(225, 29, 72, 0.7)';
    subText = 'Llegada';
    iconSvg = `
      <svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    `;
  } else {
    // Dorado / Ámbar con icono de Corona / Tarima Festiva (Plaza Nariño / Carnaval)
    pinColor = '#F59E0B';
    shadowColor = 'rgba(245, 158, 11, 0.65)';
    subText = 'Hito';
    iconSvg = `
      <svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
        <path d="M2.5 19h19v2h-19zm19.5-8.5-5 3.5-5-7-5 7-5-3.5 2 9h16z"/>
      </svg>
    `;
  }

  const html = `
    <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer; transform: translate(-50%, -100%);">
      <!-- Pin SVG con sombra y borde pulido -->
      <div style="
        width: 38px;
        height: 38px;
        border-radius: 50% 50% 50% 0;
        background: ${pinColor};
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2.5px solid #ffffff;
        box-shadow: 0 0 20px ${shadowColor}, 0 8px 16px rgba(0,0,0,0.6);
        transition: transform 0.2s ease;
      ">
        <div style="transform: rotate(45deg); display: flex; align-items: center; justify-content: center;">
          ${iconSvg}
        </div>
      </div>
      <!-- Resplandor pulsante en la base -->
      <div style="
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: ${pinColor};
        opacity: 0.8;
        box-shadow: 0 0 12px ${pinColor};
        margin-top: 2px;
      "></div>
    </div>
  `;

  return L.divIcon({
    className: 'custom-svg-landmark-pin',
    html,
    iconSize: [38, 48],
    iconAnchor: [19, 48],
    popupAnchor: [0, -50],
  });
}

export * from './CarnavalDaySelector';
export { default as CarnavalDaySelector } from './CarnavalDaySelector';
export * from '../MapView';
export { default } from '../MapView';
export { MapView as MapComponent } from '../MapView';
