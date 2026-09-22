<template>
  <div class="max-w-4xl mx-auto">

    <!-- Stepper -->
    <div class="flex items-center justify-between mb-8">
      <div v-for="(step, i) in steps" :key="i" class="flex items-center" :class="i < steps.length - 1 ? 'flex-1' : ''">
        <div class="flex flex-col items-center">
          <div class="w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all" :class="currentStep > i ? 'bg-emerald-500 border-emerald-500 text-white'
            : currentStep === i ? 'bg-emerald-500 border-emerald-500 text-white'
              : 'border-gray-300 text-gray-300 bg-white'">
            <CheckIcon v-if="currentStep > i" class="w-4 h-4" />
            <component v-else :is="step.icon" class="w-4 h-4" />
          </div>
          <p class="text-xs mt-2 font-medium text-center"
            :class="currentStep >= i ? 'text-emerald-600' : 'text-gray-400'">{{ step.label }}</p>
          <p class="text-xs text-gray-400 text-center">{{ step.sub }}</p>
        </div>
        <div v-if="i < steps.length - 1" class="flex-1 h-0.5 mx-2 mb-6 transition-all"
          :class="currentStep > i ? 'bg-emerald-500' : 'bg-gray-200'" />
      </div>
    </div>

    <!-- Hidden inputs shared across all upload fields (outside v-if so always rendered) -->
    <input ref="cameraInputRef" type="file" accept="image/*" capture="environment" class="hidden"
      @change="handleUpload(uploadPicker.field, $event)" />
    <input ref="galleryInputRef" type="file" accept="image/*" class="hidden"
      @change="handleUpload(uploadPicker.field, $event)" />

    <div class="bg-white rounded-2xl shadow-sm p-8">

      <!-- Step 1: ข้อมูลส่วนตัว -->
      <div v-if="currentStep === 0">
        <h2 class="text-lg font-semibold text-gray-700 flex items-center gap-2 mb-6">
          <UserIcon class="w-5 h-5 text-emerald-500" /> ข้อมูลส่วนตัว
        </h2>
        <div class="grid grid-cols-2 gap-4">
          <div class="col-span-2">
            <p class="text-sm font-medium text-gray-700 mb-3">อัพโหลดภาพบัตรประชาชน *</p>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-sm text-gray-600 mb-1 block">ด้านหน้า *</label>
                <div class="upload-box relative cursor-pointer"
                  :class="form.idFront ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200'"
                  @click="openUploadPicker('idFront')">
                  <div v-if="!form.idFrontPreview" class="flex flex-col items-center gap-2 text-gray-400">
                    <PhotoIcon class="w-8 h-8" /><span class="text-xs">คลิกเพื่ออัพโหลด</span>
                  </div>
                  <img v-else :src="form.idFrontPreview" class="w-full h-full object-contain rounded-xl" />
                  <!-- OCR loading overlay -->
                  <div v-if="ocrStatus === 'loading'"
                    class="absolute inset-0 bg-white/75 rounded-xl flex flex-col items-center justify-center gap-2">
                    <svg class="w-6 h-6 animate-spin text-emerald-500" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    <span class="text-xs text-emerald-600 font-medium">กำลังอ่านบัตร...</span>
                  </div>
                </div>
                <!-- OCR status badge -->
                <div v-if="ocrStatus !== 'idle'" class="mt-1.5 flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg"
                  :class="{
                    'bg-emerald-50 text-emerald-600': ocrStatus === 'success',
                    'bg-red-50 text-red-500': ocrStatus === 'error',
                    'bg-gray-50 text-gray-400': ocrStatus === 'loading',
                  }">
                  <svg v-if="ocrStatus === 'success'" class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  <svg v-else-if="ocrStatus === 'error'" class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                  </svg>
                  {{ ocrMessage }}
                </div>
              </div>
              <div>
                <label class="text-sm text-gray-600 mb-1 block">ด้านหลัง *</label>
                <div class="upload-box cursor-pointer"
                  :class="form.idBack ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200'"
                  @click="openUploadPicker('idBack')">
                  <div v-if="!form.idBackPreview" class="flex flex-col items-center gap-2 text-gray-400">
                    <PhotoIcon class="w-8 h-8" /><span class="text-xs">คลิกเพื่ออัพโหลด</span>
                  </div>
                  <img v-else :src="form.idBackPreview" class="w-full h-full object-contain rounded-xl" />
                </div>
              </div>
            </div>
          </div>
          <!-- เลขบัตรประจำตัวประชาชน — แสดงเสมอ (OCR fills this) -->

          <div class="col-span-2">
            <label class="text-sm text-gray-600 mb-1 block">ประเภทเอกสารแสดงตน *</label>
            <select v-model="form.idType" class="input-field" @change="form.idCard = ''">
              <option value="thai_id">บัตรประจำตัวประชาชนไทย</option>
              <option value="alien_id">บัตรประจำตัวคนต่างด้าว</option>
              <option value="passport">หนังสือเดินทาง (Passport)</option>
              <option value="g_code">G-Code (บุคคลไม่มีสัญชาติไทย)</option>
              <option value="other">เอกสารราชการอื่น ๆ</option>
            </select>
          </div>

          <div class="col-span-2">
            <label class="text-sm text-gray-600 mb-1 block">เลขประจำตัวประชาชน *</label>
            <input v-if="form.idType !== 'passport' && form.idType !== 'g_code' && form.idType !== 'other'"
              v-model="form.idCard" type="text" inputmode="numeric"
              placeholder="เลขประจำตัวประชาชน 13 หลัก" maxlength="13" class="input-field" 
              @keydown="blockNonDigit" @input="checkDuplicateIdCard(form.idCard)" />
            <input v-else v-model="form.idCard" type="text" :placeholder="idTypePlaceholder" maxlength="20"
              class="input-field" @input="form.idCard = form.idCard.toUpperCase(); checkDuplicateIdCard(form.idCard)" />
            <p class="text-xs text-gray-400 mt-1">{{ idTypeHint || 'กรอกตัวเลข 13 หลัก ไม่มีขีด' }}</p>
            <p v-if="idCardError" class="text-red-500 text-sm mt-1 mb-1">{{ idCardError }}</p>
          </div>
          <div>
            <label class="text-sm text-gray-600 mb-1 block">คำนำหน้าชื่อ *</label>
            <select v-model="form.prefix" class="input-field">
              <option value="">เลือกคำนำหน้า</option>
              <option>นาย</option>
              <option>นาง</option>
              <option>นางสาว</option>
              <option>เด็กชาย</option>
              <option>เด็กหญิง</option>
            </select>
          </div>
          <div>
            <label class="text-sm text-gray-600 mb-1 block">ชื่อ - สกุล ผู้สมัคร *</label>
            <input v-model="form.fullName" type="text" placeholder="ชื่อ - นามสกุล" class="input-field" />
          </div>
          <div class="col-span-2">
            <label class="text-sm text-gray-600 mb-1 block">ที่อยู่ *</label>
            <textarea v-model="form.address" placeholder="บ้านเลขที่ หมู่ที่ ถนน ตำบล อำเภอ จังหวัด" rows="3"
              class="input-field resize-none" />
          </div>
          <div>
            <label class="text-sm text-gray-600 mb-1 block">เบอร์โทรศัพท์ *</label>
            <input v-model="form.phone" type="text" inputmode="numeric" placeholder="0XX-XXX-XXXX" maxlength="12"
              class="input-field" @keydown="blockNonDigit" @input="formatPhone" />
          </div>
          <div>
            <label class="text-sm text-gray-600 mb-1 block">อีเมล *</label>
            <input v-model="form.email" type="email" placeholder="example@email.com" class="input-field" />
          </div>
        </div>
        <p v-if="showError" class="text-red-500 text-sm mt-4">⚠️ กรุณาตรวจสอบการกรอกข้อมูลและอัพโหลดรูปให้ครบทุกช่อง</p>
      </div>

      <!-- Step 2: ประวัติการศึกษา -->
      <div v-if="currentStep === 1">
        <h2 class="text-lg font-semibold text-gray-700 flex items-center gap-2 mb-6">
          <BuildingLibraryIcon class="w-5 h-5 text-emerald-500" /> ประวัติการศึกษาเดิม
        </h2>
        <div class="grid grid-cols-2 gap-4">
          <div class="col-span-2">
            <label class="text-sm text-gray-600 mb-1 block">ชื่อสถานศึกษาเดิม *</label>
            <input v-model="form.prevSchool" type="text" placeholder="ชื่อโรงเรียน / สถาบัน" class="input-field" />
          </div>
          <div>
            <label class="text-sm text-gray-600 mb-1 block">วุฒิการศึกษา *</label>
            <select v-model="form.prevLevel" class="input-field" @change="onPrevLevelChange">
              <option value="">เลือกวุฒิการศึกษา</option>
              <option value="m3">มัธยมศึกษาตอนต้น (ม.3)</option>
              <option value="m6">มัธยมศึกษาตอนปลาย (ม.6)</option>
              <option value="pvc">ประกาศนียบัตรวิชาชีพ (ปวช.)</option>
            </select>
          </div>
          <div>
            <label class="text-sm text-gray-600 mb-1 block">ปีที่จบการศึกษา *</label>
            <input v-model="form.prevYear" type="text" inputmode="numeric" placeholder="พ.ศ. เช่น 2567" maxlength="4"
              class="input-field" @keydown="blockNonDigit" @input="validateYear" />
            <Transition name="fade">
              <p v-if="yearWarning" class="text-red-500 text-xs mt-1">
                กรุณากรอกปีไม่เกิน {{ new Date().getFullYear() + 543 }}
              </p>
            </Transition>
          </div>

          <div v-if="form.prevLevel === 'pvc'" class="col-span-2">
            <label class="text-sm text-gray-600 mb-1 block">สาขาวิชาที่จบปวช *</label>
            <select v-model="form.prevBranch" class="input-field">
              <option value="">เลือกสาขาวิชาที่จบปวช</option>
              <option v-for="branch in pvcBranches" :key="branch.div_id" :value="branch.div_id">
                {{ branch.div_name }}
              </option>
            </select>
            <p v-if="showError && form.prevLevel === 'pvc' && !form.prevBranch" class="text-red-500 text-xs mt-1">
              ⚠️ กรุณาเลือกสาขาวิชาที่จบปวช
            </p>
          </div>

          <div>
            <label class="text-sm text-gray-600 mb-1 block">เกรดเฉลี่ย (GPA) *</label>
            <input v-model="form.gpa" type="text" inputmode="decimal" placeholder="เช่น 4.00" class="input-field"
              @input="validateGPA" maxlength="4" />
            <Transition name="fade">
              <p v-if="gpaWarning" class="text-red-500 text-xs mt-1">กรุณากรอกเลขไม่เกิน 4.00</p>
            </Transition>
          </div>

          <div v-if="form.prevLevel" class="col-span-2 p-4 rounded-xl border"
            :class="form.prevLevel === 'm3' ? 'bg-blue-50 border-blue-200' : 'bg-emerald-50 border-emerald-200'">
            <p class="text-sm font-medium mb-1" :class="form.prevLevel === 'm3' ? 'text-blue-700' : 'text-emerald-700'">
              📋 หลักสูตรที่สามารถสมัครได้
            </p>
            <p class="text-sm" :class="form.prevLevel === 'm3' ? 'text-blue-600' : 'text-emerald-600'">
              <span v-if="form.prevLevel === 'm3'">✅ ประกาศนียบัตรวิชาชีพ (ปวช.) เท่านั้น</span>
              <span v-else-if="form.prevLevel === 'm6'">✅ ประกาศนียบัตรวิชาชีพชั้นสูง (ปวส. สายม.6) — ทุกสาขาที่รับผู้จบ
                ม.6</span>
              <span v-else-if="form.prevLevel === 'pvc'">✅ ประกาศนียบัตรวิชาชีพชั้นสูง (ปวส. สายตรง) — ทุกสาขา</span>
            </p>
          </div>
          <div class="col-span-2 mt-2">
            <p class="text-sm font-medium text-gray-700 mb-3">หลักฐานการศึกษา *</p>
            <div class="grid grid-cols-3 gap-3 mb-4">
              <div v-for="doc in docTypes" :key="doc.id"
                @click="form.docType = doc.id; form.eduFront = null; form.eduFrontPreview = ''; form.eduBack = null; form.eduBackPreview = ''"
                class="border-2 rounded-xl p-3 cursor-pointer transition-all text-center"
                :class="form.docType === doc.id ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-emerald-300'">
                <p class="text-xl mb-1">{{ doc.icon }}</p>
                <p class="text-xs font-medium text-gray-700">{{ doc.name }}</p>
              </div>
            </div>
            <div v-if="form.docType"
              :class="form.docType === 'certificate' ? 'grid grid-cols-2 gap-4' : 'grid grid-cols-1'">
              <div>
                <label class="text-sm text-gray-600 mb-1 block">
                  {{ form.docType === 'certificate' ? 'ด้านหน้า *' : 'อัพโหลดเอกสาร *' }}
                </label>
                <div class="upload-box cursor-pointer"
                  :class="form.eduFront ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200'"
                  @click="openUploadPicker('eduFront')">
                  <div v-if="!form.eduFrontPreview" class="flex flex-col items-center gap-2 text-gray-400">
                    <PhotoIcon class="w-8 h-8" /><span class="text-xs">คลิกเพื่ออัพโหลด</span>
                  </div>
                  <img v-else :src="form.eduFrontPreview" class="w-full h-full object-contain rounded-xl" />
                </div>
              </div>
              <div v-if="form.docType === 'certificate'">
                <label class="text-sm text-gray-600 mb-1 block">ด้านหลัง *</label>
                <div class="upload-box cursor-pointer"
                  :class="form.eduBack ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200'"
                  @click="openUploadPicker('eduBack')">
                  <div v-if="!form.eduBackPreview" class="flex flex-col items-center gap-2 text-gray-400">
                    <PhotoIcon class="w-8 h-8" /><span class="text-xs">คลิกเพื่ออัพโหลด</span>
                  </div>
                  <img v-else :src="form.eduBackPreview" class="w-full h-full object-contain rounded-xl" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <p v-if="showError" class="text-red-500 text-sm mt-4">⚠️ กรุณาตรวจสอบการกรอกข้อมูลและอัพโหลดหลักฐานให้ครบทุกช่อง
        </p>
      </div>

      <!-- Step 3: เลือกสาขา -->
      <div v-if="currentStep === 2">
        <h2 class="text-lg font-semibold text-gray-700 flex items-center gap-2 mb-6">
          <AcademicCapIcon class="w-5 h-5 text-emerald-500" /> เลือกสาขาวิชาที่ต้องการสมัคร
        </h2>
        <div
          class="mb-5 inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl text-sm font-medium">
          <AcademicCapIcon class="w-4 h-4" />
          หลักสูตร: {{ fixedCourseLabel }}
        </div>
        <div v-if="isLoading" class="text-center py-8 text-gray-400">กำลังโหลดข้อมูล...</div>
        <div v-else-if="admissionPlans.length === 0" class="text-center py-8 text-gray-400">
          ไม่พบข้อมูลสาขาวิชา กรุณาตรวจสอบวุฒิการศึกษา
        </div>
        <div v-else class="grid grid-cols-1 gap-3">
          <div v-for="plan in admissionPlans" :key="plan.ap_id"
            @click="Number(plan.remaining) > 0 && selectPlan(plan.ap_id, plan.cur_id)"
            class="flex items-center justify-between border-2 rounded-xl px-5 py-4 transition-all" :class="Number(plan.remaining) <= 0
              ? 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60'
              : form.apId === plan.ap_id
                ? 'border-emerald-500 bg-emerald-50 cursor-pointer'
                : 'border-gray-200 hover:border-emerald-300 cursor-pointer'">
            <div>
              <p class="font-medium text-sm text-gray-800">{{ plan.div_name }}</p>
              <p class="text-xs text-gray-400 mt-0.5">{{ plan.cur_name }}</p>
            </div>
            <span v-if="Number(plan.remaining) <= 0"
              class="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600">เต็ม</span>
            <span v-else class="px-3 py-1 rounded-full text-xs font-medium"
              :class="Number(plan.remaining) <= 5 ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'">
              ว่าง {{ plan.remaining }} ที่นั่ง
            </span>
          </div>
        </div>
        <p v-if="showError" class="text-red-500 text-sm mt-4">⚠️ กรุณาเลือกสาขาวิชาก่อนดำเนินการต่อ</p>
      </div>

      <!-- Step 4: ค่าใช้จ่าย -->
      <div v-if="currentStep === 3">
        <h2 class="text-lg font-semibold text-gray-700 flex items-center gap-2 mb-6">
          <ShoppingBagIcon class="w-5 h-5 text-emerald-500" /> รายการค่าใช้จ่าย
        </h2>

        <div v-if="expenses.length === 0" class="text-center py-8 text-gray-400">
          ไม่พบรายการค่าใช้จ่าย
        </div>

        <div v-else class="space-y-3">
          <div v-for="exp in sortedExpenses" :key="exp.exp_id"
            class="flex items-center justify-between border rounded-xl px-4 py-3 transition-all"
            :class="exp.payment_type === 'mandatory' ? 'border-gray-200 bg-gray-50' : 'border-gray-200'">

            <!-- ชื่อรายการ -->
            <div class="flex items-center gap-3">
              <!-- Thumbnail รูปภาพ -->
              <div v-if="exp.exp_img" @click="viewingImage = resolveImgUrl(exp.exp_img); viewingExpense = exp"
                class="w-12 h-12 rounded-xl overflow-hidden border border-gray-200 cursor-pointer flex-shrink-0 hover:ring-2 hover:ring-emerald-400 hover:scale-105 transition-all shadow-sm"
                title="คลิกเพื่อดูรูปภาพ">
                <img :src="resolveImgUrl(exp.exp_img)" class="w-full h-full object-cover" />
              </div>
              <div v-else
                class="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0 border border-gray-200">
                <ShoppingBagIcon class="w-5 h-5 text-gray-300" />
              </div>

              <div>
                <p class="text-sm font-medium text-gray-800 line-clamp-4 max-w-xs">{{ exp.exp_name }}</p>
                <p class="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                  {{ exp.exp_cost.toLocaleString() }} บาท
                  <span class="ml-1 px-1.5 py-0.5 rounded text-xs"
                    :class="exp.payment_type === 'mandatory' ? 'bg-red-100 text-red-500' : 'bg-emerald-100 text-emerald-600'">
                    {{ exp.payment_type === 'mandatory' ? 'บังคับจ่าย' : 'ไม่บังคับจ่าย' }}
                  </span>
                </p>
                <!-- ป้ายบอกว่ามีรูป ถ้ามี exp_img -->
                <p v-if="exp.exp_img"
                  class="text-xs text-emerald-500 mt-0.5 flex items-center gap-1 cursor-pointer hover:text-emerald-600"
                  @click="viewingImage = resolveImgUrl(exp.exp_img); viewingExpense = exp">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  ดูตัวอย่างสินค้า
                </p>
              </div>
            </div> 

            <!-- บังคับจ่าย: แสดงแค่ราคา -->
            <div v-if="exp.payment_type === 'mandatory'" class="text-sm font-semibold text-gray-700">
              {{ exp.exp_cost.toLocaleString() }} บาท
            </div>
            <div v-else class="flex items-center gap-3">
              <select v-if="exp.exp_sizes && exp.exp_sizes.length > 0" :value="form.expenseOrders[exp.exp_id]?.size"
                @change="onSizeChange(exp.exp_id, ($event.target as HTMLSelectElement).value)"
                class="input-field !w-40 !py-1.5 text-xs">
                <option value="">เลือกไซส์</option>
                <option v-for="s in exp.exp_sizes" :key="s" :value="s">{{ s }}</option>
              </select>
              <input v-if="form.expenseOrders[exp.exp_id]?.size?.startsWith('พิเศษ')"
                v-model="form.expenseOrders[exp.exp_id]!.customSize"
                type="text" placeholder="ระบุขนาดเป็นนิ้ว เช่น 48"
                class="input-field !w-32 !py-1.5 text-xs" />
              <div class="flex items-center gap-2">
                <button @click="changeQty(exp.exp_id, -1)"
                  class="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-100 text-lg leading-none">−</button>
                <span class="w-6 text-center text-sm font-medium">{{ form.expenseOrders[exp.exp_id]?.qty ?? 1 }}</span>
                <button @click="changeQty(exp.exp_id, 1)"
                  class="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-white hover:bg-emerald-600 text-lg leading-none">+</button>
              </div>
            </div>
          </div>
        </div>

        <!-- ยอดรวม -->
        <div class="mt-5 bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-2">
          <div class="flex justify-between text-sm">
            <span class="text-gray-500">ยอดบังคับจ่าย</span>
            <span class="font-medium text-red-600">{{ requiredTotal.toLocaleString() }} บาท</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-500">รายการเพิ่มเติม</span>
            <span class="font-medium text-gray-600">{{ (totalPrice - requiredTotal).toLocaleString() }} บาท</span>
          </div>
          <div class="flex justify-between border-t border-emerald-200 pt-2 mt-1">
            <span class="font-semibold text-gray-700">ยอดรวมทั้งหมด</span>
            <span class="text-lg font-bold text-emerald-600">{{ totalPrice.toLocaleString() }} บาท</span>
          </div>
        </div>

        <p v-if="showError" class="text-red-500 text-sm mt-4">
          ⚠️ กรุณาเลือกไซส์ให้ครบ และระบุขนาดนิ้วสำหรับไซส์พิเศษ
        </p>
      </div>

      <!-- Step 5: ยืนยันและปริ้นท์ -->
      <div v-if="currentStep === 4">
        <h2 class="text-lg font-semibold text-gray-700 flex items-center gap-2 mb-6">
          <PrinterIcon class="w-5 h-5 text-emerald-500" /> ยืนยันข้อมูลและใบชำระเงิน
        </h2>
        <div class="space-y-4 text-sm">
          <div class="bg-gray-50 rounded-xl p-4">
            <p class="font-medium text-gray-700 mb-3">ข้อมูลส่วนตัว</p>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <p class="text-xs text-gray-400">ชื่อ - สกุล</p>
                <p class="font-medium">{{ form.prefix }} {{ form.fullName }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-400">เลขบัตรประชาชน</p>
                <p class="font-medium">{{ form.idCard }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-400">โทรศัพท์</p>
                <p class="font-medium">{{ form.phone }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-400">อีเมล</p>
                <p class="font-medium">{{ form.email }}</p>
              </div>
              <div class="col-span-2">
                <p class="text-xs text-gray-400">ที่อยู่</p>
                <p class="font-medium">{{ form.address }}</p>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 rounded-xl p-4">
            <p class="font-medium text-gray-700 mb-3">หลักสูตรและสาขาวิชา</p>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <p class="text-xs text-gray-400">หลักสูตร</p>
                <p class="font-medium text-emerald-600">{{ fixedCourseLabel }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-400">สาขาวิชา</p>
                <p class="font-medium text-emerald-600">{{ selectedPlan?.div_name || '-' }}</p>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 rounded-xl p-4">
            <p class="font-medium text-gray-700 mb-3">ประวัติการศึกษา</p>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <p class="text-xs text-gray-400">สถานศึกษาเดิม</p>
                <p class="font-medium">{{ form.prevSchool }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-400">วุฒิการศึกษา</p>
                <p class="font-medium">{{ prevLevelLabel }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-400">ปีที่จบ</p>
                <p class="font-medium">{{ form.prevYear }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-400">เกรดเฉลี่ย</p>
                <p class="font-medium">{{ form.gpa }}</p>
              </div>
            </div>
          </div>
          <div class="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p class="font-medium text-gray-700">ยอดชำระทั้งหมด</p>
              <p class="text-xs text-gray-400 mt-0.5">รวมค่าใช้จ่ายทั้งหมด</p>
            </div>
            <p class="text-2xl font-semibold text-emerald-600">{{ totalPrice.toLocaleString() }} บาท</p>
          </div>
        </div>
      </div>

      <!-- Buttons -->
      <div class="flex justify-between mt-8">
        <button v-if="currentStep > 0" @click="currentStep--; showError = false"
          class="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-600 text-sm hover:bg-gray-50 transition-all">
          ย้อนกลับ
        </button>
        <div v-else />
        <button v-if="currentStep < 4" @click="nextStep" :disabled="!validateStep()"
          class="px-6 py-2.5 rounded-xl bg-emerald-500 text-white text-sm hover:bg-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
          ถัดไป
        </button>
        <button v-else @click="submitForm" :disabled="isSubmitting"
          class="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 text-white text-sm hover:bg-emerald-600 transition-all disabled:opacity-50">
          <PrinterIcon class="w-4 h-4" />
          {{ isSubmitting ? 'กำลังบันทึก...' : 'ยืนยันและปริ้นท์ใบชำระเงิน' }}
        </button>
      </div>
    </div>

    <!-- View Image Modal -->
    <Teleport to="body">
      <transition name="modal">
        <div v-if="viewingImage" class="fixed inset-0 z-[9999] flex items-center justify-center px-4">
          <div class="fixed inset-0 bg-black/70" @click="viewingImage = ''; viewingExpense = null"></div>
          <div class="relative z-[10000] w-full max-w-2xl flex gap-3 items-start">

            <button @click="viewingImage = ''; viewingExpense = null"
              class="absolute -top-4 -right-4 z-10 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-125 hover:bg-red-500 hover:text-white text-gray-600">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <img :src="viewingImage" alt="รูปภาพ"
              class="flex-1 min-w-0 max-h-[75vh] object-contain rounded-xl shadow-2xl"
              :class="imageLoading ? 'hidden' : 'block'" @load="imageLoading = false" @error="imageLoading = false" />

            <div v-if="viewingExpense?.exp_sizes && viewingExpense.exp_sizes.length > 0"
              class="flex-shrink-0 w-64  bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden border border-white/20">

              <!-- หัวตาราง -->
              <div class="bg-white/20 px-4 py-2 text-center">
                <p class="text-white text-xs font-bold tracking-wider">📏 ตารางไซส์</p>
              </div>

              <!-- header row -->
              <div class="grid grid-cols-2 border-b border-white/20 bg-white/10">
                <div class="px-4 py-2 text-white text-xs font-bold text-center border-r border-white/20">ไซส์</div>
                <div class="px-4 py-2 text-white text-xs font-bold text-center">รอบอก (นิ้ว)</div>
              </div>

              <!-- rows -->
              <div class="overflow-y-auto max-h-[55vh]">
                <div v-for="(size, index) in [...viewingExpense.exp_sizes].sort((a, b) => {
                  const order = ['S', 'M', 'L', 'XL', 'พิเศษ']
                  const getKey = (s: string) => order.findIndex(o => s.startsWith(o))
                  return getKey(a) - getKey(b)
                })" :key="size" class="grid grid-cols-2 border-b border-white/10 last:border-0"
                  :class="index % 2 === 0 ? 'bg-white/5' : 'bg-white/10'">
                  <div class="px-4 py-2 text-white text-xs font-semibold text-center border-r border-white/20">
                    {{ size.split(' ')[0] }}
                  </div>
                  <div class="px-4 py-2 text-white text-xs text-center">
                    {{ size.split(' ')[1] ?? '-' }}
                  </div>
                </div>
              </div>
            </div>


          </div>
        </div>
      </transition>
    </Teleport>

    <ConfirmToast :show="showConfirm" @confirm="onConfirmed" @cancel="showConfirm = false" />

    <!-- Upload picker bottom sheet -->
    <Teleport to="body">
      <transition name="slide-up">
        <div v-if="uploadPicker.show"
          class="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
          @click.self="uploadPicker.show = false">
          <div class="bg-white rounded-t-2xl w-full max-w-md px-5 pt-4 pb-8 shadow-xl">
            <div class="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
            <p class="text-sm font-medium text-gray-500 text-center mb-4">เลือกวิธีอัพโหลดภาพ</p>
            <div class="grid grid-cols-2 gap-3 mb-3">
              <button @click="pickCamera"
                class="flex flex-col items-center gap-2 py-5 rounded-2xl border-2 border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <span class="text-sm font-medium">ถ่ายภาพ</span>
              </button>
              <button @click="pickGallery"
                class="flex flex-col items-center gap-2 py-5 rounded-2xl border-2 border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 transition">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                <span class="text-sm font-medium">แกลเลอรี่</span>
              </button>
            </div>
            <button @click="uploadPicker.show = false"
              class="w-full py-3 rounded-xl text-sm text-gray-500 hover:bg-gray-100 transition">
              ยกเลิก
            </button>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { applicationService } from '../services/applicationService'
import { exportPaymentPDF } from '../utils/exportPaymentPDF'
import ConfirmToast from '../components/ConfirmToast.vue'

import {
  UserIcon, CheckIcon, PhotoIcon, PrinterIcon, AcademicCapIcon,
  BuildingLibraryIcon, ShoppingBagIcon,
} from '@heroicons/vue/24/outline'

const currentStep = ref(0)
const isLoading = ref(false)
const isSubmitting = ref(false)
const showConfirm = ref(false)
const showError = ref(false)
const gpaWarning = ref(false)
const yearWarning = ref(false)
const idCardError = ref('')
const viewingImage = ref('')
const ocrStatus = ref<'idle' | 'loading' | 'success' | 'error'>('idle')
const ocrMessage = ref('')
const viewingExpense = ref<any>(null)
const imageLoading = ref(false)

type UploadField = 'idFront' | 'idBack' | 'eduFront' | 'eduBack'
const uploadPicker = reactive({ show: false, field: '' as UploadField })
const cameraInputRef = ref<HTMLInputElement | null>(null)
const galleryInputRef = ref<HTMLInputElement | null>(null)

function openUploadPicker(field: UploadField) {
  uploadPicker.field = field
  uploadPicker.show = true
}
function pickCamera() {
  uploadPicker.show = false
  cameraInputRef.value?.click()
}
function pickGallery() {
  uploadPicker.show = false
  galleryInputRef.value?.click()
}

const router = useRouter()
const API_BASE = (import.meta.env.VITE_API_URL as string) || 'http://localhost:13001/api'

function resolveImgUrl(path: string | null | undefined): string {
  if (!path) return ''
  if (path.startsWith('http') || path.startsWith('data:')) return path

  const base = (import.meta.env.VITE_API_URL || 'http://localhost:13001/api')
    .replace(/\/api$/, '')

  return `${base}${path}`
}
// ข้อมูลจาก API
const curriculums = ref<any[]>([])
const admissionPlans = ref<any[]>([])
const expenses = ref<any[]>([])
const pvcBranches = ref<any[]>([])

const steps = [
  { label: 'ข้อมูลส่วนตัว', sub: 'กรอกข้อมูลส่วนตัว', icon: UserIcon },
  { label: 'ประวัติการศึกษา', sub: 'วุฒิการศึกษาเดิม', icon: BuildingLibraryIcon },
  { label: 'เลือกสาขา', sub: 'สาขาวิชาที่สมัคร', icon: AcademicCapIcon },
  { label: 'ค่าใช้จ่าย', sub: 'รายการค่าใช้จ่าย', icon: ShoppingBagIcon },
  { label: 'ยืนยัน/ปริ้นท์', sub: 'ตรวจสอบและพิมพ์', icon: PrinterIcon },
]

const docTypes = [
  { id: 'certificate', name: 'วุฒิการศึกษา (ป.พ.)', icon: '📄' },
  { id: 'letter', name: 'หนังสือรับรองการเป็นนักเรียน', icon: '📃' },
  { id: 'studentcard', name: 'บัตรนักเรียน', icon: '🪪' },
]

const form = reactive({
  prefix: '', fullName: '', idCard: '', address: '', phone: '', email: '',
  idFront: null as File | null, idBack: null as File | null,
  idFrontPreview: '', idBackPreview: '', idType: 'thai_id',
  prevSchool: '', prevLevel: '', prevYear: '', gpa: '', prevBranch: '',
  docType: '',
  eduFront: null as File | null, eduFrontPreview: '',
  eduBack: null as File | null, eduBackPreview: '',
  curId: 0, apId: 0,
  expenseOrders: {} as Record<number, { qty: number; size?: string; customSize?: string }>,
})

const idTypeLabel = computed(() => {
  const map: Record<string, string> = {
    thai_id: 'เลขประจำตัวประชาชน', alien_id: 'เลขประจำตัวคนต่างด้าว',
    passport: 'เลขหนังสือเดินทาง', g_code: 'G-Code', other: 'เลขเอกสารราชการ',
  }
  return map[form.idType] || 'หมายเลขประจำตัว'
})

const idTypePlaceholder = computed(() => {
  const map: Record<string, string> = {
    thai_id: 'เลขประจำตัวประชาชน 13 หลัก', alien_id: 'เช่น 6-1234-56789-12-3',
    passport: 'เช่น AA1234567', g_code: 'เช่น G-1234567', other: 'หมายเลขเอกสาร',
  }
  return map[form.idType] || ''
})

const idTypeHint = computed(() => {
  const map: Record<string, string> = {
    thai_id: 'กรอกตัวเลข 13 หลัก ไม่มีขีด', alien_id: 'ตามที่ระบุในบัตรประจำตัวคนต่างด้าว',
    passport: 'ตัวอักษรและตัวเลข ตามหน้าหนังสือเดินทาง', g_code: 'รหัส G ที่ออกโดยกรมการปกครอง',
    other: 'หมายเลขตามเอกสารราชการที่ใช้แสดงตน',
  }
  return map[form.idType] || ''
})

const fixedCourseLabel = computed(() =>
  form.prevLevel === 'm3' ? 'ประกาศนียบัตรวิชาชีพ (ปวช.)' :
  form.prevLevel === 'm6' ? 'ประกาศนียบัตรวิชาชีพชั้นสูง (ปวส. สายม.6)' :
  'ประกาศนียบัตรวิชาชีพชั้นสูง (ปวส. สายตรง)'
)

const prevLevelLabel = computed(() => {
  const map: Record<string, string> = { m3: 'ม.3', m6: 'ม.6', pvc: 'ปวช.' }
  return map[form.prevLevel] || ''
})

const selectedPlan = computed(() => admissionPlans.value.find(p => p.ap_id === form.apId))
const requiredExpenses = computed(() => expenses.value.filter(e => e.payment_type === 'mandatory'))
const requiredTotal = computed(() => requiredExpenses.value.reduce((sum, e) => sum + e.exp_cost, 0))

const totalPrice = computed(() => {
  let total = requiredTotal.value
  expenses.value.filter(e => e.payment_type !== 'mandatory').forEach(e => {
    total += e.exp_cost * (form.expenseOrders[e.exp_id]?.qty || 0)
  })
  return total
})

onMounted(async () => {
  try {
    const res = await applicationService.getCurriculums()
    curriculums.value = res.data.data
  } catch (err) {
    console.error('โหลดหลักสูตรไม่สำเร็จ', err)
  }
})

async function onPrevLevelChange() {
  form.apId = 0; form.curId = 0
  admissionPlans.value = []; expenses.value = []
  if (!form.prevLevel) return

  // Load PVC branches if prevLevel is 'pvc'
  if (form.prevLevel === 'pvc') {
    await loadPvcBranches()
  } else {
    pvcBranches.value = []
    form.prevBranch = ''
  }

  isLoading.value = true
  try {
    const res = await applicationService.getAdmissionPlan(form.prevLevel, '2569')
    admissionPlans.value = res.data.data
  } catch (err) {
    console.error('โหลดสาขาไม่สำเร็จ', err)
  } finally {
    isLoading.value = false
  }
}

async function loadPvcBranches() {
  try {
    const res = await applicationService.getDivisions(1) // 1 = cur_id for PVC curriculum
    pvcBranches.value = res.data.data
  } catch (err) {
    console.error('โหลดสาขาปวช. ไม่สำเร็จ', err)
  }
}

function selectPlan(ap_id: number, cur_id: number) {
  console.log('selectPlan ap_id:', ap_id, 'cur_id:', cur_id)
  form.apId = ap_id; form.curId = cur_id
  loadExpenses(cur_id)
}

async function loadExpenses(curId: number) {
  try {
   
    const res = await applicationService.getExpenses(curId)
    console.log('expenses ที่ได้:', res.data)
    expenses.value = res.data.data
    expenses.value.forEach((e: any) => {
      if (!form.expenseOrders[e.exp_id]) {
        form.expenseOrders[e.exp_id] = { qty: 1, size: '' }
      }
    })
  } catch (err) {
    console.error('โหลดค่าใช้จ่ายไม่สำเร็จ', err)
  }
}

function changeQty(expId: number, delta: number) {
  const current = form.expenseOrders[expId]?.qty || 0
  form.expenseOrders[expId] = { ...form.expenseOrders[expId], qty: Math.max(0, current + delta) }
}

function onSizeChange(expId: number, value: string) {
  form.expenseOrders[expId] = {
    ...form.expenseOrders[expId],
    size: value, customSize: '',
    qty: form.expenseOrders[expId]?.qty || 1
  }
}

function blockNonDigit(e: KeyboardEvent) {
  const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab']
  if (!allowed.includes(e.key) && !/^\d$/.test(e.key)) e.preventDefault()
}

function formatPhone(e: Event) {
  const digits = (e.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 10)
  if (digits.length <= 3) form.phone = digits
  else if (digits.length <= 6) form.phone = digits.slice(0, 3) + '-' + digits.slice(3)
  else form.phone = digits.slice(0, 3) + '-' + digits.slice(3, 6) + '-' + digits.slice(6)
}

function validateGPA(e: Event) {
  const input = e.target as HTMLInputElement
  let value = input.value.replace(/[^0-9.]/g, '')
  const parts = value.split('.')
  if (parts.length > 2) value = parts[0] + '.' + parts.slice(1).join('')
  const currentValue = form.gpa || ''
  if (value.length === 1 && value !== '4' && !value.includes('.') && value.length > currentValue.length) value = value + '.'
  const numValue = parseFloat(value)
  if (numValue > 4) { input.value = form.gpa; gpaWarning.value = true; return }
  else if (parts[1] && parts[1].length > 2) value = parts[0] + '.' + parts[1].slice(0, 2)
  else gpaWarning.value = false
  form.gpa = value
}

function validateYear(e: Event) {
  const input = e.target as HTMLInputElement
  let value = input.value.replace(/[^0-9]/g, '')
  const currentYear = new Date().getFullYear() + 543
  if (parseInt(value) > currentYear) { input.value = form.prevYear; yearWarning.value = true; return }
  else yearWarning.value = false
  form.prevYear = value
}

let checkDuplicateTimeout: ReturnType<typeof setTimeout> | null = null

async function checkDuplicateIdCard(idCard: string) {
  // Clear error immediately when user changes the value
  idCardError.value = ''

  if (!idCard || idCard.length < 5) {
    return
  }

  // Clear previous timeout
  if (checkDuplicateTimeout) {
    clearTimeout(checkDuplicateTimeout)
  }

  // Debounce for 500ms
  checkDuplicateTimeout = setTimeout(async () => {
    try {
      const res = await applicationService.checkDuplicateIdCard(idCard)
      if (res.data.data.is_duplicate) {
        idCardError.value = `เลขบัตรนี้ถูกสมัครไปเเล้ว`
      }
    } catch (err) {
      console.error('Error checking duplicate ID card:', err)
    }
  }, 500)
}

function readExifOrientation(file: File): Promise<number> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const view = new DataView(e.target?.result as ArrayBuffer)
        if (view.getUint16(0, false) !== 0xFFD8) return resolve(1)
        let offset = 2
        while (offset < view.byteLength) {
          const marker = view.getUint16(offset, false)
          offset += 2
          if (marker === 0xFFE1) {
            if (view.getUint32(offset + 2, false) !== 0x45786966) return resolve(1)
            const little = view.getUint16(offset + 8, false) === 0x4949
            const tags = view.getUint16(offset + 10, little)
            for (let i = 0; i < tags; i++) {
              const tag = view.getUint16(offset + 12 + i * 12, little)
              if (tag === 0x0112) return resolve(view.getUint16(offset + 12 + i * 12 + 8, little))
            }
            return resolve(1)
          } else if ((marker & 0xFF00) !== 0xFF00) break
          else offset += view.getUint16(offset, false)
        }
        resolve(1)
      } catch { resolve(1) }
    }
    reader.onerror = () => resolve(1)
    reader.readAsArrayBuffer(file.slice(0, 64 * 1024))
  })
}

