// Seeds the Lumen Hollow SQLite database with habitats, exhibits, events and categories.
// Re-run with: node db/seed.mjs   (wipes and re-populates everything except contacts).

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, 'wildlife.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);

const db = new sqlite3.Database(DB_PATH);

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function exec(sql) {
  return new Promise((resolve, reject) => {
    db.exec(sql, (err) => (err ? reject(err) : resolve()));
  });
}

const habitats = [
  {
    slug: 'moonlit-canopy',
    name: 'The Moonlit Canopy',
    tagline: 'A rainforest awake after dark.',
    description:
      'High above the forest floor, our suspended walkways drift through a humid canopy that only truly stirs once the sun has set. Tarsiers blink between branches, kinkajous lick nectar from night-flowering vines, and great fruit bats glide overhead in slow, deliberate arcs. Lit only by warm uplights filtered through living leaves.',
    accent_colour: '#5fb38a',
    map_x: 220,
    map_y: 180,
    display_order: 1,
    is_featured: 0,
    image_filename: 'moonlit-canopy.jpg',
    image_alt: 'Captivating full moon framed by silhouettes of trees during nighttime.',
    image_credit: 'Photo by Ravi Lages on Pexels',
    image_source_url: 'https://www.pexels.com/photo/full-moon-in-the-sky-10685030/',
  },
  {
    slug: 'whisperwood',
    name: 'Whisperwood',
    tagline: 'A temperate woodland at the edge of dusk.',
    description:
      'Whisperwood is hushed, bramble-dense and threaded with badger setts. Visitors follow a low-light trail past hedgehog hollows and fox dens, ending at the Barn Owl Theatre, an open glade where rescued raptors take silent practice flights at twilight.',
    accent_colour: '#d49a5a',
    map_x: 760,
    map_y: 200,
    display_order: 2,
    is_featured: 0,
    image_filename: 'whisperwood.jpg',
    image_alt: 'An enigmatic forest scene at twilight, with backlit trees and a mysterious atmosphere.',
    image_credit: 'Photo by Walter Coppola on Pexels',
    image_source_url: 'https://www.pexels.com/photo/light-shining-through-silhouetted-trees-at-dusk-25323314/',
  },
  {
    slug: 'glowing-shore',
    name: 'The Glowing Shore',
    tagline: 'Where the tide carries its own light.',
    description:
      'A reconstructed stretch of coastline lit from beneath the water. Bioluminescent dinoflagellates bloom on cue, glow-worms cling to the cliff face, and comb jellies pulse along a wall-length aquarium. The Glowing Shore is the quietest habitat, visitors are asked to keep voices low so the wash of the surf can be heard.',
    accent_colour: '#6ad4d4',
    map_x: 250,
    map_y: 450,
    display_order: 3,
    is_featured: 1,
    image_filename: 'glowing-shore.jpg',
    image_alt: 'Mesmerising view of bioluminescent waves crashing at Newport Beach during the night.',
    image_credit: 'Photo by Noah Munivez on Pexels',
    image_source_url: 'https://www.pexels.com/photo/crashing-waves-on-the-ocean-10938943/',
  },
  {
    slug: 'dusk-plains',
    name: 'Dusk Plains',
    tagline: 'Savannah at the turning of the day.',
    description:
      'A wide, open habitat lit by deep amber lamps that mimic a long African twilight. Aardvarks emerge from their burrows, bushbabies leap between thornier acacias, and our resident leopard, Imani, may sometimes be spotted along the northern ridge. The plains close with a guided storytelling walk most evenings.',
    accent_colour: '#a98cc9',
    map_x: 700,
    map_y: 420,
    display_order: 4,
    is_featured: 0,
    image_filename: 'dusk-plains.jpg',
    image_alt: 'A stunning African sunset with the silhouette of an acacia tree in Kajiado County, Kenya.',
    image_credit: 'Photo by Sam Kim on Pexels',
    image_source_url: 'https://www.pexels.com/photo/a-silhouette-of-a-tree-during-the-golden-hour-11811982/',
  },
  {
    slug: 'echo-caves',
    name: 'The Echo Caves',
    tagline: 'A subterranean world that has never known daylight.',
    description:
      'Carved from a former limestone quarry and gently lit by pale lanterns, the Echo Caves host roosting horseshoe bats, blind olms in cool spring pools, and walls patterned with bioluminescent fungi. Acoustics are everything here, listening posts amplify the soft chitter of life in the dark.',
    accent_colour: '#c9b076',
    map_x: 500,
    map_y: 320,
    display_order: 5,
    is_featured: 0,
    image_filename: 'echo-caves.jpg',
    image_alt: 'A stunning view of stalactites and cave formations lit with natural lighting.',
    image_credit: 'Photo by Najman Husaini on Pexels',
    image_source_url: 'https://www.pexels.com/photo/stalactites-inside-the-cave-11144695/',
  },
];

