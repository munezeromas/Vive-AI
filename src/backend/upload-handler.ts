import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { Router } from "express";
import libre from "libreoffice-convert";
import { promisify } from "util";
import path from "path";

const convertAsync = promisify(libre.convert);

// Ensure keys are present or it will throw when uploading
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Use memory storage so we can send the buffer directly to Cloudinary
const upload = multer({ storage: multer.memoryStorage() });

export const uploadRouter = Router();

uploadRouter.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    let fileBuffer = req.file.buffer;
    let mimeType = req.file.mimetype;
    let fileName = req.file.originalname;

    // Convert Word/PowerPoint to PDF
    const ext = path.extname(fileName).toLowerCase();
    const needsConversion = [".docx", ".doc", ".pptx", ".ppt"].includes(ext);

    if (needsConversion) {
      try {
        console.log(`Converting ${fileName} to PDF...`);
        fileBuffer = await convertAsync(fileBuffer, ".pdf", undefined);
        mimeType = "application/pdf";
        fileName = fileName.replace(ext, ".pdf");
        console.log(`Successfully converted ${fileName} to PDF.`);
      } catch (convErr) {
        console.error("Conversion to PDF failed:", convErr);
        return res.status(500).json({ error: "Failed to convert document to PDF. Ensure LibreOffice is installed on the server." });
      }
    }

    // Convert buffer to Data URI which Cloudinary uploader accepts natively
    const b64 = fileBuffer.toString("base64");
    const dataURI = `data:${mimeType};base64,${b64}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      resource_type: "auto", // Handles images, raw files, pdfs, videos
      folder: "vive_ai_uploads",
    });

    res.status(200).json({ url: result.secure_url, public_id: result.public_id });
  } catch (error: any) {
    console.error("Cloudinary upload error:", error);
    res.status(500).json({ error: error.message || "Upload failed" });
  }
});

