#!/bin/bash

echo "==================================="
echo "Sistema de Debates - Naciones Unidas"
echo "==================================="
echo ""

# Verificar si PostgreSQL está corriendo
if ! pg_isready -q; then
    echo "❌ PostgreSQL no está corriendo. Por favor inicia PostgreSQL primero."
    exit 1
fi

echo "✅ PostgreSQL está corriendo"
echo ""

# Verificar si las dependencias están instaladas
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Instalando dependencias del backend..."
    cd backend && npm install && cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Instalando dependencias del frontend..."
    cd frontend && npm install && cd ..
fi

echo ""
echo "🔧 Configurando base de datos..."
cd backend

# Generar cliente de Prisma
npm run prisma:generate > /dev/null 2>&1

# Ejecutar migraciones
npm run prisma:migrate > /dev/null 2>&1

# Ejecutar seed
npm run prisma:seed

cd ..

echo ""
echo "==================================="
echo "✅ Sistema listo para usar"
echo "==================================="
echo ""
echo "Credenciales iniciales:"
echo "  Usuario: admin"
echo "  Contraseña: admin"
echo ""
echo "Para iniciar el sistema, ejecuta en dos terminales:"
echo ""
echo "Terminal 1 (Backend):"
echo "  cd backend && npm run dev"
echo ""
echo "Terminal 2 (Frontend):"
echo "  cd frontend && npm run dev"
echo ""
echo "Luego abre: http://localhost:5173"
echo "==================================="
