<script setup>
import { useResumeStore } from '../../stores/resume'
const store = useResumeStore()
</script>

<template>
  <div
    class="classic-layout flex min-h-0 min-w-0 flex-1 overflow-hidden bg-white"
    style="width: 216mm; min-height: 306mm; font-family: system-ui, -apple-system, sans-serif; --classic-primary: var(--classic-primary-override, #3d3d3d); --classic-secondary: var(--classic-secondary-override, #1a1a1a);"
    :style="{ '--classic-primary-override': store.layoutColors?.classic?.primary, '--classic-secondary-override': store.layoutColors?.classic?.secondary }"
  >
    <!-- Left: dark grey sidebar -->
    <aside
      class="classic-sidebar flex shrink-0 flex-col"
      style="width: 72mm; color: #fff;"
    >
      <!-- Photo: circular, bottom slightly overlapping next section -->
      <div class="classic-photo-wrap" style="padding: 20px 20px 0; margin-bottom: -12px;">
        <div class="h-[120px] w-[120px] overflow-hidden rounded-full border-2 border-white/30 bg-white/10 mx-auto">
          <img :src="store.profileImage" alt="Profile" class="h-full w-full object-cover" @error="($event.target).style.display = 'none'" />
        </div>
      </div>

      <!-- About Me -->
      <section class="classic-side-section" style="padding: 18px 16px 14px;">
        <h2 class="classic-side-heading">About me</h2>
        <p class="classic-side-text">{{ store.profile }}</p>
      </section>

      <!-- Reference -->
      <section class="classic-side-section" style="padding: 14px 16px;">
        <h2 class="classic-side-heading">Reference</h2>
        <p class="classic-side-text">{{ store.referenceNote }}</p>
        <p class="classic-side-text mt-2">T: {{ store.phone }}</p>
        <p class="classic-side-text">E: {{ store.email }}</p>
      </section>

      <!-- Hobbies (awards) -->
      <section class="classic-side-section" style="padding: 14px 16px 20px;">
        <h2 class="classic-side-heading">Hobbies</h2>
        <ul class="classic-side-list">
          <li v-for="(item, i) in store.awards" :key="i">{{ item }}</li>
        </ul>
      </section>
    </aside>

    <!-- Right: white main content -->
    <main class="classic-main flex-1 min-w-0 flex flex-col bg-white" style="padding: 16px 22px 14px;">
      <!-- Name, title, contact -->
      <header class="flex justify-between items-start gap-4 border-b border-gray-200 pb-3 mb-3">
        <div>
          <h1 class="classic-name">{{ store.name }}</h1>
          <p class="classic-title">{{ store.title }}</p>
        </div>
        <div class="classic-contact text-right shrink-0 flex flex-col gap-1">
          <p class="classic-contact-line">
            <svg class="classic-contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            <span>{{ store.phone }}</span>
          </p>
          <p class="classic-contact-line">
            <svg class="classic-contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            <span>{{ store.email }}</span>
          </p>
        </div>
      </header>

      <!-- Work Experience (timeline) -->
      <section class="classic-section classic-section-tight">
        <h2 class="classic-main-heading">Work experience</h2>
        <div class="classic-timeline">
          <article v-for="(job, i) in store.experience" :key="i" class="classic-timeline-item">
            <div class="classic-timeline-dot" />
            <div class="classic-timeline-content">
              <p class="classic-company">{{ job.company }}</p>
              <p class="classic-meta">{{ job.role }} · {{ job.location }} · {{ job.dates }}</p>
              <p class="classic-role-title">{{ job.role }}</p>
              <ul class="classic-bullets">
                <li v-for="(line, li) in job.description.split('\n').filter(l => l.trim())" :key="li">{{ line.trim() }}</li>
              </ul>
            </div>
          </article>
        </div>
      </section>

      <!-- Education (timeline) -->
      <section class="classic-section classic-section-tight">
        <h2 class="classic-main-heading">Education</h2>
        <div class="classic-timeline">
          <article v-for="(edu, i) in store.education" :key="i" class="classic-timeline-item">
            <div class="classic-timeline-dot" />
            <div class="classic-timeline-content">
              <p class="classic-company">{{ edu.school }}</p>
              <p class="classic-meta">{{ edu.dates }}</p>
              <p class="classic-role-title">Degree / Program</p>
              <ul class="classic-bullets">
                <li>{{ edu.description }}</li>
              </ul>
            </div>
          </article>
        </div>
      </section>

      <!-- Skills (with bars) -->
      <section class="classic-section classic-section-tight">
        <h2 class="classic-main-heading">Skills</h2>
        <div class="classic-skills-grid">
          <div v-for="(skill, i) in store.skills" :key="i" class="classic-skill-row">
            <span class="classic-skill-label">{{ skill }}</span>
            <div class="classic-skill-bar">
              <div class="classic-skill-fill" style="width: 85%;" />
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.classic-side-heading {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #fff;
  margin: 0 0 10px 0;
  padding-bottom: 4px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.5);
  text-align: center;
}
.classic-side-text {
  font-size: 11px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.95);
  margin: 0;
  text-align: left;
}
.classic-side-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.classic-side-list li {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.95);
  margin-bottom: 6px;
  padding-left: 14px;
  position: relative;
  line-height: 1.4;
}
.classic-side-list li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 6px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.8);
}

