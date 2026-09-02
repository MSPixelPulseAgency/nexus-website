export const brand = {
  name: "Nexus Education Private School",
  shortName: "Nexus Education",
  email: "hello@mspixelpulse.com",
  phone: "+1 (000) 000-0000",
  lms: "https://lms.nexuseps.com/",
  canonical: "https://nexuseps.com",
  socialImage: "https://nexuseps.com/social/nexus-education-social-cover.png",
};

export const navigation = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Courses", to: "/courses" },
  { label: "Admissions", to: "/admissions" },
  { label: "Student Support", to: "/student-support" },
  { label: "Blog", to: "/blog" },
  { label: "Reviews", to: "/reviews" },
  { label: "Contact", to: "/contact" },
];

const unsplash = (id, width = 1400) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=82`;

export const images = {
  hero: unsplash("photo-1531482615713-2afd69097998", 1600),
  classroom: unsplash("photo-1509062522246-3755977927d7"),
  collaboration: unsplash("photo-1522202176988-66273c2fd55f"),
  science: unsplash("photo-1532094349884-543bc11b234d"),
  graduation: unsplash("photo-1523580846011-d3a5bc25702b"),
  campus: unsplash("photo-1523240795612-9a054b0db644"),
  mentoring: unsplash("photo-1577896851231-70ef18881754"),
  planning: unsplash("photo-1454165804606-c3d57bc86b40"),
  study: unsplash("photo-1434030216411-0b793f4b4173"),
  adultLearning: unsplash("photo-1516321318423-f06f85e504b3"),
  university: unsplash("photo-1541339907198-e08756dedf3f"),
  college: unsplash("photo-1541339907198-e08756dedf3f"),
  videoLearning: unsplash("photo-1584697964358-3e14ca57658b"),
  books: unsplash("photo-1495446815901-a7297e633e8d"),
  chemistry: unsplash("photo-1532187863486-abf9dbad1b69"),
  biology: unsplash("photo-1530210124550-912dc1381cb8"),
  physics: unsplash("photo-1635070041078-e363dbe005cb"),
  coding: unsplash("photo-1461749280684-dccba630e2f6"),
  business: unsplash("photo-1556761175-b413da4baf72"),
  geography: unsplash("photo-1526778548025-fa2f459cd5c1"),
  history: unsplash("photo-1564399579883-451a5d44ec08"),
  language: unsplash("photo-1457369804613-52c61a468e7d"),
  technology: unsplash("photo-1581092160562-40aa08e78837"),
  elementary: unsplash("photo-1503454537195-1dcabb73ffb9", 1500),
  reading: unsplash("photo-1544717305-2782549b5136", 1200),
  stemTeam: unsplash("photo-1531482615713-2afd69097998", 1500),
  onlineLesson: unsplash("photo-1516321318423-f06f85e504b3", 1400),
  artLearning: unsplash("photo-1549490349-8643362247b5", 1200),
  graduationGroup: unsplash("photo-1523580846011-d3a5bc25702b", 1500),
  familySupport: unsplash("photo-1577896851231-70ef18881754", 1400),
  secondaryStudents: unsplash("photo-1513258496099-48168024aec0", 1500),
};

export const courseVisuals = {
  "The Arts": unsplash("photo-1549490349-8643362247b5"),
  "Business Studies": images.business,
  "Canadian and World Studies": unsplash("photo-1521295121783-8a321d551ad2"),
  "Computer Studies": images.coding,
  English: images.books,
  "Guidance and Career Education": images.graduation,
  "Health and Physical Education": unsplash("photo-1571019613454-1cb2f99b2d8b"),
  Mathematics: unsplash("photo-1509228468518-180dd4864904"),
  Science: images.science,
  "Social Sciences and Humanities": unsplash("photo-1524995997946-a1c2e315a42f"),
  "Technological Education": images.technology,
};

const coursePhotoIds = {
  arts: ["photo-1549490349-8643362247b5", "photo-1522202176988-66273c2fd55f", "photo-1495446815901-a7297e633e8d"],
  biology: ["photo-1530210124550-912dc1381cb8", "photo-1532094349884-543bc11b234d", "photo-1524995997946-a1c2e315a42f"],
  business: ["photo-1556761175-b413da4baf72", "photo-1454165804606-c3d57bc86b40", "photo-1522202176988-66273c2fd55f"],
  chemistry: ["photo-1532187863486-abf9dbad1b69", "photo-1532094349884-543bc11b234d", "photo-1635070041078-e363dbe005cb"],
  coding: ["photo-1461749280684-dccba630e2f6", "photo-1581092160562-40aa08e78837", "photo-1516321318423-f06f85e504b3"],
  english: ["photo-1495446815901-a7297e633e8d", "photo-1434030216411-0b793f4b4173", "photo-1457369804613-52c61a468e7d"],
  geography: ["photo-1526778548025-fa2f459cd5c1", "photo-1521295121783-8a321d551ad2", "photo-1524661135-423995f22d0b"],
  guidance: ["photo-1523580846011-d3a5bc25702b", "photo-1577896851231-70ef18881754", "photo-1541339907198-e08756dedf3f"],
  health: ["photo-1571019613454-1cb2f99b2d8b", "photo-1530210124550-912dc1381cb8", "photo-1522202176988-66273c2fd55f"],
  history: ["photo-1564399579883-451a5d44ec08", "photo-1521295121783-8a321d551ad2", "photo-1495446815901-a7297e633e8d"],
  language: ["photo-1457369804613-52c61a468e7d", "photo-1495446815901-a7297e633e8d", "photo-1434030216411-0b793f4b4173"],
  mathematics: ["photo-1509228468518-180dd4864904", "photo-1635070041078-e363dbe005cb", "photo-1434030216411-0b793f4b4173"],
  physics: ["photo-1635070041078-e363dbe005cb", "photo-1532094349884-543bc11b234d", "photo-1581092160562-40aa08e78837"],
  science: ["photo-1532094349884-543bc11b234d", "photo-1532187863486-abf9dbad1b69", "photo-1530210124550-912dc1381cb8"],
  social: ["photo-1524995997946-a1c2e315a42f", "photo-1522202176988-66273c2fd55f", "photo-1577896851231-70ef18881754"],
  technology: ["photo-1581092160562-40aa08e78837", "photo-1461749280684-dccba630e2f6", "photo-1516321318423-f06f85e504b3"],
};

const hashCourse = (value = "") => [...value].reduce((hash, character) => Math.imul(hash ^ character.charCodeAt(0), 16777619) >>> 0, 2166136261);

const courseVisualCategory = (course) => {
  const code = course.code || "";
  const title = (course.title || "").toLowerCase();
  if (/chemistry/.test(title) || /^SCH/.test(code)) return "chemistry";
  if (/biology/.test(title) || /^SBI/.test(code)) return "biology";
  if (/physics/.test(title) || /^SPH/.test(code)) return "physics";
  if (/computer|programming/.test(title) || /^(ICS|ICD|BTA)/.test(code)) return "coding";
  if (/geograph/.test(title) || /^CG/.test(code)) return "geography";
  if (/history/.test(title) || /^CH/.test(code)) return "history";
  if (/english|literacy|writer/.test(title) || /^(ENG|EAE|EWC|OLC)/.test(code)) return "english";
  if (/french|language/.test(title) || /^(FSF|FIF|FEF|LV)/.test(code)) return "language";
  if (/math/.test(title) || course.department === "Mathematics") return "mathematics";
  if (course.department === "The Arts") return "arts";
  if (course.department === "Business Studies") return "business";
  if (course.department === "Guidance and Career Education") return "guidance";
  if (course.department === "Health and Physical Education") return "health";
  if (course.department === "Social Sciences and Humanities") return "social";
  if (course.department === "Technological Education") return "technology";
  if (course.department === "Science") return "science";
  return "guidance";
};

export const getCourseVisual = (courseOrDepartment, width = 1400) => {
  if (typeof courseOrDepartment === "string") return courseVisuals[courseOrDepartment] || images.classroom;
  const course = courseOrDepartment || {};
  const seed = hashCourse(`${course.code || "course"}:${course.title || course.department || "Nexus"}`);
  const category = courseVisualCategory(course);
  const pool = coursePhotoIds[category] || coursePhotoIds.guidance;
  const photoId = pool[seed % pool.length];
  const focalX = (0.32 + (seed % 37) / 100).toFixed(2);
  const focalY = (0.3 + ((seed >>> 8) % 39) / 100).toFixed(2);
  const saturation = (seed >>> 16) % 13 - 4;
  const contrast = 2 + ((seed >>> 24) % 7);
  const height = Math.round(width * (9 / 14));
  return `https://images.unsplash.com/${photoId}?auto=format&fit=crop&crop=focalpoint&fp-x=${focalX}&fp-y=${focalY}&w=${width}&h=${height}&q=82&sat=${saturation}&con=${contrast}&ixid=nexus-${encodeURIComponent(course.code || category)}`;
};

