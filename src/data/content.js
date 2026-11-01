export const faqGroups = {
  Courses: [
    ["What grades does Nexus support?", "The current public catalogue is organized for Ontario secondary school Grades 9 through 12."],
    ["How do I search for a course?", "Search by exact course code, title, grade, department or course type. Exact course-code matches appear first."],
    ["How do prerequisites work?", "Prerequisites identify learning that may need to be completed before a course. Confirm your eligibility with Nexus before enrollment when a listing is unclear."],
    ["Can I take an individual course?", "Use the inquiry form to share the course you need and your current studies. Nexus can clarify the available next step."],
  ],
  Admissions: [
    ["How do I start an inquiry?", "Share your current grade, course interest, academic goal and preferred contact details through the inquiry page."],
    ["What should I prepare?", "Have your current grade, course code if known, relevant prerequisite information and any timing or postsecondary goals ready."],
    ["Is tuition listed online?", "Tuition is CAD 499.00 per course. Review the total in your course cart. Online checkout is currently a sandbox test; Nexus must confirm eligibility, availability and applicable payment terms before live enrollment."],
  ],
  Learning: [
    ["How is online learning organized?", "Enrolled students use a digital learning environment for course materials, assignments, progress and communication. Course-specific expectations are shared after access is confirmed."],
    ["Is every course fully self-paced?", "The website does not make that promise. Confirm the format, timelines and expectations for the specific course you are considering."],
  ],
  LMS: [
    ["Where do students log in?", "Enrolled students use the LMS link in the header, footer or Student Support page."],
    ["What if I cannot access the LMS?", "Use the Contact page and select LMS Support so your request reaches the right support path."],
  ],
  Parents: [
    ["Can a parent or guardian submit an inquiry?", "Yes. The inquiry form includes conditional parent or guardian details for students who are under 18."],
    ["How can families support course planning?", "Start with the student’s goal, verify prerequisite chains and compare the overall workload before finalizing a course choice."],
  ],
  "Academic Planning": [
    ["How can I get academic planning help?", "Use the Academic Planning page and course finder first, then send an inquiry with your current grade and future goal."],
    ["Can Nexus guarantee admission to a university or college program?", "No. Program requirements and admission decisions belong to each institution. Always verify current requirements directly with the institution."],
  ],
};

