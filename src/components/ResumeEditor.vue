<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useResumeStore } from '../stores/resume'
import html2pdf from 'html2pdf.js'
import SidebarLayout from './layouts/SidebarLayout.vue'
import ClassicLayout from './layouts/ClassicLayout.vue'
import AngelLayout from './layouts/AngelLayout.vue'
import BlankLayout from './layouts/BlankLayout.vue'
import ProLayout from './layouts/ProLayout.vue'
import AquaLayout from './layouts/AquaLayout.vue'

const LAYOUTS = [
  { id: 'sidebar', label: 'Sidebar',  title: 'Sidebar layout with profile & contact on the left', component: SidebarLayout },
  { id: 'classic', label: 'Classic',  title: 'Classic style like Jade Urban PDF', component: ClassicLayout },
  { id: 'angel',   label: 'Angel',    title: 'Modern, cool template', component: AngelLayout },
  { id: 'blank',   label: 'Blank',    title: 'Clean single-column layout', component: BlankLayout },
  { id: 'pro',     label: 'Pro',      title: 'Professional dark-header layout', component: ProLayout },
  { id: 'aqua',    label: 'Aqua',     title: 'Teal sidebar with photo, summary & work history', component: AquaLayout },
]

const resumeRef = ref(null)
const viewerContainerRef = ref(null)
const store = useResumeStore()
const isExporting = ref(false)
const currentLayoutId = ref('sidebar')

const currentLayout = computed(() => LAYOUTS.find(l => l.id === currentLayoutId.value))

// A4 in px at 96dpi: 210mm ≈ 794px, 297mm ≈ 1122px
const A4_WIDTH_PX = 793.7
const A4_HEIGHT_PX = 1122.5

const viewerScale = ref(0.5)

function updateViewerScale() {
  if (!viewerContainerRef.value) return
  const { clientWidth: w, clientHeight: h } = viewerContainerRef.value
  const fitScale = Math.min(w / A4_WIDTH_PX, h / A4_HEIGHT_PX, 1) * 0.94
  viewerScale.value = Math.max(0.25, fitScale)
}

let resizeObserver
onMounted(() => {
  nextTick(() => {
    updateViewerScale()
    resizeObserver = new ResizeObserver(updateViewerScale)
    if (viewerContainerRef.value) resizeObserver.observe(viewerContainerRef.value)
  })
})
onUnmounted(() => {
  if (resizeObserver && viewerContainerRef.value) resizeObserver.disconnect()
})

async function exportPdf() {
  if (!resumeRef.value || isExporting.value) return
  isExporting.value = true
  const el = resumeRef.value
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
      height: Math.round(A4_HEIGHT_PX),
      scrollX: 0,
      scrollY: 0,
      x: 0,
      y: 0,
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
      while (pdf.getNumberOfPages() > 1) pdf.deletePage(pdf.getNumberOfPages())
      pdf.save(opt.filename)
    })
    .catch((err) => {
      console.error('PDF export failed:', err)
      window.print()
    })
    .finally(() => {
      isExporting.value = false
    })
}
</script>

