import { cookies } from "next/headers";
import { dictionaries, type Locale } from "./dictionaries";

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  return store.get("locale")?.value === "es" ? "es" : "en";
}

export async function getDictionary() {
  const locale = await getLocale();
  return { locale, t: dictionaries[locale] };
}
