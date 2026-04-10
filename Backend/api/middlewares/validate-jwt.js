const jwt = require('jsonwebtoken');
const { normalizeToken, resolveJwtUserId } = require('./extractJWT');

const validateJWT = (req, res, next) => {
    //Leer el token
    const token = normalizeToken(req.header('Authorization'));
    if (!token) {
        return res.status(401).json({
            ok: false,
            msg: 'No hay token en la petición'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = resolveJwtUserId(decoded);

        if (userId === undefined || userId === null) {
            return res.status(401).json({
                ok: false,
                msg: 'Token no válido'
            });
        }

        req.uid = userId;
        req.userId = userId;
        next();

    } catch (error) {
        return res.status(401).json({
            ok: false,
            msg: 'Token no válido'
        });
    }


}

module.exports = {
    validateJWT
}
