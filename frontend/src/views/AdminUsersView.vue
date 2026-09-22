<template>
  <div><!-- ✅ root wrapper -->

    <!-- Header -->
    <div class="bg-white shadow-lg border-b border-emerald-100">
      <div class="max-w-7xl mx-auto px-6 py-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-4xl font-bold text-gray-900 flex items-center">
              <div
                class="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                <User class="w-6 h-6 text-white" />
              </div>
              ข้อมูลผู้สมัคร
            </h1>
            <p class="text-gray-600 mt-3 text-lg">เลือกและดาวน์โหลดข้อมูลนักเรียนในรูปแบบไฟล์</p>
          </div>
          <div class="flex flex-col items-end space-y-3">
            <div class="flex items-center bg-emerald-50 px-4 py-2 rounded-lg">
              <div class="w-3 h-3 bg-emerald-500 rounded-full mr-2 animate-pulse"></div>
              <span class="text-emerald-700 font-medium">ระบบพร้อมใช้งาน</span>
            </div>
            <div class="flex items-center gap-2">
              <button v-for="item in exportItems" :key="item.type"
                @click="selectedExportType = selectedExportType === item.type ? '' : item.type; selectedIds = []; selectedStatus = ''"
                :class="[
                  'flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold border transition',
                  selectedExportType === item.type
                    ? 'bg-green-500 text-white border-green-500'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-green-400'
                ]">
                <component :is="item.icon" class="w-4 h-4" />
                {{ item.label }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="p-4 space-y-4">

      <!-- Export Controls Card -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">

        <!-- Row 1:  Export -->
        <div class="flex items-center justify-between flex-wrap gap-3">
          <div v-if="selectedExportType">
            <h1 class="text-xl font-bold text-gray-800">ส่งออกข้อมูล</h1>
            <p class="text-sm text-gray-400">วิทยาลัยเทคนิคเลย</p>
          </div>

          <div class="flex items-center gap-2 flex-wrap" :class="{ 'ml-auto': !selectedExportType }">
            <div v-if="selectedExportType" class="flex items-center gap-1.5 bg-green-50 px-3 py-1.5 rounded-lg">
              <div class="w-2 h-2 bg-green-500 rounded-full"></div>
              <span class="text-sm text-green-700 font-semibold">{{ selectedIds.length }} รายการ</span>
            </div>

            <button v-if="selectedExportType === 'students'" @click="exportPDF"
              :disabled="selectedIds.length === 0 || ocrProgress.running" class="group flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200
                     bg-gradient-to-r from-red-400 to-rose-500 text-white shadow-md shadow-red-200
                     hover:shadow-lg hover:shadow-red-300 hover:-translate-y-0.5
                     disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0">
              <Download class="w-4 h-4 group-hover:animate-bounce" />
              Export PDF
            </button>

            <button v-if="selectedExportType === 'students'" @click="exportSelected()"
              :disabled="selectedIds.length === 0 || ocrProgress.running" class="group flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200
                     bg-gradient-to-r from-emerald-400 to-green-500 text-white shadow-md shadow-green-200
                     hover:shadow-lg hover:shadow-green-300 hover:-translate-y-0.5
                     disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0">
              <Download class="w-4 h-4 group-hover:animate-bounce" />
              Export ที่เลือก
            </button>

            <button v-if="selectedExportType === 'students'" @click="exportAll()" :disabled="ocrProgress.running" class="group flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200
                     bg-gradient-to-r from-gray-600 to-gray-800 text-white shadow-md shadow-gray-300
                     hover:shadow-lg hover:shadow-gray-400 hover:-translate-y-0.5
                     disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0">
              <Download class="w-4 h-4 group-hover:animate-bounce" />
              Export ทั้งหมด
            </button>

            <button v-if="selectedExportType === 'payments'" @click="exportPaymentsListPDF()"
              :disabled="ocrProgress.running" class="group flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200
                     bg-gradient-to-r from-emerald-400 to-green-500 text-white shadow-md shadow-green-200
                     hover:shadow-lg hover:shadow-green-300 hover:-translate-y-0.5
                     disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0">
              <Download class="w-4 h-4 group-hover:animate-bounce" />
              Export รายชื่อผู้ชำระเงิน
            </button>

            <button v-if="selectedExportType === 'orders'" @click="exportOrdersListPDF()"
              :disabled="selectedIds.length === 0 || ocrProgress.running" class="group flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200
                     bg-gradient-to-r from-emerald-400 to-green-500 text-white shadow-md shadow-green-200
                     hover:shadow-lg hover:shadow-green-300 hover:-translate-y-0.5
                     disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0">
              <Download class="w-4 h-4 group-hover:animate-bounce" />
              Export สรุปยอดการสั่งซื้อ
            </button>

            <button v-if="selectedExportType === 'payments'" @click="exportPaymentsPDF()"
              :disabled="selectedIds.length === 0 || ocrProgress.running" class="group flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200
         bg-gradient-to-r from-gray-600 to-gray-800 text-white shadow-md shadow-gray-300
         hover:shadow-lg hover:shadow-gray-400 hover:-translate-y-0.5
         disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0">
              <Download class="w-4 h-4 group-hover:animate-bounce" />
              Export ใบแสดงการชำระเงิน
            </button>

            <button v-if="selectedExportType === 'orders'" @click="exportCombinedOrdersPDF()"
              :disabled="selectedIds.length === 0 || ocrProgress.running" class="group flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200
                     bg-gradient-to-r from-gray-600 to-gray-800 text-white shadow-md shadow-gray-300
                     hover:shadow-lg hover:shadow-gray-400 hover:-translate-y-0.5
                     disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0">
              <Download class="w-4 h-4 group-hover:animate-bounce" />
              Export ใบรายการ
            </button>
          </div>
        </div>

        <!-- Row 2: ประเภท -->
        <p v-if="selectedExportType" class="text-sm text-gray-500">เลือกประเภทข้อมูลและเลือกรายชื่อที่ต้องการส่งออก</p>

        <!-- Row 3: Filters -->
        <div class="flex flex-col sm:flex-row gap-2">
          <div class="relative flex-1">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input v-model="exportSearch" type="text" placeholder="ค้นหาชื่อ-สกุล..."
              class="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-green-400 focus:outline-none" />
          </div>
          <div class="relative">
            <select v-model="selectedCurFilter"
              class="pl-4 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-green-400 focus:outline-none bg-white appearance-none cursor-pointer min-w-[120px] text-gray-700">
              <option value="">ทุกหลักสูตร</option>
              <option value="ปวช">ปวช</option>
              <option value="ปวส">ปวส</option>
            </select>
            <ChevronDown
              class="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>
          <div class="relative">
            <Filter class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <select v-model="selectedBranch"
              class="pl-9 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-green-400 focus:outline-none bg-white appearance-none cursor-pointer min-w-[160px] text-gray-700">
              <option value="">ทุกสาขาวิชา</option>
              <option v-for="b in allBranches" :key="b" :value="b">{{ b }}</option>
            </select>
            <ChevronDown
              class="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>
          <div v-if="!selectedExportType || selectedExportType === 'students'" class="relative">
            <select v-model="selectedStatus"
              class="pl-4 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-green-400 focus:outline-none bg-white appearance-none cursor-pointer min-w-[140px] text-gray-700">
              <option value="">ทุกสถานะ</option>
              <option value="pending_payment">สมัครใหม่</option>
              <option value="pending_approve">รอตรวจสอบ</option>
              <option value="paid">พร้อมมอบตัว</option>
              <option value="enrolled">มอบตัวแล้ว</option>
            </select>
            <ChevronDown
              class="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>
          <div v-if="selectedExportType === 'students'" class="relative">
            <Calendar class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input v-model="studentDateSearch" type="text" placeholder="วัน/เดือน/ปี"
              class="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-green-400 focus:outline-none" />
          </div>
          <div v-if="selectedExportType === 'payments'" class="relative">
            <Calendar class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input v-model="paymentDateFilter" @input="formatDateInput" type="text" placeholder="วัน/เดือน/ปี"
              class="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-green-400 focus:outline-none" />
          </div>
          <div v-if="selectedExportType === 'orders'" class="relative">
            <Calendar class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input v-model="orderDateFilter" @input="formatDateInput" type="text" placeholder="วัน/เดือน/ปี"
              class="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-green-400 focus:outline-none" />
          </div>
        </div>

      </div>



      <!-- Badge filter -->
      <div
        v-if="selectedBranch || selectedCurFilter || selectedStatus || (selectedExportType === 'payments' && paymentDateFilter) || (selectedExportType === 'orders' && orderDateFilter)"
        class="flex items-center gap-2 flex-wrap">
        <span class="text-xs text-gray-400">กรองโดย:</span>
        <span v-if="selectedCurFilter"
          class="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-200">
          {{ selectedCurFilter }}
          <button @click="selectedCurFilter = ''" class="hover:text-blue-900">
            <X class="w-3 h-3" />
          </button>
        </span>
        <span v-if="selectedBranch"
          class="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-200">
          สาขา: {{ selectedBranch }}
          <button @click="selectedBranch = ''" class="hover:text-green-900">
            <X class="w-3 h-3" />
          </button>
        </span>
        <span v-if="selectedStatus"
          class="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded-full border border-purple-200">
          สถานะ: {{ getStatusLabel(selectedStatus) }}
          <button @click="selectedStatus = ''" class="hover:text-purple-900">
            <X class="w-3 h-3" />
          </button>
        </span>
        <span v-if="selectedExportType === 'payments' && paymentDateFilter"
          class="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-700 text-xs font-semibold rounded-full border border-orange-200">
          วันที่ชำระ : {{ paymentDateFilter }}
          <button @click="paymentDateFilter = ''" class="hover:text-orange-900">
            <X class="w-3 h-3" />
          </button>
        </span>
        <span v-if="selectedExportType === 'orders' && orderDateFilter"
          class="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full border border-indigo-200">
          วันที่ชำระ : {{ orderDateFilter }}
          <button @click="orderDateFilter = ''" class="hover:text-indigo-900">
            <X class="w-3 h-3" />
          </button>
        </span>
        <span class="text-xs text-gray-400">พบ {{ filteredExportData.length }} รายการ</span>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="text-center py-12 text-gray-400">
        <div class="inline-block w-6 h-6 border-2 border-green-400 border-t-transparent rounded-full animate-spin mb-2">
        </div>
        <p class="text-sm">กำลังโหลดข้อมูล...</p>
      </div>

      <div v-else-if="error" class="text-center py-12">
        <p class="text-red-400 text-sm">{{ error }}</p>
        <button @click="fetchApplicants" class="mt-2 text-sm text-green-600 underline">ลองใหม่</button>
      </div>

      <!-- Child Tables -->
      <template v-else>

        <!-- หน้าแรก: ตารางแบบ inline -->
        <div v-if="!selectedExportType" class="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 text-gray-500">
              <tr>

                <th class="px-4 py-3 text-left">ชื่อ-สกุล</th>
                <th class="px-4 py-3 text-left">หลักสูตร</th>
                <th class="px-4 py-3 text-left">สาขาวิชา</th>
                <th class="px-4 py-3 text-center">สถานะ</th>
                <th class="px-4 py-3 text-left">เบอร์โทร</th>
                <th class="px-4 py-3 text-center">หลักฐาน</th>
                <th class="px-4 py-3 text-center">ยืนยันสิทธ์</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-for="row in paginatedData" :key="row.ลำดับ"
                :class="['cursor-pointer hover:bg-gray-50', selectedIds.includes(row.ลำดับ) ? 'bg-green-50/50' : '']"
                @click="openInfoModal(row)">

                <td class="px-4 py-3 text-gray-800">{{ row.คำนำหน้า }}{{ row.ชื่อ_นามสกุล }}</td>
                <td class="px-4 py-3 text-gray-500">{{ row.หลักสูตร }}</td>
                <td class="px-4 py-3">
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                    {{ row.สาขาวิชา }}
                  </span>
                </td>
                <td class="px-4 py-3 text-center">
                  <span :class="[
                    'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold',
                    row.สถานะ === 'enrolled' ? 'bg-green-50 text-green-700 border border-green-200' :
                      row.สถานะ === 'paid' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        row.สถานะ === 'pending_approve' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                          'bg-gray-50 text-gray-500 border border-gray-200'
                  ]">
                    {{
                      row.สถานะ === 'enrolled' ? 'มอบตัวแล้ว' :
                        row.สถานะ === 'paid' ? 'พร้อมมอบตัว' :
                          row.สถานะ === 'pending_approve' ? 'รอตรวจสอบ' : 'สมัครใหม่'
                    }}
                  </span>
                </td>
                <td class="px-4 py-3 text-gray-600">{{ row.เบอร์โทร || '-' }}</td>
                <td class="px-4 py-3 text-center" @click.stop>
                  <button @click="openDocModal({ ...row, _showAll: true })"
                    class="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-semibold transition-colors">
                    <Eye class="w-3.5 h-3.5" />
                    ดูเอกสาร
                  </button>
                </td>
                <td class="px-4 py-3">
                  <template v-if="row.สถานะ === 'pending_approve'">
                    <button @click.stop="openInfoModal(row)"
                      class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-xs font-semibold transition-colors">
                      <User class="w-3 h-3" />
                      รายละเอียดการสมัคร
                    </button>
                  </template>
                  <button v-else-if="row.สถานะ === 'pending_payment'"
                    @click.stop="openInfoModal(row); setTimeout(() => openPaymentSlipOnly(), 500)"
                    class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-semibold transition-colors">
                    <FileText class="w-3 h-3" />
                    ใบแจ้งชำระเงิน
                  </button>
                  <button v-else-if="row.สถานะ === 'enrolled'"
                    @click.stop="openInfoModal(row); setTimeout(() => printEnrollmentCert(), 500)"
                    class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-semibold transition-colors">
                    <FileText class="w-3 h-3" />
                    เอกสารมอบตัว
                  </button>
                  <span v-else class="text-gray-400 text-xs">-</span>
                </td>
              </tr>
              <tr v-if="paginatedData.length === 0">
                <td colspan="7" class="px-4 py-8 text-center text-gray-400">ไม่พบข้อมูล</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- ประเภทอื่นๆ -->
        <StudentsTable v-else-if="selectedExportType === 'students'" :data="paginatedData" :selected-ids="selectedIds"
          @update:selected-ids="selectedIds = $event" @toggle-all="toggleAll" :is-all-selected="isAllSelected"
          @update:date-search="studentDateSearch = $event"
          @generate-pdf="handleGeneratePDF"
          @view-detail="openInfoModal"
          @view-documents="(row) => openDocModal({ ...row, _showAll: true })" />
        <PaymentsTable v-else-if="selectedExportType === 'payments'" :data="paginatedData" :selected-ids="selectedIds"
          @update:selected-ids="selectedIds = $event" @toggle-all="toggleAll" :is-all-selected="isAllSelected"
          @view-documents="(row) => openDocModal({ ...row, _showAll: true })"
          @generate-pdf="handleGeneratePDF" />
        <OrdersTable v-else-if="selectedExportType === 'orders'" :data="paginatedData" :selected-ids="selectedIds"
          @update:selected-ids="selectedIds = $event" @toggle-all="toggleAll" :is-all-selected="isAllSelected"
          @generate-pdf="handleGeneratePDF"
          @view-documents="(row) => openDocModal({ ...row, _showAll: true })" />

      </template>

      <!-- Pagination -->
      <div v-if="totalPages > 1"
        class="flex items-center justify-between bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-2">
        <p class="text-xs text-gray-400">
          แสดง
          <span class="font-semibold text-green-600">{{ (currentPage - 1) * pageSize + 1 }}</span>
          <span class="text-gray-300 mx-0.5">—</span>
          <span class="font-semibold text-green-600">{{ Math.min(currentPage * pageSize, filteredExportData.length)
            }}</span>
          จาก
          <span class="font-semibold text-gray-700">{{ filteredExportData.length }}</span> รายการ
        </p>
        <div class="flex items-center gap-1">
          <button @click="currentPage = 1" :disabled="currentPage === 1"
            class="w-8 h-8 flex items-center justify-center rounded-xl text-sm text-gray-400 hover:bg-green-50 hover:text-green-600 disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-150">«</button>
          <button @click="currentPage--" :disabled="currentPage === 1"
            class="w-8 h-8 flex items-center justify-center rounded-xl text-sm text-gray-400 hover:bg-green-50 hover:text-green-600 disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-150">‹</button>
          <template v-for="p in totalPages" :key="p">
            <button v-if="p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1)"
              @click="currentPage = p" :class="[
                'w-8 h-8 flex items-center justify-center rounded-xl text-sm font-semibold transition-all duration-150',
                currentPage === p
                  ? 'bg-green-500 text-white shadow-sm shadow-green-200'
                  : 'text-gray-500 hover:bg-green-50 hover:text-green-600'
              ]">{{ p }}</button>
            <span v-else-if="p === currentPage - 2 || p === currentPage + 2"
              class="w-6 text-center text-gray-300 text-xs select-none">···</span>
          </template>
          <button @click="currentPage++" :disabled="currentPage === totalPages"
            class="w-8 h-8 flex items-center justify-center rounded-xl text-sm text-gray-400 hover:bg-green-50 hover:text-green-600 disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-150">›</button>
          <button @click="currentPage = totalPages" :disabled="currentPage === totalPages"
            class="w-8 h-8 flex items-center justify-center rounded-xl text-sm text-gray-400 hover:bg-green-50 hover:text-green-600 disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-150">»</button>
        </div>
      </div>

      <!-- OCR Progress Modal -->
      <div v-if="ocrProgress.running" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div class="bg-white rounded-2xl shadow-xl p-6 w-80 space-y-4">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin flex-shrink-0">
            </div>
            <div>
              <p class="text-sm font-semibold text-gray-700">กำลังประมวลผล...</p>
              <p class="text-xs text-gray-400">{{ ocrProgress.name }}</p>
            </div>
          </div>
          <div class="w-full bg-gray-100 rounded-full h-2">
            <div class="bg-green-400 h-2 rounded-full transition-all duration-300"
              :style="{ width: `${(ocrProgress.current / ocrProgress.total) * 100}%` }"></div>
          </div>
          <p class="text-xs text-gray-400 text-right">{{ ocrProgress.current }} / {{ ocrProgress.total }}</p>
        </div>
      </div>

    </div><!-- ✅ ปิด div.p-4 -->
    <!-- Info Modal -->
    <Teleport to="body">
      <div v-if="infoModal.open"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        @click.self="infoModal.open = false">
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden flex flex-col"
          style="max-height: 92vh">

          <!-- ── Header ── -->
          <div :class="[
            'px-6 py-5 flex-shrink-0',
            infoModal.status === 'enrolled' ? 'bg-gradient-to-r from-emerald-500 to-teal-500' :
              infoModal.status === 'paid' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                infoModal.status === 'pending_approve' ? 'bg-gradient-to-r from-amber-500 to-orange-400' :
                  'bg-gradient-to-r from-gray-500 to-gray-600'
          ]">
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-4">
                <!-- Avatar -->
                <div
                  class="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
                  <User class="w-7 h-7 text-white" />
                </div>
                <div>
                  <p class="text-xs text-white/70 font-medium mb-0.5">ข้อมูลผู้สมัคร</p>
                  <p class="font-bold text-white text-xl leading-tight">{{ infoModal.name }}</p>
                  <!-- Status Badge -->
                  <span
                    class="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold">
                    <span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse inline-block"></span>
                    {{
                      infoModal.status === 'enrolled' ? 'มอบตัวแล้ว' :
                        infoModal.status === 'paid' ? 'พร้อมมอบตัว' :
                          infoModal.status === 'pending_approve' ? 'รอตรวจสอบ' : 'สมัครใหม่'
                    }}
                  </span>
                </div>
              </div>
              <button @click="infoModal.open = false"
                class="w-9 h-9 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition mt-1">
                <X class="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          <!-- ── Loading ── -->
          <div v-if="infoModal.loading" class="flex-1 flex items-center justify-center py-20">
            <div class="flex flex-col items-center gap-3 text-gray-400">
              <div class="w-10 h-10 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
              <p class="text-sm font-medium">กำลังโหลดข้อมูล...</p>
            </div>
          </div>

          <!-- ── Body ── -->
          <div v-else-if="infoModal.data" class="overflow-y-auto flex-1 p-5 space-y-3 bg-gray-50">

            <!-- Card 1: ข้อมูลส่วนตัว -->
            <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div class="flex items-center gap-2.5 px-4 py-3 border-b border-gray-100">
                <div class="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center flex-shrink-0">
                  <User class="w-4 h-4 text-white" />
                </div>
                <span class="text-sm font-bold text-gray-700">ข้อมูลส่วนตัว</span>
              </div>
              <div class="p-4 grid grid-cols-2 gap-x-6 gap-y-4">
                <!-- ชื่อ-สกุล full width -->
                <div class="col-span-2">
                  <p class="text-xs text-gray-400 mb-1">ชื่อ-สกุล</p>
                  <p class="text-base font-bold text-gray-800">{{ infoModal.data.prefix }}{{ infoModal.data.full_name }}
                  </p>
                </div>
                <div>
                  <p class="text-xs text-gray-400 mb-1">เลขบัตรประชาชน</p>
                  <p class="text-sm font-semibold text-gray-700 font-mono tracking-wide">
                    {{ infoModal.data.id_card_number || '-' }}
                  </p>
                </div>
                <div>
                  <p class="text-xs text-gray-400 mb-1">เบอร์โทร</p>
                  <p class="text-sm font-semibold text-gray-700">{{ infoModal.data.phone || '-' }}</p>
                </div>
                <div class="col-span-2">
                  <p class="text-xs text-gray-400 mb-1">อีเมล</p>
                  <p class="text-sm font-semibold text-gray-700">{{ infoModal.data.email || '-' }}</p>
                </div>
                <div class="col-span-2">
                  <p class="text-xs text-gray-400 mb-1">ที่อยู่</p>
                  <p class="text-sm font-semibold text-gray-700 leading-relaxed">{{ infoModal.data.address || '-' }}</p>
                </div>
              </div>
            </div>

            <!-- Card 2: หลักสูตร -->
            <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div class="flex items-center gap-2.5 px-4 py-3 border-b border-gray-100">
                <div class="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
                  <FileText class="w-4 h-4 text-white" />
                </div>
                <span class="text-sm font-bold text-gray-700">หลักสูตรที่สมัคร</span>
              </div>
              <div class="p-4 grid grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <p class="text-xs text-gray-400 mb-1">หลักสูตร</p>
                  <span
                    class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                    {{ infoModal.data.cur_name || '-' }}
                  </span>
                </div>
                <div>
                  <p class="text-xs text-gray-400 mb-1">สาขาวิชา</p>
                  <span
                    class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                    {{ infoModal.data.div_name || '-' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Card 3: ประวัติการศึกษา -->
            <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div class="flex items-center gap-2.5 px-4 py-3 border-b border-gray-100">
                <div class="w-7 h-7 rounded-lg bg-purple-500 flex items-center justify-center flex-shrink-0">
                  <BookCheck class="w-4 h-4 text-white" />
                </div>
                <span class="text-sm font-bold text-gray-700">ประวัติการศึกษา</span>
              </div>
              <div class="p-4 grid grid-cols-2 gap-x-6 gap-y-4">
                <div class="col-span-2">
                  <p class="text-xs text-gray-400 mb-1">สถานศึกษาเดิม</p>
                  <p class="text-sm font-semibold text-gray-700">{{ infoModal.data.prev_school || '-' }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-400 mb-1">วุฒิการศึกษา</p>
                  <p class="text-sm font-semibold text-gray-700">{{ prevLevelLabel(infoModal.data.prev_level) }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-400 mb-1">ปีที่จบ</p>
                  <p class="text-sm font-semibold text-gray-700">{{ infoModal.data.prev_year || '-' }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-400 mb-1">เกรดเฉลี่ย (GPA)</p>
                  <p class="text-2xl font-black text-gray-700">
                    {{ infoModal.data.gpa || '-' }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Card 4: การชำระเงิน -->
            <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div class="flex items-center gap-2.5 px-4 py-3 border-b border-gray-100">
                <div class="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center flex-shrink-0">
                  <CreditCard class="w-4 h-4 text-white" />
                </div>
                <span class="text-sm font-bold text-gray-700">การชำระเงิน</span>
              </div>
              <div class="p-4 grid grid-cols-2 gap-4">
                <div class="bg-orange-50 rounded-xl p-3 border border-orange-100">
                  <p class="text-xs text-gray-700 *:mb-1">ยอดที่ต้องชำระ</p>
                  <p class="text-xl font-black text-gray-700">
                    {{
                      infoModal.data.total_amount
                        ? Number(infoModal.data.total_amount).toLocaleString() + ' ฿'
                        : '-'
                    }}
                  </p>
                </div>
                <div :class="[
                  'rounded-xl p-3 border',
                  infoModal.data.paid_at
                    ? 'bg-emerald-50 border-emerald-100'
                    : 'bg-gray-50 border-gray-100'
                ]">
                  <p class="text-xs text-gray-700 mb-1">วันที่ชำระ</p>
                  <p :class="[
                    'text-sm font-bold',
                    infoModal.data.paid_at ? 'text-gray-700' : 'text-gray-400'
                  ]">
                    {{
                      infoModal.data.paid_at
                        ? new Date(infoModal.data.paid_at).toLocaleDateString('th-TH')
                        : 'ยังไม่ชำระ'
                    }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Card 5: รายการสั่งชุด -->
            <div v-if="infoModal.orders && infoModal.orders.length > 0"
              class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div class="flex items-center gap-2.5 px-4 py-3 border-b border-gray-100">
                <div class="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center flex-shrink-0">
                  <ShoppingBag class="w-4 h-4 text-white" />
                </div>
                <span class="text-sm font-bold text-gray-700">รายการสั่งชุด</span>
                <span class="ml-auto text-xs font-semibold text-indigo-500">{{ infoModal.orders.length }} รายการ</span>
              </div>
              <div class="p-4 space-y-2">
                <div v-for="item in infoModal.orders" :key="item.ae_id"
                  class="flex items-center gap-3 px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-100">
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold text-gray-800 truncate">{{ item.item_name }}</p>
                    <p class="text-xs text-gray-400 mt-0.5">
                      ไซส์ {{ item.size || '-' }} &times; {{ item.quantity }} ชิ้น
                      &times; {{ Number(item.unit_price).toLocaleString() }} บาท
                    </p>
                  </div>
                  <p class="text-sm font-bold text-indigo-600 flex-shrink-0 tabular-nums">
                    {{ Number(item.total_price).toLocaleString() }} ฿
                  </p>
                </div>
                <div class="flex items-center justify-between px-3 py-2.5 border-t border-dashed border-gray-200 mt-1">
                  <span class="text-sm font-bold text-gray-700">รวมทั้งหมด</span>
                  <span class="text-base font-black text-indigo-600 tabular-nums">
                    {{ infoModal.orders.reduce((s: number, i: any) => s + Number(i.total_price), 0).toLocaleString() }} ฿
                  </span>
                </div>
              </div>
            </div>

          </div>

          <!-- ── Footer ── -->
          <div class="flex items-center justify-between px-5 py-4 border-t border-gray-100 bg-white flex-shrink-0">
            <button @click="openDeleteDialog"
              class="inline-flex items-center gap-1.5 px-3 py-2 text-red-500 hover:bg-red-50 border border-red-200 hover:border-red-300 rounded-xl text-sm font-semibold transition">
              <Trash2 class="w-4 h-4" /> ลบข้อมูล
            </button>
            <div class="flex gap-2">
              <button @click="infoModal.open = false"
                class="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-xl transition font-semibold">
                ปิด
              </button>

              <button v-if="infoModal.status === 'pending_payment'" @click="openPaymentSlipOnly"
                class="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-semibold transition shadow-sm shadow-orange-200">
                <FileText class="w-4 h-4" /> ใบแจ้งชำระเงิน
              </button>

              <button v-else-if="infoModal.status === 'pending_approve'" @click="openDocModalFromInfo"
                class="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-semibold transition shadow-sm shadow-amber-200">
                <Eye class="w-4 h-4" /> รายละเอียดการสมัคร
              </button>

              <button v-else-if="infoModal.status === 'paid'" @click="openDocModalFromInfo"
                class="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-semibold transition shadow-sm shadow-blue-200">
                <Eye class="w-4 h-4" /> รายละเอียดการสมัคร
              </button>

              <template v-else-if="infoModal.status === 'enrolled'">
                <button @click="openDocModalFromInfo"
                  class="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-semibold transition shadow-sm shadow-blue-200">
                  <Eye class="w-4 h-4" /> ดูเอกสาร
                </button>
                <button @click="printEnrollmentCert"
                  class="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold transition shadow-sm shadow-emerald-200">
                  <BookCheck class="w-4 h-4" /> เอกสารมอบตัว
                </button>
              </template>
            </div>
          </div>

        </div>
      </div>
    </Teleport>


    <!-- Doc Modal -->
    <Teleport to="body">
      <div v-if="docModal.open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        @click.self="docModal.open = false">
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-3xl mx-4 overflow-hidden flex flex-col"
          style="max-height: 92vh">

          <!-- Header -->
          <div class="bg-gradient-to-r from-slate-700 to-slate-800 px-6 py-5 flex-shrink-0">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                  <FileText class="w-6 h-6 text-white" />
                </div>
                <div>
                  <p class="font-bold text-white text-lg">{{ docModal.name }}</p>
                  <span :class="[
                    'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mt-1',
                    docModal.status === 'enrolled' ? 'bg-emerald-500/30 text-emerald-200' :
                      docModal.status === 'paid' ? 'bg-blue-400/30 text-blue-200' :
                        docModal.status === 'pending_approve' ? 'bg-yellow-400/30 text-yellow-200' :
                          'bg-white/10 text-white/70'
                  ]">
                    <span class="w-1.5 h-1.5 rounded-full bg-current inline-block"></span>
                    {{
                      docModal.status === 'enrolled' ? 'มอบตัวแล้ว' :
                        docModal.status === 'paid' ? 'พร้อมมอบตัว' :
                          docModal.status === 'pending_approve' ? 'รอตรวจสอบ' : 'สมัครใหม่'
                    }}
                  </span>
                </div>
              </div>
              <button @click="docModal.open = false"
                class="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition">
                <X class="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          <!-- Body -->
          <div class="overflow-y-auto flex-1 p-5 space-y-4 bg-gray-50">

            <!-- ═══ สถานะสลิป ═══ -->
            <div v-if="docModal.slipApproved === true"
              class="flex items-center gap-4 bg-emerald-500 rounded-2xl p-4 shadow-sm shadow-emerald-200">
              <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div class="flex-1">
                <p class="text-sm font-bold text-white">ตรวจสอบสลิปผ่านแล้ว</p>
                <p class="text-xs text-emerald-100 mt-0.5">ยืนยันการชำระเงินเรียบร้อยแล้ว</p>
              </div>
              <div class="w-2.5 h-2.5 rounded-full bg-white animate-pulse flex-shrink-0"></div>
            </div>

            <div v-else-if="docModal.slipApproved === false"
              class="flex items-start gap-4 bg-red-50 border border-red-200 rounded-2xl p-4">
              <div class="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <p class="text-sm font-bold text-red-700">ตรวจสอบไม่ผ่าน</p>
                <p class="text-xs text-red-500 mt-0.5">{{ docModal.slipErrorMessage || 'กรุณาตรวจสอบสลิปด้วยตนเอง' }}
                </p>
              </div>
            </div>

            <div v-else class="flex items-center gap-4 bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
              <div class="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p class="text-sm text-gray-500 font-medium">ยังไม่มีข้อมูลการตรวจสอบสลิป</p>
            </div>

            <!-- ═══ รูปสลิป ═══ -->
            <div v-if="docModal.documents.find(d => d.doc_type === 'payment_slip')"
              class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div class="flex items-center gap-2 px-4 py-3 bg-orange-50 border-b border-orange-100">
                <div class="w-6 h-6 rounded-lg bg-orange-500 flex items-center justify-center">
                  <FileText class="w-3.5 h-3.5 text-white" />
                </div>
                <span class="text-sm font-bold text-orange-700">หลักฐานการชำระเงิน</span>
              </div>
              <div class="p-4 flex items-center justify-center bg-gray-50 min-h-48">
                <div v-if="docModal.imgLoading" class="flex flex-col items-center gap-2 text-gray-400">
                  <div class="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
                  <span class="text-xs">กำลังโหลด...</span>
                </div>
                <div v-else-if="docModal.imgError" class="text-gray-400 text-sm">โหลดรูปไม่สำเร็จ</div>
                <img v-else-if="slipBlobUrl" :src="slipBlobUrl"
                  class="max-w-full max-h-72 object-contain rounded-xl shadow-sm cursor-zoom-in"
                  @click="openLightbox(slipBlobUrl, 'หลักฐานการชำระเงิน')" />
              </div>
            </div>

            <!-- ═══ เอกสารมอบตัว (ทะเบียนบ้าน) ═══ -->
            <div
              v-if="docModal.documents.filter(d => !['id_front', 'id_back', 'edu_front', 'edu_back', 'letter_front', 'letter_back', 'payment_slip', 'certificate_front', 'certificate_back', 'studentcard_front', 'studentcard_back'].includes(d.doc_type)).length > 0"
              class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div class="flex items-center gap-2 px-4 py-3 bg-purple-50 border-b border-purple-100">
                <div class="w-6 h-6 rounded-lg bg-purple-500 flex items-center justify-center">
                  <BookCheck class="w-3.5 h-3.5 text-white" />
                </div>
                <span class="text-sm font-bold text-purple-700">เอกสารมอบตัว</span>
                <span class="ml-auto text-xs text-purple-400 font-medium">
                  {{docModal.documents.filter(d =>
                    !['id_front', 'id_back', 'edu_front', 'edu_back', 'letter_front', 'letter_back',
                      'payment_slip', 'certificate_front', 'certificate_back', 'studentcard_front', 'studentcard_back'].includes(d.doc_type)).length
                  }} ไฟล์
                </span>
              </div>
              <div class="p-4 grid grid-cols-2 gap-3">
                <div
                  v-for="doc in docModal.documents.filter(d => !['id_front', 'id_back', 'edu_front', 'edu_back', 'letter_front', 'letter_back', 'payment_slip', 'certificate_front', 'certificate_back', 'studentcard_front', 'studentcard_back'].includes(d.doc_type))"
                  :key="doc.doc_type"
                  class="rounded-xl overflow-hidden border border-gray-200 hover:border-emerald-300 transition group">
                  <div class="px-3 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                    <span class="text-xs font-semibold text-gray-600">
                      {{
                        doc.doc_type === 'self_house_front' ? 'ทะเบียนบ้านตนเอง (หน้าแรก)' :
                          doc.doc_type === 'self_house_back' ? 'ทะเบียนบ้านตนเอง (รายละเอียด)' :
                            doc.doc_type === 'father_house_front' ? 'ทะเบียนบ้านบิดา (หน้าแรก)' :
                              doc.doc_type === 'father_house_back' ? 'ทะเบียนบ้านบิดา (รายละเอียด)' :
                                doc.doc_type === 'mother_house_front' ? 'ทะเบียนบ้านมารดา (หน้าแรก)' :
                                  doc.doc_type === 'mother_house_back' ? 'ทะเบียนบ้านมารดา (รายละเอียด)' : doc.doc_type
                      }}
                    </span>
                    <div class="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                      <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <img :src="resolveUrl(doc.file_url)"
                    class="w-full h-36 object-cover group-hover:opacity-90 transition cursor-zoom-in"
                    @click="openLightbox(resolveUrl(doc.file_url), doc.doc_type)"
                    @error="(e) => (e.target as HTMLImageElement).src = ''" />
                </div>
              </div>
            </div>

            <!-- ═══ เอกสารการสมัคร (Tab) ═══ -->
            <div
              v-if="docModal.documents.filter(d => ['id_front', 'id_back', 'edu_front', 'edu_back', 'letter_front', 'letter_back'].includes(d.doc_type)).length > 0"
              class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div class="flex items-center gap-2 px-4 py-3 bg-blue-50 border-b border-blue-100">
                <div class="w-6 h-6 rounded-lg bg-blue-500 flex items-center justify-center">
                  <User class="w-3.5 h-3.5 text-white" />
                </div>
                <span class="text-sm font-bold text-blue-700">เอกสารการสมัคร</span>
              </div>

              <!-- Tabs -->
              <div class="flex gap-2 p-3 flex-wrap border-b border-gray-100 bg-gray-50">
                <button
                  v-for="doc in docModal.documents.filter(d => ['id_front', 'id_back', 'edu_front', 'edu_back', 'letter_front', 'certificate_front', 'certificate_back', 'studentcard_front', 'studentcard_back'].includes(d.doc_type))"
                  :key="doc.doc_type" @click="docModal.activeTab = doc.doc_type" :class="[
                    'px-3 py-1.5 rounded-lg text-xs font-semibold transition',
                    docModal.activeTab === doc.doc_type
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:text-blue-600'
                  ]">
                  {{
                    doc.doc_type === 'id_front' ? '🪪 บัตรประชาชน(หน้า)' :
                      doc.doc_type === 'id_back' ? '🪪 บัตรประชาชน(หลัง)' :
                        doc.doc_type === 'edu_front' ? '📄 วุฒิการศึกษา(หน้า)' :
                          doc.doc_type === 'edu_back' ? '📄 วุฒิการศึกษา(หลัง)' :
                            doc.doc_type === 'letter_front' ? '✉️ หนังสือรับรองการเป็นนักเรียน' :
                              doc.doc_type === 'certificate_front' ? '📄 วุฒิการศึกษา (หน้า)' :
                                doc.doc_type === 'certificate_back' ? '📄 วุฒิการศึกษา (หลัง)' :
                                  doc.doc_type === 'studentcard_front' ? '🪪 บัตรนักเรียน' :doc.doc_type
                  }}
                </button>
              </div>

              <!-- รูปภาพ -->
              <div class="p-4 flex items-center justify-center bg-gray-50 min-h-56">
                <div v-if="docModal.imgLoading" class="flex flex-col items-center gap-2 text-gray-400">
                  <div class="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                  <span class="text-xs">กำลังโหลด...</span>
                </div>
                <div v-else-if="docModal.imgError" class="text-gray-400 text-sm">โหลดรูปไม่สำเร็จ</div>
                <img v-else-if="blobUrl" :src="blobUrl"
                  class="max-w-full max-h-64 object-contain rounded-xl shadow-sm cursor-zoom-in"
                  @click="openLightbox(blobUrl, docModal.activeTab)" />
              </div>
            </div>

          </div>

          <!-- Footer -->
          <div class="flex items-center justify-between px-5 py-4 border-t border-gray-100 bg-white flex-shrink-0">
            <p class="text-xs text-gray-400 flex items-center gap-1.5">
              <FileText class="w-3.5 h-3.5" />
              เอกสารทั้งหมด {{ docModal.documents.length }} รายการ
            </p>
            <div class="flex gap-2">
              <button @click="docModal.open = false"
                class="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-xl transition font-semibold">
                ปิด
              </button>
              <button v-if="docModal.status === 'pending_approve'" @click="confirmEnrollmentDirect"
                class="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold transition shadow-sm shadow-emerald-200">
                <User class="w-4 h-4" /> ยืนยันการมอบตัว
              </button>
              <button v-if="docModal.status === 'pending_approve' || docModal.status === 'paid'"
                @click="downloadAsOrderPDF" :disabled="ocrProgress.running"
                class="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-semibold transition shadow-sm shadow-indigo-200 disabled:opacity-40 disabled:cursor-not-allowed">
                <Download class="w-4 h-4" /> ดาวน์โหลดเอกสาร
              </button>
              <button v-if="docModal.status === 'enrolled'" @click="printEnrollmentCert"
                class="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold transition shadow-sm shadow-emerald-200">
                <BookCheck class="w-4 h-4" /> เอกสารมอบตัว
              </button>
            </div>
          </div>

        </div>
      </div>
    </Teleport>
    <Teleport to="body">
      <div v-if="lightbox.open"
        class="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm"
        @click.self="lightbox.open = false">
        <div class="relative w-full max-w-4xl mx-4">

          <!-- ปุ่มปิด -->
          <button @click="lightbox.open = false"
            class="absolute -top-12 right-0 w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition">
            <X class="w-5 h-5 text-white" />
          </button>

          <!-- ชื่อเอกสาร -->
          <p v-if="lightbox.title" class="absolute -top-12 left-0 text-white/70 text-sm font-medium">
            {{
              lightbox.title === 'id_front' ? '🪪 บัตรประชาชน (หน้า)' :
                lightbox.title === 'id_back' ? '🪪 บัตรประชาชน (หลัง)' :
                  lightbox.title === 'edu_front' ? '📄 วุฒิการศึกษา (หน้า)' :
                    lightbox.title === 'edu_back' ? '📄 วุฒิการศึกษา (หลัง)' :
                      lightbox.title === 'letter_front' ? '✉️ จดหมาย (หน้า)' :
                        lightbox.title === 'letter_back' ? '✉️ จดหมาย (หลัง)' :
                          lightbox.title === 'certificate_front' ? '📄 วุฒิการศึกษา (หน้า)' :
                            lightbox.title === 'certificate_back' ? '📄 วุฒิการศึกษา (หลัง)' :
                              lightbox.title === 'studentcard_front' ? '🪪 บัตรนักเรียน (หน้า)' :
                                lightbox.title === 'studentcard_back' ? '🪪 บัตรนักเรียน (หลัง)' :
                              lightbox.title === 'self_house_front' ? '🏠 ทะเบียนบ้านตนเอง (หน้า)' :
                                lightbox.title === 'self_house_back' ? '🏠 ทะเบียนบ้านตนเอง (รายละเอียด)' :
                                  lightbox.title === 'father_house_front' ? '🏠 ทะเบียนบ้านบิดา (หน้า)' :
                                    lightbox.title === 'father_house_back' ? '🏠 ทะเบียนบ้านบิดา (รายละเอียด)' :
                                      lightbox.title === 'mother_house_front' ? '🏠 ทะเบียนบ้านมารดา (หน้า)' :
                                        lightbox.title === 'mother_house_back' ? '🏠 ทะเบียนบ้านมารดา (รายละเอียด)' :
            lightbox.title
            }}
          </p>

          <!-- รูป -->
          <img :src="lightbox.src" class="w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl" />

        </div>
      </div>
    </Teleport>

    <!-- Delete Confirmation Dialog -->
    <Teleport to="body">
      <div v-if="deleteDialog.open"
        class="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm"
        @click.self="closeDeleteDialog">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">

          <!-- Header -->
          <div class="bg-red-500 px-6 py-5">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <Trash2 class="w-5 h-5 text-white" />
              </div>
              <div>
                <p class="font-bold text-white text-base">ลบข้อมูลผู้สมัคร</p>
                <p class="text-red-100 text-xs mt-0.5">การกระทำนี้ไม่สามารถย้อนกลับได้</p>
              </div>
            </div>
          </div>

          <!-- Body -->
          <div class="p-6 space-y-4">
            <div class="bg-red-50 border border-red-200 rounded-xl p-4">
              <p class="text-sm text-red-700 font-semibold">{{ deleteDialog.name }}</p>
              <p class="text-xs text-red-500 mt-1">ข้อมูลทั้งหมดรวมถึงเอกสารและไฟล์ที่อัพโหลดจะถูกลบถาวร</p>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                พิมพ์ชื่อ-สกุล เพื่อยืนยัน
              </label>
              <p class="text-xs text-gray-400 mb-2">
                พิมพ์ว่า <span class="font-bold text-gray-600 select-none">{{ deleteDialog.name }}</span>
              </p>
              <input v-model="deleteDialog.confirmText" type="text"
                placeholder="พิมพ์ชื่อ-สกุลเพื่อยืนยัน"
                class="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none transition"
                :class="deleteDialog.confirmText === deleteDialog.name
                  ? 'border-red-400 focus:border-red-500 bg-red-50'
                  : 'border-gray-200 focus:border-gray-400'"
                @keydown.enter="deleteDialog.confirmText === deleteDialog.name && confirmDelete()" />
            </div>
          </div>

          <!-- Footer -->
          <div class="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
            <button @click="closeDeleteDialog"
              class="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-xl font-semibold transition">
              ยกเลิก
            </button>
            <button @click="confirmDelete"
              :disabled="deleteDialog.confirmText !== deleteDialog.name || deleteDialog.loading"
              class="inline-flex items-center gap-2 px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed">
              <span v-if="deleteDialog.loading"
                class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <Trash2 v-else class="w-4 h-4" />
              ลบข้อมูลถาวร
            </button>
          </div>

        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, h } from 'vue'
import { apiService } from '@/utils/api'

import {
  Download, CreditCard, ShoppingBag,
  Users, Search, Filter, ChevronDown, X, User, Eye, FileText, BookCheck, Calendar, Trash2,
} from 'lucide-vue-next'
import * as XLSX from 'xlsx'
import Tesseract from 'tesseract.js'
import jsPDF from 'jspdf'

import StudentsTable from '@/components/export/StudentsTable.vue'
import PaymentsTable from '@/components/export/PaymentsTable.vue'
import OrdersTable from '@/components/export/OrdersTable.vue'

import api from '@/services/httpClient'
import { exportPaymentPDF } from '@/utils/exportPaymentPDF'

// ─── InfoField inline component ──────────────────────────────
const InfoField = {
  props: ['label', 'value'],
  setup(props: any) {
    return () => h('div', [
      h('p', { class: 'text-xs text-gray-400 mb-0.5' }, props.label),
      h('p', { class: 'text-sm font-medium text-gray-800' }, props.value || '-'),
    ])
  }
}

const studentDateSearch = ref('')


// ─── Info Modal state ─────────────────────────────────────────
const infoModal = ref({
  open: false,
  name: '',
  status: '',
  appId: '' as any,
  loading: false,
  data: null as any,
  orders: [] as any[],
})

const deleteDialog = ref({
  open: false,
  appId: '',
  name: '',
  confirmText: '',
  loading: false,
})

const prevLevelLabel = (level: string | undefined) => {
  if (!level) return '-'
  const map: Record<string, string> = {
    'm3': 'ม.3',
    'm6': 'ม.6',
    'pvc': 'ปวช.',
    'ม.3': 'ม.3',
    'ม.6': 'ม.6',
    'มัธยมศึกษาปีที่ 3': 'ม.3',
    'มัธยมศึกษาปีที่ 6': 'ม.6',
    'ปวช.': 'ปวช.',
    'ประกาศนียบัตรวิชาชีพ': 'ปวช.',
    'ม.ต้น': 'ม.3',
    'ม.ปลาย': 'ม.6'
  }
  return map[level] || level
}

const openInfoModal = async (row: any) => {
  infoModal.value = {
    open: true,
    name: `${row.คำนำหน้า}${row.ชื่อ_นามสกุล}`,
    status: row.สถานะ,
    appId: row.ลำดับ,
    loading: true,
    data: null,
    orders: [],
  }
  try {
    const [appRes, ordersRes] = await Promise.allSettled([
      api.get(`/admin/applicants/detail/${row.เลขบัตรประชาชน}`),
      api.get(`/enrollments/orders/${row.เลขบัตรประชาชน}`),
    ])
    if (appRes.status === 'fulfilled') infoModal.value.data = appRes.value.data?.data
    if (ordersRes.status === 'fulfilled') infoModal.value.orders = ordersRes.value.data?.data ?? []
  } catch (e) {
    console.error('โหลดข้อมูลไม่สำเร็จ', e)
  } finally {
    infoModal.value.loading = false
  }
}

const API_BASE = (import.meta.env.VITE_API_URL as string)?.replace(/\/api$/, '') || 'http://localhost:13001'
const resolveUrl = (path: string | null | undefined) => {
  if (!path) return ''
  if (path.startsWith('http')) return path
  const token = localStorage.getItem('auth_token')
  const sep = path.includes('?') ? '&' : '?'
  return `${API_BASE}${path}${token ? `${sep}token=${encodeURIComponent(token)}` : ''}`
}

const exportItems = [
  { label: 'ประวัตินักเรียน', icon: Users, type: 'students' },
  { label: 'ค่าบำรุงการศึกษา', icon: CreditCard, type: 'payments' },
  { label: 'เครื่องแบบและอุปกรณ์', icon: ShoppingBag, type: 'orders' },
]

// ─── State ───────────────────────────────────────────────────
const applicants = ref<any[]>([])
const isLoading = ref(false)
const error = ref('')
const selectedExportType = ref('')
const exportSearch = ref('')
const selectedBranch = ref('')
const selectedCurFilter = ref('')
const selectedStatus = ref('')
const selectedIds = ref<string[]>([])
const currentPage = ref(1)
const pageSize = ref(20)
const paymentAmountFilter = ref('')
const paymentDateFilter = ref('')
const orderDateFilter = ref('')

const lightbox = ref({
  open: false,
  src: '',
  title: '',
})

const openLightbox = (src: string, title = '') => {
  lightbox.value = { open: true, src, title }
}

// ─── Enroll Student Function ────────────────────────────────
const enrollStudent = async (student: any) => {
  try {
    // ดึงข้อมูลเพิ่มเติมก่อน
    let fullStudentData = { ...student }
    try {
      const res = await api.get(`/admin/applicants/detail/${student.เลขบัตรประชาชน}`)
      const d = res.data?.data
      if (d) {
        fullStudentData = {
          ...student,
          ที่อยู่: d.address || '-',
          สถานศึกษาเดิม: d.prev_school || '-',
          วุฒิการศึกษา: d.prev_level || '-',
          ปีที่จบ: d.prev_year || '-',
          เกรดเฉลี่ย: d.gpa || '-',
          ยอดที่ต้องชำระ: d.total_amount || '-',
          วันที่ชำระ: d.paid_at
            ? new Date(d.paid_at).toLocaleDateString('th-TH')
            : 'ยังไม่ชำระ',
        }
      }
    } catch (e) {
      console.warn('โหลดข้อมูลเพิ่มเติมไม่สำเร็จ', e)
    }

    // ส่ง fullStudentData แทน student
    const confirmed = await showConfirmDialog('ยืนยันการมอบตัว', fullStudentData)

    if (!confirmed) return

    isLoading.value = true
    await api.post(`/applications/enroll`, { idCard: student.เลขบัตรประชาชน })

    const index = applicants.value.findIndex(app => app.app_id === student.ลำดับ)
    if (index !== -1) {
      applicants.value[index].status = 'enrolled'
    }

    await fetchApplicants()

  } catch (err) {
    console.error('มอบตัวไม่สำเร็จ:', err)
    showErrorDialog('มอบตัวไม่สำเร็จ กรุณาลองใหม่')
  } finally {
    isLoading.value = false
  }
}

// ─── Direct Confirm Enrollment Function ────────────────────────────────
const confirmEnrollmentDirect = async () => {
  try {
    isLoading.value = true

    // ใช้ข้อมูลจาก infoModal แทน docModal เนื่องจาก docModal ไม่มีฟิลด์ data
    const studentData = docModal.value.enrolledData || infoModal.value.data
    if (!studentData) {
      showErrorDialog('ไม่พบข้อมูลผู้สมัคร กรุณาปิดแล้วลองใหม่')
      return
    }

    await api.post(`/enrollments/confirm`, { idCard: studentData.id_card_number })

    const index = applicants.value.findIndex(app => app.app_id === infoModal.value.appId)
    if (index !== -1) {
      applicants.value[index].status = 'enrolled'
    }

    // อัพเดทสถานะใน modal ทั้ง infoModal และ docModal
    infoModal.value.status = 'enrolled'
    docModal.value.status = 'enrolled'

    await fetchApplicants()

    // ปิดทั้งสอง modal กลับไปหน้าเดิม
    infoModal.value.open = false
    docModal.value.open = false

  } catch (err) {
    console.error('มอบตัวไม่สำเร็จ:', err)
    showErrorDialog('มอบตัวไม่สำเร็จ กรุณาลองใหม่')
  } finally {
    isLoading.value = false
  }
}

// ─── Custom Dialog Functions ────────────────────────────────
const showConfirmDialog = (title: string, student: any): Promise<boolean> => {
  return new Promise((resolve) => {
    // สร้าง overlay
    const overlay = document.createElement('div')
    overlay.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/60'

    // สร้าง dialog container
    const dialog = document.createElement('div')
    dialog.className = 'bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto'

    dialog.innerHTML = `
      <div class="space-y-6">
        <!-- Header -->
        <div class="text-center space-y-4">
          <div class="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mx-auto">
            <svg class="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div>
            <h3 class="text-xl font-bold text-gray-900">${title}</h3>
            <p class="text-sm text-gray-600 mt-2">กรุณาตรวจสอบข้อมูลก่อนยืนยันการมอบตัว</p>
          </div>
        </div>

        <!-- Student Info -->
        <div class="space-y-4">
          <!-- ข้อมูลส่วนตัว -->
          <div class="bg-gray-50 rounded-xl p-6">
            <h4 class="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
              <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              ข้อมูลส่วนตัว
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">ชื่อ-สกุล</p>
                <p class="text-sm font-medium text-gray-900">${student.คำนำหน้า}${student.ชื่อ_นามสกุล}</p>
              </div>
              <div>
                <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">เลขบัตรประชาชน</p>
                <p class="text-sm font-medium text-gray-900">${student.เลขบัตรประชาชน}</p>
              </div>
              <div>
                <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">เบอร์โทร</p>
                <p class="text-sm font-medium text-gray-900">${student.เบอร์โทร || '-'}</p>
              </div>
              <div>
                <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">อีเมล</p>
                <p class="text-sm font-medium text-gray-900">${student.อีเมล || '-'}</p>
              </div>
              <div class="md:col-span-2">
                <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">ที่อยู่</p>
                <p class="text-sm font-medium text-gray-900">${student.ที่อยู่ || '-'}</p>
              </div>
            </div>
          </div>

          <!-- หลักสูตรที่สมัคร -->
          <div class="bg-blue-50 rounded-xl p-6">
            <h4 class="text-sm font-bold text-blue-700 mb-4 flex items-center gap-2">
              <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              หลักสูตรที่สมัคร
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p class="text-xs font-semibold text-blue-400 uppercase tracking-wide mb-1">หลักสูตร</p>
                <p class="text-sm font-medium text-gray-900">${student.หลักสูตร}</p>
              </div>
              <div>
                <p class="text-xs font-semibold text-blue-400 uppercase tracking-wide mb-1">สาขาวิชา</p>
                <p class="text-sm font-medium text-gray-900">${student.สาขาวิชา}</p>
              </div>
            </div>
          </div>

          <!-- ประวัติการศึกษา -->
          <div class="bg-purple-50 rounded-xl p-6">
            <h4 class="text-sm font-bold text-purple-700 mb-4 flex items-center gap-2">
              <svg class="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              ประวัติการศึกษา
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p class="text-xs font-semibold text-purple-400 uppercase tracking-wide mb-1">สถานศึกษาเดิม</p>
                <p class="text-sm font-medium text-gray-900">${student.สถานศึกษาเดิม || '-'}</p>
              </div>
              <div>
                <p class="text-xs font-semibold text-purple-400 uppercase tracking-wide mb-1">วุฒิการศึกษา</p>
                <p class="text-sm font-medium text-gray-900">${prevLevelLabel(student.วุฒิการศึกษา)}</p>
              </div>
              <div>
                <p class="text-xs font-semibold text-purple-400 uppercase tracking-wide mb-1">ปีที่จบ</p>
                <p class="text-sm font-medium text-gray-900">${student.ปีที่จบ || '-'}</p>
              </div>
              <div>
                <p class="text-xs font-semibold text-purple-400 uppercase tracking-wide mb-1">เกรดเฉลี่ย (GPA)</p>
                <p class="text-sm font-medium text-gray-900">${student.เกรดเฉลี่ย || '-'}</p>
              </div>
            </div>
          </div>

          <!-- การชำระเงิน -->
          <div class="bg-green-50 rounded-xl p-6">
            <h4 class="text-sm font-bold text-green-700 mb-4 flex items-center gap-2">
              <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              การชำระเงิน
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p class="text-xs font-semibold text-green-400 uppercase tracking-wide mb-1">ยอดที่ต้องชำระ</p>
                <p class="text-sm font-medium text-gray-900">${student.ยอดที่ต้องชำระ ? `${Number(student.ยอดที่ต้องชำระ).toLocaleString()} บาท` : '-'}</p>
              </div>
              <div>
                <p class="text-xs font-semibold text-green-400 uppercase tracking-wide mb-1">วันที่ชำระ</p>
                <p class="text-sm font-medium text-gray-900">${student.วันที่ชำระ || 'ยังไม่ชำระ'}</p>
              </div>
            </div>
          </div>

          <!-- สถานะปัจจุบัน -->
          <div class="bg-yellow-50 rounded-xl p-4">
            <div class="flex items-center justify-between">
              <span class="text-sm font-semibold text-yellow-700">สถานะปัจจุบัน</span>
              <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-200">
                รอตรวจสอบ
              </span>
            </div>
          </div>
        </div>

        <!-- Warning Message -->
        <div class="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div class="flex items-start gap-3">
            <div class="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg class="w-3 h-3 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <p class="text-sm font-semibold text-amber-800">การดำเนินการนี้ไม่สามารถย้อนกลับได้</p>
              <p class="text-xs text-amber-600 mt-1">เมื่อยืนยันการมอบตัวแล้ว สถานะของนักเรียนจะเปลี่ยนเป็น "มอบตัวแล้ว" ทันที</p>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-3 justify-center">
          <button id="cancel-btn" class="px-6 py-3 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
            ยกเลิก
          </button>
          <button id="confirm-btn" class="px-6 py-3 text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-xl transition-colors flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            ยืนยันการมอบตัว
          </button>
        </div>
      </div>
    `

    overlay.appendChild(dialog)
    document.body.appendChild(overlay)

    // Event listeners
    const cancelBtn = dialog.querySelector('#cancel-btn')
    const confirmBtn = dialog.querySelector('#confirm-btn')

    const cleanup = () => {
      document.body.removeChild(overlay)
    }

    cancelBtn?.addEventListener('click', () => {
      cleanup()
      resolve(false)
    })

    confirmBtn?.addEventListener('click', () => {
      cleanup()
      resolve(true)
    })

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        cleanup()
        resolve(false)
      }
    })
  })
}

