const path = require("path");
const ROOT_DIR = path.resolve(__dirname, "..", "..");
const DATA_DIR = path.resolve(ROOT_DIR, "data");
const DB_DIR = path.resolve(ROOT_DIR, "db");
const AVATAR_DIR = path.resolve(ROOT_DIR, "uploads", "avatars");
const LOGS_DIR = path.resolve(ROOT_DIR, "logs");
const LOGS_DEV_DIR = path.resolve(LOGS_DIR, "dev");
const LOGS_PROD_DIR = path.resolve(LOGS_DIR, "prod");

module.exports = {
    ROOT_DIR,
    DATA_DIR,
    DB_DIR,
    AVATAR_DIR,
    LOGS_DIR,
    LOGS_DEV_DIR,
    LOGS_PROD_DIR
};