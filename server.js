const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 4000;

// Middlewares
app.use(cors());
app.use(express.json()); // Para poder leer JSON en los POST y PUT

// Nuestra "Base de datos" en memoria
let usuarios = [
    { id: 1, nombre: "Carlos", rol: "QA Automation", activo: true },
    { id: 2, nombre: "Gladys", rol: "Desarrolladora", activo: true }
];

// SIMULADOR: MODO CAOS (Inyección de Errores QA)
app.use((req, res, next) => {
    // Solo aplica el caos si la señal está encendida y NO es la ruta de reset o health
    if (req.query.caos === 'true' && req.path !== '/api/reset' && req.path !== '/api/health') {
        
        const random = Math.random();
        
        // Simulación 1: Timeout de Base de Datos (Latencia Extrema)
        if (random < 0.25) {
            return setTimeout(() => {
                res.status(504).json({ error: "QA SIMULATION (504): Gateway Timeout. La base de datos tardó demasiado en responder." });
            }, 3000);
        } 
        // Simulación 2: Caída del Servidor (Internal Error)
        else if (random < 0.50) {
            return res.status(500).json({ error: "QA SIMULATION (500): Internal Server Error. Fallo en el servicio de usuarios (NullPointerException)." });
        }
        // Simulación 3: Error de Autenticación / Token expirado
        else if (random < 0.75) {
            return res.status(401).json({ error: "QA SIMULATION (401): Unauthorized. Token JWT expirado o inválido." });
        }
        // Simulación 4: Error de Estructura de Datos (Bad Request)
        else {
            return res.status(400).json({ error: "QA SIMULATION (400): Bad Request. Desajuste de esquema detectado. Falta campo obligatorio 'email'." });
        }
    }
    next();
});
// Endpoint de prueba (Healthcheck) - Excelente para JMeter
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'API funcionando correctamente' });
});

// 1. GET: Obtener todos los usuarios
app.get('/api/usuarios', (req, res) => {
    res.status(200).json(usuarios);
});

// 2. GET: Obtener un usuario por ID
app.get('/api/usuarios/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const usuario = usuarios.find(u => u.id === id);
    
    if (usuario) {
        res.status(200).json(usuario);
    } else {
        res.status(404).json({ error: 'Usuario no encontrado' });
    }
});

// 3. POST: Crear un nuevo usuario
app.post('/api/usuarios', (req, res) => {
    const nuevoUsuario = {
        id: usuarios.length > 0 ? usuarios[usuarios.length - 1].id + 1 : 1,
        nombre: req.body.nombre,
        rol: req.body.rol,
        activo: req.body.activo !== undefined ? req.body.activo : true
    };
    
    usuarios.push(nuevoUsuario);
    res.status(201).json(nuevoUsuario); // 201 Created
});

// 4. PUT: Actualizar un usuario existente
app.put('/api/usuarios/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = usuarios.findIndex(u => u.id === id);
    
    if (index !== -1) {
        usuarios[index] = { ...usuarios[index], ...req.body };
        res.status(200).json(usuarios[index]);
    } else {
        res.status(404).json({ error: 'Usuario no encontrado para actualizar' });
    }
});

// 5. DELETE: Eliminar un usuario
app.delete('/api/usuarios/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = usuarios.findIndex(u => u.id === id);
    
    if (index !== -1) {
        const usuarioEliminado = usuarios.splice(index, 1);
        res.status(200).json({ message: 'Usuario eliminado con éxito', usuario: usuarioEliminado[0] });
    } else {
        res.status(404).json({ error: 'Usuario no encontrado para eliminar' });
    }
});

// SIMULADOR: MODO CAOS
app.use((req, res, next) => {
    if (req.query.caos === 'true') {
        // 50% de probabilidad de error de servidor, 50% de probabilidad de latencia alta (3 segundos)
        if (Math.random() > 0.5) {
            return res.status(500).json({ error: "SIMULACIÓN MODO CAOS: Fallo crítico interno del servidor (Simulado)." });
        } else {
            // Simulamos que la base de datos está muy lenta
            return setTimeout(next, 3000); 
        }
    }
    next();
});

// RUTA DEL LABORATORIO: Restaurar la base de datos en memoria
app.post('/api/reset', (req, res) => {
    usuarios = [
        { id: 1, nombre: "Carlos", rol: "QA Automation", activo: true },
        { id: 2, nombre: "Gladys", rol: "Desarrolladora", activo: true }
    ];
    res.status(200).json({ message: "La base de datos de prueba ha sido restaurada con éxito", usuarios });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 API de Pruebas corriendo en http://localhost:${PORT}`);
});