<template>
  <div class="flex h-screen flex-col overflow-hidden bg-gradient-to-br from-resume-accent to-resume-purple">
    <!-- Toolbar -->
    <header class="flex shrink-0 items-center gap-4 bg-black/90 px-6 py-3 shadow-lg backdrop-blur">
      <h1 class="text-lg font-semibold tracking-tight text-white">Resume Editor</h1>
      <div class="ml-auto flex items-center gap-2">
        <span class="mr-2 text-xs font-medium text-white/70">Layout</span>
        <div class="flex rounded-lg border border-white/20 bg-white/5 p-0.5" role="group" aria-label="Choose layout">
          <button
            v-for="layout in LAYOUTS"
            :key="layout.id"
            type="button"
            :title="layout.title"
            class="rounded-md p-2 transition focus:outline-none focus:ring-2 focus:ring-resume-accent focus:ring-offset-2 focus:ring-offset-black/90"
            :class="currentLayoutId === layout.id ? 'bg-resume-accent/80 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'"
            @click="currentLayoutId = layout.id"
          >
            <!-- Sidebar -->
            <svg v-if="layout.id === 'sidebar'" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="7" height="18" rx="1" />
              <rect x="14" y="3" width="7" height="18" rx="1" />
            </svg>
            <!-- Classic -->
            <svg v-else-if="layout.id === 'classic'" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 5h18v2H3V5z" />
              <rect x="3" y="9" width="6" height="12" rx="0.5" />
              <rect x="12" y="9" width="9" height="12" rx="0.5" />
            </svg>
            <!-- Angel -->
            <svg v-else-if="layout.id === 'angel'" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2L14.5 8.5L21 9L16 13.5L17.5 20L12 17L6.5 20L8 13.5L3 9L9.5 8.5L12 2Z" />
            </svg>
            <!-- Pro -->
            <svg v-else-if="layout.id === 'pro'" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="5" rx="1" />
              <rect x="3" y="10" width="6" height="11" rx="0.5" />
              <rect x="12" y="10" width="9" height="11" rx="0.5" />
            </svg>
            <!-- Aqua -->
            <svg v-else-if="layout.id === 'aqua'" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="7" height="8" rx="1" />
              <rect x="3" y="13" width="7" height="8" rx="1" />
              <rect x="13" y="3" width="8" height="18" rx="1" />
            </svg>
            <!-- Blank -->
            <svg v-else class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <path d="M14 2v6h6" />
              <path d="M16 13H8" />
              <path d="M16 17H8" />
              <path d="M10 9H8" />
            </svg>
          </button>
        </div>
      </div>
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
          class="flex min-h-0 flex-1 justify-center overflow-hidden rounded-lg bg-black/20 pt-4"
        >
          <div
            class="viewer-scaler shrink-0 origin-top self-start"
            :style="{ transform: `scale(${viewerScale})` }"
          >
            <div
              ref="resumeRef"
              class="resume-paper h-[297mm] w-[210mm] overflow-hidden bg-white shadow-2xl"
            >
              <div class="resume-inner flex h-full w-full overflow-hidden">
                <component :is="currentLayout.component" />
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
            <label class="mb-2 block text-xs font-medium text-gray-600">Name</label>
            <input v-model="store.name" type="text" class="field-input mb-4 w-full rounded border border-gray-300 px-3 py-2 text-sm" />
            <label class="mb-2 block text-xs font-medium text-gray-600">Title</label>
            <input v-model="store.title" type="text" class="field-input w-full rounded border border-gray-300 px-3 py-2 text-sm" />
          </fieldset>

          <fieldset class="mb-8">
            <legend class="mb-4 text-sm font-bold uppercase tracking-wide text-gray-500">Profile</legend>
            <label class="mb-2 block text-xs font-medium text-gray-600">Profile text</label>
            <textarea v-model="store.profile" rows="8" class="field-input w-full resize-none overflow-hidden rounded border border-gray-300 px-3 py-2 text-sm" />
          </fieldset>

          <fieldset class="mb-8">
            <legend class="mb-4 text-sm font-bold uppercase tracking-wide text-gray-500">Contact</legend>
            <label class="mb-2 block text-xs font-medium text-gray-600">Phone</label>
            <input v-model="store.phone" type="text" class="field-input mb-4 w-full rounded border border-gray-300 px-3 py-2 text-sm" />
            <label class="mb-2 block text-xs font-medium text-gray-600">Email</label>
            <input v-model="store.email" type="text" class="field-input mb-4 w-full rounded border border-gray-300 px-3 py-2 text-sm" />
            <label class="mb-2 block text-xs font-medium text-gray-600">Reference note</label>
            <input v-model="store.referenceNote" type="text" class="field-input w-full rounded border border-gray-300 px-3 py-2 text-sm" />
          </fieldset>

          <fieldset class="mb-8">
            <legend class="mb-4 text-sm font-bold uppercase tracking-wide text-gray-500">Education</legend>
            <div v-for="(edu, i) in store.education" :key="i" class="mb-5 rounded border border-gray-200 bg-gray-50/50 p-4">
              <label class="mb-2 block text-xs font-medium text-gray-600">School</label>
              <input v-model="store.education[i].school" type="text" class="field-input mb-4 w-full rounded border border-gray-300 px-3 py-2 text-sm" />
              <label class="mb-2 block text-xs font-medium text-gray-600">Dates</label>
              <input v-model="store.education[i].dates" type="text" class="field-input mb-4 w-full rounded border border-gray-300 px-3 py-2 text-sm" />
              <label class="mb-2 block text-xs font-medium text-gray-600">Description</label>
              <textarea v-model="store.education[i].description" rows="4" class="field-input w-full resize-none overflow-hidden rounded border border-gray-300 px-3 py-2 text-sm" />
            </div>
          </fieldset>

          <fieldset class="mb-8">
            <legend class="mb-4 text-sm font-bold uppercase tracking-wide text-gray-500">Work Experience</legend>
            <div v-for="(job, i) in store.experience" :key="i" class="mb-5 rounded border border-gray-200 bg-gray-50/50 p-4">
              <label class="mb-2 block text-xs font-medium text-gray-600">Role / Company</label>
              <input v-model="store.experience[i].role" type="text" class="field-input mb-4 w-full rounded border border-gray-300 px-3 py-2 text-sm" />
              <label class="mb-2 block text-xs font-medium text-gray-600">Dates</label>
              <input v-model="store.experience[i].dates" type="text" class="field-input mb-4 w-full rounded border border-gray-300 px-3 py-2 text-sm" />
              <label class="mb-2 block text-xs font-medium text-gray-600">Description</label>
              <textarea v-model="store.experience[i].description" rows="5" class="field-input w-full resize-none overflow-hidden rounded border border-gray-300 px-3 py-2 text-sm" />
            </div>
          </fieldset>

          <fieldset class="mb-8">
            <legend class="mb-4 text-sm font-bold uppercase tracking-wide text-gray-500">Awards and Volunteer Work</legend>
            <div v-for="(item, i) in store.awards" :key="i" class="mb-3">
              <input v-model="store.awards[i]" type="text" class="field-input w-full rounded border border-gray-300 px-3 py-2 text-sm" />
            </div>
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
textarea.field-input {
  overflow-y: hidden;
  scrollbar-width: none;
}
textarea.field-input::-webkit-scrollbar {
  display: none;
}
</style>
