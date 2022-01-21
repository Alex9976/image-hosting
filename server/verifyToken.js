const jwt = require('jsonwebtoken')
const config = require('config')

const verifyToken = async (req, res, next) => {
    try {
        let jwtCookie = req.rawHeaders.find(x => x.indexOf('jwt=') !== -1)
        const token = jwtCookie ? jwtCookie.substring(4) : undefined
        if (token === undefined) {
            res.status(401).send({ message: 'Not authorized' })
            return
        }
        const decoded = jwt.verify(token, config.get('jwtSecret'))
        req.user = {
            userId: decoded.userId
        }

        next()
    } catch {
        res.status(401).send({ message: 'Not authorized' })
    }
}

module.exports = verifyToken