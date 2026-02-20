<script setup>
import { useResumeStore } from '../../stores/resume'
const store = useResumeStore()
</script>

<template>
  <div
    class="aqua-layout"
    style="width: 216mm; min-height: 306mm; display: flex; font-family: 'Calibri', Arial, sans-serif; background: #fff;"
  >
    <!-- Left sidebar: teal background -->
    <aside style="width: 250px; flex-shrink: 0; background: #7dc4c4; display: flex; flex-direction: column;">

      <!-- Name + title ABOVE photo -->
      <div style="padding: 18px 16px 14px;">
        <h1 style="font-size: 24px; font-weight: 900; font-family: 'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif; letter-spacing: 0.06em; color: #1a1a1a; margin: 0; line-height: 1.15;">{{ store.name }}</h1>
        <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.15em; color: #2a2a2a; margin: 6px 0 0 0; font-family: 'Trebuchet MS', Arial, sans-serif;">{{ store.title }}</p>
      </div>

      <!-- Profile photo: full width -->
      <div style="width: 100%; height: 210px; overflow: hidden; position: relative; flex-shrink: 0;">
        <img
          src="/JadeResume.png"
          alt="Profile"
          style="width: 100%; height: 100%; object-fit: cover; object-position: top;"
          @error="($event.target).style.display = 'none'"
        />
      </div>

      <!-- Divider -->
      <div style="height: 1.5px; background: rgba(0,0,0,0.15); margin: 0 14px;" />

      <!-- Education -->
      <div style="padding: 14px 16px;">
        <h2 class="aqua-side-heading">Education</h2>
        <div v-for="(edu, i) in store.education" :key="i" style="margin-bottom: 12px;">
          <p style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #1a1a1a; margin: 0; line-height: 1.3;">{{ edu.school }}</p>
          <p style="font-size: 10px; color: #2a2a2a; margin: 2px 0 0 0; line-height: 1.3;">{{ edu.dates }}</p>
        </div>
      </div>

      <!-- Divider -->
      <div style="height: 1.5px; background: rgba(0,0,0,0.15); margin: 0 14px;" />

      <!-- Contact -->
      <div style="padding: 14px 16px;">
        <h2 class="aqua-side-heading">Contact</h2>
        <p style="font-size: 11px; color: #1a1a1a; margin: 0 0 4px 0;">{{ store.phone }}</p>
        <p style="font-size: 11px; color: #1a1a1a; margin: 0 0 4px 0; word-break: break-all;">{{ store.email }}</p>
        <p style="font-size: 10px; font-style: italic; color: #2a2a2a; margin: 4px 0 0 0;">{{ store.referenceNote }}</p>
      </div>

      <!-- Divider -->
      <div style="height: 1.5px; background: rgba(0,0,0,0.15); margin: 0 14px;" />

      <!-- Awards -->
      <div style="padding: 14px 16px;">
        <h2 class="aqua-side-heading">Award</h2>
        <ul style="list-style: none; padding: 0; margin: 0;">
          <li v-for="(item, i) in store.awards" :key="i" style="font-size: 11px; color: #1a1a1a; margin-bottom: 5px; line-height: 1.3;">{{ item }}</li>
        </ul>
      </div>

    </aside>

    <!-- Right main content -->
    <main style="flex: 1; min-width: 0; background: #fff; padding: 24px 28px 24px 26px;">

      <!-- Summary -->
      <section style="margin-bottom: 20px;">
        <h2 class="aqua-main-heading">Summary</h2>
        <p style="font-size: 12.5px; color: #333; line-height: 1.6; margin: 0; white-space: pre-wrap;">{{ store.profile }}</p>
      </section>

      <!-- Work History -->
      <section>
        <h2 class="aqua-main-heading">Work History</h2>
        <div v-for="(job, i) in store.experience" :key="i" style="margin-bottom: 18px;">
          <div style="display: flex; justify-content: space-between; align-items: baseline;">
            <h3 style="font-size: 13px; font-weight: 700; text-transform: uppercase; color: #1a1a1a; margin: 0;">{{ job.role }}</h3>
            <span style="font-size: 11px; color: #555; flex-shrink: 0; margin-left: 8px;">{{ job.dates }}</span>
          </div>
          <p style="font-size: 12px; color: #5baaaa; margin: 2px 0 6px 0; font-style: italic;">{{ job.role.split('-')[0].trim() }}</p>
          <!-- Description split into bullet points if multi-line, else plain -->
          <ul style="list-style: none; padding: 0; margin: 0;">
            <li
              v-for="(line, li) in job.description.split('\n').filter(l => l.trim())"
              :key="li"
              style="font-size: 12px; color: #333; line-height: 1.55; padding-left: 14px; position: relative; margin-bottom: 3px;"
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
.aqua-side-heading {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #111;
  margin: 0 0 8px 0;
  padding-bottom: 3px;
  border-bottom: 1.5px solid rgba(0, 0, 0, 0.2);
}
.aqua-main-heading {
  font-size: 18px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #1a1a1a;
  margin: 0 0 4px 0;
  padding-bottom: 6px;
  border-bottom: 3px solid #7dc4c4;
  margin-bottom: 12px;
}
</style>
