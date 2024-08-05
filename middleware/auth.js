const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
    const token = req.cookies['jwt'] // {jwt: 'token'} -> cookie object
    if (!token) {
        return res.status(403).json({ msg: 'Missing token' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        if (decoded && decoded.id) {
                req.userId = decoded.id;
                next();
        } else {
            return res.status(403).json({ msg: "Incorrect token" });
        }
    } catch (error) {
        return res.status(403).json({ msg: 'Unkown error has occured' });
    }
}

module.exports = auth