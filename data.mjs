// Content model for the Enchanted Booth Co. website.
// Everything the generator renders (business facts, packages, pages, gallery,
// FAQ, SEO) lives here. build.mjs turns this into ./site.

export const site = {
  name: "Enchanted Booth Co.",
  shortName: "Enchanted Booth",
  legalName: "Enchanted PhotoBooth LLC",
  tagline: "Des Moines' most enchanted photo booth",
  // Luxury photo booth rental, Des Moines metro. Home-based mobile service.
  domain: "https://www.enchantedboothco.com",
  indexable: true,

  email: "enchantedboothco@gmail.com",
  phone: "(515) 556-2377",
  tel: "+15155562377",

  // Mobile service based in Waukee / West Des Moines. No public street address.
  base: "Waukee & West Des Moines",
  city: "West Des Moines",
  region: "IA",
  regionName: "Iowa",
  lat: "41.5772",
  lng: "-93.7113",
  metro: "Des Moines metro",

  hoursLine: "By appointment, 7 days a week",

  instagram: "https://www.instagram.com/enchantedboothco.dsm",
  instagramHandle: "@enchantedboothco.dsm",
  facebook: "https://www.facebook.com/share/18gJ533WJQ/?mibextid=wwXIfr",
  tiktok: "https://www.tiktok.com/@enchanted.booth.c",
  tiktokHandle: "@enchanted.booth.c",

  // Contact form → FormSubmit (owner gmail). Needs a one-time confirmation click.
  formEndpoint: "https://formsubmit.co/enchantedboothco@gmail.com",

  // No verified public Google rating yet → no aggregateRating / reviews block
  // (4.6 gate + "no reviews, no section" rule).
  googleRating: 0,
  googleReviewCount: 0,

  promo: {
    enabled: true,
    eyebrow: "Now booking 2026 & 2027",
    title: "Dates are filling fast.",
    text: "Weddings and holiday parties book out first. Send your date and we will hold it with a quick quote. No pressure, no spam.",
    cta: "Check your date",
  },
};

// Primary nav + the More dropdown.
export const nav = [
  { label: "Packages", href: "/packages/" },
  { label: "Gallery", href: "/gallery/" },
  { label: "How It Works", href: "/how-it-works/" },
  { label: "FAQ", href: "/faq/" },
];
export const navMore = [
  { label: "Weddings", href: "/weddings/" },
  { label: "Corporate Events", href: "/corporate-events/" },
  { label: "Parties & Celebrations", href: "/parties/" },
  { label: "Service Areas", href: "/service-areas/" },
];

// Every booking includes these.
export const alwaysIncluded = [
  "Professional DSLR studio setup",
  "Free delivery, setup and breakdown",
  "A friendly on-site attendant",
  "Instant sharing by QR, text and email",
];

export const packages = [
  {
    slug: "classic",
    tier: "Tier 1",
    name: "Classic Booth",
    price: 499,
    hours: "2 hours",
    featured: false,
    blurb: "Perfect for graduation parties, cocktail hours and intimate gatherings.",
    img: "group-women",
    includes: [
      ["Studio-grade DSLR imaging", "Crisp, high-resolution photos that beat any tablet booth."],
      ["On-site professional attendant", "A real person to engage your guests and keep the fun going."],
      ["Digital-only sharing", "Instant QR code, text and email delivery for every guest."],
      ["Classic tension backdrop", "Your choice of our sleek gallery backdrops."],
      ["Full online gallery", "A permanent link to download every high-res memory."],
      ["Custom screen display", "Your logo, a pre-wedding video or a special message on the rear screen."],
    ],
  },
  {
    slug: "signature",
    tier: "Tier 2",
    name: "Signature Booth",
    price: 699,
    hours: "3 hours",
    featured: true,
    blurb: "The ultimate wedding and corporate party package, tailored to your style.",
    img: "wedding-kiss",
    plus: "Everything in Classic, plus",
    includes: [
      ["Unlimited classic photo strips", "Unlimited 2x6 prints your guests take home all night."],
      ["Custom print design", "A template matched to your event theme, colors or names."],
      ["Themed prop collection", "A curated kit of fun, high-quality props."],
      ["VIP postcard upgrade available", "4x6 postcard layout for a plus $75."],
    ],
  },
  {
    slug: "premium",
    tier: "Tier 3",
    name: "Premium Booth",
    price: 899,
    hours: "4 hours",
    featured: false,
    blurb: "The luxury choice for large-scale galas, weddings and brand activations.",
    img: "gala-trio",
    plus: "Everything in Signature, plus",
    includes: [
      ["The Glam filter", "Optional skin-smoothing and high-contrast black and white looks."],
      ["Unlimited prints, both sizes", "Unlimited 2x6 strips and 4x6 VIP postcards."],
      ["Complimentary picture sleeves", "2x6 sleeves to protect every print."],
      ["Premium backdrop access", "Our top-tier backdrop collection."],
      ["Complimentary travel", "Included within 40 miles of Waukee / West Des Moines."],
    ],
  },
];

