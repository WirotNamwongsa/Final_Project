<template>
  <div>
    <div class="mb-6 space-y-3">
      <!-- Row 1: หัวข้อ + ปุ่มเพิ่ม -->
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-semibold text-gray-800">จัดการค่าใช้จ่าย</h2>
        <button @click="showAddModal = true"
          class="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-1.5 text-sm font-medium shadow-sm">
          <PlusIcon class="w-4 h-4" />
          เพิ่มรายการค่าใช้จ่าย
        </button>
      </div>

      <!-- Row 2: Filter tabs -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <!-- Tab buttons -->
          <div class="flex bg-gray-100 p-1 rounded-xl gap-1">
            <button v-for="tab in filterTabs" :key="tab.value" @click="selectedFilter = tab.value" :class="[
              'relative px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-200 flex items-center gap-1.5',
              selectedFilter === tab.value
                ? 'bg-white text-emerald-700 shadow-sm ring-1 ring-emerald-100'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            ]">
              <span>{{ tab.label }}</span>
              <span :class="[
                'inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold transition-colors',
                selectedFilter === tab.value
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-gray-200 text-gray-500'
              ]">
                {{tab.value === 'all'
                  ? expenses.length
                  : expenses.filter(e => {
                    const id = e.curriculum?.cur_id
                    if (tab.value === 'pavoc') return id === 1
                    if (tab.value === 'pavas_direct') return id === 2
                    if (tab.value === 'pavas_m6') return id === 2
                return false
                }).length
                }}
              </span>
            </button>
          </div>
        </div>

        <!-- จำนวนที่กรอง -->
        <span class="text-xs text-gray-400">
          แสดง <span class="font-semibold text-gray-600">{{ filteredExpenses.length }}</span> รายการ
        </span>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center items-center py-16">
      <div class="flex flex-col items-center gap-3">
        <div class="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p class="text-gray-500 text-sm">กำลังโหลดข้อมูล...</p>
      </div>
    </div>

    <!-- Table -->
    <div v-else class="overflow-x-auto overflow-y-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="w-16 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ลำดับ</th>
            <th class="w-64 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อรายการ
            </th>
            <th class="w-48 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">หลักสูตร
            </th>
            <th class="w-32 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ราคา</th>
            <th class="w-40 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ประเภทการชำระ</th>
            <th class="w-32 px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">รูปภาพ
            </th>
            <th class="w-36 px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200 overflow-hidden">
          <tr v-if="filteredExpenses.length === 0">

            <td colspan="7" class="px-4 py-16 text-center">
              <div class="flex flex-col items-center gap-3">
                <div class="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg class="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p class="text-gray-500 text-sm">ไม่พบข้อมูลค่าใช้จ่าย</p>
              </div>
            </td>
          </tr>
          <tr v-for="(expense, index) in filteredExpenses" :key="selectedFilter + expense.exp_id"
            class="hover:bg-gray-50 transition-colors row-animate" :style="{ animationDelay: `${index * 40}ms` }">
            <td class="px-4 py-3 text-sm text-gray-900 text-center">
              <div
                class="inline-flex items-center justify-center w-8 h-8 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium">
                {{ index + 1 }}
              </div>
            </td>
            <td class="px-4 py-3 text-sm text-gray-900">
              <div>
                <div class="font-medium">{{ expense.exp_name }}</div>
                <div class="text-gray-500 text-xs">
                  {{ expense.exp_detail.length > 50 ? expense.exp_detail.substring(0, 50) + '...' : expense.exp_detail
                  }}
                </div>
                <div v-if="expense.exp_sizes && expense.exp_sizes.length > 0" class="flex flex-wrap gap-1 mt-1">
                  <span v-for="size in expense.exp_sizes" :key="size"
                    class="inline-flex items-center px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs">
                    {{ size }}
                  </span>
                </div>
              </div>
            </td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
              {{ expense.curriculum?.cur_shortname ?? '-' }}
            </td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
              {{ expense.exp_cost.toLocaleString() }} บาท
            </td>
            <td class="px-4 py-3 whitespace-nowrap text-sm">
              <span :class="[
                'inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full',
                expense.payment_type === 'mandatory'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-600'
              ]">
                {{ expense.payment_type === 'mandatory' ? 'บังคับชำระ' : 'ไม่บังคับชำระ' }}
              </span>
            </td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-center">
              <template v-if="expense.exp_img">
                <button @click="viewImage(expense.exp_img!)"
                  class="inline-flex items-center px-3 py-1 bg-emerald-500 text-white text-xs rounded hover:bg-emerald-600 transition-colors">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  ดูรูปภาพ
                </button>
              </template>
              <span v-else
                class="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-400">
                ไม่ได้อัปโหลด
              </span>
            </td>
            <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-center">
              <div class="flex justify-center items-center gap-1">
                <button @click="editExpense(expense)"
                  class="inline-flex items-center px-2 py-1.5 bg-emerald-50 text-emerald-600 rounded hover:bg-emerald-100 transition-colors"
                  title="แก้ไข">
                  <PencilIcon class="w-3.5 h-3.5" />
                </button>
                <button @click="openDeleteModal(expense)"
                  class="inline-flex items-center px-2 py-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                  title="ลบ">
                  <TrashIcon class="w-3.5 h-3.5" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Toast -->
    <Teleport to="body">
      <transition name="toast">
        <div v-if="toast.show"
          class="fixed top-4 right-4 z-[99999] flex items-center space-x-3 px-6 py-4 rounded-xl shadow-2xl text-white"
          :class="toast.type === 'success' ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-pink-600'">
          <svg v-if="toast.type === 'success'" class="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor"
            viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <svg v-else class="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <div>
            <p class="font-semibold">{{ toast.title }}</p>
            <p class="text-sm opacity-90">{{ toast.message }}</p>
          </div>
        </div>
      </transition>
    </Teleport>

    <!-- Add / Edit Modal -->
    <Teleport to="body">
      <transition name="modal">
        <div v-if="showAddModal || showEditModal" class="fixed inset-0 z-[9999] overflow-y-auto">
          <div class="fixed inset-0 z-[9998]" style="background-color: rgba(0,0,0,0.3);" @click="closeModal"></div>
          <div class="flex items-center justify-center min-h-screen px-4 py-8">
            <div class="relative bg-white rounded-lg shadow-xl w-full sm:max-w-lg z-[10000]">
              <form @submit.prevent="handleSubmit">
                <div class="bg-white px-6 pt-6 pb-4 rounded-t-lg">
                  <h3 class="text-lg font-bold text-gray-900 mb-4">
                    {{ showAddModal ? 'เพิ่มรายการค่าใช้จ่าย' : 'แก้ไขรายการค่าใช้จ่าย' }}
                  </h3>
                  <div class="space-y-4">

                    <!-- ชื่อรายการ -->
                    <div>
                      <label class="block text-gray-700 text-sm font-bold mb-2">ชื่อรายการค่าใช้จ่าย</label>
                      <input v-model="formData.exp_name" type="text"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                        required />
                    </div>

                    <!-- รายละเอียด -->
                    <div>
                      <label class="block text-gray-700 text-sm font-bold mb-2">รายละเอียด</label>
                      <textarea v-model="formData.exp_detail" rows="3"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                        required></textarea>
                    </div>

                    <!-- หลักสูตร + ประเภทชำระ -->
                    <div class="grid grid-cols-2 gap-3">
                      <div>
                        <label class="block text-gray-700 text-sm font-bold mb-2">หลักสูตร</label>
                        <select v-model="formData.cur_id"
                          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                          required>
                          <option value="">เลือกหลักสูตร</option>
                          <option v-for="curriculum in curriculums" :key="curriculum.cur_id" :value="curriculum.cur_id">
                            {{ curriculum.cur_name }}
                          </option>
                        </select>
                      </div>
                      <div>
                        <label class="block text-gray-700 text-sm font-bold mb-2">ประเภทการชำระเงิน</label>
                        <select v-model="formData.payment_type"
                          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                          required>
                          <option value="">เลือกประเภท</option>
                          <option value="mandatory">บังคับชำระ</option>
                          <option value="optional">ไม่บังคับชำระ</option>
                        </select>
                      </div>
                    </div>

                    <!-- ราคา -->
                    <div>
                      <label class="block text-gray-700 text-sm font-bold mb-2">ราคาต่อหน่วย (บาท)</label>
                      <input v-model.number="formData.exp_cost" type="number" step="0.01" min="0"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                        required />
                    </div>

                    <!-- รูปภาพ -->
                    <div>
                      <label class="block text-gray-700 text-sm font-bold mb-2">รูปภาพ</label>
                      <div
                        class="relative border-2 border-dashed rounded-xl overflow-hidden transition-colors cursor-pointer"
                        :class="(imagePreview || originalImgUrl) ? 'border-emerald-300 hover:border-emerald-400' : 'border-gray-300 hover:border-emerald-400'"
                        @click="triggerFileInput">
                        <!-- มีรูปแล้ว -->
                        <div v-if="imagePreview || originalImgUrl" class="relative group">
                          <img :src="imagePreview || getImageUrl(originalImgUrl)" alt="รูปภาพ"
                            class="w-full h-48 object-contain bg-gray-50" />
                          <div
                            class="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                            <span
                              class="text-white text-sm font-medium bg-black/50 px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                              คลิกเพื่อเปลี่ยนรูป
                            </span>
                          </div>
                          <button type="button" @click.stop="clearImage"
                            class="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>

                        <!-- ยังไม่มีรูป -->
                        <div v-else class="flex flex-col items-center justify-center py-10 gap-2 text-gray-400">
                          <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p class="text-sm font-medium">คลิกเพื่ออัปโหลดรูปภาพ</p>
                          <p class="text-xs">PNG, JPG ขนาดไม่เกิน 5MB</p>
                        </div>
                      </div>
                      <input ref="fileInputRef" type="file" accept="image/*" class="hidden"
                        @change="handleImageUpload" />
                    </div>


                    <!-- ขนาดเสื้อ -->
                    <div class="border border-gray-200 rounded-xl  overflow-hidden">
                      <div
                        class="flex items-center justify-between px-4 py-2.5 bg-gray-50 cursor-pointer hover:bg-emerald-100 transition-colors duration-200 select-none"
                        @click="showSizeSection = !showSizeSection">
                        <div class="flex items-center gap-2">
                          <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.57a2 2 0 00-1.34-2.23z" />
                          </svg>
                          <span class="text-sm font-bold text-gray-700">ขนาดเสื้อ</span>
                          <span class="text-xs text-gray-400">(ถ้าไม่มีให้เว้นว่าง)</span>
                        </div>
                        <svg class="w-4 h-4 text-gray-500 transition-transform duration-300"
                          :class="showSizeSection ? 'rotate-180 text-emerald-500' : ''" fill="none"
                          stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>

                      <div v-if="showSizeSection" class="px-4 py-3 space-y-3">
                        <!-- Tags ที่เพิ่มแล้ว -->
                        <div class="flex flex-wrap gap-2 min-h-[28px]">
                          <span v-for="size in formData.exp_sizes" :key="size"
                            class="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium">
                            {{ size }}
                            <button type="button" @click="removeSize(size)"
                              class="text-emerald-500 hover:text-red-500 transition-colors leading-none text-base">×</button>
                          </span>
                          <span v-if="formData.exp_sizes.length === 0" class="text-xs text-gray-400 self-center">
                            ยังไม่ได้เลือกไซส์
                          </span>
                        </div>

                        <!-- M / L / XL -->
                        <div class="space-y-2">
                          <div v-for="size in SIZES_WITH_NUMBER" :key="size" class="flex items-center gap-2">
                            <span class="w-8 text-sm font-semibold text-gray-700 shrink-0">{{ size }}</span>
                            <input v-model="sizeNumbers[size]" type="text" inputmode="numeric" placeholder="เบอร์"
                              class="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                              @keydown.enter.prevent="addSizeWithNumber(size)" @blur="addSizeWithNumber(size)"
                              @keypress="(e) => { if (!/^\d$/.test(e.key)) e.preventDefault() }" />
                          </div>
                        </div>

                        <!-- พิเศษ -->
                        <div class="pt-2 border-t border-gray-100 flex items-center gap-3">
                          <button type="button" @click="toggleSpecial" :class="[
                            'px-5 py-2 rounded-lg text-sm font-medium border transition-colors',
                            formData.exp_sizes.includes('พิเศษ')
                              ? 'bg-emerald-500 text-white border-emerald-500'
                              : 'bg-white text-gray-600 border-gray-300 hover:border-emerald-400 hover:text-emerald-600'
                          ]">
                            {{ formData.exp_sizes.includes('พิเศษ') ? '✓ พิเศษ' : 'พิเศษ' }}
                          </button>
                          <span class="text-xs text-gray-400">ไม่ต้องระบุเบอร์</span>
                        </div>
                      </div>
                    </div>


                  </div>
                </div>

                <div class="bg-gray-50 px-6 py-4 rounded-b-lg flex flex-row-reverse gap-3">
                  <button type="submit" :disabled="isSubmitting"
                    class="inline-flex justify-center rounded-lg px-4 py-2 bg-emerald-500 text-sm font-medium text-white hover:bg-emerald-600 transition-colors disabled:opacity-50">
                    {{ isSubmitting ? 'กำลังบันทึก...' : (showAddModal ? 'เพิ่ม' : 'บันทึก') }}
                  </button>
                  <button type="button" @click="closeModal"
                    class="inline-flex justify-center rounded-lg border border-gray-300 px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                    ยกเลิก
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>

    <!-- View Image Modal -->
    <Teleport to="body">
      <transition name="modal">
        <div v-if="viewingImage" class="fixed inset-0 z-[99999] flex items-center justify-center px-4">
          <div class="fixed inset-0 bg-black/70" @click="viewingImage = ''"></div>
          <div class="relative z-[100000] w-full max-w-md">

            <!-- ปุ่มปิด -->
            <button @click="viewingImage = ''"
              class="absolute -top-4 -right-4 z-10 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-125 hover:bg-red-500 hover:text-white text-gray-600">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <!-- Loading -->
            <div v-if="imageLoading" class="flex items-center justify-center h-48">
              <div class="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>

            <!-- รูปภาพ -->
            <img :src="viewingImage" alt="รูปภาพ" class="w-full max-h-[75vh] object-contain rounded-xl shadow-2xl"
              :class="imageLoading ? 'hidden' : 'block'" @load="imageLoading = false" @error="imageLoading = false" />
          </div>
        </div>
      </transition>
    </Teleport>

    <!-- Delete Modal -->
    <Teleport to="body">
      <transition name="modal">
        <div v-if="showDeleteModal" class="fixed inset-0 z-[9999] flex items-center justify-center px-4">
          <div class="fixed inset-0 bg-black/40" @click="closeDeleteModal"></div>
          <div class="relative bg-white rounded-xl shadow-xl w-full max-w-md z-[10000]">
            <div class="p-6 border-b border-gray-100">
              <div class="flex items-center">
                <div class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  <TrashIcon class="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 class="text-lg font-bold text-gray-900">ยืนยันการลบรายการค่าใช้จ่าย</h3>
                  <p class="text-sm text-gray-500 mt-0.5">{{ deletingExpense?.exp_name }}</p>
                </div>
              </div>
            </div>
            <div class="p-6 border-b border-gray-100">
              <p class="text-gray-600 text-sm">
                คุณต้องการลบรายการ
                <span class="font-semibold text-gray-900">{{ deletingExpense?.exp_name }}</span>
                ใช่หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้
              </p>
            </div>
            <div class="p-4 flex justify-end gap-3">
              <button @click="closeDeleteModal"
                class="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                ยกเลิก
              </button>
              <button @click="confirmDelete" :disabled="isDeleting"
                class="px-4 py-2 text-sm text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors flex items-center disabled:opacity-50">
                <TrashIcon class="w-4 h-4 mr-2" />
                {{ isDeleting ? 'กำลังลบ...' : 'ยืนยันการลบ' }}
              </button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from 'vue'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/vue/24/outline'
