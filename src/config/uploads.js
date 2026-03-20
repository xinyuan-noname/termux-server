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

const UPLOAD_DOCUMENT_VIEW_STORAGE_KEY = "upload:document:view:storage:{taskId}:{uploadId}";
module.exports = {
  EXCEL_MIMES,
  IMAGE_MIMES,
  EXCEL_EXTS,
  UPLOAD_DOCUMENT_VIEW_STORAGE_KEY
}