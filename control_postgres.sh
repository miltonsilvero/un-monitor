#!/bin/bash

SERVICE="postgresql"

menu() {
    echo "=============================="
    echo " Control de PostgreSQL"
    echo "=============================="
    echo "1) Iniciar PostgreSQL"
    echo "2) Detener PostgreSQL"
    echo "3) Ver estado de PostgreSQL"
    echo "4) Reiniciar PostgreSQL"
    echo "5) Salir"
    echo "=============================="
    read -p "Elegí una opción: " option
}

while true; do
    menu
    case $option in
        1)
            sudo systemctl start $SERVICE
            echo "PostgreSQL iniciado."
            ;;
        2)
            sudo systemctl stop $SERVICE
            echo "PostgreSQL detenido."
            ;;
        3)
            systemctl status $SERVICE --no-pager
            ;;
        4)
            sudo systemctl restart $SERVICE
            echo "PostgreSQL reiniciado."
            ;;
        5)
            echo "Saliendo..."
            exit 0
            ;;
        *)
            echo "Opción inválida"
            ;;
    esac
    echo
done

