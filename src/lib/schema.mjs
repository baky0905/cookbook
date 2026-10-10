import { z } from 'zod';

const id = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const positive = z.number().positive();
export const photoSchema = z.object({
  src: z.string().min(1), alt: z.string().min(1), caption: z.string().optional(),
  credit: z.string().optional(), source: z.string().url().optional(),
});
export const ingredientSchema = z.object({
  id, ingredient: id, name: z.string().min(1), quantity: positive.nullable().default(null),
  max: positive.optional(), unit: z.enum(['g','kg','ml','l','tsp','tbsp','piece','pinch','clove','can','package','sprig','']).default(''),
  note: z.string().optional(), original: z.string().optional(),
  optional: z.boolean().default(false), scalable: z.boolean().default(true),
  category: z.enum(['Produce','Meat & fish','Dairy & eggs','Bakery','Dry goods','Herbs & spices','Other']).default('Other'),
}).refine(v => v.max === undefined || (v.quantity !== null && v.max >= v.quantity), 'Invalid quantity range');
export const recipeSchema = z.object({
  title: z.string().min(1), description: z.string().default(''), category: z.string().min(1),
  tags: z.array(z.string()).default([]), language: z.string().default('en'),
  status: z.enum(['draft','needs-review','reviewed','cooked']).default('draft'),
  yield: z.object({ label: z.string().min(1), amount: positive.optional(), unit: z.string().default('portions'), scalable: z.boolean().default(false) }),
  time: z.object({ total: z.string().optional(), active: z.string().optional(), cook: z.string().optional(), rest: z.string().optional() }).default({}),
  groups: z.array(z.object({ name: z.string(), items: z.array(ingredientSchema).min(1) })).min(1),
  steps: z.array(z.object({ id, title: z.string().default(''), text: z.string().min(1), duration: z.string().optional(), images: z.array(photoSchema).default([]) })).min(1),
  cover: photoSchema.optional(),
  sources: z.array(z.object({ title: z.string(), url: z.string().url().optional(), accessed: z.string().optional(), timestamp: z.string().optional() })).default([]),
  issues: z.array(z.string()).default([]), adaptations: z.array(z.string()).default([]),
  legacyPath: z.string().regex(/^[a-z_]+\/[a-z_]+\/$/).optional(),
}).superRefine((r,ctx)=>{
  if(r.yield.scalable && !r.yield.amount) ctx.addIssue({code:'custom',message:'Scalable recipes need an exact yield'});
  const items = r.groups.flatMap(g=>g.items);
  for(const [kind,values] of [['ingredient',items.map(x=>x.id)],['step',r.steps.map(x=>x.id)]]) {
    if(new Set(values).size !== values.length) ctx.addIssue({code:'custom',message:`Duplicate ${kind} ID`});
  }
  for(const step of r.steps) for(const match of step.text.matchAll(/\{\{([a-z0-9-]+)\}\}/g)) {
    if(!items.some(i=>i.id===match[1])) ctx.addIssue({code:'custom',message:`Unknown ingredient reference ${match[1]}`});
  }
});
export const planSchema = z.object({
  id, title: z.string(), example: z.boolean().default(false),
  meals: z.array(z.object({ id, date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), meal: z.string().default('Dinner'), recipe: id.optional(), title: z.string().optional(), servings: positive.optional(), batches: positive.optional(), leftoversFrom: id.optional(), note: z.string().optional() })),
});
export const pantrySchema = z.object({
  updated: z.string().nullable(),
  items: z.array(z.object({ ingredient:id,name:z.string(),quantity:positive.optional(),unit:z.string().optional(),stocked:z.boolean().default(false) })),
});
