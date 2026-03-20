const path = require("path");
const { LOGS_DEV_DIR, URL_TXT_FILE } = require("../config/paths");
const fs = require("fs").promises;
const XLSX = require("xlsx");
const libre = require("libreoffice-convert");
const util = require("util");

/**
 * 清空指定目录下的所有文件内容
 * @param {string} dirPath - 需要清空的目录路径
 * @returns {Promise<number>} - 被清空的文件数量
 */
async function clearFiles(dirPath) {
    const fileNameList = await fs.readdir(dirPath);
    let fileCount = 0;

    await Promise.all(fileNameList.map(async (fileName) => {
        const filePath = path.resolve(dirPath, fileName);
        const fileStat = await fs.stat(filePath);
        if (fileStat.isFile()) {
            await fs.truncate(filePath, 0);
            fileCount++;
        }
    }));

    return fileCount;
}

/**
 * 清空指定目录下的所有日志文件内容（基于 clearFiles 实现）
 * @param {string} [logDir=LOGS_DEV_DIR] - 日志目录路径，默认为 LOGS_DEV_DIR
 * @returns {Promise<number>} - 被清空的日志文件数量
 */
async function clearLogFiles(logDir = LOGS_DEV_DIR) {
    return await clearFiles(logDir);
}
/**
 * 
 * @param {string} url 
 */
async function writeUrl(url) {
    await fs.writeFile(URL_TXT_FILE, url, "utf8");
}

/**
 * 将 Excel 文件缓冲区转换为 JSON 数组
 * @param {Buffer} data - Excel 文件的二进制数据
 * @returns {Array} - 转换后的 JSON 数据数组
 */
function readExcelBufferAsJson(data) {
    const workbook = XLSX.read(data, {
        type: "buffer"
    });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    return jsonData;
}
/**
 * 将 Word 文档转换为 PDF 格式
 * @param {string} inputPath - Word 文档的绝对路径
 * @returns {Promise<Buffer>} - 转换后的 PDF 二进制数据
 */
async function convertWordToPdf(inputPath) {
    const convertAsync = util.promisify(libre.convert);
    await fs.access(inputPath);
    const ext = path.extname(inputPath).toLowerCase();
    const wordExtensions = ['.doc', '.docx'];
    if (!wordExtensions.includes(ext)) {
        throw new Error(`不支持的文件格式：${ext}，仅支持 .doc 和 .docx 文件`);
    }
    const docxBuffer = await fs.readFile(inputPath);
    const pdfBuffer = await convertAsync(docxBuffer, ".pdf", undefined);
    return pdfBuffer;
}

module.exports = {
    clearFiles,
    clearLogFiles,
    writeUrl,
    readExcelBufferAsJson,
    convertWordToPdf
};