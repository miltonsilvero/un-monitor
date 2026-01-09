# Guía de Uso Rápido - Sistema de Debates ONU

## Inicio Rápido

### 1. Primera Configuración (solo una vez)

```bash
cd un-debate-system
./setup.sh
```

Este script:
- Verifica PostgreSQL
- Instala dependencias
- Configura la base de datos
- Crea el usuario admin

### 2. Iniciar el Sistema

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Abrir navegador:** http://localhost:5173

**Login inicial:**
- Usuario: `admin`
- Contraseña: `admin`

## Flujo de Trabajo

### Como Administrador

1. **Gestionar Usuarios**
   - Ir a "Usuarios"
   - Agregar usuarios tipo "Mesa" o "Supervisor"
   - Establecer usuario y contraseña

2. **Crear Modelos**
   - Ir a "Modelos"
   - Crear nuevo modelo
   - Seleccionar órganos (ej: Consejo de Seguridad)
   - Agregar países participantes

3. **Administrar un Modelo**
   - Seleccionar el modelo
   - Ver historial de todas las anotaciones
   - Ver ranking de países
   - Eliminar acciones si es necesario
   - Eliminar el modelo completo

### Como Mesa o Supervisor

1. **Seleccionar Modelo**
   - Al iniciar sesión verás los modelos disponibles
   - Selecciona el modelo activo

2. **Anotar Intervenciones**
   - Seleccionar órgano (si hay múltiples)
   - Click en la bandera del país
   - Elegir valoración (1-5)
   - Agregar observaciones (opcional)
   - Guardar

3. **Ver tus Anotaciones**
   - Historial de tus propias anotaciones
   - Opción de eliminar tus anotaciones

## Cálculo de Puntuación

```
Puntuación Final = Valoración × Peso del Usuario

Pesos:
- Mesa: 1
- Supervisor: 2
- Admin: 0 (no anota)

Ranking Total = Suma de todas las puntuaciones por país
```

## Ejemplo Práctico

**Escenario:** Debate en Consejo de Seguridad

1. Admin crea modelo "Debate Enero 2026"
2. Admin agrega órgano "Consejo de Seguridad" con 5 países
3. Admin crea 2 usuarios Mesa y 1 Supervisor
4. Los usuarios anotan intervenciones:
   - Mesa anota: China - Excelente (5) = 5 puntos
   - Supervisor anota: China - Buena (4) = 8 puntos
   - **Total China: 13 puntos**

## Estructura de Órganos

### Consejo de Seguridad
- Muestra banderas en semicírculo
- 5 miembros permanentes por defecto

### Otros Órganos
- Muestran banderas en cuadrícula alfabética
- Cantidad variable de países

## Agregar Nuevas Banderas

1. Colocar archivo PNG en: `frontend/public/flags/`
2. Nombrar: `nombre-pais.png` (ej: `argentina.png`)
3. Actualizar mapeo en `Annotate.jsx`:

```javascript
const getFlagPath = (countryName) => {
  const flagMap = {
    'Argentina': '/flags/argentina.png',
    // ... más países
  };
  return flagMap[countryName] || null;
};
```

## Solución de Problemas

### Error: Cannot connect to database
```bash
# Verificar PostgreSQL
pg_isready

# Si no está corriendo, iniciar:
# En Windows: Buscar "Services" y iniciar PostgreSQL
# En Mac: brew services start postgresql
# En Linux: sudo systemctl start postgresql
```

### Error: Port 3000 already in use
```bash
# Cambiar puerto en backend/.env
PORT=3001
```

### Error: Port 5173 already in use
```bash
# Cambiar puerto en frontend/vite.config.js
server: {
  port: 5174
}
```

### Error: Module not found
```bash
# Reinstalar dependencias
cd backend && rm -rf node_modules && npm install
cd ../frontend && rm -rf node_modules && npm install
```

## Personalización

### Cambiar Colores
Editar `frontend/tailwind.config.js`:

```javascript
colors: {
  'un-blue': '#009edb',  // Color principal
  'un-dark': '#1e3a8a',  // Color oscuro
}
```

### Agregar Nuevos Órganos
Editar `frontend/src/pages/CreateModel.jsx`:

```javascript
const AVAILABLE_ORGANS = [
  'Consejo de Seguridad',
  'Asamblea General',
  // ... agregar más aquí
  'Tu Nuevo Órgano'
];
```

## Backup de Datos

```bash
# Exportar base de datos
pg_dump -U postgres un_debate > backup.sql

# Importar backup
psql -U postgres un_debate < backup.sql
```

## Despliegue en Red Local

1. Cambiar en `backend/.env`:
```
# Usa la IP de tu máquina en lugar de localhost
```

2. Cambiar en `frontend/vite.config.js`:
```javascript
server: {
  host: '0.0.0.0',  // Permite conexiones externas
  port: 5173
}
```

3. Los otros PCs acceden a: `http://TU_IP:5173`

## Contacto y Soporte

Para problemas o dudas:
1. Revisar esta guía
2. Revisar README.md
3. Verificar logs de consola en backend y frontend