export const addOns = [
  { name: "Additional hours", price: "$100 / hour", note: "Added any time before or during your event." },
  { name: "VIP postcard upgrade", price: "+$75", note: "4x6 postcard layout instead of the 2x6 strip." },
];

export const travel = {
  note: "Complimentary travel is included with every package. Classic and Signature cover 30 miles from Waukee / West Des Moines; Premium extends to 40 miles. All travel fees are calculated and confirmed before you book.",
  tiers: [
    ["0 – 30 miles", "Included"],
    ["30 – 60 miles", "$100"],
    ["60 – 120 miles", "$200"],
    ["120+ miles", "Custom quote"],
  ],
};

export const steps = [
  {
    n: "01",
    title: "Hit us up",
    text: "Send an inquiry and we will get back to you with a package that suits your vibe. Your date is yours the moment the booking fee is paid and the contract is signed.",
  },
  {
    n: "02",
    title: "Lock in the fun stuff",
    text: "Closer to the big day we send a quick form so you can choose your photo template, backdrop and any extra touches.",
  },
  {
    n: "03",
    title: "We have got you",
    text: "On the day we handle everything. You just enjoy the party. We will make sure your guests have an epic time, and the best photos to prove it.",
  },
];

export const customization = {
  backdrops: {
    title: "Backdrops",
    text: "From classic solids to elegant sequins and rich textures, there is a backdrop for every vibe, color palette and theme.",
    img: "holiday-couple",
  },
  strips: {
    title: "Photo strip designs",
    text: "Custom 2x6 and 4x6 layouts matched to your event theme, your colors, your names or your branding. Designed by us, approved by you.",
    img: "strips-spread",
  },
};

export const booking = {
  deposit: "A 50% deposit secures your date. Your booking is not reserved until the deposit is received and confirmed.",
  reschedule: "Deposits are non-refundable but may be applied to a rescheduled date, subject to availability.",
  insured: "Enchanted Booth Co. carries general liability insurance and can provide a certificate of insurance (COI) on request.",
  setup: "We arrive early to set up before your guests do. The booth needs a standard power outlet and Wi-Fi for instant sharing. Setup and breakdown time is not counted in your service hours.",
};

