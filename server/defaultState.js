/** Resume state for the seed user "Jade Urban" – full sample data saved in DB for that user only */
export const JADE_URBAN_RESUME_STATE = {
  profileImage: '/JadeResume.png',
  name: 'Jade Urban',
  title: 'Registered Nurse',
  profile:
    'My name is Jade Urban, and I hold both an Associate of Science in Nursing (ASN) and a Bachelor of Science in Nursing (BSN). I began my career in the medical field as a dialysis technician and progressed to the role of dialysis nurse, dedicating over ten years of service to this specialty. I am passionate about continuous learning, which I believe is essential for personal and professional growth. I actively seek opportunities to enhance my skills in communication, critical thinking, organization, efficiency, and adaptability. To avoid stagnation in my development, I remain open to new challenges and experiences.',
  phone: '865-333-0444',
  email: 'Jadeb333@gmail.com',
  referenceNote: '*Reference list upon request',
  education: [
    { school: 'University of Tennessee', dates: 'August 2018 – July 2019', description: 'Obtained my Bachelor of Science in nursing, graduating with honors.' },
    { school: 'Pellissippi State Community College', dates: 'January 2015 – May 2018', description: "I earned my Associate in Applied Science in Nursing while consistently maintaining a position on the Dean's List. Additionally, I received a Nursing Merit Award during my first year in the nursing program." },
  ],
  skills: ['Hemodialysis & Peritoneal Dialysis', 'Plasmapheresis', 'Patient Assessment', 'Medication Administration', 'Interdisciplinary Collaboration', 'Critical Thinking', 'Patient Education', 'Anemia Management'],
  experience: [
    { role: 'Registered Nurse', company: 'Fresenius Medical Care Acutes', location: 'Knoxville, TN', dates: 'September 2020 – Current', description: 'In my role within the acute hospital setting, I am responsible for initiating, monitoring, and terminating hemodialysis treatments for patients. Additionally, I coordinate patient care in collaboration with interdisciplinary teams throughout the hospital. During my tenure, I have also developed competencies in peritoneal dialysis and plasmapheresis.' },
    { role: 'Registered Nurse', company: 'DaVita', location: 'Knoxville, TN', dates: 'August 2018 – September 2020', description: 'I initiated, monitored, and terminated hemodialysis treatments for patients requiring dialysis. My responsibilities included conducting thorough assessments, administering medications, and monitoring for complications during treatment. I also oversaw the review of monthly lab results and communicated critical values to the nephrologist. Additionally, I directed patient care technicians, ensuring the safety of up to twelve patients simultaneously, and engaged in clinical decision-making and anemia management.' },
    { role: 'Certified Dialysis Technician', company: 'DaVita', location: 'Knoxville, TN', dates: 'May 2014 – August 2018', description: 'I served as a patient care technician for individuals undergoing dialysis treatments. In this role, I was responsible for monitoring water systems and ensuring proper machine setup for patient treatments. Additionally, I gained the ability to precept and successfully trained new technician hires.' },
  ],
  awards: ['Award of Merit- Pellissippi State', 'Nursing Program 2017', 'Meals on Wheels- 2017-2018', 'Remote Area Medical Expedition#900- 2018'],
  layoutColors: {
    sidebar: { primary: '#1e2442', secondary: '#667eea' },
    classic: { primary: '#3d3d3d', secondary: '#1a1a1a' },
    angel: { primary: '#0d9488', secondary: '#0d9488' },
    pro: { primary: '#3c3c3c', secondary: '#555555' },
    aqua: { primary: '#7dc4c4', secondary: '#5baaaa' },
  },
}

/** Blank resume state for new users – they enter and save their own data */
export const BLANK_RESUME_STATE = {
  profileImage: '/JadeResume.png',
  name: '',
  title: '',
  profile: '',
  phone: '',
  email: '',
  referenceNote: '',
  education: [],
  skills: [],
  experience: [],
  awards: [],
  layoutColors: {
    sidebar: { primary: '#1e2442', secondary: '#667eea' },
    classic: { primary: '#3d3d3d', secondary: '#1a1a1a' },
    angel: { primary: '#0d9488', secondary: '#0d9488' },
    pro: { primary: '#3c3c3c', secondary: '#555555' },
    aqua: { primary: '#7dc4c4', secondary: '#5baaaa' },
  },
}
