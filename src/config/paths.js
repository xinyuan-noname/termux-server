const path = require("path");
const ROOT_DIR = path.resolve(__dirname, "..", "..");
const DATA_DIR = path.resolve(ROOT_DIR, "data");
const DB_DIR = path.resolve(ROOT_DIR, "db");
const AVATAR_DIR = path.resolve(ROOT_DIR, "uploads", "avatars");
module.exports = {
    ROOT_DIR,
    DATA_DIR,
    DB_DIR,
    AVATAR_DIR
};