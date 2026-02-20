<script setup>
import { computed } from 'vue'
import { useResumeStore } from '../../stores/resume'

const props = defineProps({
  page: { type: Number, default: 1 },
  totalPages: { type: Number, default: 1 },
})

const store = useResumeStore()

const EDUCATION_PER_PAGE_1 = 2
const EXPERIENCE_PER_PAGE_1 = 3

const displayedEducation = computed(() => {
  if (props.totalPages <= 1) return store.education
  if (props.page === 1) return store.education.slice(0, EDUCATION_PER_PAGE_1)
  return store.education.slice(EDUCATION_PER_PAGE_1)
})

const displayedExperience = computed(() => {
  if (props.totalPages <= 1) return store.experience
  if (props.page === 1) return store.experience.slice(0, EXPERIENCE_PER_PAGE_1)
  return store.experience.slice(EXPERIENCE_PER_PAGE_1)
})
</script>

<template>
  <!-- Static page: 210mm × 297mm (A4). No transform; matches printed/PDF size. -->
  <div
    class="resume-angel angel-theme flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-angel-bg"
    style="width: 210mm; height: 297mm; min-height: 297mm;"
    :style="{ '--angel-primary': store.layoutColors?.angel?.primary, '--angel-secondary': store.layoutColors?.angel?.secondary }"
  >
    <!-- Hero header -->
    <header class="angel-hero border-b-4 bg-white px-8 py-5 angel-header-bar">
      <div class="flex items-start gap-5">
        <div class="h-20 w-20 shrink-0 overflow-hidden rounded-2xl shadow-lg ring-2 ring-white ring-offset-2 ring-offset-angel-bg">
          <img :src="store.profileImage" alt="Profile" class="h-full w-full object-cover" @error="($event.target).style.display = 'none'" />
        </div>
        <div class="min-w-0 flex-1 pt-0.5">
          <h1 class="text-2xl font-bold tracking-tight text-gray-900">{{ store.name }}</h1>
          <p class="mt-1 text-sm font-medium angel-accent">{{ store.title }}</p>
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
          <p class="whitespace-pre-wrap text-left text-xs leading-relaxed text-gray-700" style="word-spacing: normal;">{{ store.profile }}</p>
        </section>
      </aside>
      <main class="angel-main min-w-0 flex-1 overflow-hidden px-6 py-5">
        <section class="angel-section">
          <h2 class="angel-heading-bar">Work Experience</h2>
          <article v-for="(job, i) in displayedExperience" :key="i" class="angel-entry">
            <h3 class="text-sm font-semibold text-gray-900">{{ job.role }}</h3>
            <p class="text-xs angel-accent">{{ job.dates }}</p>
            <p class="mt-1 whitespace-pre-wrap text-xs leading-relaxed text-gray-700">{{ job.description }}</p>
          </article>
        </section>
        <section class="angel-section">
          <h2 class="angel-heading-bar">Education</h2>
          <article v-for="(edu, i) in displayedEducation" :key="i" class="angel-entry">
            <h3 class="text-sm font-semibold text-gray-900">{{ edu.school }}</h3>
            <p class="text-xs angel-accent">{{ edu.dates }}</p>
            <p class="mt-1 whitespace-pre-wrap text-xs leading-relaxed text-gray-700">{{ edu.description }}</p>
          </article>
        </section>
        <section class="angel-section">
          <h2 class="angel-heading-bar">Awards & Volunteer</h2>
          <ul class="list-none space-y-1 pl-0">
            <li v-for="(item, i) in store.awards" :key="i" class="flex items-start gap-2 text-xs text-gray-700">
              <span class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full angel-accent-dot" />
              <span>{{ item }}</span>
            </li>
          </ul>
        </section>
      </main>
    </div>
  </div>
</template>

<style scoped>
.angel-theme .angel-header-bar {
  border-bottom-color: var(--angel-primary, #0d9488);
}
.angel-theme .angel-accent,
.angel-theme .angel-accent-dot {
  color: var(--angel-primary, #0d9488);
}
.angel-theme .angel-accent-dot {
  background: var(--angel-primary, #0d9488);
}
.angel-heading {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--angel-primary, #0d9488);
  margin-bottom: 0.5rem;
}
.angel-heading-bar {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--angel-primary, #0d9488);
  padding-left: 0.75rem;
  border-left: 4px solid var(--angel-primary, #0d9488);
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
</style>
