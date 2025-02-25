import jwt from "jsonwebtoken"

const authMiddleware = (req, res, next) => {
    try {
        const token = req.cookies["JWT-Token"]

        if(!token) {
            return res.status(401).json({
                message: "Unauthorized"
            })
        }
        jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
            if(err) {
                return res.status(403).json({
                    message: "Unauthorized"
                })
            }
            req.user = user
            next()
        })

    } catch (err) {
        next(err)
    }
}

export default authMiddleware