import { apiService } from '@/utils/api'

// ── Constants ──────────────────────────────────────────
const SIZES_WITH_NUMBER = ['S', 'M', 'L', 'XL'] as const

// ── Interfaces ─────────────────────────────────────────
interface Curriculum {
  cur_id: number
  cur_name: string
  cur_shortname: string
}

interface ExpenseDetail {
  exp_id: number
  exp_name: string
  exp_detail: string
  exp_img?: string
  cur_id: number
  exp_cost: number
  payment_type?: string
  exp_sizes?: string[]
  curriculum?: Curriculum
  created_at: string
}

// ── Emits ──────────────────────────────────────────────
const emit = defineEmits(['refresh'])

// ── State ──────────────────────────────────────────────
const expenses = ref<ExpenseDetail[]>([])
const curriculums = ref<Curriculum[]>([])
const isLoading = ref(false)
const isSubmitting = ref(false)
const isDeleting = ref(false)
const imagePreview = ref<string>('')
const viewingImage = ref<string>('')
const fileInputRef = ref<HTMLInputElement | null>(null)

const sizeNumbers = ref<Record<string, string>>({ S: '', M: '', L: '', XL: '' })
const originalImgUrl = ref<string>('')
const originalImagePath = ref<string>('')
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const deletingExpense = ref<ExpenseDetail | null>(null)
const showSizeSection = ref(false)
const imageExplicitlyCleared = ref(false)