// Event-type landing pages.
export const events = [
  {
    slug: "weddings",
    name: "Weddings",
    navLabel: "Weddings",
    kicker: "Wedding photo booth",
    title: "Wedding Photo Booth Rental in Des Moines, IA",
    h1: "Wedding photo booth rental in Des Moines, Iowa",
    description:
      "A luxury wedding photo booth for Des Moines and the whole metro. DSLR quality, unlimited prints, custom strip designs and a friendly attendant. Get a quote.",
    hero: "wedding-kiss",
    intro:
      "Your reception deserves more than a tablet on a stand. Our DSLR booth gives every guest a studio-quality portrait and an unlimited stack of custom photo strips to take home. You get a dance-floor keepsake and a full online gallery the morning after.",
    paras: [
      "We match your strip design to your colors, your names and your date, and roll out a backdrop that fits the room. From the cocktail hour to the last song, a real attendant keeps the line moving and the props flowing.",
      "Most couples choose the Signature or Premium package for a full reception. Both include unlimited prints and custom design; Premium adds the Glam filter and complimentary travel up to 40 miles.",
    ],
    highlights: [
      ["Unlimited custom strips", "Every guest leaves with a 2x6 or 4x6 print matched to your wedding."],
      ["A real attendant, all night", "Someone to run the booth so your coordinator does not have to."],
      ["Full online gallery", "A private link with every high-res photo to download and share."],
      ["Custom screen + backdrop", "Your names, a pre-wedding video and a backdrop that fits your room."],
    ],
    gallery: ["bride-squad", "groomsmen", "bridesmaids", "friends-laugh", "strip-ashes", "couple-bw"],
    recommend: ["signature", "premium"],
    faqRefs: ["events", "included", "cost", "advance", "booth-type", "travel", "deposit", "insured"],
  },
  {
    slug: "corporate-events",
    name: "Corporate Events",
    navLabel: "Corporate Events",
    kicker: "Corporate photo booth",
    title: "Corporate Event Photo Booth in Des Moines, IA",
    h1: "Corporate event photo booth in Des Moines, Iowa",
    description:
      "Branded photo booth rental for corporate events and holiday parties in the Des Moines metro. Custom logo prints, instant sharing and a professional attendant.",
    hero: "group-women",
    intro:
      "Put your brand in every guest's hands. Our DSLR booth prints custom strips with your logo, runs your message on the rear screen and shares every photo by QR, text and email so your team keeps the memories and you keep the reach.",
    paras: [
      "Holiday parties, client appreciation nights, conferences and product launches. We set up clean, run quietly and make your people look great, with a friendly attendant handling the whole thing.",
      "Need the logo on the strip, a branded backdrop or a specific screen loop? That is exactly what the Signature and Premium packages are built for.",
    ],
    highlights: [
      ["Your logo on every print", "Custom strip and screen designs built around your brand."],
      ["Instant digital sharing", "QR, text and email delivery for easy social reach."],
      ["Clean, professional setup", "A polished booth and an attendant who keeps it effortless."],
      ["Flexible hours", "Add hours any time for a longer event, $100 per hour."],
    ],
    gallery: ["group-women", "booth-candid", "prop-single", "strip-group"],
    recommend: ["signature", "premium"],
    faqRefs: ["events", "included", "cost", "holiday", "booth-type", "travel", "setup", "insured"],
  },
  {
    slug: "parties",
    name: "Parties & Celebrations",
    navLabel: "Parties & Celebrations",
    kicker: "Party photo booth",
    title: "Party Photo Booth Rental in Des Moines, IA",
    h1: "Party & celebration photo booth in Des Moines, Iowa",
    description:
      "Photo booth rental for birthdays, graduations and holiday parties in the Des Moines metro. DSLR quality, fun props and instant prints. Get a quote.",
    hero: "nye-group",
    intro:
      "Birthdays, graduations, holiday parties, New Year's and every reason to celebrate. Our booth brings the props, the prints and the energy, so your guests end the night with a photo strip and a story.",
    paras: [
      "The Classic package is perfect for graduation parties and cocktail hours; step up to Signature for unlimited prints and a themed prop collection that keeps the booth busy all night.",
      "We handle setup and breakdown, bring a friendly attendant and share every photo instantly, so you can actually enjoy your own party.",
    ],
    highlights: [
      ["Themed prop collection", "A curated kit of fun, high-quality props for your crowd."],
      ["Instant prints & sharing", "Unlimited strips plus QR, text and email delivery."],
      ["Great for any size", "From intimate gatherings to a full dance floor."],
      ["We set up and tear down", "Free setup and breakdown, every time."],
    ],
    gallery: ["nye-group", "gala-trio", "holiday-couple", "birthday-cake", "party-props", "strip-craigers"],
    recommend: ["classic", "signature"],
    faqRefs: ["events", "included", "cost", "graduation", "holiday", "minimum", "travel", "deposit"],
  },
];

