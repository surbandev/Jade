<script setup>
import { useResumeStore } from '../../stores/resume'
const store = useResumeStore()
</script>

<template>
  <div
    class="resume-pro"
    style="width: 216mm; min-height: 306mm; font-family: 'Calibri', 'Trebuchet MS', Arial, sans-serif; display: flex; flex-direction: column; background: #fff;"
  >
    <!-- Thin accent bar -->
    <div style="height: 5px; background: #555; flex-shrink: 0;" />

    <!-- Dark header -->
    <header style="display: flex; align-items: center; gap: 28px; background: #3c3c3c; padding: 28px 36px; flex-shrink: 0;">
      <div style="width: 110px; height: 110px; flex-shrink: 0; overflow: hidden; border-radius: 50%; border: 3px solid rgba(255,255,255,0.3);">
        <img src="/JadeResume.png" alt="Profile" style="width: 100%; height: 100%; object-fit: cover;" @error="($event.target).style.display = 'none'" />
      </div>
      <div style="flex: 1;">
        <h1 style="font-size: 34px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #fff; margin: 0; line-height: 1.1;">{{ store.name }}</h1>
        <p style="font-size: 14px; letter-spacing: 0.22em; text-transform: uppercase; color: rgba(255,255,255,0.6); margin: 9px 0 0 0;">{{ store.title }}</p>
      </div>
      <!-- Stethoscope icon -->
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" style="width: 72px; height: 72px; flex-shrink: 0; opacity: 0.35;" fill="none">
        <!-- earpieces tubing top -->
        <path d="M14 6 C14 6 14 14 14 18 C14 26 22 32 30 32" stroke="white" stroke-width="3.5" stroke-linecap="round" fill="none"/>
        <path d="M38 6 C38 6 38 14 38 18 C38 26 30 32 30 32" stroke="white" stroke-width="3.5" stroke-linecap="round" fill="none"/>
        <!-- left earpiece -->
        <circle cx="14" cy="5" r="3" fill="white"/>
        <!-- right earpiece -->
        <circle cx="38" cy="5" r="3" fill="white"/>
        <!-- tube down to chest piece -->
        <path d="M30 32 C30 32 30 44 38 48 C44 51 50 48 50 42 C50 36 44 33 44 33" stroke="white" stroke-width="3.5" stroke-linecap="round" fill="none"/>
        <!-- chest piece circle -->
        <circle cx="44" cy="30" r="7" stroke="white" stroke-width="3" fill="none"/>
        <circle cx="44" cy="30" r="2.5" fill="white"/>
      </svg>
    </header>

    <!-- Body -->
    <div style="display: flex; flex: 1; min-height: 0;">

      <!-- Sidebar -->
      <aside style="width: 200px; flex-shrink: 0; background: #f4f4f4; padding: 20px 18px; border-right: 1px solid #ddd;">

        <div style="margin-bottom: 18px;">
          <h2 class="pro-side-heading">Contact</h2>
          <p class="pro-label">Phone</p>
          <p class="pro-side-val">{{ store.phone }}</p>
          <p class="pro-label" style="margin-top: 8px;">Email</p>
          <p class="pro-side-val">{{ store.email }}</p>
          <p style="font-size: 10px; color: #888; font-style: italic; margin: 7px 0 0 0; line-height: 1.4;">{{ store.referenceNote }}</p>
        </div>

        <div style="margin-bottom: 18px;">
          <h2 class="pro-side-heading">Education</h2>
          <div v-for="(edu, i) in store.education" :key="i" style="margin-bottom: 12px;">
            <p class="pro-side-school">{{ edu.school }}</p>
            <p class="pro-side-dates">{{ edu.dates }}</p>
            <p class="pro-side-val">{{ edu.description }}</p>
          </div>
        </div>

        <div>
          <h2 class="pro-side-heading">Awards &amp; Volunteer</h2>
          <ul style="list-style: none; padding: 0; margin: 0;">
            <li v-for="(item, i) in store.awards" :key="i" style="display: flex; align-items: flex-start; gap: 6px; margin-bottom: 6px;">
              <span style="width: 5px; height: 5px; border-radius: 50%; background: #555; flex-shrink: 0; margin-top: 5px;" />
              <span class="pro-side-val">{{ item }}</span>
            </li>
          </ul>
        </div>

      </aside>

      <!-- Main -->
      <main style="flex: 1; min-width: 0; background: #fff; padding: 20px 28px;">

        <div style="margin-bottom: 18px;">
          <h2 class="pro-main-heading">Profile</h2>
          <p class="pro-body" style="white-space: pre-wrap;">{{ store.profile }}</p>
        </div>

        <div>
          <h2 class="pro-main-heading">Work Experience</h2>
          <div v-for="(job, i) in store.experience" :key="i" style="margin-bottom: 16px;">
            <h3 class="pro-job-title">{{ job.role }}</h3>
            <p class="pro-job-dates">{{ job.dates }}</p>
            <p class="pro-body" style="white-space: pre-wrap; margin-top: 4px;">{{ job.description }}</p>
          </div>
        </div>

      </main>
    </div>
  </div>
</template>

<style scoped>
.pro-side-heading {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.13em;
  text-transform: uppercase;
  color: #2a2a2a;
  border-bottom: 1px solid #aaa;
  padding-bottom: 4px;
  margin: 0 0 9px 0;
}
.pro-label {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #555;
  margin: 0 0 2px 0;
}
.pro-side-val {
  font-size: 13px;
  color: #333;
  line-height: 1.5;
  margin: 0;
}
.pro-side-school {
  font-size: 13px;
  font-weight: 700;
  color: #2a2a2a;
  margin: 0;
  line-height: 1.3;
}
.pro-side-dates {
  font-size: 12px;
  color: #888;
  font-style: italic;
  margin: 2px 0 4px 0;
}
.pro-main-heading {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.13em;
  text-transform: uppercase;
  color: #2a2a2a;
  border-bottom: 1px solid #bbb;
  padding-bottom: 5px;
  margin: 0 0 11px 0;
}
.pro-job-title {
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #2a2a2a;
  margin: 0;
}
.pro-job-dates {
  font-size: 13px;
  color: #888;
  font-style: italic;
  margin: 2px 0 0 0;
}
.pro-body {
  font-size: 13.5px;
  color: #333;
  line-height: 1.65;
  margin: 0;
}
</style>