const formData = ref({
  exp_id: 0,
  exp_name: '',
  exp_detail: '',
  exp_cost: 0,
  exp_img: '' as string | null,
  cur_id: 0,
  payment_type: '',
  exp_sizes: [] as string[]
})

const toast = ref({
  show: false,
  type: 'success' as 'success' | 'error',
  title: '',
  message: ''
})
let toastTimer: ReturnType<typeof setTimeout> | null = null



const selectedFilter = ref<string>('all')

// ── filter ──────────────────────────────────────────────
const filteredExpenses = computed(() => {
  if (selectedFilter.value === 'all') return expenses.value

  return expenses.value.filter(expense => {
    const curId = expense.curriculum?.cur_id

    if (selectedFilter.value === 'pavoc') return curId === 1
    if (selectedFilter.value === 'pavas_direct') return curId === 2
    if (selectedFilter.value === 'pavas_m6') return curId === 2

    return true
  })
})
const filterTabs = [
  { value: 'all', label: 'ทั้งหมด' },
  { value: 'pavoc', label: 'ปวช' },
  { value: 'pavas_direct', label: 'ปวส (สายตรง)' },
  { value: 'pavas_m6', label: 'ปวส (ม.6)' },
]

// ── Toast ──────────────────────────────────────────────
const showToast = (type: 'success' | 'error', title: string, message: string) => {
  if (toastTimer) clearTimeout(toastTimer)
  toast.value = { show: true, type, title, message }
  toastTimer = setTimeout(() => { toast.value.show = false }, 4000)
}

