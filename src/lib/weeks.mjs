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
const forWeek = (plans, monday) => plans.find(p => !p.example && planStart(p) && weekStart(planStart(p)) === monday);
// Sunday is shopping day, so it shows the coming week once that week is planned.
export function currentPlan(plans, date = today()) {
  const monday = weekStart(date);
  const sunday = new Date(date + 'T12:00:00Z').getUTCDay() === 0;
  const coming = sunday && forWeek(plans, new Date(Date.parse(monday + 'T12:00:00Z') + 7 * 864e5).toISOString().slice(0, 10));
  return coming || forWeek(plans, monday)
    || (!plans.some(p => !p.example) ? plans.find(p => p.example) : null) || null;
}
export const isFinishedPlan = (plan, date = today()) => !plan.example && !!planStart(plan)
  && weekStart(planStart(plan)) < weekStart(date);
