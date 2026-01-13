#!/bin/bash
echo "🧹 Limpiando puertos..."
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:5173 | xargs kill -9 2>/dev/null
pkill -f nodemon 2>/dev/null
echo "✅ Puertos liberados!"