// Service-area landing pages (photo booth rental <city>).
export const areas = [
  {
    slug: "west-des-moines",
    city: "West Des Moines",
    distance: "our home base",
    blurb:
      "Enchanted Booth Co. is based right here in West Des Moines, so you get complimentary travel and the easiest setup in the metro, from Jordan Creek and Valley Junction to Jordan Creek Town Center ballrooms and backyard receptions.",
    landmarks: "Valley Junction, Jordan Creek, Country Club",
  },
  {
    slug: "des-moines",
    city: "Des Moines",
    distance: "a short hop from base",
    blurb:
      "From downtown lofts and the East Village to ballrooms, breweries and backyard parties, we bring a full DSLR booth anywhere in Des Moines with free setup and breakdown.",
    landmarks: "Downtown, East Village, Beaverdale",
  },
  {
    slug: "ankeny",
    city: "Ankeny",
    distance: "within complimentary range",
    blurb:
      "Ankeny weddings, graduations and corporate parties are an easy drive from our West Des Moines base, and well within complimentary travel for every package.",
    landmarks: "Prairie Trail, The District, Otter Creek",
  },
  {
    slug: "waukee",
    city: "Waukee",
    distance: "our home base",
    blurb:
      "We call Waukee home. Kettlestone venues, Sugar Creek and backyard celebrations get the fastest setup and complimentary travel on every package.",
    landmarks: "Kettlestone, Sugar Creek, Triumph Park",
  },
  {
    slug: "urbandale",
    city: "Urbandale",
    distance: "within complimentary range",
    blurb:
      "Urbandale events are minutes from base, so our booth, attendant and backdrops arrive early and complimentary travel is included with every package.",
    landmarks: "Living History Farms, Walker Johnston, 86th Street",
  },
  {
    slug: "clive",
    city: "Clive",
    distance: "within complimentary range",
    blurb:
      "Clive receptions and company parties sit right inside our complimentary travel range, with the same DSLR quality and friendly attendant you see across the metro.",
    landmarks: "Greenbelt Trail, Country Club, NW 86th",
  },
  {
    slug: "johnston",
    city: "Johnston",
    distance: "within complimentary range",
    blurb:
      "From Terra Lake gatherings to Johnston wedding venues and corporate events, we deliver a full booth with complimentary travel on every package.",
    landmarks: "Terra Lake, Green Days, Merle Hay",
  },
  {
    slug: "grimes",
    city: "Grimes",
    distance: "within complimentary range",
    blurb:
      "Grimes is an easy drive from our Waukee base, so your celebration gets early setup, a friendly attendant and complimentary travel with every package.",
    landmarks: "The Grove, Edge of Town, Highway 141",
  },
  {
    slug: "altoona",
    city: "Altoona",
    distance: "a short drive east",
    blurb:
      "From Adventureland and Prairie Meadows to the Outlets of Des Moines and backyard receptions, we bring a full DSLR booth to Altoona with free setup, breakdown and complimentary travel on every package.",
    landmarks: "Adventureland, Prairie Meadows, the Outlets of Des Moines",
  },
  {
    slug: "bondurant",
    city: "Bondurant",
    distance: "just northeast of the metro",
    blurb:
      "Bondurant weddings, graduations and company parties get the same studio-quality booth and friendly attendant we bring across the metro, with complimentary travel on every package.",
    landmarks: "the Depot District, Lake Petocka",
  },
  {
    slug: "adel",
    city: "Adel",
    distance: "minutes west of base",
    blurb:
      "Adel is minutes from our Waukee base, so your wedding or party gets the earliest setup in the county, a friendly attendant and complimentary travel on every package.",
    landmarks: "the historic Courthouse Square, the Raccoon River Valley Trail, Island Park",
  },
  {
    slug: "norwalk",
    city: "Norwalk",
    distance: "just south of the metro",
    blurb:
      "Norwalk receptions, graduations and company parties sit well inside our complimentary travel range, with the same DSLR quality and friendly attendant you see across the metro.",
    landmarks: "Elizabeth Holland Park, the Great Western Trail",
  },
  {
    slug: "indianola",
    city: "Indianola",
    distance: "south of the metro",
    blurb:
      "From National Balloon Classic season to Simpson College celebrations and winery weddings, we bring a full DSLR booth to Indianola with complimentary travel on every package.",
    landmarks: "the National Balloon Classic, Simpson College, Summerset Winery",
  },
  {
    slug: "pella",
    city: "Pella",
    distance: "a scenic drive southeast",
    blurb:
      "From Tulip Time weddings to vineyard receptions and historic venues, we bring a full DSLR booth to Pella. Travel is quoted up front so there are never any surprises.",
    landmarks: "Tulip Time, the Historic Village, Central College",
    travelLine:
      "Pella sits just beyond our complimentary travel range, so a flat travel fee is calculated and confirmed before you book — no surprises on the day.",
  },
];