export const articleGuides = {
  "Ontario Credits & Course Planning": {
    intro: "Ontario course planning becomes clearer when each code, prerequisite and credit is connected to a specific goal.",
    sections: [
      ["Read the course code in parts", "Start with the subject letters, grade-position digit and course-type character. Together they help you compare level, subject and pathway context."],
      ["Check the prerequisite chain", "Look beyond the next course. Work backward from a target Grade 12 course or postsecondary requirement so an earlier choice does not close an option unintentionally."],
      ["Confirm before you enroll", "Course information can change and individual eligibility matters. Verify unclear prerequisite or availability details before committing."],
    ],
    checklist: ["Write down the target course or program", "Check the full prerequisite chain", "Compare credit and course type", "Confirm availability with Nexus"],
  },
  "Grade 9": {
    intro: "Grade 9 is a foundation year: the aim is to build routines, understand course expectations and notice where curiosity is growing.",
    sections: [["Build a balanced foundation", "Give core subjects enough attention while leaving space to explore arts, technology, health or other interests."], ["Learn the code system early", "Understanding course codes now makes future course selection more confident and less rushed."], ["Create a weekly rhythm", "Use a consistent schedule for review, assignments and questions rather than relying on last-minute study sessions."]],
    checklist: ["Review every course code", "Mark important dates", "Choose a regular study block", "Ask questions early"],
  },
  "Grade 10": {
    intro: "Grade 10 course choices continue the foundation while starting to shape the options available in senior grades.",
    sections: [["Look one year ahead", "Check which Grade 11 courses connect to current interests and what they require."], ["Keep exploration purposeful", "Electives can help test interests while core courses keep important pathways open."], ["Review progress honestly", "Use current results and learning habits as information for planning—not as a fixed label."]],
    checklist: ["Review Grade 11 options", "Check prerequisites", "Discuss emerging interests", "Balance workload"],
  },
  "Grade 11": {
    intro: "Grade 11 is where prerequisite planning and future program research become especially important.",
    sections: [["Start with possible destinations", "You do not need one perfect career choice, but a shortlist of programs or fields helps reveal required Grade 12 courses."], ["Map Grade 12 prerequisites", "Work backward from each possible requirement and identify which Grade 11 course needs to come first."], ["Protect a realistic workload", "A demanding plan should still leave enough time for understanding, revision and wellbeing."]],
    checklist: ["Research several programs", "Map Grade 12 prerequisites", "Check course types", "Plan a sustainable workload"],
  },
  "Grade 12 & Postsecondary": {
    intro: "Grade 12 planning works best when graduation needs, prerequisites, deadlines and backup options are reviewed together.",
    sections: [["Verify requirements at the source", "Check current university or college program pages directly and note required courses, deadlines and other conditions."], ["Track every deadline", "Build one timeline for course completion, applications, document requests and other milestones."], ["Keep more than one pathway visible", "A strong plan can include a preferred route plus thoughtful alternatives that still support the same broader goal."]],
    checklist: ["Confirm remaining graduation needs", "Verify program prerequisites", "Record deadlines", "Prepare a backup pathway"],
  },
  "Study Skills & Student Success": {
    intro: "Effective study habits are usually small systems repeated consistently, not dramatic last-minute efforts.",
    sections: [["Turn goals into scheduled actions", "Replace ‘study more’ with a specific subject, task, time and place."], ["Use active review", "Practice retrieval, solve problems, explain ideas aloud and check what still feels uncertain."], ["Review the system weekly", "Notice what worked, adjust unrealistic plans and carry unfinished priorities into the next week deliberately."]],
    checklist: ["Choose one clear outcome", "Schedule focused blocks", "Use active practice", "Review progress weekly"],
  },
  "Online Learning": {
    intro: "Online learning is easier to navigate when the workspace, schedule, communication habits and technology are prepared in advance.",
    sections: [["Set up a dependable learning space", "Use a stable connection, current browser and organized folder system in a place that supports concentration."], ["Check the LMS consistently", "Review announcements, activities and deadlines on a predictable schedule rather than waiting for reminders."], ["Communicate with context", "When asking for help, include the course, activity, what you tried and the specific point that is unclear."]],
    checklist: ["Test your browser and connection", "Choose regular LMS check-in times", "Organize course files", "Ask specific questions"],
  },
  "STEM & Future Skills": {
    intro: "STEM learning develops more than technical knowledge; it builds habits for testing ideas, interpreting evidence and solving unfamiliar problems.",
    sections: [["Build through small projects", "A focused experiment, coding task or design challenge can make abstract ideas concrete."], ["Document the thinking", "Record assumptions, attempts, errors and revisions so progress is visible and repeatable."], ["Connect disciplines", "Strong future-ready work often combines mathematics, science, communication, creativity and ethical judgment."]],
    checklist: ["Choose a small problem", "Test one idea", "Record results", "Explain what you would change"],
  },
  "Parents & Families": {
    intro: "Families can support planning best by creating structure, asking useful questions and keeping the student involved in decisions.",
    sections: [["Begin with listening", "Ask what feels clear, what feels difficult and what the student hopes a course choice will make possible."], ["Make information visible", "Keep codes, prerequisites, deadlines and questions in one shared planning document."], ["Support without taking over", "Help organize the process while leaving room for the student to research, ask questions and own the final plan."]],
    checklist: ["Ask open questions", "Review requirements together", "Agree on a check-in rhythm", "Keep the student involved"],
  },
  "Academic Pathways & Careers": {
    intro: "Career exploration is most useful when it creates several testable directions rather than pressure to choose one permanent answer.",
    sections: [["Explore fields before job titles", "Start with problems, environments and subjects that hold interest, then identify several roles connected to them."], ["Compare education routes", "Look at university, college, apprenticeship and other pathways without assuming one route fits every goal."], ["Translate research into course choices", "Use current program requirements to identify courses that keep promising options open."]],
    checklist: ["List three fields of interest", "Compare education routes", "Check program prerequisites", "Plan one next exploration step"],
  },
  "School Life & Motivation": {
    intro: "Motivation changes from week to week, so reliable routines matter more than waiting to feel ready.",
    sections: [["Make the next action small", "Choose a step that can be started in a few minutes and clearly moves the task forward."], ["Reduce friction", "Prepare materials, close distractions and decide where work will happen before the study block begins."], ["Reset without drama", "A difficult day does not need to become a difficult week. Review what happened and restart with the next useful action."]],
    checklist: ["Name the next small action", "Prepare the workspace", "Use a realistic timer", "Plan tomorrow before stopping"],
  },
};

