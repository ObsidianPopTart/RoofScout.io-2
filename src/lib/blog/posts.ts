export type BlogBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "quote"; text: string }
  // A standalone internal/external link line — used for real cross-links
  // between posts (and to /pricing, /signup) rather than just naming a page
  // in plain text, since inline links inside "p" blocks aren't supported.
  | { type: "link"; text: string; href: string };

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  publishedAt: string; // ISO date
  readingMinutes: number;
  body: BlogBlock[];
  // Only set on posts that are genuinely sequential step-by-step guides —
  // powers an additional HowTo JSON-LD block (Google rich-result eligible)
  // on top of the standard Article schema. Not forced onto every post.
  howToSteps?: { name: string; text: string }[];
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
    howToSteps: [
      {
        name: "Pull a ranked list of the worst-condition roofs",
        text: "Target the neighborhood with a ranked list of the worst-condition roofs, not just an address list, so every knock is worth the drive.",
      },
      {
        name: "Know the roof before you knock",
        text: "Confirm the roof's approximate age, material, and square footage before you arrive — never estimate from the sidewalk.",
      },
      {
        name: "Bring the aerial photo",
        text: "Print or screenshot the aerial view of the roof. Homeowners rarely see their own roof from above, and it's the most effective prop in a door-knock.",
      },
      {
        name: "Lead with what you saw, not who you are",
        text: "Open with the specific issue visible from the street, not a company introduction — a concrete observation earns the next thirty seconds.",
      },
      {
        name: "Bring a rough quote range and a specific issue to point to",
        text: "Have a credible price range ready and a visible defect the homeowner can walk outside and verify themselves.",
      },
      {
        name: "Leave a specific note, not a generic flyer",
        text: "If no one answers, leave something naming the specific finding — a generic \"free estimates\" flyer gets thrown out.",
      },
    ],
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
  {
    slug: "metal-roofing-trends-2026",
    title: "Metal Roofing in 2026: What Roofing Companies Need to Know Before the Next Estimate",
    description:
      "Metal roofing search interest is climbing fast, with metal roofing suppliers and metal roofing contractor searches both up double digits. Here's what's driving demand and how to price and pitch it.",
    publishedAt: "2026-07-08",
    readingMinutes: 6,
    body: [
      {
        type: "p",
        text: "\"Metal roofing\" and \"roofing metal\" are two of the highest-volume searches in the entire roofing category right now — both hold their own next to generic terms like \"roofing company.\" And the growth isn't flat: searches for metal roofing suppliers are up 50%, metal roofing contractor is up double digits, and metal shingle roofing is climbing too. Homeowners are actively comparing this material before they ever pick up the phone.",
      },
      { type: "h2", text: "Why homeowners are searching for metal roofing right now" },
      {
        type: "p",
        text: "A few forces are pushing metal roofing into more conversations: insurers in storm-heavy regions increasingly offer premium discounts for impact-resistant metal roofs, manufacturers have pushed standing-seam and metal-shingle products that read as upscale rather than \"barn roof,\" and a 40-50 year lifespan is a genuinely different pitch than a 20-year asphalt reroof. Energy-conscious homeowners are also searching reflective/cool-roof metal options specifically to cut cooling costs.",
      },
      { type: "h2", text: "What \"metal roofing\" actually covers" },
      {
        type: "p",
        text: "When a homeowner searches \"metal roofing panels\" or \"metal roofing systems,\" they're usually bucketing several different products together without realizing it. It's worth knowing the difference before you're standing at the door:",
      },
      {
        type: "ul",
        items: [
          "Standing seam — vertical panels with concealed fasteners, the premium/modern look, best weathertightness, highest cost.",
          "Metal shingles/shakes — stamped to mimic asphalt shingles, slate, or wood shake; the choice for homeowners who want the metal lifespan without the \"metal roof\" look.",
          "Corrugated or exposed-fastener panels — lowest cost, most common on outbuildings and some rural residential, but exposed fasteners mean more long-term maintenance.",
        ],
      },
      { type: "h2", text: "Pricing and pitching the upgrade" },
      {
        type: "p",
        text: "Metal costs roughly 2-3x an asphalt reroof upfront, so the pitch has to be about total cost of ownership, not the estimate line item. Frame it against two asphalt replacements over the metal roof's lifespan, mention the insurance discount where it applies, and lead with the specific product tier (standing seam vs. shingle-style) so the homeowner isn't picturing the wrong roof.",
      },
      {
        type: "quote",
        text: "Most homeowners comparing \"metal roofing\" online have already ruled out one of the three product types without knowing it — the fastest way to lose the estimate is pitching the wrong one.",
      },
      { type: "h2", text: "Finding the roofs worth this pitch before your competitors do" },
      {
        type: "p",
        text: "Metal is the strongest upsell on a roof that's already failing, not a roof that's merely aging — the cost premium is easiest to justify next to an active tear-off decision. RoofScout's AI grading flags exactly those roofs (Critical and Poor scores) across a whole neighborhood in one scan, so a metal-roofing conversation can be the first thing your rep leads with at the door, not a pivot they try mid-pitch.",
      },
      {
        type: "link",
        text: "→ How to spot a neglected roof from the street",
        href: "/blog/how-to-spot-a-neglected-roof-from-the-street",
      },
    ],
  },
  {
    slug: "tpo-vs-epdm-commercial-roofing-contractor-guide",
    title: "TPO vs. EPDM: A Commercial Roofing Contractor's Guide to Winning More Flat-Roof Jobs",
    description:
      "TPO roofing and EPDM roofing searches are both rising alongside commercial roofing contractor demand. Here's how to explain the difference, price each system, and win more bids.",
    publishedAt: "2026-07-15",
    readingMinutes: 6,
    body: [
      {
        type: "p",
        text: "\"Commercial roofing\" is one of the steadiest high-volume searches in the category, and two specific membrane types are showing up inside that traffic more than they used to: TPO and EPDM, both trending upward alongside \"commercial roofing contractor\" and \"commercial roofing services.\" Property managers and business owners are researching the material before they call a contractor, which means whoever explains it best in the first five minutes usually wins the bid.",
      },
      { type: "h2", text: "TPO roofing, in plain terms" },
      {
        type: "p",
        text: "TPO (thermoplastic polyolefin) is a single-ply white membrane, heat-welded at the seams, popular for its reflectivity (lower cooling costs on large flat roofs) and mid-range cost. It's become the default recommendation on a lot of commercial reroofs over the last decade — which also means TPO installer quality varies more than the material itself, since so many crews have added it to their offering quickly.",
      },
      { type: "h2", text: "EPDM roofing, in plain terms" },
      {
        type: "p",
        text: "EPDM (a synthetic rubber membrane) is the older, proven technology — typically black, glued or ballasted rather than heat-welded, and often cheaper upfront with a long track record. It absorbs heat rather than reflecting it, which matters in hot climates, but its seams (glued, not welded) are usually the first thing to fail and the easiest thing to point to on an aging roof inspection.",
      },
      { type: "h2", text: "Helping a customer choose between them" },
      {
        type: "ul",
        items: [
          "Climate and cooling costs: TPO's reflectivity matters more in hot climates with large flat roofs; EPDM's heat absorption can help in cold climates.",
          "Budget: EPDM is typically the lower upfront cost; TPO commands a premium partly for the welded-seam durability.",
          "Roof traffic and equipment: ballasted EPDM tolerates rooftop foot traffic and equipment differently than a fully-adhered TPO system — worth confirming before quoting.",
          "Repairability: welded TPO seams are generally easier to diagnose and patch than aging glued EPDM seams.",
        ],
      },
      { type: "h2", text: "Winning more commercial roofing repair and service bids" },
      {
        type: "p",
        text: "\"Commercial roofing repair\" and \"commercial roofing services near me\" searches spike when there's an active leak, not when someone's casually researching — response speed is the deciding factor more often than price at that moment. A property manager searching at 9pm after water hits the ceiling tile is calling whoever answers first and sounds like they know the difference between TPO and EPDM without being asked.",
      },
      {
        type: "p",
        text: "RoofScout today is built around residential lead generation — its AI condition grading and scan pipeline are tuned for single-family roof footprints, not commercial buildings. But the underlying idea holds on the commercial side too: knowing which properties have an aging or failing membrane before the emergency call comes in is worth more than being first in a Google search for \"commercial roofing contractor.\"",
      },
    ],
  },
  {
    slug: "residential-roofing-companies-win-more-local-jobs",
    title: "How Residential Roofing Companies Can Win More Local Jobs in 2026",
    description:
      "Searches for \"residential roofing companies near me\" are up 40% this month. Here's how to make sure your business is the one homeowners find and call first.",
    publishedAt: "2026-07-22",
    readingMinutes: 6,
    body: [
      {
        type: "p",
        text: "\"Residential roofing companies near me\" search interest jumped roughly 40% over the past month, with \"residential roofing services,\" \"residential roofing contractor,\" and \"residential roofing company\" all climbing alongside it. That's real, current homeowner demand for a local provider — not idle browsing. The question for most residential roofing companies isn't whether that demand exists, it's whether they're the one it finds.",
      },
      { type: "h2", text: "Why \"near me\" searches convert better than generic ones" },
      {
        type: "p",
        text: "Someone searching \"residential roofing\" in the abstract might be months from a decision. Someone searching \"residential roofing companies near me\" has usually already decided they need a quote and is choosing who to call — the conversion window is measured in days, not months. Showing up in that specific search matters more than ranking for the broader term ever will.",
      },
      { type: "h2", text: "Making sure homeowners actually find you" },
      {
        type: "ul",
        items: [
          "Claim and fully complete your Google Business Profile — service area, hours, photos of finished jobs, and licensing info all factor into local ranking, not just reviews.",
          "Ask for reviews immediately after job completion, while the homeowner is happiest — review velocity matters as much as review count for local search.",
          "Build a real service-area page for each city/county you cover, not just a single generic \"service areas\" list — search engines reward specificity here.",
          "Keep your business name, address, and phone number identical across every directory listing (Yelp, Angi, Nextdoor, your own site) — inconsistency quietly hurts local rankings.",
        ],
      },
      { type: "h2", text: "Beyond search — reaching the homeowners who haven't searched yet" },
      {
        type: "p",
        text: "Local SEO wins you the homeowner who's already decided to search. It does nothing for the homeowner two streets over with a roof in exactly the same condition who hasn't thought to Google anything yet. That's the gap RoofScout is built for: scanning a neighborhood by satellite, grading every roof's condition, and handing your team a ranked list of the houses worth knocking on — before the owner ever types \"residential roofing companies near me.\"",
      },
      {
        type: "quote",
        text: "Inbound search brings you the homeowners who already know they need a roof. Everything else on the street is still yours to find first.",
      },
    ],
  },
  {
    slug: "roofing-supply-guide-what-contractors-should-stock",
    title: "Roofing Supply Guide: What Contractors Should Stock for Faster Turnarounds",
    description:
      "Roofing supply searches are climbing. Here's what materials to keep on hand, how sourcing options compare, and how to avoid the stock-out that costs you a job.",
    publishedAt: "2026-07-27",
    readingMinutes: 5,
    body: [
      {
        type: "p",
        text: "\"Roofing supply\" search interest is up, and it's not just homeowners — contractors comparing sourcing options make up a real share of that traffic too, alongside rising interest in specific materials like roofing felt and roofing tar. A job delayed by a material stock-out doesn't just cost you a day; on a competitive estimate, it can cost you the job entirely if a homeowner starts second-guessing why the crew that showed up isn't the crew doing the work.",
      },
      { type: "h2", text: "The core materials every job needs on hand" },
      {
        type: "ul",
        items: [
          "Shingles in your top 2-3 most-quoted colors — the ones you can't afford to special-order mid-job.",
          "Underlayment/roofing felt — synthetic has largely replaced traditional felt for new installs, but keep both on hand if you service older homes expecting a felt spec.",
          "Roofing nails — coil and hand-drive, corrosion-resistant, sized for your typical shingle stack.",
          "Flashing (step, valley, drip edge) — the detail work that gets missed when it's not already in the truck.",
          "Roofing tar/sealant — for flashing details, penetrations, and the small repairs that build trust before a homeowner commits to a full reroof.",
        ],
      },
      { type: "h2", text: "Where contractors actually source materials" },
      {
        type: "p",
        text: "Most crews split sourcing between national distributors — ABC Supply and Beacon Roofing Supply are the two homeowners and contractors search for most — and a local lumberyard or supply house for smaller or rush orders. National distributors generally win on price and product breadth for planned jobs; a local yard usually wins on same-day availability when a job runs short mid-install.",
      },
      { type: "h2", text: "Avoiding the stock-out that costs you the job" },
      {
        type: "p",
        text: "The riskiest moment isn't the big planned reroof — it's the smaller repair or insurance job where an accurate material estimate up front would have caught a shortfall before the crew was already on the roof. This is exactly where a scan-based quote helps: RoofScout's quote calculator pre-fills footprint, pitch, and complexity straight from the scan data for a given roof, so the material estimate at the door is grounded in real measurements before your crew ever climbs a ladder.",
      },
      {
        type: "link",
        text: "→ See RoofScout plans and pricing",
        href: "/pricing",
      },
    ],
  },
  {
    slug: "what-makes-the-best-roofing-company-2026",
    title: "What Makes the Best Roofing Company? What Homeowners Are Actually Comparing in 2026",
    description:
      "\"Best roofing company\" and \"roofing company near me\" are among the highest-volume roofing searches. Here's what actually earns that trust, and how to prove it before the estimate.",
    publishedAt: "2026-07-29",
    readingMinutes: 6,
    body: [
      {
        type: "p",
        text: "\"Roofing company\" is the single highest-volume search in the entire category, and \"best roofing company,\" \"best roofing companies,\" and \"roofing company near me\" all sit right behind it. That's a lot of homeowners trying to answer the same question: out of every company that shows up, which one is actually the best choice for my roof? Ranking for the phrase is one thing — deserving the answer is another, and it's the second one that actually wins jobs.",
      },
      { type: "h2", text: "What \"best\" actually means to a homeowner" },
      {
        type: "ul",
        items: [
          "Verifiable licensing and insurance — stated plainly, not buried in fine print.",
          "Recent, specific reviews — \"did good work\" convinces no one; \"replaced our roof in two days after the March hailstorm, cleaned up completely\" does.",
          "A clear warranty explained in plain language, not just a manufacturer logo on the site.",
          "Fast, straightforward response to the first inquiry — slow follow-up is one of the most common reasons homeowners cross a company off their shortlist.",
        ],
      },
      { type: "h2", text: "The \"affordable roofing\" trap" },
      {
        type: "p",
        text: "\"Affordable roofing\" is a real, meaningful search — but leading with price alone tends to read as cheap rather than fair, which undercuts trust rather than building it. The companies that win the \"affordable\" search and the job are the ones that pair a clear price with clear reasoning: what's included, why the quote is what it is, and what a lower competing bid is probably leaving out.",
      },
      { type: "h2", text: "Proving it before the estimate, not during it" },
      {
        type: "p",
        text: "Every one of these trust signals is easier to demonstrate than to claim. Showing up at the door with an aerial photo of the homeowner's actual roof and a specific, evidence-based description of its condition does more to establish credibility in the first thirty seconds than any amount of \"we're the best\" messaging. It's also precisely what RoofScout hands your team automatically: a real aerial image and an AI-graded condition read for every roof on the list, before anyone knocks.",
      },
      {
        type: "link",
        text: "→ Read the full door-to-door canvassing checklist",
        href: "/blog/door-to-door-roofing-sales-canvassing-checklist",
      },
    ],
  },
  {
    slug: "roofscout-vs-roofr-vs-eagleview",
    title: "RoofScout vs. Roofr vs. EagleView: Which One Actually Fits Your Team?",
    description:
      "An honest comparison of RoofScout, Roofr, and EagleView for roofing companies — what each one actually does, real pricing, and which combination makes sense depending on where your bottleneck is.",
    publishedAt: "2026-08-01",
    readingMinutes: 7,
    body: [
      {
        type: "p",
        text: "These three tools get compared a lot, but they're not really solving the same problem — and the honest answer for most roofing companies isn't \"pick one,\" it's \"know which gap each one fills.\" Here's what each actually does, what it costs, and where the overlap and the differences really are.",
      },
      { type: "h2", text: "RoofScout: finding which roofs to target" },
      {
        type: "p",
        text: "RoofScout scans a whole neighborhood at once — satellite imagery, Google Solar measurement data, and AI vision grading of every rooftop's condition — and hands back a ranked, priced list of the roofs actually worth a knock. It's built for the step before a lead exists: deciding where to point your team in the first place, across an entire area rather than one address at a time.",
      },
      {
        type: "ul",
        items: [
          "Free: 3 scans total, no card required",
          "Pro: $49/mo, 50 scans/month",
          "Apex: $149/mo, unlimited scans + Storm Tracker (targets scans to active severe weather)",
        ],
      },
      { type: "h2", text: "Roofr: running the deal once you have an address" },
      {
        type: "p",
        text: "Roofr is a full back-office platform built around a specific address you already have: instant estimates, $13 measurement reports delivered in about 2 hours, proposals, material ordering, invoicing, payments, and scheduling — the CRM and paperwork layer of actually closing and running a job. It offers one free measurement report to try it, then per-seat monthly plans.",
      },
      { type: "h2", text: "EagleView: the insurance-grade measurement standard" },
      {
        type: "p",
        text: "EagleView remains the industry default for insurance restoration work and complex commercial measurement — reports range roughly $13 for a basic aerial measurement up to $87+ for premium reports with full diagrams. It's not a lead-gen or prospecting tool; it's the measurement report insurance adjusters and complex jobs are used to seeing.",
      },
      { type: "h2", text: "The honest comparison" },
      {
        type: "p",
        text: "RoofScout and Roofr genuinely don't compete for the same job — RoofScout tells you where to go, Roofr helps you run the deal once you're there. A lot of roofing companies end up using both: RoofScout to build the target list, Roofr (or EagleView, for insurance work) to measure and quote the specific address once a homeowner says yes. Where RoofScout is different from both is the condition read itself — instead of a generic \"damage detected\" flag, RoofScout's AI actually writes a specific assessment (staining, moss, missing shingles, sagging lines) for each rooftop, the same signals an inspector looks for from the street.",
      },
      {
        type: "quote",
        text: "If your bottleneck is \"we don't know which houses in this neighborhood need a roof,\" that's RoofScout. If your bottleneck is \"we have the address, now what,\" that's Roofr or EagleView.",
      },
      { type: "h2", text: "Which one should you start with?" },
      {
        type: "ul",
        items: [
          "Mostly canvassing blind, unsure which streets are worth driving: start with RoofScout.",
          "Already have a steady lead flow but a slow, paperwork-heavy close: start with Roofr.",
          "Doing insurance restoration or complex commercial work: EagleView's report format is what adjusters expect.",
        ],
      },
      {
        type: "link",
        text: "→ See RoofScout plans and pricing",
        href: "/pricing",
      },
    ],
  },
  {
    slug: "roofing-leads-dallas-fort-worth",
    title: "Dallas-Fort Worth Roofing Leads: Working the Country's Biggest Storm Market",
    description:
      "Dallas-Fort Worth is the largest storm restoration market in North America — roughly $5B in local roofing revenue and thousands of contractors competing for the same roofs every hail season. Here's how to find the right ones first.",
    publishedAt: "2026-08-02",
    readingMinutes: 6,
    body: [
      {
        type: "p",
        text: "Dallas-Fort Worth isn't just a big roofing market — a 2021 industry analysis put it as the largest storm restoration ecosystem in North America, with the local roofing industry valued at roughly $5 billion, close to 4,000 contracting entities, and over 13,500 people employed across the metroplex. The metroplex's own suburbs regularly place among the highest hail-claim cities in the country: NICB's national hail-claims data ranked Plano the No. 5 U.S. city for hail claims in its 2016-2018 report (42,659 claims), and McKinney and Dallas both placed in the top 5 nationally in the following 2017-2019 report (34,134 and 25,262 claims respectively).",
      },
      { type: "h2", text: "Why DFW floods with roofing companies every spring" },
      {
        type: "p",
        text: "Texas leads the nation in hail activity outright — 23-28% of all national hail damage claims across NICB's two most recent three-year reporting windows, and 902 major hail events logged across the state in 2025 alone, the most of any state that year. Tarrant County itself has logged 126 severe hail days since 2000. That's not a one-storm market; DFW gets hit repeatedly through the March-to-June window, which is exactly why the metroplex supports thousands of competing contractors instead of a handful.",
      },
      { type: "h2", text: "Two very different companies are chasing the same roofs" },
      {
        type: "p",
        text: "DFW's contractor base splits into two operational profiles that show up after every major hailstorm. Established local restoration roofers run permanent offices, chase insurance-supplement value, and lean on CRM platforms built for job costing and supplier ordering. Mobile storm-chase crews do the opposite — they deploy into a hit neighborhood within a day or two of an event like the April 28, 2021 Tarrant County hailstorm (a record-breaking 6.4-inch hailstone, roughly $500 million in insured damage, and 32,000 claims filed statewide, most of them in Tarrant County), canvass hard for a week or two, then move to the next city. Both are staring at the same street trying to answer the same question: which of these roofs actually needs work?",
      },
      {
        type: "quote",
        text: "A CRM tells you what to do with a lead you already have. Neither a CRM nor a canvassing route planner tells you which house on the block is actually worth knocking on — that's the gap before the gap.",
      },
      { type: "h2", text: "Where RoofScout fits — and why it beats a generic CRM or canvassing app" },
      {
        type: "p",
        text: "Traditional restoration CRMs and door-to-door routing tools organize leads you already have; they don't tell you which roof is damaged before you knock. RoofScout scans an entire DFW suburb in one pass — real satellite imagery, Google Solar measurement data, and an AI vision read of each rooftop that writes an actual condition assessment (staining, moss, missing shingles, sagging lines) instead of a generic \"damage detected\" flag. Whether you're running a permanent DFW office or a storm crew that just landed, you know which streets are worth the drive before you leave the parking lot.",
      },
      { type: "h2", text: "Priced for how storm crews actually staff up" },
      {
        type: "p",
        text: "Storm season means temporary canvassers — a crew doubling its door-knocking headcount for six weeks around a major DFW hailstorm. RoofScout is priced by scan volume, not by seat, so adding canvassers for a surge doesn't multiply your software bill the way a per-user CRM plan does.",
      },
      { type: "h2", text: "Storm Tracker: pointed at the next DFW hailstorm" },
      {
        type: "p",
        text: "RoofScout's Apex plan includes Storm Tracker — a live severe-weather overlay on the scan map, so the moment a hail warning is issued for Tarrant or Collin County, you can point a scan at the hit area the same day instead of finding out secondhand once competitors have already worked half the neighborhood.",
      },
      {
        type: "link",
        text: "→ See RoofScout plans and pricing",
        href: "/pricing",
      },
    ],
  },
  {
    slug: "roofing-leads-san-antonio",
    title: "San Antonio Roofing Leads: Working South Texas's Hail Corridor",
    description:
      "San Antonio sits in one of South Texas's most consistent hail corridors — recent claims data puts the metro over 75,000 hail claims in a three-year window. Here's how to find the roofs worth a knock before the rest of the market does.",
    publishedAt: "2026-08-02",
    readingMinutes: 6,
    body: [
      {
        type: "p",
        text: "San Antonio doesn't get the same national attention as Dallas-Fort Worth, but it's a serious storm restoration market in its own right — NICB's national hail-claims report for 2016-2018 ranked San Antonio the single highest-claim-volume city in the entire country, with 75,187 hail claims in that three-year window, concentrated in a dense urban residential footprint that sits squarely inside South Texas's hail corridor.",
      },
      { type: "h2", text: "A concentrated market, not a sprawling one" },
      {
        type: "p",
        text: "Where DFW's claim volume spreads across a dozen distinct suburbs, San Antonio's hail exposure is more geographically concentrated — which cuts both ways. It means less territory to cover per storm event, but it also means more contractors converging on the same neighborhoods when a hailstorm hits, since Texas as a whole logged 902 major hail events in 2025 alone, the most of any state that year.",
      },
      { type: "h2", text: "Established firms and independent shops, competing for the same block" },
      {
        type: "p",
        text: "San Antonio's contractor base is a mix of established regional restoration firms and a high volume of smaller independent insurance-restoration shops — both fighting for the same claim dollars in a tighter geographic radius than DFW's sprawl allows. Speed and accuracy matter more here precisely because there's less ground to spread out over.",
      },
      { type: "h2", text: "Why a ranked list beats a canvassing map alone" },
      {
        type: "p",
        text: "Most sales tools built for this market — canvassing route planners, instant measurement apps — assume you already know which houses to target. RoofScout answers the question underneath that: it scans a San Antonio neighborhood by satellite, grades every rooftop's condition with AI (a written read of staining, moss, missing shingles, and sagging lines, not a generic damage flag), and hands back a ranked, priced list before your team ever knocks on a door.",
      },
      {
        type: "quote",
        text: "In a concentrated market, the company that covers the neighborhood accurately in one pass has an edge over the company still driving block by block.",
      },
      { type: "h2", text: "No per-seat penalty for a busy storm week" },
      {
        type: "p",
        text: "Independent shops and small regional firms are exactly who per-seat CRM pricing hurts most during a surge — adding a couple of temporary canvassers for two weeks shouldn't mean a permanent jump in your monthly software bill. RoofScout is priced by scan volume, not seats, so it scales with the storm, not against it.",
      },
      {
        type: "link",
        text: "→ See how RoofScout compares to Roofr and EagleView",
        href: "/blog/roofscout-vs-roofr-vs-eagleview",
      },
    ],
  },
  {
    slug: "roofing-leads-denver",
    title: "Denver Roofing Leads: Why Front Range Roofs Fail Faster",
    description:
      "Denver's freeze-thaw cycles and intense UV exposure age roofs faster than most U.S. markets — NICB data shows nearly 52,000 hail claims in a three-year window, and the May 2017 hailstorm remains the costliest catastrophe in Colorado history at $2.3 billion in insured losses.",
    publishedAt: "2026-08-02",
    readingMinutes: 6,
    body: [
      {
        type: "p",
        text: "Denver anchors what the industry calls \"Hail Alley,\" and the numbers back up the nickname — NICB's 2017-2019 hail-claims report placed Denver as the No. 2 U.S. city for hail claims, with 51,887 in that three-year window, and the May 8, 2017 storm alone caused $2.3 billion in insured losses — the costliest catastrophe in Colorado's history, and the third-costliest hailstorm in U.S. history.",
      },
      { type: "h2", text: "It's not just hail — it's the freeze-thaw cycle" },
      {
        type: "p",
        text: "What makes Denver distinct from a lot of high-hail markets is the combination: frequent severe hail alongside sharp freeze-thaw cycles and intense high-altitude UV radiation. Roofs in this climate deteriorate faster than the national average, which means homeowners turn to insurance restoration more frequently — and it means a roof that looked fine last season can be genuinely failing this one.",
      },
      { type: "h2", text: "High property values, strict codes, careful buyers" },
      {
        type: "p",
        text: "Denver's contractor landscape leans toward a dense network of mid-sized regional restoration firms working in a market with higher-than-average property values and rigid municipal building codes. Homeowners here tend to vet contractors more carefully before signing — which raises the bar for showing up with real evidence, not just a pitch.",
      },
      {
        type: "quote",
        text: "Bringing an aerial photo and a specific, AI-graded condition read to the door does more to establish credibility in the first thirty seconds than any amount of company-history small talk.",
      },
      { type: "h2", text: "Where RoofScout fits into a market that deteriorates fast" },
      {
        type: "p",
        text: "Because Front Range roofs age faster than a visual drive-by might suggest, a condition-focused scan is more valuable in Denver than in a market where roofs simply sit until the next big hailstorm. RoofScout's AI actually examines each rooftop's satellite image and writes a specific assessment — not a generic score — so a rep can walk up with real evidence of deterioration a homeowner might not have noticed yet themselves.",
      },
      { type: "h2", text: "Storm Tracker for the next Front Range hit" },
      {
        type: "p",
        text: "RoofScout's Apex plan includes Storm Tracker, a live severe-weather overlay that lets you point a scan directly at whichever part of the Front Range corridor just took a hail hit — instead of waiting for word to travel and finding the neighborhood already worked over.",
      },
      {
        type: "link",
        text: "→ See RoofScout plans and pricing",
        href: "/pricing",
      },
    ],
  },
  {
    slug: "roofing-leads-colorado-springs",
    title: "Colorado Springs Roofing Leads: Beating the Storm Chasers to the Job",
    description:
      "Colorado Springs sees some of the highest hail frequency in the country, with recent claims data ranging from roughly 38,000 to nearly 68,000 claims in a three-year window across its military and suburban housing stock.",
    publishedAt: "2026-08-02",
    readingMinutes: 6,
    body: [
      {
        type: "p",
        text: "Colorado Springs sits inside the same Front Range corridor as Denver, and it carries its own serious hail exposure — NICB ranked it the No. 2 U.S. city for hail claims in its 2016-2018 report (67,920 claims) and No. 3 in the following 2017-2019 report (38,044 claims), placing it in the national top 3 in back-to-back reporting periods, with high hail frequency hitting a housing stock that mixes military-family neighborhoods with dense suburban development.",
      },
      { type: "h2", text: "A market local operators and traveling crews both know well" },
      {
        type: "p",
        text: "Colorado Springs' contractor base is a blend of local operators and regional Front Range companies that also work Denver — meaning a lot of the same crews cover both metros depending on where the storm hits hardest that season. That overlap raises the bar: whoever gets an accurate read on a neighborhood first has a real head start over a competitor still deciding which suburb to prioritize.",
      },
      { type: "h2", text: "Rapid door-to-door routing only works if you're routing to the right doors" },
      {
        type: "p",
        text: "Sales tools built for this market emphasize fast door-to-door routing and claim-supplement tracking — useful once you know where to send a rep. RoofScout answers the question that comes before that: scanning a Colorado Springs neighborhood by satellite, grading every roof's condition with AI, and handing back a ranked, priced list so your routing tool has somewhere accurate to point.",
      },
      {
        type: "quote",
        text: "The fastest canvassing app in the world still just routes you efficiently to houses that might not need a roof. Accuracy has to come first.",
      },
      { type: "h2", text: "Built to scale with a seasonal crew, not against it" },
      {
        type: "p",
        text: "Whether you're a Colorado Springs-based operator or a regional crew that just rolled in from Denver, storm season usually means temporary canvassers. RoofScout charges by scan volume, not by seat, so scaling a crew up for a few weeks doesn't mean a permanent jump in your software bill once the storm passes.",
      },
      {
        type: "link",
        text: "→ See how RoofScout compares to Roofr and EagleView",
        href: "/blog/roofscout-vs-roofr-vs-eagleview",
      },
    ],
  },
  {
    slug: "roofing-leads-omaha",
    title: "Omaha Roofing Leads: Targeting the Highest Hail-Claim Density in the Country",
    description:
      "Omaha was recently ranked the single highest U.S. city for hail loss claims in a three-year window — over 54,000 claims packed into a metro far smaller than Dallas-Fort Worth or Denver. Here's how to work that density efficiently.",
    publishedAt: "2026-08-02",
    readingMinutes: 6,
    body: [
      {
        type: "p",
        text: "Omaha doesn't have the population of Dallas-Fort Worth or Denver, but NICB's national hail-claims data ranked it the single highest-volume U.S. city for hail loss claims in its 2017-2019 report — 54,153 claims — and it placed No. 3 nationally in the prior 2016-2018 report too, with 52,803 claims. That's the country's top hail-claim city landing in the national top 3 in back-to-back three-year reporting windows, in a metro far smaller than Dallas-Fort Worth or Denver.",
      },
      { type: "h2", text: "Density changes the math" },
      {
        type: "p",
        text: "A smaller metro with the country's highest claim density means less driving between damaged neighborhoods and more contractors converging on the same handful of hard-hit areas after any given storm. In a market like this, the advantage goes to whoever can accurately cover the most ground fastest — not whoever has the biggest sales team.",
      },
      { type: "h2", text: "Local and regional Midwest operators, working close together" },
      {
        type: "p",
        text: "Omaha's contractor base leans toward local operators and regional Midwest restoration companies rather than the coast-to-coast storm-chase crews that dominate Texas. That means reputation and speed both matter — you're likely to run into the same competitors storm after storm, so being first to an accurate read on a neighborhood compounds over multiple seasons, not just one.",
      },
      {
        type: "quote",
        text: "In the highest hail-density city in the country, covering a neighborhood accurately in one satellite pass beats covering it block by block — every single storm season.",
      },
      { type: "h2", text: "Where RoofScout fits Omaha's density" },
      {
        type: "p",
        text: "RoofScout scans an entire Omaha or Lincoln neighborhood in one pass — real satellite imagery, Google Solar measurement data, and an AI vision read that writes an actual condition assessment for each roof, not a generic score — and hands back a ranked, priced lead list. In a market this dense, that's the difference between covering three neighborhoods a week and covering three streets.",
      },
      { type: "h2", text: "Storm Tracker for Nebraska's May-through-July window" },
      {
        type: "p",
        text: "RoofScout's Apex plan includes Storm Tracker, a live severe-weather overlay on the scan map — built for exactly the kind of tight, repeated storm windows Omaha and Lincoln see through peak season, so you can point a scan at the hit area the same day a warning is issued.",
      },
      {
        type: "link",
        text: "→ See RoofScout plans and pricing",
        href: "/pricing",
      },
    ],
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