async function autoRotateToLandscape(file: File): Promise<File> {
  try {
    const orientation = await readExifOrientation(file)
    // EXIF 6 = 90° CW needed, EXIF 8 = 90° CCW needed, EXIF 3 = 180°, 1 = normal
    const angleMap: Record<number, number> = { 3: Math.PI, 6: Math.PI / 2, 8: -Math.PI / 2 }
    const angle = angleMap[orientation]
    if (angle === undefined) return file

    const img = new Image()
    const url = URL.createObjectURL(file)
    return new Promise((resolve) => {
      img.onload = () => {
        URL.revokeObjectURL(url)
        const swap = orientation === 6 || orientation === 8
        const canvas = document.createElement('canvas')
        canvas.width  = swap ? img.height : img.width
        canvas.height = swap ? img.width  : img.height
        const ctx = canvas.getContext('2d')!
        ctx.translate(canvas.width / 2, canvas.height / 2)
        ctx.rotate(angle)
        ctx.drawImage(img, -img.width / 2, -img.height / 2)
        canvas.toBlob(
          (blob) => resolve(blob ? new File([blob], file.name, { type: 'image/jpeg' }) : file),
          'image/jpeg', 0.92,
        )
      }
      img.onerror = () => { URL.revokeObjectURL(url); resolve(file) }
      img.src = url
    })
  } catch {
    return file
  }
}

