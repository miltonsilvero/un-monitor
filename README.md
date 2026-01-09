# Sistema de Debates de Naciones Unidas

Sistema para llevar el control de debates de las Naciones Unidas con gestión de usuarios, modelos y anotaciones.

## Requisitos Previos

- Node.js (v18 o superior)
- PostgreSQL (v14 o superior)
- npm o yarn

## Instalación

### 1. Configurar la Base de Datos

Crear una base de datos PostgreSQL:

```bash
psql -U postgres
CREATE DATABASE un_debate;
\q
```

### 2. Instalar Backend

```bash
cd backend
npm install
```

Configurar variables de entorno en `.env`:
- DATABASE_URL debe apuntar a tu base de datos PostgreSQL
- Si tu usuario/contraseña de PostgreSQL son diferentes, modifica la URL

Ejecutar migraciones y seed:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

### 3. Instalar Frontend

```bash
cd ../frontend
npm install
```

## Ejecutar el Sistema

### Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

El backend correrá en `http://localhost:3000`

### Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

El frontend correrá en `http://localhost:5173`

## Acceso Inicial

- **Usuario:** admin
- **Contraseña:** admin

## Estructura del Proyecto

```
un-debate-system/
├── backend/          # API REST con Express y Prisma
├── frontend/         # Interfaz React
└── flags/           # Banderas de países (PNG)
```

## Tipos de Usuario

1. **Admin**: Acceso completo (usuarios, modelos, administración)
2. **Mesa**: Puede anotar intervenciones (peso 1)
3. **Supervisor**: Puede anotar intervenciones (peso 2)

## Órganos Disponibles

- Consejo de Seguridad
- Asamblea General
- Consejo Económico y Social
- Consejo de DDHH
- Sala de Tratados
- OMS

## Valoraciones

1. Muy Mala (1 punto)
2. Mala (2 puntos)
3. Regular (3 puntos)
4. Buena (4 puntos)
5. Excelente (5 puntos)

## Cálculo de Ranking

```
Ranking = Σ(valoración × peso_usuario)
```

- Mesa: peso 1
- Supervisor: peso 2

## Problemas Comunes

### Error de conexión a PostgreSQL
- Verificar que PostgreSQL esté corriendo
- Verificar credenciales en backend/.env

### Puerto ocupado
- Backend: cambiar PORT en backend/.env
- Frontend: cambiar port en frontend/vite.config.js

## Desarrollo

Para hacer cambios en la base de datos:

1. Modificar `backend/prisma/schema.prisma`
2. Ejecutar `npm run prisma:migrate`
3. Ejecutar `npm run prisma:generate`
