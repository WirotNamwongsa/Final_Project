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

    <div class="bg-white rounded-2xl shadow-sm p-8">

      <!-- Loading -->
      <div v-if="isLoadingData" class="flex justify-center items-center py-20">
        <svg class="animate-spin h-8 w-8 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none"
          viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
        </svg>
        <span class="ml-3 text-gray-500">กำลังโหลดข้อมูล...</span>
      </div>

      <template v-else>



        <!-- Step 1: Document Upload -->
        <div v-if="currentStep === 0" class="mb-8">
          <h2 class="text-lg font-semibold text-gray-700 flex items-center gap-2 mb-1">
            <DocumentTextIcon class="w-5 h-5 text-emerald-500" /> สำเนาทะเบียนบ้านของตนเอง
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <label class="block">
              <div class="upload-box"
                :class="selfHouseRegistration.frontPreview ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200'">
                <input type="file" accept="image/*" class="hidden"
                  @change="handleUpload(selfHouseRegistration, 'front', $event)" />
                <div v-if="!selfHouseRegistration.frontPreview" class="flex flex-col items-center gap-2 text-gray-400">
                  <PhotoIcon class="w-8 h-8" /><span class="text-xs">หน้ารายละเอียดตนเอง</span>
                  <span class="text-xs">(หน้าเเรก)</span>
                </div>
                <img v-else :src="selfHouseRegistration.frontPreview" class="w-full h-full object-contain rounded-xl" />
              </div>
            </label>
            <label class="block">
              <div class="upload-box"
                :class="selfHouseRegistration.backPreview ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200'">
                <input type="file" accept="image/*" class="hidden"
                  @change="handleUpload(selfHouseRegistration, 'back', $event)" />
                <div v-if="!selfHouseRegistration.backPreview" class="flex flex-col items-center gap-2 text-gray-400">
                  <PhotoIcon class="w-8 h-8" /><span class="text-xs">หน้ารายละเอียดตนเอง</span>
                </div>
                <img v-else :src="selfHouseRegistration.backPreview" class="w-full h-full object-contain rounded-xl" />
              </div>
            </label>
          </div>

          <h2 class="text-lg font-semibold text-gray-700 flex items-center gap-2 mb-1 mt-6">
            <DocumentTextIcon class="w-5 h-5 text-emerald-500" /> สำเนาทะเบียนบ้านของบิดา
            <span class="text-xs text-gray-400 font-normal">(ไม่บังคับ)</span>
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <label class="block">
              <div class="upload-box"
                :class="fatherHouseRegistration.frontPreview ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200'">
                <input type="file" accept="image/*" class="hidden"
                  @change="handleUpload(fatherHouseRegistration, 'front', $event)" />
                <div v-if="!fatherHouseRegistration.frontPreview"
                  class="flex flex-col items-center gap-2 text-gray-400">
                  <PhotoIcon class="w-8 h-8" /><span class="text-xs">หน้ารายละเอียดบ้านบิดา</span>
                  <span class="text-xs">(หน้าเเรก)</span>
                </div>
                <img v-else :src="fatherHouseRegistration.frontPreview"
                  class="w-full h-full object-contain rounded-xl" />
              </div>
            </label>
            <label class="block">
              <div class="upload-box"
                :class="fatherHouseRegistration.backPreview ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200'">
                <input type="file" accept="image/*" class="hidden"
                  @change="handleUpload(fatherHouseRegistration, 'back', $event)" />
                <div v-if="!fatherHouseRegistration.backPreview" class="flex flex-col items-center gap-2 text-gray-400">
                  <PhotoIcon class="w-8 h-8" /><span class="text-xs">หน้ารายละเอียดบิดา</span>
                </div>
                <img v-else :src="fatherHouseRegistration.backPreview"
                  class="w-full h-full object-contain rounded-xl" />
              </div>
            </label>
          </div>

          <h2 class="text-lg font-semibold text-gray-700 flex items-center gap-2 mb-1 mt-6">
            <DocumentTextIcon class="w-5 h-5 text-emerald-500" /> สำเนาทะเบียนบ้านของมารดา
            <span class="text-xs text-gray-400 font-normal">(ไม่บังคับ)</span>
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <label class="block">
              <div class="upload-box"
                :class="motherHouseRegistration.frontPreview ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200'">
                <input type="file" accept="image/*" class="hidden"
                  @change="handleUpload(motherHouseRegistration, 'front', $event)" />
                <div v-if="!motherHouseRegistration.frontPreview"
                  class="flex flex-col items-center gap-2 text-gray-400">
                  <PhotoIcon class="w-8 h-8" /><span class="text-xs">หน้ารายละเอียดบ้านมารดา</span>
                  <span class="text-xs">(หน้าเเรก)</span>
                </div>
                <img v-else :src="motherHouseRegistration.frontPreview"
                  class="w-full h-full object-contain rounded-xl" />
              </div>
            </label>
            <label class="block">
              <div class="upload-box"
                :class="motherHouseRegistration.backPreview ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200'">
                <input type="file" accept="image/*" class="hidden"
                  @change="handleUpload(motherHouseRegistration, 'back', $event)" />
                <div v-if="!motherHouseRegistration.backPreview" class="flex flex-col items-center gap-2 text-gray-400">
                  <PhotoIcon class="w-8 h-8" /><span class="text-xs">หน้ารายละเอียดมารดา</span>
                </div>
                <img v-else :src="motherHouseRegistration.backPreview"
                  class="w-full h-full object-contain rounded-xl" />
              </div>
            </label>
          </div>

          <div class="flex justify-between gap-4 mt-8">
            <button @click="goBack"
              class="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium">ย้อนกลับ</button>
            <button @click="handleNextClick"
              class="px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium">ถัดไป</button>
          </div>
        </div>

        <!-- Step 2: Payment Slip -->
        <div v-if="currentStep === 1" class="mb-8">
          <h2 class="text-lg font-semibold text-gray-700 flex items-center gap-2 mb-4">
            <BanknotesIcon class="w-5 h-5 text-emerald-500" /> อัปโหลดหลักฐานการชำระเงิน
          </h2>
          <div class="border border-gray-200 rounded-lg p-4 mb-6">
            <h3 class="font-semibold text-gray-700 mb-3">ข้อมูลการชำระเงิน</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-gray-500">ชื่อ-สกุล</p>
                <p class="font-medium text-gray-800">{{ userData.prefix }}{{ userData.fullName }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">ยอดที่ต้องชำระ</p>
                <p class="font-medium text-gray-800">{{ userData.totalAmount.toLocaleString() }} บาท</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">หลักสูตร</p>
                <p class="font-medium text-gray-800">{{ userData.curName }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">สาขา</p>
                <p class="font-medium text-gray-800">{{ userData.divName }}</p>
              </div>
            </div>
          </div>

          <h3 class="text-base font-semibold text-gray-700 mb-1">สลิปการโอนเงิน</h3>
          <label class="block">
            <div class="upload-box" :class="[
              paymentSlip.frontPreview ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200',
              isVerifyingSlip ? 'pointer-events-none opacity-60' : ''
            ]" style="min-height: 300px;">
              <input type="file" accept="image/*" class="hidden" @change="handleSlipUpload($event)" />
              <div v-if="!paymentSlip.frontPreview"
                class="flex flex-col items-center justify-center gap-3 text-gray-400 h-full">
                <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <PhotoIcon class="w-8 h-8" />
                </div>
                <div class="text-center">
                  <span class="text-sm font-medium">คลิกเพื่ออัปโหลดสลิป</span>
                  <p class="text-xs mt-1">รองรับไฟล์ JPG, PNG (สูงสุด 5MB)</p>
                </div>
              </div>
              <img v-else :src="paymentSlip.frontPreview" class="w-full h-full object-contain rounded-xl" />
            </div>
          </label>

          <!-- กำลังตรวจสอบ -->
          <div v-if="isVerifyingSlip"
            class="mt-4 flex items-center gap-3 bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
            <div class="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg class="animate-spin h-5 w-5 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            </div>
            <div>
              <p class="text-sm font-semibold text-emerald-700">กำลังตรวจสอบสลิป...</p>
              <p class="text-xs text-emerald-500 mt-0.5">กรุณารอสักครู่ ระบบกำลังยืนยันข้อมูล</p>
            </div>
          </div>

          <!-- ✅ สลิปผ่านแล้ว -->
          <div v-if="slipVerifyResult?.valid && !isVerifyingSlip"
            class="mt-4 flex items-center gap-3 bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
            <div class="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p class="text-sm font-semibold text-emerald-700">สลิปผ่านการตรวจสอบแล้ว</p>
              <p class="text-xs text-emerald-500 mt-0.5">ระบบได้บันทึกการชำระเงินเรียบร้อย</p>
            </div>
            <div class="ml-auto w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
          </div>

          <div class="flex justify-between gap-4 mt-6">
            <button @click="goBackStep"
              class="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium">ย้อนกลับ</button>
            <button @click="handleNextClick" :disabled="isVerifyingSlip"
              class="px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium">ถัดไป</button>
          </div>
                  <!-- ⚠️ SlipOK -->
<div v-if="slipVerifyResult && !slipVerifyResult.valid && !isVerifyingSlip"
  class="mt-4 flex items-center gap-3 bg-amber-50 border border-amber-200 p-4 rounded-xl">
  <div class="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
    <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
    </svg>
  </div>
  <div>
    <p class="text-sm font-semibold text-amber-700">ตรวจสอบไม่สำเร็จ</p>
    <p class="text-xs text-amber-500 mt-0.5">{{ slipVerifyResult.message }} — Admin จะตรวจสอบสลิปของท่านอีกครั้ง กดถัดไปเพื่อดำเนินการต่อได้</p>
  </div>
</div>

        </div>


        <!-- Step 3: Confirmation -->
        <div v-if="currentStep === 2" class="mb-8">
          <div class="text-center mb-6">
            <h2 class="text-xl font-semibold text-gray-700">ยืนยันข้อมูลการมอบตัว</h2>
          </div>

          <!-- ข้อมูลผู้มอบตัว -->
          <div class="bg-gray-50 rounded-xl p-5 mb-5">
            <div class="space-y-2">
              <div class="flex gap-2">
                <span class="text-sm text-gray-500 w-24 flex-shrink-0">ชื่อ-สกุล</span>
                <span class="text-sm font-medium text-gray-800">{{ userData.prefix }}{{ userData.fullName }}</span>
              </div>
              <div class="flex gap-2">
                <span class="text-sm text-gray-500 w-24 flex-shrink-0">หลักสูตร</span>
                <span class="text-sm font-medium text-gray-800">{{ userData.curName }}</span>
              </div>
              <div class="flex gap-2">
                <span class="text-sm text-gray-500 w-24 flex-shrink-0">สาขาวิชา</span>
                <span class="text-sm font-medium text-gray-800">{{ userData.divName }}</span>
              </div>
            </div>
          </div>
          <!-- รายการเอกสาร -->
          <div class="bg-white border border-gray-200 rounded-xl p-5 mb-5">
            <h3 class="text-sm font-semibold text-gray-700 mb-3">รายการเอกสารมอบตัว</h3>
            <div class="space-y-4">

              <!-- ทะเบียนบ้านตนเอง -->
              <div>
                <div class="flex items-center gap-3 mb-2">
                  <div class="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                    :class="selfHouseRegistration.frontPreview ? 'bg-emerald-100' : 'bg-red-100'">
                    <svg v-if="selfHouseRegistration.frontPreview" class="w-4 h-4 text-emerald-600" fill="none"
                      stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                    <svg v-else class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                        d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <span class="text-sm text-gray-700">1. สำเนาทะเบียนบ้านตนเอง</span>
                  <span class="ml-auto text-xs font-medium"
                    :class="selfHouseRegistration.frontPreview ? 'text-emerald-600' : 'text-red-500'">
                    {{ selfHouseRegistration.frontPreview ? 'อัปโหลดแล้ว' : 'ยังไม่ได้อัปโหลด' }}
                  </span>
                </div>
                <div v-if="selfHouseRegistration.frontPreview || selfHouseRegistration.backPreview"
                  class="grid grid-cols-2 gap-2 ml-10">
                  <div v-if="selfHouseRegistration.frontPreview" class="relative">
                    <img :src="selfHouseRegistration.frontPreview"
                      class="w-full h-28 object-cover rounded-lg border border-gray-200 bg-gray-50" />
                    <span
                      class="absolute bottom-1 left-1 text-xs bg-black/50 text-white px-1.5 py-0.5 rounded">หน้าแรก</span>
                  </div>
                  <div v-if="selfHouseRegistration.backPreview" class="relative">
                    <img :src="selfHouseRegistration.backPreview"
                      class="w-full h-28 object-cover rounded-lg border border-gray-200 bg-gray-50" />
                    <span
                      class="absolute bottom-1 left-1 text-xs bg-black/50 text-white px-1.5 py-0.5 rounded">รายละเอียด</span>
                  </div>
                </div>
              </div>

              <div class="border-t border-gray-100"></div>

              <!-- ทะเบียนบ้านบิดา -->
              <div>
                <div class="flex items-center gap-3 mb-2">
                  <div class="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                    :class="fatherHouseRegistration.frontPreview ? 'bg-emerald-100' : 'bg-red-100'">
                    <svg v-if="fatherHouseRegistration.frontPreview" class="w-4 h-4 text-emerald-600" fill="none"
                      stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                    <svg v-else class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                        d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <span class="text-sm text-gray-700">2. สำเนาทะเบียนบ้านบิดา</span>
                  <span class="ml-auto text-xs font-medium"
                    :class="fatherHouseRegistration.frontPreview ? 'text-emerald-600' : 'text-red-500'">
                    {{ fatherHouseRegistration.frontPreview ? 'อัปโหลดแล้ว' : 'ยังไม่ได้อัปโหลด' }}
                  </span>
                </div>
                <div v-if="fatherHouseRegistration.frontPreview || fatherHouseRegistration.backPreview"
                  class="grid grid-cols-2 gap-2 ml-10">
                  <div v-if="fatherHouseRegistration.frontPreview" class="relative">
                    <img :src="fatherHouseRegistration.frontPreview"
                      class="w-full h-28 object-cover rounded-lg border border-gray-200 bg-gray-50" />
                    <span
                      class="absolute bottom-1 left-1 text-xs bg-black/50 text-white px-1.5 py-0.5 rounded">หน้าแรก</span>
                  </div>
                  <div v-if="fatherHouseRegistration.backPreview" class="relative">
                    <img :src="fatherHouseRegistration.backPreview"
                      class="w-full h-28 object-cover rounded-lg border border-gray-200 bg-gray-50" />
                    <span
                      class="absolute bottom-1 left-1 text-xs bg-black/50 text-white px-1.5 py-0.5 rounded">รายละเอียด</span>
                  </div>
                </div>
              </div>

              <div class="border-t border-gray-100"></div>

              <!-- ทะเบียนบ้านมารดา -->
              <div>
                <div class="flex items-center gap-3 mb-2">
                  <div class="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                    :class="motherHouseRegistration.frontPreview ? 'bg-emerald-100' : 'bg-red-100'">
                    <svg v-if="motherHouseRegistration.frontPreview" class="w-4 h-4 text-emerald-600" fill="none"
                      stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                    <svg v-else class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                        d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <span class="text-sm text-gray-700">3. สำเนาทะเบียนบ้านมารดา</span>
                  <span class="ml-auto text-xs font-medium"
                    :class="motherHouseRegistration.frontPreview ? 'text-emerald-600' : 'text-red-500'">
                    {{ motherHouseRegistration.frontPreview ? 'อัปโหลดแล้ว' : 'ยังไม่ได้อัปโหลด' }}
                  </span>
                </div>
                <div v-if="motherHouseRegistration.frontPreview || motherHouseRegistration.backPreview"
                  class="grid grid-cols-2 gap-2 ml-10">
                  <div v-if="motherHouseRegistration.frontPreview" class="relative">
                    <img :src="motherHouseRegistration.frontPreview"
                      class="w-full h-28 object-cover rounded-lg border border-gray-200 bg-gray-50" />
                    <span
                      class="absolute bottom-1 left-1 text-xs bg-black/50 text-white px-1.5 py-0.5 rounded">หน้าแรก</span>
                  </div>
                  <div v-if="motherHouseRegistration.backPreview" class="relative">
                    <img :src="motherHouseRegistration.backPreview"
                      class="w-full h-28 object-cover rounded-lg border border-gray-200 bg-gray-50" />
                    <span
                      class="absolute bottom-1 left-1 text-xs bg-black/50 text-white px-1.5 py-0.5 rounded">รายละเอียด</span>
                  </div>
                </div>
              </div>

            </div>


          </div>

          <!-- การชำระเงิน + สลิป -->
          <div class="bg-white border border-gray-200 rounded-xl p-5 mb-6">
            <h3 class="text-sm font-semibold text-gray-700 mb-3">การชำระเงิน</h3>
            <div class="flex items-center justify-between mb-4">
              <span class="text-sm text-gray-500">ยอดชำระ</span>
              <span class="text-base font-semibold text-emerald-600">{{ userData.totalAmount.toLocaleString() }}
                บาท</span>
            </div>
            <div v-if="paymentSlip.frontPreview"
              class="border border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center"
              style="min-height: 280px;">
              <img :src="paymentSlip.frontPreview" class="max-w-full max-h-72 object-contain" />
            </div>
            <div v-else
              class="border border-dashed border-gray-300 rounded-lg h-32 flex items-center justify-center bg-gray-50">
              <p class="text-sm text-gray-400">ไม่มีสลิปการชำระเงิน</p>
            </div>
          </div>

          <div class="flex justify-between gap-4">
            <button @click="goBackStep"
              class="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium">ย้อนกลับ</button>
            <button @click="handleConfirmation" :disabled="isLoading"
              class="px-8 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 transition-colors font-medium">
              {{ isLoading ? 'กำลังบันทึก...' : 'ยืนยันการมอบตัว' }}
            </button>
          </div>
        </div>

        <!-- Step 4: Success -->

        <div v-if="currentStep === 3" class="mb-8">
          <div class="text-center py-8">

            <!-- ไอคอน -->
            <div class="relative w-24 h-24 mx-auto mb-6">
              <div class="absolute inset-0 rounded-full animate-ping opacity-20"
                :class="userData.status === 'enrolled' ? 'bg-emerald-400' : 'bg-amber-400'"></div>
              <div class="relative w-24 h-24 rounded-full flex items-center justify-center shadow-lg"
                :class="userData.status === 'enrolled' ? 'bg-gradient-to-br from-emerald-400 to-emerald-600' : 'bg-gradient-to-br from-amber-400 to-amber-600'">
                <CheckBadgeIcon class="w-12 h-12 text-white" />
              </div>
            </div>

            <!-- enrolled -->
            <template v-if="userData.status === 'enrolled'">
              <div
                class="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
                ได้รับการยืนยันแล้ว
              </div>
              <h2 class="text-2xl font-bold text-gray-800 mb-2">คุณได้รับการมอบตัวแล้ว 🎉</h2>
              <p class="text-gray-500 mb-8">ยินดีด้วย! การมอบตัวของคุณได้รับการยืนยันเรียบร้อยแล้ว</p>

              <!-- การ์ดข้อมูล -->
              <div
                class="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-5 max-w-md mx-auto mb-8 text-left">
                <div class="space-y-3">
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-500">ชื่อ-สกุล</span>
                    <span class="text-sm font-semibold text-gray-800">{{ userData.prefix }}{{ userData.fullName
                      }}</span>
                  </div>
                  <div class="border-t border-emerald-100"></div>
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-500">หลักสูตร</span>
                    <span class="text-sm font-semibold text-gray-800">{{ userData.curName }}</span>
                  </div>
                  <div class="border-t border-emerald-100"></div>
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-500">สาขาวิชา</span>
                    <span class="text-sm font-semibold text-gray-800">{{ userData.divName }}</span>
                  </div>
                  <div class="border-t border-emerald-100"></div>
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-500">ยอดชำระ</span>
                    <span class="text-sm font-bold text-emerald-600">{{ userData.totalAmount.toLocaleString() }}
                      บาท</span>
                  </div>
                </div>
              </div>

              <div class="flex flex-col sm:flex-row justify-center gap-3">
                <button @click="downloadPDFs"
                  class="px-6 py-3 border-2 border-emerald-500 text-emerald-600 rounded-xl hover:bg-emerald-50 transition-colors font-medium flex items-center justify-center gap-2">
                  <ArrowDownTrayIcon class="w-4 h-4" />
                  ดาวน์โหลดเอกสาร PDF
                </button>
                <button @click="router.push('/check-status')"
                  class="px-6 py-3  bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all font-medium shadow-md">
                  กลับหน้าหลัก
                </button>
              </div>
            </template>

            <!-- pending / อื่นๆ -->
            <template v-else>
              <div
                class="inline-flex items-center gap-2 bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
                <span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse inline-block"></span>
                รอการตรวจสอบ
              </div>
              <h2 class="text-2xl font-bold text-gray-800 mb-2">ระบบบันทึกการมอบตัวแล้ว</h2>
              <p class="text-gray-500 mb-2">ขอบคุณที่ดำเนินการมอบตัวเรียบร้อยแล้ว</p>
              <p class="text-sm text-amber-600 font-medium mb-8">กรุณารอเจ้าหน้าที่ตรวจสอบข้อมูล 1-3 วันทำการ</p>

              <div
                class="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 max-w-md mx-auto mb-8 text-left">
                <div class="flex items-start gap-3">
                  <div class="w-9 h-9 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-amber-700 mb-1">สถานะ: รอตรวจสอบ</p>
                    <p class="text-xs text-amber-600 leading-relaxed">
                      เจ้าหน้าที่จะตรวจสอบเอกสารและหลักฐานการชำระเงินของท่าน ภายใน 1-3 วันทำการ
                      เมื่อได้รับการยืนยันแล้วท่านจะสามารถดาวน์โหลดเอกสารได้</p>
                  </div>
                </div>
              </div>
               <div class="flex flex-col sm:flex-row justify-center gap-3">
    <button @click="currentStep = 0; userData.status = ''"
      class="px-6 py-3  border-2 border-emerald-500 text-emerald-600 rounded-xl hover:bg-emerald-50 transition-colors font-medium">
      ย้อนกลับแก้ไขข้อมูล
    </button>
    <button @click="router.push('/check-status')"
      class="px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium">
      กลับหน้าหลัก
    </button>
  </div>
</template>

          </div>
        </div>



      </template>
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

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  DocumentArrowUpIcon, BanknotesIcon, CheckCircleIcon,
  CheckIcon, DocumentTextIcon, PhotoIcon, CheckBadgeIcon, ArrowDownTrayIcon
} from '@heroicons/vue/24/outline'
import jsPDF from 'jspdf'
import api from '@/services/httpClient.ts'

