const jwtService = require("../jwt/jwt.service");

const jwtMiddleware =
{
    validateToken: (req, res, next) => {
        // Get token from headers
        let token = req.headers["access_token"] || req.headers["authorization"];

        // Check null or undefined
        if (!token) {
            return res.status(401).send("Token is invalid");
        }

        let user;

        try {
            user = jwtService.verifyJWTToken(token);
        } catch (error) {
            return res.status(401).send(error.message);
        }

        req.user = user;

        next();
    }
};

module.exports = jwtMiddleware;
