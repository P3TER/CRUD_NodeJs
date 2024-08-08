import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import csurf from 'csurf';
import { fileURLToPath } from 'url';
import path, {dirname} from 'path';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch'; 
import pool from '../Api/Config/dbConfig.js'
const app = express();
const port = process.env.PORT || 3231;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const csrf = csurf({ cookie: true });

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(csrf);
app.use(express.static(path.join(__dirname, 'public')));

// Autenticación de Token
const authenticateToken = (req, res, next) => {
    const token = req.cookies.authToken;

    if (!token) {
        return res.redirect('/');
    }

    jwt.verify(token, "Tu jwt secreto", (err, user) => {
        if (err) {
            res.clearCookie('authToken');
            return res.redirect('/');
        }
        req.user = user;
        next();
    });
};

// Configuración de vistas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Evitar cacheo de páginas
app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
});

// Rutas de la aplicación
app.get('/', csrf, (req, res) => {
    res.render('login', { csrfToken: req.csrfToken() });
});

app.get('/register', csrf, (req, res) => {
    res.render('register', { csrfToken: req.csrfToken() });
});

app.get('/inicio', authenticateToken, async (req, res) => {
    try {
        const [user] = await pool.query('SELECT * FROM users WHERE id = ?', [req.user.id]);

        res.render('index', { user: user[0] });
    } catch (error) {
        console.error('Error al obtener información del usuario:', error);
        res.status(500).send('Error interno del servidor');
    }
});



// Esta ruta es correcta, ya que consulta a la API
app.get('/users', authenticateToken, async (req, res) => {
    try {
        const response = await fetch('http://localhost:3232/app/usuarios', {
            headers: {
                'Authorization': `Bearer ${req.cookies.authToken}`,
            },
        });

        if (!response.ok) {
            throw new Error('Error al obtener usuarios');
        }

        const users = await response.json();
        res.render('usuarios', { users });
    } catch (error) {
        res.status(500).send(`Error al obtener usuarios: ${error.message}`);
    }
});

app.get('/usuarios/edit/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
        if (rows.length === 0) return res.status(404).send('Usuario no encontrado');
        res.render('editUser', { user: rows[0], csrfToken: req.csrfToken() });
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        res.status(500).send('Error interno del servidor');
    }
});

app.post('/usuarios/edit/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { name, email } = req.body;
    try {
        await pool.query('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, id]);
        res.redirect('/inicio'); // Redirige al usuario a la página de inicio o a la lista de usuarios
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).send('Error interno del servidor');
    }
});


// Manejador de Logout
app.get('/logout', (req, res) => {
    res.clearCookie('authToken');
    res.redirect('/');
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`http://localhost:${port}`);
});