async function handleUpload(field: UploadField, event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  ;(event.target as HTMLInputElement).value = '' // allow re-select same file

  const rotated = await autoRotateToLandscape(file)
  form[field] = rotated

  const reader = new FileReader()
  reader.onload = (e) => {
    const result = e.target?.result as string
    if (field === 'idFront') { form.idFrontPreview = result; runIdCardOCR(rotated) }
    else if (field === 'idBack') form.idBackPreview = result
    else if (field === 'eduFront') form.eduFrontPreview = result
    else if (field === 'eduBack') form.eduBackPreview = result
  }
  reader.readAsDataURL(rotated)
}

// Province → postal code map (append if not already present)
const PROVINCE_POSTAL: [string, string][] = [
  ['กรุงเทพมหานคร', '10100'], ['กรุงเทพ', '10100'],
  ['เชียงใหม่', '50000'], ['เชียงราย', '57000'],
  ['ลำปาง', '52000'], ['ลำพูน', '51000'], ['แพร่', '54000'], ['น่าน', '55000'],
  ['พะเยา', '56000'], ['แม่ฮ่องสอน', '58000'],
  ['ขอนแก่น', '40000'], ['อุดรธานี', '41000'], ['หนองคาย', '43000'],
  ['นครพนม', '48000'], ['สกลนคร', '47000'], ['มุกดาหาร', '49000'],
  ['หนองบัวลำภู', '39000'], ['เลย', '42000'], ['กาฬสินธุ์', '46000'],
  ['มหาสารคาม', '44000'], ['ร้อยเอ็ด', '45000'], ['ยโสธร', '35000'],
  ['อุบลราชธานี', '34000'], ['ศรีสะเกษ', '33000'], ['สุรินทร์', '32000'],
  ['บุรีรัมย์', '31000'], ['นครราชสีมา', '30000'], ['ชัยภูมิ', '36000'],
  ['อำนาจเจริญ', '37000'],
  ['นครสวรรค์', '60000'], ['อุทัยธานี', '61000'], ['กำแพงเพชร', '62000'],
  ['พิษณุโลก', '65000'], ['เพชรบูรณ์', '67000'], ['สุโขทัย', '64000'],
  ['พิจิตร', '66000'], ['ตาก', '63000'],
  ['สระบุรี', '18000'], ['ลพบุรี', '15000'], ['สิงห์บุรี', '16000'],
  ['ชัยนาท', '17000'], ['อ่างทอง', '14000'], ['พระนครศรีอยุธยา', '13000'],
  ['ปทุมธานี', '12000'], ['นนทบุรี', '11000'], ['สมุทรปราการ', '10270'],
  ['นครปฐม', '73000'], ['สมุทรสาคร', '74000'], ['สมุทรสงคราม', '75000'],
  ['ราชบุรี', '70000'], ['กาญจนบุรี', '71000'], ['สุพรรณบุรี', '72000'],
  ['เพชรบุรี', '76000'], ['ประจวบคีรีขันธ์', '77000'],
  ['ชลบุรี', '20000'], ['ระยอง', '21000'], ['จันทบุรี', '22000'],
  ['ตราด', '23000'], ['ฉะเชิงเทรา', '24000'], ['ปราจีนบุรี', '25000'],
  ['สระแก้ว', '27000'], ['นครนายก', '26000'],
  ['ชุมพร', '86000'], ['ระนอง', '85000'], ['สุราษฎร์ธานี', '84000'],
  ['นครศรีธรรมราช', '80000'], ['พัทลุง', '93000'], ['สงขลา', '90000'],
  ['ตรัง', '92000'], ['กระบี่', '81000'], ['พังงา', '82000'],
  ['ภูเก็ต', '83000'], ['สตูล', '91000'], ['ปัตตานี', '94000'],
  ['ยะลา', '95000'], ['นราธิวาส', '96000'],
]

