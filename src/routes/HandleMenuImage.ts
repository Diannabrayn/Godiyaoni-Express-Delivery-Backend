// middleware/HandleMenuImage.ts
import { Request, Response, NextFunction } from "express";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

// Custom middleware to handle dynamic field names
export const HandleMenuImages = (req: Request, res: Response, next: NextFunction): void => {
  // Use any() to catch all files
  const uploadMiddleware = upload.any();
  
  uploadMiddleware(req, res, (err: any) => {
    if (err) {
      res.status(400).json({ message: err.message });
      return;
    }
    
    // Transform the files array into an object with proper field names
    if (req.files && Array.isArray(req.files)) {
      const filesByField: { [key: string]: Express.Multer.File[] } = {};
      
      req.files.forEach((file: Express.Multer.File) => {
        if (!filesByField[file.fieldname]) {
          filesByField[file.fieldname] = [];
        }
        filesByField[file.fieldname].push(file);
      });
      
      // Replace req.files with the structured object
      req.files = filesByField;
    }
    
    next();
  });
};