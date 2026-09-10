/**
 * @module pragueTransitData
 * @description Static geographic network definitions for Prague Integrated Transport (PID):
 * - Metro network: Line A (Green), Line B (Yellow), Line C (Red), Line D (Blue)
 * - Major iconic tram corridors: Line 22, Line 9, Line 17, Line 42 (Historical)
 * - Major bus routes & connections: Line 119, Line 100 (Airport shuttles)
 * - Vltava river ferries (P1-P6)
 * - Major transfer hubs & stations with depth/elevation metadata
 */

export const PRAGUE_BOUNDS = Object.freeze({
  southwest: { lat: 49.95, lon: 14.20 },
  northeast: { lat: 50.20, lon: 14.75 },
  center: { lat: 50.0875, lon: 14.4213, alt: 350 },
});

export const METRO_COLORS = Object.freeze({
  A: '#009E60', // Emerald Green
  B: '#FFBF00', // Amber Yellow
  C: '#ED1C24', // Crimson Red
  D: '#0072BB', // Sapphire Blue
});

export const TRAM_COLOR = '#DC301B';
export const BUS_COLOR = '#00B5E2';
export const FERRY_COLOR = '#0066CC';
export const TRAIN_COLOR = '#1E3A8A';

/**
 * Metro stations with coordinates, depth (meters below ground), transfer tags, and descriptions.
 */