interface HouseDoc {
  front: File | null
  frontPreview: string
  back: File | null
  backPreview: string
}

interface UserData {
  fullName: string
  prefix: string
  curName: string
  divName: string
  totalAmount: number
  status: string
}

interface SlipVerifyResult {
  valid: boolean
  amount?: number
  sender?: string
  receiver?: string
  date?: string
  message?: string
}

const router = useRouter()
const route = useRoute()
const idCard = route.params.idCard as string

const currentStep = ref(0)
const isLoading = ref(false)
const isLoadingData = ref(true)

const slipVerifyResult = ref<SlipVerifyResult | null>(null)
const isVerifyingSlip = ref(false)

const userData = ref<UserData>({ fullName: '', prefix: '', curName: '', divName: '', totalAmount: 0, status: '' })
const orderItems = ref<any[]>([])

const createHouseDoc = (): HouseDoc => ({ front: null, frontPreview: '', back: null, backPreview: '' })
const selfHouseRegistration = reactive<HouseDoc>(createHouseDoc())
const fatherHouseRegistration = reactive<HouseDoc>(createHouseDoc())
const motherHouseRegistration = reactive<HouseDoc>(createHouseDoc())
const paymentSlip = reactive<HouseDoc>(createHouseDoc())

const steps = [
  { label: 'อัปโหลดเอกสาร', sub: 'เอกสารประกอบการสมัคร', icon: DocumentArrowUpIcon },
  { label: 'หลักฐานการชำระเงิน', sub: 'สลิปการโอนเงิน', icon: BanknotesIcon },
  { label: 'ยืนยันข้อมูล', sub: 'มอบตัว', icon: CheckCircleIcon },
  { label: 'เสร็จสิ้น', sub: 'สำเร็จ', icon: CheckBadgeIcon },
]

