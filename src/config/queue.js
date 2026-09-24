const DEL_AVATAR_KEY ="queue:delete:avatar";
const DEL_TASK_KEY = "queue:delete:task"
const CONVERT_TO_PDF_KEY = "queue:convert:to_pdf";
const CONVERTED_FILE_REDIS_EXPIRED_WINDOWS = 3 * 24 * 3600; // 3d
module.exports={
    DEL_AVATAR_KEY,
    DEL_TASK_KEY,
    CONVERT_TO_PDF_KEY,
    CONVERTED_FILE_REDIS_EXPIRED_WINDOWS
}