const downloadAsOrderPDF = async () => {
  const row = currentData.value.find(r => r.ลำดับ === docModal.value.appId)
  if (!row) {
    showErrorDialog('ไม่พบข้อมูลผู้สมัคร')
    return
  }

  ocrProgress.value = {
    running: true,
    current: 1,
    total: 1,
    name: `${row.คำนำหน้า || ''}${row.ชื่อ_นามสกุล || ''}`
  }

  try {
    await generateOrderPageOnlyPDF(row)  // ← ฟังก์ชันใหม่ หน้าเดียว
  } catch (err) {
    console.error('error:', err)
    showErrorDialog('สร้าง PDF ไม่สำเร็จ')
  } finally {
    ocrProgress.value.running = false
  }
}

const showSuccessDialog = (message: string, student?: any) => {
  const overlay = document.createElement('div')
  overlay.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/60'

  const dialog = document.createElement('div')
  dialog.className = 'bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto'

  const currentDate = new Date().toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  dialog.innerHTML = `
    <div class="space-y-6">
      <!-- Header -->
      <div class="text-center space-y-4">
        <div class="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
          <svg class="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h3 class="text-2xl font-bold text-gray-900">การมอบตัวสำเร็จแล้ว!</h3>
          <p class="text-sm text-gray-600 mt-2">${message}</p>
        </div>
      </div>

      ${student ? `
      <!-- Student Info Card -->
      <div class="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h4 class="text-xl font-bold text-gray-900">ข้อมูลนักเรียน</h4>
            <p class="text-sm text-gray-600">มอบตัวเมื่อ ${currentDate}</p>
          </div>
        </div>
        
        <div class="space-y-4">
          <!-- ข้อมูลส่วนตัว -->
          <div class="bg-white rounded-lg p-4">
            <h5 class="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              ข้อมูลส่วนตัว
            </h5>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">ชื่อ-สกุล</p>
                <p class="text-sm font-medium text-gray-900">${student.คำนำหน้า}${student.ชื่อ_นามสกุล}</p>
              </div>
              <div>
                <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">เลขบัตรประชาชน</p>
                <p class="text-sm font-medium text-gray-900">${student.เลขบัตรประชาชน}</p>
              </div>
              <div>
                <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">เบอร์โทร</p>
                <p class="text-sm font-medium text-gray-900">${student.เบอร์โทร || '-'}</p>
              </div>
              <div>
                <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">อีเมล</p>
                <p class="text-sm font-medium text-gray-900">${student.อีเมล || '-'}</p>
              </div>
              <div class="md:col-span-2">
                <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">ที่อยู่</p>
                <p class="text-sm font-medium text-gray-900">${student.ที่อยู่ || '-'}</p>
              </div>
            </div>
          </div>

          <!-- หลักสูตรที่สมัคร -->
          <div class="bg-white rounded-lg p-4">
            <h5 class="text-sm font-bold text-blue-700 mb-3 flex items-center gap-2">
              <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              หลักสูตรที่สมัคร
            </h5>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <p class="text-xs font-semibold text-blue-400 uppercase tracking-wide mb-1">หลักสูตร</p>
                <p class="text-sm font-medium text-gray-900">${student.หลักสูตร}</p>
              </div>
              <div>
                <p class="text-xs font-semibold text-blue-400 uppercase tracking-wide mb-1">สาขาวิชา</p>
                <p class="text-sm font-medium text-gray-900">${student.สาขาวิชา}</p>
              </div>
            </div>
          </div>

          <!-- ประวัติการศึกษา -->
          <div class="bg-white rounded-lg p-4">
            <h5 class="text-sm font-bold text-purple-700 mb-3 flex items-center gap-2">
              <svg class="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              ประวัติการศึกษา
            </h5>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <p class="text-xs font-semibold text-purple-400 uppercase tracking-wide mb-1">สถานศึกษาเดิม</p>
                <p class="text-sm font-medium text-gray-900">${student.สถานศึกษาเดิม || '-'}</p>
              </div>
              <div>
                <p class="text-xs font-semibold text-purple-400 uppercase tracking-wide mb-1">วุฒิการศึกษา</p>
                <p class="text-sm font-medium text-gray-900">${prevLevelLabel(student.วุฒิการศึกษา)}</p>
              </div>
              <div>
                <p class="text-xs font-semibold text-purple-400 uppercase tracking-wide mb-1">ปีที่จบ</p>
                <p class="text-sm font-medium text-gray-900">${student.ปีที่จบ || '-'}</p>
              </div>
              <div>
                <p class="text-xs font-semibold text-purple-400 uppercase tracking-wide mb-1">เกรดเฉลี่ย (GPA)</p>
                <p class="text-sm font-medium text-gray-900">${student.เกรดเฉลี่ย || '-'}</p>
              </div>
            </div>
          </div>

          <!-- การชำระเงิน -->
          <div class="bg-white rounded-lg p-4">
            <h5 class="text-sm font-bold text-green-700 mb-3 flex items-center gap-2">
              <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              การชำระเงิน
            </h5>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <p class="text-xs font-semibold text-green-400 uppercase tracking-wide mb-1">ยอดที่ต้องชำระ</p>
                <p class="text-sm font-medium text-gray-900">${student.ยอดที่ต้องชำระ ? `${Number(student.ยอดที่ต้องชำระ).toLocaleString()} บาท` : '-'}</p>
              </div>
              <div>
                <p class="text-xs font-semibold text-green-400 uppercase tracking-wide mb-1">วันที่ชำระ</p>
                <p class="text-sm font-medium text-gray-900">${student.วันที่ชำระ || 'ยังไม่ชำระ'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Success Status -->
      <div class="bg-green-50 border border-green-200 rounded-xl p-4">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p class="text-sm font-semibold text-green-800">สถานะ: มอบตัวแล้ว</p>
            <p class="text-xs text-green-600 mt-1">นักเรียนได้รับการยืนยันสิทธิ์เรียนเรียบร้อยแล้ว</p>
          </div>
        </div>
      </div>

      <!-- Next Steps -->
      <div class="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div class="flex items-start gap-3">
          <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p class="text-sm font-semibold text-blue-800">ขั้นตอนถัดไป</p>
            <ul class="text-xs text-blue-600 mt-1 space-y-1">
              <li>• พิมพ์เอกสารมอบตัวได้ที่ปุ่ม "เอกสารมอบตัว"</li>
              <li>• นักเรียนสามารถเข้าเรียนได้ในวันเปิดภาคเรียน</li>
              <li>• ติดต่อฝ่ายวิชาการหากต้องการข้อมูลเพิ่มเติม</li>
            </ul>
          </div>
        </div>
      </div>
      ` : ''}

      <!-- Action Button -->
      <div class="text-center">
        <button id="close-btn" class="px-8 py-3 text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-xl transition-colors inline-flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          ตกลง
        </button>
      </div>
    </div>
  `

  overlay.appendChild(dialog)
  document.body.appendChild(overlay)

  const closeBtn = dialog.querySelector('#close-btn')

  const cleanup = () => {
    document.body.removeChild(overlay)
  }

  closeBtn?.addEventListener('click', cleanup)
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      cleanup()
    }
  })
}

