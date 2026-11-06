# CarnavalIA - Frontend 🎭

Plataforma Web Progresiva (PWA) e interactiva del **Carnaval de Negros y Blancos de San Juan de Pasto**. Diseñada para la visualización geoespacial en tiempo real de la Senda del Carnaval, gestión de incidencias ciudadanas, mapas de calor/zonas de riesgo y asistencia turística inteligente impulsada por IA (GuaneñaBot).

---

## 🚀 Tecnologías y Stack

- **Framework / Core:** [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Lenguaje:** [TypeScript](https://www.typescriptlang.org/) / JavaScript ESNext
- **Estilos y UI:** [TailwindCSS 3](https://tailwindcss.com/) + [Lucide React](https://lucide.dev/)
- **Visualización Geoespacial:** [Leaflet](https://leafletjs.com/) + [React-Leaflet](https://react-leaflet.js.org/)
- **Cliente HTTP:** [Axios](https://axios-http.com/) con interceptores de autenticación JWT
- **PWA & Offline:** [Vite Plugin PWA](https://vite-pwa-org.netlify.app/) con Workbox
- **Linter & Calidad de Código:** [Oxlint](https://oxc.rs/)

---

## 📋 Requisitos Previos

- [Node.js](https://nodejs.org/) `>= 18.0.0` (recomendado v20+ LTS)
- [npm](https://www.npmjs.com/) `>= 9.0.0`

---

## 🛠️ Instalación y Configuración

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/cristiancg11/Proyecto_1_Carnaval_IA.git
   cd Proyecto_1_Carnaval_IA/frontend
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**
   Crea o verifica el archivo `.env` en la raíz del frontend (`frontend/.env`):
   ```env
   # URL base de conexión al backend de FastAPI
   VITE_API_URL=http://localhost:8000

   # Servicios en la nube y persistencia (opcional / producción)
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-clave-publica-anon
   ```

---

## 💻 Scripts de Ejecución

| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Inicia el servidor de desarrollo local con Hot Module Replacement (HMR) en `http://localhost:5173`. |
| `npm run build` | Compila y empaqueta la aplicación para producción en la carpeta `dist/`, generando Service Workers de PWA. |
| `npm run preview` | Previsualiza localmente el paquete de producción generado en `dist/`. |
| `npm run lint` | Ejecuta análisis estático ultra-rápido de código mediante Oxlint. |

---

## 🏛️ Estructura del Proyecto

```
frontend/
├── public/                 # Favicons, iconos PWA y manifiesto
├── src/
│   ├── assets/             # Recursos visuales y gráficos
│   ├── components/         # Componentes modulares de interfaz
│   │   ├── MapView.jsx          # Mapa interactivo Leaflet con la Senda oficial
│   │   ├── ChatBot.tsx          # GuaneñaBot (Asistente IA contextual interactivo)
│   │   ├── Header.jsx           # Barra de navegación principal y sesión
│   │   ├── LoginView.jsx        # Pantalla de acceso, registro y modo demo
│   │   ├── ReportModal.jsx      # Modal de registro georreferenciado de incidentes
│   │   ├── CitizenReportsModal.jsx # Historial de reportes comunitarios
│   │   └── EventsCalendarModal.jsx # Cronograma oficial de eventos
│   ├── context/            # Proveedores de estado global (AuthContext)
│   ├── data/               # Catálogos estáticos y coordenadas de la Senda
│   │   ├── carnavalKnowledge.ts # Base de conocimiento cultural y coordenadas
│   │   └── carnivalRoutes.js    # Trazado oficial georreferenciado
│   ├── services/           # Clientes HTTP desacoplados (api.js, authService.js)
│   ├── App.jsx             # Punto de entrada y control de rutas protegidas
│   └── main.jsx            # Inicialización de React y providers
├── index.html              # HTML base
├── vite.config.js          # Configuración del empaquetador y PWA
├── tsconfig.json           # Configuración de TypeScript y alias de ruta (@/*)
└── package.json            # Metadatos y dependencias npm
```

---

## 🔒 Autenticación y Modo Evaluador / Demo

La aplicación cuenta con protección estricta de rutas:
- La vista inicial por defecto es la pantalla de **Login**.
- Para facilitar la evaluación académica y sustentación, se incluye el botón **"Ingresar como Turista / Demo"**, el cual permite probar todas las capacidades interactivas en un solo clic sin necesidad de credenciales previas ni conexión a backend externo.