function withPostalCode(address: string): string {
  if (/\d{5}/.test(address)) return address // already has postal code
  for (const [province, postal] of PROVINCE_POSTAL) {
    if (address.includes(province)) return address.trim() + ' ' + postal
  }
  return address
}

async function runIdCardOCR(file: File) {
  ocrStatus.value = 'loading'
  ocrMessage.value = 'กำลังอ่านข้อมูลจากบัตร (AI)...'
  try {
    const res = await applicationService.ocrIdCard(file)
    const { success, data, message } = res.data

    if (!success || !data) {
      ocrStatus.value = 'error'
      ocrMessage.value = message || 'อ่านข้อมูลไม่สำเร็จ กรุณากรอกข้อมูลด้วยตนเอง'
      return
    }

    if (data.id_number && !form.idCard) {
      form.idCard = data.id_number
      form.idType = 'thai_id'
    }
    if (data.prefix && !form.prefix) form.prefix = data.prefix
    if (data.full_name && !form.fullName) form.fullName = data.full_name
    if (data.address && !form.address) form.address = withPostalCode(data.address)

    ocrStatus.value = 'success'
    ocrMessage.value = data.confidence === 'high'
      ? 'อ่านข้อมูลสำเร็จ (ความแม่นยำสูง)'
      : 'อ่านข้อมูลสำเร็จ กรุณาตรวจสอบความถูกต้อง'
  } catch (err: any) {
    ocrStatus.value = 'error'
    ocrMessage.value = err.response?.data?.message || 'อ่านข้อมูลไม่สำเร็จ กรุณากรอกข้อมูลด้วยตนเอง'
  }
}

