const pool = require('../database/connection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { extraerUserId } = require('../middlewares/extractJWT')
require('dotenv').config();
const auditEvent = require('../middlewares/audit')
const crypto = require("crypto");
const {sendMail} = require('../email/mailer');

const registerUser = async (req, res) => {
    try {
        const { email, password, name, surname, countryId, institution, isMobile } = req.body;

        // Validación básica
        if (!email || !password || !name || !surname || !countryId || !institution) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
        }

        // Comprobar si ya existe un usuario con el mismo email
        const [existingUser] = await pool.query('SELECT id FROM user WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(409).json({ error: 'Ya existe un usuario con ese correo electrónico.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const rol = '00000001';

        // Obtener el último ID
        const [lastIdResult] = await pool.query('SELECT MAX(id) AS maxId FROM user');
        const lastId = lastIdResult[0].maxId || 0;
        const newId = lastId + 1;

        // Insertar el nuevo usuario
        await pool.query(
            'INSERT INTO user (id, email, password, name, surname, pais_id, institucion, rol) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [newId, email, hashedPassword, name, surname, countryId, institution, rol]
        );

        await sendMail({
            to: email,
            subject: 'Bienvenido a la Sociedad Malagueña de Astronomía',
            text: `¡Gracias por registrarte en la aplicación gráfica de la Sociedad Malagueña de Astronomía!\n\nPuedes iniciar sesión accediendo al siguiente enlace:\nhttp://localhost:5173/login\n\nEsperamos que disfrutes explorando los datos astronómicos con nosotros.`,
            html: `
              <h2>¡Bienvenido a la Sociedad Malagueña de Astronomía!</h2>
              <p>Gracias por registrarte en la aplicación gráfica de la Sociedad Malagueña de Astronomía.</p>
              <p>Puedes iniciar sesión haciendo clic en el siguiente enlace:</p>
              <p><a href="http://localhost:5173/login" style="color: #1a73e8;">Iniciar sesión</a></p>
              <p>Esperamos que disfrutes explorando los datos astronómicos con nosotros.</p>
              <p>Un saludo,<br>Sociedad Malagueña de Astronomía</p>
            `
          });
          

        // Generar el token JWT
        const token = jwt.sign({ userId: newId }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Auditar el evento
        auditEvent('REGISTER', newId, 'register', -1, 0, 'Registro de usuario', isMobile);

        res.status(201).json({ token, rol });
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        res.status(500).json({ error: 'Ha ocurrido un error al registrar el usuario.' });
    }
};


const loginUser = async (req, res) => {
    try {
        const { email, password, isMobile } = req.body;
        const [rows] = await pool.query('SELECT * FROM user WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }
        const user = rows[0];
        const rol = user.rol;
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const [config] = await pool.query('SELECT key_value, value FROM config');

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '12h' });
        const saf = auditEvent('ACCESS', user.id, 'login', -1, 0, 'Inicio de sesión', isMobile);
        res.json({ token, rol, config });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const QRLoginUser = async (req, res) => {
    try {
        const { path } = req.body;
        const token = jwt.sign({ userId: path }, process.env.JWT_SECRET, { expiresIn: '2h' });
        const rol = '00000000';
        res.json({ token, rol });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const renewToken = async (req, res = response) => {
    const uid = req.uid;
    // Generar el token - JWT
    const token = await generarJWT(uid);

    res.json({
        ok: true,
        token
    });
}


const sendPasswordResetEmail = async (req, res) => {
    const { email } = req.body;

    try {
        // Verificar si el usuario existe
        const [user] = await pool.query('SELECT * FROM user WHERE email = ?', [email]);
        if (user.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // 1. Generar token aleatorio
        const token = crypto.randomBytes(32).toString("hex");

        // 2. Calcular expiración (ej: 1 hora)
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

        // 3. Guardar el token y la expiración en la base de datos
        await pool.query('INSERT INTO astro.password_reset_tokens (user_id, token, expires_at, used) VALUES(?, ?, ?, 0);', [user[0].id, token, expiresAt]);
        console.log(token);


        await sendMail({
            to: email,
            subject: 'Restablecimiento de contraseña',
            text: `Hemos recibido una solicitud para restablecer tu contraseña.\n\nPuedes hacerlo accediendo al siguiente enlace:\nhttp://localhost:5173/reset-password/${token}\n\nEste enlace expirará en 1 hora.`,
            html: `
              <h2>Restablecimiento de contraseña</h2>
              <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en la Sociedad Malagueña de Astronomía.</p>
              <p>Haz clic en el siguiente enlace para continuar. Este enlace expirará en 1 hora:</p>
              <p><a href="http://localhost:5173/reset-password/${token}" style="color: #1a73e8;">Restablecer contraseña</a></p>
              <p>Si tú no solicitaste este cambio, puedes ignorar este mensaje.</p>
              <p>Un saludo,<br>Sociedad Malagueña de Astronomía</p>
            `
          }
          );

        // Aquí deberías enviar el token al correo electrónico del usuario
        // Por simplicidad, solo lo devolveremos en la respuesta
        res.json({ token });
    } catch (error) {
        console.error('Error al enviar el correo de restablecimiento de contraseña:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}


const checkUuidValidity = async (req, res) => {
    const { token } = req.query;
    try {
        // Verificar si el token existe y no ha sido usado
        const [tokenData] = await pool.query('SELECT * FROM password_reset_tokens WHERE token = ? AND used = 0', [token]);
        if (tokenData.length === 0) {
            return res.status(400).json({ message: 'Token inválido o ya utilizado' });
        }

        // Verificar si el token ha expirado
        const expiresAt = new Date(tokenData[0].expires_at);
        if (expiresAt < new Date()) {
            return res.status(400).json({ message: 'Token expirado' });
        }

        res.json({ message: 'Token válido' });
    } catch (error) {
        console.error('Error al verificar la validez del token:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

const resetPasswordFromEmail = async (req, res) => {
    const { password, token } = req.body;

    try {
        // Verificar si el token existe y no ha sido usado
        const [tokenData] = await pool.query('SELECT * FROM password_reset_tokens WHERE token = ? AND used = 0', [token]);
        if (tokenData.length === 0) {
            return res.status(400).json({ message: 'Token inválido o ya utilizado' });
        }

        // Verificar si el token ha expirado
        const expiresAt = new Date(tokenData[0].expires_at);
        if (expiresAt < new Date()) {
            return res.status(400).json({ message: 'Token expirado' });
        }

        // Obtener el ID del usuario asociado al token
        const userId = tokenData[0].user_id;

        // Hashear la nueva contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Actualizar la contraseña del usuario
        await pool.query('UPDATE user SET password = ? WHERE id = ?', [hashedPassword, userId]);

        // Marcar el token como usado
        await pool.query('UPDATE password_reset_tokens SET used = 1 WHERE token = ?', [token]);

        res.json({ message: 'Contraseña restablecida con éxito' });
    } catch (error) {
        console.error('Error al restablecer la contraseña:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}


module.exports = { registerUser, loginUser, renewToken, QRLoginUser, sendPasswordResetEmail, checkUuidValidity, resetPasswordFromEmail };