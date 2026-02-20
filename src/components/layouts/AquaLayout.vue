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

const firstName = computed(() => {
  const s = (store.name || '').split(' ')[0] || ''
  return s ? s[0].toUpperCase() + s.slice(1).toLowerCase() : ''
})
const lastName = computed(() => (store.name || '').split(' ').slice(1).join(' ') || '')

// Static page: 210mm × 297mm (A4) every page. Matches printed/PDF size.
const layoutRootStyle = computed(() => ({
  width: '210mm',
  height: '297mm',
  minHeight: '297mm',
  display: 'flex',
  fontFamily: 'Calibri, Arial, sans-serif',
  background: '#fff',
  '--aqua-primary': 'var(--aqua-primary-override, #7dc4c4)',
  '--aqua-secondary': 'var(--aqua-secondary-override, #5baaaa)',
  '--aqua-primary-override': store.layoutColors?.aqua?.primary,
  '--aqua-secondary-override': store.layoutColors?.aqua?.secondary,
}))

const sidebarStyle = computed(() => ({
  width: '70mm',
  flexShrink: 0,
  display: 'flex',
  flexDirection: 'column',
}))
</script>

<template>
  <div class="aqua-layout" :style="layoutRootStyle">
    <!-- Left sidebar: teal background (page 2+: only as tall as content so it doesn't stretch and create blank page) -->
    <aside class="aqua-sidebar-bg" :style="sidebarStyle">

      <!-- Name + title: script first name, bold last name, muted title, divider -->
      <div class="aqua-header" style="padding: 20px 16px 16px; text-align: center; position: relative; background: linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 100%);">
        <p class="aqua-first-name">{{ firstName }}</p>
        <h1 class="aqua-last-name">{{ lastName }}</h1>
        <p class="aqua-title">{{ store.title }}</p>
        <div style="height: 1px; background: rgba(0,0,0,0.12); margin: 10px auto 0; max-width: 140px;" />
      </div>

      <!-- Profile photo: round, centered -->
      <div style="flex-shrink: 0; padding: 0 25px 18px; display: flex; justify-content: center;">
        <div style="width: 200px; height: 200px; border-radius: 50%; overflow: hidden; position: relative; flex-shrink: 0;">
          <img
            :src="store.profileImage"
            alt="Profile"
            style="width: 100%; height: 100%; object-fit: cover; object-position: center center;"
            @error="($event.target).style.display = 'none'"
          />
        </div>
      </div>

      <!-- Divider -->
      <div style="height: 1.5px; background: rgba(0,0,0,0.15); margin: 0 14px;" />

      <!-- Education -->
      <div style="padding: 14px 16px;">
        <h2 class="aqua-side-heading">Education</h2>
        <div v-for="(edu, i) in displayedEducation" :key="i" style="margin-bottom: 12px;">
          <p style="font-size: 13px; font-weight: 700; text-transform: uppercase; color: #1a1a1a; margin: 0; line-height: 1.35;">{{ edu.school }}</p>
          <p style="font-size: 12px; color: #2a2a2a; margin: 2px 0 0 0; line-height: 1.35;">{{ edu.dates }}</p>
        </div>
      </div>

      <!-- Divider -->
      <div style="height: 1.5px; background: rgba(0,0,0,0.15); margin: 0 14px;" />

      <!-- Contact -->
      <div style="padding: 14px 16px;">
        <h2 class="aqua-side-heading">Contact</h2>
        <p style="font-size: 13px; color: #1a1a1a; margin: 0 0 4px 0;">{{ store.phone }}</p>
        <p style="font-size: 13px; color: #1a1a1a; margin: 0 0 4px 0; word-break: break-all;">{{ store.email }}</p>
        <p style="font-size: 12px; font-style: italic; color: #2a2a2a; margin: 4px 0 0 0;">{{ store.referenceNote }}</p>
      </div>

      <!-- Divider -->
      <div style="height: 1.5px; background: rgba(0,0,0,0.15); margin: 0 14px;" />

      <!-- Awards -->
      <div style="padding: 14px 16px;">
        <h2 class="aqua-side-heading">Award</h2>
        <ul style="list-style: none; padding: 0; margin: 0;">
          <li v-for="(item, i) in store.awards" :key="i" style="font-size: 13px; color: #1a1a1a; margin-bottom: 6px; line-height: 1.35;">{{ item }}</li>
        </ul>
      </div>

    </aside>

    <!-- Right main content -->
    <main style="flex: 1; min-width: 0; background: #fff; padding: 24px 28px 24px 26px;">

      <!-- Summary (page 1 only) -->
      <section v-if="page === 1" style="margin-bottom: 22px;">
        <h2 class="aqua-main-heading">Summary</h2>
        <p style="font-size: 14px; color: #333; line-height: 1.6; margin: 0; white-space: pre-wrap; text-align: left; word-spacing: normal;">{{ store.profile }}</p>
      </section>

      <!-- Work History -->
      <section>
        <h2 class="aqua-main-heading">{{ page === 2 ? 'CONT WORK HISTORY' : 'Work History' }}</h2>
        <div v-for="(job, i) in displayedExperience" :key="i" style="margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: baseline;">
            <h3 style="font-size: 15px; font-weight: 700; text-transform: uppercase; color: #1a1a1a; margin: 0;">{{ job.role }}</h3>
            <span style="font-size: 13px; color: #555; flex-shrink: 0; margin-left: 8px;">{{ job.dates }}</span>
          </div>
          <p class="aqua-job-subtitle" style="font-size: 14px; margin: 2px 0 6px 0; font-style: italic;">{{ job.role.split('-')[0].trim() }}</p>
          <!-- Description split into bullet points if multi-line, else plain -->
          <ul style="list-style: none; padding: 0; margin: 0;">
            <li
              v-for="(line, li) in job.description.split('\n').filter(l => l.trim())"
              :key="li"
              style="font-size: 14px; color: #333; line-height: 1.55; padding-left: 14px; position: relative; margin-bottom: 4px;"
            >
              <span style="position: absolute; left: 0; color: #333;">•</span>
              {{ line.trim() }}
            </li>
          </ul>
        </div>
      </section>

    </main>
  </div>
</template>

<style scoped>
.aqua-first-name {
  font-family: 'Dancing Script', 'Brush Script MT', cursive;
  font-size: 28px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
  line-height: 1.2;
}
.aqua-last-name {
  font-family: 'Trebuchet MS', 'Helvetica Neue', Arial, sans-serif;
  font-size: 30px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #1a1a1a;
  margin: 2px 0 0 0;
  line-height: 1.1;
}
.aqua-title {
  font-family: 'Trebuchet MS', Arial, sans-serif;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #3a3a3a;
  margin: 6px 0 0 0;
}
.aqua-side-heading {
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #111;
  margin: 0 0 8px 0;
  padding-bottom: 3px;
  border-bottom: 1.5px solid rgba(0, 0, 0, 0.2);
}
.aqua-sidebar-bg {
  background: var(--aqua-primary, #7dc4c4);
}
.aqua-job-subtitle {
  color: var(--aqua-secondary, #5baaaa);
}
.aqua-main-heading {
  font-size: 20px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #1a1a1a;
  margin: 0 0 4px 0;
  padding-bottom: 6px;
  border-bottom: 3px solid var(--aqua-primary, #7dc4c4);
  margin-bottom: 12px;
}
</style>
