# 📚 Backend Documentation
## ระบบรับสมัครนักเรียนนักศึกษา — วิทยาลัยเทคนิคเลย

---

## 🛠 Tech Stack

| เครื่องมือ | รายละเอียด |
|---|---|
| **Runtime** | Node.js (v20+) |
| **Framework** | Express.js |
| **Language** | TypeScript |
| **Database** | PostgreSQL (self-hosted) |
| **DB Client** | pg (node-postgres) |
| **Auth** | JWT (jsonwebtoken) + bcryptjs |
| **File Upload** | Multer |
| **Dev Tool** | ts-node + nodemon |

---

## 📁 โครงสร้างโฟลเดอร์

```
backend/
├── src/
│   ├── index.ts                  # Entry point — เริ่มต้น Express server
│   ├── config/
│   │   └── db.ts                 # PostgreSQL connection pool
│   ├── routes/
│   │   ├── auth.ts               # เส้นทาง /api/auth/*
│   │   ├── applications.ts       # เส้นทาง /api/applications/*
│   │   └── admin.ts              # เส้นทาง /api/admin/*
│   ├── controllers/
│   │   ├── authController.ts     # Logic สำหรับ login/register
│   │   ├── applicationController.ts  # Logic สำหรับใบสมัคร
│   │   └── adminController.ts    # Logic สำหรับเจ้าหน้าที่
│   ├── middleware/
│   │   ├── auth.ts               # ตรวจสอบ JWT token
│   │   └── upload.ts             # จัดการ file upload (Multer)
│   └── utils/
│       └── response.ts           # Helper สำหรับ HTTP response
├── .env                          # ตัวแปร environment (ไม่ commit ขึ้น git)
├── .env.example                  # ตัวอย่าง .env สำหรับทีม
├── package.json
├── tsconfig.json
└── BACKEND.md                    # ไฟล์นี้
```

---

## 📄 รายละเอียดแต่ละไฟล์

### `src/index.ts`
Entry point ของ server ทั้งหมด ทำหน้าที่:
- โหลด middleware (cors, helmet, morgan, express.json)
- ลงทะเบียน routes ทั้งหมด
- เปิด HTTP server บน PORT ที่กำหนดใน .env
- มี endpoint `/api/health` สำหรับเช็คสถานะ server และ database

---

### `src/config/db.ts`
ตั้งค่า PostgreSQL connection pool โดยใช้ `pg.Pool`
- อ่านค่าจาก `.env` (DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD)
- รองรับ SSL (กำหนดผ่าน `DB_SSL=true/false`)
- Pool size สูงสุด 10 connections

---

### `src/routes/`
ไฟล์ routes แต่ละไฟล์ทำหน้าที่ **รับ request และส่งต่อไปให้ controller** เท่านั้น

| ไฟล์ | Prefix | หน้าที่ |
|---|---|---|
| `auth.ts` | `/api/auth` | login, register, refresh token |
| `applications.ts` | `/api/applications` | สร้าง/อ่าน/อัพเดทใบสมัคร |
| `admin.ts` | `/api/admin` | จัดการข้อมูลสำหรับเจ้าหน้าที่ |

---

### `src/controllers/`
ไฟล์ controller แต่ละไฟล์มี **business logic** ของ feature นั้น ๆ

#### `authController.ts`
- `login` — ตรวจสอบ username/password แล้วคืน JWT token
- `register` — สร้าง account ใหม่ (เจ้าหน้าที่เท่านั้น)

#### `applicationController.ts`
- `createApplication` — บันทึกใบสมัครใหม่พร้อมไฟล์แนบ
- `getApplicationByIdCard` — ค้นหาใบสมัครด้วยเลขบัตรประชาชน
- `updateStatus` — อัพเดทสถานะใบสมัคร
- `getStats` — ดึงสถิติการรับสมัครแยกตามหลักสูตร/สาขา

#### `adminController.ts`
- `listApplications` — ดูรายการใบสมัครทั้งหมด (พร้อม filter/pagination)
- `approveApplication` — อนุมัติใบสมัคร
- `rejectApplication` — ปฏิเสธใบสมัคร

---

### `src/middleware/`

#### `auth.ts`
Middleware ตรวจสอบ JWT token ใน header `Authorization: Bearer <token>`
- ถ้า token ไม่ถูกต้อง → คืน 401 Unauthorized
- ถ้าผ่าน → แนบข้อมูล user ไปใน `req.user`

#### `upload.ts`
Middleware จัดการ file upload ผ่าน Multer
- รองรับ: `image/jpeg`, `image/png`, `application/pdf`
- ขนาดสูงสุด: 10MB ต่อไฟล์
- บันทึกไว้ใน folder `uploads/`

---

