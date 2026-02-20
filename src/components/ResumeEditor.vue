<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useResumeStore } from '../stores/resume'
import { getProfiles, getResumeState, saveResumeState, addProfile, deleteProfile } from '../lib/resumeDb'
import html2pdf from 'html2pdf.js'
import SidebarLayout from './layouts/SidebarLayout.vue'
import ClassicLayout from './layouts/ClassicLayout.vue'
import AngelLayout from './layouts/AngelLayout.vue'
import ProLayout from './layouts/ProLayout.vue'
import AquaLayout from './layouts/AquaLayout.vue'

const LAYOUTS = [
  { id: 'sidebar', label: 'Sidebar',  title: 'Sidebar layout with profile & contact on the left', component: SidebarLayout },
  { id: 'classic', label: 'Classic',  title: 'Classic style like Jade Urban PDF', component: ClassicLayout },
  { id: 'angel',   label: 'Angel',    title: 'Modern, cool template', component: AngelLayout },
  { id: 'pro',     label: 'Pro',      title: 'Professional dark-header layout', component: ProLayout },
  { id: 'aqua',    label: 'Aqua',     title: 'Teal sidebar with photo, summary & work history', component: AquaLayout },
]

// Neutral placeholder for new users (matches server BLANK_RESUME_STATE)
const PLACEHOLDER_AVATAR =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle fill='%23e5e7eb' cx='50' cy='50' r='50'/%3E%3Ccircle fill='%239ca3af' cx='50' cy='42' r='18'/%3E%3Cellipse fill='%239ca3af' cx='50' cy='95' rx='35' ry='25'/%3E%3C/svg%3E"

const resumeRef = ref(null)
const viewerContainerRef = ref(null)
const store = useResumeStore()
const isExporting = ref(false)
const currentLayoutId = ref('sidebar')
const profileImageInputRef = ref(null)
const profileTextareaRef = ref(null)
const profiles = ref([])
const currentProfileId = ref(null)
const dbReady = ref(false)
const userSwitcherOpen = ref(false)
const userSwitcherRef = ref(null)
const newUserName = ref('')
const showSaveSuccess = ref(false)
let saveSuccessTimeout = null
const deleteToast = ref({ show: false, success: true, message: '' })
let deleteToastTimeout = null

function serializeStore() {
  return {
    profileImage: store.profileImage,
    name: store.name,
    title: store.title,
    profile: store.profile,
    phone: store.phone,
    email: store.email,
    referenceNote: store.referenceNote,
    education: JSON.parse(JSON.stringify(store.education)),
    skills: [...store.skills],
    experience: JSON.parse(JSON.stringify(store.experience)),
    awards: [...store.awards],
    layoutColors: JSON.parse(JSON.stringify(store.layoutColors)),
  }
}

function hydrateStore(data) {
  if (!data) return
  if (data.profileImage != null) store.profileImage = data.profileImage
  if (data.name != null) store.name = data.name
  if (data.title != null) store.title = data.title
  if (data.profile != null) store.profile = data.profile
  if (data.phone != null) store.phone = formatPhone(data.phone)
  if (data.email != null) store.email = data.email
  if (data.referenceNote != null) store.referenceNote = data.referenceNote
  if (Array.isArray(data.education)) store.education.splice(0, store.education.length, ...data.education)
  if (Array.isArray(data.skills)) store.skills.splice(0, store.skills.length, ...data.skills)
  if (Array.isArray(data.experience)) store.experience.splice(0, store.experience.length, ...data.experience)
  if (Array.isArray(data.awards)) store.awards.splice(0, store.awards.length, ...data.awards)
  if (data.layoutColors && typeof data.layoutColors === 'object') {
    Object.keys(data.layoutColors).forEach((id) => {
      if (store.layoutColors[id] && data.layoutColors[id]) {
        if (data.layoutColors[id].primary != null) store.layoutColors[id].primary = data.layoutColors[id].primary
        if (data.layoutColors[id].secondary != null) store.layoutColors[id].secondary = data.layoutColors[id].secondary
      }
    })
  }
}