// ── Image ──────────────────────────────────────────────
const triggerFileInput = () => fileInputRef.value?.click()

const clearImage = () => {
  imagePreview.value = ''
  formData.value.exp_img = ''
  imageExplicitlyCleared.value = true
  originalImgUrl.value = ''  // ล้างเพื่อซ่อนรูปใน UI
  if (fileInputRef.value) fileInputRef.value.value = ''
}


const getImageUrl = (path: string) => {
  if (!path) return ''
  if (path.startsWith('http') || path.startsWith('data:')) return path
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:13001/api'
  const base = apiUrl.replace(/\/api$/, '')
  return `${base}${path}`
}

const imageLoading = ref(false)

const viewImage = (imageUrl: string) => {
  console.log('imageUrl ที่รับมา:', imageUrl)
  const url = getImageUrl(imageUrl)
  console.log('url หลัง getImageUrl:', url)
  console.log('VITE_API_URL:', import.meta.env.VITE_API_URL)
  imageLoading.value = true
  viewingImage.value = url
}

const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target?.result as string
      formData.value.exp_img = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

// ── Sizes ──────────────────────────────────────────────
const addSizeWithNumber = (size: string) => {
  const num = sizeNumbers.value[size]?.trim()
  if (!num) return
  const val = `${size} ${num}`

  const existingIndex = formData.value.exp_sizes.findIndex(s => s.startsWith(`${size} `))
  if (existingIndex !== -1) {
    formData.value.exp_sizes[existingIndex] = val
  } else {
    formData.value.exp_sizes.push(val)
  }

  sizeNumbers.value[size] = ''
}