const showErrorDialog = (message: string) => {
  const overlay = document.createElement('div')
  overlay.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/60'

  const dialog = document.createElement('div')
  dialog.className = 'bg-white rounded-2xl shadow-2xl p-6 w-96 mx-4'

  dialog.innerHTML = `
    <div class="text-center space-y-4">
      <div class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto">
        <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <div>
        <h3 class="text-lg font-semibold text-gray-900">ผิดพลาด</h3>
        <p class="text-sm text-gray-600 mt-2">${message}</p>
      </div>
      <button id="close-btn" class="px-4 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors">
        ตกลง
      </button>
    </div>
  `

  overlay.appendChild(dialog)
  document.body.appendChild(overlay)

  const closeBtn = dialog.querySelector('#close-btn')

  const cleanup = () => {
    document.body.removeChild(overlay)
  }

  closeBtn?.addEventListener('click', cleanup)
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      cleanup()
    }
  })
}

const ocrProgress = ref({
  running: false,
  current: 0,
  total: 0,
  name: '',
})

// ─── Fetch ───────────────────────────────────────────────────
const fetchApplicants = async () => {
  isLoading.value = true
  error.value = ''
  try {
    const res = await apiService.getApplicants()
    if (!res.success) throw new Error(res.message)
    // ใช้ JSON.parse เพื่อให้ Vue รู้จักการเปลี่ยนแปร
    applicants.value = JSON.parse(JSON.stringify(res.data))
  } catch (e: any) {
    error.value = e.message || 'โหลดข้อมูลไม่สำเร็จ'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => fetchApplicants())


// ✅ ฟังก์ชันใหม่สำหรับปุ่ม payments
const exportPaymentsListPDF = async () => {
  const fontBase64 = await loadThaiFont()
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  if (fontBase64) {
    doc.addFileToVFS('THSarabunNew.ttf', fontBase64)
    doc.addFont('THSarabunNew.ttf', 'THSarabun', 'normal')
    doc.addFont('THSarabunNew.ttf', 'THSarabun', 'bold')
  }

  const pageW = 210
  const L = 14
  let y = 15

  try {
    const logoRes = await fetch('/src/assets/loeitech-logo.png')
    const logoBuffer = await logoRes.arrayBuffer()
    const logoBase64 = btoa(String.fromCharCode(...new Uint8Array(logoBuffer)))
    doc.addImage(logoBase64, 'PNG', pageW / 2 - 20, y, 40, 40)
    y += 45
  } catch (e) {
    console.error('Failed to load logo:', e)
    y += 5
  }
  const f = (style: 'normal' | 'bold', size: number) => { doc.setFont('THSarabun', style); doc.setFontSize(size) }

  f('bold', 18)
  doc.text('รายชื่อผู้ชำระเงินค่าบำรุงการศึกษา', pageW / 2, y, { align: 'center' })
  y += 8
  f('normal', 13)
  doc.text('วิทยาลัยเทคนิคเลย', pageW / 2, y, { align: 'center' })
  y += 6
  f('normal', 11)
  doc.text('272 ถ.เจริญรัฐ ต.กุดป่อง อ.เมือง จ.เลย 42000  โทร 042811591', pageW / 2, y, { align: 'center' })
  y += 4
  doc.setDrawColor(16, 185, 130)
  doc.setLineWidth(0.6)
  doc.line(L, y, pageW - L, y)
  y += 7

  const colW = { no: 12, name: 55, cur: 22, branch: 45, date: 30, amount: 22 }
  f('bold', 13)
  doc.setFillColor(240, 253, 244)
  doc.rect(L, y - 5, pageW - L * 2, 8, 'F')

  let cx = L
  doc.text('ลำดับ', cx + colW.no / 2, y, { align: 'center' }); cx += colW.no
  doc.text('ชื่อ-นามสกุล', cx + colW.name / 2, y, { align: 'center' }); cx += colW.name
  doc.text('หลักสูตร', cx + colW.cur / 2, y, { align: 'center' }); cx += colW.cur
  doc.text('สาขาวิชา', cx + colW.branch / 2, y, { align: 'center' }); cx += colW.branch
  doc.text('วันที่ชำระ', cx + colW.date / 2, y, { align: 'center' }); cx += colW.date
  doc.text('ยอดรวม', cx + colW.amount / 2, y, { align: 'center' })
  y += 2

  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.3)
  doc.line(L, y, pageW - L, y)
  y += 5

  const rows = selectedIds.value.length > 0
    ? filteredExportData.value.filter(r => selectedIds.value.includes(r.ลำดับ))
    : filteredExportData.value.filter(r => r._isPaid)
  let totalAmount = 0
  let order = 1

  f('normal', 12)
  for (const row of rows) {
    if (y > 270) { doc.addPage(); y = 15 }
    cx = L
    doc.text(String(order), cx + colW.no / 2, y, { align: 'center' }); cx += colW.no
    doc.text(`${row.คำนำหน้า || ''}${row.ชื่อ_นามสกุล || ''}`, cx, y); cx += colW.name
    doc.text(row.หลักสูตร || '-', cx + colW.cur / 2, y, { align: 'center' }); cx += colW.cur
    doc.text(row.สาขาวิชา || '-', cx, y); cx += colW.branch
    doc.text(row.วันที่ชำระ || '-', cx, y); cx += colW.date
    const amt = Number(row.ยอดชำระ) || 0
    doc.text(amt ? amt.toLocaleString() : '-', cx + colW.amount, y, { align: 'right' })
    totalAmount += amt
    y += 1
    doc.setDrawColor(230, 230, 230)
    doc.line(L, y, pageW - L, y)
    y += 5
    order++
  }

  y += 3
  doc.setDrawColor(16, 185, 130)
  doc.setLineWidth(0.5)
  doc.line(L, y, pageW - L, y)
  y += 7
  f('bold', 13)
  doc.text(`รวมทั้งหมด ${rows.length} ราย`, L, y)
  doc.text(`ยอดรวม: ${totalAmount.toLocaleString()} บาท`, pageW - L, y, { align: 'right' })
  y += 10
  f('normal', 10)
  doc.setTextColor(150, 150, 150)
  doc.text(`พิมพ์เมื่อ: ${new Date().toLocaleString('th-TH')}`, pageW / 2, y, { align: 'center' })

  doc.save('รายชื่อผู้ชำระเงินค่าบำรุงการศึกษา.pdf')
}

