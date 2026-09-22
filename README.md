# 📚 LoeiTech Admission — ระบบรับสมัครนักเรียนนักศึกษา
วิทยาลัยเทคนิคเลย ปีการศึกษา 2569

## 🖥️ สถาปัตยกรรมระบบ (System Architecture)
โปรเจกต์นี้ใช้โครงสร้างแบบ Monorepo โดยแบ่งออกเป็น:
- **frontend**: Vite + Vue 3 + Tailwind CSS
- **backend**: Node.js + Express + PostgreSQL
- **php-ocr**: ระบบ OCR สำหรับอ่านข้อมูลจากบัตรประชาชน (PHP)

---

## 🚀 การใช้งานในเครื่อง (Local Development)

### 1. Backend
```bash
cd backend
npm install
npm run dev
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🛠️ การตั้งค่าระบบ CI/CD (Deployment Technical Guide)

### 1. โครงสร้าง Domain & Subdomain (Design)
เพื่อให้มีการแยกสภาพแวดล้อมที่ชัดเจน เราใช้ Subdomain ดังนี้:

| สภาพแวดล้อม | Web App (Frontend) | Backend API |
| :--- | :--- | :--- |
| **Production** | `admission.loeitech.ac.th` | `api-admission.loeitech.ac.th` |
| **Testing** | `test-admission.loeitech.ac.th` | `test-api-admission.loeitech.ac.th` |

### 2. การตั้งค่า GitHub Secrets
คุณต้องตั้งค่า Secrets ใน GitHub Repository ดังนี้:

- `SERVER_IP`: IP ของเซิร์ฟเวอร์
- `SERVER_USER`: User สำรับ SSH (เช่น `root` หรือ `deploy`)
- `SSH_PRIVATE_KEY`: Private Key สำหรับเชื่อมต่อ SSH (แนะนำ `ed25519`)
- `REGISTRY_URL`: `https://registry.loeitech.org/`
- `DOCKER_USERNAME`: Username ของ Private Registry
- `DOCKER_PASSWORD`: Password ของ Private Registry
- `DATABASE_URL_PROD` & `DATABASE_URL_TEST`: Connection strings แยกกันสำหรับแต่ละ Stack

### 3. วิธีสร้าง SSH Key
หากยังไม่มี SSH Key ให้รันคำสั่งนี้บนเครื่องคอมพิวเตอร์ของคุณ:
```bash
ssh-keygen -t ed25519 -C "loeitech-admission"
```
1. นำเนื้อหาในไฟล์ `.pub` ไปใส่ไว้ใน `/root/.ssh/authorized_keys` ของเซิร์ฟเวอร์
2. นำเนื้อหาในไฟล์ Private (ที่ไม่มีนามสกุล .pub) ไปใส่ใน GitHub Secrets ชื่อ `SSH_PRIVATE_KEY`

---

## 📦 Docker Stacks
เราแยก Stack ของ Test และ Production ออกจากกันโดยใช้ Docker Compose Project:
- **Test Stack**: `ltc-admission-test` (Port: 5174, 3002)
- **Prod Stack**: `ltc-admission-prod` (Port: 5173, 3001)

ใช้ `deploy.sh` ในการจัดการการอัปเดต Container อัตโนมัติฝ่าย CI/CD
