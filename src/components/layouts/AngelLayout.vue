<script setup>
import { useResumeStore } from '../../stores/resume'
const store = useResumeStore()
</script>

<template>
  <div
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
</template>

<style scoped>
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
</style>