const exhibitsByHabitat = {
  'moonlit-canopy': [
    {
      slug: 'tarsier-skybridge',
      name: 'Tarsier Skybridge',
      kind: 'exhibit',
      species_common: 'Philippine Tarsier',
      species_scientific: 'Carlito syrichta',
      iucn_status: 'Near Threatened',
      description:
        'A glass-floored walkway looping through the upper canopy, where our small colony of tarsiers hunts insects in near silence. Their enormous fixed eyes catch every flicker of available light.',
    },
    {
      slug: 'kinkajou-hollows',
      name: 'Kinkajou Hollows',
      kind: 'exhibit',
      species_common: 'Kinkajou',
      species_scientific: 'Potos flavus',
      iucn_status: 'Least Concern',
      description:
        'Hollowed tree-trunk dens at viewing height, where kinkajous emerge each evening to feed on figs, nectar and the occasional honeycomb provided by our keepers.',
    },
    {
      slug: 'fruit-bat-sanctuary',
      name: 'Fruit Bat Sanctuary',
      kind: 'exhibit',
      species_common: 'Indian Flying Fox',
      species_scientific: 'Pteropus medius',
      iucn_status: 'Least Concern',
      description:
        'A flight-through enclosure with high vaulting beams. Our flying foxes glide between roosting points and feeding stations stocked with mango, papaya and banana.',
      image_filename: 'fruit-bat-sanctuary.jpg',
      image_alt: 'Close-up of a brown bat hanging upside down in the wild, showcasing its nocturnal nature.',
      image_credit: 'Photo by Stephen Chantzis on Pexels',
      image_source_url: 'https://www.pexels.com/photo/a-bat-hanging-upside-down-on-a-rope-5788661/',
    },
    {
      slug: 'canopy-rope-walk',
      name: 'Canopy Rope Walk',
      kind: 'experience',
      species_common: null,
      species_scientific: null,
      iucn_status: null,
      description:
        'A 60-metre rope walkway suspended 12 metres above the forest floor. Optional torchless walk available for visitors comfortable in low light, quieter for the animals, and unforgettable for you.',
    },
  ],
  whisperwood: [
    {
      slug: 'barn-owl-theatre',
      name: 'Barn Owl Theatre',
      kind: 'demonstration',
      species_common: 'Barn Owl',
      species_scientific: 'Tyto alba',
      iucn_status: 'Least Concern',
      description:
        'Twice-nightly silent flight demonstrations with rescued owls that cannot be returned to the wild. Our handlers narrate the birds’ specialised feather structures while they glide overhead.',
    },
    {
      slug: 'hedgehog-hollow',
      name: 'Hedgehog Hollow',
      kind: 'exhibit',
      species_common: 'European Hedgehog',
      species_scientific: 'Erinaceus europaeus',
      iucn_status: 'Near Threatened',
      description:
        'A wildflower-edged enclosure that doubles as a release-prep site for rehabilitated wild hedgehogs. Several long-term residents who cannot be released live here permanently.',
    },
    {
      slug: 'red-fox-den',
      name: 'Red Fox Den',
      kind: 'exhibit',
      species_common: 'Red Fox',
      species_scientific: 'Vulpes vulpes',
      iucn_status: 'Least Concern',
      description:
        'A semi-natural den system shared by a bonded pair of urban-rescue foxes. Best viewed from the elevated platform at the trail’s end, where the foxes often sun themselves at dusk.',
      image_filename: 'red-fox-den.jpg',
      image_alt: 'A striking red fox peering through foliage, captured in its natural forest habitat.',
      image_credit: 'Photo by Vincent M.A. Janssen on Pexels',
      image_source_url: 'https://www.pexels.com/photo/red-fox-in-wild-nature-8633159/',
    },
    {
      slug: 'twilight-trail',
      name: 'Twilight Trail',
      kind: 'experience',
      species_common: null,
      species_scientific: null,
      iucn_status: null,
      description:
        'A guided low-light walk threading the full length of Whisperwood. Keepers explain the woodland soundscape and point out the species you would otherwise miss. Departs hourly from late afternoon.',
    },
  ],
  'glowing-shore': [
    {
      slug: 'glow-worm-grotto',
      name: 'Glow-Worm Grotto',
      kind: 'exhibit',
      species_common: 'Common Glow-worm',
      species_scientific: 'Lampyris noctiluca',
      iucn_status: 'Data Deficient',
      description:
        'A constructed cliff-face seeded with glow-worm larvae. Each year the colony lights up between May and August, the females’ light is the only one our visitors will ever see in the wild.',
    },
    {
      slug: 'dinoflagellate-bay',
      name: 'Dinoflagellate Bay',
      kind: 'experience',
      species_common: 'Sea Sparkle',
      species_scientific: 'Noctiluca scintillans',
      iucn_status: null,
      description:
        'A shallow wading pool stocked with bioluminescent plankton. Drag a fingertip through the water and watch it answer in pale blue light. Wellies are provided.',
    },
    {
      slug: 'lanternfish-tank',
      name: 'Lanternfish Tank',
      kind: 'exhibit',
      species_common: 'Lanternfish',
      species_scientific: 'Family Myctophidae',
      iucn_status: 'Least Concern',
      description:
        'A deep-water column tank kept at low temperature. These small, light-producing fish migrate upwards each evening in one of the largest daily movements of biomass on Earth.',
      image_filename: 'lanternfish-tank.jpg',
      image_alt: 'Blue marine fish swimming in an aquarium, showing beautiful aquatic life.',
      image_credit: 'Photo by PEEP THIS PHOTO on Pexels',
      image_source_url: 'https://www.pexels.com/photo/fish-28338112/',
    },
    {
      slug: 'comb-jelly-wall',
      name: 'Comb Jelly Wall',
      kind: 'exhibit',
      species_common: 'Comb Jelly',
      species_scientific: 'Phylum Ctenophora',
      iucn_status: null,
      description:
        'A wall-length cylindrical aquarium. Rows of cilia along each jelly’s body diffract the gallery’s low light into shifting rainbow bands, not bioluminescence, but no less striking.',
    },
  ],
  'dusk-plains': [
    {
      slug: 'aardvark-burrows',
      name: 'Aardvark Burrows',
      kind: 'exhibit',
      species_common: 'Aardvark',
      species_scientific: 'Orycteropus afer',
      iucn_status: 'Least Concern',
      description:
        'A network of artificial burrows beneath a low termite mound. Our two aardvarks emerge most evenings to forage at the keepers’ stations.',
    },
    {
      slug: 'bushbaby-boughs',
      name: 'Bushbaby Boughs',
      kind: 'exhibit',
      species_common: 'Senegal Bushbaby',
      species_scientific: 'Galago senegalensis',
      iucn_status: 'Least Concern',
      description:
        'A walk-through enclosure of acacia thorn and bramble. The bushbabies leap remarkable distances between perches, children almost always spot them before adults do.',
    },
    {
      slug: 'leopard-lookout',
      name: 'Leopard Lookout',
      kind: 'exhibit',
      species_common: 'African Leopard',
      species_scientific: 'Panthera pardus pardus',
      iucn_status: 'Vulnerable',
      description:
        'An open ridge enclosure for Imani, a female leopard rescued from the illegal pet trade. Best viewed from the northern blind. Imani sets her own schedule and may not always be visible.',
      image_filename: 'leopard-lookout.jpg',
      image_alt: 'Close-up of a leopard in a lush forest setting, showcasing its detailed spots.',
      image_credit: 'Photo by Danique Veldhuis on Pexels',
      image_source_url: 'https://www.pexels.com/photo/leopard-20449618/',
    },
    {
      slug: 'civet-path',
      name: 'Civet Path',
      kind: 'exhibit',
      species_common: 'African Civet',
      species_scientific: 'Civettictis civetta',
      iucn_status: 'Least Concern',
      description:
        'A long, hedge-bordered enclosure that the civets pace each evening. Information panels explain the species’ long, troubled relationship with the perfume industry.',
    },
  ],
  'echo-caves': [
    {
      slug: 'bat-cathedral',
      name: 'The Bat Cathedral',
      kind: 'exhibit',
      species_common: 'Greater Horseshoe Bat',
      species_scientific: 'Rhinolophus ferrumequinum',
      iucn_status: 'Least Concern',
      description:
        'A vaulted chamber with roosting beams set into the ceiling. Live thermal cameras let visitors watch the colony cluster, groom and depart on their nightly hunts.',
    },
    {
      slug: 'olm-pools',
      name: 'Olm Pools',
      kind: 'exhibit',
      species_common: 'Olm',
      species_scientific: 'Proteus anguinus',
      iucn_status: 'Vulnerable',
      description:
        'Cool, mineral-rich spring pools home to a small group of olms, pale, blind cave salamanders that can live for over a century. Lights are dimmed further on approach.',
      image_filename: 'olm-pools.jpg',
      image_alt: 'A pale aquatic salamander with feathery external gills, swimming among rocks.',
      image_credit: 'Photo by Magda Ehlers on Pexels',
      image_source_url: 'https://www.pexels.com/photo/close-up-of-axolotl-in-aquarium-setting-34945014/',
    },
    {
      slug: 'bioluminescent-fungi',
      name: 'Bioluminescent Fungi',
      kind: 'exhibit',
      species_common: 'Ghost Fungus',
      species_scientific: 'Omphalotus nidiformis',
      iucn_status: null,
      description:
        'A glass-walled growing chamber where cultivated patches of ghost fungus glow a steady, low green. Keepers replant cultures every few months as old fruiting bodies fade.',
    },
    {
      slug: 'echo-walk',
      name: 'Echo Walk',
      kind: 'experience',
      species_common: null,
      species_scientific: null,
      iucn_status: null,
      description:
        'A self-guided audio walk through the deepest part of the cave system. Listening posts pick up bat calls translated into the human hearing range, alongside ambient cave sound.',
    },
  ],
};

