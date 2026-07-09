const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let backendProcess;

// Detectar si estamos en desarrollo
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function createWindow() {
  try {
    mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    // En desarrollo, cargar desde el servidor Vite
    // En producción, cargar desde los archivos empaquetados
    if (isDev) {
      mainWindow.loadURL('http://localhost:3000');
      mainWindow.webContents.openDevTools();
    } else {
      // En producción, buscar el archivo index.html en diferentes ubicaciones posibles
      const possiblePaths = [
        path.join(__dirname, '../frontend/dist/index.html'),
        path.join(__dirname, '../../frontend/dist/index.html'),
        path.join(process.resourcesPath, 'app/frontend/dist/index.html'),
        path.join(process.resourcesPath, 'frontend/dist/index.html'),
        path.join(__dirname, 'frontend/dist/index.html'),
      ];
      
      let htmlPath = possiblePaths.find(p => {
        try {
          return require('fs').existsSync(p);
        } catch (e) {
          return false;
        }
      });
      
      if (!htmlPath) {
        console.error('No se encontró index.html en ninguna de las rutas posibles');
        console.error('Rutas buscadas:', possiblePaths);
        console.error('__dirname:', __dirname);
        console.error('process.resourcesPath:', process.resourcesPath);
        throw new Error('No se encontró index.html');
      }
      
      console.log('Cargando HTML desde:', htmlPath);
      mainWindow.loadFile(htmlPath);
    }

    mainWindow.on('closed', () => {
      mainWindow = null;
    });
  } catch (error) {
    console.error('Error al crear la ventana:', error);
    throw error;
  }
}

function startBackend() {
  try {
    // Determinar la ruta del backend
    let backendPath;
    if (isDev) {
      backendPath = path.join(__dirname, '../backend');
    } else {
      // En producción, buscar el backend en diferentes ubicaciones posibles
      const possiblePaths = [
        path.join(__dirname, '../backend'),
        path.join(__dirname, '../../backend'),
        path.join(process.resourcesPath, 'app/backend'),
        path.join(process.resourcesPath, 'backend'),
        path.join(__dirname, 'backend'),
      ];
      
      backendPath = possiblePaths.find(p => {
        try {
          return require('fs').existsSync(p);
        } catch (e) {
          return false;
        }
      });
      
      if (!backendPath) {
        console.error('No se encontró el directorio backend');
        console.error('Rutas buscadas:', possiblePaths);
        console.error('__dirname:', __dirname);
        console.error('process.resourcesPath:', process.resourcesPath);
        return;
      }
    }
    
    console.log('Iniciando backend desde:', backendPath);

    // Iniciar el backend como proceso hijo
    backendProcess = spawn('node', ['dist/server.js'], {
      cwd: backendPath,
      shell: true,
    });

    backendProcess.stdout.on('data', (data) => {
      console.log(`Backend stdout: ${data}`);
    });

    backendProcess.stderr.on('data', (data) => {
      console.error(`Backend stderr: ${data}`);
    });

    backendProcess.on('close', (code) => {
      console.log(`Backend process exited with code ${code}`);
    });
  } catch (error) {
    console.error('Error al iniciar el backend:', error);
  }
}

app.whenReady().then(() => {
  try {
    createWindow();
    
    // Esperar un poco antes de iniciar el backend
    setTimeout(() => {
      startBackend();
    }, 2000);

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  } catch (error) {
    console.error('Error en app.whenReady:', error);
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // Detener el backend cuando se cierre la ventana
    if (backendProcess) {
      backendProcess.kill();
    }
    app.quit();
  }
});

// Manejo de errores globales
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// IPC handlers para comunicación con el renderer
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});