const exportPaymentsPDF = async () => {
  if (selectedIds.value.length === 0) {
    alert('กรุณาเลือกผู้ใช้ที่ต้องการ Export ก่อน')
    return
  }

  const rows = currentData.value.filter(r => selectedIds.value.includes(r.ลำดับ))
  if (rows.length === 0) return

  ocrProgress.value = {
    running: true,
    current: 0,
    total: rows.length,
    name: 'กำลังเริ่มสร้าง...'
  }

  try {
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      ocrProgress.value.current = i + 1
      ocrProgress.value.name = `${row.คำนำหน้า || ''}${row.ชื่อ_นามสกุล || ''}`
      await generatePaymentReceiptPDF(row)
    }

  } catch (err) {
    console.error('❌ Error exporting payments PDF:', err)
  } finally {
    ocrProgress.value.running = false
  }
}

// handleGeneratePDF  still for OrdersTable emit only
const handleGeneratePDF = async (row: any) => {
  if (!row) return //  guard 
  ocrProgress.value = { running: true, current: 1, total: 1, name: '...' }
  try {
    ocrProgress.value.name = `${row.คำนำหน้า || ''}${row.ชื่อ_นามสกุล || ''}`
    await generateCombinedTwoPagePDF(row)
  } catch (err) {
    console.error(' Error generating combined order PDF:', err)
  } finally {
    ocrProgress.value.running = false
  }
}
// ─── Computed ─────────────────────────────────────────────────
const currentData = computed(() =>
  applicants.value.map(a => {
    const base = {
      ลำดับ: a.app_id,
      คำนำหน้า: a.prefix,
      ชื่อ_นามสกุล: a.full_name,
      หลักสูตร: a.curriculum.cur_shortname,
      สาขาวิชา: a.division.div_name,
    }

    if (selectedExportType.value === '' || selectedExportType.value === 'students') {
      return {
        ...base,
        เลขบัตรประชาชน: a.id_card_number,
        เบอร์โทร: a.phone,
        อีเมล: a.email,
        สถานะ: a.status,
        วันที่สมัคร: new Date(a.created_at).toLocaleDateString('th-TH'),
        enrolled_at: a.enrolled_at ?? null,
        _idFrontUrl: resolveUrl(a.id_front_url),
        _idBackUrl: resolveUrl(a.id_back_url),
        _eduFrontUrl: resolveUrl(a.edu_front_url),
        _isPaid: a.status === 'enrolled',
      }
    }

    if (selectedExportType.value === 'payments') {
      return {
        ...base,
        เลขบัตรประชาชน: a.id_card_number,
        สถานะ: a.status,
        enrolled_at: a.enrolled_at ?? null,
        ยอดชำระ: a.payment?.total_amount ?? '-',
        วันที่ชำระ: a.payment?.paid_at
          ? new Date(a.payment.paid_at).toLocaleDateString('th-TH')
          : (a.status === 'enrolled' ? '-' : 'ยังไม่ชำระ'),
        หลักฐานการชำระ_ใบเสร็จ: a.payment?.slip_name ?? '-',
        _isPaid: a.status === 'paid' || a.status === 'enrolled',
        _idFrontUrl: resolveUrl(a.id_front_url),
        _slipUrl: a.payment?.slip_url ? resolveUrl(a.payment.slip_url) : '',
      }
    }

    // orders
    return {
      ...base,
       เลขบัตรประชาชน: a.id_card_number,
      enrolled_at: a.enrolled_at ?? null,
      ยอดชำระ: a.payment?.total_amount ?? '-',
      หลักฐานการชำระ_ใบเสร็จ: a.payment?.slip_name ?? '-',
      วันที่ชำระ: a.payment?.paid_at
        ? new Date(a.payment.paid_at).toLocaleDateString('th-TH')
        : (a.status === 'enrolled' ? '-' : 'ยังไม่ชำระ'),
      _idFrontUrl: a.id_front_url ?? '',
      _isPaid: a.status === 'paid' || a.status === 'enrolled',
      _slipUrl: a.payment?.slip_url ? resolveUrl(a.payment.slip_url) : '',
    }
  })
)

const allBranches = computed(() => {
  const set = new Set(currentData.value.map(r => r.สาขาวิชา))
  return [...set].sort()
})

const filteredExportData = computed(() =>
  currentData.value.filter(row => {
    const fullDisplay = row.คำนำหน้า + row.ชื่อ_นามสกุล
    const matchName = !exportSearch.value || fullDisplay.includes(exportSearch.value)
    const matchBranch = !selectedBranch.value || row.สาขาวิชา === selectedBranch.value
    const matchCur = !selectedCurFilter.value || row.หลักสูตร.includes(selectedCurFilter.value)
    const matchStatus = selectedExportType.value === 'students'
      ? (!selectedStatus.value || row.สถานะ === selectedStatus.value)
      : selectedExportType.value === 'payments'
        ? (row.สถานะ === 'paid' || row.สถานะ === 'enrolled')
        : selectedExportType.value === 'orders'
        ? (selectedStatus.value ? row.สถานะ === selectedStatus.value : (row.สถานะ === 'paid' || row.สถานะ === 'enrolled'))
        : (!selectedStatus.value || (row.สถานะ && row.สถานะ === selectedStatus.value))

    let matchDate = true
    if (selectedExportType.value === 'payments' && paymentDateFilter.value) {
      matchDate = row.วันที่ชำระ && normalizeDateForSearch(row.วันที่ชำระ).includes(normalizeDateForSearch(paymentDateFilter.value))
    } else if (selectedExportType.value === 'orders' && orderDateFilter.value) {
      matchDate = row.วันที่ชำระ && normalizeDateForSearch(row.วันที่ชำระ).includes(normalizeDateForSearch(orderDateFilter.value))
    }

    const matchEnrolledDate = selectedExportType.value !== 'students' || !studentDateSearch.value
      ? true
      : (() => {
        if (!row.enrolled_at) return false
        const dateStr = new Date(row.enrolled_at).toLocaleDateString('th-TH')
        return dateStr.includes(studentDateSearch.value)
      })()

    return matchName && matchBranch && matchCur && matchStatus && matchDate && matchEnrolledDate
  }).sort((a, b) => {
    const statusOrder = { 'pending_approve': 1, 'pending_payment': 2, 'paid': 3, 'enrolled': 4 }
    const aStatus = statusOrder[a.สถานะ as keyof typeof statusOrder] || 999
    const bStatus = statusOrder[b.สถานะ as keyof typeof statusOrder] || 999
    return aStatus - bStatus
  })
)

const totalPages = computed(() => Math.ceil(filteredExportData.value.length / pageSize.value))

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredExportData.value.slice(start, start + pageSize.value)
})

const isAllSelected = computed(() =>
  filteredExportData.value.length > 0 &&
  filteredExportData.value.every(r => selectedIds.value.includes(r.ลำดับ))
)

const toggleAll = () => {
  if (isAllSelected.value) {
    selectedIds.value = []
  } else {
    selectedIds.value = filteredExportData.value.map(r => r.ลำดับ)
  }
}

const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    'enrolled': 'มอบตัวแล้ว',
    'paid': 'พร้อมมอบตัว',
    'pending_payment': 'สมัครใหม่',
    'pending_approve': 'รอตรวจสอบ'
  }
  return labels[status] || status
}

watch([
  exportSearch, selectedBranch, selectedCurFilter, selectedStatus,
  paymentAmountFilter, orderDateFilter, paymentDateFilter,
  studentDateSearch, selectedExportType
], () => {
  currentPage.value = 1
})


const formatDateInput = (event: Event) => {
  const input = event.target as HTMLInputElement
  const currentValue = input.value

  if (currentValue.endsWith('/') && currentValue.length > 1) {
    const newValue = currentValue.slice(0, -1)
    if (selectedExportType.value === 'payments') {
      paymentDateFilter.value = newValue
    } else if (selectedExportType.value === 'orders') {
      orderDateFilter.value = newValue
    }
    return
  }

  let value = input.value.replace(/\D/g, '')

  if (value.length >= 2) {
    value = value.slice(0, 2) + '/' + value.slice(2)
  }
  if (value.length >= 5) {
    value = value.slice(0, 5) + '/' + value.slice(5, 9)
  }

  input.value = value

  if (selectedExportType.value === 'payments') {
    paymentDateFilter.value = value
  } else if (selectedExportType.value === 'orders') {
    orderDateFilter.value = value
  }
}

const normalizeDateForSearch = (dateStr: string) => {
  if (!dateStr) return dateStr
  const parts = dateStr.split('/')
  if (parts.length === 3) {
    const day = parts[0].padStart(2, '0')
    const month = parts[1].padStart(2, '0')
    const year = parts[2]
    return `${day}/${month}/${year}`
  }
  return dateStr
}


// ─── OCR ─────────────────────────────────────────────────────
async function runOCRFromUrl(imageUrl: string, mode: 'id' | 'edu' = 'id'): Promise<Record<string, string>> {
  if (!imageUrl) return {}
  try {
    const { data: { text } } = await Tesseract.recognize(imageUrl, 'tha+eng', { logger: () => { } })
    return mode === 'id' ? parseThaiIDText(text) : parseEduDocText(text)
  } catch {
    return {}
  }
}

