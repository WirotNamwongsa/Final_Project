import multer from 'multer'
import { Request, Response, NextFunction } from 'express'
import { supabase, STORAGE_BUCKET, getPublicUrl as getSupabasePublicUrl } from '../config/supabase'

// Use memory storage for Supabase upload
const storage = multer.memoryStorage()

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
  if (allowed.includes(file.mimetype)) cb(null, true)
  else cb(new Error('ไฟล์ต้องเป็น JPG, PNG หรือ PDF เท่านั้น'))
}

const multerUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
})

// Helper function to sanitize filename (remove special characters and Thai characters)
const sanitizeFileName = (fileName: string): string => {
  // Remove all non-ASCII characters except common safe characters
  return fileName.replace(/[^\x00-\x7F]/g, '') // Remove non-ASCII characters
                .replace(/[^a-zA-Z0-9._-]/g, '') // Remove remaining special characters
                .replace(/\s+/g, '_') // Replace spaces with underscores
                .replace(/_{2,}/g, '_') // Replace multiple underscores with single
                .trim()
}

// Helper function to upload file to Supabase Storage
export const uploadToSupabase = async (
  file: Express.Multer.File,
  folder: string = 'documents'
): Promise<{ path: string; error: string | null }> => {
  try {
    const originalName = file.originalname
    const extension = originalName.split('.').pop() || 'png'
    const sanitizedName = sanitizeFileName(originalName.replace(`.${extension}`, ''))
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${sanitizedName ? `-${sanitizedName}` : ''}.${extension}`
    const filePath = `${folder}/${fileName}`

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      })

    if (error) {
      console.error('Supabase upload error:', error)
      return { path: '', error: error.message }
    }

    return { path: data.path, error: null }
  } catch (error: any) {
    console.error('Upload to Supabase failed:', error)
    return { path: '', error: error.message }
  }
}

// Re-export getPublicUrl for convenience
export const getPublicUrl = getSupabasePublicUrl

export const upload = {
  single: (fieldName: string) => (req: Request, res: Response, next: NextFunction) => {
    multerUpload.single(fieldName)(req, res, (err) => {
      if (err) return res.status(400).json({ success: false, message: err.message })
      next()
    })
  },
  fields: (fields: multer.Field[]) => (req: Request, res: Response, next: NextFunction) => {
    multerUpload.fields(fields)(req, res, (err) => {
      if (err) return res.status(400).json({ success: false, message: err.message })
      next()
    })
  }
}