// Pure helpers shared by the build and browser. Family weeks follow Oslo time.
export const today = (now = new Date()) => new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Oslo', year: 'numeric', month: '2-digit', day: '2-digit',
}).format(now);
export const planStart = p => p.start || p.meals.map(m => m.date).sort()[0] || '';
export function weekStart(date) {
  const d = new Date(date + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() - (d.getUTCDay() + 6) % 7);
  return d.toISOString().slice(0, 10);
}
export function currentPlan(plans, date = today()) {
  const monday = weekStart(date);
  return plans.find(p => !p.example && planStart(p) && weekStart(planStart(p)) === monday)
    || (!plans.some(p => !p.example) ? plans.find(p => p.example) : null) || null;
}
export const isFinishedPlan = (plan, date = today()) => !plan.example && !!planStart(plan)
  && weekStart(planStart(plan)) < weekStart(date);