async function persistStore() {
  if (currentProfileId.value == null) return
  try {
    await saveResumeState(currentProfileId.value, serializeStore())
    showSaveSuccess.value = true
    if (saveSuccessTimeout) clearTimeout(saveSuccessTimeout)
    saveSuccessTimeout = setTimeout(() => {
      showSaveSuccess.value = false
      saveSuccessTimeout = null
    }, 2500)
  } catch (err) {
    console.error('Failed to save resume:', err)
  }
}

async function loadProfile(profileId) {
  const data = await getResumeState(profileId)
  hydrateStore(data)
  currentProfileId.value = profileId
  try {
    localStorage.setItem('jade-resume-current-user', String(profileId))
  } catch (_) {}
}

async function switchProfile(profileId) {
  await persistStore()
  await loadProfile(profileId)
  userSwitcherOpen.value = false
}

async function addUser() {
  const name = newUserName.value.trim() || 'New User'
  newUserName.value = ''
  try {
    const id = await addProfile(name)
    profiles.value = await getProfiles()
    await loadProfile(id)
    userSwitcherOpen.value = false
  } catch (err) {
    console.error('Failed to add user:', err)
  }
}

async function deleteUser(profileId, event) {
  event?.stopPropagation()
  if (profiles.value.length <= 1) return
  try {
    await deleteProfile(profileId)
    const wasCurrent = currentProfileId.value === profileId
    profiles.value = await getProfiles()
    if (wasCurrent) {
      const next = profiles.value[0]
      if (next) await loadProfile(next.id)
      else currentProfileId.value = null
    }
    userSwitcherOpen.value = false
    deleteToast.value = { show: true, success: true, message: 'User deleted' }
  } catch (err) {
    console.error('Failed to delete user:', err)
    deleteToast.value = { show: true, success: false, message: 'Failed to delete user' }
  }
  if (deleteToastTimeout) clearTimeout(deleteToastTimeout)
  deleteToastTimeout = setTimeout(() => {
    deleteToast.value = { ...deleteToast.value, show: false }
    deleteToastTimeout = null
  }, 2500)
}

const currentProfileName = computed(() => {
  const p = profiles.value.find((x) => x.id === currentProfileId.value)
  return p?.name ?? '—'
})

const defaultProfileImage = computed(() =>
  currentProfileName.value === 'Jade Urban' ? '/JadeResume.png' : PLACEHOLDER_AVATAR
)

function resizeProfileTextarea() {
  const el = profileTextareaRef.value
  if (!el) return
  el.style.height = 'auto'
  const min = 80
  const max = 420
  const h = Math.min(max, Math.max(min, el.scrollHeight))
  el.style.height = `${h}px`
}

function formatPhone(value) {
  const digits = String(value ?? '').replace(/\D/g, '').slice(0, 10)
  if (digits.length <= 3) return digits.length ? `(${digits}` : ''
  if (digits.length <= 6) return `(${digits.slice(0, 3)})${digits.slice(3)}`
  return `(${digits.slice(0, 3)})${digits.slice(3, 6)}-${digits.slice(6)}`
}

function onPhoneInput(e) {
  const formatted = formatPhone(e.target.value)
  store.phone = formatted
  nextTick(() => {
    e.target.setSelectionRange(formatted.length, formatted.length)
  })
}

function onProfileImageChange(e) {
  const file = e.target.files?.[0]
  if (!file || !file.type.startsWith('image/')) return
  const reader = new FileReader()
  reader.onload = () => {
    store.profileImage = reader.result
    persistStore()
  }
  reader.readAsDataURL(file)
  e.target.value = ''
}

const currentLayout = computed(() => LAYOUTS.find(l => l.id === currentLayoutId.value))

// Second page when there are too many education or experience items; page 1 is never changed
const EDUCATION_PER_PAGE_1 = 2
const EXPERIENCE_PER_PAGE_1 = 3
const resumeTotalPages = computed(() => {
  const needSecond = store.education.length > EDUCATION_PER_PAGE_1 || store.experience.length > EXPERIENCE_PER_PAGE_1
  return needSecond ? 2 : 1
})

