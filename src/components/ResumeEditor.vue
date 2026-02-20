<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useResumeStore } from '../stores/resume'
import { getProfiles, getResumeState, saveResumeState, addProfile } from '../lib/resumeDb'
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

const resumeRef = ref(null)
const viewerContainerRef = ref(null)
const store = useResumeStore()
const isExporting = ref(false)
const currentLayoutId = ref('sidebar')
const profileImageInputRef = ref(null)
const profiles = ref([])
const currentProfileId = ref(null)
const dbReady = ref(false)
const userSwitcherOpen = ref(false)
const userSwitcherRef = ref(null)
const newUserName = ref('')

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
  if (data.phone != null) store.phone = data.phone
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

const currentProfileName = computed(() => {
  const p = profiles.value.find((x) => x.id === currentProfileId.value)
  return p?.name ?? '—'
})

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

// A4 in px at 96dpi: 210mm ≈ 794px, 297mm ≈ 1122px
const A4_WIDTH_PX = 793.7
const A4_HEIGHT_PX = 1122.5
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
  })
  document.addEventListener('click', onUserSwitcherClickOutside)
})
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
          <button
            v-for="p in profiles"
            :key="p.id"
            type="button"
            role="option"
            class="w-full px-4 py-2 text-left text-sm text-white/90 hover:bg-white/10"
            :class="currentProfileId === p.id && 'bg-white/10 font-medium'"
            @click="switchProfile(p.id)"
          >
            {{ p.name }}
          </button>
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
                  v-if="store.profileImage && store.profileImage !== '/JadeResume.png'"
                  type="button"
                  class="ml-2 rounded border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-600 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-resume-accent"
                  @click="store.profileImage = '/JadeResume.png'; persistStore()"
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
textarea.field-input {
  overflow-y: hidden;
  scrollbar-width: none;
}
textarea.field-input::-webkit-scrollbar {
  display: none;
}
</style>
