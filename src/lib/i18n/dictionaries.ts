export const dictionaries = {
  en: {
    nav: { pricing: "Pricing", login: "Log in", signup: "Sign up" },
    home: {
      headline: "Find the neglected roofs before your competitors do.",
      sub: "RoofScout scans a neighborhood, measures every roof with satellite data, grades condition with AI, and hands your sales team a ranked, priced lead list — automatically.",
      startFree: "Start free",
      login: "Log in",
      featureHeadline: "See condition before you knock",
      featureBody:
        "Every scan grades rooftop condition from real satellite imagery — so your team only visits roofs that are actually worth the drive.",
    },
    pricing: {
      title: "Simple, scan-based pricing",
      sub: "Try RoofScout free, then pay for the scan volume your team actually needs.",
      free: {
        name: "Free",
        detail: "3 scans, once — no card required",
        cta: "Start free",
        features: ["Live satellite scanning", "AI condition grading", "CSV export"],
      },
      pro: {
        name: "Pro",
        detail: "50 scans a month",
        cta: "Start free, upgrade anytime",
        features: ["Everything in Free", "50 scans/month", "Route leads to your marketing team"],
      },
      apex: {
        name: "Apex",
        detail: "Unlimited scans",
        cta: "Start free, upgrade anytime",
        features: ["Everything in Pro", "Unlimited scans", "Priority support"],
      },
      footnote:
        "Every plan includes live satellite scanning, AI condition grading, and CSV export. Upgrade or cancel anytime from your billing page.",
    },
    login: { title: "Log in", welcome: "Welcome back to RoofScout.", noAccount: "No account?", signup: "Sign up" },
    signup: {
      title: "Start free",
      sub: "Set up your company's RoofScout account.",
      companyName: "Company name",
      email: "Email",
      password: "Password",
      cta: "Create account",
      haveAccount: "Already have an account?",
      login: "Log in",
    },
    appNav: { dashboard: "Dashboard", newScan: "New Scan", leads: "Leads", billing: "Billing", signOut: "Sign out" },
  },
  es: {
    nav: { pricing: "Precios", login: "Iniciar sesión", signup: "Regístrate" },
    home: {
      headline: "Encuentra los techos descuidados antes que tu competencia.",
      sub: "RoofScout escanea un vecindario, mide cada techo con datos satelitales, califica su estado con IA y le entrega a tu equipo de ventas una lista de clientes potenciales, ordenada y con precio — automáticamente.",
      startFree: "Empieza gratis",
      login: "Iniciar sesión",
      featureHeadline: "Ve el estado antes de tocar la puerta",
      featureBody:
        "Cada escaneo califica el estado del techo a partir de imágenes satelitales reales, para que tu equipo solo visite techos que realmente valgan la pena.",
    },
    pricing: {
      title: "Precios simples, basados en escaneos",
      sub: "Prueba RoofScout gratis y luego paga según el volumen de escaneos que tu equipo realmente necesite.",
      free: {
        name: "Gratis",
        detail: "3 escaneos, una vez — sin tarjeta",
        cta: "Empieza gratis",
        features: ["Escaneo satelital en vivo", "Calificación de estado con IA", "Exportación a CSV"],
      },
      pro: {
        name: "Pro",
        detail: "50 escaneos al mes",
        cta: "Empieza gratis, mejora cuando quieras",
        features: ["Todo lo de Gratis", "50 escaneos al mes", "Envía leads a tu equipo de marketing"],
      },
      apex: {
        name: "Apex",
        detail: "Escaneos ilimitados",
        cta: "Empieza gratis, mejora cuando quieras",
        features: ["Todo lo de Pro", "Escaneos ilimitados", "Soporte prioritario"],
      },
      footnote:
        "Todos los planes incluyen escaneo satelital en vivo, calificación de estado con IA y exportación a CSV. Mejora o cancela cuando quieras desde tu página de facturación.",
    },
    login: { title: "Iniciar sesión", welcome: "Bienvenido de nuevo a RoofScout.", noAccount: "¿No tienes cuenta?", signup: "Regístrate" },
    signup: {
      title: "Empieza gratis",
      sub: "Configura la cuenta de RoofScout de tu empresa.",
      companyName: "Nombre de la empresa",
      email: "Correo electrónico",
      password: "Contraseña",
      cta: "Crear cuenta",
      haveAccount: "¿Ya tienes una cuenta?",
      login: "Iniciar sesión",
    },
    appNav: { dashboard: "Panel", newScan: "Nuevo escaneo", leads: "Clientes potenciales", billing: "Facturación", signOut: "Cerrar sesión" },
  },
} as const;

export type Locale = keyof typeof dictionaries;
export type Dictionary = (typeof dictionaries)["en"];
