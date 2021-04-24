import jwt from "jsonwebtoken";

const tokenVerification = (req, res, next) => {
    if (req.headers.authorization && req.headers.authorization.split(" ")[0] === "Bearer") {
        const token = req.headers.authorization.split(" ")[1];

        try {
            const decoded = jwt.verify(token, process.env.PRIVATE_KEY);
            if (!decoded.userId) return res.status(500).json({ message: "Token error" });
            req.userId = decoded.userId;
            next();
        } catch (error) {
            return res.status(401).json({ message: "Access denied, wrong or expired token" });
        }
    } else {
        return res.status(401).json({ message: "Access denied, provide token" });
    }
};

export default tokenVerification;