const eventCategories = [
  { slug: 'educational-talks', name: 'Educational Talks' },
  { slug: 'family-activities', name: 'Family Activities' },
  { slug: 'seasonal-celebrations', name: 'Seasonal Celebrations' },
  { slug: 'conservation-workshops', name: 'Conservation Workshops' },
  { slug: 'night-safaris', name: 'Night Safaris' },
];

const events = [
  // 2025, past events
  {
    slug: 'autumn-bat-week-2025',
    title: 'Autumn Bat Week 2025',
    summary: 'A week of late-evening tours, talks and roost demonstrations celebrating Britain’s native bats.',
    description:
      'Daily 60-minute guided tours of the Bat Cathedral, paired with two evening talks from our resident ecologist. Suitable for ages 8 and above. Numbers limited per session.',
    start_date: '2025-10-20',
    end_date: '2025-10-26',
    category: 'seasonal-celebrations',
    habitat: 'echo-caves',
  },
  {
    slug: 'autumn-fungi-foray-2025',
    title: 'Autumn Fungi Foray',
    summary: 'A guided foray through Whisperwood identifying autumn fungi alongside our resident mycologist.',
    description:
      'Suitable for confident walkers. Identification only, no foraging or collection. Includes hot drinks at the Whisperwood gate on return.',
    start_date: '2025-11-08',
    end_date: '2025-11-08',
    category: 'educational-talks',
    habitat: 'whisperwood',
  },
  {
    slug: 'winter-solstice-lantern-walk-2025',
    title: 'Winter Solstice Lantern Walk',
    summary: 'Our annual lantern walk traces the full park route on the longest night of the year.',
    description:
      'Free lanterns provided at the gate. Mulled apple juice and storytelling at the Echo Caves. Families welcome; the route is buggy-accessible throughout.',
    start_date: '2025-12-21',
    end_date: '2025-12-21',
    category: 'seasonal-celebrations',
    habitat: null,
  },
  // 2026, already happened earlier this year
  {
    slug: 'february-owl-prowl-2026',
    title: 'February Owl Prowl',
    summary: 'Late-winter owl walks led by our raptor team.',
    description:
      'Two-hour walks departing at dusk, ending at the Barn Owl Theatre. February is when our wild tawnies are most vocal, bring warm layers.',
    start_date: '2026-02-14',
    end_date: '2026-02-22',
    category: 'night-safaris',
    habitat: 'whisperwood',
  },
  {
    slug: 'spring-amphibian-day-2026',
    title: 'Spring Amphibian Day',
    summary: 'A family day focused on cave-dwelling and pond-dwelling amphibians.',
    description:
      'Activity stations for younger visitors, plus an afternoon talk from Dr Imogen Carlyle on the olm conservation programme.',
    start_date: '2026-03-22',
    end_date: '2026-03-22',
    category: 'family-activities',
    habitat: 'echo-caves',
  },
  {
    slug: 'dawn-chorus-breakfast-2026',
    title: 'Dawn Chorus Breakfast',
    summary: 'An early opening for the spring dawn chorus, followed by breakfast in the Whisperwood gatehouse.',
    description:
      'Park opens at 5am for ticket-holders. Guided listening walk followed by a hot breakfast. Numbers strictly limited.',
    start_date: '2026-05-04',
    end_date: '2026-05-04',
    category: 'educational-talks',
    habitat: 'whisperwood',
  },
  // 2026, upcoming (today is 2026-06-08 per system reminder)
  {
    slug: 'glow-worm-evenings-2026',
    title: 'Glow-worm Evenings',
    summary: 'Late openings each weekend through midsummer to see the glow-worm colony at its peak.',
    description:
      'The Glowing Shore stays open until 10pm on Fridays and Saturdays from mid-June to early August. Keepers stationed throughout the grotto to answer questions.',
    start_date: '2026-06-19',
    end_date: '2026-08-08',
    category: 'seasonal-celebrations',
    habitat: 'glowing-shore',
  },
  {
    slug: 'midsummer-family-festival-2026',
    title: 'Midsummer Family Festival',
    summary: 'A daytime festival of crafts, storytelling and short workshops across all five habitats.',
    description:
      'Free with park entry. Includes a children’s nature trail, two short conservation talks and a closing storytelling session at the Dusk Plains amphitheatre.',
    start_date: '2026-06-27',
    end_date: '2026-06-28',
    category: 'family-activities',
    habitat: null,
  },
  {
    slug: 'urban-fox-conservation-workshop-2026',
    title: 'Urban Fox Conservation Workshop',
    summary: 'An evening workshop on coexisting with urban red foxes, led by our welfare team.',
    description:
      'For adults and older teens. Covers fox biology, common conflicts and humane deterrents. Q&A with our welfare officer to close.',
    start_date: '2026-09-12',
    end_date: '2026-09-12',
    category: 'conservation-workshops',
    habitat: 'whisperwood',
  },
  {
    slug: 'autumn-bat-week-2026',
    title: 'Autumn Bat Week 2026',
    summary: 'The return of our flagship autumn programme, with new evening talks.',
    description:
      'Building on last year’s programme with two new talks, one on echolocation, one on conservation policy in the United Kingdom.',
    start_date: '2026-10-19',
    end_date: '2026-10-25',
    category: 'seasonal-celebrations',
    habitat: 'echo-caves',
  },
  {
    slug: 'winter-solstice-lantern-walk-2026',
    title: 'Winter Solstice Lantern Walk',
    summary: 'Our annual lantern walk returns for its sixth year.',
    description:
      'Same format as previous years. Hot drinks and storytelling on arrival at the Echo Caves. Lanterns provided.',
    start_date: '2026-12-21',
    end_date: '2026-12-21',
    category: 'seasonal-celebrations',
    habitat: null,
  },
  // 2027, future
  {
    slug: 'february-owl-prowl-2027',
    title: 'February Owl Prowl 2027',
    summary: 'The third year of our late-winter owl walks.',
    description:
      'Same beloved format, with an additional Sunday matinee suitable for younger families.',
    start_date: '2027-02-13',
    end_date: '2027-02-21',
    category: 'night-safaris',
    habitat: 'whisperwood',
  },
  {
    slug: 'tarsier-research-symposium-2027',
    title: 'Tarsier Research Symposium',
    summary: 'A one-day academic symposium hosted in partnership with the University of the Philippines.',
    description:
      'Open to the public; technical but accessible. Six speakers across the day, with a closing roundtable on captive welfare standards.',
    start_date: '2027-04-17',
    end_date: '2027-04-17',
    category: 'educational-talks',
    habitat: 'moonlit-canopy',
  },
];