// FAQ — visible + FAQPage schema. Answers are HTML (links allowed).
export const faqs = [
  {
    id: "events",
    q: "What types of events do you do photo booth rentals for?",
    a: 'Weddings, corporate events, holiday parties, birthdays, graduations and just about any celebration. See <a href="/weddings/">weddings</a>, <a href="/corporate-events/">corporate events</a> and <a href="/parties/">parties</a>.',
  },
  {
    id: "included",
    q: "What is included with every photo booth package?",
    a: 'Every booking includes a professional DSLR studio setup, free delivery, setup and breakdown, a friendly on-site attendant, your choice of backdrop, props, instant sharing by QR, text and email, and a full online gallery. See the <a href="/packages/">packages</a> for what each tier adds.',
  },
  {
    id: "cost",
    q: "How much does it cost to rent a photo booth?",
    a: 'Packages start at $499 for 2 hours (Classic), $699 for 3 hours (Signature) and $899 for 4 hours (Premium). Additional hours are $100 each. See full <a href="/packages/">packages and pricing</a>, or read our <a href="/photo-booth-cost/">photo booth cost guide</a> for a full breakdown.',
  },
  {
    id: "booth-type",
    q: "What kind of photo booth is it?",
    a: 'It is a modern open-air booth built around a professional DSLR camera, studio lighting and your choice of backdrop. Open-air means there is no cramped enclosed box, so big groups fit in one frame and every photo looks like a studio portrait. See the <a href="/gallery/">gallery</a> and <a href="/how-it-works/">how it works</a>.',
  },
  {
    id: "advance",
    q: "How far in advance should I book a photo booth?",
    a: 'The sooner the better. For <a href="/weddings/">weddings</a> and peak dates (holiday season, graduation weekends and New Year\'s) we recommend reserving three to six months out, since popular Saturdays book first. That said, reach out even on short notice; a 50% deposit holds your date the moment it clears.',
  },
  {
    id: "graduation",
    q: "Do you do graduation party photo booths?",
    a: 'Yes. Graduation parties are one of our most popular bookings. The <a href="/packages/">Classic package</a> is a great fit for an open house, and the booth brings props, instant prints and digital sharing so every guest leaves with a keepsake. See <a href="/parties/">parties and celebrations</a>.',
  },
  {
    id: "holiday",
    q: "Can you do company and holiday parties?",
    a: 'Absolutely. We run <a href="/corporate-events/">corporate events</a> and <a href="/parties/">holiday parties</a> throughout the season with custom branded strips, a logo or message on the rear screen and a friendly attendant. December books out early, so reserve your date ahead of time.',
  },
  {
    id: "minimum",
    q: "What is the minimum rental time?",
    a: "The minimum rental time is 2 hours, which is our Classic package. You can add hours any time for $100 per hour.",
  },
  {
    id: "setup",
    q: "What does setup and the experience look like?",
    a: "We arrive early to set the booth up before your guests arrive. The booth needs a standard power outlet and Wi-Fi for instant sharing. A friendly attendant stays for the whole event, and we handle breakdown at the end. Setup and breakdown time is not counted in your service hours.",
  },
  {
    id: "deposit",
    q: "Is a deposit required, and what if we need to reschedule?",
    a: "Yes. A 50% deposit secures your date, and your date is not reserved until it is received. We know plans change. Deposits are non-refundable but may be applied to a rescheduled date, subject to availability.",
  },
  {
    id: "travel",
    q: "Do you travel? Are there travel fees?",
    a: 'Yes, we travel for events across the Des Moines metro and beyond. Travel within 30 miles of Waukee / West Des Moines is complimentary (40 miles on Premium). Beyond that: 30 to 60 miles is $100, 60 to 120 miles is $200, and 120+ miles is a custom quote. All fees are confirmed before you book. See <a href="/service-areas/">service areas</a>.',
  },
  {
    id: "insured",
    q: "Are you insured?",
    a: "Yes. Enchanted Booth Co. carries general liability insurance and can provide a certificate of insurance (COI) on request, which many venues require.",
  },
];

