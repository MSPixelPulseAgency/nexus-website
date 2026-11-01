import { ArrowRight, BadgeCheck, BookOpenCheck, Building2, CheckCircle2, ClipboardList, ExternalLink, GraduationCap, Hash, Route, ShoppingCart } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AddToCartButton from "../components/AddToCartButton";
import CourseCard from "../components/CourseCard";
import FAQAccordion from "../components/FAQAccordion";
import Reveal from "../components/Reveal";
import Seo from "../components/Seo";
import { CTASection, CheckList, SectionHeading } from "../components/UI";
import useCart from "../hooks/useCart";
import { courses } from "../data/catalog";
import { courseDescriptionsUrl, courseFaqs, getCurriculumUrl, learningHighlights } from "../data/curriculum";
import { brand, getCourseVisual } from "../data/site";
import NotFoundPage from "./NotFoundPage";
import { formatTuition } from "../data/tuition";

export default function CourseDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addCourse } = useCart();
  const course = courses.find((item) => item.slug === slug);
  if (!course) return <NotFoundPage />;

  const visual = getCourseVisual(course);
  const related = courses.filter((item) => item.slug !== course.slug && item.department === course.department).sort((a, b) => Math.abs(a.grade - course.grade) - Math.abs(b.grade - course.grade) || a.code.localeCompare(b.code)).slice(0, 3);
  const faqs = courseFaqs(course);
  const highlights = learningHighlights(course);
  const curriculumUrl = getCurriculumUrl(course);
  const description = `Study ${course.code} ${course.title} with Nexus Education Private School. Review its Grade ${course.grade} ${course.type} description, prerequisite, credit details, outline and enrollment options.`;
  const canonical = `${brand.canonical}/courses/${course.slug}`;
  const structuredData = [
    { "@context": "https://schema.org", "@type": "Course", name: `${course.code} ${course.title}`, description: course.description, courseCode: course.code, educationalLevel: `Grade ${course.grade}`, provider: { "@type": "EducationalOrganization", name: brand.name, url: brand.canonical }, url: canonical },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: `${brand.canonical}/` }, { "@type": "ListItem", position: 2, name: "Courses", item: `${brand.canonical}/courses` }, { "@type": "ListItem", position: 3, name: `Grade ${course.grade}`, item: `${brand.canonical}/courses/grade-${course.grade}` }, { "@type": "ListItem", position: 4, name: `${course.code} ${course.title}`, item: canonical }] },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) },
  ];

  const enrollCourse = () => {
    addCourse(course);
    navigate("/enroll");
  };

  return (
    <>
      <Seo title={`${course.title} (${course.code}) | Nexus Education Private School`} description={description} image={visual} structuredData={structuredData} />
      <section className="course-detail-hero">
        <div className="container">
          <nav className="breadcrumbs" aria-label="Breadcrumb"><Link to="/">Home</Link><span>/</span><Link to="/courses">Courses</Link><span>/</span><Link to={`/courses/grade-${course.grade}`}>Grade {course.grade}</Link><span>/</span><span aria-current="page">{course.title} | {course.code}</span></nav>
          <div className="course-hero-grid">
            <div className="course-hero-copy"><span className="eyebrow">ONTARIO COURSE · GRADE {course.grade}</span><span className="course-code course-code-large">{course.code}</span><h1>{course.title} <span className="course-title-separator">|</span> <span className="course-title-code">{course.code}</span></h1><p>{course.description}</p><div className="course-hero-badges"><span>Grade {course.grade}</span><span>{course.type}</span><span>{course.credit} credit</span></div><div className="button-row"><AddToCartButton course={course} /><button className="btn btn-secondary" type="button" onClick={enrollCourse}><GraduationCap size={17} /> Enroll in This Course</button><Link className="text-link" to={`/courses/${course.slug}/outline`}><ClipboardList size={17} /> Course Outline</Link></div><div className="course-snapshot course-snapshot-horizontal"><span className="mini-label">COURSE INFORMATION</span><dl><div><dt><Hash size={17} />Course code</dt><dd>{course.code}</dd></div><div><dt><GraduationCap size={17} />Grade</dt><dd>{course.grade}</dd></div><div><dt><Route size={17} />Course type</dt><dd>{course.type}</dd></div><div><dt><BadgeCheck size={17} />Credit value</dt><dd>{course.credit}</dd></div><div><dt><Building2 size={17} />Department</dt><dd>{course.department}</dd></div></dl></div></div>
            <div className="course-hero-side"><div className="course-visual-card"><img src={visual} alt={`${course.department} visual for ${course.title}`} width="1400" height="900" fetchPriority="high" decoding="async" /><div><span>{course.department}</span><strong>{course.code}</strong></div></div></div>
          </div>
        </div>
      </section>

      <Reveal as="section" className="section container course-detail-body course-detail-expanded">
        <article>
          <SectionHeading eyebrow="COURSE OVERVIEW" title="Understand the Course Before You Enroll." />
          <p className="large-copy">{course.description}</p>
          <h2>Prerequisite</h2><div className="notice-card"><BookOpenCheck size={22} /><div><strong>{course.prerequisite}</strong><p>Confirm that the listed prerequisite and current eligibility rules apply to the student's record before enrollment.</p></div></div>
          <h2>Who this course is for</h2><p>{course.code} may be relevant to students whose academic plan calls for a Grade {course.grade} {course.type} course in {course.department}. The course code, destination and prerequisite should be checked against graduation or postsecondary requirements.</p>
          <h2>What students will learn</h2>{highlights.length ? <CheckList items={highlights} /> : <p>The current public source provides limited descriptive detail. Use the official curriculum link and registered course materials for the complete expectations.</p>}
          <h2>Course outline</h2><p>The separate outline page mirrors the current Nexus LMS section sequence and adds a responsive unit table. It does not replace enrolled-course instructions.</p><Link className="outline-link-card" to={`/courses/${course.slug}/outline`}><span className="icon-bubble"><ClipboardList size={22} /></span><span><strong>Open the {course.code} course outline</strong><small>{course.outlineLength} LMS sections listed</small></span><ArrowRight size={18} /></Link>
          <h2>Official Ontario curriculum</h2><p>Use the Ministry curriculum and course-description sources alongside Nexus guidance when confirming expectations and prerequisites.</p><div className="official-link-row"><a className="text-link" href={curriculumUrl} target="_blank" rel="noreferrer">Open the relevant curriculum source <ExternalLink size={15} /></a><a className="text-link" href={courseDescriptionsUrl} target="_blank" rel="noreferrer">Course descriptions and prerequisites <ExternalLink size={15} /></a></div>
          <div className="course-faq-section"><SectionHeading eyebrow="FREQUENTLY ASKED QUESTIONS" title={`${course.code} Questions, Answered Carefully.`} /><FAQAccordion items={faqs} /></div>
        </article>
        <aside><div className="planning-card course-registration-panel"><ShoppingCart size={30} /><span className="mini-label">COURSE ENROLLMENT</span><h2>{course.code}</h2><p className="course-tuition"><strong>{formatTuition()}</strong><span> / course · one-time tuition</span></p><dl><div><dt>Credit</dt><dd>{course.credit}</dd></div><div><dt>Prerequisite</dt><dd>{course.prerequisite}</dd></div></dl><div className="availability-note"><CheckCircle2 size={18} /><span><strong>{course.offeringStatus}</strong>The catalogue record does not guarantee current availability, delivery or individual eligibility.</span></div><AddToCartButton course={course} /><button className="btn btn-secondary" type="button" onClick={enrollCourse}><GraduationCap size={17} /> Enroll Now</button><Link className="text-link" to={`/inquiry?course=${course.code}`}>Ask About This Course</Link><a className="text-link" href={brand.lms} target="_blank" rel="noreferrer">Enrolled student LMS <ExternalLink size={15} /></a><div className="course-plan-points"><span><Route size={17} />Check the prerequisite chain</span><span><GraduationCap size={17} />Confirm the intended pathway</span></div></div></aside>
      </Reveal>
      <Reveal as="section" className="section soft-section"><div className="container"><SectionHeading eyebrow="RELATED COURSES" title={`More ${course.department} Options`} text="Compare nearby catalogue records, then confirm the prerequisite sequence and current availability." /><div className="card-grid three">{related.map((item) => <CourseCard compact course={item} key={item.code} />)}</div></div></Reveal>
      <CTASection title={`Ask About ${course.code}.`} text="Share your current studies and goal so Nexus can help clarify the appropriate next step." />
    </>
  );
}
