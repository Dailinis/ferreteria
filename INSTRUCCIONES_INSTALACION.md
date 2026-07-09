# Instrucciones de Instalación - Sistema Inventario Ferretería

## Para el Cliente (Instalación sin servidor manual)

El sistema está empaquetado como una aplicación de escritorio que inicia automáticamente el servidor backend. El cliente no necesita conocimientos técnicos ni iniciar servidores manualmente.

### Método 1: Instalación Automática (Recomendado)

1. **Copiar la carpeta completa** `dist-final\Sistema Inventario Ferretería-win32-x64` al computador del cliente
2. **Ejecutar el script** `instalar.bat` dentro de la carpeta `dist-final`
3. **Seguir las instrucciones** del instalador:
   - Ingresar el directorio donde desea instalar (por defecto: `C:\SistemaInventario`)
   - El instalador copiará todos los archivos
   - Creará accesos directos en el escritorio y menú de inicio

### Método 2: Instalación Manual

1. **Copiar la carpeta** `Sistema Inventario Ferretería-win32-x64` al computador del cliente
2. **Renombrar la carpeta** a `SistemaInventario` (opcional)
3. **Crear acceso directo** en el escritorio apuntando a `Sistema Inventario Ferretería.exe`

### Credenciales de Acceso

- **Usuario**: admin
- **Contraseña**: admin123

### Desinstalación

Para desinstalar la aplicación:
- Ejecute el script `desinstalar.bat` en la carpeta `dist-final`
- O elimine manualmente la carpeta de instalación y los accesos directos

## Notas Técnicas

- La aplicación inicia automáticamente el servidor backend cuando se ejecuta
- No requiere configuración adicional
- La base de datos SQLite se crea automáticamente en la primera ejecución
- El puerto 3001 se usa para la comunicación interna (no requiere configuración)

## Requisitos del Sistema

- Windows 10 o superior
- 2 GB de RAM mínimo
- 500 MB de espacio en disco