export const getCourseAccent = (course) => {
  const seed = hashCourse(`${course?.code || "Nexus"}:${course?.title || "Course"}`);
  const hue = 35 + (seed % 205);
  return `hsla(${hue}, 78%, 48%, 0.28)`;
};

export const imageSets = {
  home: [images.classroom, images.science, images.collaboration],
  about: [images.campus, images.mentoring, images.graduation],
  blog: [images.planning, images.classroom, images.science, images.collaboration, images.campus, images.graduation],
};

export const staticMeta = {
  "/": ["Nexus Education Private School | Ontario Learning", "Explore student-centred elementary learning, Ontario secondary school credit courses, academic pathways and student support."],
  "/about": ["About Nexus Education Private School", "Learn about the clear, student-focused and future-ready approach behind Nexus Education Private School."],
  "/about/team": ["Meet the Nexus Team | Nexus Education", "Meet the approved people supporting the Nexus school website, learning platform and future staff directory."],
  "/why-nexus": ["Why Nexus Education Private School", "Discover the clear, student-focused and future-ready approach behind Nexus Education Private School."],
  "/courses": ["Ontario Credit Courses | Nexus Education", "Search 207 Nexus catalogue records by exact code, title, grade, course type and department."],
  "/courses/grade-9": ["Grade 9 Ontario Courses | Nexus Education", "Explore Grade 9 Ontario secondary course records in the Nexus Education catalogue."],
  "/courses/grade-10": ["Grade 10 Ontario Courses | Nexus Education", "Explore Grade 10 Ontario secondary course records in the Nexus Education catalogue."],
  "/courses/grade-11": ["Grade 11 Ontario Courses | Nexus Education", "Explore Grade 11 Ontario secondary course records in the Nexus Education catalogue."],
  "/courses/grade-12": ["Grade 12 Ontario Courses | Nexus Education", "Explore Grade 12 Ontario secondary course records in the Nexus Education catalogue."],
  "/admissions": ["Admissions | Nexus Education Private School", "Explore the Nexus inquiry and admissions process, prerequisite guidance and enrollment preparation."],
  "/student-support": ["Student Support | Nexus Education", "Find support for course selection, prerequisites, academic planning and the Nexus learning platform."],
  "/online-learning": ["Online Learning | Nexus Education", "Learn how Nexus organizes digital learning, assignments, progress tracking and student communication."],
  "/academic-planning": ["Academic Planning | Nexus Education", "Plan Ontario secondary school courses, prerequisites, postsecondary requirements and realistic workloads."],
  "/blog": ["Nexus Journal | Student Planning Guides", "Read practical guides about Ontario courses, study skills, online learning, STEM and academic pathways."],
  "/reviews": ["Reviews | Nexus Education Private School", "Share thoughtful feedback about your Nexus experience through a privacy-aware moderated review form."],
  "/resources": ["Official Ontario Education Resources | Nexus Education", "Open verified Ontario and Canada education, postsecondary, student-aid, careers and skilled-trades resources."],
  "/inquiry": ["Start an Inquiry | Nexus Education", "Tell Nexus about your current studies, course interests and academic goals."],
  "/contact": ["Contact Nexus Education Private School", "Contact Nexus about courses, admissions, academic planning, LMS support or website accessibility."],
  "/faq": ["Frequently Asked Questions | Nexus Education", "Answers about Nexus courses, admissions, learning, LMS access and academic planning."],
  "/cart": ["Course Cart | Nexus Education", "Review selected Ontario secondary course records before preparing a Nexus enrollment request."],
  "/enroll": ["Enroll in Ontario Courses | Nexus Education", "Prepare selected courses and student information for a Nexus enrollment review."],
  "/register": ["Enroll in Ontario Courses | Nexus Education", "Prepare selected courses and student information for a Nexus enrollment review."],
  "/checkout": ["Course Enrollment Review | Nexus Education", "Review selected courses and prepare the required student and academic information."],
  "/credit-recovery": ["Ontario Credit Recovery Guidance | Nexus Education", "Explore course repetition, credit recovery and prerequisite planning with factual Ontario guidance."],
  "/upgrade-courses": ["Upgrade Ontario High School Courses | Nexus Education", "Plan a Grade 11 or Grade 12 course upgrade around verified postsecondary prerequisites."],
  "/adult-education": ["Adult Education and Ontario Credits | Nexus Education", "Explore Ontario secondary credits, prerequisite courses and OSSD planning for adult learners."],
  "/mature-students": ["Mature Student Ontario Course Planning | Nexus Education", "Understand document review, PLAR context and secondary course planning for mature students."],
  "/ossd": ["Ontario OSSD Requirements | Nexus Education", "Review current cohort-aware OSSD credit, literacy, community, online-learning and financial-literacy requirements."],
  "/ouac": ["OUAC Guide for Ontario Students | Nexus Education", "Plan university prerequisite courses and use the official OUAC undergraduate application guide."],
  "/ocas": ["OCAS Guide for Ontario College Applicants | Nexus Education", "Plan college prerequisites, transcripts and applications using official Ontario Colleges guidance."],
  "/student-resources/videos": ["Ontario Student Videos and Planning Resources | Nexus Education", "Watch official OUAC and Ontario Colleges guidance and open verified Ontario education resources."],
  "/understanding-course-codes": ["Ontario High School Course Codes Explained | Nexus Education", "Learn how Ontario secondary course codes identify subject, grade and course type."],
  "/ossd-requirements": ["Ontario OSSD Requirements Planning Guide | Nexus Education", "Review the main Ontario graduation planning areas and confirm the requirements for your Grade 9 entry cohort."],
  "/university-planning": ["Ontario University Course Planning Guide | Nexus Education", "Build a high school course plan around current university prerequisites and official sources."],
  "/college-planning": ["Ontario College Course Planning Guide | Nexus Education", "Compare Ontario college program requirements, prerequisites and preparation."],
  "/parent-guardian-guide": ["Parent and Guardian Course Planning Guide | Nexus Education", "Practical prompts for families supporting course research and independent learning habits."],
  "/privacy": ["Privacy | Nexus Education", "Read how Nexus handles website inquiries, contact information and public submissions."],
  "/terms": ["Terms of Use | Nexus Education", "Read the terms for using the Nexus Education Private School website and course catalogue."],
  "/accessibility": ["Accessibility | Nexus Education", "Read the Nexus commitment to an accessible website experience and how to report a barrier."],
  "/policies": ["School Policies | Nexus Education", "Review high-level Nexus policy topics and where registered students can find course-specific expectations."],
};
