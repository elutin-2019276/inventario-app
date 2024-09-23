const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const xlsx = require('xlsx');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const port = 3000;

// Crear la carpeta uploads si no existe
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Configurar almacenamiento para multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir); // Guardar en la carpeta uploads
    },
    filename: function (req, file, cb) {
        cb(null, 'archivo.xlsx'); // Renombrar el archivo subido
    }
});
const upload = multer({ storage: storage });

// Configurar el servidor para servir archivos estáticos
app.use(express.static('public'));
app.use(express.json());

// Leer archivo Excel
function leerArchivoExcel() {
    const rutaArchivo = path.join(uploadsDir, 'archivo.xlsx');
    const workbook = xlsx.readFile(rutaArchivo);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    return xlsx.utils.sheet_to_json(sheet);
}

// Ruta para subir el archivo Excel
app.post('/subir-archivo', upload.single('archivoExcel'), (req, res) => {
    const datos = leerArchivoExcel(); // Leer los datos del Excel después de subirlo
    res.redirect('/'); // Redirigir al inicio después de la carga
});

// Ruta para buscar en el archivo Excel
app.get('/buscar', (req, res) => {
    const { termino } = req.query;
    const datosExcel = leerArchivoExcel();
    const resultados = datosExcel.filter(dato => {
        return Object.values(dato).some(valor => valor && valor.toString().toLowerCase().includes(termino.toLowerCase()));
    });
    res.json(resultados);
});

// Función para buscar el código de barras
function buscarCodigoBarras() {
    const codigo = document.getElementById('codigoBarras').value;
    if (codigo) {
        // Redirige a resultados.html con el código como parámetro
        window.location.href = `/resultados.html?codigo=${codigo}`;
    }
}

// Función para manejar la lectura del código de barras
function leerCodigoBarras(event) {
    if (event.key === 'Enter') {
        const codigo = document.getElementById('codigoBarras').value;
        if (codigo) {
            window.location.href = `/resultados.html?codigo=${codigo}`;
        }
    }
}

// Función para buscar el código de barras
function buscarCodigoBarras() {
    const codigo = document.getElementById('codigoBarras').value;
    if (codigo) {
        window.location.href = `/resultados.html?codigo=${codigo}`;
    }
}


// Iniciar el servidor
server.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});

io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado');
});
