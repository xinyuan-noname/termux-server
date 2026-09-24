module.exports = {
    /**
     * 
     * @param {import("express").Request} req 
     * @param {import("express").Response} res 
     * @param {*} next 
     */
    boolean(req, res, next) {
        const query = {};
        for (const [key, value] of req.query) {
            if (value === "true") {
                query[key] = true;
            } else if (value === "false") {
                query[key] = false;
            } else {
                query[key] = value;
            }
        }
        req.query = query;
        next();
    }
}