import courseRows from "./course-summaries.js";
import { blogCategories, blogs } from "./blogCatalog.js";
import { rankCourses } from "./courseSearch.js";
import { COURSE_TUITION_CENTS } from "./tuition.js";

export const courses = courseRows.map((row) => ({
  ...row,
  priceCents: COURSE_TUITION_CENTS,
  searchText: `${row.code} ${row.title} grade ${row.grade} ${row.type} ${row.department}`.toLowerCase(),
}));

export const gradeCounts = Object.fromEntries(
  [9, 10, 11, 12].map((grade) => [grade, courses.filter((course) => course.grade === grade).length]),
);

export const departmentsList = [...new Set(courses.map((course) => course.department))].sort();
export const courseTypes = [...new Set(courses.map((course) => course.type))].sort();
export { blogCategories, blogs };

export { rankCourses };
