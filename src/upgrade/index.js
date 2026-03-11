const { mergeProdEnv } = require("../utils/env");
const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
if (!args.length) {
    console.error("需要参数, 指定开发环境的文件夹")
    return process.exit(1);
}
const [ sourceDir ] = args;

replaceSrcAndDbFolders(sourceDir);
mergeProdEnv();


/**
 * 清空src、db文件夹和package.json，并从指定上级目录复制新的src、db文件夹和package.json文件
 * @param {string} sourceDir - 源目录路径
 */
function replaceSrcAndDbFolders(sourceDir) {
    const projectRoot = path.resolve(__dirname, "../.."); // 获取项目根目录

    const sourceRoot = path.resolve(projectRoot, '..', sourceDir);
    const sourceSrcPath = path.join(sourceRoot, "src");
    const sourceDbPath = path.join(sourceRoot, "db");
    const sourcePackageJsonPath = path.join(sourceRoot, "package.json");
    const sourceProEnvPath = path.join(sourceRoot, ".env.production.local");
    const sourceLocalEnvPath = path.join(sourceRoot, ".env.local");

    const targetSrcPath = path.join(projectRoot, "src");
    const targetDbPath = path.join(projectRoot, "db");
    const targetPackageJsonPath = path.join(projectRoot, "package.json");
    const targetProEnvPath = path.join(projectRoot, ".env.production.local");
    const targetLocalEnvPath = path.join(projectRoot, ".env.local");

    console.log(`开始从 ${sourceDir} 升级项目文件...`);

    if (!fs.existsSync(sourceSrcPath)) {
        console.error(`错误：源目录中未找到src文件夹: ${sourceSrcPath}`);
        return process.exit(1);
    }

    if (!fs.existsSync(sourceDbPath)) {
        console.error(`错误：源目录中未找到db文件夹: ${sourceDbPath}`);
        return process.exit(1);
    }

    if (!fs.existsSync(sourcePackageJsonPath)) {
        console.error(`错误：源目录中未找到package.json文件: ${sourcePackageJsonPath}`);
        return process.exit(1);
    }

    if (!fs.existsSync(sourceProEnvPath)) {
        console.error(`错误：源目录中未找到.env.production.local文件: ${sourceProEnvPath}`);
        return process.exit(1);
    }

    if (!fs.existsSync(sourceLocalEnvPath)) {
        console.error(`错误：源目录中未找到.env.local文件: ${sourceLocalEnvPath}`);
        return process.exit(1);
    }

    if (fs.existsSync(targetSrcPath)) {
        deleteFolderRecursive(targetSrcPath);
    }
    if (fs.existsSync(targetDbPath)) {
        deleteFolderRecursive(targetDbPath);
    }

    copyFolderRecursive(sourceSrcPath, targetSrcPath);
    copyFolderRecursive(sourceDbPath, targetDbPath);
    fs.copyFileSync(sourcePackageJsonPath, targetPackageJsonPath);
    fs.copyFileSync(sourceLocalEnvPath, targetLocalEnvPath);
    fs.copyFileSync(sourceProEnvPath, targetProEnvPath);


    console.log("升级完成！请重启应用程序以应用更改。");
}

/**
 * 递归删除文件夹
 * @param {string} folderPath - 要删除的文件夹路径
 */
function deleteFolderRecursive(folderPath) {
    if (fs.existsSync(folderPath)) {
        const items = fs.readdirSync(folderPath);

        for (const item of items) {
            const itemPath = path.join(folderPath, item);

            if (fs.lstatSync(itemPath).isDirectory()) {
                deleteFolderRecursive(itemPath);
            } else {
                fs.unlinkSync(itemPath);
            }
        }

        fs.rmdirSync(folderPath);
    }
}

/**
 * 递归复制文件夹
 * @param {string} source - 源文件夹路径
 * @param {string} target - 目标文件夹路径
 */
function copyFolderRecursive(source, target) {
    // 确保目标文件夹存在
    if (!fs.existsSync(target)) {
        fs.mkdirSync(target, { recursive: true });
    }

    const items = fs.readdirSync(source);

    for (const item of items) {
        const sourceItemPath = path.join(source, item);
        const targetItemPath = path.join(target, item);

        if (fs.lstatSync(sourceItemPath).isDirectory()) {
            // 递归复制子目录
            copyFolderRecursive(sourceItemPath, targetItemPath);
        } else {
            // 复制文件
            fs.copyFileSync(sourceItemPath, targetItemPath);
        }
    }
}