function parseThaiIDText(text: string): Record<string, string> {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  const result: Record<string, string> = {}

  const idMatch = text.replace(/[\s\-]/g, '').match(/\d{13}/)
  if (idMatch) result['OCR_เลขบัตร'] = idMatch[0]

  const prefixes = ['นาย', 'นาง', 'นางสาว', 'เด็กชาย', 'เด็กหญิง', 'Mr.', 'Mrs.', 'Miss']
  for (const line of lines) {
    for (const prefix of prefixes) {
      if (line.startsWith(prefix)) {
        result['OCR_คำนำหน้า'] = prefix
        result['OCR_ชื่อ_นามสกุล'] = line.slice(prefix.length).trim()
        break
      }
    }
    if (result['OCR_คำนำหน้า']) break
  }

  const engNameLine = lines.find(l => /^[A-Z\s]+$/.test(l) && l.length > 4)
  if (engNameLine) result['OCR_ชื่อ_ภาษาอังกฤษ'] = engNameLine.trim()

  const dobMatch = text.match(/(\d{1,2}[\s\/\-][A-Za-zก-ฮ]+\.?[\s\/\-]\d{4})/)
  if (dobMatch) result['OCR_วันเกิด'] = dobMatch[0].trim()

  const expMatch = text.match(/(?:หมดอายุ|Expiry Date?:?)\s*([\d\s\w\.]+)/i)
  if (expMatch) result['OCR_วันหมดอายุ'] = expMatch[1].trim()


  const religionMatch = text.match(/ศาสนา\s*([ก-ฮ\s]+?)(?:\n|เชื้อชาติ|สัญชาติ|$)/)
  if (religionMatch) result['OCR_ศาสนา'] = religionMatch[1].trim()

  const addrKeywords = ['บ้านเลขที่', 'หมู่ที่', 'ถนน', 'ตำบล', 'แขวง', 'อำเภอ', 'เขต', 'จังหวัด']
  const addrLines = lines.filter(l => addrKeywords.some(kw => l.includes(kw)))
  if (addrLines.length > 0) result['OCR_ที่อยู่'] = addrLines.join(' ')

  result['OCR_ข้อความดิบ'] = text.replace(/\n/g, ' ').trim()
  return result
}





function parseHouseRegText(text: string): Record<string, string> {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  const result: Record<string, string> = {}

  // รหัสประจำบ้าน 11 หลัก
  const houseCodeMatch = text.replace(/[\s\-]/g, '').match(/\d{11}/)
  if (houseCodeMatch) result['รหัสประจำบ้าน'] = houseCodeMatch[0]

  // รายการที่อยู่
  const addrKeywords = ['บ้านเลขที่', 'หมู่ที่', 'ถนน', 'ตำบล', 'แขวง', 'อำเภอ', 'เขต', 'จังหวัด']
  const addrLines = lines.filter(l => addrKeywords.some(kw => l.includes(kw)))
  if (addrLines.length > 0) result['ที่อยู่'] = addrLines.join(' ')

  // ชื่อนามสกุลในทะเบียนบ้าน
  const prefixes = ['นาย', 'นาง', 'นางสาว', 'เด็กชาย', 'เด็กหญิง']
  const nameLines = lines.filter(l => prefixes.some(p => l.startsWith(p)))
  if (nameLines[0]) result['ชื่อเจ้าบ้าน'] = nameLines[0]
  if (nameLines[1]) result['ชื่อบิดา'] = nameLines[1]
  if (nameLines[2]) result['ชื่อมารดา'] = nameLines[2]

  // เลข 13 หลัก (เลขบัตรของคนในทะเบียนบ้าน)
  const idMatches = [...text.replace(/[\s\-]/g, '').matchAll(/\d{13}/g)]
  if (idMatches[0]) result['เลขบัตรเจ้าบ้าน'] = idMatches[0][0]
  if (idMatches[1]) result['เลขบัตรบิดา'] = idMatches[1][0]
  if (idMatches[2]) result['เลขบัตรมารดา'] = idMatches[2][0]

  return result
}

// ─── Export ──────────────────────────────────────────────────
const sheetNames: Record<string, string> = {
  applicants: 'ข้อมูลผู้สมัคร',
  students: 'ข้อมูลนักเรียน',
  payments: 'การชำระเงิน',
  orders: 'การสั่งซื้อ',
}
const fileNames: Record<string, string> = {
  applicants: 'applicants_export.xlsx',
  students: 'students_export.xlsx',
  payments: 'payments_export.xlsx',
  orders: 'orders_export.xlsx',
}

async function buildExportData(rows: any[], isExportAll = false): Promise<object[]> {
  ocrProgress.value = { running: true, current: 0, total: rows.length, name: '' }
  const result: object[] = []

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    ocrProgress.value.current = i + 1
    ocrProgress.value.name = `${row.คำนำหน้า}${row.ชื่อ_นามสกุล}`

    if (isExportAll) {
      if (selectedExportType.value === 'students' && row.สถานะ !== 'enrolled') continue
      if (selectedExportType.value !== 'students' && !row._isPaid) continue
    }

    // ── 1. ดึงข้อมูลจาก DB ──────────────────────────────
    let dbData: Record<string, any> = {}
    try {
      const dbRes = await api.get(`/admin/applicants/detail/${row.เลขบัตรประชาชน}`)
      const d = dbRes.data?.data
      const prevLevelMap: Record<string, string> = {
        m3: 'มัธยมศึกษาปีที่ 3',
        m6: 'มัธยมศึกษาปีที่ 6',
        pvc: 'ประกาศนียบัตรวิชาชีพ (ปวช.)',
      }
      if (d) {
        dbData = {
          วันเดือนปีเกิด: d.birth_date ? new Date(d.birth_date).toLocaleDateString('th-TH') : '',
          โรงเรียนเก่า: d.prev_school || '',
          วุฒิการศึกษาเดิม: prevLevelMap[d.prev_level] || d.prev_level || '',
          สาขาวิชาเดิม: d.prev_branch || '',
          GPA: d.gpa || '',
        }
      }
    } catch { }

    // ── 2. ดึง URL เอกสารที่อัพโหลด (students เท่านั้น) ─
    let uploadedDocUrls: Record<string, string> = {}
    let allOcr: Record<string, string> = {}

    if (selectedExportType.value === 'students') {
      try {
        const docRes = await apiService.getApplicantDocuments(row.ลำดับ)
        if (docRes.success) {
          const docs = docRes.data.documents as { doc_type: string; file_url: string }[]

          // URL เอกสาร
          const docMap: Record<string, string> = {
            id_front: 'บัตรประชาชน (หน้า)',
            id_back: 'บัตรประชาชน (หลัง)',
            edu_front: 'วุฒิการศึกษา (หน้า)',
            edu_back: 'วุฒิการศึกษา (หลัง)',
            self_house_front: 'ทะเบียนบ้าน (หน้า)',
            self_house_back: 'ทะเบียนบ้าน (หลัง)',
            father_house_front: 'ทะเบียนบ้านบิดา (หน้า)',
            mother_house_front: 'ทะเบียนบ้านมารดา (หน้า)',
          }
          for (const doc of docs) {
            if (docMap[doc.doc_type] && doc.file_url) {
              uploadedDocUrls[docMap[doc.doc_type]] = resolveUrl(doc.file_url)
            }
          }

          // OCR
          for (const doc of docs) {
            if (!doc.file_url) continue
            const url = resolveUrl(doc.file_url)
            let ocr: Record<string, string> = {}
            if (doc.doc_type.startsWith('id')) {
              ocr = await runOCRFromUrl(url, 'id')
            } else if (doc.doc_type.startsWith('edu')) {
              ocr = await runOCRFromUrl(url, 'edu')
            } else if (doc.doc_type.includes('house')) {
              const res2 = await fetch(url)
              const blob = await res2.blob()
              const imgUrl = URL.createObjectURL(blob)
              const { data: { text } } = await Tesseract.recognize(imgUrl, 'tha+eng', { logger: () => { } })
              URL.revokeObjectURL(imgUrl)
              ocr = parseHouseRegText(text)
            }
            Object.entries(ocr).forEach(([k, v]) => { allOcr[`${doc.doc_type}_${k}`] = v })
          }
        }
      } catch (e) {
        console.warn('doc/OCR failed for', row.ชื่อ_นามสกุล, e)
      }
    }

    // ── 3. Push ผลลัพธ์ (ครั้งเดียว) ────────────────────
    if (selectedExportType.value === 'payments') {
      result.push({
        ลำดับ: result.length + 1,
        คำนำหน้า: row.คำนำหน้า,
        'ชื่อ-สกุล': row.ชื่อ_นามสกุล,
        หลักสูตร: row.หลักสูตร,
        สาขาวิชา: row.สาขาวิชา,
        วันที่ชำระ: row.วันที่ชำระ,
        ยอดรวม: row.ยอดชำระ,
        ...dbData,
      })
    } else {
      // students
      const enrollmentCertUrl = row.สถานะ === 'enrolled'
        ? `${window.location.origin}/enrollment-cert/${row.เลขบัตรประชาชน}`
        : '-'

      result.push({
        ลำดับ: result.length + 1,
        คำนำหน้า: row.คำนำหน้า,
        ชื่อ_นามสกุล: row.ชื่อ_นามสกุล,
        หลักสูตร: row.หลักสูตร,
        สาขาวิชา: row.สาขาวิชา,
        เลขบัตรประชาชน: row.เลขบัตรประชาชน,
        เบอร์โทร: row.เบอร์โทร,
        อีเมล: row.อีเมล,
        วันเดือนปีเกิด: dbData.วันเดือนปีเกิด || formatOCRDate(allOcr['id_front_OCR_วันเกิด'] || '') || '',
        โรงเรียนเก่า: dbData.โรงเรียนเก่า || '',
        วุฒิการศึกษาเดิม: dbData.วุฒิการศึกษาเดิม || '',
        สาขาวิชาเดิม: dbData.สาขาวิชาเดิม || '',
        GPA: dbData.GPA || '',
        'ใบรับรองการมอบตัว': enrollmentCertUrl,
        ...uploadedDocUrls,
      })
    }
  }

  ocrProgress.value.running = false
  return result
}

function parseEduDocText(text: string): Record<string, string> {
  const result: Record<string, string> = {}
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)

  // ชื่อโรงเรียน
  const schoolMatch = lines.find(l => l.includes('โรงเรียน') || l.includes('วิทยาลัย') || l.includes('มหาวิทยาลัย'))
  if (schoolMatch) result['OCR_สถานศึกษา'] = schoolMatch

  // GPA
  const gpaMatch = text.match(/(\d+\.\d+)/)
  if (gpaMatch) result['OCR_GPA'] = gpaMatch[1]

  result['OCR_ข้อความดิบ'] = text.replace(/\n/g, ' ').trim()
  return result
}
function formatOCRDate(dateStr: string): string {
  if (!dateStr) return ''

  const monthMap: Record<string, number> = {
    'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6,
    'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12,
    'มกราคม': 1, 'กุมภาพันธ์': 2, 'มีนาคม': 3, 'เมษายน': 4,
    'พฤษภาคม': 5, 'มิถุนายน': 6, 'กรกฎาคม': 7, 'สิงหาคม': 8,
    'กันยายน': 9, 'ตุลาคม': 10, 'พฤศจิกายน': 11, 'ธันวาคม': 12,
    'ม.ค.': 1, 'ก.พ.': 2, 'มี.ค.': 3, 'เม.ย.': 4, 'พ.ค.': 5, 'มิ.ย.': 6,
    'ก.ค.': 7, 'ส.ค.': 8, 'ก.ย.': 9, 'ต.ค.': 10, 'พ.ย.': 11, 'ธ.ค.': 12,
  }

  const match = dateStr.match(/(\d{1,2})\s+([A-Za-zก-ฮ\.]+)\s+(\d{4})/)
  if (!match) return dateStr

  const day = parseInt(match[1])
  const monthKey = Object.keys(monthMap).find(k => match[2].startsWith(k))
  const month = monthKey ? monthMap[monthKey] : null
  let year = parseInt(match[3])

  if (!month) return dateStr
  if (year < 2500) year += 543

  return new Date(year - 543, month - 1, day)
    .toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })
}

// ─── doExport / exportSelected / exportAll ────────────────────
async function doExport(rows: any[], isExportAll = false) {
  const data = await buildExportData(rows, isExportAll)
  const ws = XLSX.utils.json_to_sheet(data)

  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1')
  for (let R = range.s.r + 1; R <= range.e.r; R++) {
    for (let C = range.s.c; C <= range.e.c; C++) {
      const addr = XLSX.utils.encode_cell({ r: R, c: C })
      const cell = ws[addr]
      if (cell && typeof cell.v === 'string' && cell.v.startsWith('http')) {
        // ตรวจสอบว่าเป็นใบรับรองหรือรูปภาพอื่นๆ
        if (cell.v.includes('enrollment-cert')) {
          cell.l = { Target: cell.v }
          cell.v = '📄 ดาวน์โหลดใบรับรอง'
          cell.t = 's'
        } else {
          // สำหรับรูปภาพอื่นๆ (บัตรประชาชน, วุฒิการศึกษา, ทะเบียนบ้าน)
          cell.l = { Target: cell.v }
          cell.v = '🖼️ ดาวน์โหลดรูปภาพ'
          cell.t = 's'
        }
      }
    }
  }

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetNames[selectedExportType.value] || 'ข้อมูล')
  XLSX.writeFile(wb, fileNames[selectedExportType.value] || 'export.xlsx')
}

const exportSelected = async () => {
  if (selectedIds.value.length === 0) {
    alert('กรุณาเลือกรายการก่อน')
    return
  }
  const rows = currentData.value.filter(r => selectedIds.value.includes(r.ลำดับ))
  await doExport(rows, false)
}

const exportAll = async () => {
  await doExport(filteredExportData.value, true)
}
// ─── Export PDF ───────────────────────────────────────────────
const exportPDF = async () => {
  if (selectedIds.value.length === 0) {
    alert('กรุณาเลือกผู้ใช้ที่ต้องการ Export ก่อน')
    return
  }
  if (selectedExportType.value !== 'students' && selectedExportType.value !== 'payments') return
  ocrProgress.value = { running: true, current: 0, total: selectedIds.value.length, name: 'กำลังเริ่มสร้าง...' }
  try {
    const rows = currentData.value.filter(r => selectedIds.value.includes(r.ลำดับ))
    if (rows.length === 0) throw new Error('ไม่พบข้อมูลที่เลือก')
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      ocrProgress.value.current = i + 1
      ocrProgress.value.name = `${row.คำนำหน้า || ''}${row.ชื่อ_นามสกุล || ''}`

      if (selectedExportType.value === 'students') {
        let ocrData = {}
        try {
          if (row._idFrontUrl) ocrData = await runOCRFromUrl(row._idFrontUrl || '', 'id')
        } catch (e) {
          console.warn('OCR failed for', row.ชื่อ_นามสกุล, e)
        }
        await generateStudentPDF({ ...row, ...ocrData })
      } else if (selectedExportType.value === 'payments') {
        await generatePaymentPDF(row)
      }
    }
  } catch (err) {
    console.error('❌ Error exporting PDF:', err)
  } finally {
    ocrProgress.value.running = false
  }
}

const exportCombinedOrdersPDF = async () => {
  if (selectedIds.value.length === 0) {
    alert('กรุณาเลือกผู้ใช้ที่ต้องการ Export ก่อน')
    return
  }
  if (selectedExportType.value !== 'orders') return

  ocrProgress.value = { running: true, current: 0, total: selectedIds.value.length, name: 'กำลังเริ่มสร้าง...' }
  try {
    const rows = currentData.value.filter(r => selectedIds.value.includes(r.ลำดับ))
    if (rows.length === 0) throw new Error('ไม่พบข้อมูลที่เลือก')

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      ocrProgress.value.current = i + 1
      ocrProgress.value.name = `${row.คำนำหน้า || ''}${row.ชื่อ_นามสกุล || ''}`
      await generateCombinedTwoPagePDF(row)
    }
  } catch (err) {
    console.error('❌ Error exporting combined orders PDF:', err)
  } finally {
    ocrProgress.value.running = false
  }
}



async function loadThaiFont(): Promise<string> {
  try {
    const response = await fetch('/fonts/THSarabunNew.ttf')
    if (!response.ok) throw new Error('Font file not found')
    const blob = await response.blob()
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve((reader.result as string).split(',')[1])
      reader.readAsDataURL(blob)
    })
  } catch (error) {
    console.error('❌ Load font error:', error)
    return ''
  }
}

// ─── Doc Modal ────────────────────────────────────────────────
const docModal = ref({
  open: false,
  name: '',
  appId: '',
  status: '',
  slipApproved: null as boolean | null,
  slipErrorMessage: '' as string,
  documents: [] as { doc_type: string; file_url: string }[],
  activeTab: '' as string,
  imgError: false,
  imgLoading: false,
  enrolledData: null as any,
})

const blobUrl = ref<string>('')
// เพิ่มบรรทัดนี้ใกล้กับ blobUrl
const slipBlobUrl = ref<string>('')


watch(
  () => docModal.value.documents,
  async (docs) => {
    slipBlobUrl.value = ''
    const slipDoc = docs.find(d => d.doc_type === 'payment_slip')
    if (!slipDoc?.file_url) return
    try {
      const res = await fetch(resolveUrl(slipDoc.file_url))
      if (!res.ok) throw new Error('fetch failed')
      const blob = await res.blob()
      slipBlobUrl.value = URL.createObjectURL(blob)
    } catch {
      slipBlobUrl.value = ''
    }
  },
  { deep: true }
)
const DOC_FILTER: Record<string, string[]> = {
  pending_payment: ['payment_slip'],
  pending_approve: [
    'payment_slip', 'id_front', 'id_back',
    'edu_front', 'edu_back', 'letter_front', 'letter_back',
    'self_house_front', 'self_house_back',
    'father_house_front', 'father_house_back',
    'mother_house_front', 'mother_house_back',
  ],
  paid: [
    'payment_slip', 'id_front', 'id_back',
    'edu_front', 'edu_back', 'letter_front', 'letter_back',
    'self_house_front', 'self_house_back',
    'father_house_front', 'father_house_back',
    'mother_house_front', 'mother_house_back',
  ],
  enrolled: [
    'self_house_front', 'self_house_back',
    'father_house_front', 'father_house_back',
    'mother_house_front', 'mother_house_back',
  ],
}

const openPaymentSlipOnly = async () => {
  infoModal.value.open = false
  const d = infoModal.value.data
  if (!d) return

  let expenses: any[] = []
  try {
    const res = await api.get(`/enrollments/orders/${d.id_card_number}`)
    expenses = (res.data?.data ?? []).map((item: any) => ({
      exp_name: item.item_name,
      size: item.size,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
    }))
  } catch {}

  await exportPaymentPDF({
    prefix: d.prefix || '',
    fullName: d.full_name || '',
    idCard: d.id_card_number || '',
    phone: d.phone || '',
    courseLabel: d.cur_name || '',
    branchName: d.div_name || '',
    totalPrice: Number(d.total_amount) || 0,
    dueDate: d.due_date
      ? new Date(d.due_date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })
      : '',
    expenses,
  })
}

const openDeleteDialog = () => {
  deleteDialog.value = {
    open: true,
    appId: infoModal.value.appId,
    name: infoModal.value.name,
    confirmText: '',
    loading: false,
  }
}

const closeDeleteDialog = () => {
  deleteDialog.value.open = false
  deleteDialog.value.confirmText = ''
}

const confirmDelete = async () => {
  if (deleteDialog.value.confirmText !== deleteDialog.value.name) return
  deleteDialog.value.loading = true
  try {
    await api.delete(`/admin/applicants/${deleteDialog.value.appId}`)
    applicants.value = applicants.value.filter(a => a.app_id !== deleteDialog.value.appId)
    closeDeleteDialog()
    infoModal.value.open = false
  } catch (err) {
    console.error('ลบไม่สำเร็จ:', err)
  } finally {
    deleteDialog.value.loading = false
  }
}

const openDocModalFromInfo = () => {
  const savedData = infoModal.value.data
  infoModal.value.open = false
  openDocModal({
    ลำดับ: infoModal.value.appId,
    คำนำหน้า: '',
    ชื่อ_นามสกุล: infoModal.value.name,
    สถานะ: infoModal.value.status,
    _filterByStatus: true,
    _savedInfoData: savedData,
  })
}

async function loadFont(): Promise<string> {
  const res = await fetch('/fonts/THSarabunNew.ttf')
  const buffer = await res.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  let binary = ''
  bytes.forEach(b => binary += String.fromCharCode(b))
  return btoa(binary)
}

