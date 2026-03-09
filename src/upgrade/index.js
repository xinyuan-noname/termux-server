const { mergeProdEnv } = require("../utils/env");
const updateDatabase = require("./database");
const args = process.argv.slice(2);
const [oldDbFileName = ""] = args;
mergeProdEnv();
updateDatabase(oldDbFileName);