const ensureUUID = async (req, res, next) => {
    try {

        // Extract the cookie
        const uuid = req.cookies.id || undefined;

        // Check the presence of the UUID
        if (!uuid) {
            req.isAuth = false;
            return next();
        }

        // Set the auth status
        req.isAuth = true;

    } catch (err) {
        // Set the auth status
        req.isAuth = true;
        return next();
    }
};