import { ArrowRight, BookOpen, ShoppingBag, Trash2, X } from "lucide-react";
import { Link } from "react-router-dom";
import Seo from "../components/Seo";
import PaymentCTA from "../components/PaymentCTA";
import useCart from "../hooks/useCart";
import { getCourseVisual } from "../data/site";
import { COURSE_TUITION_CENTS, formatTuition } from "../data/tuition";

export default function CartPage() {
  const { items, removeCourse, clearCart } = useCart();
  return (
    <>
      <Seo title="Course Cart | Nexus Education Private School" description="Review the Ontario secondary school courses selected for a Nexus enrollment inquiry." />
      <section className="page-hero cart-hero"><div className="container"><nav className="breadcrumbs" aria-label="Breadcrumb"><Link to="/">Home</Link><span>/</span><span aria-current="page">Course Cart</span></nav><div className="page-hero-copy"><span className="eyebrow"><ShoppingBag size={14} /> COURSE CART</span><h1>Review Your Course Selections.</h1><p>Tuition is {formatTuition()} per course. Review your selections and prepare your registration. Online payment availability is shown below. Availability and eligibility require school review.</p></div></div></section>
      <section className="section container cart-layout">
        <div className="cart-list" aria-live="polite">
          <div className="cart-list-heading"><div><span className="mini-label">SELECTED COURSES</span><h2>{items.length ? `${items.length} course${items.length === 1 ? "" : "s"}` : "Your cart is empty"}</h2></div>{items.length > 0 && <button type="button" onClick={clearCart}><Trash2 size={17} /> Clear cart</button>}</div>
          {items.length ? items.map((course) => <article className="cart-course" key={course.code}><img src={getCourseVisual(course.department)} alt="" width="1400" height="900" loading="lazy" decoding="async" /><div><span className="course-code">{course.code}</span><h3><Link to={`/courses/${course.slug}`}>{course.title}</Link></h3><p>Grade {course.grade} · {course.type} · {course.credit} credit</p><small>Prerequisite: {course.prerequisite}</small><p className="course-tuition"><strong>{formatTuition()}</strong> / course</p></div><button type="button" onClick={() => removeCourse(course.code)} aria-label={`Remove ${course.code} from cart`}><X size={19} /></button></article>) : <div className="empty-state"><BookOpen size={38} /><h2>Choose courses before enrolling.</h2><p>Search the complete catalogue by code, title, grade, type or department.</p><Link className="btn btn-primary" to="/courses">Explore Courses <ArrowRight size={17} /></Link></div>}
        </div>
        <aside className="cart-summary"><span className="mini-label">TUITION SUMMARY</span><h2>Your course total.</h2><p>One-time tuition of {formatTuition()} for each selected course.</p><dl><div><dt>Courses</dt><dd>{items.length}</dd></div><div><dt>Tuition per course</dt><dd>{formatTuition()}</dd></div><div><dt>Tuition total (CAD)</dt><dd>{formatTuition(items.length * COURSE_TUITION_CENTS)}</dd></div><div><dt>Total credits represented</dt><dd>{items.reduce((sum, item) => sum + Number(item.credit || 0), 0)}</dd></div></dl><Link className={`btn btn-primary ${items.length ? "" : "is-disabled"}`} aria-disabled={!items.length} tabIndex={items.length ? 0 : -1} to={items.length ? "/enroll" : "/courses"}>Prepare Registration <ArrowRight size={17} /></Link>{items.length > 0 && <PaymentCTA />}<p className="cart-payment-note">A payment does not confirm enrollment or eligibility. Nexus must confirm availability, applicable fees and payment terms before live tuition collection.</p><Link className="text-link" to="/courses">Continue browsing</Link></aside>
      </section>
    </>
  );
}
