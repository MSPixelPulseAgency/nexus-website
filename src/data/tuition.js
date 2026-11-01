import tuition from "./tuition.json" with { type: "json" };

export const COURSE_TUITION_CENTS = tuition.amount;
export const formatTuition = (amount = COURSE_TUITION_CENTS) => `CA$${new Intl.NumberFormat("en-CA", {
  minimumFractionDigits: amount % 100 === 0 ? 0 : 2, maximumFractionDigits: 2,
}).format(amount / 100)}`;
