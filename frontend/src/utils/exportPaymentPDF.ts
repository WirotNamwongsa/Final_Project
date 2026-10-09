import jsPDF from 'jspdf'

async function loadFont(): Promise<string> {
  const res = await fetch('/fonts/THSarabunNew.ttf')
  const buffer = await res.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  let binary = ''
  bytes.forEach(b => binary += String.fromCharCode(b))
  return btoa(binary)
}

export interface PaymentPDFData {
  prefix: string
  fullName: string
  idCard: string
  phone: string
  courseLabel: string
  branchName: string
  totalPrice: number
  dueDate?: string
  expenses?: any[]
}

export async function exportPaymentPDF(data: PaymentPDFData) {
  const fontBase64 = await loadFont()

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  doc.addFileToVFS('THSarabunNew.ttf', fontBase64)
  doc.addFont('THSarabunNew.ttf', 'THSarabun', 'normal')
  doc.addFileToVFS('THSarabunNew-Bold.ttf', fontBase64)
  doc.addFont('THSarabunNew-Bold.ttf', 'THSarabun', 'bold')

  let dueDateStr = data.dueDate || ''
  if (!dueDateStr) {
    const d = new Date()
    d.setDate(d.getDate() + 3)
    dueDateStr = d.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const W = 210
  const H = 297
  const ML = 15
  const MR = 15
  const CW = W - ML - MR  // 180mm
  let y = 12

  const text = (s: string, x: number, cy: number, opts?: any) => doc.text(s, x, cy, opts)
  const bold = () => doc.setFont('THSarabun', 'bold')
  const normal = () => doc.setFont('THSarabun', 'normal')
  const sz = (n: number) => doc.setFontSize(n)
  const black = () => doc.setTextColor(0, 0, 0)
  const white = () => doc.setTextColor(255, 255, 255)
  const setDraw = (r: number, g = r, b = r) => doc.setDrawColor(r, g, b)
  const setFill = (r: number, g = r, b = r) => doc.setFillColor(r, g, b)
  const lw = (n: number) => doc.setLineWidth(n)

  // ─── 1. HEADER ─────────────────────────────────────────────
  let logoLoaded = false
  try {
    const logoRes = await fetch('/src/assets/loeitech-logo.png')
    const buf = await logoRes.arrayBuffer()
    const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)))
    doc.addImage(b64, 'PNG', ML, y, 18, 18)
    logoLoaded = true
  } catch {}

  const hx = ML + (logoLoaded ? 22 : 0)
  sz(15); bold()
  text('วิทยาลัยเทคนิคเลย', hx, y + 6)
  sz(11); normal()
  text('สังกัดสำนักงานคณะกรรมการการอาชีวศึกษา', hx, y + 12)
  text('ถ.มลิวรรณ ต.กุดป่อง อ.เมือง จ.เลย 42000  โทร. 042-811-543', hx, y + 18)
  y += 22

  // เส้นคู่
  setDraw(0); lw(1.5); doc.line(ML, y, W - MR, y)
  lw(0.4); doc.line(ML, y + 2.5, W - MR, y + 2.5)
  y += 6

  // ชื่อเอกสาร
  sz(16); bold()
  text('ใบแจ้งชำระเงินค่าสมัครเข้าศึกษาต่อ', W / 2, y + 5.5, { align: 'center' })
  y += 8

  // เส้นคู่
  lw(0.4); doc.line(ML, y, W - MR, y)
  lw(1.5); doc.line(ML, y + 2.5, W - MR, y + 2.5)
  y += 7

  // ─── 2. INFO BOXES ──────────────────────────────────────────
  const boxH = 42
  const colW = CW / 2 - 2
  const col2X = ML + colW + 4

  setDraw(0); lw(0.5)
  doc.rect(ML, y, colW, boxH)
  setFill(40); doc.rect(ML, y, colW, 8, 'F')
  white(); sz(12); bold(); text('ข้อมูลผู้สมัคร', ML + 3, y + 5.5); black()

  doc.rect(col2X, y, colW, boxH)
  setFill(40); doc.rect(col2X, y, colW, 8, 'F')
  white(); text('ข้อมูลการชำระเงิน', col2X + 3, y + 5.5); black()

  let yL = y + 11
  let yR = y + 11
  const rowGap = 6.4
  sz(11)

  const leftRows: [string, string][] = [
    ['ชื่อ - สกุล', `${data.prefix || ''} ${data.fullName || ''}`.trim()],
    ['เลขประจำตัวประชาชน', data.idCard || '-'],
    ['เบอร์โทรศัพท์', data.phone || '-'],
    ['หลักสูตร', data.courseLabel || '-'],
    ['สาขาวิชา', data.branchName || '-'],
  ]
  leftRows.forEach(([lbl, val]) => {
    const labelText = `${lbl} :`
    const labelX = ML + 3
    bold(); text(labelText, labelX, yL)
    const valueX = labelX + doc.getTextWidth(labelText) + 2
    normal(); text(val, valueX, yL)
    yL += rowGap
  })

  const rightRows: [string, string][] = [
    ['ธนาคาร', 'กรุงไทย สาขาเลย'],
    ['เลขบัญชี', '403-0-87831-8'],
    ['ชื่อบัญชี', 'ร้านค้าสวัสดิการ วิทยาลัยเทคนิคเลย'],
    ['ยอดที่ต้องชำระ', `${data.totalPrice.toLocaleString()} บาท`],
  ]
  let rightValueX = col2X + 32
  rightRows.forEach(([lbl, val]) => {
    if (lbl) {
      const labelText = `${lbl} :`
      const labelX = col2X + 3
      bold(); text(labelText, labelX, yR)
      rightValueX = labelX + doc.getTextWidth(labelText) + 2
    }
    normal(); text(val, rightValueX, yR)
    yR += rowGap
  })

  y += boxH + 3

  // ─── 3. EXPENSE TABLE ───────────────────────────────────────
  if (data.expenses && data.expenses.length > 0) {
    const rowH = 5
    const cols = [10, 68, 20, 20, 30, 32]
    const colLabels = ['ลำดับ', 'รายการ', 'ขนาด', 'จำนวน', 'ราคา/หน่วย', 'รวม (บาท)']
    const colAligns: ('center' | 'left' | 'right')[] = ['center', 'left', 'center', 'center', 'right', 'right']

    setFill(40); doc.rect(ML, y, CW, 7, 'F')
    white(); sz(12); bold(); text('รายการค่าใช้จ่าย', ML + 3, y + 5); black()
    y += 7

    setFill(210); lw(0.5)
    doc.rect(ML, y, CW, rowH, 'FD')
    sz(10); bold()
    let cx = ML
    colLabels.forEach((lbl, i) => {
      const midX = cx + cols[i] / 2
      const rightX = cx + cols[i] - 2
      if (colAligns[i] === 'center') text(lbl, midX, y + 3.5, { align: 'center' })
      else if (colAligns[i] === 'right') text(lbl, rightX, y + 3.5, { align: 'right' })
      else text(lbl, cx + 2, y + 3.5)
      cx += cols[i]
    })
    y += rowH

    normal(); sz(10)
    data.expenses.forEach((exp, i) => {
      if (i % 2 === 0) { setFill(250); doc.rect(ML, y, CW, rowH, 'F') }
      setDraw(180); doc.rect(ML, y, CW, rowH)

      const unitPrice = exp.unit_price || 0
      const qty = exp.quantity || 0
      const total = exp.total_price != null ? Number(exp.total_price) : unitPrice * qty
      const name = (exp.exp_name || exp.item_name || `รายการ ${i + 1}`).substring(0, 35)
      const rowVals = [
        String(i + 1),
        name,
        exp.size || '-',
        String(qty),
        unitPrice.toLocaleString(),
        total.toLocaleString(),
      ]
      let cx2 = ML
      rowVals.forEach((val, j) => {
        const midX = cx2 + cols[j] / 2
        const rightX = cx2 + cols[j] - 2
        if (colAligns[j] === 'center') text(val, midX, y + 3.5, { align: 'center' })
        else if (colAligns[j] === 'right') text(val, rightX, y + 3.5, { align: 'right' })
        else text(val, cx2 + 2, y + 3.5)
        cx2 += cols[j]
      })
      y += rowH
    })

    setFill(40); setDraw(0); doc.rect(ML, y, CW, rowH, 'FD')
    white(); sz(11); bold()
    text('รวมทั้งสิ้น', ML + 3, y + 3.5)
    text(`${data.totalPrice.toLocaleString()} บาท`, W - MR - 2, y + 3.5, { align: 'right' })
    black()
    y += rowH + 3
  }

  // ─── 4. DEADLINE BOX ─────────────────────────────────────────
  setDraw(0); lw(0.6)
  doc.rect(ML, y, CW, 10)
  sz(12); bold()
  text(`กำหนดชำระเงิน  :  ภายในวันที่  ${dueDateStr}`, W / 2, y + 7, { align: 'center' })
  y += 14

  // ─── 5. ENROLLMENT STEPS ─────────────────────────────────────
  setFill(40); setDraw(40); lw(0); doc.rect(ML, y, CW, 7, 'F')
  white(); sz(12); bold()
  text('ขั้นตอนการแนบสลิปและยืนยันการมอบตัวผ่านระบบออนไลน์', ML + 3, y + 5)
  black(); lw(0.4); setDraw(180)

  const stepRows = [
    ['1.', 'โอนเงินตามยอดที่กำหนด ไปยังบัญชีธนาคารกรุงไทย เลขที่ 403-0-87831-8 ชื่อ ร้านค้าสวัสดิการ วิทยาลัยเทคนิคเลย'],
    ['2.', 'บันทึกภาพสลิปหลักฐานการโอนเงินไว้ในโทรศัพท์หรืออุปกรณ์ของท่าน'],
    ['3.', 'เปิดเว็บไซต์  admission.loeitech.ac.th  แล้วกดปุ่ม  "ยืนยันการมอบตัว"'],
    ['4.', 'กรอกเลขประจำตัวประชาชน  →  กด "ตรวจสอบผู้สมัคร"  →  กด "ดำเนินการต่อ"'],
    ['5.', 'อัปโหลดสำเนาทะเบียนบ้านของตนเอง บิดา และมารดา (ขั้นตอนที่ 1)'],
    ['6.', 'อัปโหลดสลิปการโอนเงิน (ขั้นตอนที่ 2) จากนั้นกด "ยืนยันการมอบตัว" เพื่อเสร็จสิ้น'],
  ]

  const stepLineH = 5.5
  const stepBoxH = 7 + stepRows.length * stepLineH + 4
  doc.rect(ML, y + 7, CW, stepBoxH - 7)
  y += 7

  sz(10)
  let sy = y + 5
  stepRows.forEach(([num, txt]) => {
    bold(); text(num, ML + 4, sy)
    normal(); text(txt, ML + 11, sy)
    sy += stepLineH
  })
  y += stepBoxH - 7 + 4

  // ─── 6. WARNING BOX ──────────────────────────────────────────
  setDraw(0); lw(0.5)
  doc.rect(ML, y, CW, 12)
  sz(11); bold()
  const warningLabel = 'คำเตือน :'
  const warningLabelX = ML + 3
  text(warningLabel, warningLabelX, y + 7.5)
  const warningText = 'การสมัครเรียนผ่านระบบออนไลน์ หากไม่ดำเนินการชำระเงินและยืนยันการมอบตัวผ่านระบบภายในกำหนด จะถูกตัดสิทธิ์อัตโนมัติ'
  const warningTextX = warningLabelX + doc.getTextWidth(warningLabel) + 2
  normal()
  let warningFontSize = 11
  sz(warningFontSize)
  const warningMaxWidth = W - MR - 3 - warningTextX
  while (doc.getTextWidth(warningText) > warningMaxWidth && warningFontSize > 8) {
    warningFontSize -= 0.25
    sz(warningFontSize)
  }
  text(warningText, warningTextX, y + 7.5)
  y += 16

  // ─── FOOTER ──────────────────────────────────────────────────
  lw(0.3); setDraw(150)
  doc.line(ML, H - 8, W - MR, H - 8)
  sz(9); normal(); doc.setTextColor(100)
  text(`พิมพ์เมื่อ: ${new Date().toLocaleString('th-TH')}`, W / 2, H - 4, { align: 'center' })

  doc.save(`ใบชำระเงิน-${data.idCard || 'unknown'}.pdf`)
}