export const METRO_STATIONS = [
  // ── Line A ─────────────────────────────────────────────────────────────
  { id: 'A_MOT', name: 'Nemocnice Motol', line: 'A', lat: 50.0754, lon: 14.3412, depth: 0, surface: true },
  { id: 'A_PET', name: 'Petřiny', line: 'A', lat: 50.0869, lon: 14.3482, depth: 37 },
  { id: 'A_VEL', name: 'Nádraží Veleslavín', line: 'A', lat: 50.0963, lon: 14.3688, depth: 20, airportTransfer: true },
  { id: 'A_BOR', name: 'Bořislavka', line: 'A', lat: 50.0997, lon: 14.3629, depth: 27 },
  { id: 'A_DEJ', name: 'Dejvická', line: 'A', lat: 50.1005, lon: 14.3942, depth: 11 },
  { id: 'A_HRA', name: 'Hradčanská', line: 'A', lat: 50.0970, lon: 14.4045, depth: 43 },
  { id: 'A_MAL', name: 'Malostranská', line: 'A', lat: 50.0906, lon: 14.4103, depth: 32 },
  { id: 'A_STA', name: 'Staroměstská', line: 'A', lat: 50.0883, lon: 14.4172, depth: 28 },
  { id: 'A_MUS', name: 'Můstek (A)', line: 'A', lat: 50.0838, lon: 14.4239, depth: 29, transfer: 'B' },
  { id: 'A_MUZ', name: 'Muzeum (A)', line: 'A', lat: 50.0797, lon: 14.4308, depth: 34, transfer: 'C' },
  { id: 'A_MIR', name: 'Náměstí Míru', line: 'A', lat: 50.0754, lon: 14.4379, depth: 53, deepest: true },
  { id: 'A_JIP', name: 'Jiřího z Poděbrad', line: 'A', lat: 50.0778, lon: 14.4503, depth: 45 },
  { id: 'A_FLO', name: 'Flora', line: 'A', lat: 50.0781, lon: 14.4614, depth: 26 },
  { id: 'A_ZEL', name: 'Želivského', line: 'A', lat: 50.0784, lon: 14.4742, depth: 27 },
  { id: 'A_STR', name: 'Strašnická', line: 'A', lat: 50.0717, lon: 14.4914, depth: 8 },
  { id: 'A_SKA', name: 'Skalka', line: 'A', lat: 50.0682, lon: 14.5097, depth: 9 },
  { id: 'A_DEP', name: 'Depo Hostivař', line: 'A', lat: 50.0761, lon: 14.5186, depth: 0, surface: true },

  // ── Line B ─────────────────────────────────────────────────────────────
  { id: 'B_ZLI', name: 'Zličín', line: 'B', lat: 50.0527, lon: 14.2906, depth: 0, surface: true },
  { id: 'B_STO', name: 'Stodůlky', line: 'B', lat: 50.0469, lon: 14.3072, depth: 13 },
  { id: 'B_LUK', name: 'Luka', line: 'B', lat: 50.0456, lon: 14.3217, depth: 0, surface: true },
  { id: 'B_LUZ', name: 'Lužiny', line: 'B', lat: 50.0447, lon: 14.3325, depth: 7 },
  { id: 'B_HUR', name: 'Hůrka', line: 'B', lat: 50.0503, lon: 14.3436, depth: 0, surface: true },
  { id: 'B_NOV', name: 'Nové Butovice', line: 'B', lat: 50.0511, lon: 14.3517, depth: 5 },
  { id: 'B_JIN', name: 'Jinonice', line: 'B', lat: 50.0542, lon: 14.3703, depth: 23 },
  { id: 'B_RAD', name: 'Radlická', line: 'B', lat: 50.0578, lon: 14.3878, depth: 10 },
  { id: 'B_SMI', name: 'Smíchovské nádraží', line: 'B', lat: 50.0617, lon: 14.4089, depth: 10, trainTransfer: true },
  { id: 'B_AND', name: 'Anděl', line: 'B', lat: 50.0711, lon: 14.4042, depth: 35 },
  { id: 'B_KAR', name: 'Karlovo náměstí', line: 'B', lat: 50.0761, lon: 14.4178, depth: 40 },
  { id: 'B_NAR', name: 'Národní třída', line: 'B', lat: 50.0819, lon: 14.4189, depth: 39 },
  { id: 'B_MUS', name: 'Můstek (B)', line: 'B', lat: 50.0847, lon: 14.4231, depth: 40, transfer: 'A' },
  { id: 'B_REP', name: 'Náměstí Republiky', line: 'B', lat: 50.0881, lon: 14.4292, depth: 40 },
  { id: 'B_FLO', name: 'Florenc (B)', line: 'B', lat: 50.0911, lon: 14.4389, depth: 39, transfer: 'C' },
  { id: 'B_KRI', name: 'Křižíkova', line: 'B', lat: 50.0922, lon: 14.4522, depth: 35 },
  { id: 'B_INV', name: 'Invalidovna', line: 'B', lat: 50.0964, lon: 14.4633, depth: 20 },
  { id: 'B_PAL', name: 'Palmovka', line: 'B', lat: 50.1039, lon: 14.4744, depth: 12 },
  { id: 'B_CES', name: 'Českomoravská', line: 'B', lat: 50.1067, lon: 14.4925, depth: 26 },
  { id: 'B_VYS', name: 'Vysočanská', line: 'B', lat: 50.1114, lon: 14.5014, depth: 31 },
  { id: 'B_KOL', name: 'Kolbenova', line: 'B', lat: 50.1111, lon: 14.5147, depth: 26 },
  { id: 'B_HLO', name: 'Hloubětín', line: 'B', lat: 50.1072, lon: 14.5367, depth: 26 },
  { id: 'B_RAJ', name: 'Rajská zahrada', line: 'B', lat: 50.1069, lon: 14.5606, depth: 0, surface: true },
  { id: 'B_CER', name: 'Černý Most', line: 'B', lat: 50.1092, lon: 14.5772, depth: 0, surface: true },

  // ── Line C ─────────────────────────────────────────────────────────────
  { id: 'C_LET', name: 'Letňany', line: 'C', lat: 50.1264, lon: 14.5144, depth: 10 },
  { id: 'C_PRO', name: 'Prosek', line: 'C', lat: 50.1192, lon: 14.4989, depth: 11 },
  { id: 'C_STR', name: 'Střížkov', line: 'C', lat: 50.1258, lon: 14.4886, depth: 13 },
  { id: 'C_LAD', name: 'Ládví', line: 'C', lat: 50.1272, lon: 14.4697, depth: 9 },
  { id: 'C_KOB', name: 'Kobylisy', line: 'C', lat: 50.1239, lon: 14.4547, depth: 31 },
  { id: 'C_HOL', name: 'Nádraží Holešovice', line: 'C', lat: 50.1089, lon: 14.4403, depth: 12, trainTransfer: true },
  { id: 'C_VLT', name: 'Vltavská', line: 'C', lat: 50.0997, lon: 14.4389, depth: 21 },
  { id: 'C_FLO', name: 'Florenc (C)', line: 'C', lat: 50.0906, lon: 14.4394, depth: 15, transfer: 'B' },
  { id: 'C_HLN', name: 'Hlavní nádraží', line: 'C', lat: 50.0833, lon: 14.4344, depth: 9, trainTransfer: true },
  { id: 'C_MUZ', name: 'Muzeum (C)', line: 'C', lat: 50.0792, lon: 14.4311, depth: 10, transfer: 'A' },
  { id: 'C_IPP', name: 'I. P. Pavlova', line: 'C', lat: 50.0753, lon: 14.4297, depth: 19 },
  { id: 'C_VYS', name: 'Vyšehrad', line: 'C', lat: 50.0628, lon: 14.4308, depth: 0, bridge: 'Nuselský most' },
  { id: 'C_PRA', name: 'Pražského povstání', line: 'C', lat: 50.0558, lon: 14.4347, depth: 8 },
  { id: 'C_PAN', name: 'Pankrác', line: 'C', lat: 50.0503, lon: 14.4394, depth: 14, futureTransfer: 'D' },
  { id: 'C_BUD', name: 'Budějovická', line: 'C', lat: 50.0442, lon: 14.4489, depth: 9 },
  { id: 'C_KAC', name: 'Kačerov', line: 'C', lat: 50.0336, lon: 14.4608, depth: 4 },
  { id: 'C_ROZ', name: 'Roztyly', line: 'C', lat: 50.0378, lon: 14.4775, depth: 6 },
  { id: 'C_CHO', name: 'Chodov', line: 'C', lat: 50.0311, lon: 14.4914, depth: 10 },
  { id: 'C_OPA', name: 'Opatov', line: 'C', lat: 50.0278, lon: 14.5083, depth: 11 },
  { id: 'C_HAJ', name: 'Háje', line: 'C', lat: 50.0311, lon: 14.5269, depth: 11 },

  // ── Line D (Under Construction) ────────────────────────────────────────
  { id: 'D_MIR', name: 'Náměstí Míru (D)', line: 'D', lat: 50.0754, lon: 14.4379, depth: 55, future: true },
  { id: 'D_NBS', name: 'Náměstí Bratří Synků', line: 'D', lat: 50.0645, lon: 14.4415, depth: 25, future: true },
  { id: 'D_PAN', name: 'Pankrác (D)', line: 'D', lat: 50.0503, lon: 14.4394, depth: 33, future: true },
  { id: 'D_OLB', name: 'Olbrachtova', line: 'D', lat: 50.0435, lon: 14.4385, depth: 31, future: true },
  { id: 'D_KRC', name: 'Nádraží Krč', line: 'D', lat: 50.0335, lon: 14.4421, depth: 0, future: true },
  { id: 'D_NEM', name: 'Nemocnice Krč', line: 'D', lat: 50.0235, lon: 14.4468, depth: 27, future: true },
  { id: 'D_NDV', name: 'Nové Dvory', line: 'D', lat: 50.0152, lon: 14.4502, depth: 33, future: true },
  { id: 'D_LIB', name: 'Libuš', line: 'D', lat: 50.0035, lon: 14.4588, depth: 12, future: true },
  { id: 'D_PIS', name: 'Písnice', line: 'D', lat: 49.9925, lon: 14.4642, depth: 14, future: true },
  { id: 'D_DEP', name: 'Depo Písnice', line: 'D', lat: 49.9835, lon: 14.4715, depth: 0, future: true },
];

