
import api from './httpClient.ts'


export const applicationService = {
    // ดึงหลักสูตร
    getCurriculums: () => api.get('/applications/curriculums'),

    // ดึงสาขาตามหลักสูตร
    getDivisions: (cur_id?: number) =>
        api.get('/applications/divisions', { params: { cur_id } }),

    // ดึงค่าใช้จ่าย
    getExpenses: (cur_id?: number) =>
        api.get('/applications/expenses', { params: { cur_id } }),

    // ดึงแผนรับสมัคร
    getAdmissionPlan: (prev_level?: string, ap_years?: string) =>
        api.get('/applications/admission-plan', { params: { prev_level, ap_years } }),

    // OCR บัตรประชาชน (Gemini Vision)
    ocrIdCard: (file: File) => {
        const fd = new FormData()
        fd.append('image', file)
        return api.post('/applications/ocr-idcard', fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 30000,
        })
    },

    // ส่งใบสมัคร
    createApplication: (formData: FormData) =>
        api.post('/applications', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),

    // ตรวจสอบสถานะ
    checkStatus: (idCard: string) =>
        api.get(`/applications/check/${idCard}`),

    // ตรวจสอบซ้ำ idCard
    checkDuplicateIdCard: (idCard: string) =>
        api.post('/applications/check-duplicate', { id_card_number: idCard }),

    // สถิติ
    getStats: () => api.get('/applications/stats'),
}