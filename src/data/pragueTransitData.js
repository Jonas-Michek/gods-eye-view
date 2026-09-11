/**
 * @module pragueTransitData
 * @description Static geographic network definitions for Prague Integrated Transport (PID):
 * - Metro network: Line A (Green), Line B (Yellow), Line C (Red), Line D (Blue)
 * - Major iconic tram corridors: Line 22, Line 9, Line 17, Line 42 (Historical)
 * - Major bus routes & connections: Line 119, Line 100 (Airport shuttles)
 * - Vltava river ferries (P1-P6)
 * - Major transfer hubs & stations with depth/elevation metadata
 */

import { TRAM_TRACK_PATHS } from './pragueTramTracks.js';

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
    line: '1',
    name: "Linka 1 (Výstaviště ⇄ Sídliště Petřiny)",
    color: TRAM_COLOR,
    scenic: false,
    description: "Pravidelná tramvajová linka PID (Výstaviště ⇄ Sídliště Petřiny)",
    path: TRAM_TRACK_PATHS['1'],
    stops: [
      {
            "name": "Výstaviště",
            "lat": 50.104118,
            "lon": 14.431238
      },
      {
            "name": "Výstaviště",
            "lat": 50.104836,
            "lon": 14.432796
      },
      {
            "name": "Nádraží Holešovice",
            "lat": 50.108082,
            "lon": 14.440874
      },
      {
            "name": "Ortenovo náměstí",
            "lat": 50.107609,
            "lon": 14.448573
      },
      {
            "name": "Dělnická",
            "lat": 50.103657,
            "lon": 14.449817
      },
      {
            "name": "Tusarova",
            "lat": 50.100777,
            "lon": 14.450017
      },
      {
            "name": "Holešovická tržnice",
            "lat": 50.098339,
            "lon": 14.444301
      },
      {
            "name": "Vltavská",
            "lat": 50.099228,
            "lon": 14.438122
      },
      {
            "name": "Strossmayerovo náměstí",
            "lat": 50.098881,
            "lon": 14.433692
      },
      {
            "name": "Kamenická",
            "lat": 50.099705,
            "lon": 14.428417
      },
      {
            "name": "Letenské náměstí",
            "lat": 50.100002,
            "lon": 14.423119
      },
      {
            "name": "Korunovační",
            "lat": 50.099571,
            "lon": 14.420175
      },
      {
            "name": "Sparta",
            "lat": 50.098988,
            "lon": 14.416131
      },
      {
            "name": "Hradčanská",
            "lat": 50.09721,
            "lon": 14.403853
      },
      {
            "name": "Prašný most",
            "lat": 50.09473,
            "lon": 14.393871
      },
      {
            "name": "Vozovna Střešovice",
            "lat": 50.093571,
            "lon": 14.389066
      },
      {
            "name": "Sibeliova",
            "lat": 50.092869,
            "lon": 14.383686
      },
      {
            "name": "Ořechovka",
            "lat": 50.092899,
            "lon": 14.379045
      },
      {
            "name": "Baterie",
            "lat": 50.0924,
            "lon": 14.369411
      },
      {
            "name": "Vojenská nemocnice",
            "lat": 50.091778,
            "lon": 14.359811
      },
      {
            "name": "Větrník",
            "lat": 50.089672,
            "lon": 14.350603
      },
      {
            "name": "Petřiny",
            "lat": 50.088131,
            "lon": 14.344474
      },
      {
            "name": "Sídliště Petřiny",
            "lat": 50.086613,
            "lon": 14.339738
      }
],
  },
  {
    line: '2',
    name: "Linka 2 (Albertov ⇄ Sídliště Petřiny)",
    color: TRAM_COLOR,
    scenic: false,
    description: "Pravidelná tramvajová linka PID (Albertov ⇄ Sídliště Petřiny)",
    path: TRAM_TRACK_PATHS['2'],
    stops: [
      {
            "name": "Albertov",
            "lat": 50.068684,
            "lon": 14.420452
      },
      {
            "name": "Výtoň",
            "lat": 50.068123,
            "lon": 14.415007
      },
      {
            "name": "Palackého náměstí",
            "lat": 50.072506,
            "lon": 14.414109
      },
      {
            "name": "Palackého náměstí",
            "lat": 50.073231,
            "lon": 14.415247
      },
      {
            "name": "Karlovo náměstí",
            "lat": 50.075302,
            "lon": 14.419109
      },
      {
            "name": "Novoměstská radnice",
            "lat": 50.077518,
            "lon": 14.419602
      },
      {
            "name": "Národní třída",
            "lat": 50.081688,
            "lon": 14.419497
      },
      {
            "name": "Národní divadlo",
            "lat": 50.081448,
            "lon": 14.414021
      },
      {
            "name": "Karlovy lázně",
            "lat": 50.084763,
            "lon": 14.413747
      },
      {
            "name": "Staroměstská",
            "lat": 50.088459,
            "lon": 14.415547
      },
      {
            "name": "Malostranská",
            "lat": 50.090946,
            "lon": 14.409986
      },
      {
            "name": "Chotkovy sady",
            "lat": 50.095207,
            "lon": 14.409092
      },
      {
            "name": "Hradčanská",
            "lat": 50.09721,
            "lon": 14.403853
      },
      {
            "name": "Prašný most",
            "lat": 50.09473,
            "lon": 14.393871
      },
      {
            "name": "Vozovna Střešovice",
            "lat": 50.093571,
            "lon": 14.389066
      },
      {
            "name": "Sibeliova",
            "lat": 50.092869,
            "lon": 14.383686
      },
      {
            "name": "Ořechovka",
            "lat": 50.092899,
            "lon": 14.379045
      },
      {
            "name": "Baterie",
            "lat": 50.0924,
            "lon": 14.369411
      },
      {
            "name": "Vojenská nemocnice",
            "lat": 50.091778,
            "lon": 14.359811
      },
      {
            "name": "Větrník",
            "lat": 50.089672,
            "lon": 14.350603
      },
      {
            "name": "Petřiny",
            "lat": 50.088131,
            "lon": 14.344474
      },
      {
            "name": "Sídliště Petřiny",
            "lat": 50.086662,
            "lon": 14.339676
      }
],
  },
  {
    line: '3',
    name: "Linka 3 (Březiněveská ⇄ Nádraží Braník)",
    color: TRAM_COLOR,
    scenic: false,
    description: "Pravidelná tramvajová linka PID (Březiněveská ⇄ Nádraží Braník)",
    path: TRAM_TRACK_PATHS['3'],
    stops: [
      {
            "name": "Březiněveská",
            "lat": 50.126026,
            "lon": 14.457125
      },
      {
            "name": "Kobylisy",
            "lat": 50.124397,
            "lon": 14.456026
      },
      {
            "name": "Ke Stírce",
            "lat": 50.122673,
            "lon": 14.455868
      },
      {
            "name": "Okrouhlická",
            "lat": 50.119587,
            "lon": 14.460747
      },
      {
            "name": "Vychovatelna",
            "lat": 50.119045,
            "lon": 14.46463
      },
      {
            "name": "Bulovka",
            "lat": 50.116058,
            "lon": 14.468149
      },
      {
            "name": "Vosmíkových",
            "lat": 50.114388,
            "lon": 14.473574
      },
      {
            "name": "U Kříže",
            "lat": 50.112141,
            "lon": 14.475286
      },
      {
            "name": "Libeňský zámek",
            "lat": 50.108383,
            "lon": 14.472166
      },
      {
            "name": "Divadlo pod Palmovkou",
            "lat": 50.105659,
            "lon": 14.472753
      },
      {
            "name": "Palmovka",
            "lat": 50.102474,
            "lon": 14.473387
      },
      {
            "name": "Invalidovna",
            "lat": 50.097607,
            "lon": 14.464326
      },
      {
            "name": "Urxova",
            "lat": 50.095222,
            "lon": 14.456525
      },
      {
            "name": "Křižíkova",
            "lat": 50.094196,
            "lon": 14.451775
      },
      {
            "name": "Karlínské náměstí",
            "lat": 50.09272,
            "lon": 14.445258
      },
      {
            "name": "Florenc",
            "lat": 50.091244,
            "lon": 14.439114
      },
      {
            "name": "Bílá labuť",
            "lat": 50.090168,
            "lon": 14.435472
      },
      {
            "name": "Masarykovo nádraží",
            "lat": 50.087685,
            "lon": 14.432513
      },
      {
            "name": "Jindřišská",
            "lat": 50.085083,
            "lon": 14.430158
      },
      {
            "name": "Václavské náměstí",
            "lat": 50.081669,
            "lon": 14.425279
      },
      {
            "name": "Vodičkova",
            "lat": 50.079659,
            "lon": 14.422736
      },
      {
            "name": "Lazarská",
            "lat": 50.079239,
            "lon": 14.419922
      },
      {
            "name": "Karlovo náměstí",
            "lat": 50.076477,
            "lon": 14.419256
      },
      {
            "name": "Moráň",
            "lat": 50.074024,
            "lon": 14.418731
      },
      {
            "name": "Palackého náměstí",
            "lat": 50.073265,
            "lon": 14.414462
      },
      {
            "name": "Palackého náměstí",
            "lat": 50.071945,
            "lon": 14.414102
      },
      {
            "name": "Výtoň",
            "lat": 50.067673,
            "lon": 14.414975
      },
      {
            "name": "Podolská vodárna",
            "lat": 50.058414,
            "lon": 14.41935
      },
      {
            "name": "Kublov",
            "lat": 50.054531,
            "lon": 14.418074
      },
      {
            "name": "Dvorce",
            "lat": 50.047184,
            "lon": 14.413954
      },
      {
            "name": "Přístaviště",
            "lat": 50.039738,
            "lon": 14.409231
      },
      {
            "name": "Pobřežní cesta",
            "lat": 50.033604,
            "lon": 14.407943
      },
      {
            "name": "Nádraží Braník",
            "lat": 50.028687,
            "lon": 14.405384
      }
],
  },
  {
    line: '4',
    name: "Linka 4 (Čechovo náměstí ⇄ Radlická)",
    color: TRAM_COLOR,
    scenic: false,
    description: "Pravidelná tramvajová linka PID (Čechovo náměstí ⇄ Radlická)",
    path: TRAM_TRACK_PATHS['4'],
    stops: [
      {
            "name": "Čechovo náměstí",
            "lat": 50.067863,
            "lon": 14.458237
      },
      {
            "name": "Vršovické náměstí",
            "lat": 50.069157,
            "lon": 14.45422
      },
      {
            "name": "Ruská",
            "lat": 50.071686,
            "lon": 14.451129
      },
      {
            "name": "Krymská",
            "lat": 50.07198,
            "lon": 14.446995
      },
      {
            "name": "Jana Masaryka",
            "lat": 50.073513,
            "lon": 14.440681
      },
      {
            "name": "Náměstí Míru",
            "lat": 50.075008,
            "lon": 14.435997
      },
      {
            "name": "I. P. Pavlova",
            "lat": 50.075539,
            "lon": 14.430594
      },
      {
            "name": "Štěpánská",
            "lat": 50.075687,
            "lon": 14.422432
      },
      {
            "name": "Karlovo náměstí",
            "lat": 50.075901,
            "lon": 14.419612
      },
      {
            "name": "Moráň",
            "lat": 50.074024,
            "lon": 14.418731
      },
      {
            "name": "Palackého náměstí",
            "lat": 50.073265,
            "lon": 14.414462
      },
      {
            "name": "Zborovská",
            "lat": 50.07243,
            "lon": 14.407204
      },
      {
            "name": "Anděl",
            "lat": 50.071953,
            "lon": 14.402808
      },
      {
            "name": "Křížová",
            "lat": 50.063004,
            "lon": 14.404693
      },
      {
            "name": "Braunova",
            "lat": 50.061672,
            "lon": 14.401104
      },
      {
            "name": "Laurová",
            "lat": 50.061134,
            "lon": 14.397533
      },
      {
            "name": "Škola Radlice",
            "lat": 50.059387,
            "lon": 14.39286
      },
      {
            "name": "Radlická",
            "lat": 50.059017,
            "lon": 14.389001
      }
],
  },
  {
    line: '5',
    name: "Linka 5 (Nádraží Holešovice ⇄ Slivenec)",
    color: TRAM_COLOR,
    scenic: false,
    description: "Pravidelná tramvajová linka PID (Nádraží Holešovice ⇄ Slivenec)",
    path: TRAM_TRACK_PATHS['5'],
    stops: [
      {
            "name": "Nádraží Holešovice",
            "lat": 50.108082,
            "lon": 14.440874
      },
      {
            "name": "Ortenovo náměstí",
            "lat": 50.107609,
            "lon": 14.448573
      },
      {
            "name": "Dělnická",
            "lat": 50.103657,
            "lon": 14.449817
      },
      {
            "name": "Tusarova",
            "lat": 50.100777,
            "lon": 14.450017
      },
      {
            "name": "Holešovická tržnice",
            "lat": 50.098339,
            "lon": 14.444301
      },
      {
            "name": "Vltavská",
            "lat": 50.099228,
            "lon": 14.438122
      },
      {
            "name": "Vltavská",
            "lat": 50.098469,
            "lon": 14.437243
      },
      {
            "name": "Štvanice",
            "lat": 50.095268,
            "lon": 14.436933
      },
      {
            "name": "Těšnov",
            "lat": 50.091675,
            "lon": 14.43649
      },
      {
            "name": "Bílá labuť",
            "lat": 50.090168,
            "lon": 14.435472
      },
      {
            "name": "Masarykovo nádraží",
            "lat": 50.087685,
            "lon": 14.432513
      },
      {
            "name": "Jindřišská",
            "lat": 50.085083,
            "lon": 14.430158
      },
      {
            "name": "Václavské náměstí",
            "lat": 50.081669,
            "lon": 14.425279
      },
      {
            "name": "Vodičkova",
            "lat": 50.079659,
            "lon": 14.422736
      },
      {
            "name": "Lazarská",
            "lat": 50.079239,
            "lon": 14.419922
      },
      {
            "name": "Myslíkova",
            "lat": 50.078068,
            "lon": 14.418447
      },
      {
            "name": "Jiráskovo náměstí",
            "lat": 50.076458,
            "lon": 14.414103
      },
      {
            "name": "Zborovská",
            "lat": 50.07243,
            "lon": 14.407204
      },
      {
            "name": "Anděl",
            "lat": 50.070976,
            "lon": 14.404552
      },
      {
            "name": "Na Knížecí",
            "lat": 50.067467,
            "lon": 14.406961
      },
      {
            "name": "Plzeňka",
            "lat": 50.064156,
            "lon": 14.408465
      },
      {
            "name": "Smíchovské nádraží",
            "lat": 50.060932,
            "lon": 14.40922
      },
      {
            "name": "Lihovar",
            "lat": 50.051167,
            "lon": 14.409124
      },
      {
            "name": "Zlíchov",
            "lat": 50.045776,
            "lon": 14.407577
      },
      {
            "name": "Hlubočepy",
            "lat": 50.041714,
            "lon": 14.404222
      },
      {
            "name": "Geologická",
            "lat": 50.036545,
            "lon": 14.38819
      },
      {
            "name": "K Barrandovu",
            "lat": 50.035141,
            "lon": 14.382858
      },
      {
            "name": "Chaplinovo náměstí",
            "lat": 50.035149,
            "lon": 14.377353
      },
      {
            "name": "Poliklinika Barrandov",
            "lat": 50.03368,
            "lon": 14.373788
      },
      {
            "name": "Sídliště Barrandov",
            "lat": 50.031464,
            "lon": 14.367784
      },
      {
            "name": "Náměstí Olgy Scheinpflugové",
            "lat": 50.029995,
            "lon": 14.361432
      },
      {
            "name": "Holyně",
            "lat": 50.026726,
            "lon": 14.357549
      },
      {
            "name": "Slivenec",
            "lat": 50.023533,
            "lon": 14.351015
      }
],
  },
  {
    line: '6',
    name: "Linka 6 (Nádraží Holešovice ⇄ Kubánské náměstí)",
    color: TRAM_COLOR,
    scenic: false,
    description: "Pravidelná tramvajová linka PID (Nádraží Holešovice ⇄ Kubánské náměstí)",
    path: TRAM_TRACK_PATHS['6'],
    stops: [
      {
            "name": "Nádraží Holešovice",
            "lat": 50.108181,
            "lon": 14.439998
      },
      {
            "name": "Výstaviště",
            "lat": 50.104401,
            "lon": 14.431912
      },
      {
            "name": "Veletržní palác",
            "lat": 50.102245,
            "lon": 14.432813
      },
      {
            "name": "Strossmayerovo náměstí",
            "lat": 50.09922,
            "lon": 14.433219
      },
      {
            "name": "Nábřeží Kapitána Jaroše",
            "lat": 50.096321,
            "lon": 14.431299
      },
      {
            "name": "Dlouhá třída",
            "lat": 50.091671,
            "lon": 14.42754
      },
      {
            "name": "Náměstí Republiky",
            "lat": 50.088783,
            "lon": 14.430023
      },
      {
            "name": "Masarykovo nádraží",
            "lat": 50.087685,
            "lon": 14.432513
      },
      {
            "name": "Jindřišská",
            "lat": 50.085083,
            "lon": 14.430158
      },
      {
            "name": "Václavské náměstí",
            "lat": 50.081669,
            "lon": 14.425279
      },
      {
            "name": "Vodičkova",
            "lat": 50.079659,
            "lon": 14.422736
      },
      {
            "name": "Lazarská",
            "lat": 50.079239,
            "lon": 14.419922
      },
      {
            "name": "Karlovo náměstí",
            "lat": 50.076477,
            "lon": 14.419256
      },
      {
            "name": "Štěpánská",
            "lat": 50.0756,
            "lon": 14.423319
      },
      {
            "name": "I. P. Pavlova",
            "lat": 50.075405,
            "lon": 14.431689
      },
      {
            "name": "Bruselská",
            "lat": 50.07288,
            "lon": 14.433224
      },
      {
            "name": "Pod Karlovem",
            "lat": 50.068542,
            "lon": 14.432657
      },
      {
            "name": "Nuselské schody",
            "lat": 50.06823,
            "lon": 14.435752
      },
      {
            "name": "Otakarova",
            "lat": 50.065666,
            "lon": 14.440851
      },
      {
            "name": "Nádraží Vršovice",
            "lat": 50.065994,
            "lon": 14.448458
      },
      {
            "name": "Bohemians",
            "lat": 50.066467,
            "lon": 14.456394
      },
      {
            "name": "Koh-i-noor",
            "lat": 50.067692,
            "lon": 14.462255
      },
      {
            "name": "Slavia - Nádraží Eden",
            "lat": 50.069439,
            "lon": 14.470544
      },
      {
            "name": "Kubánské náměstí",
            "lat": 50.070717,
            "lon": 14.476859
      }
],
  },
  {
    line: '7',
    name: "Linka 7 (Kotlářka ⇄ Lehovec)",
    color: TRAM_COLOR,
    scenic: false,
    description: "Pravidelná tramvajová linka PID (Kotlářka ⇄ Lehovec)",
    path: TRAM_TRACK_PATHS['7'],
    stops: [
      {
            "name": "Kotlářka",
            "lat": 50.06995,
            "lon": 14.362046
      },
      {
            "name": "Kotlářka",
            "lat": 50.069565,
            "lon": 14.362923
      },
      {
            "name": "Kavalírka",
            "lat": 50.070034,
            "lon": 14.37067
      },
      {
            "name": "Klamovka",
            "lat": 50.070702,
            "lon": 14.380618
      },
      {
            "name": "U Zvonu",
            "lat": 50.071541,
            "lon": 14.387218
      },
      {
            "name": "Bertramka",
            "lat": 50.072231,
            "lon": 14.393291
      },
      {
            "name": "Anděl",
            "lat": 50.07193,
            "lon": 14.403631
      },
      {
            "name": "Zborovská",
            "lat": 50.072399,
            "lon": 14.408092
      },
      {
            "name": "Palackého náměstí",
            "lat": 50.071945,
            "lon": 14.414102
      },
      {
            "name": "Výtoň",
            "lat": 50.067673,
            "lon": 14.414975
      },
      {
            "name": "Albertov",
            "lat": 50.067822,
            "lon": 14.420298
      },
      {
            "name": "Ostrčilovo náměstí",
            "lat": 50.065071,
            "lon": 14.424358
      },
      {
            "name": "Svatoplukova",
            "lat": 50.065018,
            "lon": 14.430032
      },
      {
            "name": "Divadlo Na Fidlovačce",
            "lat": 50.064648,
            "lon": 14.437134
      },
      {
            "name": "Otakarova",
            "lat": 50.065666,
            "lon": 14.440851
      },
      {
            "name": "Nádraží Vršovice",
            "lat": 50.065994,
            "lon": 14.448458
      },
      {
            "name": "Bohemians",
            "lat": 50.066467,
            "lon": 14.456394
      },
      {
            "name": "Koh-i-noor",
            "lat": 50.067692,
            "lon": 14.462255
      },
      {
            "name": "Slavia - Nádraží Eden",
            "lat": 50.069439,
            "lon": 14.470544
      },
      {
            "name": "Kubánské náměstí",
            "lat": 50.070717,
            "lon": 14.476859
      },
      {
            "name": "Průběžná",
            "lat": 50.071594,
            "lon": 14.486572
      },
      {
            "name": "Strašnická",
            "lat": 50.073017,
            "lon": 14.491093
      },
      {
            "name": "Vozovna Strašnice",
            "lat": 50.075432,
            "lon": 14.489841
      },
      {
            "name": "Vinice",
            "lat": 50.077026,
            "lon": 14.487597
      },
      {
            "name": "Krematorium Strašnice",
            "lat": 50.07732,
            "lon": 14.48472
      },
      {
            "name": "Vinohradské hřbitovy",
            "lat": 50.077793,
            "lon": 14.479644
      },
      {
            "name": "Želivského",
            "lat": 50.078415,
            "lon": 14.474258
      },
      {
            "name": "Želivského",
            "lat": 50.079723,
            "lon": 14.472616
      },
      {
            "name": "Nákladové nádraží Žižkov",
            "lat": 50.085629,
            "lon": 14.470274
      },
      {
            "name": "Biskupcova",
            "lat": 50.0891,
            "lon": 14.468635
      },
      {
            "name": "Krejcárek",
            "lat": 50.095066,
            "lon": 14.474965
      },
      {
            "name": "Palmovka",
            "lat": 50.103901,
            "lon": 14.474776
      },
      {
            "name": "Balabenka",
            "lat": 50.104343,
            "lon": 14.481877
      },
      {
            "name": "Ocelářská",
            "lat": 50.103439,
            "lon": 14.48877
      },
      {
            "name": "Arena Libeň jih",
            "lat": 50.10268,
            "lon": 14.495833
      },
      {
            "name": "Nádraží Libeň",
            "lat": 50.101906,
            "lon": 14.50265
      },
      {
            "name": "Kabešova",
            "lat": 50.102341,
            "lon": 14.50817
      },
      {
            "name": "Podkovářská",
            "lat": 50.102966,
            "lon": 14.514375
      },
      {
            "name": "U Elektry",
            "lat": 50.103474,
            "lon": 14.519443
      },
      {
            "name": "Nademlejnská",
            "lat": 50.103832,
            "lon": 14.525597
      },
      {
            "name": "Starý Hloubětín",
            "lat": 50.104771,
            "lon": 14.530852
      },
      {
            "name": "Hloubětín",
            "lat": 50.106171,
            "lon": 14.537567
      },
      {
            "name": "Sídliště Hloubětín",
            "lat": 50.106506,
            "lon": 14.54343
      },
      {
            "name": "Lehovec",
            "lat": 50.106815,
            "lon": 14.547981
      }
],
  },
  {
    line: '8',
    name: "Linka 8 (Nádraží Podbaba ⇄ Starý Hloubětín)",
    color: TRAM_COLOR,
    scenic: false,
    description: "Pravidelná tramvajová linka PID (Nádraží Podbaba ⇄ Starý Hloubětín)",
    path: TRAM_TRACK_PATHS['8'],
    stops: [
      {
            "name": "Nádraží Podbaba",
            "lat": 50.11116,
            "lon": 14.394035
      },
      {
            "name": "Zelená",
            "lat": 50.107212,
            "lon": 14.394543
      },
      {
            "name": "Lotyšská",
            "lat": 50.103577,
            "lon": 14.394996
      },
      {
            "name": "Vítězné náměstí",
            "lat": 50.099449,
            "lon": 14.395474
      },
      {
            "name": "Hradčanská",
            "lat": 50.097298,
            "lon": 14.404873
      },
      {
            "name": "Sparta",
            "lat": 50.099258,
            "lon": 14.4186
      },
      {
            "name": "Letenské náměstí",
            "lat": 50.099949,
            "lon": 14.424091
      },
      {
            "name": "Kamenická",
            "lat": 50.099571,
            "lon": 14.428855
      },
      {
            "name": "Strossmayerovo náměstí",
            "lat": 50.098919,
            "lon": 14.43278
      },
      {
            "name": "Nábřeží Kapitána Jaroše",
            "lat": 50.096321,
            "lon": 14.431299
      },
      {
            "name": "Dlouhá třída",
            "lat": 50.091671,
            "lon": 14.42754
      },
      {
            "name": "Náměstí Republiky",
            "lat": 50.088783,
            "lon": 14.430023
      },
      {
            "name": "Bílá labuť",
            "lat": 50.090351,
            "lon": 14.436262
      },
      {
            "name": "Florenc",
            "lat": 50.091427,
            "lon": 14.439999
      },
      {
            "name": "Karlínské náměstí",
            "lat": 50.092781,
            "lon": 14.446132
      },
      {
            "name": "Křižíkova",
            "lat": 50.093868,
            "lon": 14.451098
      },
      {
            "name": "Urxova",
            "lat": 50.095234,
            "lon": 14.456994
      },
      {
            "name": "Invalidovna",
            "lat": 50.097832,
            "lon": 14.46519
      },
      {
            "name": "Palmovka",
            "lat": 50.103901,
            "lon": 14.474776
      },
      {
            "name": "Balabenka",
            "lat": 50.104343,
            "lon": 14.481877
      },
      {
            "name": "Ocelářská",
            "lat": 50.103439,
            "lon": 14.48877
      },
      {
            "name": "Arena Libeň jih",
            "lat": 50.10268,
            "lon": 14.495833
      },
      {
            "name": "Nádraží Libeň",
            "lat": 50.101906,
            "lon": 14.50265
      },
      {
            "name": "Kabešova",
            "lat": 50.102341,
            "lon": 14.50817
      },
      {
            "name": "Podkovářská",
            "lat": 50.102966,
            "lon": 14.514375
      },
      {
            "name": "U Elektry",
            "lat": 50.103474,
            "lon": 14.519443
      },
      {
            "name": "Nademlejnská",
            "lat": 50.103832,
            "lon": 14.525597
      },
      {
            "name": "Starý Hloubětín",
            "lat": 50.104019,
            "lon": 14.530208
      }
],
  },
  {
    line: '9',
    name: "Linka 9 (Sídliště Řepy ⇄ Spojovací)",
    color: TRAM_COLOR,
    scenic: false,
    description: "Páteřní západovýchodní tramvajová tepna přes Anděl, Národní třídu a Václavské náměstí.",
    path: TRAM_TRACK_PATHS['9'],
    stops: [
      {
            "name": "Sídliště Řepy",
            "lat": 50.0658,
            "lon": 14.3055
      },
      {
            "name": "Kotlářka",
            "lat": 50.0695,
            "lon": 14.3615
      },
      {
            "name": "Klamovka",
            "lat": 50.0708,
            "lon": 14.3785
      },
      {
            "name": "Bertramka",
            "lat": 50.0715,
            "lon": 14.3942
      },
      {
            "name": "Anděl",
            "lat": 50.0711,
            "lon": 14.4042
      },
      {
            "name": "Švandovo divadlo",
            "lat": 50.0778,
            "lon": 14.4052
      },
      {
            "name": "Újezd",
            "lat": 50.0817,
            "lon": 14.4049
      },
      {
            "name": "Národní divadlo",
            "lat": 50.0811,
            "lon": 14.4138
      },
      {
            "name": "Národní třída",
            "lat": 50.0819,
            "lon": 14.4189
      },
      {
            "name": "Lazarská",
            "lat": 50.0815,
            "lon": 14.4218
      },
      {
            "name": "Vodičkova",
            "lat": 50.0825,
            "lon": 14.4252
      },
      {
            "name": "Václavské náměstí",
            "lat": 50.0838,
            "lon": 14.4275
      },
      {
            "name": "Jindřišská",
            "lat": 50.0848,
            "lon": 14.4305
      },
      {
            "name": "Hlavní nádraží",
            "lat": 50.0833,
            "lon": 14.4344
      },
      {
            "name": "Husinecká",
            "lat": 50.0845,
            "lon": 14.4445
      },
      {
            "name": "Lipanská",
            "lat": 50.0848,
            "lon": 14.4532
      },
      {
            "name": "Olšanské náměstí",
            "lat": 50.0835,
            "lon": 14.4605
      },
      {
            "name": "Nákladové nádraží Žižkov",
            "lat": 50.0845,
            "lon": 14.4715
      },
      {
            "name": "Biskupcova",
            "lat": 50.0888,
            "lon": 14.4752
      },
      {
            "name": "Ohrada",
            "lat": 50.0905,
            "lon": 14.4785
      },
      {
            "name": "Spojovací",
            "lat": 50.0955,
            "lon": 14.4985
      }
],
  },
  {
    line: '10',
    name: "Linka 10 (Sídliště Řepy ⇄ Sídliště Ďáblice)",
    color: TRAM_COLOR,
    scenic: false,
    description: "Pravidelná tramvajová linka PID (Sídliště Řepy ⇄ Sídliště Ďáblice)",
    path: TRAM_TRACK_PATHS['10'],
    stops: [
      {
            "name": "Sídliště Řepy",
            "lat": 50.065144,
            "lon": 14.298904
      },
      {
            "name": "Blatiny",
            "lat": 50.065704,
            "lon": 14.303621
      },
      {
            "name": "Slánská",
            "lat": 50.064468,
            "lon": 14.309402
      },
      {
            "name": "Hlušičkova",
            "lat": 50.064014,
            "lon": 14.31641
      },
      {
            "name": "Krematorium Motol",
            "lat": 50.066227,
            "lon": 14.326459
      },
      {
            "name": "Motol",
            "lat": 50.067673,
            "lon": 14.336522
      },
      {
            "name": "Vozovna Motol",
            "lat": 50.067856,
            "lon": 14.341458
      },
      {
            "name": "Hotel Golf",
            "lat": 50.068031,
            "lon": 14.346667
      },
      {
            "name": "Poštovka",
            "lat": 50.068569,
            "lon": 14.354462
      },
      {
            "name": "Kotlářka",
            "lat": 50.069565,
            "lon": 14.362923
      },
      {
            "name": "Kavalírka",
            "lat": 50.070034,
            "lon": 14.37067
      },
      {
            "name": "Klamovka",
            "lat": 50.070702,
            "lon": 14.380618
      },
      {
            "name": "U Zvonu",
            "lat": 50.071541,
            "lon": 14.387218
      },
      {
            "name": "Bertramka",
            "lat": 50.072231,
            "lon": 14.393291
      },
      {
            "name": "Anděl",
            "lat": 50.07193,
            "lon": 14.403631
      },
      {
            "name": "Zborovská",
            "lat": 50.072399,
            "lon": 14.408092
      },
      {
            "name": "Palackého náměstí",
            "lat": 50.073231,
            "lon": 14.415247
      },
      {
            "name": "Karlovo náměstí",
            "lat": 50.075302,
            "lon": 14.419109
      },
      {
            "name": "Štěpánská",
            "lat": 50.0756,
            "lon": 14.423319
      },
      {
            "name": "I. P. Pavlova",
            "lat": 50.075405,
            "lon": 14.431689
      },
      {
            "name": "Náměstí Míru",
            "lat": 50.074921,
            "lon": 14.436891
      },
      {
            "name": "Šumavská",
            "lat": 50.075291,
            "lon": 14.443556
      },
      {
            "name": "Vinohradská vodárna",
            "lat": 50.075356,
            "lon": 14.450126
      },
      {
            "name": "Perunova",
            "lat": 50.075386,
            "lon": 14.454094
      },
      {
            "name": "Orionka",
            "lat": 50.075504,
            "lon": 14.45895
      },
      {
            "name": "Flora",
            "lat": 50.077881,
            "lon": 14.462435
      },
      {
            "name": "Olšanské hřbitovy",
            "lat": 50.078114,
            "lon": 14.467348
      },
      {
            "name": "Želivského",
            "lat": 50.078331,
            "lon": 14.471611
      },
      {
            "name": "Želivského",
            "lat": 50.079723,
            "lon": 14.472616
      },
      {
            "name": "Nákladové nádraží Žižkov",
            "lat": 50.085629,
            "lon": 14.470274
      },
      {
            "name": "Biskupcova",
            "lat": 50.0891,
            "lon": 14.468635
      },
      {
            "name": "Krejcárek",
            "lat": 50.095066,
            "lon": 14.474965
      },
      {
            "name": "Palmovka",
            "lat": 50.104504,
            "lon": 14.47317
      },
      {
            "name": "Libeňský zámek",
            "lat": 50.108639,
            "lon": 14.472358
      },
      {
            "name": "U Kříže",
            "lat": 50.112373,
            "lon": 14.475762
      },
      {
            "name": "Vosmíkových",
            "lat": 50.114368,
            "lon": 14.473006
      },
      {
            "name": "Bulovka",
            "lat": 50.116543,
            "lon": 14.467761
      },
      {
            "name": "Vychovatelna",
            "lat": 50.119236,
            "lon": 14.463839
      },
      {
            "name": "Okrouhlická",
            "lat": 50.11977,
            "lon": 14.459915
      },
      {
            "name": "Ke Stírce",
            "lat": 50.122986,
            "lon": 14.456153
      },
      {
            "name": "Kobylisy",
            "lat": 50.124851,
            "lon": 14.456576
      },
      {
            "name": "Střelničná",
            "lat": 50.125771,
            "lon": 14.459195
      },
      {
            "name": "Kyselova",
            "lat": 50.126137,
            "lon": 14.463921
      },
      {
            "name": "Ládví",
            "lat": 50.126503,
            "lon": 14.470993
      },
      {
            "name": "Štěpničná",
            "lat": 50.128006,
            "lon": 14.477662
      },
      {
            "name": "Sídliště Ďáblice",
            "lat": 50.132114,
            "lon": 14.479472
      }
],
  },
  {
    line: '11',
    name: "Linka 11 (Spojovací ⇄ Spořilov)",
    color: TRAM_COLOR,
    scenic: false,
    description: "Pravidelná tramvajová linka PID (Spojovací ⇄ Spořilov)",
    path: TRAM_TRACK_PATHS['11'],
    stops: [
      {
            "name": "Spojovací",
            "lat": 50.091843,
            "lon": 14.498599
      },
      {
            "name": "Kněžská luka",
            "lat": 50.092186,
            "lon": 14.492968
      },
      {
            "name": "Chmelnice",
            "lat": 50.092556,
            "lon": 14.486961
      },
      {
            "name": "Strážní",
            "lat": 50.092316,
            "lon": 14.481536
      },
      {
            "name": "Vozovna Žižkov",
            "lat": 50.091682,
            "lon": 14.475441
      },
      {
            "name": "Ohrada",
            "lat": 50.090584,
            "lon": 14.46923
      },
      {
            "name": "Biskupcova",
            "lat": 50.088543,
            "lon": 14.468796
      },
      {
            "name": "Nákladové nádraží Žižkov",
            "lat": 50.084972,
            "lon": 14.470428
      },
      {
            "name": "Mezi Hřbitovy",
            "lat": 50.081657,
            "lon": 14.471742
      },
      {
            "name": "Želivského",
            "lat": 50.078362,
            "lon": 14.47065
      },
      {
            "name": "Olšanské hřbitovy",
            "lat": 50.07814,
            "lon": 14.466456
      },
      {
            "name": "Flora",
            "lat": 50.077919,
            "lon": 14.461516
      },
      {
            "name": "Radhošťská",
            "lat": 50.077652,
            "lon": 14.457279
      },
      {
            "name": "Jiřího z Poděbrad",
            "lat": 50.077255,
            "lon": 14.450471
      },
      {
            "name": "Vinohradská tržnice",
            "lat": 50.077023,
            "lon": 14.442732
      },
      {
            "name": "Italská",
            "lat": 50.078033,
            "lon": 14.436517
      },
      {
            "name": "Muzeum",
            "lat": 50.078838,
            "lon": 14.432457
      },
      {
            "name": "I. P. Pavlova",
            "lat": 50.075733,
            "lon": 14.432039
      },
      {
            "name": "Bruselská",
            "lat": 50.07288,
            "lon": 14.433224
      },
      {
            "name": "Pod Karlovem",
            "lat": 50.068542,
            "lon": 14.432657
      },
      {
            "name": "Nuselské schody",
            "lat": 50.06823,
            "lon": 14.435752
      },
      {
            "name": "Otakarova",
            "lat": 50.065666,
            "lon": 14.440851
      },
      {
            "name": "Náměstí Bratří Synků",
            "lat": 50.064842,
            "lon": 14.441268
      },
      {
            "name": "Horky",
            "lat": 50.061672,
            "lon": 14.445897
      },
      {
            "name": "Pod Jezerkou",
            "lat": 50.05785,
            "lon": 14.450104
      },
      {
            "name": "Michelská",
            "lat": 50.055042,
            "lon": 14.454101
      },
      {
            "name": "Plynárna Michle",
            "lat": 50.056503,
            "lon": 14.465298
      },
      {
            "name": "Chodovská",
            "lat": 50.056847,
            "lon": 14.469275
      },
      {
            "name": "Teplárna Michle",
            "lat": 50.052612,
            "lon": 14.474991
      },
      {
            "name": "Spořilov",
            "lat": 50.05056,
            "lon": 14.482008
      }
],
  },
  {
    line: '12',
    name: "Linka 12 (Sídliště Barrandov ⇄ Lehovec)",
    color: TRAM_COLOR,
    scenic: false,
    description: "Pravidelná tramvajová linka PID (Sídliště Barrandov ⇄ Lehovec)",
    path: TRAM_TRACK_PATHS['12'],
    stops: [
      {
            "name": "Sídliště Barrandov",
            "lat": 50.031467,
            "lon": 14.368736
      },
      {
            "name": "Poliklinika Barrandov",
            "lat": 50.03405,
            "lon": 14.374547
      },
      {
            "name": "Chaplinovo náměstí",
            "lat": 50.034859,
            "lon": 14.37818
      },
      {
            "name": "K Barrandovu",
            "lat": 50.035503,
            "lon": 14.383605
      },
      {
            "name": "Geologická",
            "lat": 50.036316,
            "lon": 14.389074
      },
      {
            "name": "Hlubočepy",
            "lat": 50.042213,
            "lon": 14.404682
      },
      {
            "name": "Zlíchov",
            "lat": 50.04657,
            "lon": 14.408097
      },
      {
            "name": "Lihovar",
            "lat": 50.05143,
            "lon": 14.409225
      },
      {
            "name": "Smíchovské nádraží",
            "lat": 50.061462,
            "lon": 14.409273
      },
      {
            "name": "Plzeňka",
            "lat": 50.063702,
            "lon": 14.408817
      },
      {
            "name": "Na Knížecí",
            "lat": 50.06852,
            "lon": 14.406499
      },
      {
            "name": "Anděl",
            "lat": 50.071712,
            "lon": 14.404213
      },
      {
            "name": "Arbesovo náměstí",
            "lat": 50.076248,
            "lon": 14.404202
      },
      {
            "name": "Švandovo divadlo",
            "lat": 50.078484,
            "lon": 14.404175
      },
      {
            "name": "Újezd",
            "lat": 50.080536,
            "lon": 14.404652
      },
      {
            "name": "Tyršův dům",
            "lat": 50.084187,
            "lon": 14.404471
      },
      {
            "name": "Malostranské náměstí",
            "lat": 50.088272,
            "lon": 14.40448
      },
      {
            "name": "Malostranská",
            "lat": 50.090946,
            "lon": 14.409986
      },
      {
            "name": "Chotkovy sady",
            "lat": 50.095207,
            "lon": 14.409092
      },
      {
            "name": "Sparta",
            "lat": 50.099258,
            "lon": 14.4186
      },
      {
            "name": "Letenské náměstí",
            "lat": 50.099949,
            "lon": 14.424091
      },
      {
            "name": "Kamenická",
            "lat": 50.099571,
            "lon": 14.428855
      },
      {
            "name": "Strossmayerovo náměstí",
            "lat": 50.098919,
            "lon": 14.43278
      },
      {
            "name": "Vltavská",
            "lat": 50.098469,
            "lon": 14.437243
      },
      {
            "name": "Štvanice",
            "lat": 50.095268,
            "lon": 14.436933
      },
      {
            "name": "Těšnov",
            "lat": 50.091675,
            "lon": 14.43649
      },
      {
            "name": "Florenc",
            "lat": 50.091427,
            "lon": 14.439999
      },
      {
            "name": "Karlínské náměstí",
            "lat": 50.092781,
            "lon": 14.446132
      },
      {
            "name": "Křižíkova",
            "lat": 50.093868,
            "lon": 14.451098
      },
      {
            "name": "Urxova",
            "lat": 50.095234,
            "lon": 14.456994
      },
      {
            "name": "Invalidovna",
            "lat": 50.097832,
            "lon": 14.46519
      },
      {
            "name": "Palmovka",
            "lat": 50.103901,
            "lon": 14.474776
      },
      {
            "name": "Balabenka",
            "lat": 50.104343,
            "lon": 14.481877
      },
      {
            "name": "Divadlo Gong",
            "lat": 50.106541,
            "lon": 14.488089
      },
      {
            "name": "Poliklinika Vysočany",
            "lat": 50.108864,
            "lon": 14.494761
      },
      {
            "name": "Nádraží Vysočany",
            "lat": 50.110138,
            "lon": 14.498857
      },
      {
            "name": "Vysočanská",
            "lat": 50.11121,
            "lon": 14.503456
      },
      {
            "name": "Špitálská",
            "lat": 50.110897,
            "lon": 14.505411
      },
      {
            "name": "Poštovská",
            "lat": 50.110561,
            "lon": 14.509474
      },
      {
            "name": "Kolbenova",
            "lat": 50.110565,
            "lon": 14.516114
      },
      {
            "name": "Nový Hloubětín",
            "lat": 50.109291,
            "lon": 14.528078
      },
      {
            "name": "Vozovna Hloubětín",
            "lat": 50.107471,
            "lon": 14.528331
      },
      {
            "name": "Starý Hloubětín",
            "lat": 50.104771,
            "lon": 14.530852
      },
      {
            "name": "Hloubětín",
            "lat": 50.106171,
            "lon": 14.537567
      },
      {
            "name": "Sídliště Hloubětín",
            "lat": 50.106506,
            "lon": 14.54343
      },
      {
            "name": "Lehovec",
            "lat": 50.106815,
            "lon": 14.547981
      }
],
  },
  {
    line: '13',
    name: "Linka 13 (Olšanské hřbitovy ⇄ Zvonařka)",
    color: TRAM_COLOR,
    scenic: false,
    description: "Pravidelná tramvajová linka PID (Olšanské hřbitovy ⇄ Zvonařka)",
    path: TRAM_TRACK_PATHS['13'],
    stops: [
      {
            "name": "Olšanské hřbitovy",
            "lat": 50.07814,
            "lon": 14.466456
      },
      {
            "name": "Flora",
            "lat": 50.077919,
            "lon": 14.461516
      },
      {
            "name": "Radhošťská",
            "lat": 50.077652,
            "lon": 14.457279
      },
      {
            "name": "Jiřího z Poděbrad",
            "lat": 50.077255,
            "lon": 14.450471
      },
      {
            "name": "Vinohradská tržnice",
            "lat": 50.077023,
            "lon": 14.442732
      },
      {
            "name": "Italská",
            "lat": 50.078033,
            "lon": 14.436517
      },
      {
            "name": "Muzeum",
            "lat": 50.078838,
            "lon": 14.432457
      },
      {
            "name": "I. P. Pavlova",
            "lat": 50.075733,
            "lon": 14.432039
      },
      {
            "name": "Bruselská",
            "lat": 50.07288,
            "lon": 14.433224
      },
      {
            "name": "Zvonařka",
            "lat": 50.071148,
            "lon": 14.434822
      }
],
  },
  {
    line: '15',
    name: "Linka 15 (Olšanské hřbitovy ⇄ Sídliště Barrandov)",
    color: TRAM_COLOR,
    scenic: false,
    description: "Pravidelná tramvajová linka PID (Olšanské hřbitovy ⇄ Sídliště Barrandov)",
    path: TRAM_TRACK_PATHS['15'],
    stops: [
      {
            "name": "Olšanské hřbitovy",
            "lat": 50.07814,
            "lon": 14.466456
      },
      {
            "name": "Flora",
            "lat": 50.077919,
            "lon": 14.461516
      },
      {
            "name": "Olšanské náměstí",
            "lat": 50.082489,
            "lon": 14.457467
      },
      {
            "name": "Lipanská",
            "lat": 50.083916,
            "lon": 14.453712
      },
      {
            "name": "Viktoria Žižkov",
            "lat": 50.085091,
            "lon": 14.444494
      },
      {
            "name": "Hlavní nádraží",
            "lat": 50.086082,
            "lon": 14.435114
      },
      {
            "name": "Masarykovo nádraží",
            "lat": 50.088272,
            "lon": 14.432579
      },
      {
            "name": "Náměstí Republiky",
            "lat": 50.088543,
            "lon": 14.429256
      },
      {
            "name": "Dlouhá třída",
            "lat": 50.090538,
            "lon": 14.4279
      },
      {
            "name": "Čechův most",
            "lat": 50.094048,
            "lon": 14.41689
      },
      {
            "name": "Malostranská",
            "lat": 50.090363,
            "lon": 14.410101
      },
      {
            "name": "Malostranské náměstí",
            "lat": 50.087978,
            "lon": 14.404328
      },
      {
            "name": "Pražské Jezulátko",
            "lat": 50.085659,
            "lon": 14.404176
      },
      {
            "name": "Újezd",
            "lat": 50.081676,
            "lon": 14.404444
      },
      {
            "name": "Švandovo divadlo",
            "lat": 50.077969,
            "lon": 14.404121
      },
      {
            "name": "Arbesovo náměstí",
            "lat": 50.075886,
            "lon": 14.403978
      },
      {
            "name": "Anděl",
            "lat": 50.070976,
            "lon": 14.404552
      },
      {
            "name": "Na Knížecí",
            "lat": 50.067467,
            "lon": 14.406961
      },
      {
            "name": "Plzeňka",
            "lat": 50.064156,
            "lon": 14.408465
      },
      {
            "name": "Smíchovské nádraží",
            "lat": 50.060932,
            "lon": 14.40922
      },
      {
            "name": "Lihovar",
            "lat": 50.051167,
            "lon": 14.409124
      },
      {
            "name": "Zlíchov",
            "lat": 50.045776,
            "lon": 14.407577
      },
      {
            "name": "Hlubočepy",
            "lat": 50.041714,
            "lon": 14.404222
      },
      {
            "name": "Geologická",
            "lat": 50.036545,
            "lon": 14.38819
      },
      {
            "name": "K Barrandovu",
            "lat": 50.035141,
            "lon": 14.382858
      },
      {
            "name": "Chaplinovo náměstí",
            "lat": 50.035149,
            "lon": 14.377353
      },
      {
            "name": "Poliklinika Barrandov",
            "lat": 50.03368,
            "lon": 14.373788
      },
      {
            "name": "Sídliště Barrandov",
            "lat": 50.031464,
            "lon": 14.367784
      }
],
  },
  {
    line: '16',
    name: "Linka 16 (Sídliště Řepy ⇄ Ústřední dílny DP)",
    color: TRAM_COLOR,
    scenic: false,
    description: "Pravidelná tramvajová linka PID (Sídliště Řepy ⇄ Ústřední dílny DP)",
    path: TRAM_TRACK_PATHS['16'],
    stops: [
      {
            "name": "Sídliště Řepy",
            "lat": 50.065144,
            "lon": 14.298904
      },
      {
            "name": "Blatiny",
            "lat": 50.065704,
            "lon": 14.303621
      },
      {
            "name": "Slánská",
            "lat": 50.064468,
            "lon": 14.309402
      },
      {
            "name": "Hlušičkova",
            "lat": 50.064014,
            "lon": 14.31641
      },
      {
            "name": "Krematorium Motol",
            "lat": 50.066227,
            "lon": 14.326459
      },
      {
            "name": "Motol",
            "lat": 50.067673,
            "lon": 14.336522
      },
      {
            "name": "Vozovna Motol",
            "lat": 50.067856,
            "lon": 14.341458
      },
      {
            "name": "Hotel Golf",
            "lat": 50.068031,
            "lon": 14.346667
      },
      {
            "name": "Poštovka",
            "lat": 50.068569,
            "lon": 14.354462
      },
      {
            "name": "Kotlářka",
            "lat": 50.069565,
            "lon": 14.362923
      },
      {
            "name": "Kavalírka",
            "lat": 50.070034,
            "lon": 14.37067
      },
      {
            "name": "Klamovka",
            "lat": 50.070702,
            "lon": 14.380618
      },
      {
            "name": "U Zvonu",
            "lat": 50.071541,
            "lon": 14.387218
      },
      {
            "name": "Bertramka",
            "lat": 50.072231,
            "lon": 14.393291
      },
      {
            "name": "Anděl",
            "lat": 50.07193,
            "lon": 14.403631
      },
      {
            "name": "Zborovská",
            "lat": 50.072399,
            "lon": 14.408092
      },
      {
            "name": "Palackého náměstí",
            "lat": 50.073231,
            "lon": 14.415247
      },
      {
            "name": "Karlovo náměstí",
            "lat": 50.075302,
            "lon": 14.419109
      },
      {
            "name": "Štěpánská",
            "lat": 50.0756,
            "lon": 14.423319
      },
      {
            "name": "I. P. Pavlova",
            "lat": 50.075405,
            "lon": 14.431689
      },
      {
            "name": "Náměstí Míru",
            "lat": 50.074921,
            "lon": 14.436891
      },
      {
            "name": "Šumavská",
            "lat": 50.075291,
            "lon": 14.443556
      },
      {
            "name": "Vinohradská vodárna",
            "lat": 50.075356,
            "lon": 14.450126
      },
      {
            "name": "Perunova",
            "lat": 50.075386,
            "lon": 14.454094
      },
      {
            "name": "Orionka",
            "lat": 50.075504,
            "lon": 14.45895
      },
      {
            "name": "Flora",
            "lat": 50.077881,
            "lon": 14.462435
      },
      {
            "name": "Olšanské hřbitovy",
            "lat": 50.078114,
            "lon": 14.467348
      },
      {
            "name": "Želivského",
            "lat": 50.078331,
            "lon": 14.471611
      },
      {
            "name": "Želivského",
            "lat": 50.078201,
            "lon": 14.475204
      },
      {
            "name": "Vinohradské hřbitovy",
            "lat": 50.077667,
            "lon": 14.480542
      },
      {
            "name": "Krematorium Strašnice",
            "lat": 50.077152,
            "lon": 14.485608
      },
      {
            "name": "Vinice",
            "lat": 50.076675,
            "lon": 14.490484
      },
      {
            "name": "Solidarita",
            "lat": 50.076881,
            "lon": 14.494723
      },
      {
            "name": "Zborov - Strašnické divadlo",
            "lat": 50.077282,
            "lon": 14.501081
      },
      {
            "name": "Limuzská",
            "lat": 50.077599,
            "lon": 14.505917
      },
      {
            "name": "Nové Strašnice",
            "lat": 50.07782,
            "lon": 14.511354
      },
      {
            "name": "Depo Hostivař",
            "lat": 50.076252,
            "lon": 14.516887
      },
      {
            "name": "Depo Hostivař",
            "lat": 50.077503,
            "lon": 14.518378
      },
      {
            "name": "Malešická továrna",
            "lat": 50.077183,
            "lon": 14.525237
      },
      {
            "name": "Na Homoli",
            "lat": 50.076138,
            "lon": 14.530669
      },
      {
            "name": "Ústřední dílny DP",
            "lat": 50.074417,
            "lon": 14.532101
      }
],
  },
  {
    line: '17',
    name: "Linka 17 (Levského ⇄ Vozovna Kobylisy)",
    color: TRAM_COLOR,
    scenic: true,
    description: "Pobřežní trasa podél Vltavy, pod Vyšehradem, kolem Národního divadla a pod Letnou.",
    path: TRAM_TRACK_PATHS['17'],
    stops: [
      {
            "name": "Sídliště Modřany (Levského)",
            "lat": 50.0035,
            "lon": 14.4255
      },
      {
            "name": "Nádraží Braník",
            "lat": 50.0295,
            "lon": 14.4085
      },
      {
            "name": "Dvorce",
            "lat": 50.0485,
            "lon": 14.4155
      },
      {
            "name": "Podolská vodárna",
            "lat": 50.0585,
            "lon": 14.4185
      },
      {
            "name": "Výtoň",
            "lat": 50.0675,
            "lon": 14.4165
      },
      {
            "name": "Palackého náměstí",
            "lat": 50.0735,
            "lon": 14.4148
      },
      {
            "name": "Jiráskovo náměstí",
            "lat": 50.0762,
            "lon": 14.4142
      },
      {
            "name": "Národní divadlo",
            "lat": 50.0811,
            "lon": 14.4138
      },
      {
            "name": "Karlovy lázně",
            "lat": 50.0855,
            "lon": 14.4135
      },
      {
            "name": "Staroměstská",
            "lat": 50.0883,
            "lon": 14.4172
      },
      {
            "name": "Právnická fakulta",
            "lat": 50.0918,
            "lon": 14.4175
      },
      {
            "name": "Čechův most",
            "lat": 50.0935,
            "lon": 14.4178
      },
      {
            "name": "Strossmayerovo náměstí",
            "lat": 50.0995,
            "lon": 14.4342
      },
      {
            "name": "Výstaviště",
            "lat": 50.1052,
            "lon": 14.4325
      },
      {
            "name": "Nádraží Holešovice",
            "lat": 50.1089,
            "lon": 14.4403
      },
      {
            "name": "Trojská",
            "lat": 50.1165,
            "lon": 14.4365
      },
      {
            "name": "Kobylisy",
            "lat": 50.1239,
            "lon": 14.4547
      },
      {
            "name": "Vozovna Kobylisy",
            "lat": 50.1335,
            "lon": 14.4585
      }
],
  },
  {
    line: '18',
    name: "Linka 18 (Vozovna Pankrác ⇄ Nádraží Podbaba)",
    color: TRAM_COLOR,
    scenic: false,
    description: "Pravidelná tramvajová linka PID (Vozovna Pankrác ⇄ Nádraží Podbaba)",
    path: TRAM_TRACK_PATHS['18'],
    stops: [
      {
            "name": "Vozovna Pankrác",
            "lat": 50.057072,
            "lon": 14.437892
      },
      {
            "name": "Na Veselí",
            "lat": 50.05624,
            "lon": 14.441221
      },
      {
            "name": "Kotorská",
            "lat": 50.05447,
            "lon": 14.436738
      },
      {
            "name": "Pražského povstání",
            "lat": 50.056503,
            "lon": 14.434615
      },
      {
            "name": "Palouček",
            "lat": 50.061859,
            "lon": 14.4376
      },
      {
            "name": "Nuselská radnice",
            "lat": 50.062855,
            "lon": 14.442273
      },
      {
            "name": "Náměstí Bratří Synků",
            "lat": 50.064716,
            "lon": 14.441409
      },
      {
            "name": "Otakarova",
            "lat": 50.065491,
            "lon": 14.440102
      },
      {
            "name": "Divadlo Na Fidlovačce",
            "lat": 50.064831,
            "lon": 14.436284
      },
      {
            "name": "Svatoplukova",
            "lat": 50.065102,
            "lon": 14.429458
      },
      {
            "name": "Ostrčilovo náměstí",
            "lat": 50.065056,
            "lon": 14.425223
      },
      {
            "name": "Albertov",
            "lat": 50.06728,
            "lon": 14.421481
      },
      {
            "name": "Botanická zahrada",
            "lat": 50.070499,
            "lon": 14.419606
      },
      {
            "name": "Karlovo náměstí",
            "lat": 50.075302,
            "lon": 14.419109
      },
      {
            "name": "Novoměstská radnice",
            "lat": 50.077518,
            "lon": 14.419602
      },
      {
            "name": "Národní třída",
            "lat": 50.081688,
            "lon": 14.419497
      },
      {
            "name": "Národní divadlo",
            "lat": 50.081448,
            "lon": 14.414021
      },
      {
            "name": "Karlovy lázně",
            "lat": 50.084763,
            "lon": 14.413747
      },
      {
            "name": "Staroměstská",
            "lat": 50.088459,
            "lon": 14.415547
      },
      {
            "name": "Malostranská",
            "lat": 50.090946,
            "lon": 14.409986
      },
      {
            "name": "Chotkovy sady",
            "lat": 50.095207,
            "lon": 14.409092
      },
      {
            "name": "Hradčanská",
            "lat": 50.09721,
            "lon": 14.403853
      },
      {
            "name": "Vítězné náměstí",
            "lat": 50.099907,
            "lon": 14.395546
      },
      {
            "name": "Lotyšská",
            "lat": 50.104179,
            "lon": 14.395032
      },
      {
            "name": "Zelená",
            "lat": 50.107792,
            "lon": 14.39456
      },
      {
            "name": "Nádraží Podbaba",
            "lat": 50.111763,
            "lon": 14.394057
      }
],
  },
  {
    line: '19',
    name: "Linka 19 (Pankrác ⇄ Depo Hostivař)",
    color: TRAM_COLOR,
    scenic: false,
    description: "Pravidelná tramvajová linka PID (Pankrác ⇄ Depo Hostivař)",
    path: TRAM_TRACK_PATHS['19'],
    stops: [
      {
            "name": "Pankrác",
            "lat": 50.050995,
            "lon": 14.440292
      },
      {
            "name": "Kotorská",
            "lat": 50.05447,
            "lon": 14.436738
      },
      {
            "name": "Pražského povstání",
            "lat": 50.056503,
            "lon": 14.434615
      },
      {
            "name": "Palouček",
            "lat": 50.061859,
            "lon": 14.4376
      },
      {
            "name": "Nuselská radnice",
            "lat": 50.062855,
            "lon": 14.442273
      },
      {
            "name": "Náměstí Bratří Synků",
            "lat": 50.064716,
            "lon": 14.441409
      },
      {
            "name": "Nádraží Vršovice",
            "lat": 50.065994,
            "lon": 14.448458
      },
      {
            "name": "Bohemians",
            "lat": 50.066467,
            "lon": 14.456394
      },
      {
            "name": "Koh-i-noor",
            "lat": 50.067692,
            "lon": 14.462255
      },
      {
            "name": "Slavia - Nádraží Eden",
            "lat": 50.069439,
            "lon": 14.470544
      },
      {
            "name": "Kubánské náměstí",
            "lat": 50.070717,
            "lon": 14.476859
      },
      {
            "name": "Průběžná",
            "lat": 50.071594,
            "lon": 14.486572
      },
      {
            "name": "Strašnická",
            "lat": 50.073017,
            "lon": 14.491093
      },
      {
            "name": "Vozovna Strašnice",
            "lat": 50.075432,
            "lon": 14.489841
      },
      {
            "name": "Vinice",
            "lat": 50.076675,
            "lon": 14.490484
      },
      {
            "name": "Solidarita",
            "lat": 50.076881,
            "lon": 14.494723
      },
      {
            "name": "Zborov - Strašnické divadlo",
            "lat": 50.077282,
            "lon": 14.501081
      },
      {
            "name": "Limuzská",
            "lat": 50.077599,
            "lon": 14.505917
      },
      {
            "name": "Nové Strašnice",
            "lat": 50.07782,
            "lon": 14.511354
      },
      {
            "name": "Depo Hostivař",
            "lat": 50.07637,
            "lon": 14.516944
      }
],
  },
  {
    line: '20',
    name: "Linka 20 (Dědina ⇄ Sídliště Modřany)",
    color: TRAM_COLOR,
    scenic: false,
    description: "Pravidelná tramvajová linka PID (Dědina ⇄ Sídliště Modřany)",
    path: TRAM_TRACK_PATHS['20'],
    stops: [
      {
            "name": "Dědina",
            "lat": 50.089329,
            "lon": 14.301905
      },
      {
            "name": "Ciolkovského",
            "lat": 50.087997,
            "lon": 14.307127
      },
      {
            "name": "Sídliště Na Dědině",
            "lat": 50.089775,
            "lon": 14.309918
      },
      {
            "name": "Vlastina",
            "lat": 50.091305,
            "lon": 14.31736
      },
      {
            "name": "Divoká Šárka",
            "lat": 50.092602,
            "lon": 14.32361
      },
      {
            "name": "Vozovna Vokovice",
            "lat": 50.092926,
            "lon": 14.330469
      },
      {
            "name": "Nad Džbánem",
            "lat": 50.093945,
            "lon": 14.336719
      },
      {
            "name": "Nádraží Veleslavín",
            "lat": 50.095966,
            "lon": 14.348015
      },
      {
            "name": "Červený Vrch",
            "lat": 50.096905,
            "lon": 14.353188
      },
      {
            "name": "Sídliště Červený Vrch",
            "lat": 50.09798,
            "lon": 14.359188
      },
      {
            "name": "Bořislavka",
            "lat": 50.098534,
            "lon": 14.364305
      },
      {
            "name": "Na Pískách",
            "lat": 50.098957,
            "lon": 14.369692
      },
      {
            "name": "Hadovka",
            "lat": 50.099422,
            "lon": 14.375146
      },
      {
            "name": "Thákurova",
            "lat": 50.100105,
            "lon": 14.387046
      },
      {
            "name": "Dejvická",
            "lat": 50.10033,
            "lon": 14.391483
      },
      {
            "name": "Vítězné náměstí",
            "lat": 50.099449,
            "lon": 14.395474
      },
      {
            "name": "Hradčanská",
            "lat": 50.097298,
            "lon": 14.404873
      },
      {
            "name": "Chotkovy sady",
            "lat": 50.094921,
            "lon": 14.409131
      },
      {
            "name": "Malostranská",
            "lat": 50.090363,
            "lon": 14.410101
      },
      {
            "name": "Malostranské náměstí",
            "lat": 50.087978,
            "lon": 14.404328
      },
      {
            "name": "Pražské Jezulátko",
            "lat": 50.085659,
            "lon": 14.404176
      },
      {
            "name": "Újezd",
            "lat": 50.081676,
            "lon": 14.404444
      },
      {
            "name": "Švandovo divadlo",
            "lat": 50.077969,
            "lon": 14.404121
      },
      {
            "name": "Arbesovo náměstí",
            "lat": 50.075886,
            "lon": 14.403978
      },
      {
            "name": "Anděl",
            "lat": 50.070976,
            "lon": 14.404552
      },
      {
            "name": "Na Knížecí",
            "lat": 50.067467,
            "lon": 14.406961
      },
      {
            "name": "Plzeňka",
            "lat": 50.064156,
            "lon": 14.408465
      },
      {
            "name": "Smíchovské nádraží",
            "lat": 50.060932,
            "lon": 14.40922
      },
      {
            "name": "Lihovar",
            "lat": 50.051167,
            "lon": 14.409124
      },
      {
            "name": "Lihovar",
            "lat": 50.050213,
            "lon": 14.410735
      },
      {
            "name": "Dvorce",
            "lat": 50.047184,
            "lon": 14.413954
      },
      {
            "name": "Přístaviště",
            "lat": 50.039738,
            "lon": 14.409231
      },
      {
            "name": "Pobřežní cesta",
            "lat": 50.033604,
            "lon": 14.407943
      },
      {
            "name": "Nádraží Braník",
            "lat": 50.028763,
            "lon": 14.40472
      },
      {
            "name": "Černý kůň",
            "lat": 50.022785,
            "lon": 14.403572
      },
      {
            "name": "Belárie",
            "lat": 50.012962,
            "lon": 14.401796
      },
      {
            "name": "Modřanská škola",
            "lat": 50.008427,
            "lon": 14.403114
      },
      {
            "name": "Nádraží Modřany",
            "lat": 50.003941,
            "lon": 14.403372
      },
      {
            "name": "Čechova čtvrť",
            "lat": 50.002201,
            "lon": 14.410583
      },
      {
            "name": "Poliklinika Modřany",
            "lat": 50.004795,
            "lon": 14.419573
      },
      {
            "name": "U Libušského potoka",
            "lat": 50.005707,
            "lon": 14.423865
      },
      {
            "name": "Modřanská rokle",
            "lat": 50.006062,
            "lon": 14.429723
      },
      {
            "name": "Sídliště Modřany",
            "lat": 50.005039,
            "lon": 14.433363
      }
],
  },
  {
    line: '21',
    name: "Linka 21 (Slivenec ⇄ Kubánské náměstí)",
    color: TRAM_COLOR,
    scenic: false,
    description: "Pravidelná tramvajová linka PID (Slivenec ⇄ Kubánské náměstí)",
    path: TRAM_TRACK_PATHS['21'],
    stops: [
      {
            "name": "Slivenec",
            "lat": 50.023663,
            "lon": 14.351832
      },
      {
            "name": "Holyně",
            "lat": 50.027184,
            "lon": 14.358238
      },
      {
            "name": "Náměstí Olgy Scheinpflugové",
            "lat": 50.030441,
            "lon": 14.362091
      },
      {
            "name": "Sídliště Barrandov",
            "lat": 50.031467,
            "lon": 14.368736
      },
      {
            "name": "Poliklinika Barrandov",
            "lat": 50.03405,
            "lon": 14.374547
      },
      {
            "name": "Chaplinovo náměstí",
            "lat": 50.034859,
            "lon": 14.37818
      },
      {
            "name": "K Barrandovu",
            "lat": 50.035503,
            "lon": 14.383605
      },
      {
            "name": "Geologická",
            "lat": 50.036316,
            "lon": 14.389074
      },
      {
            "name": "Hlubočepy",
            "lat": 50.042213,
            "lon": 14.404682
      },
      {
            "name": "Zlíchov",
            "lat": 50.04657,
            "lon": 14.408097
      },
      {
            "name": "Lihovar",
            "lat": 50.050213,
            "lon": 14.410735
      },
      {
            "name": "Kublov",
            "lat": 50.054398,
            "lon": 14.418122
      },
      {
            "name": "Podolská vodárna",
            "lat": 50.059887,
            "lon": 14.419362
      },
      {
            "name": "Výtoň",
            "lat": 50.068123,
            "lon": 14.415007
      },
      {
            "name": "Palackého náměstí",
            "lat": 50.072506,
            "lon": 14.414109
      },
      {
            "name": "Palackého náměstí",
            "lat": 50.073231,
            "lon": 14.415247
      },
      {
            "name": "Karlovo náměstí",
            "lat": 50.075302,
            "lon": 14.419109
      },
      {
            "name": "Štěpánská",
            "lat": 50.0756,
            "lon": 14.423319
      },
      {
            "name": "I. P. Pavlova",
            "lat": 50.075405,
            "lon": 14.431689
      },
      {
            "name": "Náměstí Míru",
            "lat": 50.074921,
            "lon": 14.436891
      },
      {
            "name": "Jana Masaryka",
            "lat": 50.073071,
            "lon": 14.441488
      },
      {
            "name": "Krymská",
            "lat": 50.071888,
            "lon": 14.447816
      },
      {
            "name": "Ruská",
            "lat": 50.071251,
            "lon": 14.451302
      },
      {
            "name": "Vršovické náměstí",
            "lat": 50.069035,
            "lon": 14.454879
      },
      {
            "name": "Čechovo náměstí",
            "lat": 50.068066,
            "lon": 14.459471
      },
      {
            "name": "Koh-i-noor",
            "lat": 50.067692,
            "lon": 14.462255
      },
      {
            "name": "Slavia - Nádraží Eden",
            "lat": 50.069439,
            "lon": 14.470544
      },
      {
            "name": "Kubánské náměstí",
            "lat": 50.070717,
            "lon": 14.476859
      }
],
  },
  {
    line: '22',
    name: "Linka 22 (Bílá Hora ⇄ Nádraží Hostivař)",
    color: TRAM_COLOR,
    scenic: true,
    description: "Nejznámější a nejkrásnější tramvajová trasa Prahou kolem Hradčan, Malé Strany a přes Vltavu.",
    path: TRAM_TRACK_PATHS['22'],
    stops: [
      {
            "name": "Bílá Hora",
            "lat": 50.0768,
            "lon": 14.3235
      },
      {
            "name": "Malovanka",
            "lat": 50.0847,
            "lon": 14.3812
      },
      {
            "name": "Pohořelec",
            "lat": 50.0872,
            "lon": 14.3888
      },
      {
            "name": "Brusnice",
            "lat": 50.0915,
            "lon": 14.3942
      },
      {
            "name": "Pražský hrad",
            "lat": 50.0938,
            "lon": 14.3995
      },
      {
            "name": "Královský letohrádek",
            "lat": 50.0942,
            "lon": 14.4055
      },
      {
            "name": "Malostranská",
            "lat": 50.0906,
            "lon": 14.4103
      },
      {
            "name": "Malostranské náměstí",
            "lat": 50.0881,
            "lon": 14.4042
      },
      {
            "name": "Hellichova",
            "lat": 50.0847,
            "lon": 14.4055
      },
      {
            "name": "Újezd",
            "lat": 50.0817,
            "lon": 14.4049
      },
      {
            "name": "Národní divadlo",
            "lat": 50.0811,
            "lon": 14.4138
      },
      {
            "name": "Národní třída",
            "lat": 50.0819,
            "lon": 14.4189
      },
      {
            "name": "Novoměstská radnice",
            "lat": 50.0784,
            "lon": 14.4215
      },
      {
            "name": "Karlovo náměstí",
            "lat": 50.0761,
            "lon": 14.4178
      },
      {
            "name": "Štěpánská",
            "lat": 50.0762,
            "lon": 14.4252
      },
      {
            "name": "I. P. Pavlova",
            "lat": 50.0753,
            "lon": 14.4297
      },
      {
            "name": "Náměstí Míru",
            "lat": 50.0754,
            "lon": 14.4379
      },
      {
            "name": "Jana Masaryka",
            "lat": 50.0741,
            "lon": 14.4425
      },
      {
            "name": "Krymská",
            "lat": 50.0715,
            "lon": 14.4478
      },
      {
            "name": "Ruská",
            "lat": 50.0705,
            "lon": 14.4532
      },
      {
            "name": "Vršovické náměstí",
            "lat": 50.0695,
            "lon": 14.4585
      },
      {
            "name": "Koh-i-noor",
            "lat": 50.0682,
            "lon": 14.4645
      },
      {
            "name": "Slavia",
            "lat": 50.0674,
            "lon": 14.4735
      },
      {
            "name": "Kubánské náměstí",
            "lat": 50.0671,
            "lon": 14.4789
      },
      {
            "name": "Nádraží Strašnice",
            "lat": 50.0658,
            "lon": 14.4925
      },
      {
            "name": "Radošovická",
            "lat": 50.0645,
            "lon": 14.5015
      },
      {
            "name": "Hostivařská",
            "lat": 50.0552,
            "lon": 14.5242
      },
      {
            "name": "Nádraží Hostivař",
            "lat": 50.0525,
            "lon": 14.5365
      }
],
  },
  {
    line: '23',
    name: "Linka 23 (Zvonařka ⇄ Královka)",
    color: TRAM_COLOR,
    scenic: false,
    description: "Pravidelná tramvajová linka PID (Zvonařka ⇄ Královka)",
    path: TRAM_TRACK_PATHS['23'],
    stops: [
      {
            "name": "Zvonařka",
            "lat": 50.070686,
            "lon": 14.434173
      },
      {
            "name": "Bruselská",
            "lat": 50.073132,
            "lon": 14.433302
      },
      {
            "name": "I. P. Pavlova",
            "lat": 50.075539,
            "lon": 14.430594
      },
      {
            "name": "Štěpánská",
            "lat": 50.075687,
            "lon": 14.422432
      },
      {
            "name": "Karlovo náměstí",
            "lat": 50.075901,
            "lon": 14.419612
      },
      {
            "name": "Novoměstská radnice",
            "lat": 50.077518,
            "lon": 14.419602
      },
      {
            "name": "Národní třída",
            "lat": 50.081688,
            "lon": 14.419497
      },
      {
            "name": "Národní divadlo",
            "lat": 50.081448,
            "lon": 14.414021
      },
      {
            "name": "Újezd",
            "lat": 50.081249,
            "lon": 14.405181
      },
      {
            "name": "Tyršův dům",
            "lat": 50.084187,
            "lon": 14.404471
      },
      {
            "name": "Malostranské náměstí",
            "lat": 50.088272,
            "lon": 14.40448
      },
      {
            "name": "Malostranská",
            "lat": 50.090946,
            "lon": 14.409986
      },
      {
            "name": "Královský letohrádek",
            "lat": 50.094265,
            "lon": 14.404529
      },
      {
            "name": "Pražský hrad",
            "lat": 50.093334,
            "lon": 14.398507
      },
      {
            "name": "Brusnice",
            "lat": 50.093002,
            "lon": 14.391259
      },
      {
            "name": "Pohořelec",
            "lat": 50.087898,
            "lon": 14.388129
      },
      {
            "name": "Malovanka",
            "lat": 50.085529,
            "lon": 14.381648
      },
      {
            "name": "Královka",
            "lat": 50.084564,
            "lon": 14.38018
      }
],
  },
  {
    line: '24',
    name: "Linka 24 (Spořilov ⇄ Vozovna Kobylisy)",
    color: TRAM_COLOR,
    scenic: false,
    description: "Pravidelná tramvajová linka PID (Spořilov ⇄ Vozovna Kobylisy)",
    path: TRAM_TRACK_PATHS['24'],
    stops: [
      {
            "name": "Spořilov",
            "lat": 50.050941,
            "lon": 14.482206
      },
      {
            "name": "Teplárna Michle",
            "lat": 50.053028,
            "lon": 14.474371
      },
      {
            "name": "Chodovská",
            "lat": 50.056896,
            "lon": 14.46838
      },
      {
            "name": "Plynárna Michle",
            "lat": 50.056549,
            "lon": 14.464609
      },
      {
            "name": "Michelská",
            "lat": 50.055065,
            "lon": 14.453829
      },
      {
            "name": "Pod Jezerkou",
            "lat": 50.058399,
            "lon": 14.449987
      },
      {
            "name": "Horky",
            "lat": 50.061474,
            "lon": 14.446633
      },
      {
            "name": "Náměstí Bratří Synků",
            "lat": 50.064716,
            "lon": 14.441409
      },
      {
            "name": "Otakarova",
            "lat": 50.065491,
            "lon": 14.440102
      },
      {
            "name": "Divadlo Na Fidlovačce",
            "lat": 50.064831,
            "lon": 14.436284
      },
      {
            "name": "Svatoplukova",
            "lat": 50.065102,
            "lon": 14.429458
      },
      {
            "name": "Ostrčilovo náměstí",
            "lat": 50.065056,
            "lon": 14.425223
      },
      {
            "name": "Albertov",
            "lat": 50.06728,
            "lon": 14.421481
      },
      {
            "name": "Botanická zahrada",
            "lat": 50.070499,
            "lon": 14.419606
      },
      {
            "name": "Karlovo náměstí",
            "lat": 50.075302,
            "lon": 14.419109
      },
      {
            "name": "Novoměstská radnice",
            "lat": 50.077518,
            "lon": 14.419602
      },
      {
            "name": "Lazarská",
            "lat": 50.079067,
            "lon": 14.421011
      },
      {
            "name": "Vodičkova",
            "lat": 50.080036,
            "lon": 14.423432
      },
      {
            "name": "Václavské náměstí",
            "lat": 50.081963,
            "lon": 14.425733
      },
      {
            "name": "Jindřišská",
            "lat": 50.08532,
            "lon": 14.430784
      },
      {
            "name": "Masarykovo nádraží",
            "lat": 50.088272,
            "lon": 14.432579
      },
      {
            "name": "Bílá labuť",
            "lat": 50.090351,
            "lon": 14.436262
      },
      {
            "name": "Florenc",
            "lat": 50.091427,
            "lon": 14.439999
      },
      {
            "name": "Karlínské náměstí",
            "lat": 50.092781,
            "lon": 14.446132
      },
      {
            "name": "Křižíkova",
            "lat": 50.093868,
            "lon": 14.451098
      },
      {
            "name": "Urxova",
            "lat": 50.095234,
            "lon": 14.456994
      },
      {
            "name": "Invalidovna",
            "lat": 50.097832,
            "lon": 14.46519
      },
      {
            "name": "Palmovka",
            "lat": 50.104504,
            "lon": 14.47317
      },
      {
            "name": "Libeňský zámek",
            "lat": 50.108639,
            "lon": 14.472358
      },
      {
            "name": "U Kříže",
            "lat": 50.112373,
            "lon": 14.475762
      },
      {
            "name": "Vosmíkových",
            "lat": 50.114368,
            "lon": 14.473006
      },
      {
            "name": "Bulovka",
            "lat": 50.116543,
            "lon": 14.467761
      },
      {
            "name": "Vychovatelna",
            "lat": 50.119236,
            "lon": 14.463839
      },
      {
            "name": "Okrouhlická",
            "lat": 50.11977,
            "lon": 14.459915
      },
      {
            "name": "Ke Stírce",
            "lat": 50.122986,
            "lon": 14.456153
      },
      {
            "name": "Kobylisy",
            "lat": 50.124851,
            "lon": 14.456576
      },
      {
            "name": "Březiněveská",
            "lat": 50.127033,
            "lon": 14.456717
      },
      {
            "name": "Líbeznická",
            "lat": 50.129101,
            "lon": 14.455501
      },
      {
            "name": "Vozovna Kobylisy",
            "lat": 50.13274,
            "lon": 14.454076
      }
],
  },
  {
    line: '25',
    name: "Linka 25 (Výstaviště ⇄ Bílá Hora)",
    color: TRAM_COLOR,
    scenic: false,
    description: "Pravidelná tramvajová linka PID (Výstaviště ⇄ Bílá Hora)",
    path: TRAM_TRACK_PATHS['25'],
    stops: [
      {
            "name": "Výstaviště",
            "lat": 50.104118,
            "lon": 14.431238
      },
      {
            "name": "Výstaviště",
            "lat": 50.104836,
            "lon": 14.432796
      },
      {
            "name": "Nádraží Holešovice",
            "lat": 50.108082,
            "lon": 14.440874
      },
      {
            "name": "Ortenovo náměstí",
            "lat": 50.107609,
            "lon": 14.448573
      },
      {
            "name": "Dělnická",
            "lat": 50.103657,
            "lon": 14.449817
      },
      {
            "name": "Tusarova",
            "lat": 50.100777,
            "lon": 14.450017
      },
      {
            "name": "Holešovická tržnice",
            "lat": 50.098339,
            "lon": 14.444301
      },
      {
            "name": "Vltavská",
            "lat": 50.099228,
            "lon": 14.438122
      },
      {
            "name": "Strossmayerovo náměstí",
            "lat": 50.098881,
            "lon": 14.433692
      },
      {
            "name": "Kamenická",
            "lat": 50.099705,
            "lon": 14.428417
      },
      {
            "name": "Letenské náměstí",
            "lat": 50.100002,
            "lon": 14.423119
      },
      {
            "name": "Korunovační",
            "lat": 50.099571,
            "lon": 14.420175
      },
      {
            "name": "Sparta",
            "lat": 50.098988,
            "lon": 14.416131
      },
      {
            "name": "Hradčanská",
            "lat": 50.09721,
            "lon": 14.403853
      },
      {
            "name": "Prašný most",
            "lat": 50.09473,
            "lon": 14.393871
      },
      {
            "name": "Vozovna Střešovice",
            "lat": 50.093571,
            "lon": 14.389066
      },
      {
            "name": "Park Maxe van der Stoela",
            "lat": 50.090084,
            "lon": 14.385859
      },
      {
            "name": "Malovanka",
            "lat": 50.085529,
            "lon": 14.381648
      },
      {
            "name": "Marjánka",
            "lat": 50.084553,
            "lon": 14.37536
      },
      {
            "name": "Drinopol",
            "lat": 50.083969,
            "lon": 14.371602
      },
      {
            "name": "U Kaštanu",
            "lat": 50.083679,
            "lon": 14.362874
      },
      {
            "name": "Břevnovský klášter",
            "lat": 50.083202,
            "lon": 14.358542
      },
      {
            "name": "Říčanova",
            "lat": 50.081326,
            "lon": 14.352768
      },
      {
            "name": "Vypich",
            "lat": 50.079739,
            "lon": 14.346678
      },
      {
            "name": "Obora Hvězda",
            "lat": 50.078106,
            "lon": 14.340642
      },
      {
            "name": "Malý Břevnov",
            "lat": 50.076359,
            "lon": 14.333612
      },
      {
            "name": "Bílá Hora",
            "lat": 50.075798,
            "lon": 14.323382
      }
],
  },
  {
    line: '26',
    name: "Linka 26 (Nádraží Hostivař ⇄ Dědina)",
    color: TRAM_COLOR,
    scenic: false,
    description: "Pravidelná tramvajová linka PID (Nádraží Hostivař ⇄ Dědina)",
    path: TRAM_TRACK_PATHS['26'],
    stops: [
      {
            "name": "Nádraží Hostivař",
            "lat": 50.053345,
            "lon": 14.536583
      },
      {
            "name": "Hostivařská",
            "lat": 50.052773,
            "lon": 14.529498
      },
      {
            "name": "Na Groši",
            "lat": 50.052975,
            "lon": 14.524025
      },
      {
            "name": "Obchodní centrum Hostivař",
            "lat": 50.053852,
            "lon": 14.519171
      },
      {
            "name": "Sídliště Zahradní Město",
            "lat": 50.057289,
            "lon": 14.512601
      },
      {
            "name": "Zahradní Město",
            "lat": 50.06078,
            "lon": 14.505138
      },
      {
            "name": "Nádraží Zahradní Město",
            "lat": 50.062298,
            "lon": 14.50424
      },
      {
            "name": "Dubečská",
            "lat": 50.065495,
            "lon": 14.501875
      },
      {
            "name": "Radošovická",
            "lat": 50.06691,
            "lon": 14.496132
      },
      {
            "name": "Staré Strašnice",
            "lat": 50.068249,
            "lon": 14.492912
      },
      {
            "name": "Na Hroudě",
            "lat": 50.070507,
            "lon": 14.4887
      },
      {
            "name": "Strašnická",
            "lat": 50.073017,
            "lon": 14.491093
      },
      {
            "name": "Vozovna Strašnice",
            "lat": 50.075432,
            "lon": 14.489841
      },
      {
            "name": "Vinice",
            "lat": 50.077026,
            "lon": 14.487597
      },
      {
            "name": "Krematorium Strašnice",
            "lat": 50.07732,
            "lon": 14.48472
      },
      {
            "name": "Vinohradské hřbitovy",
            "lat": 50.077793,
            "lon": 14.479644
      },
      {
            "name": "Želivského",
            "lat": 50.078415,
            "lon": 14.474258
      },
      {
            "name": "Želivského",
            "lat": 50.078362,
            "lon": 14.47065
      },
      {
            "name": "Olšanské hřbitovy",
            "lat": 50.07814,
            "lon": 14.466456
      },
      {
            "name": "Flora",
            "lat": 50.077919,
            "lon": 14.461516
      },
      {
            "name": "Olšanské náměstí",
            "lat": 50.082489,
            "lon": 14.457467
      },
      {
            "name": "Lipanská",
            "lat": 50.083916,
            "lon": 14.453712
      },
      {
            "name": "Viktoria Žižkov",
            "lat": 50.085091,
            "lon": 14.444494
      },
      {
            "name": "Hlavní nádraží",
            "lat": 50.086082,
            "lon": 14.435114
      },
      {
            "name": "Masarykovo nádraží",
            "lat": 50.088272,
            "lon": 14.432579
      },
      {
            "name": "Náměstí Republiky",
            "lat": 50.088543,
            "lon": 14.429256
      },
      {
            "name": "Dlouhá třída",
            "lat": 50.090538,
            "lon": 14.4279
      },
      {
            "name": "Strossmayerovo náměstí",
            "lat": 50.098564,
            "lon": 14.433307
      },
      {
            "name": "Kamenická",
            "lat": 50.099705,
            "lon": 14.428417
      },
      {
            "name": "Letenské náměstí",
            "lat": 50.100002,
            "lon": 14.423119
      },
      {
            "name": "Korunovační",
            "lat": 50.099571,
            "lon": 14.420175
      },
      {
            "name": "Sparta",
            "lat": 50.098988,
            "lon": 14.416131
      },
      {
            "name": "Hradčanská",
            "lat": 50.09721,
            "lon": 14.403853
      },
      {
            "name": "Vítězné náměstí",
            "lat": 50.099907,
            "lon": 14.395546
      },
      {
            "name": "Dejvická",
            "lat": 50.100372,
            "lon": 14.390614
      },
      {
            "name": "Thákurova",
            "lat": 50.100113,
            "lon": 14.385889
      },
      {
            "name": "Hadovka",
            "lat": 50.099552,
            "lon": 14.375713
      },
      {
            "name": "Na Pískách",
            "lat": 50.099087,
            "lon": 14.370345
      },
      {
            "name": "Bořislavka",
            "lat": 50.098522,
            "lon": 14.363387
      },
      {
            "name": "Sídliště Červený Vrch",
            "lat": 50.098068,
            "lon": 14.359287
      },
      {
            "name": "Červený Vrch",
            "lat": 50.096821,
            "lon": 14.352312
      },
      {
            "name": "Nádraží Veleslavín",
            "lat": 50.095722,
            "lon": 14.346083
      },
      {
            "name": "Nad Džbánem",
            "lat": 50.094101,
            "lon": 14.337201
      },
      {
            "name": "Vozovna Vokovice",
            "lat": 50.093163,
            "lon": 14.33147
      },
      {
            "name": "Divoká Šárka",
            "lat": 50.092724,
            "lon": 14.32272
      },
      {
            "name": "Vlastina",
            "lat": 50.091217,
            "lon": 14.316519
      },
      {
            "name": "Sídliště Na Dědině",
            "lat": 50.089649,
            "lon": 14.309441
      },
      {
            "name": "Ciolkovského",
            "lat": 50.087879,
            "lon": 14.306657
      },
      {
            "name": "Dědina",
            "lat": 50.089928,
            "lon": 14.301223
      }
],
  },
  {
    line: '31',
    name: "Linka 31 (Vysočanská ⇄ Spojovací)",
    color: TRAM_COLOR,
    scenic: false,
    description: "Pravidelná tramvajová linka PID (Vysočanská ⇄ Spojovací)",
    path: TRAM_TRACK_PATHS['31'],
    stops: [
      {
            "name": "Vysočanská",
            "lat": 50.111504,
            "lon": 14.502682
      },
      {
            "name": "Nádraží Vysočany",
            "lat": 50.110325,
            "lon": 14.499
      },
      {
            "name": "Poliklinika Vysočany",
            "lat": 50.108974,
            "lon": 14.494864
      },
      {
            "name": "Divadlo Gong",
            "lat": 50.106792,
            "lon": 14.488599
      },
      {
            "name": "Balabenka",
            "lat": 50.104755,
            "lon": 14.482805
      },
      {
            "name": "Palmovka",
            "lat": 50.104248,
            "lon": 14.475662
      },
      {
            "name": "Palmovka",
            "lat": 50.102474,
            "lon": 14.473387
      },
      {
            "name": "Krejcárek",
            "lat": 50.094761,
            "lon": 14.474228
      },
      {
            "name": "Ohrada",
            "lat": 50.090672,
            "lon": 14.470092
      },
      {
            "name": "Vozovna Žižkov",
            "lat": 50.091492,
            "lon": 14.474536
      },
      {
            "name": "Strážní",
            "lat": 50.09219,
            "lon": 14.481013
      },
      {
            "name": "Chmelnice",
            "lat": 50.092487,
            "lon": 14.485838
      },
      {
            "name": "Kněžská luka",
            "lat": 50.092148,
            "lon": 14.492482
      },
      {
            "name": "Spojovací",
            "lat": 50.091507,
            "lon": 14.499409
      }
],
  },
  {
    line: '42',
    name: "Linka 42 (Historická linka)",
    color: "#B45309",
    scenic: true,
    historical: true,
    description: "Vyhlídková okružní linka historickými vozy Tatra T1, T2, T3 a vozy z Rakousko-Uherska.",
    path: TRAM_TRACK_PATHS['42'],
    stops: [
      {
            "name": "Dlabačov",
            "lat": 50.0852,
            "lon": 14.3785
      },
      {
            "name": "Pohořelec",
            "lat": 50.0872,
            "lon": 14.3888
      },
      {
            "name": "Pražský hrad",
            "lat": 50.0938,
            "lon": 14.3995
      },
      {
            "name": "Královský letohrádek",
            "lat": 50.0942,
            "lon": 14.4055
      },
      {
            "name": "Malostranská",
            "lat": 50.0906,
            "lon": 14.4103
      },
      {
            "name": "Právnická fakulta",
            "lat": 50.0918,
            "lon": 14.4175
      },
      {
            "name": "Čechův most",
            "lat": 50.0935,
            "lon": 14.4178
      },
      {
            "name": "Dlouhá třída",
            "lat": 50.0915,
            "lon": 14.4285
      },
      {
            "name": "Náměstí Republiky",
            "lat": 50.0881,
            "lon": 14.4292
      },
      {
            "name": "Masarykovo nádraží",
            "lat": 50.0875,
            "lon": 14.4335
      },
      {
            "name": "Jindřišská",
            "lat": 50.0848,
            "lon": 14.4305
      },
      {
            "name": "Václavské náměstí",
            "lat": 50.0838,
            "lon": 14.4275
      },
      {
            "name": "Vodičkova",
            "lat": 50.0825,
            "lon": 14.4252
      },
      {
            "name": "Lazarská",
            "lat": 50.0815,
            "lon": 14.4218
      },
      {
            "name": "Národní třída",
            "lat": 50.0819,
            "lon": 14.4189
      },
      {
            "name": "Národní divadlo",
            "lat": 50.0811,
            "lon": 14.4138
      },
      {
            "name": "Újezd",
            "lat": 50.0817,
            "lon": 14.4049
      },
      {
            "name": "Hellichova",
            "lat": 50.0847,
            "lon": 14.4055
      },
      {
            "name": "Malostranské náměstí",
            "lat": 50.0881,
            "lon": 14.4042
      }
],
  },
  {
    line: '91',
    name: "Linka 91 (Radošovická ⇄ Divoká Šárka)",
    color: "#9333EA",
    scenic: false,
    night: true,
    description: "Noční tramvajová linka (Radošovická ⇄ Divoká Šárka)",
    path: TRAM_TRACK_PATHS['91'],
    stops: [
      {
            "name": "Radošovická",
            "lat": 50.06694,
            "lon": 14.494868
      },
      {
            "name": "Staré Strašnice",
            "lat": 50.068249,
            "lon": 14.492912
      },
      {
            "name": "Na Hroudě",
            "lat": 50.070507,
            "lon": 14.4887
      },
      {
            "name": "Strašnická",
            "lat": 50.073017,
            "lon": 14.491093
      },
      {
            "name": "Vozovna Strašnice",
            "lat": 50.075432,
            "lon": 14.489841
      },
      {
            "name": "Vinice",
            "lat": 50.077026,
            "lon": 14.487597
      },
      {
            "name": "Krematorium Strašnice",
            "lat": 50.07732,
            "lon": 14.48472
      },
      {
            "name": "Vinohradské hřbitovy",
            "lat": 50.077793,
            "lon": 14.479644
      },
      {
            "name": "Želivského",
            "lat": 50.078415,
            "lon": 14.474258
      },
      {
            "name": "Želivského",
            "lat": 50.078362,
            "lon": 14.47065
      },
      {
            "name": "Olšanské hřbitovy",
            "lat": 50.07814,
            "lon": 14.466456
      },
      {
            "name": "Flora",
            "lat": 50.077919,
            "lon": 14.461516
      },
      {
            "name": "Orionka",
            "lat": 50.075615,
            "lon": 14.459496
      },
      {
            "name": "Perunova",
            "lat": 50.075459,
            "lon": 14.454484
      },
      {
            "name": "Vinohradská vodárna",
            "lat": 50.075439,
            "lon": 14.449325
      },
      {
            "name": "Šumavská",
            "lat": 50.075401,
            "lon": 14.444185
      },
      {
            "name": "Náměstí Míru",
            "lat": 50.075008,
            "lon": 14.435997
      },
      {
            "name": "I. P. Pavlova",
            "lat": 50.075539,
            "lon": 14.430594
      },
      {
            "name": "Štěpánská",
            "lat": 50.075687,
            "lon": 14.422432
      },
      {
            "name": "Karlovo náměstí",
            "lat": 50.075901,
            "lon": 14.419612
      },
      {
            "name": "Novoměstská radnice",
            "lat": 50.077518,
            "lon": 14.419602
      },
      {
            "name": "Lazarská",
            "lat": 50.079067,
            "lon": 14.421011
      },
      {
            "name": "Vodičkova",
            "lat": 50.080036,
            "lon": 14.423432
      },
      {
            "name": "Václavské náměstí",
            "lat": 50.081963,
            "lon": 14.425733
      },
      {
            "name": "Jindřišská",
            "lat": 50.08532,
            "lon": 14.430784
      },
      {
            "name": "Masarykovo nádraží",
            "lat": 50.088272,
            "lon": 14.432579
      },
      {
            "name": "Náměstí Republiky",
            "lat": 50.088543,
            "lon": 14.429256
      },
      {
            "name": "Dlouhá třída",
            "lat": 50.090538,
            "lon": 14.4279
      },
      {
            "name": "Strossmayerovo náměstí",
            "lat": 50.098564,
            "lon": 14.433307
      },
      {
            "name": "Kamenická",
            "lat": 50.099705,
            "lon": 14.428417
      },
      {
            "name": "Letenské náměstí",
            "lat": 50.100002,
            "lon": 14.423119
      },
      {
            "name": "Korunovační",
            "lat": 50.099571,
            "lon": 14.420175
      },
      {
            "name": "Sparta",
            "lat": 50.098988,
            "lon": 14.416131
      },
      {
            "name": "Hradčanská",
            "lat": 50.09721,
            "lon": 14.403853
      },
      {
            "name": "Vítězné náměstí",
            "lat": 50.099907,
            "lon": 14.395546
      },
      {
            "name": "Dejvická",
            "lat": 50.100372,
            "lon": 14.390614
      },
      {
            "name": "Thákurova",
            "lat": 50.100113,
            "lon": 14.385889
      },
      {
            "name": "Hadovka",
            "lat": 50.099552,
            "lon": 14.375713
      },
      {
            "name": "Na Pískách",
            "lat": 50.099087,
            "lon": 14.370345
      },
      {
            "name": "Bořislavka",
            "lat": 50.098522,
            "lon": 14.363387
      },
      {
            "name": "Sídliště Červený Vrch",
            "lat": 50.098068,
            "lon": 14.359287
      },
      {
            "name": "Červený Vrch",
            "lat": 50.096821,
            "lon": 14.352312
      },
      {
            "name": "Nádraží Veleslavín",
            "lat": 50.095722,
            "lon": 14.346083
      },
      {
            "name": "Nad Džbánem",
            "lat": 50.094101,
            "lon": 14.337201
      },
      {
            "name": "Vozovna Vokovice",
            "lat": 50.093163,
            "lon": 14.33147
      },
      {
            "name": "Divoká Šárka",
            "lat": 50.092915,
            "lon": 14.325331
      }
],
  },
  {
    line: '92',
    name: "Linka 92 (Levského ⇄ Lehovec)",
    color: "#9333EA",
    scenic: false,
    night: true,
    description: "Noční tramvajová linka (Levského ⇄ Lehovec)",
    path: TRAM_TRACK_PATHS['92'],
    stops: [
      {
            "name": "Levského",
            "lat": 50.005123,
            "lon": 14.436082
      },
      {
            "name": "Sídliště Modřany",
            "lat": 50.00523,
            "lon": 14.432528
      },
      {
            "name": "Modřanská rokle",
            "lat": 50.006416,
            "lon": 14.429029
      },
      {
            "name": "U Libušského potoka",
            "lat": 50.00555,
            "lon": 14.423002
      },
      {
            "name": "Poliklinika Modřany",
            "lat": 50.004589,
            "lon": 14.418749
      },
      {
            "name": "Čechova čtvrť",
            "lat": 50.002239,
            "lon": 14.409697
      },
      {
            "name": "Nádraží Modřany",
            "lat": 50.004581,
            "lon": 14.403307
      },
      {
            "name": "Modřanská škola",
            "lat": 50.009224,
            "lon": 14.403053
      },
      {
            "name": "Belárie",
            "lat": 50.013611,
            "lon": 14.401881
      },
      {
            "name": "Černý kůň",
            "lat": 50.023079,
            "lon": 14.403732
      },
      {
            "name": "Nádraží Braník",
            "lat": 50.029251,
            "lon": 14.405406
      },
      {
            "name": "Pobřežní cesta",
            "lat": 50.034206,
            "lon": 14.407448
      },
      {
            "name": "Přístaviště",
            "lat": 50.040314,
            "lon": 14.409638
      },
      {
            "name": "Dvorce",
            "lat": 50.047726,
            "lon": 14.414384
      },
      {
            "name": "Kublov",
            "lat": 50.054398,
            "lon": 14.418122
      },
      {
            "name": "Podolská vodárna",
            "lat": 50.059887,
            "lon": 14.419362
      },
      {
            "name": "Výtoň",
            "lat": 50.068123,
            "lon": 14.415007
      },
      {
            "name": "Palackého náměstí",
            "lat": 50.072506,
            "lon": 14.414109
      },
      {
            "name": "Palackého náměstí",
            "lat": 50.073231,
            "lon": 14.415247
      },
      {
            "name": "Karlovo náměstí",
            "lat": 50.075302,
            "lon": 14.419109
      },
      {
            "name": "Novoměstská radnice",
            "lat": 50.077518,
            "lon": 14.419602
      },
      {
            "name": "Lazarská",
            "lat": 50.079067,
            "lon": 14.421011
      },
      {
            "name": "Vodičkova",
            "lat": 50.080036,
            "lon": 14.423432
      },
      {
            "name": "Václavské náměstí",
            "lat": 50.081963,
            "lon": 14.425733
      },
      {
            "name": "Jindřišská",
            "lat": 50.08532,
            "lon": 14.430784
      },
      {
            "name": "Masarykovo nádraží",
            "lat": 50.088272,
            "lon": 14.432579
      },
      {
            "name": "Bílá labuť",
            "lat": 50.090351,
            "lon": 14.436262
      },
      {
            "name": "Florenc",
            "lat": 50.091427,
            "lon": 14.439999
      },
      {
            "name": "Karlínské náměstí",
            "lat": 50.092781,
            "lon": 14.446132
      },
      {
            "name": "Křižíkova",
            "lat": 50.093868,
            "lon": 14.451098
      },
      {
            "name": "Urxova",
            "lat": 50.095234,
            "lon": 14.456994
      },
      {
            "name": "Invalidovna",
            "lat": 50.097832,
            "lon": 14.46519
      },
      {
            "name": "Palmovka",
            "lat": 50.103901,
            "lon": 14.474776
      },
      {
            "name": "Balabenka",
            "lat": 50.104343,
            "lon": 14.481877
      },
      {
            "name": "Divadlo Gong",
            "lat": 50.106541,
            "lon": 14.488089
      },
      {
            "name": "Poliklinika Vysočany",
            "lat": 50.108864,
            "lon": 14.494761
      },
      {
            "name": "Nádraží Vysočany",
            "lat": 50.110138,
            "lon": 14.498857
      },
      {
            "name": "Vysočanská",
            "lat": 50.11121,
            "lon": 14.503456
      },
      {
            "name": "Špitálská",
            "lat": 50.110897,
            "lon": 14.505411
      },
      {
            "name": "Poštovská",
            "lat": 50.110561,
            "lon": 14.509474
      },
      {
            "name": "Kolbenova",
            "lat": 50.110565,
            "lon": 14.516114
      },
      {
            "name": "Nový Hloubětín",
            "lat": 50.109291,
            "lon": 14.528078
      },
      {
            "name": "Vozovna Hloubětín",
            "lat": 50.107471,
            "lon": 14.528331
      },
      {
            "name": "Starý Hloubětín",
            "lat": 50.104771,
            "lon": 14.530852
      },
      {
            "name": "Hloubětín",
            "lat": 50.106171,
            "lon": 14.537567
      },
      {
            "name": "Sídliště Hloubětín",
            "lat": 50.106506,
            "lon": 14.54343
      },
      {
            "name": "Lehovec",
            "lat": 50.106815,
            "lon": 14.547981
      }
],
  },
  {
    line: '93',
    name: "Linka 93 (Vozovna Pankrác ⇄ Sídliště Ďáblice)",
    color: "#9333EA",
    scenic: false,
    night: true,
    description: "Noční tramvajová linka (Vozovna Pankrác ⇄ Sídliště Ďáblice)",
    path: TRAM_TRACK_PATHS['93'],
    stops: [
      {
            "name": "Vozovna Pankrác",
            "lat": 50.057072,
            "lon": 14.437892
      },
      {
            "name": "Na Veselí",
            "lat": 50.05624,
            "lon": 14.441221
      },
      {
            "name": "Kotorská",
            "lat": 50.05447,
            "lon": 14.436738
      },
      {
            "name": "Pražského povstání",
            "lat": 50.056503,
            "lon": 14.434615
      },
      {
            "name": "Palouček",
            "lat": 50.061859,
            "lon": 14.4376
      },
      {
            "name": "Nuselská radnice",
            "lat": 50.062855,
            "lon": 14.442273
      },
      {
            "name": "Otakarova",
            "lat": 50.065491,
            "lon": 14.440102
      },
      {
            "name": "Divadlo Na Fidlovačce",
            "lat": 50.064831,
            "lon": 14.436284
      },
      {
            "name": "Svatoplukova",
            "lat": 50.065102,
            "lon": 14.429458
      },
      {
            "name": "Ostrčilovo náměstí",
            "lat": 50.065056,
            "lon": 14.425223
      },
      {
            "name": "Albertov",
            "lat": 50.06728,
            "lon": 14.421481
      },
      {
            "name": "Botanická zahrada",
            "lat": 50.070499,
            "lon": 14.419606
      },
      {
            "name": "Karlovo náměstí",
            "lat": 50.075302,
            "lon": 14.419109
      },
      {
            "name": "Novoměstská radnice",
            "lat": 50.077518,
            "lon": 14.419602
      },
      {
            "name": "Lazarská",
            "lat": 50.080021,
            "lon": 14.419835
      },
      {
            "name": "Národní třída",
            "lat": 50.081688,
            "lon": 14.419497
      },
      {
            "name": "Národní divadlo",
            "lat": 50.081448,
            "lon": 14.414021
      },
      {
            "name": "Karlovy lázně",
            "lat": 50.084763,
            "lon": 14.413747
      },
      {
            "name": "Staroměstská",
            "lat": 50.088459,
            "lon": 14.415547
      },
      {
            "name": "Právnická fakulta",
            "lat": 50.091251,
            "lon": 14.417603
      },
      {
            "name": "Čechův most",
            "lat": 50.094063,
            "lon": 14.417685
      },
      {
            "name": "Strossmayerovo náměstí",
            "lat": 50.098564,
            "lon": 14.433307
      },
      {
            "name": "Veletržní palác",
            "lat": 50.101482,
            "lon": 14.433183
      },
      {
            "name": "Výstaviště",
            "lat": 50.104836,
            "lon": 14.432796
      },
      {
            "name": "Nádraží Holešovice",
            "lat": 50.109966,
            "lon": 14.437506
      },
      {
            "name": "Trojská",
            "lat": 50.116982,
            "lon": 14.433187
      },
      {
            "name": "Nad Trojou",
            "lat": 50.120377,
            "lon": 14.439792
      },
      {
            "name": "Hercovka",
            "lat": 50.121853,
            "lon": 14.453302
      },
      {
            "name": "Ke Stírce",
            "lat": 50.122986,
            "lon": 14.456153
      },
      {
            "name": "Kobylisy",
            "lat": 50.124851,
            "lon": 14.456576
      },
      {
            "name": "Střelničná",
            "lat": 50.125771,
            "lon": 14.459195
      },
      {
            "name": "Kyselova",
            "lat": 50.126137,
            "lon": 14.463921
      },
      {
            "name": "Ládví",
            "lat": 50.126503,
            "lon": 14.470993
      },
      {
            "name": "Štěpničná",
            "lat": 50.128006,
            "lon": 14.477662
      },
      {
            "name": "Sídliště Ďáblice",
            "lat": 50.132114,
            "lon": 14.479472
      }
],
  },
  {
    line: '94',
    name: "Linka 94 (Lehovec ⇄ Slivenec)",
    color: "#9333EA",
    scenic: false,
    night: true,
    description: "Noční tramvajová linka (Lehovec ⇄ Slivenec)",
    path: TRAM_TRACK_PATHS['94'],
    stops: [
      {
            "name": "Lehovec",
            "lat": 50.106884,
            "lon": 14.547227
      },
      {
            "name": "Sídliště Hloubětín",
            "lat": 50.106552,
            "lon": 14.542891
      },
      {
            "name": "Hloubětín",
            "lat": 50.106178,
            "lon": 14.536691
      },
      {
            "name": "Starý Hloubětín",
            "lat": 50.104649,
            "lon": 14.52997
      },
      {
            "name": "Nademlejnská",
            "lat": 50.103851,
            "lon": 14.524666
      },
      {
            "name": "U Elektry",
            "lat": 50.103462,
            "lon": 14.518557
      },
      {
            "name": "Podkovářská",
            "lat": 50.102951,
            "lon": 14.513454
      },
      {
            "name": "Kabešova",
            "lat": 50.102409,
            "lon": 14.508314
      },
      {
            "name": "Nádraží Libeň",
            "lat": 50.102074,
            "lon": 14.501748
      },
      {
            "name": "Arena Libeň jih",
            "lat": 50.103043,
            "lon": 14.493205
      },
      {
            "name": "Ocelářská",
            "lat": 50.103603,
            "lon": 14.48783
      },
      {
            "name": "Balabenka",
            "lat": 50.104233,
            "lon": 14.482921
      },
      {
            "name": "Palmovka",
            "lat": 50.104248,
            "lon": 14.475662
      },
      {
            "name": "Palmovka",
            "lat": 50.102474,
            "lon": 14.473387
      },
      {
            "name": "Invalidovna",
            "lat": 50.097607,
            "lon": 14.464326
      },
      {
            "name": "Urxova",
            "lat": 50.095222,
            "lon": 14.456525
      },
      {
            "name": "Křižíkova",
            "lat": 50.094196,
            "lon": 14.451775
      },
      {
            "name": "Karlínské náměstí",
            "lat": 50.09272,
            "lon": 14.445258
      },
      {
            "name": "Florenc",
            "lat": 50.091244,
            "lon": 14.439114
      },
      {
            "name": "Bílá labuť",
            "lat": 50.090168,
            "lon": 14.435472
      },
      {
            "name": "Masarykovo nádraží",
            "lat": 50.087685,
            "lon": 14.432513
      },
      {
            "name": "Jindřišská",
            "lat": 50.085083,
            "lon": 14.430158
      },
      {
            "name": "Václavské náměstí",
            "lat": 50.081669,
            "lon": 14.425279
      },
      {
            "name": "Vodičkova",
            "lat": 50.079659,
            "lon": 14.422736
      },
      {
            "name": "Lazarská",
            "lat": 50.079239,
            "lon": 14.419922
      },
      {
            "name": "Karlovo náměstí",
            "lat": 50.076477,
            "lon": 14.419256
      },
      {
            "name": "Moráň",
            "lat": 50.074024,
            "lon": 14.418731
      },
      {
            "name": "Palackého náměstí",
            "lat": 50.073265,
            "lon": 14.414462
      },
      {
            "name": "Zborovská",
            "lat": 50.07243,
            "lon": 14.407204
      },
      {
            "name": "Anděl",
            "lat": 50.070976,
            "lon": 14.404552
      },
      {
            "name": "Na Knížecí",
            "lat": 50.067467,
            "lon": 14.406961
      },
      {
            "name": "Plzeňka",
            "lat": 50.064156,
            "lon": 14.408465
      },
      {
            "name": "Smíchovské nádraží",
            "lat": 50.060932,
            "lon": 14.40922
      },
      {
            "name": "Lihovar",
            "lat": 50.051167,
            "lon": 14.409124
      },
      {
            "name": "Zlíchov",
            "lat": 50.045776,
            "lon": 14.407577
      },
      {
            "name": "Hlubočepy",
            "lat": 50.041714,
            "lon": 14.404222
      },
      {
            "name": "Geologická",
            "lat": 50.036545,
            "lon": 14.38819
      },
      {
            "name": "K Barrandovu",
            "lat": 50.035141,
            "lon": 14.382858
      },
      {
            "name": "Chaplinovo náměstí",
            "lat": 50.035149,
            "lon": 14.377353
      },
      {
            "name": "Poliklinika Barrandov",
            "lat": 50.03368,
            "lon": 14.373788
      },
      {
            "name": "Sídliště Barrandov",
            "lat": 50.031464,
            "lon": 14.367784
      },
      {
            "name": "Náměstí Olgy Scheinpflugové",
            "lat": 50.029995,
            "lon": 14.361432
      },
      {
            "name": "Holyně",
            "lat": 50.026726,
            "lon": 14.357549
      },
      {
            "name": "Slivenec",
            "lat": 50.023533,
            "lon": 14.351015
      }
],
  },
  {
    line: '95',
    name: "Linka 95 (Vozovna Kobylisy ⇄ Ústřední dílny DP)",
    color: "#9333EA",
    scenic: false,
    night: true,
    description: "Noční tramvajová linka (Vozovna Kobylisy ⇄ Ústřední dílny DP)",
    path: TRAM_TRACK_PATHS['95'],
    stops: [
      {
            "name": "Vozovna Kobylisy",
            "lat": 50.132809,
            "lon": 14.453547
      },
      {
            "name": "Vozovna Kobylisy",
            "lat": 50.131851,
            "lon": 14.453671
      },
      {
            "name": "Líbeznická",
            "lat": 50.128784,
            "lon": 14.455528
      },
      {
            "name": "Březiněveská",
            "lat": 50.126026,
            "lon": 14.457125
      },
      {
            "name": "Kobylisy",
            "lat": 50.124397,
            "lon": 14.456026
      },
      {
            "name": "Ke Stírce",
            "lat": 50.122673,
            "lon": 14.455868
      },
      {
            "name": "Okrouhlická",
            "lat": 50.119587,
            "lon": 14.460747
      },
      {
            "name": "Vychovatelna",
            "lat": 50.119045,
            "lon": 14.46463
      },
      {
            "name": "Bulovka",
            "lat": 50.116058,
            "lon": 14.468149
      },
      {
            "name": "Vosmíkových",
            "lat": 50.114388,
            "lon": 14.473574
      },
      {
            "name": "U Kříže",
            "lat": 50.112141,
            "lon": 14.475286
      },
      {
            "name": "Libeňský zámek",
            "lat": 50.108383,
            "lon": 14.472166
      },
      {
            "name": "Divadlo pod Palmovkou",
            "lat": 50.105659,
            "lon": 14.472753
      },
      {
            "name": "Palmovka",
            "lat": 50.102474,
            "lon": 14.473387
      },
      {
            "name": "Krejcárek",
            "lat": 50.094761,
            "lon": 14.474228
      },
      {
            "name": "Biskupcova",
            "lat": 50.088543,
            "lon": 14.468796
      },
      {
            "name": "Nákladové nádraží Žižkov",
            "lat": 50.084972,
            "lon": 14.470428
      },
      {
            "name": "Mezi Hřbitovy",
            "lat": 50.081657,
            "lon": 14.471742
      },
      {
            "name": "Želivského",
            "lat": 50.078362,
            "lon": 14.47065
      },
      {
            "name": "Olšanské hřbitovy",
            "lat": 50.07814,
            "lon": 14.466456
      },
      {
            "name": "Flora",
            "lat": 50.077919,
            "lon": 14.461516
      },
      {
            "name": "Olšanské náměstí",
            "lat": 50.082489,
            "lon": 14.457467
      },
      {
            "name": "Lipanská",
            "lat": 50.083916,
            "lon": 14.453712
      },
      {
            "name": "Viktoria Žižkov",
            "lat": 50.085091,
            "lon": 14.444494
      },
      {
            "name": "Hlavní nádraží",
            "lat": 50.086082,
            "lon": 14.435114
      },
      {
            "name": "Jindřišská",
            "lat": 50.085083,
            "lon": 14.430158
      },
      {
            "name": "Václavské náměstí",
            "lat": 50.081669,
            "lon": 14.425279
      },
      {
            "name": "Vodičkova",
            "lat": 50.079659,
            "lon": 14.422736
      },
      {
            "name": "Lazarská",
            "lat": 50.079239,
            "lon": 14.419922
      },
      {
            "name": "Karlovo náměstí",
            "lat": 50.076477,
            "lon": 14.419256
      },
      {
            "name": "Moráň",
            "lat": 50.074024,
            "lon": 14.418731
      },
      {
            "name": "Botanická zahrada",
            "lat": 50.071053,
            "lon": 14.418922
      },
      {
            "name": "Albertov",
            "lat": 50.068684,
            "lon": 14.420452
      },
      {
            "name": "Ostrčilovo náměstí",
            "lat": 50.065071,
            "lon": 14.424358
      },
      {
            "name": "Svatoplukova",
            "lat": 50.065018,
            "lon": 14.430032
      },
      {
            "name": "Divadlo Na Fidlovačce",
            "lat": 50.064648,
            "lon": 14.437134
      },
      {
            "name": "Otakarova",
            "lat": 50.065666,
            "lon": 14.440851
      },
      {
            "name": "Nádraží Vršovice",
            "lat": 50.065994,
            "lon": 14.448458
      },
      {
            "name": "Bohemians",
            "lat": 50.066467,
            "lon": 14.456394
      },
      {
            "name": "Koh-i-noor",
            "lat": 50.067692,
            "lon": 14.462255
      },
      {
            "name": "Slavia - Nádraží Eden",
            "lat": 50.069439,
            "lon": 14.470544
      },
      {
            "name": "Kubánské náměstí",
            "lat": 50.070717,
            "lon": 14.476859
      },
      {
            "name": "Průběžná",
            "lat": 50.071594,
            "lon": 14.486572
      },
      {
            "name": "Strašnická",
            "lat": 50.073017,
            "lon": 14.491093
      },
      {
            "name": "Vozovna Strašnice",
            "lat": 50.075432,
            "lon": 14.489841
      },
      {
            "name": "Vinice",
            "lat": 50.076675,
            "lon": 14.490484
      },
      {
            "name": "Solidarita",
            "lat": 50.076881,
            "lon": 14.494723
      },
      {
            "name": "Zborov - Strašnické divadlo",
            "lat": 50.077282,
            "lon": 14.501081
      },
      {
            "name": "Limuzská",
            "lat": 50.077599,
            "lon": 14.505917
      },
      {
            "name": "Nové Strašnice",
            "lat": 50.07782,
            "lon": 14.511354
      },
      {
            "name": "Depo Hostivař",
            "lat": 50.077503,
            "lon": 14.518378
      },
      {
            "name": "Malešická továrna",
            "lat": 50.077183,
            "lon": 14.525237
      },
      {
            "name": "Na Homoli",
            "lat": 50.076138,
            "lon": 14.530669
      },
      {
            "name": "Ústřední dílny DP",
            "lat": 50.074726,
            "lon": 14.532222
      }
],
  },
  {
    line: '96',
    name: "Linka 96 (Sídliště Petřiny ⇄ Spořilov)",
    color: "#9333EA",
    scenic: false,
    night: true,
    description: "Noční tramvajová linka (Sídliště Petřiny ⇄ Spořilov)",
    path: TRAM_TRACK_PATHS['96'],
    stops: [
      {
            "name": "Sídliště Petřiny",
            "lat": 50.086975,
            "lon": 14.339774
      },
      {
            "name": "Petřiny",
            "lat": 50.088257,
            "lon": 14.345339
      },
      {
            "name": "Větrník",
            "lat": 50.089752,
            "lon": 14.351194
      },
      {
            "name": "Vojenská nemocnice",
            "lat": 50.091736,
            "lon": 14.360301
      },
      {
            "name": "Baterie",
            "lat": 50.092445,
            "lon": 14.369894
      },
      {
            "name": "Ořechovka",
            "lat": 50.092838,
            "lon": 14.379548
      },
      {
            "name": "Sibeliova",
            "lat": 50.092781,
            "lon": 14.384204
      },
      {
            "name": "Vozovna Střešovice",
            "lat": 50.093895,
            "lon": 14.389961
      },
      {
            "name": "Prašný most",
            "lat": 50.094841,
            "lon": 14.395885
      },
      {
            "name": "Hradčanská",
            "lat": 50.097298,
            "lon": 14.404873
      },
      {
            "name": "Sparta",
            "lat": 50.099258,
            "lon": 14.4186
      },
      {
            "name": "Letenské náměstí",
            "lat": 50.099949,
            "lon": 14.424091
      },
      {
            "name": "Kamenická",
            "lat": 50.099571,
            "lon": 14.428855
      },
      {
            "name": "Strossmayerovo náměstí",
            "lat": 50.098919,
            "lon": 14.43278
      },
      {
            "name": "Nábřeží Kapitána Jaroše",
            "lat": 50.096321,
            "lon": 14.431299
      },
      {
            "name": "Dlouhá třída",
            "lat": 50.091671,
            "lon": 14.42754
      },
      {
            "name": "Náměstí Republiky",
            "lat": 50.088783,
            "lon": 14.430023
      },
      {
            "name": "Masarykovo nádraží",
            "lat": 50.087685,
            "lon": 14.432513
      },
      {
            "name": "Jindřišská",
            "lat": 50.085083,
            "lon": 14.430158
      },
      {
            "name": "Václavské náměstí",
            "lat": 50.081669,
            "lon": 14.425279
      },
      {
            "name": "Vodičkova",
            "lat": 50.079659,
            "lon": 14.422736
      },
      {
            "name": "Lazarská",
            "lat": 50.079239,
            "lon": 14.419922
      },
      {
            "name": "Karlovo náměstí",
            "lat": 50.076477,
            "lon": 14.419256
      },
      {
            "name": "Štěpánská",
            "lat": 50.0756,
            "lon": 14.423319
      },
      {
            "name": "I. P. Pavlova",
            "lat": 50.075405,
            "lon": 14.431689
      },
      {
            "name": "Bruselská",
            "lat": 50.07288,
            "lon": 14.433224
      },
      {
            "name": "Pod Karlovem",
            "lat": 50.068542,
            "lon": 14.432657
      },
      {
            "name": "Nuselské schody",
            "lat": 50.06823,
            "lon": 14.435752
      },
      {
            "name": "Otakarova",
            "lat": 50.065666,
            "lon": 14.440851
      },
      {
            "name": "Horky",
            "lat": 50.061672,
            "lon": 14.445897
      },
      {
            "name": "Pod Jezerkou",
            "lat": 50.05785,
            "lon": 14.450104
      },
      {
            "name": "Michelská",
            "lat": 50.055042,
            "lon": 14.454101
      },
      {
            "name": "Plynárna Michle",
            "lat": 50.056503,
            "lon": 14.465298
      },
      {
            "name": "Chodovská",
            "lat": 50.056847,
            "lon": 14.469275
      },
      {
            "name": "Teplárna Michle",
            "lat": 50.052612,
            "lon": 14.474991
      },
      {
            "name": "Spořilov",
            "lat": 50.05056,
            "lon": 14.482008
      }
],
  },
  {
    line: '97',
    name: "Linka 97 (Bílá Hora ⇄ Nádraží Hostivař)",
    color: "#9333EA",
    scenic: false,
    night: true,
    description: "Noční tramvajová linka (Bílá Hora ⇄ Nádraží Hostivař)",
    path: TRAM_TRACK_PATHS['97'],
    stops: [
      {
            "name": "Bílá Hora",
            "lat": 50.075565,
            "lon": 14.322862
      },
      {
            "name": "Malý Břevnov",
            "lat": 50.076,
            "lon": 14.331835
      },
      {
            "name": "Obora Hvězda",
            "lat": 50.07827,
            "lon": 14.341566
      },
      {
            "name": "Vypich",
            "lat": 50.079842,
            "lon": 14.34757
      },
      {
            "name": "Říčanova",
            "lat": 50.081383,
            "lon": 14.353228
      },
      {
            "name": "Břevnovský klášter",
            "lat": 50.083179,
            "lon": 14.35901
      },
      {
            "name": "U Kaštanu",
            "lat": 50.083626,
            "lon": 14.36335
      },
      {
            "name": "Drinopol",
            "lat": 50.083897,
            "lon": 14.370555
      },
      {
            "name": "Marjánka",
            "lat": 50.084549,
            "lon": 14.375813
      },
      {
            "name": "Malovanka",
            "lat": 50.085594,
            "lon": 14.382504
      },
      {
            "name": "Park Maxe van der Stoela",
            "lat": 50.090679,
            "lon": 14.385545
      },
      {
            "name": "Vozovna Střešovice",
            "lat": 50.093895,
            "lon": 14.389961
      },
      {
            "name": "Prašný most",
            "lat": 50.094841,
            "lon": 14.395885
      },
      {
            "name": "Hradčanská",
            "lat": 50.097298,
            "lon": 14.404873
      },
      {
            "name": "Chotkovy sady",
            "lat": 50.094921,
            "lon": 14.409131
      },
      {
            "name": "Malostranská",
            "lat": 50.090363,
            "lon": 14.410101
      },
      {
            "name": "Malostranské náměstí",
            "lat": 50.087978,
            "lon": 14.404328
      },
      {
            "name": "Pražské Jezulátko",
            "lat": 50.085659,
            "lon": 14.404176
      },
      {
            "name": "Újezd",
            "lat": 50.081676,
            "lon": 14.404444
      },
      {
            "name": "Národní divadlo",
            "lat": 50.081413,
            "lon": 14.414886
      },
      {
            "name": "Národní třída",
            "lat": 50.081158,
            "lon": 14.419593
      },
      {
            "name": "Lazarská",
            "lat": 50.07938,
            "lon": 14.419519
      },
      {
            "name": "Karlovo náměstí",
            "lat": 50.076477,
            "lon": 14.419256
      },
      {
            "name": "Štěpánská",
            "lat": 50.0756,
            "lon": 14.423319
      },
      {
            "name": "I. P. Pavlova",
            "lat": 50.075405,
            "lon": 14.431689
      },
      {
            "name": "Náměstí Míru",
            "lat": 50.074921,
            "lon": 14.436891
      },
      {
            "name": "Jana Masaryka",
            "lat": 50.073071,
            "lon": 14.441488
      },
      {
            "name": "Krymská",
            "lat": 50.071888,
            "lon": 14.447816
      },
      {
            "name": "Ruská",
            "lat": 50.071251,
            "lon": 14.451302
      },
      {
            "name": "Vršovické náměstí",
            "lat": 50.069035,
            "lon": 14.454879
      },
      {
            "name": "Čechovo náměstí",
            "lat": 50.068066,
            "lon": 14.459471
      },
      {
            "name": "Koh-i-noor",
            "lat": 50.067692,
            "lon": 14.462255
      },
      {
            "name": "Slavia - Nádraží Eden",
            "lat": 50.069439,
            "lon": 14.470544
      },
      {
            "name": "Kubánské náměstí",
            "lat": 50.070717,
            "lon": 14.476859
      },
      {
            "name": "Průběžná",
            "lat": 50.071594,
            "lon": 14.486572
      },
      {
            "name": "Na Hroudě",
            "lat": 50.07,
            "lon": 14.489271
      },
      {
            "name": "Staré Strašnice",
            "lat": 50.068272,
            "lon": 14.492733
      },
      {
            "name": "Radošovická",
            "lat": 50.066601,
            "lon": 14.496884
      },
      {
            "name": "Dubečská",
            "lat": 50.06522,
            "lon": 14.502828
      },
      {
            "name": "Nádraží Zahradní Město",
            "lat": 50.06171,
            "lon": 14.503953
      },
      {
            "name": "Zahradní Město",
            "lat": 50.060566,
            "lon": 14.505978
      },
      {
            "name": "Sídliště Zahradní Město",
            "lat": 50.056816,
            "lon": 14.513191
      },
      {
            "name": "Obchodní centrum Hostivař",
            "lat": 50.053871,
            "lon": 14.518919
      },
      {
            "name": "Na Groši",
            "lat": 50.052906,
            "lon": 14.52377
      },
      {
            "name": "Hostivařská",
            "lat": 50.05267,
            "lon": 14.53038
      },
      {
            "name": "Nádraží Hostivař",
            "lat": 50.053242,
            "lon": 14.537439
      }
],
  },
  {
    line: '98',
    name: "Linka 98 (Sídliště Řepy ⇄ Spojovací)",
    color: "#9333EA",
    scenic: false,
    night: true,
    description: "Noční tramvajová linka (Sídliště Řepy ⇄ Spojovací)",
    path: TRAM_TRACK_PATHS['98'],
    stops: [
      {
            "name": "Sídliště Řepy",
            "lat": 50.065144,
            "lon": 14.298904
      },
      {
            "name": "Blatiny",
            "lat": 50.065704,
            "lon": 14.303621
      },
      {
            "name": "Slánská",
            "lat": 50.064468,
            "lon": 14.309402
      },
      {
            "name": "Hlušičkova",
            "lat": 50.064014,
            "lon": 14.31641
      },
      {
            "name": "Krematorium Motol",
            "lat": 50.066227,
            "lon": 14.326459
      },
      {
            "name": "Motol",
            "lat": 50.067673,
            "lon": 14.336522
      },
      {
            "name": "Vozovna Motol",
            "lat": 50.067856,
            "lon": 14.341458
      },
      {
            "name": "Hotel Golf",
            "lat": 50.068031,
            "lon": 14.346667
      },
      {
            "name": "Poštovka",
            "lat": 50.068569,
            "lon": 14.354462
      },
      {
            "name": "Kotlářka",
            "lat": 50.069565,
            "lon": 14.362923
      },
      {
            "name": "Kavalírka",
            "lat": 50.070034,
            "lon": 14.37067
      },
      {
            "name": "Klamovka",
            "lat": 50.070702,
            "lon": 14.380618
      },
      {
            "name": "U Zvonu",
            "lat": 50.071541,
            "lon": 14.387218
      },
      {
            "name": "Bertramka",
            "lat": 50.072231,
            "lon": 14.393291
      },
      {
            "name": "Anděl",
            "lat": 50.07193,
            "lon": 14.403631
      },
      {
            "name": "Arbesovo náměstí",
            "lat": 50.076248,
            "lon": 14.404202
      },
      {
            "name": "Švandovo divadlo",
            "lat": 50.078484,
            "lon": 14.404175
      },
      {
            "name": "Újezd",
            "lat": 50.080536,
            "lon": 14.404652
      },
      {
            "name": "Národní divadlo",
            "lat": 50.081413,
            "lon": 14.414886
      },
      {
            "name": "Národní třída",
            "lat": 50.081158,
            "lon": 14.419593
      },
      {
            "name": "Lazarská",
            "lat": 50.07938,
            "lon": 14.419519
      },
      {
            "name": "Lazarská",
            "lat": 50.079067,
            "lon": 14.421011
      },
      {
            "name": "Vodičkova",
            "lat": 50.080036,
            "lon": 14.423432
      },
      {
            "name": "Václavské náměstí",
            "lat": 50.081963,
            "lon": 14.425733
      },
      {
            "name": "Jindřišská",
            "lat": 50.08532,
            "lon": 14.430784
      },
      {
            "name": "Hlavní nádraží",
            "lat": 50.085693,
            "lon": 14.435928
      },
      {
            "name": "Viktoria Žižkov",
            "lat": 50.084938,
            "lon": 14.445333
      },
      {
            "name": "Lipanská",
            "lat": 50.084007,
            "lon": 14.453156
      },
      {
            "name": "Olšanské náměstí",
            "lat": 50.082451,
            "lon": 14.457738
      },
      {
            "name": "Flora",
            "lat": 50.077881,
            "lon": 14.462435
      },
      {
            "name": "Olšanské hřbitovy",
            "lat": 50.078114,
            "lon": 14.467348
      },
      {
            "name": "Želivského",
            "lat": 50.078331,
            "lon": 14.471611
      },
      {
            "name": "Želivského",
            "lat": 50.079723,
            "lon": 14.472616
      },
      {
            "name": "Nákladové nádraží Žižkov",
            "lat": 50.085629,
            "lon": 14.470274
      },
      {
            "name": "Biskupcova",
            "lat": 50.0891,
            "lon": 14.468635
      },
      {
            "name": "Ohrada",
            "lat": 50.090672,
            "lon": 14.470092
      },
      {
            "name": "Vozovna Žižkov",
            "lat": 50.091492,
            "lon": 14.474536
      },
      {
            "name": "Strážní",
            "lat": 50.09219,
            "lon": 14.481013
      },
      {
            "name": "Chmelnice",
            "lat": 50.092487,
            "lon": 14.485838
      },
      {
            "name": "Kněžská luka",
            "lat": 50.092148,
            "lon": 14.492482
      },
      {
            "name": "Spojovací",
            "lat": 50.091507,
            "lon": 14.499409
      }
],
  },
  {
    line: '99',
    name: "Linka 99 (Zahradní Město ⇄ Sídliště Řepy)",
    color: "#9333EA",
    scenic: false,
    night: true,
    description: "Noční tramvajová linka (Zahradní Město ⇄ Sídliště Řepy)",
    path: TRAM_TRACK_PATHS['99'],
    stops: [
      {
            "name": "Zahradní Město",
            "lat": 50.06078,
            "lon": 14.505138
      },
      {
            "name": "Nádraží Zahradní Město",
            "lat": 50.062298,
            "lon": 14.50424
      },
      {
            "name": "Dubečská",
            "lat": 50.065495,
            "lon": 14.501875
      },
      {
            "name": "Radošovická",
            "lat": 50.06691,
            "lon": 14.496132
      },
      {
            "name": "Staré Strašnice",
            "lat": 50.068249,
            "lon": 14.492912
      },
      {
            "name": "Na Hroudě",
            "lat": 50.070507,
            "lon": 14.4887
      },
      {
            "name": "Průběžná",
            "lat": 50.071434,
            "lon": 14.485649
      },
      {
            "name": "Kubánské náměstí",
            "lat": 50.070858,
            "lon": 14.477933
      },
      {
            "name": "Slavia - Nádraží Eden",
            "lat": 50.069553,
            "lon": 14.470657
      },
      {
            "name": "Koh-i-noor",
            "lat": 50.067581,
            "lon": 14.461409
      },
      {
            "name": "Čechovo náměstí",
            "lat": 50.068172,
            "lon": 14.459037
      },
      {
            "name": "Vršovické náměstí",
            "lat": 50.069157,
            "lon": 14.45422
      },
      {
            "name": "Ruská",
            "lat": 50.071686,
            "lon": 14.451129
      },
      {
            "name": "Krymská",
            "lat": 50.07198,
            "lon": 14.446995
      },
      {
            "name": "Jana Masaryka",
            "lat": 50.073513,
            "lon": 14.440681
      },
      {
            "name": "Náměstí Míru",
            "lat": 50.075008,
            "lon": 14.435997
      },
      {
            "name": "I. P. Pavlova",
            "lat": 50.075539,
            "lon": 14.430594
      },
      {
            "name": "Štěpánská",
            "lat": 50.075687,
            "lon": 14.422432
      },
      {
            "name": "Karlovo náměstí",
            "lat": 50.075901,
            "lon": 14.419612
      },
      {
            "name": "Novoměstská radnice",
            "lat": 50.077518,
            "lon": 14.419602
      },
      {
            "name": "Lazarská",
            "lat": 50.080021,
            "lon": 14.419835
      },
      {
            "name": "Národní třída",
            "lat": 50.081688,
            "lon": 14.419497
      },
      {
            "name": "Národní divadlo",
            "lat": 50.081448,
            "lon": 14.414021
      },
      {
            "name": "Újezd",
            "lat": 50.081249,
            "lon": 14.405181
      },
      {
            "name": "Švandovo divadlo",
            "lat": 50.077969,
            "lon": 14.404121
      },
      {
            "name": "Arbesovo náměstí",
            "lat": 50.075886,
            "lon": 14.403978
      },
      {
            "name": "Anděl",
            "lat": 50.071953,
            "lon": 14.402808
      },
      {
            "name": "Bertramka",
            "lat": 50.072239,
            "lon": 14.392435
      },
      {
            "name": "U Zvonu",
            "lat": 50.071636,
            "lon": 14.387421
      },
      {
            "name": "Klamovka",
            "lat": 50.070583,
            "lon": 14.379142
      },
      {
            "name": "Kavalírka",
            "lat": 50.070118,
            "lon": 14.370847
      },
      {
            "name": "Kotlářka",
            "lat": 50.069603,
            "lon": 14.362015
      },
      {
            "name": "Poštovka",
            "lat": 50.068481,
            "lon": 14.353559
      },
      {
            "name": "Hotel Golf",
            "lat": 50.0681,
            "lon": 14.346782
      },
      {
            "name": "Vozovna Motol",
            "lat": 50.067886,
            "lon": 14.340504
      },
      {
            "name": "Motol",
            "lat": 50.067715,
            "lon": 14.335685
      },
      {
            "name": "Krematorium Motol",
            "lat": 50.065933,
            "lon": 14.325691
      },
      {
            "name": "Hlušičkova",
            "lat": 50.063713,
            "lon": 14.315658
      },
      {
            "name": "Slánská",
            "lat": 50.064552,
            "lon": 14.308531
      },
      {
            "name": "Blatiny",
            "lat": 50.065796,
            "lon": 14.302246
      },
      {
            "name": "Sídliště Řepy",
            "lat": 50.065437,
            "lon": 14.298032
      }
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
