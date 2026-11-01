import tuition from "./tuition.json" with { type: "json" };

export const COURSE_TUITION_CENTS = tuition.amount;
export const formatTuition = (amount = COURSE_TUITION_CENTS) => new Intl.NumberFormat("en-CA", {
  style: "currency", currency: tuition.currency, currencyDisplay: "code",
}).format(amount / 100);
