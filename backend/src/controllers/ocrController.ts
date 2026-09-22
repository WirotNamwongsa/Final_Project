import { Request, Response } from 'express'
import { GoogleGenerativeAI } from '@google/generative-ai'
import fs from 'fs'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''

// --- Rate Limiter (per IP) ---
const OCR_RATE_LIMIT = 20         // max requests per window (รองรับ NAT IP ร่วม ~5 เครื่อง)
const OCR_RATE_WINDOW_MS = 60_000 // 60 seconds
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

// Auto-cleanup stale entries every 5 min
setInterval(() => {
  const now = Date.now()
  for (const [ip, entry] of rateLimitMap) {
    if (now > entry.resetAt) rateLimitMap.delete(ip)
  }
}, 5 * 60_000)

function checkRateLimit(ip: string): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + OCR_RATE_WINDOW_MS })
    return { allowed: true, retryAfterSec: 0 }
  }

  if (entry.count < OCR_RATE_LIMIT) {
    entry.count++
    return { allowed: true, retryAfterSec: 0 }
  }

  return { allowed: false, retryAfterSec: Math.ceil((entry.resetAt - now) / 1000) }
}

// Models to try in order (fallback chain)
const MODELS = ['gemini-3-flash-preview', 'gemini-2.5-flash-preview-05-20', 'gemini-2.5-flash-preview', 'gemini-2.0-flash', 'gemini-1.5-flash']

const PROMPT = `คุณเป็น AI ที่เชี่ยวชาญในการอ่านบัตรประจำตัวประชาชนไทย
ให้อ่านข้อมูลจากภาพบัตรประจำตัวประชาชนนี้ แล้วตอบกลับเป็น JSON เท่านั้น ห้ามมี markdown หรือข้อความอื่น

กรุณาอ่านข้อมูลต่อไปนี้ให้ถูกต้อง โดยเฉพาะ วรรณยุกต์ สระ และตัวสะกด:
- เลขประจำตัวประชาชน 13 หลัก (ตัวเลขเท่านั้น ไม่มีเว้นวรรคหรือขีด)
- คำนำหน้าชื่อ (นาย, นาง, นางสาว, เด็กชาย, เด็กหญิง)
- ชื่อ-นามสกุล (ภาษาไทย ไม่รวมคำนำหน้า)
- ที่อยู่ (ภาษาไทย ครบถ้วน)

ตอบเป็น JSON format นี้เท่านั้น:
{"id_number": "เลข 13 หลัก", "prefix": "คำนำหน้า", "full_name": "ชื่อ นามสกุล", "address": "ที่อยู่เต็ม", "confidence": "high หรือ medium หรือ low"}

ถ้าอ่านไม่ได้หรือไม่ใช่บัตรประชาชน ให้ตอบ:
{"error": "ไม่สามารถอ่านข้อมูลได้"}`

export async function ocrIdCard(req: Request, res: Response) {
  try {
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ success: false, message: 'GEMINI_API_KEY not configured' })
    }

    // Rate limit check
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown'
    const rateCheck = checkRateLimit(clientIp)
    if (!rateCheck.allowed) {
      console.warn(`[OCR] Rate limited IP: ${clientIp}`)
      return res.status(429).json({
        success: false,
        message: `กรุณารอ ${rateCheck.retryAfterSec} วินาทีก่อนลองใหม่ (จำกัด ${OCR_RATE_LIMIT} ครั้ง/นาที)`,
      })
    }

    const file = req.file
    if (!file) {
      return res.status(400).json({ success: false, message: 'No image file provided' })
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)

    // Read image as base64 from buffer (memory storage)
    const base64Image = file.buffer.toString('base64')
    const mimeType = file.mimetype || 'image/jpeg'

    const contents = [
      { text: PROMPT },
      { inlineData: { mimeType, data: base64Image } },
    ]

    // Try each model in order — fallback on rate limit (429) errors
    let lastError: any = null
    for (const modelName of MODELS) {
      try {
        console.log(`[OCR] Trying model: ${modelName}`)
        const model = genAI.getGenerativeModel({ model: modelName })
        const result = await model.generateContent(contents)
        const responseText = result.response.text().trim()

        // Clean up markdown code blocks if Gemini returns them
        let jsonStr = responseText
        if (jsonStr.startsWith('```')) {
          jsonStr = jsonStr.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '')
        }

        let parsed: any
        try {
          parsed = JSON.parse(jsonStr)
        } catch {
          console.error(`[OCR] ${modelName} parse error. Raw:`, responseText)
          // This model responded but gave bad JSON — try next model
          lastError = new Error('ไม่สามารถแปลผลข้อมูลจาก AI ได้')
          continue
        }

        if (parsed.error) {
          return res.status(200).json({ success: false, message: parsed.error })
        }

        console.log(`[OCR] Success with model: ${modelName}`)
        return res.json({
          success: true,
          data: {
            id_number: (parsed.id_number || '').replace(/[\s\-]/g, ''),
            prefix: parsed.prefix || '',
            full_name: parsed.full_name || '',
            address: parsed.address || '',
            confidence: parsed.confidence || 'medium',
          },
        })
      } catch (modelError: any) {
        lastError = modelError
        const status = modelError?.status || modelError?.response?.status || 0
        const msg = modelError?.message || ''
        console.warn(`[OCR] ${modelName} failed (${status}): ${msg.slice(0, 150)}`)

        // Only retry with next model on rate limit (429) or server errors (5xx)
        if (status === 429 || status >= 500 || msg.includes('429') || msg.includes('quota')) {
          continue
        }
        // For other errors (auth, bad request), don't bother trying other models
        break
      }
    }

    // All models failed
    const errMsg = lastError?.message || 'Unknown error'
    const isQuota = errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('rate')
    return res.status(isQuota ? 429 : 500).json({
      success: false,
      message: isQuota
        ? 'API ถูกจำกัดการใช้งานชั่วคราว กรุณารอ 1 นาทีแล้วลองใหม่'
        : 'เกิดข้อผิดพลาดในการอ่านบัตร: ' + errMsg,
    })
  } catch (error: any) {
    console.error('OCR Error:', error)
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการอ่านบัตร: ' + (error.message || 'Unknown error'),
    })
  }
}