const toggleSpecial = () => {
  const idx = formData.value.exp_sizes.indexOf('พิเศษ')
  if (idx === -1) {
    formData.value.exp_sizes.push('พิเศษ')
  } else {
    formData.value.exp_sizes.splice(idx, 1)
  }
}

const removeSize = (size: string) => {
  const idx = formData.value.exp_sizes.indexOf(size)
  if (idx !== -1) formData.value.exp_sizes.splice(idx, 1)
}

// ── Fetch ──────────────────────────────────────────────
const fetchExpenses = async () => {
  isLoading.value = true
  try {
    const response = await apiService.getExpenseDetails()
    expenses.value = response.data
  } catch (error) {
    showToast('error', 'โหลดข้อมูลไม่สำเร็จ', 'ไม่สามารถดึงข้อมูลค่าใช้จ่ายได้')
  } finally {
    isLoading.value = false
  }
}

const fetchCurriculums = async () => {
  try {
    const response = await apiService.getCurriculums()
    curriculums.value = response.data
  } catch (error) {
    console.error('Error fetching curriculums:', error)
  }
}

// ── Add / Edit ─────────────────────────────────────────
const handleSubmit = async () => {
  isSubmitting.value = true
  try {
    // Prepare data for submission
    const submitData: any = { ...formData.value }

    // Check image status
    const hasNewImage = Boolean(imagePreview.value && imagePreview.value.trim() !== '')

    if (hasNewImage) {
      submitData.exp_img = imagePreview.value
    } else if (imageExplicitlyCleared.value) {
      submitData.exp_img = ''
    } else {
      delete submitData.exp_img
    }

    if (showAddModal.value) {
      await apiService.createExpenseDetail(submitData)
      showToast('success', 'เพิ่มรายการสำเร็จ', 'ข้อมูลถูกบันทึกเรียบร้อยแล้ว')
    } else {
      await apiService.updateExpenseDetail(formData.value.exp_id, submitData)
      showToast('success', 'แก้ไขรายการสำเร็จ', 'ข้อมูลถูกอัปเดตเรียบร้อยแล้ว')
    }
    await fetchExpenses()
    emit('refresh')
    closeModal()
  } catch (error: any) {
    console.error('Submit error:', error)
    showToast('error', 'บันทึกไม่สำเร็จ', error?.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่')
  } finally {
    isSubmitting.value = false
  }
}

const editExpense = (expense: ExpenseDetail) => {
  // Get curriculum ID from the nested curriculum object
  const curId = expense.curriculum ? Number(expense.curriculum.cur_id) : 0

  formData.value = {
    exp_id: expense.exp_id,
    exp_name: expense.exp_name,
    exp_detail: expense.exp_detail,
    exp_img: '',
    cur_id: curId,
    exp_cost: expense.exp_cost,
    payment_type: expense.payment_type || '',
    exp_sizes: expense.exp_sizes ? [...expense.exp_sizes] : []
  }

  originalImgUrl.value = expense.exp_img || ''
  originalImagePath.value = expense.exp_img || ''

  imagePreview.value = ''
  sizeNumbers.value = { S: '', M: '', L: '', XL: '' }
  showSizeSection.value = expense.exp_sizes ? expense.exp_sizes.length > 0 : false
  imageExplicitlyCleared.value = false

  // Use nextTick to ensure DOM updates
  nextTick(() => {
    showEditModal.value = true
  })
}

const closeModal = () => {
  showAddModal.value = false
  showEditModal.value = false
  showSizeSection.value = false
  imagePreview.value = ''
  originalImgUrl.value = ''
  sizeNumbers.value = { S: '', M: '', L: '', XL: '' }
  imageExplicitlyCleared.value = false
  if (fileInputRef.value) fileInputRef.value.value = ''
  formData.value = {
    exp_id: 0,
    exp_name: '',
    exp_detail: '',
    exp_cost: 0,
    exp_img: '',
    cur_id: 0,
    payment_type: '',
    exp_sizes: []
  }
}

// ── Delete ─────────────────────────────────────────────
const openDeleteModal = (expense: ExpenseDetail) => {
  deletingExpense.value = expense
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  deletingExpense.value = null
}

const confirmDelete = async () => {
  if (!deletingExpense.value) return
  isDeleting.value = true
  try {
    await apiService.deleteExpenseDetail(deletingExpense.value.exp_id)
    showToast('success', 'ลบรายการสำเร็จ', 'ข้อมูลถูกลบจากระบบเรียบร้อยแล้ว')
    await fetchExpenses()
    emit('refresh')
    closeDeleteModal()
  } catch (error: any) {
    showToast('error', 'ลบไม่สำเร็จ', error?.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่')
  } finally {
    isDeleting.value = false
  }
}

// ── Lifecycle ──────────────────────────────────────────
onMounted(() => {
  fetchCurriculums()
  fetchExpenses()
})
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.25s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.96);
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.4s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
@keyframes rowIn {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}

.row-animate {
  animation: rowIn 0.2s ease both;
}
</style>