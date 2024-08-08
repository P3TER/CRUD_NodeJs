// authRoutes.js
const express = require("express");
const router = express.Router();
const { register, login } = require("../Controllers/authController");
const pool = require('../Config/dbConfig');

// Rutas de autenticación
router.post("/", login);
router.post("/registrarse", register);

// Ruta para obtener usuarios (Esta es la API que llamas desde /users en app.js)
router.get('/usuarios', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM users');
        res.json(rows); // Envía los usuarios como JSON
    } catch (error) {
        res.status(500).json({ error: "Error al obtener usuarios" });
    }
});

module.exports = router;
