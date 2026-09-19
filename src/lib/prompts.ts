export const PEOPLE =
  "The guest photo may be one person or a group. Keep every person who is in it — the same number of people, the same grouping, every real face. Do not drop anyone. Do not add anyone. Do not replace them with statues, models or crowd extras.";

export const IDENTITY =
  "IDENTITY LOCK: Same person for every guest. Same face, same facial features, same eyes, same expression, same skin tone, same ethnicity, same age, same hairline and hair colour, same body shape and proportions. Do not beautify into another identity. Do not swap, slim, age or re-gender anyone. Likeness must stay recognizable as the original photo.";

export const GRADE =
  "Cinematic event-photobooth grade: flattering key from slightly above the lens, a soft fill, a discreet rim. Bright catchlights in both eyes, irises and lashes razor-sharp, healthy skin with real pores. Rich colour, deep but open shadows, festival/gala/forum presence — they look attractive, cool, and WOW. Same person. No Instagram gimmick, no beauty-filter face morph, no plastic skin, no doll face, no ethnicity change.";

export const FORBID =
  "No country names or maps as graphics. No text-heavy backgrounds, no readable signs, no logos covering faces. Never paint a flag on skin, hair or clothes.";

export const PHOTO_REAL =
  "Photoreal still photograph, shot like a gala or forum editorial. No cartoon, no illustration, no generic cyberpunk, no excessive neon, no fantasy armor.";

export const SCALE =
  "They are the heroes of the picture, not a tiny figure in a plaza. Large in the foreground, waist-up or three-quarter length, filling the middle of a 9:16 portrait. Heads sit in the upper half with a little space above the hair. Chests and shoulders stay visible. The place is the background behind them.";

export const CLEAN =
  `${PEOPLE} ${IDENTITY} ${SCALE} ${GRADE} ${FORBID} Cut them cleanly out of their old photo. Remove only the old background.`;

export const WARDROBE =
  "Change ONLY their clothes and role accessories. Keep the same body underneath. Hair may be lightly styled only if the outfit requires it (helmet, visor, cap), but the face must remain the same person. Do not change the face, identity, skin, age or likeness.";

const ROLE = `${CLEAN} ${PHOTO_REAL} ${WARDROBE}`;

const PRESENCE =
  "Hero lighting: they are the most magnetic guest in the picture, chin easy, eyes alive, wardrobe catching the key. Not a passport photo, not amateur flash.";

const TCHAD_PLACE =
  "The place is Tchad: N’Djamena civic bronze, Place de la Nation pylons, laterite, Sahel dusk, terracotta vaults, a near-future Chadian street. Chadian people stay Chadian — same faces, same skin, same ethnicity, same age. Futuristic overlay only as hologram gold light, climate-smart glass, unreadable XR glyphs. Not Europe, not a generic Gulf or Dubai skyline, not NASA chrome. IDENTITY LOCK on every guest.";

const FACE_CLEAR =
  "Any visor, headset or glasses is a slim prop around the same face. Eyes, brows, nose, mouth and skin stay fully visible in clear beauty-light, with catchlights. Do not black out the visor. Do not replace the face with a screen, HUD, mask or helmet shell.";