### `src/utils/response.ts`
Helper function สำหรับส่ง HTTP response แบบ consistent

```ts
// สำเร็จ
sendSuccess(res, data, 'message', 200)

// ผิดพลาด
sendError(res, 'error message', 400)
```

Response format มาตรฐาน:
```json
{
  "success": true,
  "message": "success",
  "data": { ... }
}
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | หน้าที่ | Auth |
|---|---|---|---|
| POST | `/api/auth/login` | เข้าสู่ระบบ | ❌ |

### Applications
| Method | Endpoint | หน้าที่ | Auth |
|---|---|---|---|
| POST | `/api/applications` | ส่งใบสมัครใหม่ | ❌ |
| GET | `/api/applications/check/:idCard` | ตรวจสอบสถานะด้วยเลขบัตร | ❌ |
| GET | `/api/applications/stats` | สถิติการรับสมัคร | ❌ |
| PATCH | `/api/applications/:id/status` | อัพเดทสถานะ | ✅ |

### Admin
| Method | Endpoint | หน้าที่ | Auth |
|---|---|---|---|
| GET | `/api/admin/applications` | รายการใบสมัครทั้งหมด | ✅ |
| PATCH | `/api/admin/applications/:id/approve` | อนุมัติใบสมัคร | ✅ |
| PATCH | `/api/admin/applications/:id/reject` | ปฏิเสธใบสมัคร | ✅ |

### System
| Method | Endpoint | หน้าที่ |
|---|---|---|
| GET | `/api/health` | เช็คสถานะ server + database |

---

## ⚙️ Environment Variables

สร้างไฟล์ `.env` ใน root ของ backend:

```env
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5173

# PostgreSQL
DB_HOST=IP_หรือ_DOMAIN_เซิร์ฟเวอร์
DB_PORT=5432
DB_NAME=loeitech_admission
DB_USER=postgres
DB_PASSWORD=รหัสผ่าน
DB_SSL=false

# JWT
JWT_SECRET=สุ่มตัวอักษรยาว_ๆ_ที่นี่
JWT_EXPIRES_IN=7d
```

> ⚠️ ไฟล์ `.env` ถูก ignore ใน git แล้ว **อย่า commit ขึ้น repository เด็ดขาด**

---

## 🚀 วิธีรัน

```bash
# ติดตั้ง dependencies
npm install

# รันแบบ development (auto-reload)
npm run dev

# build สำหรับ production
npm run build
npm start
```

เช็คสถานะ server:
```
GET http://localhost:3001/api/health
```

---

## 📊 Database Schema (ภาพรวม)

### ตาราง `applications`
เก็บข้อมูลใบสมัครทั้งหมด

| Column | Type | หน้าที่ |
|---|---|---|
| `id` | UUID | Primary key |
| `id_card` | VARCHAR(13) | เลขบัตรประชาชน |
| `prefix` | VARCHAR | คำนำหน้า |
| `full_name` | VARCHAR | ชื่อ-สกุล |
| `address` | TEXT | ที่อยู่ |
| `phone` | VARCHAR | เบอร์โทรศัพท์ |
| `email` | VARCHAR | อีเมล |
| `prev_school` | VARCHAR | สถานศึกษาเดิม |
| `prev_level` | VARCHAR | วุฒิการศึกษา (m3/m6/pvc) |
| `prev_year` | VARCHAR | ปีที่จบ |
| `gpa` | VARCHAR | เกรดเฉลี่ย |
| `course_type` | VARCHAR | หลักสูตร (pvc/pvs) |
| `branch_id` | INTEGER | สาขาวิชาที่เลือก |
| `status` | VARCHAR | สถานะ (pending_payment/paid/enrolled) |
| `total_price` | INTEGER | ยอดชำระ |
| `created_at` | TIMESTAMP | วันที่สมัคร |
| `updated_at` | TIMESTAMP | อัพเดทล่าสุด |

### ตาราง `documents`
เก็บไฟล์แนบของใบสมัคร

| Column | Type | หน้าที่ |
|---|---|---|
| `id` | UUID | Primary key |
| `application_id` | UUID | FK → applications.id |
| `doc_type` | VARCHAR | ประเภทเอกสาร |
| `file_path` | VARCHAR | path ไฟล์ที่บันทึก |
| `created_at` | TIMESTAMP | วันที่อัพโหลด |


### ตาราง `users` (เจ้าหน้าที่)

| Column | Type | หน้าที่ |
|---|---|---|
| `id` | UUID | Primary key |
| `username` | VARCHAR | ชื่อผู้ใช้ |
| `password_hash` | VARCHAR | รหัสผ่าน (bcrypt) |
| `role` | VARCHAR | admin / staff |
| `created_at` | TIMESTAMP | วันที่สร้าง |


