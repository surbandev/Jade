<script setup>
import { useResumeStore } from '../../stores/resume'
const store = useResumeStore()

const firstName = store.name.split(' ')[0]
const lastName = store.name.split(' ').slice(1).join(' ')
</script>

<template>
  <div
    class="resume-classic relative flex min-h-0 min-w-0 flex-1 overflow-hidden bg-white font-classic"
    style="width: 216mm; min-height: 306mm;"
  >
    <!-- Teal Sidebar -->
    <aside
      class="resume-classic-sidebar relative shrink-0 flex flex-col items-center px-5 py-6"
      style="width: 195px; background-color: #5bbfbf;"
    >
      <!-- Photo -->
      <div class="mb-4 h-[110px] w-[110px] overflow-hidden rounded-full border-[3px] border-white bg-white">
        <img src="/JadeResume.png" alt="Profile" class="h-full w-full object-cover" @error="($event.target).style.display = 'none'" />
      </div>

      <!-- Name & Title -->
      <div class="mb-1 text-center">
        <p class="font-script text-[20px] leading-tight text-white">{{ firstName }}</p>
        <h1 class="text-[22px] font-extrabold uppercase leading-tight tracking-wide text-white">{{ lastName }}</h1>
        <p class="mt-1 text-[9.5px] uppercase tracking-widest text-white opacity-90">{{ store.title }}</p>
      </div>

      <!-- Education -->
      <section class="mt-5 w-full">
        <h2 class="sidebar-heading mb-2">Education</h2>
        <div v-for="(edu, i) in store.education" :key="i" class="mb-3">
          <p class="text-[10.5px] font-bold uppercase leading-snug text-white">{{ edu.school }}</p>
          <p class="text-[10px] leading-snug text-white opacity-80">{{ edu.dates }}</p>
        </div>
      </section>

      <!-- Soft Skills -->
      <section class="mt-2 w-full">
        <h2 class="sidebar-heading mb-2">Soft-Skills</h2>
        <ul class="space-y-0.5">
          <li v-for="(skill, i) in store.skills" :key="i" class="text-center text-[10.5px] text-white">
            {{ skill }}
          </li>
        </ul>
      </section>

      <!-- Awards -->
      <section class="mt-4 w-full">
        <h2 class="sidebar-heading mb-2">Award</h2>
        <div v-for="(item, i) in store.awards" :key="i" class="mb-1 text-center">
          <p class="text-[10.5px] font-bold uppercase text-white">{{ item }}</p>
        </div>
      </section>
    </aside>

    <!-- Main Content -->
    <main class="resume-classic-main relative min-w-0 flex-1 bg-white px-8 py-6">
      <!-- Summary -->
      <section class="mb-5">
        <h2 class="main-heading mb-2">Summary</h2>
        <p class="text-[12.5px] leading-relaxed text-gray-800">{{ store.profile }}</p>
      </section>

      <!-- Work History -->
      <section>
        <h2 class="main-heading mb-3">Work History</h2>
        <article v-for="(job, i) in store.experience" :key="i" class="mb-5">
          <div class="flex items-baseline justify-between">
            <h3 class="text-[13px] font-bold uppercase text-gray-900">{{ job.role }}</h3>
            <span class="ml-2 whitespace-nowrap text-[10.5px] text-gray-500">{{ job.dates }}</span>
          </div>
          <p class="mb-1 text-[11.5px]" style="color: #3fa8a8;">{{ job.company }} | {{ job.location }}</p>
          <p class="text-[12px] leading-snug text-gray-800">{{ job.description }}</p>
        </article>
      </section>

      <!-- Reference note -->
      <p class="mt-4 text-[11px] italic text-gray-500">{{ store.referenceNote }}</p>
    </main>
  </div>
</template>

<style scoped>
.font-classic {
  font-family: 'Georgia', 'Times New Roman', serif;
}
.font-script {
  font-family: 'Dancing Script', 'Brush Script MT', cursive;
}
.sidebar-heading {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: white;
  border-bottom: 1px solid rgba(255, 255, 255, 0.45);
  padding-bottom: 3px;
  width: 100%;
  text-align: left;
}
.main-heading {
  font-size: 15px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #111827;
  border-bottom: 2px solid #111827;
  padding-bottom: 4px;
}
</style>