function validateStep() {
  if (currentStep.value === 0) {
    return !!(form.idType && form.idCard && form.idCard.length >= 5
      && form.prefix && form.fullName && form.address
      && form.phone.replace(/\D/g, '').length === 10
      && form.email && form.idFront && form.idBack && !idCardError.value)
  }
  if (currentStep.value === 1) {
    const eduValid = form.docType && form.eduFront && (form.docType !== 'certificate' || form.eduBack)
    const gpaValue = parseFloat(form.gpa)
    const gpaValid = form.gpa && gpaValue <= 4.00 && !isNaN(gpaValue)
    const yearValue = parseInt(form.prevYear)
    const currentYear = new Date().getFullYear() + 543
    const yearValid = form.prevYear && yearValue <= currentYear && !isNaN(yearValue)
    const branchValid = form.prevLevel !== 'pvc' || form.prevBranch // Require branch selection for PVC
    return !!(form.prevSchool && form.prevLevel && yearValid && gpaValid && eduValid && branchValid)
  }
  if (currentStep.value === 2) return !!form.apId
  if (currentStep.value === 3) {
    const missingSize = expenses.value
      .filter(e => e.payment_type !== 'mandatory' && e.exp_sizes?.length > 0 && (form.expenseOrders[e.exp_id]?.qty || 0) > 0)
      .some(e => {
        const order = form.expenseOrders[e.exp_id]
        if (!order?.size) return true
        if (order.size.startsWith('พิเศษ') && !order.customSize) return true
        return false
      })
    if (missingSize) return false
  }
  return true
}

