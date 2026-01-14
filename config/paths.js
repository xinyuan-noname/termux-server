const path = require("path");
module.exports = {
    ROOT_DIR: path.resolve(__dirname, ".."),
    DATA_DIR: path.resolve(__dirname, "..", "data"),
    SRC_DIR: path.resolve(__dirname, "..", "src"),
    DB_DIR: path.resolve(__dirname, "..", "db"),
    CONFIG_DIR: path.resolve(__dirname),
};