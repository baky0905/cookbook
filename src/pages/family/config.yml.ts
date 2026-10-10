import YAML from 'yaml';
import { GET as fullConfig } from '../admin/config.yml';

export async function GET() {
  const config = YAML.parse(await fullConfig().text());
  const plans = config.collections.find((c: any) => c.name === 'plans');
  const hide = (field: any) => ({ ...field, widget: 'hidden', required: false });
  plans.summary = '{{start}} · {{title}}';
  plans.create = false;
  plans.delete = false;
  plans.label = 'Meals & shopping extras';
  plans.description = 'Choose a prepared week, edit meals or add shopping extras, then save. The cookbook updates in about two minutes. Ask the owner if your week is missing.';
  plans.fields = plans.fields.map((field: any) => {
    if (['id', 'title', 'start', 'example'].includes(field.name)) return hide(field);
    if (field.name === 'meals') return { ...field, collapsed: false, fields: field.fields.map((f: any) =>
      ['id', 'leftoversFrom'].includes(f.name) ? hide(f) : f) };
    if (field.name === 'extras') return { ...field, collapsed: false, fields: [...field.fields].sort((a: any, b: any) =>
      (a.name === 'name' ? -1 : 0) - (b.name === 'name' ? -1 : 0)).map((f: any) => f.name === 'name'
        ? { ...f, label: 'Item', hint: 'e.g. milk, bin bags or lunch snacks. Or select a catalogue ingredient below.' } : f) };
    return field;
  });
  config.collections = [plans];
  return new Response(YAML.stringify(config), { headers: { 'Content-Type': 'text/yaml; charset=utf-8' } });
}
