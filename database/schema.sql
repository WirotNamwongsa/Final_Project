-- ============================================================
-- DATABASE SCHEMA: ltc_admission_db
-- วิทยาลัยเทคนิคเลย — ระบบรับสมัครนักเรียนนักศึกษาออนไลน์
-- Last updated: 2026-04-08
-- Source of truth: extracted from production ltc_admission_db
-- ============================================================

-- Required extension for uuid_generate_v4()
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ============================================================
-- MASTER DATA TABLES
-- ============================================================

-- curriculums — หลักสูตร (ปวช. / ปวส.)
CREATE TABLE public.curriculums (
    cur_id        serial       NOT NULL,
    cur_name      varchar(200) NULL,
    cur_shortname varchar(50)  NULL,
    CONSTRAINT curriculums_pkey PRIMARY KEY (cur_id)
);

-- divisions — สาขาวิชา (FK → curriculums)
CREATE TABLE public.divisions (
    div_id   serial       NOT NULL,
    div_name varchar(100) NULL,
    cur_id   int4         NULL,
    CONSTRAINT divisions_pkey PRIMARY KEY (div_id),
    CONSTRAINT fk_cur_id FOREIGN KEY (cur_id) REFERENCES public.curriculums(cur_id)
);

-- admission_plan — จำนวนที่เปิดรับสมัครต่อปีการศึกษา (FK → curriculums, divisions)
-- plan_num = จำนวนที่นั่งที่เปิดรับ
-- ที่นั่งว่าง = plan_num - COUNT(applicants ที่เลือก ap_id นี้)
CREATE TABLE public.admission_plan (
    ap_id    serial4     NOT NULL,
    ap_years varchar(10) NULL,
    div_id   int4        NULL,
    cur_id   int4        NULL,
    plan_num int4        NULL,
    CONSTRAINT admission_plan_pkey PRIMARY KEY (ap_id),
    CONSTRAINT fk_cur_id FOREIGN KEY (cur_id) REFERENCES public.curriculums(cur_id),
    CONSTRAINT fk_div_id FOREIGN KEY (div_id) REFERENCES public.divisions(div_id)
);

-- expense_detail — รายการค่าใช้จ่ายต่อหลักสูตร (FK → curriculums)
-- payment_type: 'mandatory' | 'optional' | 'custom'
CREATE TABLE public.expense_detail (
    exp_id       serial       NOT NULL,
    exp_name     varchar(200) NULL,
    exp_detail   text         NOT NULL,
    exp_img      text         NULL,
    cur_id       int4         NULL,
    exp_cost     float8       NULL,
    payment_type varchar(20)  NULL,
    CONSTRAINT expense_detail_pkey PRIMARY KEY (exp_id),
    CONSTRAINT fk_cur_id FOREIGN KEY (cur_id) REFERENCES public.curriculums(cur_id)
);

-- users — เจ้าหน้าที่และผู้ดูแลระบบ
-- role: 'admin' | 'staff'
-- password_hash: bcrypt hash
CREATE TABLE public.users (
    id            uuid         DEFAULT gen_random_uuid() NOT NULL,
    username      varchar(100) NOT NULL,
    password_hash varchar(255) NOT NULL,
    role          varchar(10)  NOT NULL,
    created_at    timestamp    DEFAULT now() NULL,
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT users_username_key UNIQUE (username),
    CONSTRAINT users_role_check CHECK (role IN ('superadmin', 'admin', 'staff'))
);


-- ============================================================
-- TRANSACTION TABLES
-- ============================================================

-- applicants — ข้อมูลผู้สมัคร (ตารางหลัก)
-- status: 'pending_payment' → 'paid' → 'enrolled'
-- prev_level: 'm3' | 'm6' | 'pvc'
-- id_type: 'thai_id' | 'alien_id' | 'passport' | 'g_code' | 'other'
CREATE TABLE public.applicants (
    app_id         uuid         DEFAULT uuid_generate_v4() NOT NULL,
    id_card_number varchar(20)  NOT NULL,
    prefix         varchar(20)  NOT NULL,
    full_name      varchar(200) NOT NULL,
    address        text         NOT NULL,
    phone          varchar(15)  NOT NULL,
    email          varchar(200) NOT NULL,
    prev_school    varchar(200) NOT NULL,
    prev_level     varchar(10)  NOT NULL,
    prev_year      varchar(4)   NOT NULL,
    gpa            varchar(10)  NOT NULL,
    cur_id         int4         NOT NULL,
    div_id         int4         NOT NULL,
    ap_id          int4         NOT NULL,
    status         varchar(30)  NOT NULL DEFAULT 'pending_payment',
    created_at     timestamptz  DEFAULT now() NULL,
    updated_at     timestamptz  DEFAULT now() NULL,
    id_type        varchar(20)  NOT NULL DEFAULT 'thai_id',
    CONSTRAINT applicants_pkey PRIMARY KEY (app_id),
    CONSTRAINT applicants_id_card_number_key UNIQUE (id_card_number),
    CONSTRAINT fk_ap_id FOREIGN KEY (ap_id) REFERENCES public.admission_plan(ap_id),
    CONSTRAINT fk_cur_id FOREIGN KEY (cur_id) REFERENCES public.curriculums(cur_id),
    CONSTRAINT fk_div_id FOREIGN KEY (div_id) REFERENCES public.divisions(div_id)
);