const printEnrollmentCert = async () => {
  const d = docModal.value.enrolledData || infoModal.value.data || {}

  const fontBase64 = await loadFont()
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  doc.addFileToVFS('THSarabunNew.ttf', fontBase64)
  doc.addFont('THSarabunNew.ttf', 'THSarabun', 'normal')
  doc.addFont('THSarabunNew.ttf', 'THSarabun', 'bold')
  doc.setFont('THSarabun')

  const pageW = 210
  const margin = 15
  let y = 2

  try {
    const logoRes = await fetch('/src/assets/loeitech-logo.png')
    const logoBuffer = await logoRes.arrayBuffer()
    const logoBase64 = btoa(String.fromCharCode(...new Uint8Array(logoBuffer)))
    doc.addImage(logoBase64, 'PNG', pageW / 2 - 20, y, 40, 40)
    y += 45
  } catch (error) {
    console.error('Failed to load logo:', error)
  }

  doc.setFontSize(22)
  doc.setFont('THSarabun', 'bold')
  doc.text('ใบรับรองการมอบตัว', pageW / 2, y, { align: 'center' })
  y += 8

  doc.setFontSize(14)
  doc.setFont('THSarabun', 'normal')
  doc.text('วิทยาลัยเทคนิคเลย', pageW / 2, y, { align: 'center' })
  y += 6
  doc.setFontSize(11)
  doc.text('272 ถ.เจริญรัฐ ต.กุดป่อง อ.เมือง จ.เลย 42000  โทร 042811591', pageW / 2, y, { align: 'center' })
  y += 6

  doc.setDrawColor(16, 185, 130)
  doc.setLineWidth(0.8)
  doc.line(15, y, pageW - 15, y)
  y += 12

  doc.setFontSize(13)
  doc.setFont('THSarabun', 'bold')
  doc.text('ขอรับรองว่า', pageW / 2, y, { align: 'center' })
  y += 10

  doc.setFontSize(18)
  doc.text(`${d.prefix}${d.full_name}`, pageW / 2, y, { align: 'center' })
  y += 8

  doc.setFontSize(12)
  doc.setFont('THSarabun', 'normal')
  doc.text(`หมายเลขประจำตัว: ${d.id_card_number}`, pageW / 2, y, { align: 'center' })
  y += 12

  doc.setFontSize(13)
  doc.text('ได้ดำเนินการมอบตัวเป็นนักเรียนนักศึกษาเรียบร้อยแล้ว', pageW / 2, y, { align: 'center' })
  y += 8

  doc.setFont('THSarabun', 'bold')
  doc.text(`หลักสูตร: ${d.cur_name}`, pageW / 2, y, { align: 'center' })
  y += 7
  doc.text(`สาขาวิชา: ${d.div_name}`, pageW / 2, y, { align: 'center' })
  y += 12

  doc.setFont('THSarabun', 'normal')
  doc.setFontSize(12)
  const enrolledAt = d.enrolled_at
    ? new Date(d.enrolled_at).toLocaleDateString('th-TH')
    : new Date(d.updated_at).toLocaleDateString('th-TH')
  doc.text(`วันที่มอบตัว: ${enrolledAt}`, pageW / 2, y, { align: 'center' })
  y += 10

  doc.setFillColor(240, 253, 244)
  doc.setDrawColor(16, 185, 130)
  doc.setLineWidth(0.5)
  doc.roundedRect(15, y, pageW - 30, 14, 3, 3, 'FD')
  doc.setFontSize(13)
  doc.setFont('THSarabun', 'bold')
  doc.setTextColor(5, 150, 105)
  doc.text('สถานะ: มอบตัวเสร็จสมบูรณ์ ✓', pageW / 2, y + 9, { align: 'center' })
  doc.setTextColor(0, 0, 0)
  y += 19

  doc.setFillColor(255, 251, 235)
  doc.setDrawColor(251, 191, 36)
  doc.setLineWidth(0.4)
  doc.roundedRect(margin, y, pageW - margin * 2, 24, 3, 3, 'FD')
  doc.setFontSize(13)
  doc.setFont('THSarabun', 'bold')
  doc.setTextColor(146, 64, 14)
  doc.text('หมายเหตุ', margin + 4, y + 7)
  doc.setFont('THSarabun', 'normal')
  doc.setFontSize(12)
  doc.text('1. เอกสารนี้ไม่ใช่สัญญาการมอบตัวเป็น นักเรียน นักศึกษา', margin + 4, y + 14)
  doc.text('2. โปรดนำเอกสารนี้ พร้อมวุฒิการศึกษาเดิมติดต่อที่งานทะเบียน วิทยาลัยเทคนิคเลยในวันปฐมนิเทศ', margin + 4, y + 21)
  doc.setTextColor(0, 0, 0)
  y += 30

  doc.setFontSize(10)
  doc.setFont('THSarabun', 'normal')
  doc.setTextColor(150, 150, 150)
  doc.text(`พิมพ์เมื่อ: ${new Date().toLocaleString('th-TH')}`, pageW / 2, y, { align: 'center' })

  doc.save(`ใบรับรองการมอบตัว-${d.id_card_number}.pdf`)
}

const openDocModal = async (row: any) => {
  docModal.value = {
    open: true,
    name: `${row.คำนำหน้า}${row.ชื่อ_นามสกุล}`,
    appId: row.ลำดับ,
    status: row.สถานะ || '',
    slipApproved: null,
    documents: [],
    activeTab: '',
    imgError: false,
    imgLoading: false,
    enrolledData: null,
  }
  try {
    const res = await apiService.getApplicantDocuments(row.ลำดับ)
    if (res.success) {
      let docs = res.data.documents as { doc_type: string; file_url: string }[]
      docModal.value.enrolledData = res.data.applicant || row._savedInfoData || null

      if (row._filterByStatus && row.สถานะ) {
        const allowed = DOC_FILTER[row.สถานะ] ?? null
        if (allowed) docs = docs.filter((d: any) => allowed.includes(d.doc_type))
      }

      docModal.value.documents = docs.filter((d: any, i: number, self: any[]) =>
        i === self.findIndex((t: any) => t.doc_type === d.doc_type)
      )

      if (typeof res.data.slip_approved === 'boolean') {
        docModal.value.slipApproved = res.data.slip_approved
        docModal.value.slipErrorMessage = res.data.slip_error_message || ''
      }

      if (row._showAll) {
        docModal.value.activeTab = docModal.value.documents.find(
          d => d.doc_type !== 'payment_slip'
        )?.doc_type || docModal.value.documents[0]?.doc_type || ''
      } else if (row.สถานะ === 'pending_payment') {
        docModal.value.activeTab = docModal.value.documents.find(
          d => d.doc_type === 'payment_slip'
        )?.doc_type || '__no_slip__'
      } else if (row.สถานะ === 'enrolled') {
        docModal.value.activeTab = '__enrollment_cert__'
      } else {
        docModal.value.activeTab = docModal.value.documents.find(
          d => d.doc_type === 'payment_slip'
        )?.doc_type || docModal.value.documents[0]?.doc_type || ''
      }

    }
  } catch (e) {
    console.error('โหลดเอกสารไม่สำเร็จ', e)
  }
}

const currentDocUrl = computed(() =>
  resolveUrl(docModal.value.documents.find(d => d.doc_type === docModal.value.activeTab)?.file_url)
)

watch(
  () => [docModal.value.activeTab, docModal.value.documents] as const,
  async ([tab]) => {
    blobUrl.value = ''
    if (!tab || tab.startsWith('__')) return
    const url = resolveUrl(
      docModal.value.documents.find(d => d.doc_type === tab)?.file_url
    )
    if (!url) return
    docModal.value.imgLoading = true
    docModal.value.imgError = false
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error('fetch failed')
      const blob = await res.blob()
      blobUrl.value = URL.createObjectURL(blob)
    } catch {
      docModal.value.imgError = true
    } finally {
      docModal.value.imgLoading = false
    }
  },
  { immediate: true, deep: true }
)

async function generateStudentPDF(studentData: any) {
  try {
    const fontBase64 = await loadThaiFont()
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    if (fontBase64) {
      doc.addFileToVFS('THSarabunNew.ttf', fontBase64)
      doc.addFont('THSarabunNew.ttf', 'THSarabun', 'normal')
      doc.addFont('THSarabunNew.ttf', 'THSarabun', 'bold')
    }
    const pageW = 210
    const L = 15
    const R = 195
    let y = 0
    const f = (style: 'normal' | 'bold', size: number) => { doc.setFont('THSarabun', style); doc.setFontSize(size) }
    const put = (text: string | number | undefined, x: number, y: number) => {
      if (!text && text !== 0) return
      f('bold', 14); doc.text(String(text), x, y); f('normal', 14)
    }
    const box = (x: number, y: number, checked = false) => {
      doc.rect(x, y - 3.2, 3.5, 3.5)
      if (checked) doc.text('✓', x + 0.3, y - 0.1)
    }
    const charBoxes = (startX: number, y: number, value: string, count: number, w = 4.8) => {
      const clean = value.replace(/-/g, '')
      for (let i = 0; i < count; i++) {
        doc.rect(startX + i * w, y - 4, w, 5)
        if (clean[i]) { f('bold', 12); doc.text(clean[i], startX + i * w + 1.2, y - 0.3); f('normal', 14) }
      }
    }
    y = 16
    doc.rect(L, 8, 16, 16)
    f('bold', 15)
    doc.text('วิทยาลัยเทคนิคเลย  ปีการศึกษา 2569', 112, y, { align: 'center' })
    f('normal', 13)
    doc.text('ระดับ', 153, y)
    box(163, y, studentData.หลักสูตร?.includes('ปวช'))
    doc.text('ปวช.', 167, y)
    box(179, y, studentData.หลักสูตร?.includes('ปวส'))
    doc.text('ปวส.', 183, y)
    y += 7
    f('normal', 13)
    doc.text('มอบตัว วันที่ ........... เดือน .................................. พ.ศ. ..............', 112, y, { align: 'center' })
    y += 7
    f('bold', 16)
    doc.text('ใบมอบตัวและข้อมูลประวัติขึ้นทะเบียนนักเรียน นักศึกษา', pageW / 2, y, { align: 'center' })
    doc.rect(R - 26, 24, 26, 34)
    f('normal', 12)
    doc.text('ติดรูป', R - 13, 38, { align: 'center' })
    doc.text('1 นิ้ว', R - 13, 44, { align: 'center' })
    y += 7
    f('bold', 14)
    doc.text('ข้อมูลส่วนตัวของนักเรียน นักศึกษา', L, y)
    y += 7
    f('normal', 14)
    doc.text('ชื่อ-สกุล', L, y); doc.line(L + 17, y, L + 90, y)
    put(`${studentData.คำนำหน้า || ''}${studentData.ชื่อ_นามสกุล || ''}`, L + 18, y)
    doc.text('เพศ', L + 92, y); doc.line(L + 99, y, L + 112, y); put(studentData.เพศ, L + 100, y)
    doc.text('ชื่อเล่น', L + 114, y); doc.line(L + 125, y, R - 28, y); put(studentData.ชื่อเล่น, L + 126, y)
    y += 7
    doc.text('เลขบัตรประชาชน', L, y)
    const idRaw = (studentData.เลขบัตรประชาชน || '').replace(/-/g, '')
    const idGroups = [1, 4, 5, 2, 1]
    let ix = L + 32; let ic = 0
    idGroups.forEach((g, gi) => {
      for (let i = 0; i < g; i++) {
        doc.rect(ix, y - 4, 4.8, 5)
        f('bold', 12); doc.text(idRaw[ic] || '', ix + 1.2, y - 0.3); f('normal', 14)
        ix += 4.8; ic++
      }
      if (gi < idGroups.length - 1) { doc.text('-', ix + 0.5, y - 0.5); ix += 3 }
    })
    doc.text('เกิดวันที่', ix + 3, y); doc.line(ix + 16, y, ix + 24, y)
    doc.text('เดือน', ix + 25, y); doc.line(ix + 34, y, ix + 52, y)
    doc.text('พ.ศ.', ix + 53, y); doc.line(ix + 61, y, ix + 72, y)
    y += 7
    doc.text('เชื้อชาติ', L, y); doc.line(L + 14, y, L + 30, y); put(studentData.เชื้อชาติ, L + 15, y)
    doc.text('สัญชาติ', L + 32, y); doc.line(L + 43, y, L + 57, y); put(studentData.สัญชาติ, L + 44, y)
    doc.text('ศาสนา', L + 59, y); doc.line(L + 69, y, L + 83, y); put(studentData.ศาสนา, L + 70, y)
    doc.text('หมู่เลือด', L + 85, y); doc.line(L + 96, y, L + 105, y); put(studentData.หมู่เลือด, L + 97, y)
    doc.text('น้ำหนัก', L + 107, y); doc.line(L + 117, y, L + 126, y)
    doc.text('ก.ก.', L + 127, y)
    doc.text('ส่วนสูง', L + 133, y); doc.line(L + 142, y, L + 152, y)
    doc.text('ซ.ม.', L + 153, y)
    y += 7
    doc.text('จังหวัดที่เกิด', L, y); doc.line(L + 21, y, L + 60, y); put(studentData.จังหวัดที่เกิด, L + 22, y)
    doc.text('จำนวนพี่น้องทั้งหมด', L + 62, y); doc.line(L + 91, y, L + 98, y)
    doc.text('คน', L + 99, y)
    doc.text('จำนวนพี่น้องที่กำลังศึกษาอยู่', L + 104, y); doc.line(L + 140, y, L + 147, y)
    doc.text('คน', L + 148, y)
    y += 7
    doc.text('ความพิการ', L, y)
    box(L + 19, y, !studentData.ความพิการ); doc.text('ไม่พิการ', L + 24, y)
    doc.text('ความสามารถพิเศษ', L + 45, y); doc.line(L + 75, y, R - 28, y)
    y += 8
    f('bold', 14)
    doc.text('ข้อมูลที่อยู่  เลขรหัสประจำบ้าน (จำเป็นต้องกรอกให้ครบ)', L, y)
    charBoxes(L + 102, y, studentData.รหัสประจำบ้าน || '', 11, 4.8)
    y += 7
    f('normal', 14)
    doc.text('บ้านเลขที่', L, y); doc.line(L + 16, y, L + 32, y); put(studentData.บ้านเลขที่, L + 17, y)
    doc.text('หมู่', L + 34, y); doc.line(L + 40, y, L + 50, y); put(studentData.หมู่, L + 41, y)
    doc.text('ถนน', L + 52, y); doc.line(L + 59, y, L + 88, y)
    doc.text('ตำบล', L + 90, y); doc.line(L + 98, y, L + 120, y)
    doc.text('อำเภอ', L + 122, y); doc.line(L + 130, y, R - 28, y)
    y += 7
    doc.text('จังหวัด', L, y); doc.line(L + 13, y, L + 48, y); put(studentData.จังหวัด, L + 14, y)
    doc.text('รหัสไปรษณีย์', L + 50, y); doc.line(L + 70, y, L + 90, y); put(studentData.รหัสไปรษณีย์, L + 71, y)
    doc.text('เบอร์โทรศัพท์ที่ติดต่อได้', L + 92, y); doc.line(L + 120, y, R - 28, y); put(studentData.เบอร์โทร, L + 121, y)
    y += 8
    f('bold', 14)
    doc.text('ข้อมูลครอบครัว', L, y)
    y += 7
    f('normal', 14)
    doc.text('ชื่อ-สกุล บิดา', L, y); doc.line(L + 24, y, L + 88, y); put(studentData.ชื่อบิดา, L + 25, y)
    doc.text('สถานภาพ', L + 90, y)
    box(L + 104, y); doc.text('มีชีวิต', L + 109, y)
    box(L + 122, y); doc.text('เสียชีวิต', L + 127, y)
    doc.text('ความพิการ', L + 140, y)
    box(L + 155, y); doc.text('พิการ', L + 160, y)
    box(L + 170, y); doc.text('ไม่พิการ', L + 175, y)
    y += 6.5
    doc.text('อาชีพบิดา', L, y); doc.line(L + 16, y, L + 60, y)
    doc.text('รายได้ต่อเดือน', L + 62, y); doc.line(L + 83, y, L + 108, y)
    doc.text('บาท', L + 110, y)
    doc.text('เบอร์โทรศัพท์ บิดา', L + 116, y); doc.line(L + 143, y, R, y)
    y += 6.5
    doc.text('ชื่อ-สกุล มารดา', L, y); doc.line(L + 26, y, L + 88, y); put(studentData.ชื่อมารดา, L + 27, y)
    doc.text('สถานภาพ', L + 90, y)
    box(L + 104, y); doc.text('มีชีวิต', L + 109, y)
    box(L + 122, y); doc.text('เสียชีวิต', L + 127, y)
    doc.text('ความพิการ', L + 140, y)
    box(L + 155, y); doc.text('พิการ', L + 160, y)
    box(L + 170, y); doc.text('ไม่พิการ', L + 175, y)
    y += 6.5
    doc.text('อาชีพมารดา', L, y); doc.line(L + 18, y, L + 60, y)
    doc.text('รายได้ต่อเดือน', L + 62, y); doc.line(L + 83, y, L + 108, y)
    doc.text('บาท', L + 110, y)
    doc.text('เบอร์โทรศัพท์ มารดา', L + 116, y); doc.line(L + 145, y, R, y)
    y += 7
    doc.text('สถานภาพการสมรส บิดา/มารดา', L, y)
    box(L + 56, y); doc.text('อยู่ด้วยกัน', L + 61, y)
    box(L + 80, y); doc.text('แยกกันอยู่', L + 85, y)
    box(L + 103, y); doc.text('หย่าร้าง', L + 108, y)
    box(L + 123, y); doc.text('บิดา/มารดาแต่งงานใหม่', L + 128, y)
    box(L + 163, y); doc.text('บิดา/มารดาเสียชีวิต', L + 168, y)
    y += 8
    doc.text('ข้าพเจ้า (ชื่อผู้ปกครอง)', L, y)
    doc.line(L + 42, y, L + 120, y); put(studentData.ชื่อผู้ปกครอง, L + 43, y)
    doc.text('เกี่ยวข้องเป็น(กับนักเรียน)', L + 122, y); doc.line(L + 156, y, R, y)
    y += 6.5
    doc.text('เบอร์โทรศัพท์ที่ติดต่อผู้ปกครอง', L, y); doc.line(L + 60, y, L + 115, y)
    doc.text('ขอทำใบมอบตัวต่อผู้อำนวยการวิทยาลัยเทคนิคเลย ดังนี้', L + 117, y)
    y += 6.5
    doc.text('นักศึกษาในความปกครองของข้าพเจ้าชื่อ', L, y)
    doc.line(L + 70, y, L + 130, y)
    doc.text('ชื่อเล่น', L + 132, y); doc.line(L + 143, y, R, y)
    y += 6
    f('normal', 13)
    doc.text('ข้าพเจ้า ขอรับเป็นผู้ปกครองและของรับรองว่าจะเป็นผู้คอยดูแลตักเตือนให้นักเรียนผู้นี้นักศึกษาเล่าเรียนอยู่เสมอ ให้มีความประพฤติ', L, y)
    y += 5.5
    doc.text('เรียบร้อยตามคำสั่งสอน ข้อบังคับ และระเบียบวินัยของวิทยาลัยฯ ทุกประการ โดยข้าพเจ้าขอรับผิดชอบค่าเล่าเรียน เครื่องแต่งกาย และอุปกรณ์', L, y)
    y += 5.5
    doc.text('การเรียนให้เพียงพอ ข้าพเจ้า ขอมอบ (ชื่อนักเรียน นักศึกษา)', L, y); doc.line(L + 108, y, R, y)
    y += 5.5
    doc.text('ให้เป็นนักเรียน นักศึกษา วิทยาลัยเทคนิคเลย ตั้งแต่บัดนี้เป็นต้นไป', L, y)
    y += 16
    f('normal', 14)
    doc.text('ลงชื่อ', L + 8, y); doc.line(L + 18, y, L + 78, y)
    doc.text('ผู้ปกครอง', L + 80, y)
    doc.text('ลงชื่อ', pageW / 2 + 10, y); doc.line(pageW / 2 + 20, y, pageW / 2 + 80, y)
    doc.text('นักเรียน/นักศึกษา', pageW / 2 + 82, y)
    y += 7
    doc.text('(', L + 18, y); doc.line(L + 22, y, L + 75, y); doc.text(')', L + 76, y)
    doc.text('(', pageW / 2 + 20, y); doc.line(pageW / 2 + 24, y, pageW / 2 + 78, y); doc.text(')', pageW / 2 + 79, y)
    doc.save(`ใบมอบตัว_${studentData.ชื่อ_นามสกุล || 'student'}.pdf`)
  } catch (err) {
    console.error('PDF Error:', err)
  }
}



