export const isAdmin = async (req, res, next) => {
    try {
        const user = req.user;

        if(!user){
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        if(user.role !== "admin"){
            return res.status(403).json({
                success: false,
                message: "Forbidden: Admins only"
            });
        }

        next();

    } catch (err) {
        console.error("Admin middleware error:", err);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}