onMounted(async () => {
  if (!idCard) { router.push('/check-status'); return }
  try {
    const res = await api.get(`/applications/check/${idCard}`)
    const data = res.data?.data
    console.log('data:', data) 

    userData.value = {
      fullName: data.full_name,
      prefix: data.prefix,
      curName: data.cur_name,
      divName: data.div_name,
      totalAmount: Number(data.total_amount) || 0,
      status: data.status,
    }
    try {
      const orderRes = await api.get(`/enrollments/orders/${idCard}`)
      if (orderRes.data?.data) {
        orderItems.value = orderRes.data.data
        console.log('orderItems:', JSON.stringify(orderItems.value, null, 2))
      }
    } catch (e: any) {
      console.warn('ไม่พบข้อมูล orders:', e?.response?.status)
      orderItems.value = [] // ตารางจะว่าง แต่ไม่ crash
    }

    // โหลดรูปเดิมที่เคยอัปโหลดไว้


const toUrl = (path: string) => {
  if (!path) return ''
  const cleanPath = path.replace(/\\/g, '/').replace(/^\//, '')
  return `http://localhost:13001/${cleanPath}`
}
  

if (data.self_front_url) selfHouseRegistration.frontPreview = toUrl(data.self_front_url)
if (data.self_back_url) selfHouseRegistration.backPreview = toUrl(data.self_back_url)
if (data.father_front_url) fatherHouseRegistration.frontPreview = toUrl(data.father_front_url)
if (data.father_back_url) fatherHouseRegistration.backPreview = toUrl(data.father_back_url)
if (data.mother_front_url) motherHouseRegistration.frontPreview = toUrl(data.mother_front_url)
if (data.mother_back_url) motherHouseRegistration.backPreview = toUrl(data.mother_back_url)
if (data.payment_slip_url) {
  paymentSlip.frontPreview = toUrl(data.payment_slip_url)
}

    if (data.status === 'enrolled') {
  currentStep.value = 3
} else if (data.status === 'pending_approve') {
  currentStep.value = 3  // รอ admin อยู่ก็ไป step สุดท้ายได้ แต่ไม่ต้องบล็อกการแก้
} else if (data.status === 'paid') {
  currentStep.value = 2
}

  } catch {
    showToast('error', 'โหลดข้อมูลไม่สำเร็จ', 'ไม่สามารถดึงข้อมูลได้ กรุณาลองใหม่')
    setTimeout(() => router.push('/check-status'), 2000)
  } finally {
    isLoadingData.value = false
  }
 
})

// ตรวจสอบว่าเอกสารครบก่อนไป step ถัดไป
const isAllDocumentsUploaded = computed(() => {
  if (currentStep.value === 0) {
    return !!(selfHouseRegistration.frontPreview && selfHouseRegistration.backPreview)
  }
  if (currentStep.value === 1) {

 return !!paymentSlip.frontPreview
  }
  return true
})

const handleUpload = (target: HouseDoc, side: 'front' | 'back', event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  target[side] = file
  const reader = new FileReader()
  reader.onload = (e) => {
    const result = e.target?.result as string
    if (side === 'front') target.frontPreview = result
    else target.backPreview = result
  }
  reader.readAsDataURL(file)
}

// ✅ อัปสลิป → ตรวจ Slipok → ถ้าผ่าน status จะเป็น paid (backend จัดการ)
const handleSlipUpload = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  paymentSlip.front = file
  const reader = new FileReader()
  reader.onload = (e) => { paymentSlip.frontPreview = e.target?.result as string }
  reader.readAsDataURL(file)

  isVerifyingSlip.value = true
  slipVerifyResult.value = null

  try {
    const form = new FormData()
    form.append('slip', file)
    form.append('idCard', idCard)

    const res = await api.post('/enrollments/verify-slip', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    const result: SlipVerifyResult = res.data.data
    slipVerifyResult.value = result

    if (result.valid) {
      showToast('success', 'อัปโหลดสลิปสำเร็จ ✅', `ยอดโอน ${result.amount?.toLocaleString()} บาท กรุณากดถัดไปเพื่อดำเนินการต่อ`)
   } else {
  showToast('error', 'สลิปอาจมีปัญหา ⚠️', result.message || 'Admin จะตรวจสอบอีกครั้ง')
}

  } catch {
    paymentSlip.front = null
    paymentSlip.frontPreview = ''
    slipVerifyResult.value = null
    showToast('error', 'ตรวจสอบไม่สำเร็จ', 'กรุณาลองใหม่อีกครั้ง')
  } finally {
    isVerifyingSlip.value = false
      ; (event.target as HTMLInputElement).value = ''
  }
}

const goBack = () => router.push('/check-status')
const goBackStep = () => { if (currentStep.value > 0) currentStep.value-- }

const handleNextClick = () => {

  const status = userData.value.status

    if (userData.value.status === 'enrolled' && currentStep.value === 3) {
    return
  }

  if (status === 'enrolled' || status === 'paid') {
  showToast('error', 'มอบตัวเรียบร้อยแล้ว', '')
  return
}
  if (!isAllDocumentsUploaded.value) {
 showToast('error', 'กรุณาอัปโหลดสลิป', 'กรุณาอัปโหลดหลักฐานการชำระเงินก่อนดำเนินการต่อ')
    return
  }

  if (currentStep.value < steps.length - 1) currentStep.value++
}

const handleConfirmation = async () => {
  isLoading.value = true
  try {
    const formData = new FormData()
    formData.append('idCard', idCard)

    if (selfHouseRegistration.front) formData.append('self_front', selfHouseRegistration.front)
    if (selfHouseRegistration.back) formData.append('self_back', selfHouseRegistration.back)
    if (fatherHouseRegistration.front) formData.append('father_front', fatherHouseRegistration.front)
    if (fatherHouseRegistration.back) formData.append('father_back', fatherHouseRegistration.back)
    if (motherHouseRegistration.front) formData.append('mother_front', motherHouseRegistration.front)
    if (motherHouseRegistration.back) formData.append('mother_back', motherHouseRegistration.back)
    if (paymentSlip.front) formData.append('payment_slip', paymentSlip.front)

    await api.post('/enrollments/confirm', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    // ✅ อัปเดต local status และ generate PDF เสมอ
    userData.value.status = 'pending_approve'


    currentStep.value = 3

  } catch (error: any) {
    showToast('error', 'เกิดข้อผิดพลาด', error.response?.data?.message || 'ไม่สามารถบันทึกข้อมูลได้')
  } finally {
    isLoading.value = false
  }
}

const downloadPDFs = async () => {
  await generateCombinedPDF()
}


// --- เพิ่มโค้ดส่วนนี้เข้าไปครับ ---
const loadFont = async () => {
  try {
    // ดึงไฟล์จาก public/fonts/THSarabunNew.ttf
    const response = await fetch('/fonts/THSarabunNew.ttf');
    if (!response.ok) throw new Error('ไม่พบไฟล์ฟอนต์ในโฟลเดอร์ public');

    const blob = await response.blob();
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        // แปลงเป็น Base64 string เพื่อส่งให้ jsPDF
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Font loading error:', error);
    throw error;
  }
};


async function generateCombinedPDF() {
  try {
    const fontBase64 = await loadFont()
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    doc.addFileToVFS('THSarabunNew.ttf', fontBase64)
    doc.addFont('THSarabunNew.ttf', 'THSarabun', 'normal')
    doc.addFont('THSarabunNew.ttf', 'THSarabun', 'bold')

    const pageW = 210
    const margin = 20
    const contentW = pageW - margin * 2
    const now = new Date().toLocaleString('th-TH', { dateStyle: 'full', timeStyle: 'short' })
    const fullName = `${userData.value.prefix}${userData.value.fullName}`

    const setFont = (style: 'normal' | 'bold', size: number, color = '#111827') => {
      doc.setFont('THSarabun', style)
      doc.setFontSize(size)
      const hex = color.replace('#', '')
      const r = parseInt(hex.substring(0, 2), 16)
      const g = parseInt(hex.substring(2, 4), 16)
      const b = parseInt(hex.substring(4, 6), 16)
      doc.setTextColor(r, g, b)
    }

    // ── HEADER ────────────────────────────────────────────────────
    doc.setFillColor(5, 150, 105)
    doc.rect(0, 0, pageW, 38, 'F')

    setFont('bold', 18, '#ffffff')
    doc.text('วิทยาลัยเทคนิคเลย', pageW / 2, 11, { align: 'center' })
    setFont('normal', 11, '#d1fae5')
    doc.text('272 ถ.เจริญรัฐ ต.กุดป่อง อ.เมือง จ.เลย 42000  โทร 042811591', pageW / 2, 19, { align: 'center' })
    setFont('normal', 11, '#d1fae5')
    doc.text('ระบบรับสมัครนักเรียนนักศึกษาออนไลน์', pageW / 2, 27, { align: 'center' })

    doc.setFillColor(240, 253, 244)
    doc.rect(0, 38, pageW, 14, 'F')
    doc.setDrawColor(5, 150, 105)
    doc.setLineWidth(0.5)
    doc.line(0, 38, pageW, 38)
    doc.line(0, 52, pageW, 52)
    setFont('bold', 16, '#065f46')
    doc.text('เอกสารการมอบตัวนักเรียนนักศึกษา', pageW / 2, 48, { align: 'center' })

    // ── ส่วนที่ 1: ใบรับรองการมอบตัว ────────────────────────────
    let y = 54
    const col1 = margin + 5
    const col2 = margin + contentW / 2 + 5
    const labelColor = '#6b7280'
    const valueColor = '#111827'

    doc.setFillColor(5, 150, 105)
    doc.roundedRect(margin, y, contentW, 9, 2, 2, 'F')
    setFont('bold', 13, '#ffffff')
    doc.text('ส่วนที่ 1  ใบรับรองการมอบตัว', margin + 4, y + 6.5)
    y += 14

    // กล่องข้อมูลนักเรียน
    doc.setFillColor(248, 250, 252)
    doc.setDrawColor(209, 213, 219)
    doc.setLineWidth(0.3)
    doc.roundedRect(margin, y, contentW, 42, 3, 3, 'FD')

    setFont('normal', 10, labelColor); doc.text('ชื่อ-นามสกุล', col1, y + 8)
    setFont('bold', 13, valueColor); doc.text(fullName, col1, y + 16)

    setFont('normal', 10, labelColor); doc.text('วันที่มอบตัว', col2, y + 8)
    setFont('bold', 13, valueColor)
    doc.text(new Date().toLocaleDateString('th-TH', { dateStyle: 'long' }), col2, y + 16)

    doc.setDrawColor(229, 231, 235)
    doc.setLineWidth(0.2)
    doc.line(margin + 4, y + 21, margin + contentW - 4, y + 21)

    setFont('normal', 10, labelColor); doc.text('หลักสูตร', col1, y + 28)
    setFont('bold', 13, valueColor); doc.text(userData.value.curName, col1, y + 36)

    setFont('normal', 10, labelColor); doc.text('สาขาวิชา', col2, y + 28)
    setFont('bold', 13, valueColor); doc.text(userData.value.divName, col2, y + 36)
    y += 47

    // กล่องยอดชำระ
    doc.setFillColor(236, 253, 245)
    doc.setDrawColor(16, 185, 129)
    doc.setLineWidth(0.4)
    doc.roundedRect(margin, y, contentW, 14, 3, 3, 'FD')
    setFont('normal', 11, '#065f46')
    doc.text('ยอดชำระเงิน', col1, y + 9.5)
    setFont('bold', 14, '#065f46')
    doc.text(`${userData.value.totalAmount.toLocaleString()} บาท`, margin + contentW - 5, y + 9.5, { align: 'right' })
    y += 19

    // สถานะ
    doc.setFillColor(5, 150, 105)
    doc.circle(col1 + 2.5, y + 4, 2.5, 'F')
    setFont('bold', 12, '#065f46')
    doc.text('สถานะ: มอบตัวเสร็จสมบูรณ์', col1 + 8, y + 6)
    y += 14

    // เส้นประแบ่ง
    doc.setDrawColor(209, 213, 219)
    doc.setLineWidth(0.3)
    doc.setLineDashPattern([2, 2], 0)
    doc.line(margin, y, margin + contentW, y)
    doc.setLineDashPattern([], 0)
    y += 8

    // ── ส่วนที่ 2: ใบสั่งซื้อเครื่องแบบ ─────────────────────────
    doc.setFillColor(37, 99, 235)
    doc.roundedRect(margin, y, contentW, 9, 2, 2, 'F')
    setFont('bold', 13, '#ffffff')
    doc.text('ส่วนที่ 2  ใบสั่งซื้อเครื่องแบบนักเรียน', margin + 4, y + 6.5)
    y += 14

    // แถบข้อมูลนักเรียน
    doc.setFillColor(239, 246, 255)
    doc.setDrawColor(147, 197, 253)
    doc.setLineWidth(0.3)
    doc.roundedRect(margin, y, contentW, 12, 2, 2, 'FD')
    setFont('normal', 10, '#1e40af')
    doc.text(
      `ชื่อ: ${fullName}   |   หลักสูตร: ${userData.value.curName}   |   สาขา: ${userData.value.divName}`,
      margin + 4, y + 8
    )
    y += 17

    // ── ตารางเครื่องแบบ ───────────────────────────────────────────
    const headers = ['ลำดับ', 'รายการเครื่องแบบ', 'ขนาด', 'จำนวน', 'ราคา/หน่วย', 'รวม']
    const colWidths = [12, 58, 20, 18, 22, 22]
    const tableRowH = 9

    const uniformItems = orderItems.value.map((item: any) => ({
      name: item.item_name ?? '',
      size: item.size ?? '-',
      qty: String(item.quantity ?? ''),
      price: String(item.unit_price ?? ''),
      total: String(item.total_price ?? ''),
    }))

    const totalRows = uniformItems.length || 8

    // หัวตาราง
    doc.setFillColor(37, 99, 235)
    doc.rect(margin, y, contentW, tableRowH, 'F')
    setFont('bold', 11, '#ffffff')
    let cx = margin
    headers.forEach((h, i) => {
      doc.text(h, cx + colWidths[i] / 2, y + 6.5, { align: 'center' })
      cx += colWidths[i]
    })
    y += tableRowH

    // แถวข้อมูลว่าง
    for (let r = 0; r < totalRows; r++) {
      // ✅ แก้ไข: ternary ที่ถูกต้อง
      const isEven = r % 2 === 0
      doc.setFillColor(isEven ? 255 : 245, isEven ? 255 : 249, isEven ? 255 : 255)
      doc.rect(margin, y, contentW, tableRowH, 'F')
      doc.setDrawColor(209, 213, 219)
      doc.setLineWidth(0.2)
      doc.rect(margin, y, contentW, tableRowH, 'S')

      // เลขลำดับ + เส้นแบ่งคอลัมน์
      cx = margin
      const item = uniformItems[r] ?? { name: '', size: '', qty: '', price: '', total: '' }
      colWidths.forEach((w, i) => {
        if (i > 0) doc.line(cx, y, cx, y + tableRowH)
        setFont('normal', 11, '#374151')
        if (i === 0) doc.text(`${r + 1}`, cx + w / 2, y + 6.2, { align: 'center' })
        else if (i === 1) doc.text(item.name, cx + 2, y + 6.2)
        else if (i === 2) doc.text(item.size, cx + w / 2, y + 6.2, { align: 'center' })
        else if (i === 3) doc.text(item.qty, cx + w / 2, y + 6.2, { align: 'center' })
        else if (i === 4) doc.text(item.price, cx + w - 2, y + 6.2, { align: 'right' })
        else if (i === 5) doc.text(item.total, cx + w - 2, y + 6.2, { align: 'right' })
        cx += w
      })
      y += tableRowH
    }

    // แถวรวมทั้งสิ้น
    doc.setFillColor(239, 246, 255)
    doc.rect(margin, y, contentW, tableRowH, 'F')
    doc.setDrawColor(147, 197, 253)
    doc.rect(margin, y, contentW, tableRowH, 'S')
    // เส้นแบ่งช่องรวม
    const lastColX = margin + colWidths.slice(0, 5).reduce((a, b) => a + b, 0)  // ✅ เพิ่ม
    const grandTotal = uniformItems.reduce((sum, item) => {
      return sum + (Number(item.total) || 0)
    }, 0)

    setFont('bold', 12, '#1e40af')
    doc.text('รวมทั้งสิ้น', lastColX - 3, y + 6.2, { align: 'right' })
    doc.text(grandTotal.toLocaleString(), margin + contentW - 2, y + 6.2, { align: 'right' })
    y += tableRowH + 10

    // ── ลายเซ็น ──────────────────────────────────────────────────
    const sigW = (contentW - 10) / 2
    const drawSig = (x: number, label: string) => {
      doc.setDrawColor(156, 163, 175)
      doc.setLineWidth(0.3)
      doc.line(x + 10, y + 16, x + sigW - 10, y + 16)
      setFont('normal', 11, '#374151')
      doc.text(label, x + sigW / 2, y + 22, { align: 'center' })
      doc.text('วันที่ ......../......../..........', x + sigW / 2, y + 29, { align: 'center' })
    }
    drawSig(margin, 'ลายมือชื่อผู้ปกครอง')
    drawSig(margin + sigW + 10, 'ลายมือชื่อนักเรียน')
    y += 35

    // ── FOOTER ───────────────────────────────────────────────────
    doc.setFillColor(243, 244, 246)
    doc.rect(0, 282, pageW, 15, 'F')
    doc.setDrawColor(209, 213, 219)
    doc.setLineWidth(0.2)
    doc.line(0, 282, pageW, 282)
    setFont('normal', 9, '#9ca3af')
    doc.text(`พิมพ์เมื่อ: ${now}`, margin, 289)
    doc.text('วิทยาลัยเทคนิคเลย — เอกสารนี้ออกโดยระบบอัตโนมัติ', pageW / 2, 289, { align: 'center' })
    doc.text('หน้า 1/1', pageW - margin, 289, { align: 'right' })

    doc.save(`เอกสารมอบตัว-${fullName}.pdf`)

  } catch (err) {
    console.error(err)
    showToast('error', 'สร้าง PDF ไม่สำเร็จ', 'กรุณาตรวจสอบไฟล์ font ที่ public/fonts/THSarabunNew.ttf')
  }
}

const toast = ref({ show: false, type: 'success' as 'success' | 'error', title: '', message: '' })
let toastTimer: ReturnType<typeof setTimeout> | null = null

const showToast = (type: 'success' | 'error', title: string, message: string) => {
  if (toastTimer) clearTimeout(toastTimer)
  toast.value = { show: true, type, title, message }
  toastTimer = setTimeout(() => { toast.value.show = false }, 4000)
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.4s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>