-- documents — ไฟล์เอกสารแนบ (FK → applicants, CASCADE DELETE)
-- doc_type: 'id_front' | 'id_back' | 'certificate_front' | 'certificate_back'
--           'letter_front' | 'studentcard_front'
CREATE TABLE public.documents (
    doc_id      uuid         DEFAULT uuid_generate_v4() NOT NULL,
    app_id      uuid         NOT NULL,
    doc_type    varchar(50)  NOT NULL,
    file_path   text         NOT NULL,
    file_name   varchar(200) NOT NULL,
    file_size   int4         NULL,
    uploaded_at timestamp    DEFAULT now() NULL,
    CONSTRAINT documents_pkey PRIMARY KEY (doc_id),
    CONSTRAINT fk_app_id FOREIGN KEY (app_id)
        REFERENCES public.applicants(app_id) ON DELETE CASCADE
);

-- applicant_expenses — รายการค่าใช้จ่ายของผู้สมัคร (FK → applicants, expense_detail, CASCADE DELETE)
-- unit_price: ราคา ณ เวลาที่สมัคร (ป้องกันผลกระทบจากราคาที่เปลี่ยนในภายหลัง)
-- size: XS | S | M | L | XL | XXL (สำหรับรายการเครื่องแบบ)
CREATE TABLE public.applicant_expenses (
    ae_id       uuid    DEFAULT uuid_generate_v4() NOT NULL,
    app_id      uuid    NOT NULL,
    exp_id      int4    NOT NULL,
    quantity    int4    DEFAULT 1 NOT NULL,
    size        varchar(10) NULL,
    unit_price  float8  NOT NULL,
    total_price float8  NOT NULL,
    is_required bool    DEFAULT false NOT NULL,
    CONSTRAINT applicant_expenses_pkey PRIMARY KEY (ae_id),
    CONSTRAINT fk_app_id FOREIGN KEY (app_id)
        REFERENCES public.applicants(app_id) ON DELETE CASCADE,
    CONSTRAINT fk_exp_id FOREIGN KEY (exp_id)
        REFERENCES public.expense_detail(exp_id)
);

-- payments — การชำระเงิน (FK → applicants, CASCADE DELETE)
-- UNIQUE บน app_id: 1 ผู้สมัคร = 1 ใบชำระ
-- due_date = created_at + 3 วัน (ตั้งค่าโดย application logic)
CREATE TABLE public.payments (
    pay_id          uuid    DEFAULT uuid_generate_v4() NOT NULL,
    app_id          uuid    NOT NULL,
    total_amount    float8  NOT NULL,
    required_amount float8  NOT NULL,
    optional_amount float8  DEFAULT 0 NOT NULL,
    slip_path       text    NULL,
    slip_name       varchar(200) NULL,
    paid_at         timestamp NULL,
    due_date        timestamp NOT NULL,
    verified_at     timestamp NULL,
    verified_by     varchar(200) NULL,
    CONSTRAINT payments_pkey PRIMARY KEY (pay_id),
    CONSTRAINT payments_app_id_key UNIQUE (app_id),
    CONSTRAINT fk_app_id FOREIGN KEY (app_id)
        REFERENCES public.applicants(app_id) ON DELETE CASCADE
);

-- enrollments — การมอบตัว (FK → applicants, CASCADE DELETE)
-- UNIQUE บน app_id: 1 ผู้สมัคร = 1 การมอบตัว
-- ต้อง status = 'paid' ก่อนจึงจะมอบตัวได้
CREATE TABLE public.enrollments (
    enroll_id          uuid DEFAULT uuid_generate_v4() NOT NULL,
    app_id             uuid NOT NULL,
    tabien_self_path   text NULL,
    tabien_father_path text NULL,
    tabien_mother_path text NULL,
    enrolled_at        timestamp DEFAULT now() NULL,
    verified_at        timestamp NULL,
    verified_by        varchar(200) NULL,
    CONSTRAINT enrollments_pkey PRIMARY KEY (enroll_id),
    CONSTRAINT enrollments_app_id_key UNIQUE (app_id),
    CONSTRAINT fk_app_id FOREIGN KEY (app_id)
        REFERENCES public.applicants(app_id) ON DELETE CASCADE
);


-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- อัพเดท updated_at อัตโนมัติทุกครั้งที่ applicants ถูก UPDATE
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
;

CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.applicants
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();


-- ============================================================
-- STATUS FLOW
-- pending_payment → paid → enrolled
-- ============================================================
