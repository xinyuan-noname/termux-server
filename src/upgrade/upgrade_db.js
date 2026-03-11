const args = process.argv.slice(2);
if (!args.length) {
    console.error("需要参数,分别指定旧数据库文件")
    return process.exit(1);
}
const [oldDbFileName] = args;
require("dotenv").config();
const updateDatabase = require("./database");
updateDatabase(oldDbFileName);