export const SYSTEM_PROMPTS = [
  {
    category: "Night",
    title: "Carpet",
    body: `${CLEAN} ${PRESENCE} They now stand on a cinematic red carpet with luxury lighting.`,
    videoHint: "Slow elegant camera push-in, keep every guest large and locked, hair and fabric move slightly, no text.",
  },
  {
    category: "Night",
    title: "Studio",
    body: `${CLEAN} ${PRESENCE} They now stand in a high-end fashion studio. Soft key light, clean backdrop.`,
    videoHint: "Subtle blink and light shift, identity locked, studio lighting stays consistent.",
  },
  {
    category: "Night",
    title: "Gala",
    body: `${CLEAN} ${PRESENCE} They now stand on a black-tie gala staircase. Evening clothes around the same body. Flash photography.`,
    videoHint: "Cameras flash softly, keep face identity, slow push-in.",
  },
  {
    category: "Worlds",
    title: "Space",
    body: `${CLEAN} ${PRESENCE} They now wear a realistic astronaut suit near Earth. The face inside the helmet is the same person.`,
    videoHint: "Gentle zero-gravity drift, Earth moves in the visor, face stays the same.",
  },
  {
    category: "Worlds",
    title: "Hero",
    body: `${CLEAN} ${PRESENCE} They now stand in a cinematic superhero city at night. Dramatic rim light. Same face. No logos.`,
    videoHint: "Cape and hair move, camera slowly orbits, face stays stable.",
  },
  {
    category: "Worlds",
    title: "Palace",
    body: `${CLEAN} ${PRESENCE} They now stand in a candlelit royal court. Velvet, gold, oil-lamp warmth.`,
    videoHint: "Candle flicker, slight fabric motion, identity locked.",
  },
  {
    category: "Worlds",
    title: "Rain",
    body: `${CLEAN} ${PRESENCE} They now stand on a rain-soaked night street in a near-future African megacity. Wet asphalt, warm shop light, climate-tower glow. Contemporary tailored clothes. No neon overload. No signs with readable text.`,
    videoHint: "Rain and warm light flicker, slight camera push-in, face locked.",
  },
  {
    category: "Worlds",
    title: "Desert",
    body: `${CLEAN} ${PRESENCE} They now stand in a golden dune field at dusk. Wind in linen, sun flare, dunes behind them.`,
    videoHint: "Sand and fabric drift, sun flare moves, identity locked.",
  },
  {
    category: "Worlds",
    title: "Quay",
    body: `${CLEAN} ${PRESENCE} They now stand on a river quay at blue hour in a future African capital. Bridges, warm towers and water-light behind them. No landmarks with names.`,
    videoHint: "River light shimmers, slow push-in, identity locked.",
  },
  {
    category: "Worlds",
    title: "Pulse",
    body: `${CLEAN} ${PRESENCE} They now stand on a humid night street of a coastal African city. Warm shop light, generators of glow, contemporary West and Central African tailoring that suits this person.`,
    videoHint: "Shop lights flicker, humid air, face locked.",
  },
  {
    category: "Worlds",
    title: "Marina",
    body: `${CLEAN} ${PRESENCE} They now stand on a gold-glass marina walkway at night. Climate-smart towers, warm reflections, water. No logos.`,
    videoHint: "Tower lights drift, slow orbit, identity locked.",
  },
  {
    category: "Horizon",
    title: "Orbit",
    body: `${CLEAN} ${PRESENCE} They now stand in a near-future N’Djamena aerospace plaza at dusk. Rammed-earth and bronze-glass research buildings, a distant craft on a quiet pad, solar roofs. ${TCHAD_PLACE} Contemporary clothes that suit this person. No flags. No text.`,
    videoHint: "Heat haze and a slow push-in. Guests stay large. No text.",
  },
  {
    category: "Horizon",
    title: "Vault",
    body: `${CLEAN} ${PRESENCE} They now stand under a monumental parabolic vault of laterite, bronze and glass — the dusk pavilion of a future N’Djamena forum, tiled plaza, metal spheres catching last light. ${TCHAD_PLACE} Sahelian architecture, advanced, believable. No flags. No text.`,
    videoHint: "Warm wind and cloth. Guests stay large. No text.",
  },
  {
    category: "Horizon",
    title: "Arrival",
    body: `${CLEAN} ${PRESENCE} They now stand at the head of a terracotta silk carpet in a civic hall of timber, brass and bronze-glass. Dusk through a vast window. Honour attendants far behind, never in costume flags. ${TCHAD_PLACE} No text.`,
    videoHint: "Cloth and window light move. Guests stay large. No text.",
  },
  {
    category: "Horizon",
    title: "Forum",
    body: `${CLEAN} ${PRESENCE} They now stand at Place de la Nation, N’Djamena: bronze statues on the pale V, white pylons, ceremonial lamps, laterite urns. Blue hour, a faint gold holographic overlay in the sky — IGF digital future. ${TCHAD_PLACE} They are a guest in the plaza, not a statue. No FGI, no UN, no logos, no text.`,
    videoHint: "Plaza heat and cloth. Guests stay large. No text.",
  },
  {
    category: "Horizon",
    title: "Dune",
    body: `${CLEAN} ${PRESENCE} They now stand in a Sahel dune field at golden hour. Wind in linen, a quiet solar field and a distant maglev line behind them. ${TCHAD_PLACE} No text.`,
    videoHint: "Sand and fabric drift. Guests stay large. No text.",
  },
  {
    category: "Horizon",
    title: "Ridge",
    body: `${CLEAN} ${PRESENCE} They now stand on a sandstone ridge at late sun. Red mesas, an observatory silhouette, heat haze. Advanced science in an African landscape. ${TCHAD_PLACE} No text.`,
    videoHint: "Heat haze and grass. Guests stay large. No text.",
  },
  {
    category: "Horizon",
    title: "Court",
    body: `${CLEAN} ${PRESENCE} They now stand on a pale stone plaza between two parabolic metal arches in a future N’Djamena civic court. Evening lamps, reflecting water, climate towers in the haze. ${TCHAD_PLACE} No text.`,
    videoHint: "Plaza light, slight walk. Guests stay large. No text.",
  },
  {
    category: "Horizon",
    title: "Hearth",
    body: `${CLEAN} ${PRESENCE} They now stand in a laterite courtyard of earth houses with arched doors and solar glass roofs. Neem shade, late sun, a quiet workshop. Lived-in and sophisticated. ${TCHAD_PLACE} No text.`,
    videoHint: "Dry wind and cloth. Guests stay large. No text.",
  },
  {
    category: "Horizon",
    title: "Stone",
    body: `${CLEAN} ${PRESENCE} They now stand before red sandstone pillars in golden light. A small bronze-glass research camp at their base. Cinematic dust. ${TCHAD_PLACE} No text.`,
    videoHint: "Sand and cloth in the wind. Guests stay large. No text.",
  },
  {
    category: "Art",
    title: "Painting",
    body: `${CLEAN} Turn the picture into a classical oil painting of these exact people. Visible brush texture, museum light, no frame.`,
    videoHint: "Very subtle living-painting motion, eyes and light flicker, same face.",
  },
  {
    category: "Art",
    title: "Neon",
    body: `${CLEAN} They now stand under magenta and teal neon on a rain-wet street.`,
    videoHint: "Neon signs flicker, light rain, face locked.",
  },
  {
    category: "Art",
    title: "Film",
    body: `${CLEAN} They now appear as a 1970s film still. Grain, flare, muted colour.`,
    videoHint: "Soft grain and flare drift, identity locked.",
  },
  {
    category: "Art",
    title: "Ice",
    body: `${CLEAN} They now stand in a glacial glass atelier. Cool light, frost.`,
    videoHint: "Breath fog and light crystals, face stays the same.",
  },
  {
    category: "Birthday",
    title: "Cake",
    body: `${CLEAN} They now stand beside a towering celebration cake with lit candles. Warm tungsten, sugar flowers, bokeh. Birthday night, not a bakery catalogue.`,
    videoHint: "Candle flicker and bokeh drift. Guests stay large. No sharp text.",
  },
  {
    category: "Birthday",
    title: "Balloons",
    body: `${CLEAN} They now stand under a floor-to-ceiling balloon garland in jewel tones. Confetti motes in the air. Joyful and cinematic.`,
    videoHint: "Balloons sway, confetti drifts, guests locked large.",
  },
  {
    category: "Birthday",
    title: "Confetti",
    body: `${CLEAN} They now stand in a burst of gold and rose confetti against dark velvet. Frozen celebration, fashion-editorial light.`,
    videoHint: "Confetti hangs then falls slowly. Faces locked.",
  },
  {
    category: "Birthday",
    title: "Spark",
    body: `${CLEAN} They now stand in a night garden with sparklers and warm string lights. Ember glow on skin.`,
    videoHint: "Spark trails and string lights twinkle. Guests large.",
  },
  {
    category: "Wedding",
    title: "Aisle",
    body: `${CLEAN} They now stand on a petal-strewn wedding aisle at dusk. String lights, linen, hush. Romantic, not a stock chapel.`,
    videoHint: "Petals and string lights drift. Slow push-in. Guests large.",
  },
  {
    category: "Wedding",
    title: "Bloom",
    body: `${CLEAN} They now stand under a living flower wedding arch at golden hour. Silk, greenery, champagne light.`,
    videoHint: "Petals and fabric move in a warm breeze. Faces locked.",
  },
  {
    category: "Wedding",
    title: "Ballroom",
    body: `${CLEAN} They now stand in a candlelit wedding ballroom. Chandeliers, marble, champagne tones. Formal and tender.`,
    videoHint: "Chandelier shimmer, slow orbit, guests large.",
  },
  {
    category: "Wedding",
    title: "Garden",
    body: `${CLEAN} They now stand in a white-rose garden at late afternoon. Soft linen, honey light, quiet luxury.`,
    videoHint: "Leaves and linen move. Golden light holds. Faces locked.",
  },
  {
    category: "Party",
    title: "Disco",
    body: `${CLEAN} They now stand under a mirrorball. Shards of silver light, glossy floor, nightclub glamour.`,
    videoHint: "Mirrorball shards sweep. Slight body sway. Faces locked.",
  },
  {
    category: "Party",
    title: "Rooftop",
    body: `${CLEAN} They now stand on a night rooftop party. City lights, fairy lights, warm wind, glass in hand optional.`,
    videoHint: "City lights breathe. Hair in the wind. Guests large.",
  },
  {
    category: "Party",
    title: "Velvet",
    body: `${CLEAN} They now sit or stand in a velvet cocktail booth. Low lamps, amber drinks, intimate after-hours light.`,
    videoHint: "Lamp glow pulses softly. Identity locked.",
  },
  {
    category: "Party",
    title: "After",
    body: `${CLEAN} They now stand in an afterparty haze. Magenta and teal rim light, smoke, midnight energy.`,
    videoHint: "Haze drifts, rim light shifts, faces locked.",
  },
  {
    category: "Baby",
    title: "Bundle",
    body: `${CLEAN} They now stand in a soft baby-shower setting. Cream linen, a hanging mobile, morning light. Tender, not a catalogue.`,
    videoHint: "Mobile turns slowly. Soft light. Guests large.",
  },
  {
    category: "Baby",
    title: "Blush",
    body: `${CLEAN} They now stand among blush florals and pearls for a baby celebration. Powder light, silk, quiet joy.`,
    videoHint: "Florals drift. Powder light holds. Faces locked.",
  },
  {
    category: "Grad",
    title: "Cap",
    body: `${CLEAN} They now wear or hold a graduation cap in cinematic light. Hall columns or open sky behind them. Proud, large in frame.`,
    videoHint: "Tassel moves. Slow push-in. Guests large.",
  },
  {
    category: "Grad",
    title: "Hall",
    body: `${CLEAN} They now stand in a graduation hall. Warm wood, gold light, a sense of arrival.`,
    videoHint: "Hall lights shimmer. Identity locked.",
  },
  {
    category: "Atelier",
    title: "Astro",
    body: `${ROLE} Dress them in a realistic near-future African space-program astronaut suit: sand, bronze and off-white technical fabric, not cartoon chrome. Visor raised or clear enough that the same face stays fully visible. Place them in a rammed-earth and bronze-glass aerospace plaza at dusk, a quiet pad behind them. Lighting matches the suit. No flags. No text.`,
    videoHint: "Soft visor light and a slow push-in. Face locked. No text.",
  },
  {
    category: "Atelier",
    title: "Lab",
    body: `${ROLE} Dress them as a near-future research scientist: tailored lab coat over clothes that still suit this body, brass and glass instruments. Advanced African research lab of timber, bronze and matte instruments. Warm practical light. Believable science, not a comic lab. No neon. No flags. No text.`,
    videoHint: "Instrument lights breathe. Identity locked. No text.",
  },
  {
    category: "Atelier",
    title: "Duty",
    body: `${ROLE} Dress them in a dignified realistic modern or near-future Chadian army service uniform: sand, khaki and olive field dress, clean cut. Uniform and clothes only. No flags, no maps, no country names, no political slogans, no giant emblems as graphics. Rank marks if any stay small and unreadable. They stand in a laterite courtyard or quiet barracks at dusk. Photoreal, respectful. No text.`,
    videoHint: "Dusk wind in cloth. Face locked. No flags. No text.",
  },
  {
    category: "Atelier",
    title: "Clinic",
    body: `${ROLE} Dress them as a futuristic but believable doctor: sleek clinical coat, subtle brass details, professional. Calm timber-and-glass clinic, soft clinical light on the same skin. No cartoon scrubs costume. No flags. No text.`,
    videoHint: "Soft clinic light shift. Identity locked.",
  },
  {
    category: "Atelier",
    title: "Forge",
    body: `${ROLE} Dress them as a civil or aerospace engineer: hardhat or technical vest, practical near-future workwear that fits this body. Bronze-glass hangar or infrastructure workshop, tools in soft bokeh. Believable, not a superhero. No flags. No text.`,
    videoHint: "Hangar light drift. Face locked.",
  },
  {
    category: "Atelier",
    title: "Flight",
    body: `${ROLE} Dress them as a near-future aerospace or commercial pilot: realistic flight uniform, headset optional. Cockpit glass or dusk tarmac of an African aerospace field. Same face through any visor or glasses. No costume helmet covering the face. No flags. No text.`,
    videoHint: "Cockpit glow and a slow push-in. Face locked.",
  },
  {
    category: "Atelier",
    title: "Signal",
    body: `${ROLE} Dress them as a premium software and AI engineer: dark merino or tailored technical knit, quiet luxury, not a neon cyberpunk costume. Computing atelier of warm wood, matte screens and brass. Sophisticated African-future tech. No LED jacket. No flags. No text.`,
    videoHint: "Screen light breathes softly. Identity locked. No neon overload.",
  },
  {
    category: "Atelier",
    title: "Draft",
    body: `${ROLE} Dress them as an architect and urban designer: structured linen or technical wear, tracing tools. Studio with a physical model of laterite and bronze-glass towers, dusk through a window. Drawings stay out of focus with no readable text. No flags.`,
    videoHint: "Window light moves. Face locked. No sharp text.",
  },
  {
    category: "Atelier",
    title: "Solar",
    body: `${ROLE} Dress them as a renewable-energy specialist and solar engineer: technical field shirt, utility vest, believable kit. Golden-hour Sahel solar farm, climate-smart, cinematic. No flags. No text.`,
    videoHint: "Sun flare and cloth. Identity locked.",
  },
  {
    category: "Atelier",
    title: "Press",
    body: `${ROLE} Dress them as a professional field journalist and correspondent: field jacket, camera or recorder, serious, not a costume. Dusk street of a future African capital, warm shop light. No logos. No readable headlines. No flags.`,
    videoHint: "Street light flicker. Face locked. No text.",
  },
  {
    category: "Atelier",
    title: "Bench",
    body: `${ROLE} Dress them as a contemporary African judge: dignified robe with quiet gold-thread trim. Timber court interior, warm lamps, empty walls. No flags, no seals as giant graphics, no readable case names. Same person, same face.`,
    videoHint: "Lamp glow. Identity locked. No flags.",
  },
  {
    category: "Atelier",
    title: "Envoy",
    body: `${ROLE} Dress them as a diplomat: impeccable near-future tailored suit that fits this body. Civic hall of timber, brass and bronze-glass at dusk. No flags, no country names, no maps. Lighting matches the cloth. Same face.`,
    videoHint: "Window light. Face locked. No flags.",
  },
  {
    category: "Atelier",
    title: "Harvest",
    body: `${ROLE} Dress them as an agronomist: practical technical field clothes that fit this person. Climate-smart farm at golden hour, millet or irrigation, solar pumps far behind. Lived-in and sophisticated. No flags. No text.`,
    videoHint: "Warm wind and crops. Identity locked.",
  },
  {
    category: "XR",
    title: "Lunettes",
    body: `${ROLE} ${FACE_CLEAR} ${PRESENCE} They now wear premium mixed-reality glasses or a slim raised visor as a prop — thin frames, warm key light on the same skin. Behind them: Place de la Nation, N’Djamena, gold holographic rings in the dusk sky. ${TCHAD_PLACE} Face readable through the glasses. No logos. No text.`,
    videoHint: "Studio light breathes on the lenses. Face locked. No black visor.",
  },
  {
    category: "XR",
    title: "Salle XR",
    body: `${CLEAN} ${PHOTO_REAL} ${PRESENCE} They now stand in an indoor XR arena under the laterite parabolic vault of a future N’Djamena pavilion — bronze, glass, dusk leaking in, soft spatial wall-light. ${TCHAD_PLACE} Photoreal. No cartoon. No excessive neon. No logos. No text.`,
    videoHint: "Wall-light drifts slowly. Guests stay large. Face locked. No text.",
  },
  {
    category: "XR",
    title: "Jeu",
    body: `${CLEAN} ${PHOTO_REAL} ${PRESENCE} They now stand in a cinematic XR game lobby at a N’Djamena summit: laterite, brass, bronze-glass, a quiet volumetric stage. ${TCHAD_PLACE} Evening clothes that suit this person. Photoreal, not a cartoon. No logos. No text.`,
    videoHint: "Lobby light shimmers. Slow push-in. Face locked. No text.",
  },
  {
    category: "XR",
    title: "Spatial",
    body: `${CLEAN} ${PHOTO_REAL} ${PRESENCE} They now stand on a laterite street of future N’Djamena at blue hour — shop warmth, climate-smart towers, Place de la Nation pylons far behind. Soft mixed-reality gold wireframe panels float beside them, glyphs unreadable. ${TCHAD_PLACE} Same contemporary clothes. No Silicon Valley campus. No logos. No text.`,
    videoHint: "Street light and faint spatial panels drift. Guests large. Face locked.",
  },
  {
    category: "XR",
    title: "Holo",
    body: `${CLEAN} ${PHOTO_REAL} ${PRESENCE} They now stand in a holographic briefing at Place de la Nation, N’Djamena: bronze V, white pylons, volumetric gold light in the sky, civic plaza. ${TCHAD_PLACE} Photoreal gala lighting. No FGI, no UN, no logos, no readable slides. Same face.`,
    videoHint: "Holographic gold light breathes. Identity locked. No logos.",
  },
  {
    category: "XR",
    title: "Visor",
    body: `${ROLE} ${FACE_CLEAR} ${PRESENCE} They now wear a slim gold-rim visor, raised or clear enough that the same eyes stay fully visible. Gold Sahel night or a N’Djamena skyline behind them, warm wind, cinematic dusk. ${TCHAD_PLACE} Photoreal. No blacked-out headset. No text.`,
    videoHint: "Night wind in cloth, visor catchlight. Face locked. No text.",
  },
] as const;

export const PROMPT_RENAMES: Record<string, string> = {
  "Red carpet": "Carpet",
  "Editorial studio": "Studio",
  "Met night": "Gala",
  Astronaut: "Space",
  Superhero: "Hero",
  "Royal court": "Palace",
  "Rain Tokyo": "Rain",
  Tokyo: "Rain",
  "Desert dusk": "Desert",
  "Paris river": "Quay",
  Paris: "Quay",
  "Lagos light": "Pulse",
  Lagos: "Pulse",
  "Dubai gold": "Marina",
  Dubai: "Marina",
  "N'Djamena dusk": "Orbit",
  Globe: "Orbit",
  Arch: "Vault",
  Guard: "Arrival",
  Nation: "Forum",
  "Lake Chad": "Dune",
  Camels: "Dune",
  "Ennedi stone": "Stone",
  Rocks: "Stone",
  "Zakouma sun": "Ridge",
  Hills: "Ridge",
  "Grand Marché": "Hearth",
  Village: "Hearth",
  "Chadian cloth": "Forum",
  Square: "Court",
  "Oil painting": "Painting",
  "Neon night": "Neon",
  "Vintage film": "Film",
  "Ice atelier": "Ice",
};