// Static page size (A4): same in preview, PDF, and print. 210mm × 297mm.
const PAGE_WIDTH_MM = 210
const PAGE_HEIGHT_MM = 297
const A4_WIDTH_PX = 793.7   // PAGE_WIDTH_MM at 96dpi
const A4_HEIGHT_PX = 1122.5 // PAGE_HEIGHT_MM at 96dpi
// Small thumb for inline toolbar (width 44px)
const thumbScale = 44 / A4_WIDTH_PX

const viewerScale = ref(0.5)

function updateViewerScale() {
  if (!viewerContainerRef.value) return
  const { clientWidth: w, clientHeight: h } = viewerContainerRef.value
  const fitScale = Math.min(w / A4_WIDTH_PX, h / A4_HEIGHT_PX, 1) * 0.94
  viewerScale.value = Math.max(0.25, fitScale)
}

let resizeObserver
onMounted(async () => {
  try {
    const list = await getProfiles()
    profiles.value = list
    let id = currentProfileId.value
    if (id == null) {
      try {
        const saved = localStorage.getItem('jade-resume-current-user')
        if (saved) id = parseInt(saved, 10)
      } catch (_) {}
    }
    if (id == null || !list.some((p) => p.id === id)) id = list[0]?.id ?? null
    if (id != null) await loadProfile(id)
  } catch (err) {
    console.error('Failed to load database:', err)
  } finally {
    dbReady.value = true
  }
  nextTick(() => {
    updateViewerScale()
    resizeObserver = new ResizeObserver(updateViewerScale)
    if (viewerContainerRef.value) resizeObserver.observe(viewerContainerRef.value)
    resizeProfileTextarea()
  })
  document.addEventListener('click', onUserSwitcherClickOutside)
})

watch(() => store.profile, () => nextTick(resizeProfileTextarea))
onUnmounted(() => {
  if (resizeObserver && viewerContainerRef.value) resizeObserver.disconnect()
  document.removeEventListener('click', onUserSwitcherClickOutside)
})

function onUserSwitcherClickOutside(e) {
  if (userSwitcherRef.value && !userSwitcherRef.value.contains(e.target)) {
    userSwitcherOpen.value = false
  }
}

async function exportPdf() {
  if (!resumeRef.value || isExporting.value) return
  isExporting.value = true
  const el = resumeRef.value
  // Remove gap so total height is exactly N×A4 (avoids extra blank PDF page)
  const prevGap = el.style.gap
  const prevRowGap = el.style.rowGap
  el.style.gap = '0'
  el.style.rowGap = '0'
  await nextTick()
  const fullHeight = Math.max(el.scrollHeight, resumeTotalPages.value * A4_HEIGHT_PX)
  const opt = {
    margin: 0,
    filename: 'resume.pdf',
    image: { type: 'jpeg', quality: 0.95 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      logging: false,
      letterRendering: true,
      backgroundColor: '#ffffff',
      width: Math.round(A4_WIDTH_PX),
      height: Math.round(fullHeight),
      scrollX: 0,
      scrollY: 0,
      x: 0,
      y: 0,
      ignoreElements: (el) => el.classList.contains('resume-sidebar-bg'),
      onclone(clonedDoc, clonedEl) {
        try {
          clonedEl.style.gap = '0'
          clonedEl.style.rowGap = '0'
          const style = clonedDoc.createElement('style')
          style.textContent = '* { -webkit-print-color-adjust: exact; print-color-adjust: exact; }'
          clonedDoc.head.appendChild(style)
          const getVar = (el, name, fallback) => (getComputedStyle(el).getPropertyValue(name) ?? '').trim() || fallback
          const sidebarTheme = clonedEl.querySelector('.sidebar-theme, [class*="sidebar-theme"]')
          if (sidebarTheme) {
            const primary = getVar(sidebarTheme, '--sidebar-primary', '#1e2442')
            const secondary = getVar(sidebarTheme, '--sidebar-secondary', '#667eea')
            sidebarTheme.querySelectorAll('.resume-sidebar').forEach((el) => { el.style.background = primary })
            sidebarTheme.querySelectorAll('.resume-sidebar-photo').forEach((el) => { el.style.background = secondary })
          }
          clonedEl.querySelectorAll('.aqua-sidebar-bg').forEach((el) => {
            el.style.background = getVar(el, '--aqua-primary', '#7dc4c4')
          })
          clonedEl.querySelectorAll('.classic-sidebar').forEach((el) => {
            el.style.background = getVar(el, '--classic-primary', '#3d3d3d')
          })
          clonedEl.querySelectorAll('.angel-accent-dot').forEach((el) => {
            el.style.background = getVar(el, '--angel-primary', '#0d9488')
          })
          clonedEl.querySelectorAll('.pro-accent-bar').forEach((el) => {
            el.style.background = getVar(el, '--pro-secondary', '#555')
          })
          clonedEl.querySelectorAll('.pro-header').forEach((el) => {
            el.style.background = getVar(el, '--pro-primary', '#3c3c3c')
          })
        } catch (e) {
          console.warn('PDF onclone:', e)
        }
      },
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: 'avoid-all' },
  }
  html2pdf()
    .set(opt)
    .from(el)
    .toPdf()
    .get('pdf')
    .then((pdf) => {
      pdf.save(opt.filename)
    })
    .catch((err) => {
      console.error('PDF export failed:', err)
      alert('Could not generate PDF. Try another layout or check the browser console for details.')
    })
    .finally(() => {
      el.style.gap = prevGap
      el.style.rowGap = prevRowGap
      isExporting.value = false
    })
}
</script>

