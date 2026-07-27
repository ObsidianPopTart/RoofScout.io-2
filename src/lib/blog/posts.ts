export type BlogBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "quote"; text: string };

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  publishedAt: string; // ISO date
  readingMinutes: number;
  body: BlogBlock[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "how-to-find-roofing-leads",
    title: "How to Find Roofing Leads: 7 Methods Sales Teams Actually Use",
    description:
      "A practical breakdown of how roofing companies generate leads in 2026 — from storm chasing and canvassing to satellite-based prospecting — with the real tradeoffs of each.",
    publishedAt: "2026-06-02",
    readingMinutes: 7,
    body: [
      {
        type: "p",
        text: "Every roofing company has the same problem eventually: the phone stops ringing. Referrals dry up, the storm that filled your pipeline last spring is a memory, and your reps are back to knocking on doors that turn out to have a roof from 2023. Here's how roofing sales teams actually fill that gap — not the theory, the methods crews use every week.",
      },
      { type: "h2", text: "1. Storm chasing" },
      {
        type: "p",
        text: "Tracking hail and wind damage reports and canvassing the affected area within days of a storm is still the highest-conversion method in the industry — insurance-covered replacements sell themselves. The catch is timing and competition: five other companies read the same storm report, and by week two you're knocking on doors that already have three quotes.",
      },
      { type: "h2", text: "2. Door-to-door canvassing" },
      {
        type: "p",
        text: "The oldest method, and still one of the most reliable, because it puts a real person in front of a real decision-maker. The problem is efficiency — a rep can physically knock on 40-60 doors in a day, and if you're canvassing blind, most of those roofs are fine. You're paying for gas, time, and rejection to find the handful of houses that actually need work.",
      },
      { type: "h2", text: "3. Referral and repeat business" },
      {
        type: "p",
        text: "Cheapest lead source by far, and the highest trust. The limitation is obvious: it only scales as fast as your finished-job count, and it does nothing for a company trying to grow past its existing customer base.",
      },
      { type: "h2", text: "4. Paid digital ads (Google, Facebook)" },
      {
        type: "p",
        text: "Works, but costs have climbed hard in the roofing vertical — cost-per-lead in competitive metros routinely runs $80-200, and a meaningful share of that traffic is homeowners doing research, not ready to buy. Good for building a pipeline over months, expensive as your only source.",
      },
      { type: "h2", text: "5. Lead-gen marketplaces" },
      {
        type: "p",
        text: "Sites that sell the same homeowner lead to three to five contractors simultaneously. You're now in a speed-to-call race with your competitors for a lead you paid for and don't own.",
      },
      { type: "h2", text: "6. Direct mail" },
      {
        type: "p",
        text: "Still works for brand awareness in a specific neighborhood, but response rates are low (often under 1%) and it can't tell you which houses in that neighborhood actually need a new roof.",
      },
      { type: "h2", text: "7. Satellite-based prospecting" },
      {
        type: "p",
        text: "The newer approach: scan a neighborhood using satellite imagery, measure and grade every roof's condition with AI, and hand your team a ranked list of the roofs that are actually neglected — before you ever leave the office. This is the gap RoofScout fills between \"knock on every door\" and \"wait for the phone to ring\": you still canvass, but you know which houses are worth the drive before you get there.",
      },
      {
        type: "quote",
        text: "The best lead sources aren't mutually exclusive. Storm response fills the pipeline fast; satellite scanning tells you where to focus everywhere else, every day the phone isn't ringing off a storm.",
      },
      { type: "h2", text: "Which one should you actually use?" },
      {
        type: "p",
        text: "Most profitable roofing companies run two or three of these at once — storm response when there's a storm, referrals as the steady baseline, and a scan-and-canvass method to fill the gaps in between. If your team is still driving neighborhoods block by block hoping to spot a bad roof, that's the easiest one to fix first.",
      },
    ],
  },
  {
    slug: "door-to-door-roofing-sales-canvassing-checklist",
    title: "Door-to-Door Roofing Sales: A Canvassing Checklist That Actually Works",
    description:
      "A pre-visit checklist and door-knock script for roofing sales reps — what to check before you knock, what to say in the first 10 seconds, and how to avoid wasting a trip.",
    publishedAt: "2026-06-16",
    readingMinutes: 6,
    body: [
      {
        type: "p",
        text: "Canvassing works, but most reps waste half their day knocking on houses that were never going to say yes — because the roof is fine, or because they show up with nothing to point to. Here's a checklist that fixes both problems.",
      },
      { type: "h2", text: "Before you leave the office" },
      {
        type: "ul",
        items: [
          "Pull a ranked list of the worst-condition roofs in the neighborhood you're targeting, not just an address list.",
          "Know the roof's approximate age, material, and square footage before you knock — you should never be estimating from the sidewalk.",
          "Have a specific, defensible reason to be at that door: a visible issue, not \"just checking in.\"",
          "Print or screenshot the aerial view of the roof. Homeowners rarely see their own roof from above, and it's the single most effective prop in a door-knock.",
        ],
      },
      { type: "h2", text: "The first 10 seconds at the door" },
      {
        type: "p",
        text: "Homeowners decide whether to engage before you finish your first sentence. Lead with what you saw, not who you are.",
      },
      {
        type: "quote",
        text: "\"Hi, I'm [name] with [company] — we were doing some roof inspections in the neighborhood and noticed some wear on your roof from the street. Do you have two minutes? I can show you what we saw.\"",
      },
      {
        type: "p",
        text: "That's it. No pitch, no company history, no \"how's your day going.\" You're there because you saw something specific — say what it is immediately.",
      },
      { type: "h2", text: "What to bring to the door" },
      {
        type: "ul",
        items: [
          "The aerial photo, printed or on a tablet — this is what turns skepticism into curiosity.",
          "A rough quote range, not an exact number — \"typically $12,000-$16,000 for a roof this size\" is more credible than a number you clearly pulled from nowhere.",
          "A specific, visible issue to point to: discoloration, moss, a sagging valley — something they can walk outside and verify themselves.",
        ],
      },
      { type: "h2", text: "After the knock" },
      {
        type: "p",
        text: "If they're not home or not interested, leave something with the specific finding on it, not a generic flyer. \"We noted some wear on the north-facing slope\" gets read; \"free estimates!\" gets thrown out.",
      },
      { type: "h2", text: "The real lesson" },
      {
        type: "p",
        text: "Every part of this checklist assumes you know something about the roof before you knock. That's the entire difference between canvassing that converts and canvassing that burns a day — and it's exactly the gap a pre-scan of the neighborhood closes. RoofScout builds the ranked list and the aerial photo for you before your team leaves the parking lot.",
      },
    ],
  },
  {
    slug: "how-to-spot-a-neglected-roof-from-the-street",
    title: "How to Spot a Neglected Roof From the Street (Inspection Checklist)",
    description:
      "The visible warning signs of an aging or damaged roof that roofing sales reps can spot from the sidewalk, before ever getting on a ladder — with what each one usually means.",
    publishedAt: "2026-07-01",
    readingMinutes: 6,
    body: [
      {
        type: "p",
        text: "You don't need a ladder to tell a healthy roof from a neglected one — most of the warning signs are visible from the street if you know what to look for. Here's what experienced roofing sales reps actually check.",
      },
      { type: "h2", text: "Discoloration and streaking" },
      {
        type: "p",
        text: "Dark streaks running down from the ridge are usually algae (Gloeocapsa magma), which thrives in humid climates and signals a roof that's been holding moisture for years. Uneven, patchy discoloration across the whole roof plane often means granule loss — the shingle's protective coating is wearing away.",
      },
      { type: "h2", text: "Moss and vegetation" },
      {
        type: "p",
        text: "Moss holds moisture directly against the shingle and accelerates decay underneath it. Any visible moss, especially on north-facing slopes that get less sun, is a strong signal of a roof past its effective lifespan.",
      },
      { type: "h2", text: "Sagging or uneven roof lines" },
      {
        type: "p",
        text: "A roofline should be straight. Any visible dip or wave — especially along a valley or near the ridge — usually means structural water damage to the decking underneath, not just a cosmetic shingle problem.",
      },
      { type: "h2", text: "Missing or curling shingles" },
      {
        type: "p",
        text: "Shingles that are lifting at the edges, curling upward, or visibly missing in patches mean the roof has lost its wind and water resistance in those spots — often visible as small dark gaps from a distance.",
      },
      { type: "h2", text: "Granules in the gutters" },
      {
        type: "p",
        text: "If you can see gutters clearly, a buildup of gritty, sand-like granules is asphalt shingles shedding their protective layer — a reliable sign the roof is entering its final years regardless of how it looks from a distance.",
      },
      { type: "h2", text: "Rusted or damaged flashing" },
      {
        type: "p",
        text: "The metal flashing around chimneys, vents, and roof valleys fails before the shingles usually do. Visible rust or gaps here are often the actual point of failure on an otherwise decent-looking roof.",
      },
      { type: "h2", text: "Age as a baseline" },
      {
        type: "p",
        text: "Asphalt shingle roofs typically last 20-25 years. If a neighborhood was built in a single development wave, roof age alone can be a strong predictor — a street of 22-year-old roofs is a street worth a closer look even before you spot a single visible issue.",
      },
      {
        type: "quote",
        text: "None of these signs need a ladder or a drone — they're all visible from a car window if you know what you're looking at. The hard part isn't spotting one roof; it's covering an entire neighborhood without driving every block yourself.",
      },
      { type: "h2", text: "Doing this at neighborhood scale" },
      {
        type: "p",
        text: "A trained eye can spot these signs from the street one house at a time. RoofScout does the same visual read — algae staining, moss, missing shingles, sagging lines — from satellite imagery, across an entire neighborhood in one pass, and ranks the results so your team knows exactly which doors are worth knocking on first.",
      },
    ],
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
