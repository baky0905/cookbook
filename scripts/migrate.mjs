// One-time, conservative migration (done; see content/migration.json). Kept for provenance.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import YAML from 'yaml';

const categories={main_dishes:'Main dishes',side_dishes:'Side dishes',snacks:'Bread & snacks',sauces:'Sauces',desserts:'Desserts',breakfasts:'Breakfasts'};
const slug=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const aliases=[
 [/\b(all.purpose flour|ap flour|flour all purpose|glatkog brašna)\b/i,'plain-flour','Dry goods'],
 [/\bbread flour\b/i,'bread-flour','Dry goods'],[/\bflour\b/i,'flour','Dry goods'],
 [/\b(olive oil|evoo)\b/i,'olive-oil','Dry goods'],[/\b(sunflower oil)\b/i,'sunflower-oil','Dry goods'],
 [/\b(white|granulated|table) sugar\b|^sugar$|^šećera$/i,'sugar','Dry goods'],
 [/\b(instant|instant dry) yeast\b/i,'instant-yeast','Dry goods'],
 [/\b(active dry yeast)\b/i,'active-dry-yeast','Dry goods'],
 [/^(sea |table |kosher )?salt$/i,'salt','Herbs & spices'],
 [/\bblack pepper\b/i,'black-pepper','Herbs & spices'],
 [/\bunsalted butter\b/i,'unsalted-butter','Dairy & eggs'],
 [/^(of )?butter$|^Finlandia butter\*$/i,'butter','Dairy & eggs'],
 [/^(of )?(whole )?milk$|^mlijeka$/i,'milk','Dairy & eggs'],
 [/^(of )?sour cream$/i,'sour-cream','Dairy & eggs'],
 [/\bwhipping cream\b/i,'whipping-cream','Dairy & eggs'],
 [/\bfish stock\b/i,'fish-stock','Meat & fish'],
 [/^fresh salmon/i,'salmon','Meat & fish'],
 [/^(small )?leeks/i,'leeks','Produce'],
 [/^(small )?carrots/i,'carrots','Produce'],
 [/^(fingerling )?potatoes/i,'potatoes','Produce'],
 [/^(small |large )?onions?$/i,'onions','Produce'],
 [/^(of )?tomato paste$/i,'tomato-paste','Dry goods'],
];
function classify(name,fallback) {
  // Alternatives and compound ingredients must not be merged with a simpler ingredient.
  if(/\bor\b|\+|\//i.test(name)) return [fallback,'Other'];
  const clean=name.split(',')[0].trim();
  for(const [pattern,id,category] of aliases) if(pattern.test(clean)) return [id,category];
  return [fallback,'Other'];
}
const units={grams:'g',gram:'g',g:'g',kg:'kg',ml:'ml',mL:'ml',l:'l',litre:'l',dag:'dag',dcl:'dcl',dl:'dcl',tablespoons:'tbsp',tablespoon:'tbsp',Tbsp:'tbsp',TBSP:'tbsp',tbsp:'tbsp',teaspoons:'tsp',teaspoon:'tsp',tsp:'tsp',žlice:'tbsp',žličice:'tsp'};
const numeric=s=>s.includes('/')?s.split('/').map(Number).reduce((a,b)=>a/b):Number(s.replace(',','.'));
function ingredient(text,index,recipeId) {
  const original=text;let quantity=null,max,unit='',name=text,note;
  const match=text.match(/^(\d+(?:[.,]\d+)?(?:\/\d+)?)(?:\s*[-–]\s*(\d+(?:[.,]\d+)?))?\s*(grams|gram|kg|dag|dcl|dl|ml|mL|g|l|tablespoons?|Tbsp|TBSP|tbsp|teaspoons?|tsp|žlice|žličice)?(?![A-Za-z])\s*(.*)$/)
    // Croatian notes sometimes omit the space after the unit: "350 gmljevenih oraha".
    || text.match(/^(\d+(?:[.,]\d+)?)()\s+(g)(?=[a-zčćžšđ]{4,})(.*)$/);
  if(match && !/\?\?|\bcup\b|\bcups\b|\blb\b|\+|g\(mL\)/i.test(text)) {
    quantity=numeric(match[1]);max=match[2]?numeric(match[2]):undefined;unit=match[3]?units[match[3]]:'piece';name=match[4].replace(/^of\s+/i,'').trim();
    if(unit==='dag'){quantity*=10;if(max)max*=10;unit='g';}
    if(unit==='dcl'){quantity*=100;if(max)max*=100;unit='ml';}
    if(!name){quantity=null;unit='';name=text;}
  }
  if(/\?\?/.test(text)){name='Fresh dill';note='Quantity unresolved in the saved recipe: '+text;quantity=null;unit='';}
  // Package measures need a known size before conversion/scaling.
  if(/germu|vanilin|vanilla sugar|glass of|packs? of/i.test(name)){note='Check package/measure size. Saved: '+original;quantity=null;unit='';name=original;}
  name=name.trim();
  const [key,category]=classify(name,recipeId+'-'+slug(name));
  return {id:'i-'+(index+1),ingredient:key,name,quantity,...(max?{max}:{}),unit,...(note?{note}:{}),original,category,optional:/optional/i.test(text)};
}
const known={
  lohikeitto:['The saved dill quantity is marked “150g (??) cup”; verify it before cooking.','Yield is a range (4–6 portions); automatic scaling is disabled.'],
  foccacia:['Rosemary, garlic confit, topping oil and finishing salt appear in the method without complete ingredient quantities.','The summary says 35 minutes cooking but the method says 15–20; overnight fermentation and two rises are additional.'],
  orehnjaca:['Yeast and vanilla-sugar package sizes are unspecified.','Jam and butter for greasing appear in the method without quantities.','The filling lists egg whites but does not explain how to combine the filling.','The saved source link is also used by Cupavci and Tačkrle; verify it.'],
  pasta_carbonara:['The ingredient list says 300 ml pasta water; the steps call for 300 ml plus 100 ml plus another 100 ml. Verify the intended amount.'],
  honey_soya_marinated_chicken:['The ingredient list omits the chicken quantity.'],
  ricet:['Garlic and frying oil are used in the steps but absent from the ingredient list; the sausage cooking step is unclear.'],
  kiflice:['The saved 10-minute total excludes resting, rising and baking.','Shaping is only described by reference to the video.'],
  easy_bread:['Dusting flour is listed as 11 g but the steps use 8 g + 4 g.','No total time is provided; allow for the rise, optional refrigeration, preheating, baking and cooling.'],
  detroit_style_pan_pizza:['The original article link was a placeholder; the saved video link is retained.','Allow for 8–24 hours of refrigeration in addition to the other fermentation stages.'],
  bazlama:['The method consists of brief video notes; shaping, turning and some finishing quantities need clarification.'],
  cupavci:['Vanilla-sugar package size is unspecified; check the coconut coating against the source.','The saved source link is the same video as Orehnjaca and Tačkrle; verify the correct source.'],
  tackrle_pekmez:['The saved source link is the same video as Orehnjaca and Cupavci; verify the correct source.'],
  minced_meat_roles:['“Cheasy cream” and the oil type need clarification; “Mix it all together” was stored in the ingredient list.'],
  rice_chicken_vegetables:['Cream is measured as “1 glass”; its volume is unspecified.','The method refers to white onion as well as red onion; verify the ingredient list.'],
};
const manifest=[],writes=[];
if(!process.argv.includes('--write')) throw new Error('Use --write for the one-time migration into an empty content directory');
// Recipes have been curated by hand since the migration; never regenerate them.
if(fs.existsSync('content/migration.json')) throw new Error('Migration already done (content/migration.json exists); recipes are now edited by hand.');
for(const [dir,category] of Object.entries(categories)) {
  for(const file of fs.readdirSync('docs/'+dir).filter(f=>f.endsWith('.md')&&f!=='index.md')) {
    const originalPath=`docs/${dir}/${file}`,raw=fs.readFileSync(originalPath,'utf8');
    const id=file.slice(0,-3).replaceAll('_','-');const target=`content/recipes/${id}.md`;
    if(fs.existsSync(target)) throw new Error(`Refusing to overwrite ${target}`);
    const front=YAML.parse(raw.match(/^\s*---\n([\s\S]*?)\n---/)[1]);
    const ingredientText=raw.split('## :salt: Ingredients')[1]?.split('## :pencil: Instructions')[0]||'';
    const method=raw.split('## :pencil: Instructions')[1]?.split(/\n## /)[0]?.trim()||'';
    let groups=[],group={name:'Ingredients',items:[]},ix=0;
    for(const line of ingredientText.split('\n')) {
      if(/^\s*-\s*(?:\[[ x]?\])?\s*/.test(line)) {
        const clean=line.replace(/^\s*-\s*(?:\[[ x]?\])?\s*/,'').trim();
        if(/^[A-ZČĆŽŠĐ ]+$/.test(clean)){if(group.items.length)groups.push(group);group={name:clean[0]+clean.slice(1).toLowerCase(),items:[]};}
        else if(clean) group.items.push(ingredient(clean,ix++,id));
      } else if(line.trim() && !/^\*/.test(line)) {
        if(group.items.length)groups.push(group);
        group={name:line.replace(/^#+\s*/,'').replace(/:$/,'').trim(),items:[]};
      }
    }
    if(group.items.length)groups.push(group);
    if(!groups.length) groups=[{name:'Ingredients',items:[ingredient('Ingredients not yet recorded',0,id)]}];
    const steps=[];let title='',parts=[];
    const flush=()=>{if(parts.join('\n').trim())steps.push({id:'step-'+(steps.length+1),title,text:parts.join('\n').trim(),images:[]});parts=[];};
    const headed=/^#{3,}\s/m.test(method);
    for(const line of method.split('\n')) {
      if(/^#{3,}\s/.test(line)){flush();title=line.replace(/^#+\s*/,'').trim();if(/^step \d+$/i.test(title))title='';}
      // Methods without step headings are one instruction per line.
      else if(!headed){parts.push(line);flush();}
      else parts.push(line);
    }
    flush();
    if(!steps.length)steps.push({id:'step-1',title:'Method not recorded',text:'Check the original source before cooking.',images:[]});
    const row=raw.split('\n').find(l=>/^\|/.test(l)&&/portions/.test(l));
    const cells=row?.split('|').map(s=>s.trim())||[];
    let yieldLabel=cells[1]||'Yield not recorded';if(!/\d/.test(yieldLabel))yieldLabel='Yield not recorded';
    let total=cells[2],cook;if(!total||!/^\d/.test(total))total=undefined;
    if(total&&/\(cook time\)/.test(total)){cook=total.replace(/\s*\(cook time\)/,'');total=undefined;}
    const issues=[...(known[file.slice(0,-3)]||[])];
    if(yieldLabel==='Yield not recorded')issues.push('Yield is not recorded.');
    if(/Work in progress|^\.\.\.(\s*Missing)?$/mi.test(method))issues.push('This is an unfinished recipe; the method needs completing.');
    const sources=[];
    // Remote photos are not sources and are not fetched; the archived original keeps them.
    for(const match of raw.matchAll(/(!?)\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/g)){
      if(match[1]&&match[2]!=='type:video')continue;
      let link=match[3],timestamp;
      const video=link.match(/(?:youtube\.com\/embed\/|youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/);
      if(video){timestamp=link.match(/[?&]t=(\d+)s?/)?.[1];link='https://www.youtube.com/watch?v='+video[1];}
      const existing=sources.find(s=>s.url===link);
      if(existing){if(timestamp&&!existing.timestamp)existing.timestamp=timestamp+'s';continue;}
      sources.push({title:match[2]==='type:video'?'Saved video':match[2],url:link,...(timestamp?{timestamp:timestamp+'s'}:{})});
    }
    if(/\* grandma/i.test(raw))sources.push({title:'Family recipe · grandma'});
    const notes=raw.split('## Additional Notes')[1]?.split('## :link: Source')[0]?.replace('Any additional notes or tips related to the recipe','').trim()||'';
    const result={title:front.title.trim(),description:'',category,tags:(front.tags||[]).filter(t=>!/^tag\d+$/.test(t)),language:/[čćžšđ]/i.test(ingredientText)?'hr':'en',status:'needs-review',yield:{label:yieldLabel,scalable:false},time:{...(total?{total}:{}),...(cook?{cook}:{})},groups,steps,sources,issues,adaptations:['Migrated from the saved cookbook. Original wording and source links preserved; external sources have not been reverified.'],legacyPath:`${dir}/${file.slice(0,-3)}/`};
    const image=raw.match(/!\[[^\]]*\]\((assets\/[^)]+)\)/);
    if(image){const src=path.join('docs',dir,image[1]);if(fs.existsSync(src)){writes.push({copy:src,to:`content/media/${id}/${path.basename(src)}`});result.cover={src:`${id}/${path.basename(src)}`,alt:result.title,credit:'Image from the existing cookbook; original attribution retained in the archive.'};}}
    writes.push({target,text:'---\n'+YAML.stringify(result,{lineWidth:0})+'---\n\n'+notes+'\n',dir,file,originalPath});
    manifest.push({id,original:originalPath,legacyPath:result.legacyPath,sha256:crypto.createHash('sha256').update(raw).digest('hex'),ingredientCount:ix,stepCount:steps.length});
  }
}
for(const w of writes){
  if(w.copy){fs.mkdirSync(path.dirname(w.to),{recursive:true});fs.copyFileSync(w.copy,w.to);continue;}
  fs.writeFileSync(w.target,w.text);
  fs.mkdirSync(`public/archive/${w.dir}`,{recursive:true});fs.copyFileSync(w.originalPath,`public/archive/${w.dir}/${w.file}`);
}
fs.writeFileSync('content/migration.json',JSON.stringify(manifest,null,2)+'\n');
console.log(`Migrated ${manifest.length} recipes; originals retained unchanged.`);
