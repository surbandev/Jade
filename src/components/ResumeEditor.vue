<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useResumeStore } from '../stores/resume'
import html2pdf from 'html2pdf.js'

const LAYOUTS = [
  { id: 'sidebar', label: 'Sidebar', title: 'Sidebar layout with profile & contact on the left' },
  { id: 'classic', label: 'Classic', title: 'Classic style like Jade Urban PDF' },
  { id: 'angel', label: 'Angel', title: 'Modern, cool template' },
  { id: 'blank', label: 'Blank', title: 'Clean single-column layout' },
]

const resumeRef = ref(null)
const viewerContainerRef = ref(null)
const store = useResumeStore()
const isExporting = ref(false)
const currentLayout = ref('sidebar')

// A4 in px at 96dpi: 210mm ≈ 794px, 297mm ≈ 1122px
const A4_WIDTH_PX = 793.7
const A4_HEIGHT_PX = 1122.5

const viewerScale = ref(0.5)

function updateViewerScale() {
  if (!viewerContainerRef.value) return
  const { clientWidth: w, clientHeight: h } = viewerContainerRef.value
  // Scale so the full A4 page fits with a small margin (exactly what PDF will show)
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
      // Force A4 dimensions so capture isn't affected by preview's transform/position
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
      while (pdf.getNumberOfPages() > 1) {
        pdf.deletePage(pdf.getNumberOfPages())
      }
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
            :class="currentLayout === layout.id ? 'bg-resume-accent/80 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'"
            @click="currentLayout = layout.id"
          >
            <!-- Sidebar: two columns -->
            <svg v-if="layout.id === 'sidebar'" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="7" height="18" rx="1" />
              <rect x="14" y="3" width="7" height="18" rx="1" />
            </svg>
            <!-- Classic: two columns with header (Jade Urban style) -->
            <svg v-else-if="layout.id === 'classic'" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 5h18v2H3V5z" />
              <rect x="3" y="9" width="6" height="12" rx="0.5" />
              <rect x="12" y="9" width="9" height="12" rx="0.5" />
            </svg>
            <!-- Angel: modern template -->
            <svg v-else-if="layout.id === 'angel'" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2L14.5 8.5L21 9L16 13.5L17.5 20L12 17L6.5 20L8 13.5L3 9L9.5 8.5L12 2Z" />
            </svg>
            <!-- Blank: single column -->
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

    <!-- Main: viewer left, form right -->
    <div class="flex min-h-0 flex-1 gap-4 overflow-hidden p-4">
      <!-- Left: PDF preview (matches exported PDF) -->
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
              <!-- Sidebar layout: left column (profile/contact) + right (main) -->
              <div
                v-if="currentLayout === 'sidebar'"
                class="resume-content-scaled flex min-h-0 min-w-0 flex-1 overflow-hidden"
                style="transform: scale(0.97); transform-origin: top left; width: 216mm; min-height: 306mm;"
              >
                <aside class="resume-sidebar w-[270px] shrink-0 bg-gradient-to-b from-resume-navy-light to-resume-navy px-6 py-7 text-white">
                  <div class="mx-auto mb-5 h-[140px] w-[140px] overflow-hidden rounded-full border-4 border-white/20 bg-gradient-to-br from-resume-accent to-resume-purple shadow-xl">
                    <img src="/JadeResume.png" alt="Profile" class="h-full w-full object-cover" @error="($event.target).style.display = 'none'" />
                  </div>
                  <section class="mb-5">
                    <h2 class="mb-2 border-b-2 border-resume-accent/60 pb-2 text-xs font-bold uppercase tracking-widest">Profile</h2>
                    <p class="mt-2 whitespace-pre-wrap text-left text-xs leading-relaxed text-white/90">{{ store.profile }}</p>
                  </section>
                  <section class="mt-6">
                    <h2 class="mb-2 border-b-2 border-resume-accent/60 pb-1.5 text-xs font-bold uppercase tracking-widest">Contact</h2>
                    <p class="mb-1 text-[11px] font-bold uppercase tracking-wide text-white/60">PHONE:</p>
                    <p class="mb-2 text-sm text-white">{{ store.phone }}</p>
                    <p class="mb-1 text-[11px] font-bold uppercase tracking-wide text-white/60">EMAIL:</p>
                    <p class="mb-2 text-sm text-blue-300">{{ store.email }}</p>
                    <p class="mt-2 text-[11px] italic text-white/50">{{ store.referenceNote }}</p>
                  </section>
                </aside>
                <main class="resume-main min-w-0 flex-1 bg-white px-8 py-7">
                  <header class="mb-5 border-b-2 border-gray-100 pb-2.5">
                    <h1 class="mb-0.5 text-[35px] font-bold uppercase tracking-wide text-resume-navy leading-tight">{{ store.name }}</h1>
                    <p class="text-[17px] text-resume-accent">{{ store.title }}</p>
                  </header>
                  <section class="mb-5">
                    <h2 class="section-heading mb-3 border-b-2 border-resume-accent pb-1 text-[12px] font-bold uppercase tracking-wider text-resume-navy">Education</h2>
                    <article v-for="(edu, i) in store.education" :key="i" class="mb-4 border-l-2 border-gray-100 pl-3">
                      <h3 class="mb-0.5 text-sm font-semibold text-resume-navy">{{ edu.school }}</h3>
                      <p class="mb-0.5 text-xs font-medium text-resume-accent">{{ edu.dates }}</p>
                      <p class="whitespace-pre-wrap text-xs leading-relaxed text-gray-600">{{ edu.description }}</p>
                    </article>
                  </section>
                  <section class="mb-5">
                    <h2 class="section-heading mb-3 border-b-2 border-resume-accent pb-1 text-[12px] font-bold uppercase tracking-wider text-resume-navy">Work Experience</h2>
                    <article v-for="(job, i) in store.experience" :key="i" class="mb-4 border-l-2 border-gray-100 pl-3">
                      <h3 class="mb-0.5 text-sm font-semibold text-resume-navy">{{ job.role }}</h3>
                      <p class="mb-0.5 text-xs font-medium text-resume-accent">{{ job.dates }}</p>
                      <p class="whitespace-pre-wrap text-xs leading-relaxed text-gray-600">{{ job.description }}</p>
                    </article>
                  </section>
                  <section class="mb-5">
                    <h2 class="section-heading mb-3 border-b-2 border-resume-accent pb-1 text-[12px] font-bold uppercase tracking-wider text-resume-navy">Awards and Volunteer Work</h2>
                    <ul class="list-none space-y-1 pl-0">
                      <li v-for="(item, i) in store.awards" :key="i" class="relative pl-4 text-xs leading-relaxed text-gray-600 before:absolute before:left-0 before:font-bold before:text-resume-accent before:content-['▸']">{{ item }}</li>
                    </ul>
                  </section>
                </main>
              </div>

              <!-- Classic layout: like Jade Urban PDF — left Profile/Contact, right Name + Experience/Education/Awards -->
              <div
                v-else-if="currentLayout === 'classic'"
                class="resume-classic relative flex min-h-0 min-w-0 flex-1 overflow-hidden bg-white font-classic"
                style="transform: scale(0.97); transform-origin: top left; width: 216mm; min-height: 306mm;"
              >
                <!-- Grey organic blob background behind the sidebar, matching JadeUrbanResume.pdf -->
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 816 1156"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                  style="position:absolute;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none;"
                >
                  <path
                    d="M0,0 L218,0
                       C238,55 195,115 214,195
                       C233,275 250,365 228,455
                       C206,545 240,640 222,760
                       C204,880 228,1010 220,1156
                       L0,1156 Z"
                    fill="#d1d5db"
                  />
                </svg>
                <aside class="resume-classic-sidebar relative z-10 w-[200px] shrink-0 px-4 py-4">
                  <div class="mx-auto mb-3 h-[88px] w-[88px] overflow-hidden rounded-full border-2 border-gray-300 bg-white">
                    <img src="/JadeResume.png" alt="Profile" class="h-full w-full object-cover" @error="($event.target).style.display = 'none'" />
                  </div>
                  <section class="mb-4">
                    <h2 class="resume-classic-heading mb-1.5 pb-0.5 text-gray-900">Profile</h2>
                    <p class="whitespace-pre-wrap text-left text-[12px] leading-snug text-gray-900">{{ store.profile }}</p>
                  </section>
                  <section>
                    <h2 class="resume-classic-heading mb-1.5 pb-0.5 text-gray-900">Contact</h2>
                    <p class="mb-0.5 text-[12px] font-bold text-gray-900">PHONE:</p>
                    <p class="mb-2 text-[12px] text-gray-900">{{ store.phone }}</p>
                    <p class="mb-0.5 text-[12px] font-bold text-gray-900">EMAIL:</p>
                    <p class="mb-2 text-[12px] text-gray-900">{{ store.email }}</p>
                    <p class="mt-1 text-[11px] italic text-gray-700">{{ store.referenceNote }}</p>
                  </section>
                </aside>
                <main class="resume-classic-main min-w-0 flex-1 bg-white py-4" style="max-width: 540px; padding-left: 3.5rem; padding-right: 1.25rem;">
                  <header class="mb-3 border-b border-gray-900 pb-1.5">
                    <h1 class="mb-0.5 text-[24px] font-bold uppercase tracking-wide text-gray-900 leading-tight">{{ store.name }}</h1>
                    <p class="text-[14px] text-gray-900">{{ store.title }}</p>
                  </header>
                  <section class="mb-3">
                    <h2 class="resume-classic-heading mb-1.5 pb-0.5 text-gray-900">Work Experience</h2>
                    <article v-for="(job, i) in store.experience" :key="i" class="mb-3">
                      <h3 class="text-[12px] font-bold text-gray-900">{{ job.role }}</h3>
                      <p class="mb-0.5 text-[11px] text-gray-700">{{ job.dates }}</p>
                      <p class="whitespace-pre-wrap text-[12px] leading-snug text-gray-900">{{ job.description }}</p>
                    </article>
                  </section>
                  <section class="mb-3">
                    <h2 class="resume-classic-heading mb-1.5 pb-0.5 text-gray-900">Education</h2>
                    <article v-for="(edu, i) in store.education" :key="i" class="mb-3">
                      <h3 class="text-[12px] font-bold text-gray-900">{{ edu.school }}</h3>
                      <p class="mb-0.5 text-[11px] text-gray-700">{{ edu.dates }}</p>
                      <p class="whitespace-pre-wrap text-[12px] leading-snug text-gray-900">{{ edu.description }}</p>
                    </article>
                  </section>
                  <section class="mb-2">
                    <h2 class="resume-classic-heading mb-1.5 pb-0.5 text-gray-900">Awards and Volunteer Work</h2>
                    <ul class="list-none space-y-0.5 pl-0">
                      <li v-for="(item, i) in store.awards" :key="i" class="text-[12px] leading-snug text-gray-900">{{ item }}</li>
                    </ul>
                  </section>
                </main>
              </div>

              <!-- Angel layout: modern, cool design -->
              <div
                v-else-if="currentLayout === 'angel'"
                class="resume-angel flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-angel-bg"
                style="transform: scale(0.97); transform-origin: top left; width: 216mm; min-height: 306mm;"
              >
                <!-- Hero header -->
                <header class="angel-hero border-b-4 border-angel-accent bg-white px-8 py-5">
                  <div class="flex items-start gap-5">
                    <div class="h-20 w-20 shrink-0 overflow-hidden rounded-2xl shadow-lg ring-2 ring-white ring-offset-2 ring-offset-angel-bg">
                      <img src="/JadeResume.png" alt="Profile" class="h-full w-full object-cover" @error="($event.target).style.display = 'none'" />
                    </div>
                    <div class="min-w-0 flex-1 pt-0.5">
                      <h1 class="text-2xl font-bold tracking-tight text-gray-900">{{ store.name }}</h1>
                      <p class="mt-1 text-sm font-medium text-angel-accent">{{ store.title }}</p>
                      <p class="mt-2 text-xs text-gray-500">{{ store.phone }} · {{ store.email }}</p>
                      <p class="mt-0.5 text-[11px] italic text-gray-400">{{ store.referenceNote }}</p>
                    </div>
                  </div>
                </header>
                <!-- Two columns -->
                <div class="flex min-h-0 flex-1 overflow-hidden">
                  <aside class="angel-sidebar w-[200px] shrink-0 border-r border-gray-200 bg-white/80 px-5 py-5 backdrop-blur-sm">
                    <section class="mb-5">
                      <h2 class="angel-heading">Profile</h2>
                      <p class="whitespace-pre-wrap text-left text-xs leading-relaxed text-gray-700">{{ store.profile }}</p>
                    </section>
                  </aside>
                  <main class="angel-main min-w-0 flex-1 overflow-hidden px-6 py-5">
                    <section class="angel-section">
                      <h2 class="angel-heading-bar">Work Experience</h2>
                      <article v-for="(job, i) in store.experience" :key="i" class="angel-entry">
                        <h3 class="text-sm font-semibold text-gray-900">{{ job.role }}</h3>
                        <p class="text-xs text-angel-accent">{{ job.dates }}</p>
                        <p class="mt-1 whitespace-pre-wrap text-xs leading-relaxed text-gray-700">{{ job.description }}</p>
                      </article>
                    </section>
                    <section class="angel-section">
                      <h2 class="angel-heading-bar">Education</h2>
                      <article v-for="(edu, i) in store.education" :key="i" class="angel-entry">
                        <h3 class="text-sm font-semibold text-gray-900">{{ edu.school }}</h3>
                        <p class="text-xs text-angel-accent">{{ edu.dates }}</p>
                        <p class="mt-1 whitespace-pre-wrap text-xs leading-relaxed text-gray-700">{{ edu.description }}</p>
                      </article>
                    </section>
                    <section class="angel-section">
                      <h2 class="angel-heading-bar">Awards & Volunteer</h2>
                      <ul class="list-none space-y-1 pl-0">
                        <li v-for="(item, i) in store.awards" :key="i" class="flex items-start gap-2 text-xs text-gray-700">
                          <span class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-angel-accent" />
                          <span>{{ item }}</span>
                        </li>
                      </ul>
                    </section>
                  </main>
                </div>
              </div>

              <!-- Blank layout: single column, scaled to fit one page -->
              <div
                v-else
                class="resume-blank flex h-full w-full overflow-hidden"
              >
                <div
                  class="resume-blank-scaled flex min-h-0 min-w-0 flex-col px-8 py-5"
                  style="transform: scale(0.78); transform-origin: top left; width: 210mm; min-height: 381mm;"
                >
                  <header class="mb-3 border-b-2 border-resume-navy/20 pb-2">
                    <h1 class="mb-0.5 text-[28px] font-bold uppercase tracking-wide text-resume-navy leading-tight">{{ store.name }}</h1>
                    <p class="text-sm text-resume-accent">{{ store.title }}</p>
                  </header>
                  <section class="mb-3">
                    <h2 class="mb-1 border-b border-gray-300 pb-0.5 text-[11px] font-bold uppercase tracking-wider text-resume-navy">Profile</h2>
                    <p class="whitespace-pre-wrap text-left text-[11px] leading-snug text-gray-700">{{ store.profile }}</p>
                  </section>
                  <section class="mb-3">
                    <h2 class="mb-1 border-b border-gray-300 pb-0.5 text-[11px] font-bold uppercase tracking-wider text-resume-navy">Contact</h2>
                    <p class="mb-0.5 text-[11px] text-gray-600"><span class="font-semibold text-gray-800">Phone:</span> {{ store.phone }}</p>
                    <p class="mb-0.5 text-[11px] text-gray-600"><span class="font-semibold text-gray-800">Email:</span> {{ store.email }}</p>
                    <p class="mt-0.5 text-[10px] italic text-gray-500">{{ store.referenceNote }}</p>
                  </section>
                  <section class="mb-3">
                    <h2 class="mb-1.5 border-b border-gray-300 pb-0.5 text-[11px] font-bold uppercase tracking-wider text-resume-navy">Education</h2>
                    <article v-for="(edu, i) in store.education" :key="i" class="mb-2 border-l-2 border-gray-200 pl-2">
                      <h3 class="mb-0.5 text-xs font-semibold text-resume-navy">{{ edu.school }}</h3>
                      <p class="mb-0.5 text-[11px] font-medium text-resume-accent">{{ edu.dates }}</p>
                      <p class="whitespace-pre-wrap text-[11px] leading-snug text-gray-600">{{ edu.description }}</p>
                    </article>
                  </section>
                  <section class="mb-3">
                    <h2 class="mb-1.5 border-b border-gray-300 pb-0.5 text-[11px] font-bold uppercase tracking-wider text-resume-navy">Work Experience</h2>
                    <article v-for="(job, i) in store.experience" :key="i" class="mb-2 border-l-2 border-gray-200 pl-2">
                      <h3 class="mb-0.5 text-xs font-semibold text-resume-navy">{{ job.role }}</h3>
                      <p class="mb-0.5 text-[11px] font-medium text-resume-accent">{{ job.dates }}</p>
                      <p class="whitespace-pre-wrap text-[11px] leading-snug text-gray-600">{{ job.description }}</p>
                    </article>
                  </section>
                  <section class="mb-3">
                    <h2 class="mb-1.5 border-b border-gray-300 pb-0.5 text-[11px] font-bold uppercase tracking-wider text-resume-navy">Awards and Volunteer Work</h2>
                    <ul class="list-none space-y-0.5 pl-0">
                      <li v-for="(item, i) in store.awards" :key="i" class="relative pl-3 text-[11px] leading-snug text-gray-600 before:absolute before:left-0 before:font-bold before:text-resume-accent before:content-['▸']">{{ item }}</li>
                    </ul>
                  </section>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>

      <!-- Right: Edit form -->
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
.section-heading::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 60px;
  height: 2px;
  background: theme('colors.resume.purple');
}
/* Classic layout: match Jade Urban PDF — serif font like original */
.font-classic {
  font-family: 'Times New Roman', Times, Georgia, serif;
}
.resume-classic-heading {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  border-bottom: 1px solid #111827;
}
/* Angel layout: modern template */
.angel-heading {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #0d9488;
  margin-bottom: 0.5rem;
}
.angel-heading-bar {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #0d9488;
  padding-left: 0.75rem;
  border-left: 4px solid #0d9488;
  margin-bottom: 0.75rem;
}
.angel-section {
  margin-bottom: 1.25rem;
}
.angel-entry {
  margin-bottom: 1rem;
}
.angel-entry:last-child {
  margin-bottom: 0;
}
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
