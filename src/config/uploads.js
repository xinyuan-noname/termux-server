const EXCEL_MIMES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-excel' // .xls
];
const EXCEL_EXTS = [
  "xlsx",
  "xls"
]
const IMAGE_MIMES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml'
];
// 事项里可以引用的图片格式
const TODO_IMAGE_EXTS = [
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "bmp"
];
const TODO_IMAGE_MIMES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/bmp',
  'image/x-ms-bmp'
];
// 图片文件名: sha256 + 后缀, 后缀决定了响应头里的 Content-Type
const TODO_IMAGE_NAME_REGEXP = new RegExp(`^[0-9a-f]{64}\\.(?:${TODO_IMAGE_EXTS.join("|")})$`);
// 事项内容里引用图片的标记, 例如 %img[<sha256>.jpg]%
const TODO_IMAGE_TAG_REGEXP = new RegExp(`%img\\[([0-9a-f]{64}\\.(?:${TODO_IMAGE_EXTS.join("|")}))\\]%`, "g");
// 单张事项图片的大小上限
const TODO_IMAGE_MAX_SIZE = 5 * 1024 * 1024;
// 部分客户端只会带 application/octet-stream, 这种情况按扩展名判断
const GENERIC_BINARY_MIME = "application/octet-stream";

/**
 * 判断上传的文件是否是可以入库的事项图片
 * @param {string} mimetype - 文件类型
 * @param {string} originalname - 原始文件名
 * @returns {boolean} 是否为合法图片
 */
function isToDoImageFile(mimetype, originalname) {
  const ext = String(originalname || "").split(".").pop().toLowerCase();
  if (TODO_IMAGE_MIMES.includes(mimetype)) return true;
  // 只信任常见图片类型, 其余类型必须同时满足"通用二进制流 + 图片后缀"
  return mimetype === GENERIC_BINARY_MIME && TODO_IMAGE_EXTS.includes(ext);
}

const UPLOAD_DOCUMENT_VIEW_STORAGE_KEY = "upload:document:view:storage:{taskId}:{uploadId}";
module.exports = {
  EXCEL_MIMES,
  IMAGE_MIMES,
  EXCEL_EXTS,
  TODO_IMAGE_EXTS,
  TODO_IMAGE_MIMES,
  TODO_IMAGE_NAME_REGEXP,
  TODO_IMAGE_TAG_REGEXP,
  TODO_IMAGE_MAX_SIZE,
  isToDoImageFile,
  UPLOAD_DOCUMENT_VIEW_STORAGE_KEY
}