<template>
  <div class="flex h-screen flex-col overflow-hidden bg-gradient-to-br from-resume-accent to-resume-purple">
    <!-- Save success toast (centered) -->
    <Transition name="save-toast">
      <div
        v-if="showSaveSuccess"
        class="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center"
        aria-live="polite"
        aria-label="Saved successfully"
      >
        <div
          class="save-toast-card flex flex-col items-center gap-4 rounded-2xl border border-white/20 bg-white/95 px-8 py-6 shadow-2xl backdrop-blur-xl"
        >
          <div
            class="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/90 shadow-lg shadow-emerald-500/30"
          >
            <svg
              class="h-8 w-8 text-white"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              viewBox="0 0 24 24"
            >
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p class="text-lg font-semibold text-gray-800">Saved successfully</p>
        </div>
      </div>
    </Transition>

    <!-- Delete user toast (success or failure) -->
    <Transition name="save-toast">
      <div
        v-if="deleteToast.show"
        class="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center"
        aria-live="polite"
        :aria-label="deleteToast.message"
      >
        <div
          class="save-toast-card flex flex-col items-center gap-4 rounded-2xl border border-white/20 bg-white/95 px-8 py-6 shadow-2xl backdrop-blur-xl"
        >
          <div
            v-if="deleteToast.success"
            class="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/90 shadow-lg shadow-emerald-500/30"
          >
            <svg
              class="h-8 w-8 text-white"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              viewBox="0 0 24 24"
            >
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div
            v-else
            class="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/90 shadow-lg shadow-red-500/30"
          >
            <svg
              class="h-8 w-8 text-white"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              viewBox="0 0 24 24"
            >
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p class="text-lg font-semibold text-gray-800">{{ deleteToast.message }}</p>
        </div>
      </div>
    </Transition>

    <!-- Toolbar -->
    <header class="flex shrink-0 items-center gap-6 bg-black/90 px-6 py-3 shadow-lg backdrop-blur">
      <!-- User switcher (top left) -->
      <div ref="userSwitcherRef" class="relative shrink-0">
        <button
          type="button"
          class="flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white/90 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-resume-accent focus:ring-offset-2 focus:ring-offset-black/90"
          :class="userSwitcherOpen && 'bg-white/10'"
          :disabled="!dbReady"
          aria-haspopup="listbox"
          :aria-expanded="userSwitcherOpen"
          @click="userSwitcherOpen = !userSwitcherOpen"
        >
          <span class="font-medium">{{ currentProfileName }}</span>
          <svg class="h-4 w-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div
          v-show="userSwitcherOpen"
          class="absolute left-0 top-full z-50 mt-2 min-w-[180px] rounded-lg border border-white/20 bg-black/95 py-2 shadow-xl backdrop-blur"
          role="listbox"
        >
          <div
            v-for="p in profiles"
            :key="p.id"
            role="option"
            class="flex w-full items-center justify-between gap-2 px-4 py-2 text-sm text-white/90"
            :class="currentProfileId === p.id && 'bg-white/10 font-medium'"
          >
            <button
              type="button"
              class="min-w-0 flex-1 text-left hover:bg-white/10"
              @click="switchProfile(p.id)"
            >
              {{ p.name }}
            </button>
            <button
              type="button"
              class="shrink-0 rounded p-1 text-white/60 hover:bg-red-500/20 hover:text-red-300 focus:outline-none focus:ring-2 focus:ring-red-400 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-white/60"
              :disabled="profiles.length <= 1"
              :title="profiles.length <= 1 ? 'Cannot delete the last user' : 'Delete user'"
              aria-label="Delete user"
              @click="deleteUser(p.id, $event)"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V7a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
          <div class="mt-2 border-t border-white/20 px-3 pt-2">
            <input
              v-model="newUserName"
              type="text"
              placeholder="New user name"
              class="mb-2 w-full rounded border border-white/20 bg-white/10 px-2 py-1.5 text-sm text-white placeholder-white/50 focus:border-resume-accent focus:outline-none"
              @keydown.enter="addUser()"
            />
            <button
              type="button"
              class="w-full rounded bg-white/10 py-1.5 text-sm text-white hover:bg-white/20"
              @click="addUser()"
            >
              + Add user
            </button>
          </div>
        </div>
      </div>
      <h1 class="shrink-0 text-lg font-semibold tracking-tight text-white">Resume Editor</h1>
      <div class="flex min-w-0 flex-1 justify-center gap-6" role="group" aria-label="Choose layout">
        <button
          v-for="layout in LAYOUTS"
          :key="layout.id"
          type="button"
          :title="layout.title"
          class="flex flex-col items-center rounded-lg py-1 transition focus:outline-none focus:ring-2 focus:ring-resume-accent focus:ring-offset-2 focus:ring-offset-black/90"
          :class="currentLayoutId === layout.id ? 'ring-2 ring-resume-accent ring-offset-2 ring-offset-black/90' : 'hover:bg-white/10'"
          @click="currentLayoutId = layout.id"
        >
          <div class="relative h-[62px] w-[44px] shrink-0 overflow-hidden rounded border border-white/20 bg-white shadow-inner">
            <div
              class="absolute left-0 top-0 origin-top-left overflow-hidden bg-white"
              :style="{
                width: A4_WIDTH_PX + 'px',
                height: A4_HEIGHT_PX + 'px',
                transform: `scale(${thumbScale})`,
              }"
            >
              <component :is="layout.component" />
            </div>
          </div>
          <span class="mt-0.5 text-[10px] font-medium text-white/90">{{ layout.label }}</span>
        </button>
      </div>
      <button
        type="button"
        class="rounded-lg border-2 border-white/60 bg-white/10 px-5 py-2.5 font-semibold text-white backdrop-blur transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white"
        @click="persistStore"
      >
        Save
      </button>
      <button
        type="button"
        class="rounded-lg bg-gradient-to-r from-resume-accent to-resume-purple px-6 py-2.5 font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl disabled:pointer-events-none disabled:opacity-60"
        :disabled="isExporting"
        @click="exportPdf"
      >
        {{ isExporting ? 'Generating…' : 'Save as PDF' }}
      </button>
    </header>

    <!-- Main: preview left, edit form right -->
    <div class="flex min-h-0 flex-1 gap-4 overflow-hidden p-4">

      <!-- Left: PDF preview -->
      <div class="flex min-h-0 min-w-0 flex-1 flex-col" style="max-width: 50%;">
        <p class="mb-2 shrink-0 text-center text-xs font-medium text-white/90">
          PDF preview — this is how your resume will look when saved
        </p>
        <div
          ref="viewerContainerRef"
          class="flex min-h-0 flex-1 justify-center overflow-y-auto overflow-x-hidden rounded-lg bg-black/20 pt-4"
        >
          <div
            class="viewer-scaler shrink-0 origin-top self-start"
            :style="{ transform: `scale(${viewerScale})` }"
          >
            <!-- Static page size: 210mm × 297mm (A4). Preview = PDF = print. -->
            <div ref="resumeRef" class="resume-pages flex flex-col gap-6">
              <div
                class="resume-paper shrink-0 overflow-hidden rounded-sm bg-white shadow-2xl"
                :style="{ width: PAGE_WIDTH_MM + 'mm', height: PAGE_HEIGHT_MM + 'mm' }"
              >
                <div class="resume-inner flex h-full w-full overflow-hidden">
                  <component :is="currentLayout.component" :page="1" :total-pages="resumeTotalPages" />
                </div>
              </div>
              <div
                v-if="resumeTotalPages > 1"
                class="resume-paper shrink-0 overflow-hidden rounded-sm bg-white shadow-2xl"
                :style="{ width: PAGE_WIDTH_MM + 'mm', height: PAGE_HEIGHT_MM + 'mm' }"
              >
                <div class="resume-inner flex h-full w-full overflow-hidden">
                  <component :is="currentLayout.component" :page="2" :total-pages="resumeTotalPages" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Edit form (always visible) -->
      <div class="edit-panel flex min-w-0 flex-1 flex-col overflow-hidden rounded-lg bg-white/95 shadow-xl backdrop-blur">
        <div class="flex-1 overflow-y-auto p-6">
          <h2 class="mb-8 text-lg font-semibold text-resume-navy">Edit resume</h2>

          <fieldset class="mb-8">
            <legend class="mb-4 text-sm font-bold uppercase tracking-wide text-gray-500">Header</legend>
            <label class="mb-2 block text-xs font-medium text-gray-600">Profile picture</label>
            <div class="mb-4 flex items-center gap-4">
              <div class="h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-gray-200 bg-gray-100">
                <img :src="store.profileImage" alt="Profile" class="h-full w-full object-cover" @error="($event.target).style.display = 'none'" />
              </div>
              <div class="min-w-0 flex-1">
                <input
                  ref="profileImageInputRef"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="onProfileImageChange"
                />
                <button
                  type="button"
                  class="rounded border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-resume-accent"
                  @click="profileImageInputRef?.click()"
                >
                  Choose image
                </button>
                <button
                  v-if="store.profileImage && store.profileImage !== defaultProfileImage"
                  type="button"
                  class="ml-2 rounded border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-600 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-resume-accent"
                  @click="store.profileImage = defaultProfileImage; persistStore()"
                >
                  Reset to default
                </button>
              </div>
            </div>
            <label class="mb-2 block text-xs font-medium text-gray-600">Name</label>
            <input v-model="store.name" type="text" class="field-input mb-4 w-full rounded border border-gray-300 px-3 py-2 text-sm" />
            <label class="mb-2 block text-xs font-medium text-gray-600">Title</label>
            <input v-model="store.title" type="text" class="field-input w-full rounded border border-gray-300 px-3 py-2 text-sm" />
          </fieldset>

          <fieldset class="mb-8">
            <legend class="mb-4 text-sm font-bold uppercase tracking-wide text-gray-500">Layout colors</legend>
            <p class="mb-3 text-xs text-gray-500">Primary colors for the {{ currentLayout?.label }} layout.</p>
            <div class="mb-3 flex flex-wrap items-center gap-4">
              <label class="flex items-center gap-2">
                <span class="text-xs font-medium text-gray-600">Primary</span>
                <input
                  v-model="store.layoutColors[currentLayoutId].primary"
                  type="color"
                  class="h-9 w-14 cursor-pointer rounded border border-gray-300 bg-white p-0.5"
                  title="Primary color"
                />
                <span class="text-xs text-gray-500">{{ store.layoutColors[currentLayoutId]?.primary }}</span>
              </label>
              <label class="flex items-center gap-2">
                <span class="text-xs font-medium text-gray-600">Secondary</span>
                <input
                  v-model="store.layoutColors[currentLayoutId].secondary"
                  type="color"
                  class="h-9 w-14 cursor-pointer rounded border border-gray-300 bg-white p-0.5"
                  title="Secondary color"
                />
                <span class="text-xs text-gray-500">{{ store.layoutColors[currentLayoutId]?.secondary }}</span>
              </label>
            </div>
          </fieldset>

          <fieldset class="mb-8 min-w-0">
            <legend class="mb-4 text-sm font-bold uppercase tracking-wide text-gray-500">Profile</legend>
            <label class="mb-2 block text-xs font-medium text-gray-600">Profile text</label>
            <div class="min-w-0">
              <textarea
                ref="profileTextareaRef"
                v-model="store.profile"
                rows="3"
                class="field-input profile-textarea w-full min-w-0 resize-none rounded border border-gray-300 px-3 py-2 text-sm"
                @input="resizeProfileTextarea"
              />
            </div>
          </fieldset>

          <fieldset class="mb-8">
            <legend class="mb-4 text-sm font-bold uppercase tracking-wide text-gray-500">Contact</legend>
            <label class="mb-2 block text-xs font-medium text-gray-600">Phone</label>
            <input
              :value="store.phone"
              type="tel"
              inputmode="numeric"
              autocomplete="tel"
              placeholder="(555) 123-4567"
              class="field-input mb-4 w-full rounded border border-gray-300 px-3 py-2 text-sm"
              @input="onPhoneInput"
            />
            <label class="mb-2 block text-xs font-medium text-gray-600">Email</label>
            <input v-model="store.email" type="text" class="field-input mb-4 w-full rounded border border-gray-300 px-3 py-2 text-sm" />
            <label class="mb-2 block text-xs font-medium text-gray-600">Reference note</label>
            <input v-model="store.referenceNote" type="text" class="field-input w-full rounded border border-gray-300 px-3 py-2 text-sm" />
          </fieldset>

          <fieldset class="mb-8">
            <legend class="mb-4 text-sm font-bold uppercase tracking-wide text-gray-500">Education</legend>
            <div v-for="(edu, i) in store.education" :key="i" class="mb-5 rounded border border-gray-200 bg-gray-50/50 p-4">
              <div class="mb-3 flex items-center justify-end">
                <button
                  type="button"
                  class="rounded border border-gray-300 bg-gray-100 px-2 py-1.5 text-xs text-gray-600 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-resume-accent"
                  aria-label="Remove entry"
                  @click="store.education.splice(i, 1)"
                >
                  Remove
                </button>
              </div>
              <label class="mb-2 block text-xs font-medium text-gray-600">School</label>
              <input v-model="store.education[i].school" type="text" class="field-input mb-4 w-full rounded border border-gray-300 px-3 py-2 text-sm" />
              <label class="mb-2 block text-xs font-medium text-gray-600">Dates</label>
              <input v-model="store.education[i].dates" type="text" class="field-input mb-4 w-full rounded border border-gray-300 px-3 py-2 text-sm" />
              <label class="mb-2 block text-xs font-medium text-gray-600">Description</label>
              <textarea v-model="store.education[i].description" rows="4" class="field-input w-full resize-none overflow-hidden rounded border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <button
              type="button"
              class="rounded border border-dashed border-gray-400 bg-transparent px-3 py-2 text-sm text-gray-600 hover:border-resume-accent hover:text-resume-accent focus:outline-none focus:ring-2 focus:ring-resume-accent"
              @click="store.education.push({ school: '', dates: '', description: '' })"
            >
              + Add Entry
            </button>
          </fieldset>

          <fieldset class="mb-8">
            <legend class="mb-4 text-sm font-bold uppercase tracking-wide text-gray-500">Work Experience</legend>
            <div v-for="(job, i) in store.experience" :key="i" class="mb-5 rounded border border-gray-200 bg-gray-50/50 p-4">
              <div class="mb-3 flex items-center justify-end">
                <button
                  type="button"
                  class="rounded border border-gray-300 bg-gray-100 px-2 py-1.5 text-xs text-gray-600 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-resume-accent"
                  aria-label="Remove entry"
                  @click="store.experience.splice(i, 1)"
                >
                  Remove
                </button>
              </div>
              <label class="mb-2 block text-xs font-medium text-gray-600">Role / Company</label>
              <input v-model="store.experience[i].role" type="text" class="field-input mb-4 w-full rounded border border-gray-300 px-3 py-2 text-sm" />
              <label class="mb-2 block text-xs font-medium text-gray-600">Dates</label>
              <input v-model="store.experience[i].dates" type="text" class="field-input mb-4 w-full rounded border border-gray-300 px-3 py-2 text-sm" />
              <label class="mb-2 block text-xs font-medium text-gray-600">Description</label>
              <textarea v-model="store.experience[i].description" rows="5" class="field-input w-full resize-none overflow-hidden rounded border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <button
              type="button"
              class="rounded border border-dashed border-gray-400 bg-transparent px-3 py-2 text-sm text-gray-600 hover:border-resume-accent hover:text-resume-accent focus:outline-none focus:ring-2 focus:ring-resume-accent"
              @click="store.experience.push({ role: '', company: '', location: '', dates: '', description: '' })"
            >
              + Add Entry
            </button>
          </fieldset>

          <fieldset v-if="currentLayoutId === 'classic'" class="mb-8">
            <legend class="mb-4 text-sm font-bold uppercase tracking-wide text-gray-500">Skills</legend>
            <p class="mb-3 text-xs text-gray-500">Used in the Classic layout. One skill per line.</p>
            <div v-for="(skill, i) in store.skills" :key="i" class="mb-2 flex gap-2">
              <input v-model="store.skills[i]" type="text" class="field-input flex-1 rounded border border-gray-300 px-3 py-2 text-sm" placeholder="Skill name" />
              <button
                type="button"
                class="shrink-0 rounded border border-gray-300 bg-gray-100 px-2 py-1.5 text-xs text-gray-600 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-resume-accent"
                aria-label="Remove skill"
                @click="store.skills.splice(i, 1)"
              >
                Remove
              </button>
            </div>
            <button
              type="button"
              class="mt-2 rounded border border-dashed border-gray-400 bg-transparent px-3 py-2 text-sm text-gray-600 hover:border-resume-accent hover:text-resume-accent focus:outline-none focus:ring-2 focus:ring-resume-accent"
              @click="store.skills.push('')"
            >
              + Add skill
            </button>
          </fieldset>

          <fieldset class="mb-8">
            <legend class="mb-4 text-sm font-bold uppercase tracking-wide text-gray-500">Awards and Volunteer Work</legend>
            <div v-for="(item, i) in store.awards" :key="i" class="mb-2 flex gap-2">
              <input v-model="store.awards[i]" type="text" class="field-input flex-1 rounded border border-gray-300 px-3 py-2 text-sm" />
              <button
                type="button"
                class="shrink-0 rounded border border-gray-300 bg-gray-100 px-2 py-1.5 text-xs text-gray-600 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-resume-accent"
                aria-label="Remove entry"
                @click="store.awards.splice(i, 1)"
              >
                Remove
              </button>
            </div>
            <button
              type="button"
              class="rounded border border-dashed border-gray-400 bg-transparent px-3 py-2 text-sm text-gray-600 hover:border-resume-accent hover:text-resume-accent focus:outline-none focus:ring-2 focus:ring-resume-accent"
              @click="store.awards.push('')"
            >
              + Add Entry
            </button>
          </fieldset>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.field-input {
  overflow: hidden;
}
.profile-textarea {
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: pre-wrap;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
}
textarea.field-input {
  overflow-y: hidden;
  scrollbar-width: none;
}
textarea.field-input::-webkit-scrollbar {
  display: none;
}
.profile-textarea::-webkit-scrollbar {
  display: block;
  width: 6px;
}
.profile-textarea::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

/* Save success toast animation */
.save-toast-enter-active,
.save-toast-leave-active {
  transition: opacity 0.3s ease;
}
.save-toast-enter-active .save-toast-card,
.save-toast-leave-active .save-toast-card {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.save-toast-enter-from,
.save-toast-leave-to {
  opacity: 0;
}
.save-toast-enter-from .save-toast-card,
.save-toast-leave-to .save-toast-card {
  transform: scale(0.85);
}
.save-toast-enter-to .save-toast-card,
.save-toast-leave-from .save-toast-card {
  transform: scale(1);
}
</style>