async function generatePaymentReceiptPDF(row: any) {
  const fontBase64 = await loadThaiFont()
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  if (fontBase64) {
    doc.addFileToVFS('THSarabunNew.ttf', fontBase64)
    doc.addFont('THSarabunNew.ttf', 'THSarabun', 'normal')
    doc.addFont('THSarabunNew.ttf', 'THSarabun', 'bold')
  }

  const pageW = 210
  const margin = 15
  let y = 2

  // ─── โลโก้ ────────────────────────────────────────────────
  try {
    const logoRes = await fetch('/src/assets/loeitech-logo.png')
    const logoBuffer = await logoRes.arrayBuffer()
    const logoBase64 = btoa(String.fromCharCode(...new Uint8Array(logoBuffer)))
    doc.addImage(logoBase64, 'PNG', pageW / 2 - 20, y, 40, 40)
    y += 45
  } catch (e) {
    console.error('Failed to load logo:', e)
    y += 5
  }

  // ─── Header ───────────────────────────────────────────────
  doc.setFontSize(24)
  doc.setFont('THSarabun', 'bold')
  doc.text('ใบแสดงการชำระเงิน', pageW / 2, y, { align: 'center' })
  y += 9

  doc.setFontSize(15)
  doc.setFont('THSarabun', 'normal')
  doc.text('วิทยาลัยเทคนิคเลย — ระบบรับสมัครนักเรียนนักศึกษาออนไลน์', pageW / 2, y, { align: 'center' })
  y += 8

  doc.setDrawColor(16, 185, 130)
  doc.setLineWidth(0.8)
  doc.line(margin, y, pageW - margin, y)
  y += 10

  // ─── Layout: ซ้าย | ขวา ───────────────────────────────────
  const colLeftX = margin
  const colLeftW = 108
  const colRightX = margin + colLeftW + 5
  const colRightW = pageW - colRightX - margin
  const sectionStartY = y

  // ─── ดึงข้อมูลเพิ่มเติมจาก API ───────────────────────────
  let dbData: any = {}
  try {
    const dbRes = await api.get(`/admin/applicants/detail/${row.เลขบัตรประชาชน}`)
    dbData = dbRes.data?.data || {}
  } catch (e) {
    console.warn('โหลด DB ไม่ได้', e)
  }

  // ════ คอลัมน์ซ้าย ═════════════════════════════════════════
  doc.setFontSize(13)
  doc.setFont('THSarabun', 'bold')
  doc.setTextColor(5, 150, 105)
  doc.text('ข้อมูลผู้สมัคร', colLeftX, y)
  doc.setTextColor(0, 0, 0)
  y += 7

  const infoFields = [
    { label: 'ชื่อ-สกุล', value: `${row.คำนำหน้า || ''}${row.ชื่อ_นามสกุล || ''}` },
    { label: 'หมายเลขประจำตัว', value: row.เลขบัตรประชาชน || dbData.id_card_number || '-' },
    { label: 'หลักสูตร', value: row.หลักสูตร || '-' },
    { label: 'สาขาวิชา', value: row.สาขาวิชา || '-' },
  ]

  for (const field of infoFields) {
    doc.setFontSize(11)
    doc.setFont('THSarabun', 'bold')
    doc.setTextColor(80, 80, 80)
    doc.text(field.label, colLeftX, y)
    y += 5
    doc.setFont('THSarabun', 'normal')
    doc.setFontSize(13)
    doc.setTextColor(0, 0, 0)
    const lines = doc.splitTextToSize(field.value ?? '-', colLeftW - 2)
    doc.text(lines, colLeftX, y)
    y += lines.length * 6 + 2
  }

  y += 2
  doc.setDrawColor(220, 220, 220)
  doc.setLineWidth(0.3)
  doc.line(colLeftX, y, colLeftX + colLeftW, y)
  y += 7

  // — ข้อมูลการชำระเงิน —
  doc.setFontSize(13)
  doc.setFont('THSarabun', 'bold')
  doc.setTextColor(5, 150, 105)
  doc.text('ข้อมูลการชำระเงิน', colLeftX, y)
  doc.setTextColor(0, 0, 0)
  y += 7

  const payFields = [
    { label: 'ยอดที่ชำระ', value: row.ยอดชำระ ? `${Number(row.ยอดชำระ).toLocaleString()} บาท` : '-' },
    { label: 'วันที่ชำระเงิน', value: row.วันที่ชำระ || '-' },
    { label: 'ชื่อผู้โอน', value: dbData.slip_sender ?? '-' },
    { label: 'ธนาคารผู้รับ', value: dbData.slip_receiver ?? '-' },
  ]

  for (const field of payFields) {
    doc.setFontSize(11)
    doc.setFont('THSarabun', 'bold')
    doc.setTextColor(80, 80, 80)
    doc.text(field.label, colLeftX, y)
    y += 5
    doc.setFont('THSarabun', 'normal')
    doc.setFontSize(13)
    doc.setTextColor(0, 0, 0)
    doc.text(field.value ?? '-', colLeftX, y)
    y += 8
  }

  // ════ คอลัมน์ขวา: รูปสลิป ════════════════════════════════
  const boxH = 100
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.4)
  doc.setFillColor(249, 250, 251)
  doc.roundedRect(colRightX, sectionStartY, colRightW, boxH, 3, 3, 'FD')

  doc.setFontSize(11)
  doc.setFont('THSarabun', 'bold')
  doc.setTextColor(100, 100, 100)
  doc.text('หลักฐานการชำระเงิน', colRightX + colRightW / 2, sectionStartY + 7, { align: 'center' })
  doc.setTextColor(0, 0, 0)

  // ✅ ใช้ _slipUrl จาก currentData ที่ map ไว้แล้ว
  if (row._slipUrl) {
    try {
      const imgRes = await fetch(row._slipUrl)
      const imgBuffer = await imgRes.arrayBuffer()
      const imgBytes = new Uint8Array(imgBuffer)
      let binary = ''
      imgBytes.forEach(b => binary += String.fromCharCode(b))
      const imgBase64 = btoa(binary)
      const isPng = row._slipUrl.toLowerCase().includes('.png')
      doc.addImage(
        imgBase64, isPng ? 'PNG' : 'JPEG',
        colRightX + 3, sectionStartY + 11,
        colRightW - 6, boxH - 14
      )
    } catch {
      doc.setFontSize(11)
      doc.setFont('THSarabun', 'normal')
      doc.setTextColor(150, 150, 150)
      doc.text('ไม่สามารถโหลดรูปสลิปได้', colRightX + colRightW / 2, sectionStartY + 55, { align: 'center' })
      doc.setTextColor(0, 0, 0)
    }
  } else {
    doc.setFontSize(11)
    doc.setFont('THSarabun', 'normal')
    doc.setTextColor(150, 150, 150)
    doc.text('ไม่พบหลักฐานการชำระเงิน', colRightX + colRightW / 2, sectionStartY + 55, { align: 'center' })
    doc.setTextColor(0, 0, 0)
  }

  y = Math.max(y, sectionStartY + boxH + 8)

  // ─── กล่องสถานะ ───────────────────────────────────────────
  doc.setFillColor(240, 253, 244)
  doc.setDrawColor(16, 185, 130)
  doc.setLineWidth(0.5)
  doc.roundedRect(margin, y, pageW - margin * 2, 14, 3, 3, 'FD')
  doc.setFontSize(14)
  doc.setFont('THSarabun', 'bold')
  doc.setTextColor(5, 150, 105)
  doc.text('สถานะ: ชำระเงินเรียบร้อยแล้ว ✓', pageW / 2, y + 9, { align: 'center' })
  doc.setTextColor(0, 0, 0)
  y += 20

  // ─── กล่องหมายเหตุ ────────────────────────────────────────
  doc.setFillColor(255, 251, 235)
  doc.setDrawColor(251, 191, 36)
  doc.setLineWidth(0.4)
  doc.roundedRect(margin, y, pageW - margin * 2, 24, 3, 3, 'FD')
  doc.setFontSize(13)
  doc.setFont('THSarabun', 'bold')
  doc.setTextColor(146, 64, 14)
  doc.text('หมายเหตุ', margin + 4, y + 7)
  doc.setFont('THSarabun', 'normal')
  doc.setFontSize(12)
  doc.text('1. เอกสารนี้ไม่ใช่ใบเสร็จรับเงิน', margin + 4, y + 14)
  doc.text('2. โปรดนำเอกสารนี้ติดต่อขอรับใบเสร็จรับเงินฉบับจริงที่งานการเงิน วิทยาลัยเทคนิคเลย', margin + 4, y + 21)
  doc.setTextColor(0, 0, 0)
  y += 30

  doc.setFontSize(10)
  doc.setFont('THSarabun', 'normal')
  doc.setTextColor(150, 150, 150)
  doc.text(`พิมพ์เมื่อ: ${new Date().toLocaleString('th-TH')}`, pageW / 2, y, { align: 'center' })

  doc.save(`ใบแสดงการชำระเงิน-${row.คำนำหน้า || ''}${row.ชื่อ_นามสกุล || ''}.pdf`)
}
const exportOrdersListPDF = async () => {
  // กรองเฉพาะที่เลือก ถ้าไม่ได้เลือกเลยให้แจ้ง
  if (selectedIds.value.length === 0) {
    alert('กรุณาเลือกรายการที่ต้องการ Export ก่อน')
    return
  }

  const rows = filteredExportData.value.filter(r => selectedIds.value.includes(r.ลำดับ))
  if (rows.length === 0) return

  const fontBase64 = await loadThaiFont()
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  if (fontBase64) {
    doc.addFileToVFS('THSarabunNew.ttf', fontBase64)
    doc.addFont('THSarabunNew.ttf', 'THSarabun', 'normal')
    doc.addFont('THSarabunNew.ttf', 'THSarabun', 'bold')
  }

  const pageW = 210  // portrait A4
  const colW = {
    no: 15,
    name: 50,
    cur: 25,
    branch: 55,
    date: 30,
    amount: 25,
  }
  const totalW = Object.values(colW).reduce((a, b) => a + b, 0)
  const L = (pageW - totalW) / 2
  let y = 15
  const f = (style: 'normal' | 'bold', size: number) => {
    doc.setFont('THSarabun', style)
    doc.setFontSize(size)
  }
  // ─── Logo ────────────────────────────────────────────────
  try {
    const logoRes = await fetch('/src/assets/loeitech-logo.png')
    const logoBuffer = await logoRes.arrayBuffer()
    const logoBase64 = btoa(String.fromCharCode(...new Uint8Array(logoBuffer)))
    doc.addImage(logoBase64, 'PNG', pageW / 2 - 20, y, 40, 40)
    y += 45
  } catch { y += 5 }

  // ─── Header ──────────────────────────────────────────────
  f('bold', 22)
  doc.text('ใบสรุปยอดการสั่งซื้อเครื่องแบบและอุปกรณ์', pageW / 2, y, { align: 'center' })
  y += 8
  f('normal', 14)
  doc.text('วิทยาลัยเทคนิคเลย', pageW / 2, y, { align: 'center' })
  y += 6
  f('normal', 11)
  doc.text('272 ถ.เจริญรัฐ ต.กุดป่อง อ.เมือง จ.เลย 42000  โทร 042811591', pageW / 2, y, { align: 'center' })
  y += 6

  // ─── ช่วงวันที่ (หาจากข้อมูลที่เลือก) ──────────────────
  const validDates = rows
    .map(r => r.วันที่ชำระ)
    .filter(d => d && d !== '-' && d !== 'ยังไม่ชำระ')

  const dateRangeText = validDates.length > 0
    ? `วันที่ ${validDates[0]}  ถึง  ${validDates[validDates.length - 1]}`
    : 'วันที่ -  ถึง  -'

  f('normal', 13)
  doc.setTextColor(80, 80, 80)
  doc.text(dateRangeText, pageW / 2, y, { align: 'center' })
  doc.setTextColor(0, 0, 0)
  y += 4

  doc.setDrawColor(16, 185, 130)
  doc.setLineWidth(0.8)
  doc.line(L, y, pageW - L, y)
  y += 8



  // ─── Header row ──────────────────────────────────────────
  f('bold', 15)
  doc.setFillColor(240, 253, 244)
  doc.rect(L, y - 5.5, totalW, 9, 'F')
  doc.setDrawColor(16, 185, 130)
  doc.setLineWidth(0.4)
  doc.rect(L, y - 5.5, totalW, 8)

  let cx = L
  doc.text('ลำดับ', cx + colW.no / 2, y, { align: 'center' }); cx += colW.no
  doc.text('ชื่อ-นามสกุล', cx + colW.name / 2, y, { align: 'center' }); cx += colW.name
  doc.text('หลักสูตร', cx + colW.cur / 2, y, { align: 'center' }); cx += colW.cur
  doc.text('สาขาวิชา', cx + colW.branch / 2, y, { align: 'center' }); cx += colW.branch
  doc.text('วันที่ชำระ', cx + colW.date / 2, y, { align: 'center' }); cx += colW.date
  doc.text('จำนวนเงิน', cx + colW.amount / 2, y, { align: 'center' })
  y += 3

  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.3)
  doc.line(L, y, L + totalW, y)
  y += 6

  // ─── Rows ─────────────────────────────────────────────────
  let totalAmount = 0
  let order = 1

  f('normal', 15)
  for (const row of rows) {
    if (y > 250) {
      doc.addPage()
      y = 15
    }

    const amt = Number(row.ยอดชำระ) || 0
    totalAmount += amt

    cx = L
    doc.setTextColor(80, 80, 80)
    doc.text(String(order), cx + colW.no / 2, y, { align: 'center' })
    cx += colW.no

    doc.setTextColor(0, 0, 0)
    // ตัดชื่อยาวเกินไป
    f('normal', 13)
    const fullName = `${row.คำนำหน้า || ''}${row.ชื่อ_นามสกุล || ''}`
    const nameLines = doc.splitTextToSize(fullName, colW.name - 2)
    doc.text(nameLines[0], cx + colW.name / 2, y, { align: 'center' })
    cx += colW.name

    doc.setTextColor(80, 80, 80)
    f('normal', 13)
    doc.text(row.หลักสูตร || '-', cx + colW.cur / 2, y, { align: 'center' })
    cx += colW.cur

    // สาขา — ตัดถ้ายาว
    f('normal', 13)
    const branchText = doc.splitTextToSize(row.สาขาวิชา || '-', colW.branch - 2)
    doc.text(branchText[0], cx + colW.branch / 2, y, { align: 'center' })
    cx += colW.branch

    doc.text(row.วันที่ชำระ || '-', cx + colW.date / 2, y, { align: 'center' })
    cx += colW.date

    doc.setTextColor(0, 0, 0)
    f('bold', 13)
    doc.text(
      amt ? amt.toLocaleString() : '-',
      cx + colW.amount - 2,
      y,
      { align: 'right' }
    )
    f('normal', 13)

    // เส้นแบ่งแถว
    y += 1.5
    doc.setDrawColor(235, 235, 235)
    doc.line(L, y, L + totalW, y)
    y += 5.5
    order++
  }

  // ─── Footer รวม ───────────────────────────────────────────
  y += 3
  doc.setDrawColor(16, 185, 130)
  doc.setLineWidth(0.6)
  doc.line(L, y, L + totalW, y)
  y += 1

  doc.setFillColor(240, 253, 244)
  doc.rect(L, y, totalW, 10, 'F')
  doc.setDrawColor(16, 185, 130)
  doc.setLineWidth(0.4)
  doc.rect(L, y, totalW, 10)

  f('bold', 14)
  doc.setTextColor(5, 150, 105)
  const summaryX = L + colW.no + colW.name + colW.cur + colW.branch
  doc.text(`รวมทั้งหมด  ${rows.length}  ราย`, L + 4, y + 7)
  doc.text('ยอดรวม', summaryX + colW.date / 2, y + 7, { align: 'center' })
  doc.text(
    `${totalAmount.toLocaleString()}  บาท`,
    L + totalW - 2,
    y + 7,
    { align: 'right' }
  )
  doc.setTextColor(0, 0, 0)
  y += 18

  // ─── พิมพ์เมื่อ ───────────────────────────────────────────
  f('normal', 10)
  doc.setTextColor(150, 150, 150)
  doc.text(`พิมพ์เมื่อ: ${new Date().toLocaleString('th-TH')}`, pageW / 2, y, { align: 'center' })

  doc.save('ใบสรุปยอดการสั่งซื้อเครื่องแบบและอุปกรณ์.pdf')
}
// ─── รวม 2 ใบในไฟล์ PDF เดียว (หน้า 1 = ใบรายการสั่งซื้อ, หน้า 2 = ใบแสดงการชำระเงิน) ───
async function generateCombinedTwoPagePDF(row: any) {
  const fontBase64 = await loadThaiFont()
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  if (fontBase64) {
    doc.addFileToVFS('THSarabunNew.ttf', fontBase64)
    doc.addFont('THSarabunNew.ttf', 'THSarabun', 'normal')
    doc.addFont('THSarabunNew.ttf', 'THSarabun', 'bold')
  }

  const pageW = 210
  const margin = 15
  const f = (style: 'normal' | 'bold', size: number) => {
    doc.setFont('THSarabun', style)
    doc.setFontSize(size)
  }

  // ════════════════════════════════════════════════════════
  // หน้า 1 — ใบรายการสั่งซื้อเครื่องแบบ (generateCombinedOrderPDF)
  // ════════════════════════════════════════════════════════

  // ดึงข้อมูล order จาก API
  let orderItems: any[] = []
  let dbData: any = {}
  try {
    const dbRes = await api.get(`/enrollments/orders/${row.เลขบัตรประชาชน}`)
    orderItems = dbRes.data?.data ?? []
  } catch (e) {
    console.warn('โหลด orders ไม่ได้')
  }

  const fullName = `${row.คำนำหน้า || ''}${row.ชื่อ_นามสกุล || ''}`
  let y = 2

  // โลโก้
  try {
    const logoRes = await fetch('/src/assets/loeitech-logo.png')
    const logoBuffer = await logoRes.arrayBuffer()
    const logoBase64 = btoa(String.fromCharCode(...new Uint8Array(logoBuffer)))
    doc.addImage(logoBase64, 'PNG', pageW / 2 - 20, y, 40, 40)
    y += 44
  } catch { y += 5 }

  // Header หน้า 1
  doc.setFillColor(5, 150, 105)
  doc.rect(0, y, pageW, 12, 'F')
  f('bold', 16)
  doc.setTextColor(255, 255, 255)
  doc.text('ใบสั่งซื้อเครื่องแบบและอุปกรณ์', pageW / 2, y + 8.5, { align: 'center' })
  doc.setTextColor(0, 0, 0)
  y += 17

  f('normal', 13)
  doc.text('วิทยาลัยเทคนิคเลย', pageW / 2, y, { align: 'center' })
  y += 6
  f('normal', 11)
  doc.text('272 ถ.เจริญรัฐ ต.กุดป่อง อ.เมือง จ.เลย 42000  โทร 042811591', pageW / 2, y, { align: 'center' })
  y += 5

  doc.setDrawColor(16, 185, 130)
  doc.setLineWidth(0.8)
  doc.line(margin, y, pageW - margin, y)
  y += 8

  // ข้อมูลนักเรียน
  doc.setFillColor(240, 253, 244)
  doc.setDrawColor(16, 185, 130)
  doc.setLineWidth(0.3)
  doc.roundedRect(margin, y, pageW - margin * 2, 22, 3, 3, 'FD')

  f('bold', 11)
  doc.setTextColor(80, 80, 80)
  doc.text('ชื่อ-นามสกุล', margin + 3, y + 7)
  f('normal', 13)
  doc.setTextColor(0, 0, 0)
  doc.text(fullName, margin + 3, y + 14)

  f('bold', 11)
  doc.setTextColor(80, 80, 80)
  doc.text('หลักสูตร', pageW / 2 - 40, y + 7)
  f('normal', 13)
  doc.setTextColor(0, 0, 0)
  doc.text(row.หลักสูตร || '-', pageW / 2 - 40, y + 14)

  f('bold', 11)
  doc.setTextColor(80, 80, 80)
  doc.text('สาขาวิชา', pageW / 2 + 20, y + 7)
  f('normal', 12)
  doc.setTextColor(0, 0, 0)
  const branchLine = doc.splitTextToSize(row.สาขาวิชา || '-', 55)
  doc.text(branchLine[0], pageW / 2 + 20, y + 14)
  y += 28

  // ตารางรายการสั่งซื้อ
  const colW = { no: 12, name: 68, size: 22, qty: 18, price: 25, total: 25 }
  const totalTableW = Object.values(colW).reduce((a, b) => a + b, 0)
  const rowH = 8

  // หัวตาราง
  doc.setFillColor(5, 150, 105)
  doc.rect(margin, y, totalTableW, rowH, 'F')
  f('bold', 12)
  doc.setTextColor(255, 255, 255)
  let cx = margin
  const headers = [
    { label: 'ลำดับ', w: colW.no, align: 'center' as const },
    { label: 'รายการ', w: colW.name, align: 'center' as const },
    { label: 'ขนาด', w: colW.size, align: 'center' as const },
    { label: 'จำนวน', w: colW.qty, align: 'center' as const },
    { label: 'ราคา/หน่วย', w: colW.price, align: 'center' as const },
    { label: 'รวม', w: colW.total, align: 'center' as const },
  ]
  headers.forEach(h => {
    doc.text(h.label, cx + h.w / 2, y + 5.5, { align: h.align })
    cx += h.w
  })
  doc.setTextColor(0, 0, 0)
  y += rowH

  // แถวข้อมูล
  const displayItems = orderItems.length > 0 ? orderItems : Array(6).fill(null)
  let grandTotal = 0

  displayItems.forEach((item, idx) => {
    const isEven = idx % 2 === 0
    doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252)
    doc.rect(margin, y, totalTableW, rowH, 'F')
    doc.setDrawColor(220, 220, 220)
    doc.setLineWidth(0.2)
    doc.rect(margin, y, totalTableW, rowH, 'S')

    if (item) {
      const total = Number(item.total_price) || 0
      grandTotal += total
      cx = margin
      f('normal', 11)
      doc.text(String(idx + 1), cx + colW.no / 2, y + 5.5, { align: 'center' }); cx += colW.no
      doc.text(String(item.item_name || ''), cx + 2, y + 5.5); cx += colW.name
      doc.text(String(item.size || '-'), cx + colW.size / 2, y + 5.5, { align: 'center' }); cx += colW.size
      doc.text(String(item.quantity || ''), cx + colW.qty / 2, y + 5.5, { align: 'center' }); cx += colW.qty
      doc.text(Number(item.unit_price || 0).toLocaleString(), cx + colW.price - 2, y + 5.5, { align: 'right' }); cx += colW.price
      doc.text(total.toLocaleString(), cx + colW.total - 2, y + 5.5, { align: 'right' })
    } else {
      // แถวว่าง — แค่ใส่เลขลำดับ
      f('normal', 11)
      doc.text(String(idx + 1), margin + colW.no / 2, y + 5.5, { align: 'center' })
    }
    y += rowH
  })

  // แถวรวม
  doc.setFillColor(240, 253, 244)
  doc.setDrawColor(16, 185, 130)
  doc.setLineWidth(0.4)
  doc.rect(margin, y, totalTableW, rowH + 2, 'FD')
  f('bold', 13)
  doc.setTextColor(5, 150, 105)
  const sumX = margin + colW.no + colW.name + colW.size + colW.qty + colW.price
  doc.text('รวมทั้งสิ้น', sumX - 3, y + 6.5, { align: 'right' })
  doc.text(`${grandTotal.toLocaleString()} บาท`, margin + totalTableW - 2, y + 6.5, { align: 'right' })
  doc.setTextColor(0, 0, 0)
  y += rowH + 10

  // ลายเซ็น
  const sigW = (pageW - margin * 2 - 10) / 2
  doc.setDrawColor(150, 150, 150)
  doc.setLineWidth(0.3)
  doc.line(margin + 10, y + 14, margin + sigW - 10, y + 14)
  doc.line(margin + sigW + 20, y + 14, margin + sigW * 2, y + 14)
  f('normal', 12)
  doc.setTextColor(80, 80, 80)
  doc.text('ลายมือชื่อผู้ปกครอง', margin + sigW / 2, y + 20, { align: 'center' })
  doc.text('ลายมือชื่อนักเรียน', margin + sigW + 10 + sigW / 2, y + 20, { align: 'center' })
  doc.text('วันที่ ......../......../..........', margin + sigW / 2, y + 27, { align: 'center' })
  doc.text('วันที่ ......../......../..........', margin + sigW + 10 + sigW / 2, y + 27, { align: 'center' })
  doc.setTextColor(0, 0, 0)

  // Footer หน้า 1
  f('normal', 9)
  doc.setTextColor(150, 150, 150)
  doc.text(`พิมพ์เมื่อ: ${new Date().toLocaleString('th-TH')}`, pageW / 2, 290, { align: 'center' })
  doc.text('หน้า 1 / 2', pageW - margin, 290, { align: 'right' })
  doc.setTextColor(0, 0, 0)

  // ════════════════════════════════════════════════════════
  // หน้า 2 — ใบแสดงการชำระเงิน (generatePaymentReceiptPDF)
  // ════════════════════════════════════════════════════════
  doc.addPage()
  y = 2

  // ดึง dbData สำหรับหน้า 2
  try {
    const dbRes = await api.get(`/admin/applicants/detail/${row.เลขบัตรประชาชน}`)
    dbData = dbRes.data?.data || {}
  } catch { /* ผ่าน */ }

  // โลโก้
  try {
    const logoRes = await fetch('/src/assets/loeitech-logo.png')
    const logoBuffer = await logoRes.arrayBuffer()
    const logoBase64 = btoa(String.fromCharCode(...new Uint8Array(logoBuffer)))
    doc.addImage(logoBase64, 'PNG', pageW / 2 - 20, y, 40, 40)
    y += 45
  } catch { y += 5 }

  // Header หน้า 2
  f('bold', 24)
  doc.text('ใบแสดงการชำระเงิน', pageW / 2, y, { align: 'center' })
  y += 9
  f('normal', 15)
  doc.text('วิทยาลัยเทคนิคเลย — ระบบรับสมัครนักเรียนนักศึกษาออนไลน์', pageW / 2, y, { align: 'center' })
  y += 8

  doc.setDrawColor(16, 185, 130)
  doc.setLineWidth(0.8)
  doc.line(margin, y, pageW - margin, y)
  y += 10

  // Layout 2 คอลัมน์
  const colLeftX = margin
  const colLeftW = 108
  const colRightX = margin + colLeftW + 5
  const colRightW = pageW - colRightX - margin
  const sectionStartY = y

  // คอลัมน์ซ้าย — ข้อมูลผู้สมัคร
  f('bold', 13)
  doc.setTextColor(5, 150, 105)
  doc.text('ข้อมูลผู้สมัคร', colLeftX, y)
  doc.setTextColor(0, 0, 0)
  y += 7

  const infoFields = [
    { label: 'ชื่อ-สกุล', value: fullName },
    { label: 'หมายเลขประจำตัว', value: row.เลขบัตรประชาชน || dbData.id_card_number || '-' },
    { label: 'หลักสูตร', value: row.หลักสูตร || '-' },
    { label: 'สาขาวิชา', value: row.สาขาวิชา || '-' },
  ]
  for (const field of infoFields) {
    f('bold', 11)
    doc.setTextColor(80, 80, 80)
    doc.text(field.label, colLeftX, y)
    y += 5
    f('normal', 13)
    doc.setTextColor(0, 0, 0)
    const lines = doc.splitTextToSize(field.value ?? '-', colLeftW - 2)
    doc.text(lines, colLeftX, y)
    y += lines.length * 6 + 2
  }

  y += 2
  doc.setDrawColor(220, 220, 220)
  doc.setLineWidth(0.3)
  doc.line(colLeftX, y, colLeftX + colLeftW, y)
  y += 7

  f('bold', 13)
  doc.setTextColor(5, 150, 105)
  doc.text('ข้อมูลการชำระเงิน', colLeftX, y)
  doc.setTextColor(0, 0, 0)
  y += 7

  const payFields = [
    { label: 'ยอดที่ชำระ', value: row.ยอดชำระ ? `${Number(row.ยอดชำระ).toLocaleString()} บาท` : '-' },
    { label: 'วันที่ชำระเงิน', value: row.วันที่ชำระ || '-' },
    { label: 'ชื่อผู้โอน', value: dbData.slip_sender ?? '-' },
    { label: 'ธนาคารผู้รับ', value: dbData.slip_receiver ?? '-' },
  ]
  for (const field of payFields) {
    f('bold', 11)
    doc.setTextColor(80, 80, 80)
    doc.text(field.label, colLeftX, y)
    y += 5
    f('normal', 13)
    doc.setTextColor(0, 0, 0)
    doc.text(field.value ?? '-', colLeftX, y)
    y += 8
  }

  // คอลัมน์ขวา — รูปสลิป
  const boxH = 100
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.4)
  doc.setFillColor(249, 250, 251)
  doc.roundedRect(colRightX, sectionStartY, colRightW, boxH, 3, 3, 'FD')
  f('bold', 11)
  doc.setTextColor(100, 100, 100)
  doc.text('หลักฐานการชำระเงิน', colRightX + colRightW / 2, sectionStartY + 7, { align: 'center' })
  doc.setTextColor(0, 0, 0)

  if (row._slipUrl) {
    try {
      const imgRes = await fetch(row._slipUrl)
      const imgBuffer = await imgRes.arrayBuffer()
      const imgBytes = new Uint8Array(imgBuffer)
      let binary = ''
      imgBytes.forEach(b => binary += String.fromCharCode(b))
      const imgBase64 = btoa(binary)
      const isPng = row._slipUrl.toLowerCase().includes('.png')
      doc.addImage(imgBase64, isPng ? 'PNG' : 'JPEG', colRightX + 3, sectionStartY + 11, colRightW - 6, boxH - 14)
    } catch {
      f('normal', 11)
      doc.setTextColor(150, 150, 150)
      doc.text('ไม่สามารถโหลดรูปสลิปได้', colRightX + colRightW / 2, sectionStartY + 55, { align: 'center' })
      doc.setTextColor(0, 0, 0)
    }
  } else {
    f('normal', 11)
    doc.setTextColor(150, 150, 150)
    doc.text('ไม่พบหลักฐานการชำระเงิน', colRightX + colRightW / 2, sectionStartY + 55, { align: 'center' })
    doc.setTextColor(0, 0, 0)
  }

  y = Math.max(y, sectionStartY + boxH + 8)

  // กล่องสถานะ
  doc.setFillColor(240, 253, 244)
  doc.setDrawColor(16, 185, 130)
  doc.setLineWidth(0.5)
  doc.roundedRect(margin, y, pageW - margin * 2, 14, 3, 3, 'FD')
  f('bold', 14)
  doc.setTextColor(5, 150, 105)
  doc.text('สถานะ: ชำระเงินเรียบร้อยแล้ว ✓', pageW / 2, y + 9, { align: 'center' })
  doc.setTextColor(0, 0, 0)
  y += 20

  // กล่องหมายเหตุ
  doc.setFillColor(255, 251, 235)
  doc.setDrawColor(251, 191, 36)
  doc.setLineWidth(0.4)
  doc.roundedRect(margin, y, pageW - margin * 2, 24, 3, 3, 'FD')
  f('bold', 13)
  doc.setTextColor(146, 64, 14)
  doc.text('หมายเหตุ', margin + 4, y + 7)
  f('normal', 12)
  doc.text('1. เอกสารนี้ไม่ใช่ใบเสร็จรับเงิน', margin + 4, y + 14)
  doc.text('2. โปรดนำเอกสารนี้ติดต่อขอรับใบเสร็จรับเงินฉบับจริงที่งานการเงิน วิทยาลัยเทคนิคเลย', margin + 4, y + 21)
  doc.setTextColor(0, 0, 0)
  y += 30

  // Footer หน้า 2
  f('normal', 10)
  doc.setTextColor(150, 150, 150)
  doc.text(`พิมพ์เมื่อ: ${new Date().toLocaleString('th-TH')}`, pageW / 2, y, { align: 'center' })
  doc.text('หน้า 2 / 2', pageW - margin, y, { align: 'right' })

  // ════════════════════════════════════════════════════════
  // บันทึกไฟล์เดียว
  // ════════════════════════════════════════════════════════
  doc.save(`ใบรายการ-${fullName}.pdf`)
}


