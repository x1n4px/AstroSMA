const { response } = require('express-validator');
const { validationResult } = require('express-validator');

const validarFields = (req, res = response, next) => {
    const errores = validationResult(req);

    if(!errores.isEmpty()) {
        return res.status(400).json({
            ok: false,
            errores: errores.mapped()
        });
    }

    next();
}

module.exports = {
    validarFields
}