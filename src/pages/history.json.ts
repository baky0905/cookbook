import { readHistory } from '../lib/content.mjs';
// Every saved week in one file, for analysis.
export const GET = () => new Response(JSON.stringify(readHistory(), null, 2), { headers: { 'Content-Type': 'application/json' } });