function nextStep() {
  showError.value = false
  if (!validateStep()) { showError.value = true; return }
  currentStep.value++
}

function submitForm() { showConfirm.value = true }

async function onConfirmed() {
  showConfirm.value = false
  isSubmitting.value = true
  try {
    const fd = new FormData()
    fd.append('id_card_number', form.idCard)
    fd.append('id_type', form.idType)
    fd.append('prefix', form.prefix)
    fd.append('full_name', form.fullName)
    fd.append('address', form.address)
    fd.append('phone', form.phone)
    fd.append('email', form.email)
    if (form.idFront) fd.append('id_front', form.idFront)
    if (form.idBack) fd.append('id_back', form.idBack)
    fd.append('prev_school', form.prevSchool)
    fd.append('prev_level', form.prevLevel)
    fd.append('prev_year', form.prevYear)
    fd.append('gpa', form.gpa)
    if (form.prevBranch) fd.append('prev_branch', form.prevBranch)
    fd.append('doc_type', form.docType)
    if (form.eduFront) fd.append('edu_front', form.eduFront)
    if (form.eduBack) fd.append('edu_back', form.eduBack)
    fd.append('cur_id', String(form.curId))
    fd.append('div_id', String(selectedPlan.value?.div_id || 0))
    fd.append('ap_id', String(form.apId))

    const expenseList = expenses.value
      .filter(e => {
        if (e.payment_type === 'mandatory') return true
        return (form.expenseOrders[e.exp_id]?.qty || 0) > 0
      })
      .map(e => ({
        exp_id: e.exp_id,
        exp_name: e.exp_name, // เพิ่มชื่อรายการ
        quantity: e.payment_type === 'mandatory' ? 1 : (form.expenseOrders[e.exp_id]?.qty || 1),
        size: (() => {
          const order = form.expenseOrders[e.exp_id]
          if (!order?.size) return null
          if (order.size.startsWith('พิเศษ') && order.customSize) return `พิเศษ ${order.customSize} นิ้ว`
          return order.size
        })(),
        unit_price: e.exp_cost,
        is_required: e.payment_type === 'mandatory',
      }))
    fd.append('expenses', JSON.stringify(expenseList))

    const res = await applicationService.createApplication(fd)
    const { total_amount } = res.data.data

    await exportPaymentPDF({
      prefix: form.prefix, fullName: form.fullName,
      idCard: form.idCard, phone: form.phone,
      courseLabel: fixedCourseLabel.value,
      branchName: selectedPlan.value?.div_name || '-',
      totalPrice: total_amount,
      expenses: expenseList,
    })
    router.push('/check-status')
  } catch (err: any) {
    console.error('❌ createApplication error:', err.message)
    console.error('❌ detail:', err.detail)   // เพิ่มบรรทัดนี้
    console.error('❌ stack:', err.stack)
    
    const errorMessage = err.response?.data?.message || err.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง'
    alert(errorMessage)
  } finally {
    isSubmitting.value = false
  }
}

const sortedExpenses = computed(() =>
  [...expenses.value].sort((a, b) => {
    if (a.payment_type === 'mandatory' && b.payment_type !== 'mandatory') return -1
    if (a.payment_type !== 'mandatory' && b.payment_type === 'mandatory') return 1
    return 0
  })
)
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.25s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(100%);
}
</style>