// Gallery — key, descriptive alt, category for the filter.
export const gallery = [
  { key: "groomsmen", alt: "Groomsmen posing at a wedding photo booth in Des Moines, Iowa", cat: "weddings" },
  { key: "bride-squad", alt: "Bride and her bridal party at a Des Moines wedding photo booth", cat: "weddings" },
  { key: "bridesmaids", alt: "Bridesmaids at a luxury photo booth at a Des Moines wedding", cat: "weddings" },
  { key: "friends-laugh", alt: "Wedding guests laughing together at the Enchanted Booth Co. photo booth", cat: "weddings" },
  { key: "wedding-kiss", alt: "Couples at a wedding photo booth in front of a draped backdrop", cat: "weddings" },
  { key: "couple-bw", alt: "Elegant couple at a West Des Moines wedding photo booth", cat: "weddings" },
  { key: "nye-group", alt: "Friends celebrating at a party photo booth with a sequin backdrop", cat: "parties" },
  { key: "gala-trio", alt: "Guests with champagne and props at a gala photo booth in Des Moines", cat: "parties" },
  { key: "holiday-couple", alt: "Couple at a holiday party photo booth with a gold backdrop", cat: "parties" },
  { key: "birthday-cake", alt: "Birthday cake and props at a Des Moines party photo booth", cat: "parties" },
  { key: "party-props", alt: "Colorful birthday party props from the Enchanted Booth Co. prop kit", cat: "parties" },
  { key: "prop-single", alt: "Guest holding a fun prop sign at a Des Moines photo booth", cat: "parties" },
  { key: "group-women", alt: "Friends in dresses at a corporate event photo booth in West Des Moines", cat: "corporate" },
  { key: "booth-candid", alt: "Guests at the Enchanted Booth Co. photo booth at a Des Moines event", cat: "corporate" },
  { key: "strips-spread", alt: "Custom Enchanted Booth Co. photo strips and designs spread out", cat: "strips" },
  { key: "strips-hand", alt: "Guest holding custom photo strips at a wedding photo booth", cat: "strips" },
  { key: "strip-ashes", alt: "Custom wedding photo strip design by Enchanted Booth Co.", cat: "strips" },
  { key: "strip-forever", alt: "Custom bridal party photo strip design by Enchanted Booth Co.", cat: "strips" },
  { key: "strip-lopezes", alt: "Custom wedding photo strip with names and date", cat: "strips" },
  { key: "strip-craigers", alt: "Custom photo strip design matched to an event theme", cat: "strips" },
  { key: "strip-drakes", alt: "Black and white custom wedding photo strip", cat: "strips" },
  { key: "strip-group", alt: "Group photo strip from a Des Moines corporate event booth", cat: "corporate" },
  { key: "backdrop-01", alt: "Floral backdrop detail at a West Des Moines wedding photo booth", cat: "details" },
  { key: "wed-07", alt: "Multigenerational wedding group at a Des Moines photo booth", cat: "weddings" },
  { key: "wed-08", alt: "Bride and groom laughing at a West Des Moines wedding photo booth", cat: "weddings" },
  { key: "wed-09", alt: "Newlyweds at a wedding photo booth in Des Moines", cat: "weddings" },
  { key: "wed-10", alt: "Wedding guests being playful at the Enchanted Booth Co. photo booth", cat: "weddings" },
  { key: "wed-11", alt: "Family in formalwear at a Des Moines wedding photo booth", cat: "weddings" },
  { key: "wed-12", alt: "Groomsmen and friends at a wedding photo booth in Des Moines", cat: "weddings" },
  { key: "wed-13", alt: "Bridesmaids with bouquets at a Des Moines wedding photo booth", cat: "weddings" },
  { key: "wed-14", alt: "Family with a baby and props at a wedding photo booth", cat: "weddings" },
  { key: "wed-15", alt: "Flower girls and ring bearers with props at a Des Moines wedding booth", cat: "weddings" },
  { key: "corp-05", alt: "Guests at a West Des Moines corporate event photo booth", cat: "corporate" },
  { key: "corp-06", alt: "Coworkers making heart hands at a corporate event photo booth", cat: "corporate" },
  { key: "party-07", alt: "Couple with fun props at a Des Moines party photo booth", cat: "parties" },
  { key: "strip-ashes2", alt: "Custom wedding photo strip by Enchanted Booth Co.", cat: "strips" },
  { key: "strip-caleb", alt: "Custom wedding photo strip with names and date", cat: "strips" },
];

export const galleryCats = [
  { id: "all", label: "Everything" },
  { id: "weddings", label: "Weddings" },
  { id: "parties", label: "Parties" },
  { id: "corporate", label: "Corporate" },
  { id: "strips", label: "Photo strips" },
];
