// Tiny {placeholder} interpolator — enough for this app's needs without
// pulling in a full i18n templating library.
export function tf(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => String(vars[key] ?? match));
}