async function seed() {
  const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
  await exec(schema);

  const habitatIds = {};
  for (const h of habitats) {
    const { lastID } = await run(
      `INSERT INTO habitats
         (slug, name, tagline, description, accent_colour, map_x, map_y, display_order, is_featured,
          image_filename, image_alt, image_credit, image_source_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        h.slug, h.name, h.tagline, h.description, h.accent_colour,
        h.map_x, h.map_y, h.display_order, h.is_featured ?? 0,
        h.image_filename ?? null, h.image_alt ?? null,
        h.image_credit ?? null, h.image_source_url ?? null,
      ],
    );
    habitatIds[h.slug] = lastID;
  }

  for (const [habitatSlug, list] of Object.entries(exhibitsByHabitat)) {
    for (const e of list) {
      await run(
        `INSERT INTO exhibits
           (habitat_id, slug, name, kind, species_common, species_scientific, iucn_status, description,
            image_filename, image_alt, image_credit, image_source_url)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          habitatIds[habitatSlug],
          e.slug,
          e.name,
          e.kind,
          e.species_common,
          e.species_scientific,
          e.iucn_status,
          e.description,
          e.image_filename ?? null,
          e.image_alt ?? null,
          e.image_credit ?? null,
          e.image_source_url ?? null,
        ],
      );
    }
  }

  const categoryIds = {};
  for (const c of eventCategories) {
    const { lastID } = await run(`INSERT INTO event_categories (slug, name) VALUES (?, ?)`, [c.slug, c.name]);
    categoryIds[c.slug] = lastID;
  }

  for (const ev of events) {
    await run(
      `INSERT INTO events (slug, title, summary, description, start_date, end_date, category_id, habitat_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        ev.slug,
        ev.title,
        ev.summary,
        ev.description,
        ev.start_date,
        ev.end_date,
        categoryIds[ev.category],
        ev.habitat ? habitatIds[ev.habitat] : null,
      ],
    );
  }

  console.log(`Seed complete: ${habitats.length} habitats, ${Object.values(exhibitsByHabitat).flat().length} exhibits, ${events.length} events.`);
}

seed()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => db.close());
