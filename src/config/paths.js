const path = require("path");
const ROOT_DIR = path.resolve(__dirname, "..", "..");
const DATA_DIR = path.resolve(ROOT_DIR, "data");
const DB_DIR = path.resolve(ROOT_DIR, "db");
const UPLOADS_DIR = path.resolve(ROOT_DIR, "uploads");
const AVATAR_DIR = path.resolve(ROOT_DIR, "uploads", "avatars");
const SRC_DIR = path.resolve(ROOT_DIR, "src");
const LOGS_DIR = path.resolve(ROOT_DIR, "logs");

const LOGS_DEV_DIR = path.resolve(LOGS_DIR, "dev");
const LOGS_PROD_DIR = path.resolve(LOGS_DIR, "prod");


const WORKER_INDEX_FILE = path.resolve(SRC_DIR, "worker", "index.js");
const SERVER_INDEX_FILE = path.resolve(SRC_DIR, "app.js");
const URL_TXT_FILE = path.resolve(ROOT_DIR, "url.txt");
module.exports = {
    ROOT_DIR,
    DATA_DIR,
    DB_DIR,

    UPLOADS_DIR,
    AVATAR_DIR,
    
    SRC_DIR,
    LOGS_DIR,
    LOGS_DEV_DIR,
    LOGS_PROD_DIR,

    WORKER_INDEX_FILE,
    SERVER_INDEX_FILE,
    URL_TXT_FILE
};