/**
 * Ordered station sequences for Metro line polylines (lon, lat, relative depth).
 */
export const METRO_LINES = Object.freeze({
  A: {
    name: 'Metro A (Zelená)',
    color: METRO_COLORS.A,
    stations: METRO_STATIONS.filter((s) => s.line === 'A'),
  },
  B: {
    name: 'Metro B (Žlutá)',
    color: METRO_COLORS.B,
    stations: METRO_STATIONS.filter((s) => s.line === 'B'),
  },
  C: {
    name: 'Metro C (Červená)',
    color: METRO_COLORS.C,
    stations: METRO_STATIONS.filter((s) => s.line === 'C'),
  },
  D: {
    name: 'Metro D (Modrá - Výstavba)',
    color: METRO_COLORS.D,
    stations: METRO_STATIONS.filter((s) => s.line === 'D'),
  },
});

/**
 * Key iconic Tram corridors with stop names and GPS path points.
 */
export const TRAM_LINES = Object.freeze([
  {
    line: '22',
    name: 'Linka 22 (Bílá Hora ⇄ Nádraží Hostivař)',
    color: TRAM_COLOR,
    scenic: true,
    description: 'Nejznámější a nejkrásnější tramvajová trasa Prahou kolem Hradčan, Malé Strany a přes Vltavu.',
    stops: [
      { name: 'Bílá Hora', lat: 50.0768, lon: 14.3235 },
      { name: 'Malovanka', lat: 50.0847, lon: 14.3812 },
      { name: 'Pohořelec', lat: 50.0872, lon: 14.3888 },
      { name: 'Brusnice', lat: 50.0915, lon: 14.3942 },
      { name: 'Pražský hrad', lat: 50.0938, lon: 14.3995 },
      { name: 'Královský letohrádek', lat: 50.0942, lon: 14.4055 },
      { name: 'Malostranská', lat: 50.0906, lon: 14.4103 },
      { name: 'Malostranské náměstí', lat: 50.0881, lon: 14.4042 },
      { name: 'Hellichova', lat: 50.0847, lon: 14.4055 },
      { name: 'Újezd', lat: 50.0817, lon: 14.4049 },
      { name: 'Národní divadlo', lat: 50.0811, lon: 14.4138 },
      { name: 'Národní třída', lat: 50.0819, lon: 14.4189 },
      { name: 'Novoměstská radnice', lat: 50.0784, lon: 14.4215 },
      { name: 'Karlovo náměstí', lat: 50.0761, lon: 14.4178 },
      { name: 'Štěpánská', lat: 50.0762, lon: 14.4252 },
      { name: 'I. P. Pavlova', lat: 50.0753, lon: 14.4297 },
      { name: 'Náměstí Míru', lat: 50.0754, lon: 14.4379 },
      { name: 'Jana Masaryka', lat: 50.0741, lon: 14.4425 },
      { name: 'Krymská', lat: 50.0715, lon: 14.4478 },
      { name: 'Ruská', lat: 50.0705, lon: 14.4532 },
      { name: 'Vršovické náměstí', lat: 50.0695, lon: 14.4585 },
      { name: 'Koh-i-noor', lat: 50.0682, lon: 14.4645 },
      { name: 'Slavia', lat: 50.0674, lon: 14.4735 },
      { name: 'Kubánské náměstí', lat: 50.0671, lon: 14.4789 },
      { name: 'Nádraží Strašnice', lat: 50.0658, lon: 14.4925 },
      { name: 'Radošovická', lat: 50.0645, lon: 14.5015 },
      { name: 'Hostivařská', lat: 50.0552, lon: 14.5242 },
      { name: 'Nádraží Hostivař', lat: 50.0525, lon: 14.5365 },
    ],
  },
  {
    line: '9',
    name: 'Linka 9 (Sídliště Řepy ⇄ Spojovací)',
    color: TRAM_COLOR,
    scenic: false,
    description: 'Páteřní západovýchodní tramvajová tepna přes Anděl, Národní třídu a Václavské náměstí.',
    stops: [
      { name: 'Sídliště Řepy', lat: 50.0658, lon: 14.3055 },
      { name: 'Kotlářka', lat: 50.0695, lon: 14.3615 },
      { name: 'Klamovka', lat: 50.0708, lon: 14.3785 },
      { name: 'Bertramka', lat: 50.0715, lon: 14.3942 },
      { name: 'Anděl', lat: 50.0711, lon: 14.4042 },
      { name: 'Švandovo divadlo', lat: 50.0778, lon: 14.4052 },
      { name: 'Újezd', lat: 50.0817, lon: 14.4049 },
      { name: 'Národní divadlo', lat: 50.0811, lon: 14.4138 },
      { name: 'Národní třída', lat: 50.0819, lon: 14.4189 },
      { name: 'Lazarská', lat: 50.0815, lon: 14.4218 },
      { name: 'Vodičkova', lat: 50.0825, lon: 14.4252 },
      { name: 'Václavské náměstí', lat: 50.0838, lon: 14.4275 },
      { name: 'Jindřišská', lat: 50.0848, lon: 14.4305 },
      { name: 'Hlavní nádraží', lat: 50.0833, lon: 14.4344 },
      { name: 'Husinecká', lat: 50.0845, lon: 14.4445 },
      { name: 'Lipanská', lat: 50.0848, lon: 14.4532 },
      { name: 'Olšanské náměstí', lat: 50.0835, lon: 14.4605 },
      { name: 'Nákladové nádraží Žižkov', lat: 50.0845, lon: 14.4715 },
      { name: 'Biskupcova', lat: 50.0888, lon: 14.4752 },
      { name: 'Ohrada', lat: 50.0905, lon: 14.4785 },
      { name: 'Spojovací', lat: 50.0955, lon: 14.4985 },
    ],
  },
  {
    line: '17',
    name: 'Linka 17 (Levského ⇄ Vozovna Kobylisy)',
    color: TRAM_COLOR,
    scenic: true,
    description: 'Pobřežní trasa podél Vltavy, pod Vyšehradem, kolem Národního divadla a pod Letnou.',
    stops: [
      { name: 'Sídliště Modřany (Levského)', lat: 50.0035, lon: 14.4255 },
      { name: 'Nádraží Braník', lat: 50.0295, lon: 14.4085 },
      { name: 'Dvorce', lat: 50.0485, lon: 14.4155 },
      { name: 'Podolská vodárna', lat: 50.0585, lon: 14.4185 },
      { name: 'Výtoň', lat: 50.0675, lon: 14.4165 },
      { name: 'Palackého náměstí', lat: 50.0735, lon: 14.4148 },
      { name: 'Jiráskovo náměstí', lat: 50.0762, lon: 14.4142 },
      { name: 'Národní divadlo', lat: 50.0811, lon: 14.4138 },
      { name: 'Karlovy lázně', lat: 50.0855, lon: 14.4135 },
      { name: 'Staroměstská', lat: 50.0883, lon: 14.4172 },
      { name: 'Právnická fakulta', lat: 50.0918, lon: 14.4175 },
      { name: 'Čechův most', lat: 50.0935, lon: 14.4178 },
      { name: 'Strossmayerovo náměstí', lat: 50.0995, lon: 14.4342 },
      { name: 'Výstaviště', lat: 50.1052, lon: 14.4325 },
      { name: 'Nádraží Holešovice', lat: 50.1089, lon: 14.4403 },
      { name: 'Trojská', lat: 50.1165, lon: 14.4365 },
      { name: 'Kobylisy', lat: 50.1239, lon: 14.4547 },
      { name: 'Vozovna Kobylisy', lat: 50.1335, lon: 14.4585 },
    ],
  },
  {
    line: '42',
    name: 'Linka 42 (Historická linka)',
    color: '#B45309', // Amber heritage
    scenic: true,
    historical: true,
    description: 'Vyhlídková okružní linka historickými vozy Tatra T1, T2, T3 a vozy z Rakousko-Uherska.',
    stops: [
      { name: 'Dlabačov', lat: 50.0852, lon: 14.3785 },
      { name: 'Pohořelec', lat: 50.0872, lon: 14.3888 },
      { name: 'Pražský hrad', lat: 50.0938, lon: 14.3995 },
      { name: 'Královský letohrádek', lat: 50.0942, lon: 14.4055 },
      { name: 'Malostranská', lat: 50.0906, lon: 14.4103 },
      { name: 'Právnická fakulta', lat: 50.0918, lon: 14.4175 },
      { name: 'Čechův most', lat: 50.0935, lon: 14.4178 },
      { name: 'Dlouhá třída', lat: 50.0915, lon: 14.4285 },
      { name: 'Náměstí Republiky', lat: 50.0881, lon: 14.4292 },
      { name: 'Masarykovo nádraží', lat: 50.0875, lon: 14.4335 },
      { name: 'Jindřišská', lat: 50.0848, lon: 14.4305 },
      { name: 'Václavské náměstí', lat: 50.0838, lon: 14.4275 },
      { name: 'Vodičkova', lat: 50.0825, lon: 14.4252 },
      { name: 'Lazarská', lat: 50.0815, lon: 14.4218 },
      { name: 'Národní třída', lat: 50.0819, lon: 14.4189 },
      { name: 'Národní divadlo', lat: 50.0811, lon: 14.4138 },
      { name: 'Újezd', lat: 50.0817, lon: 14.4049 },
      { name: 'Hellichova', lat: 50.0847, lon: 14.4055 },
      { name: 'Malostranské náměstí', lat: 50.0881, lon: 14.4042 },
    ],
  },
]);

/**
 * Vltava Ferries (Přívozy PID).
 */
export const FERRIES = Object.freeze([
  { id: 'P1', name: 'Přívoz P1: Sedlec ⇄ Zámky', start: { lat: 50.1335, lon: 14.3985 }, end: { lat: 50.1345, lon: 14.4035 } },
  { id: 'P2', name: 'Přívoz P2: V Podbabě ⇄ Podhoří (Zoo)', start: { lat: 50.1165, lon: 14.3935 }, end: { lat: 50.1172, lon: 14.4052 } },
  { id: 'P3', name: 'Přívoz P3: Lihovar ⇄ Dvorce (Žluté lázně)', start: { lat: 50.0515, lon: 14.4085 }, end: { lat: 50.0505, lon: 14.4155 } },
  { id: 'P5', name: 'Přívoz P5: Císařská louka ⇄ Náplavka', start: { lat: 50.0635, lon: 14.4115 }, end: { lat: 50.0675, lon: 14.4152 } },
  { id: 'P6', name: 'Přívoz P6: Lahovičky ⇄ Nádraží Modřany', start: { lat: 50.0015, lon: 14.3985 }, end: { lat: 50.0025, lon: 14.4075 } },
]);