export const legalContent = {
  privacy: {
    eyebrow: "PRIVACY",
    title: "Privacy should be clear and practical.",
    intro: "This page explains the high-level approach to information submitted through the Nexus public website.",
    sections: [["Information you choose to provide", "Inquiry, contact, review, comment and subscription interfaces may request contact details and the message you choose to submit."], ["How information may be used", "Submitted information may be used to respond, provide support, moderate public contributions and improve website services."], ["Public contributions", "Private email addresses should not be displayed with reviews or comments. Public content may be moderated for relevance, safety and privacy."], ["Retention and service providers", "Operational retention and service-provider details should be finalized with the production form and email workflow."], ["Privacy questions", "Use the Contact page and select the most relevant topic if you have a question about information submitted through this website."]],
  },
  terms: {
    eyebrow: "TERMS",
    title: "Website terms built for responsible use.",
    intro: "These high-level terms cover use of the public Nexus website, catalogue and communication interfaces.",
    sections: [["Information and decisions", "Course and pathway information is provided for discovery and planning. Confirm availability, prerequisites, fees and registration details before making a decision."], ["Acceptable use", "Do not interfere with the website, submit unlawful or harmful material, impersonate another person or misuse public forms."], ["External services", "The LMS and third-party services are governed by their own terms, privacy practices and availability."], ["Intellectual property", "Website design, original text and visual presentation may not be republished as another organization’s work without permission."], ["Updates", "Website information and these terms may be updated as services and operational processes evolve."]],
  },
  accessibility: {
    eyebrow: "ACCESSIBILITY",
    title: "Designed to work for more people.",
    intro: "Nexus aims to provide a clear, keyboard-friendly and responsive public website experience aligned with WCAG 2.2 AA principles.",
    sections: [["Keyboard access", "Navigation, controls, accordions and forms are intended to work without a mouse and include visible focus indicators."], ["Readable presentation", "The site uses semantic headings, clear labels, scalable text, high-contrast controls and layouts that adapt across devices."], ["Motion and media", "Motion is limited and respects reduced-motion preferences. Informative images include meaningful alternative text."], ["Known limitations", "Third-party services, including the LMS, may have separate accessibility features and support processes."], ["Report a barrier", "Use the Contact page and choose Website Accessibility. Describe the page, task and barrier so the issue can be investigated."]],
  },
  policies: {
    eyebrow: "POLICIES",
    title: "Clear expectations support better learning.",
    intro: "Registered students should use current official school and course documents for complete requirements. This public overview is not a replacement for those documents.",
    sections: [["Academic integrity", "Students are expected to submit honest work, acknowledge sources and follow course-specific assessment expectations."], ["Participation and deadlines", "Learning format, participation expectations and deadlines may differ by course and should be reviewed inside the LMS."], ["Respectful communication", "Students, families and staff should communicate respectfully and use school systems for legitimate academic purposes."], ["Technology use", "Accounts and learning materials should be accessed securely and shared only as permitted."], ["Questions and current versions", "Ask Nexus when a requirement is unclear and refer to the current official policy or course document before acting."]],
  },
};
