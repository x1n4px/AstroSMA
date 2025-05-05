const validateRol = (req, res, next) => {
    const userRol = req.header('x-rol');
    if (userRol !== '10000000') {
        return res.status(403).json({ message: 'Access denied: Invalid role' });
    }

    next();
};

module.exports = {
    validateRol
}