import { AlertCircle, ArrowRight, ExternalLink, GraduationCap, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import NexusSearch from "../components/NexusSearch";
import Seo from "../components/Seo";
import useCart from "../hooks/useCart";
import { COURSE_TUITION_CENTS, formatTuition } from "../data/tuition";

const initialForm = {
  firstName: "", middleName: "", lastName: "", dob: "", email: "", phone: "", currentGrade: "",
  isAdult: "", international: "", city: "", province: "Ontario", country: "Canada", postalCode: "",
  school: "", studiedOntario: "", academicGoal: "", postsecondaryGoal: "", notes: "",
  guardianName: "", guardianEmail: "", guardianPhone: "", accuracy: false, privacy: false, contactConsent: false,
};

export default function RegisterPage() {
  const { items } = useCart();
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState({ state: "idle", message: "" });
  const courseSummary = useMemo(() => items.map(({ code, title }) => ({ code, title })), [items]);
  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.type === "checkbox" ? event.target.checked : event.target.value }));

  const submit = (event) => {
    event.preventDefault();
    if (!items.length) {
      setStatus({ state: "error", message: "Add at least one course before submitting enrollment details." });
      return;
    }
    setStatus({ state: "error", message: "Online delivery is not configured, so no student information was transmitted or stored. Contact Nexus directly to continue safely." });
  };

  return (
    <>
      <Seo title="Enroll in Ontario Courses | Nexus Education Private School" description="Prepare student, academic and selected-course information for a Nexus Education enrollment review." />
      <section className="page-hero register-hero"><div className="container"><nav className="breadcrumbs" aria-label="Breadcrumb"><Link to="/">Home</Link><span>/</span><Link to="/cart">Course Cart</Link><span>/</span><span aria-current="page">Enroll</span></nav><div className="page-hero-copy"><span className="eyebrow"><GraduationCap size={14} /> ENROLLMENT</span><h1>Prepare Your Courses for Review.</h1><p>Complete the form with accurate student and academic information. A submission is not confirmation of enrolment, availability or eligibility.</p></div></div></section>
      <section className="section container register-layout">
        <div>
          {!items.length && <div className="register-empty"><AlertCircle size={22} /><div><strong>No courses selected</strong><p>Add a course from search or the catalogue before continuing.</p></div></div>}
          <div className="register-search"><span className="mini-label">ADD A COURSE</span><NexusSearch className="register-course-search" /></div>
          <form className="form-card registration-form" onSubmit={submit}>
            <div className="form-heading"><span className="mini-label">STUDENT</span><h2>Student information</h2><p>This page validates the enrollment fields locally. Sensitive information is not transmitted while delivery configuration is pending.</p></div>
            <div className="form-grid">
              <label>First name<input required value={form.firstName} onChange={set("firstName")} autoComplete="given-name" /></label>
              <label>Middle name <span>(optional)</span><input value={form.middleName} onChange={set("middleName")} autoComplete="additional-name" /></label>
              <label>Last name<input required value={form.lastName} onChange={set("lastName")} autoComplete="family-name" /></label>
              <label>Date of birth<input required type="date" value={form.dob} onChange={set("dob")} autoComplete="bday" /></label>
              <label>Email<input required type="email" value={form.email} onChange={set("email")} autoComplete="email" inputMode="email" /></label>
              <label>Phone<input required type="tel" value={form.phone} onChange={set("phone")} autoComplete="tel" inputMode="tel" /></label>
              <label>Current grade<select required value={form.currentGrade} onChange={set("currentGrade")}><option value="">Select one</option>{[9,10,11,12].map((grade) => <option key={grade}>Grade {grade}</option>)}<option>Not currently enrolled</option></select></label>
              <label>Are you 18 or older?<select required value={form.isAdult} onChange={set("isAdult")}><option value="">Select one</option><option value="yes">Yes</option><option value="no">No</option></select></label>
              <label>International student?<select required value={form.international} onChange={set("international")}><option value="">Select one</option><option value="yes">Yes</option><option value="no">No</option></select></label>
            </div>
            {form.isAdult === "no" && <fieldset className="form-section"><legend>Parent or guardian</legend><div className="form-grid"><label>Parent / guardian name<input required value={form.guardianName} onChange={set("guardianName")} /></label><label>Parent / guardian email<input required type="email" value={form.guardianEmail} onChange={set("guardianEmail")} inputMode="email" /></label><label>Parent / guardian phone<input type="tel" value={form.guardianPhone} onChange={set("guardianPhone")} inputMode="tel" /></label></div></fieldset>}
            <fieldset className="form-section"><legend>Address</legend><div className="form-grid"><label>City<input required value={form.city} onChange={set("city")} autoComplete="address-level2" /></label><label>Province / state<input required value={form.province} onChange={set("province")} autoComplete="address-level1" /></label><label>Country<input required value={form.country} onChange={set("country")} autoComplete="country-name" /></label><label>Postal / ZIP code<input required value={form.postalCode} onChange={set("postalCode")} autoComplete="postal-code" /></label></div></fieldset>
            <fieldset className="form-section"><legend>Academic information</legend><div className="form-grid"><label>Current / previous school<input required value={form.school} onChange={set("school")} /></label><label>Studied in an Ontario high school?<select required value={form.studiedOntario} onChange={set("studiedOntario")}><option value="">Select one</option><option value="yes">Yes</option><option value="no">No</option></select></label><label className="field-wide">Academic goal<textarea required rows="4" value={form.academicGoal} onChange={set("academicGoal")} placeholder="Credit, diploma, prerequisite, university, college or another goal" /></label><label className="field-wide">University / college goal <span>(optional)</span><textarea rows="3" value={form.postsecondaryGoal} onChange={set("postsecondaryGoal")} /></label><label className="field-wide">Additional notes <span>(optional)</span><textarea rows="4" value={form.notes} onChange={set("notes")} /></label></div></fieldset>
            <fieldset className="form-section consent-section"><legend>Consent</legend><label className="check-control"><input required type="checkbox" checked={form.accuracy} onChange={set("accuracy")} /><span>I confirm the information entered is accurate to the best of my knowledge.</span></label><label className="check-control"><input required type="checkbox" checked={form.privacy} onChange={set("privacy")} /><span>I have reviewed the <Link to="/privacy">privacy information</Link>.</span></label><label className="check-control"><input required type="checkbox" checked={form.contactConsent} onChange={set("contactConsent")} /><span>I give permission for Nexus to contact the student and, where applicable, the parent or guardian about this request once secure delivery is configured.</span></label></fieldset>
            <button className="btn btn-primary registration-submit" type="submit" disabled={!items.length}>Review Submission State <ArrowRight size={18} /></button>
            {status.state !== "idle" && <div className="submission-status is-error" role="alert"><AlertCircle size={22} /><div><strong>Submission not sent</strong><p>{status.message}</p></div></div>}
          </form>
        </div>
        <aside className="registration-summary"><ShieldCheck size={28} /><span className="mini-label">SELECTED COURSES</span><h2>{items.length ? `${items.length} selected` : "None selected"}</h2>{courseSummary.map((course) => <div className="registration-course" key={course.code}><span className="course-code">{course.code}</span><strong>{course.title}</strong><span>{formatTuition()}</span></div>)}<div className="registration-tuition-total"><span>Tuition total (CAD)</span><strong>{formatTuition(items.length * COURSE_TUITION_CENTS)}</strong></div><p>One-time tuition is {formatTuition()} per course. Registration delivery is pending; this form does not submit student information or confirm enrollment.</p>{items.length > 0 && <Link className="btn btn-primary" to="/checkout?cart=1">Try Sandbox Payment <ArrowRight size={17} /></Link>}<p className="cart-payment-note">Test the payment step with your selected courses. No student, guardian or academic information is sent to Stripe. No real charge is taken.</p><Link className="text-link" to="/cart">Edit course cart</Link><a className="text-link" href="https://www.dcp.edu.gov.on.ca/en/course-descriptions-and-prerequisites" target="_blank" rel="noreferrer">Ontario course descriptions <ExternalLink size={15} /></a></aside>
      </section>
    </>
  );
}