async function generateOrderPageOnlyPDF(row: any) {
  const fontBase64 = await loadThaiFont()
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  if (fontBase64) {
    doc.addFileToVFS('THSarabunNew.ttf', fontBase64)
    doc.addFont('THSarabunNew.ttf', 'THSarabun', 'normal')
    doc.addFont('THSarabunNew.ttf', 'THSarabun', 'bold')
  }

  const pageW = 210
  const margin = 15
  const f = (style: 'normal' | 'bold', size: number) => {
    doc.setFont('THSarabun', style)
    doc.setFontSize(size)
  }

  // ดึงข้อมูล order
  let orderItems: any[] = []
  try {
     const dbRes = await api.get(`/enrollments/orders/${row.เลขบัตรประชาชน}`)
     console.log('orders response:', dbRes.data)
orderItems = dbRes.data?.data ?? []
     console.log('orderItems:', orderItems)
  } catch (e) {
    console.error('orders error:', e) // ← ดู error
  }

  const fullName = `${row.คำนำหน้า || ''}${row.ชื่อ_นามสกุล || ''}`
  let y = 2

  // โลโก้
  try {
    const logoRes = await fetch('/src/assets/loeitech-logo.png')
    const logoBuffer = await logoRes.arrayBuffer()
    const logoBase64 = btoa(String.fromCharCode(...new Uint8Array(logoBuffer)))
    doc.addImage(logoBase64, 'PNG', pageW / 2 - 20, y, 40, 40)
    y += 44
  } catch { y += 5 }

  // Header
  doc.setFillColor(5, 150, 105)
  doc.rect(0, y, pageW, 12, 'F')
  f('bold', 16)
  doc.setTextColor(255, 255, 255)
  doc.text('ใบสั่งซื้อเครื่องแบบและอุปกรณ์', pageW / 2, y + 8.5, { align: 'center' })
  doc.setTextColor(0, 0, 0)
  y += 17

  f('normal', 13)
  doc.text('วิทยาลัยเทคนิคเลย', pageW / 2, y, { align: 'center' })
  y += 6
  f('normal', 11)
  doc.text('272 ถ.เจริญรัฐ ต.กุดป่อง อ.เมือง จ.เลย 42000  โทร 042811591', pageW / 2, y, { align: 'center' })
  y += 5

  doc.setDrawColor(16, 185, 130)
  doc.setLineWidth(0.8)
  doc.line(margin, y, pageW - margin, y)
  y += 8

  // ข้อมูลนักเรียน
  doc.setFillColor(240, 253, 244)
  doc.setDrawColor(16, 185, 130)
  doc.setLineWidth(0.3)
  doc.roundedRect(margin, y, pageW - margin * 2, 22, 3, 3, 'FD')

  f('bold', 11)
  doc.setTextColor(80, 80, 80)
  doc.text('ชื่อ-นามสกุล', margin + 3, y + 7)
  f('normal', 13)
  doc.setTextColor(0, 0, 0)
  doc.text(fullName, margin + 3, y + 14)

  f('bold', 11)
  doc.setTextColor(80, 80, 80)
  doc.text('หลักสูตร', pageW / 2 - 40, y + 7)
  f('normal', 13)
  doc.setTextColor(0, 0, 0)
  doc.text(row.หลักสูตร || '-', pageW / 2 - 40, y + 14)

  f('bold', 11)
  doc.setTextColor(80, 80, 80)
  doc.text('สาขาวิชา', pageW / 2 + 20, y + 7)
  f('normal', 12)
  doc.setTextColor(0, 0, 0)
  const branchLine = doc.splitTextToSize(row.สาขาวิชา || '-', 55)
  doc.text(branchLine[0], pageW / 2 + 20, y + 14)
  y += 28

  // ตารางรายการสั่งซื้อ
  const colW = { no: 12, name: 68, size: 22, qty: 18, price: 25, total: 25 }
  const totalTableW = Object.values(colW).reduce((a, b) => a + b, 0)
  const rowH = 8

  // หัวตาราง
  doc.setFillColor(5, 150, 105)
  doc.rect(margin, y, totalTableW, rowH, 'F')
  f('bold', 12)
  doc.setTextColor(255, 255, 255)
  let cx = margin
  const headers = [
    { label: 'ลำดับ', w: colW.no },
    { label: 'รายการ', w: colW.name },
    { label: 'ขนาด', w: colW.size },
    { label: 'จำนวน', w: colW.qty },
    { label: 'ราคา/หน่วย', w: colW.price },
    { label: 'รวม', w: colW.total },
  ]
  headers.forEach(h => {
    doc.text(h.label, cx + h.w / 2, y + 5.5, { align: 'center' })
    cx += h.w
  })
  doc.setTextColor(0, 0, 0)
  y += rowH

  // แถวข้อมูล
  const displayItems = orderItems.length > 0 ? orderItems : Array(6).fill(null)
  let grandTotal = 0

  displayItems.forEach((item, idx) => {
    const isEven = idx % 2 === 0
    doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252)
    doc.rect(margin, y, totalTableW, rowH, 'F')
    doc.setDrawColor(220, 220, 220)
    doc.setLineWidth(0.2)
    doc.rect(margin, y, totalTableW, rowH, 'S')

    if (item) {
      const total = Number(item.total_price) || 0
      grandTotal += total
      cx = margin
      f('normal', 11)
      doc.text(String(idx + 1), cx + colW.no / 2, y + 5.5, { align: 'center' }); cx += colW.no
      doc.text(String(item.item_name || ''), cx + 2, y + 5.5); cx += colW.name
      doc.text(String(item.size || '-'), cx + colW.size / 2, y + 5.5, { align: 'center' }); cx += colW.size
      doc.text(String(item.quantity || ''), cx + colW.qty / 2, y + 5.5, { align: 'center' }); cx += colW.qty
      doc.text(Number(item.unit_price || 0).toLocaleString(), cx + colW.price - 2, y + 5.5, { align: 'right' }); cx += colW.price
      doc.text(total.toLocaleString(), cx + colW.total - 2, y + 5.5, { align: 'right' })
    } else {
      f('normal', 11)
      doc.text(String(idx + 1), margin + colW.no / 2, y + 5.5, { align: 'center' })
    }
    y += rowH
  })

  // แถวรวม
  doc.setFillColor(240, 253, 244)
  doc.setDrawColor(16, 185, 130)
  doc.setLineWidth(0.4)
  doc.rect(margin, y, totalTableW, rowH + 2, 'FD')
  f('bold', 13)
  doc.setTextColor(5, 150, 105)
  const sumX = margin + colW.no + colW.name + colW.size + colW.qty + colW.price
  doc.text('รวมทั้งสิ้น', sumX - 3, y + 6.5, { align: 'right' })
  doc.text(`${grandTotal.toLocaleString()} บาท`, margin + totalTableW - 2, y + 6.5, { align: 'right' })
  doc.setTextColor(0, 0, 0)
  y += rowH + 10

  // ลายเซ็น
  const sigW = (pageW - margin * 2 - 10) / 2
  doc.setDrawColor(150, 150, 150)
  doc.setLineWidth(0.3)
  doc.line(margin + 10, y + 14, margin + sigW - 10, y + 14)
  doc.line(margin + sigW + 20, y + 14, margin + sigW * 2, y + 14)
  f('normal', 12)
  doc.setTextColor(80, 80, 80)
  doc.text('ลายมือชื่อผู้ปกครอง', margin + sigW / 2, y + 20, { align: 'center' })
  doc.text('ลายมือชื่อนักเรียน', margin + sigW + 10 + sigW / 2, y + 20, { align: 'center' })
  doc.text('วันที่ ......../......../..........', margin + sigW / 2, y + 27, { align: 'center' })
  doc.text('วันที่ ......../......../..........', margin + sigW + 10 + sigW / 2, y + 27, { align: 'center' })
  doc.setTextColor(0, 0, 0)

  // Footer
  f('normal', 9)
  doc.setTextColor(150, 150, 150)
  doc.text(`พิมพ์เมื่อ: ${new Date().toLocaleString('th-TH')}`, pageW / 2, 290, { align: 'center' })
  doc.setTextColor(0, 0, 0)

  // ← ไม่มี doc.addPage() และหน้า 2 แล้ว
  doc.save(`ใบสั่งซื้อเครื่องแบบ-${fullName}.pdf`)
}
</script>