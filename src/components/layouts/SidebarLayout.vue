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
    class="sidebar-theme flex min-h-0 min-w-0 flex-1 overflow-hidden"
    style="width: 210mm; height: 297mm; min-height: 297mm; align-items: stretch;"
    :style="{ '--sidebar-primary': store.layoutColors?.sidebar?.primary, '--sidebar-secondary': store.layoutColors?.sidebar?.secondary }"
  >
    <aside class="resume-sidebar w-[70mm] shrink-0 relative px-5 py-6 text-white" style="height: 297mm; min-height: 297mm; align-self: stretch;">
      <!-- Full-height background layer so blue always reaches bottom (like Classic layout) -->
      <div class="resume-sidebar-bg absolute inset-0 z-0" aria-hidden="true" />
      <div class="relative z-[1]">
      <div class="resume-sidebar-photo mx-auto mb-5 h-[140px] w-[140px] overflow-hidden rounded-full border-4 border-white/20 shadow-xl">
        <img :src="store.profileImage" alt="Profile" class="h-full w-full object-cover" @error="($event.target).style.display = 'none'" />
      </div>
      <section v-if="page === 1" class="mb-5">
        <h2 class="mb-2 border-b-2 sidebar-border pb-2 text-xs font-bold uppercase tracking-widest">Profile</h2>
        <p class="mt-2 whitespace-pre-wrap text-left text-xs leading-relaxed text-white/90" style="word-spacing: normal; text-align: left;">{{ store.profile }}</p>
      </section>
      <section class="mt-6">
        <h2 class="mb-2 border-b-2 sidebar-border pb-1.5 text-xs font-bold uppercase tracking-widest">Contact</h2>
        <p class="mb-1 text-[11px] font-bold uppercase tracking-wide text-white/60">PHONE:</p>
        <p class="mb-2 text-sm text-white">{{ store.phone }}</p>
        <p class="mb-1 text-[11px] font-bold uppercase tracking-wide text-white/60">EMAIL:</p>
        <p class="mb-2 text-sm text-blue-300">{{ store.email }}</p>
        <p class="mt-2 text-[11px] italic text-white/50">{{ store.referenceNote }}</p>
      </section>
      </div>
    </aside>
    <main class="resume-main min-w-0 flex-1 flex flex-col bg-white px-8 py-7">
      <header class="mb-5 border-b-2 border-gray-100 pb-2.5">
        <h1 class="mb-0.5 text-[35px] font-bold uppercase tracking-wide leading-tight sidebar-heading-text">{{ store.name }}</h1>
        <p class="text-[17px] sidebar-accent">{{ store.title }}</p>
      </header>
      <section v-if="page === 1" class="mb-5">
        <h2 class="section-heading mb-3 border-b-2 border-resume-accent pb-1 text-[12px] font-bold uppercase tracking-wider sidebar-heading-text">Education</h2>
        <article v-for="(edu, i) in displayedEducation" :key="i" class="mb-4 border-l-2 border-gray-100 pl-3">
          <h3 class="mb-0.5 text-sm font-semibold sidebar-heading-text">{{ edu.school }}</h3>
          <p class="mb-0.5 text-xs font-medium sidebar-accent">{{ edu.dates }}</p>
          <p class="whitespace-pre-wrap text-xs leading-relaxed text-gray-600">{{ edu.description }}</p>
        </article>
      </section>
      <section class="mb-5">
        <h2 class="section-heading mb-3 border-b-2 border-resume-accent pb-1 text-[12px] font-bold uppercase tracking-wider sidebar-heading-text">Work Experience</h2>
        <article v-for="(job, i) in displayedExperience" :key="i" class="mb-4 border-l-2 border-gray-100 pl-3">
          <h3 class="mb-0.5 text-sm font-semibold sidebar-heading-text">{{ job.role }}</h3>
          <p class="mb-0.5 text-xs font-medium sidebar-accent">{{ job.dates }}</p>
          <p class="whitespace-pre-wrap text-xs leading-relaxed text-gray-600">{{ job.description }}</p>
        </article>
      </section>
      <section v-if="page === 1 && totalPages === 1" class="mb-5">
        <h2 class="section-heading mb-3 border-b-2 border-resume-accent pb-1 text-[12px] font-bold uppercase tracking-wider sidebar-heading-text">Awards and Volunteer Work</h2>
        <ul class="list-none space-y-1 pl-0">
          <li v-for="(item, i) in store.awards" :key="i" class="relative pl-4 text-xs leading-relaxed text-gray-600 sidebar-bullet before:absolute before:left-0 before:font-bold before:content-['▸']">{{ item }}</li>
        </ul>
      </section>
      <div v-if="page === 1 && totalPages > 1" class="mt-auto pt-4 text-center">
        <p class="text-xs font-medium italic text-gray-500">More on Page 2</p>
      </div>
    </main>
  </div>
</template>

<style scoped>
.sidebar-theme .resume-sidebar,
.sidebar-theme .resume-sidebar-photo,
.sidebar-theme .resume-sidebar-bg {
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.sidebar-theme .resume-sidebar-bg {
  background: linear-gradient(to bottom, color-mix(in srgb, var(--sidebar-primary, #1e2442) 85%, white), var(--sidebar-primary, #1e2442));
}
.sidebar-theme .resume-sidebar-photo {
  background: linear-gradient(to bottom right, var(--sidebar-secondary, #667eea), color-mix(in srgb, var(--sidebar-secondary, #667eea) 70%, black));
}
.sidebar-theme .sidebar-heading-text {
  color: var(--sidebar-primary, #1e2442);
}
.sidebar-theme .sidebar-accent,
.sidebar-theme .sidebar-border {
  color: var(--sidebar-secondary, #667eea);
  border-color: var(--sidebar-secondary, #667eea);
}
.sidebar-theme .sidebar-bullet::before {
  color: var(--sidebar-secondary, #667eea);
}
.section-heading::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 60px;
  height: 2px;
  background: var(--sidebar-secondary, #764ba2);
}
</style>