.classic-name {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #1a1a1a;
  margin: 0;
  line-height: 1.15;
}
.classic-title {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #555;
  margin: 4px 0 0 0;
}
.classic-contact {
  font-size: 11px;
  color: #333;
  line-height: 1.6;
}
.classic-contact-line {
  margin: 0;
  font-size: 11px;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
}
.classic-contact-icon {
  width: 12px;
  height: 12px;
  flex-shrink: 0;
  color: #1a1a1a;
}

.classic-section-tight {
  margin-bottom: 14px;
}
.classic-section-tight:last-child {
  margin-bottom: 0;
}
.classic-sidebar {
  background: var(--classic-primary, #3d3d3d);
}
.classic-main-heading {
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--classic-secondary, #1a1a1a);
  margin: 0 0 8px 0;
  padding-bottom: 3px;
  border-bottom: 2px solid var(--classic-secondary, #1a1a1a);
}

.classic-timeline {
  position: relative;
  padding-left: 20px;
  border-left: 2px solid #c4c4c4;
  margin-left: 6px;
}
.classic-timeline-item {
  position: relative;
  margin-bottom: 12px;
}
.classic-timeline-item:last-child {
  margin-bottom: 0;
}
.classic-timeline-dot {
  position: absolute;
  left: -26px;
  top: 6px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--classic-primary, #3d3d3d);
}
.classic-timeline-content {
  margin-left: 0;
}
.classic-company {
  font-size: 13px;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--classic-secondary, #1a1a1a);
  margin: 0 0 2px 0;
}
.classic-meta {
  font-size: 11px;
  color: #555;
  margin: 0 0 2px 0;
}
.classic-role-title {
  font-size: 12px;
  font-weight: 700;
  color: var(--classic-secondary, #1a1a1a);
  margin: 0 0 4px 0;
}
.classic-bullets {
  list-style: none;
  padding: 0;
  margin: 0;
}
.classic-bullets li {
  font-size: 12px;
  color: #333;
  line-height: 1.45;
  margin-bottom: 2px;
  padding-left: 14px;
  position: relative;
}
.classic-bullets li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #333;
  font-weight: bold;
}

.classic-skills-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px 20px;
}
.classic-skill-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.classic-skill-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--classic-secondary, #1a1a1a);
  flex-shrink: 0;
  min-width: 0;
}
.classic-skill-bar {
  height: 6px;
  flex: 1;
  min-width: 0;
  background: #e0e0e0;
  border-radius: 2px;
  overflow: hidden;
}
.classic-skill-fill {
  height: 100%;
  background: var(--classic-primary, #3d3d3d);
  border-radius: 2px;
}
</style>
