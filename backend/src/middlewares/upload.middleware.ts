// Middleware de gestion des uploads de fichiers
// Utilise Multer pour accepter les fichiers PDF
// Limite la taille à 10 Mo et ne stocke que les PDFs

import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, "../../uploads");
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || "10485760");

// Configuration du stockage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// Filtre pour n'accepter que les PDFs
const fileFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("PDF أو صور فقط مسموح بها"));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});
