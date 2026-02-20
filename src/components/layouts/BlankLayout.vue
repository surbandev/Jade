<script setup>
import { useResumeStore } from '../../stores/resume'
const store = useResumeStore()
</script>

<template>
  <div class="resume-blank flex h-full w-full overflow-hidden">
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
</template>
