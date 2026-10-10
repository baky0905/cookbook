import { formatAmount, number } from './format.mjs';
export { number };
export function amount(item, factor=1) {
  if(item.quantity == null) return '';
  return formatAmount({qty:item.quantity,max:item.max,unit:item.unit,scalable:item.scalable!==false},factor);
}
const round=n=>Math.round(n*1e6)/1e6;
export function normalise(quantity,unit) {
  if(unit==='kg') return {quantity:round(quantity*1000),unit:'g'};
  if(unit==='l') return {quantity:round(quantity*1000),unit:'ml'};
  return {quantity,unit};
}
export function shoppingList(plan, recipes, pantry) {
  const rows=new Map();const warnings=[];
  const byId=new Map(recipes.map(r=>[r.id,r.data]));
  for(const meal of plan.meals) {
    if(meal.leftoversFrom) {
      const source=plan.meals.find(m=>m.id===meal.leftoversFrom);
      if(!source || source.leftoversFrom || !source.recipe || source.date>meal.date) throw new Error(`Invalid leftovers reference: ${meal.id}`);
      continue;
    }
    if(!meal.recipe) continue;
    const recipe=byId.get(meal.recipe);
    if(!recipe) throw new Error(`Unknown recipe: ${meal.recipe}`);
    if(recipe.status==='draft') throw new Error(`Draft recipe in plan: ${meal.recipe}`);
    let factor=meal.batches || 1;
    if(meal.servings) {
      if(!recipe.yield.scalable || !recipe.yield.amount) throw new Error(`Exact scaling unavailable for ${recipe.title}; use batches`);
      factor=meal.servings/recipe.yield.amount;
    }
    if(recipe.issues.length) warnings.push(`${recipe.title}: check recipe notes before shopping.`);
    for(const item of recipe.groups.flatMap(g=>g.items)) {
      const q=item.quantity==null?null:normalise(item.quantity*(item.scalable===false?1:factor),item.unit);
      const max=item.max==null?null:normalise(item.max*(item.scalable===false?1:factor),item.unit).quantity;
      // Unknown amounts must remain visible even if another recipe quantifies the same ingredient.
      const key=[item.ingredient,q?.unit||item.unit,q?'known':'unknown',item.optional?'optional':'required'].join('|');
      const row=rows.get(key)||{key,ingredient:item.ingredient,name:item.name,quantity:q?0:null,max:q?0:null,unit:q?.unit||item.unit,category:item.category,optional:item.optional,recipes:[],notes:[]};
      if(q){row.quantity=round(row.quantity+q.quantity);row.max=round(row.max+(max??q.quantity));}
      if(!row.recipes.includes(recipe.title)) row.recipes.push(recipe.title);
      if(item.note && !row.notes.includes(item.note)) row.notes.push(item.note);
      rows.set(key,row);
    }
  }
  const stock=new Map();
  for(const item of pantry.items){if(item.quantity!=null){const q=normalise(item.quantity,item.unit||'');const key=item.ingredient+'|'+q.unit;stock.set(key,(stock.get(key)||0)+q.quantity);}}
  const output=[...rows.values()].sort((a,b)=>Number(a.optional)-Number(b.optional));
  for(const row of output) {
    const key=row.ingredient+'|'+row.unit;
    const available=stock.get(key)||0;
    row.have=row.quantity===null?0:Math.min(available,row.max);
    stock.set(key,available-row.have);
    row.needed=row.quantity===null?null:Math.max(0,row.quantity-row.have);
    row.neededMax=row.max===null?null:Math.max(0,row.max-row.have);
    row.usuallyStocked=pantry.items.some(i=>i.ingredient===row.ingredient && i.stocked);
  }
  return {rows:output.sort((a,b)=>a.category.localeCompare(b.category)||a.name.localeCompare(b.name)),warnings:[...new Set(warnings)]};
}
