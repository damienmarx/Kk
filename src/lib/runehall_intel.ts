/**
 * Runehall Intelligence Data
 * Extracted from live network scans and archival sources.
 */

export const RUNEHALL_AFFILIATES = [
  { name: "Alpha", url: "runehall.com/a/Alpha" },
  { name: "BestGuides", url: "runehall.com/a/BestGuides" },
  { name: "Black", url: "runehall.com/a/Black" },
  { name: "BlightedBets", url: "runehall.com/a/BlightedBets" },
  { name: "BoooYa", url: "runehall.com/a/BoooYa" },
  { name: "Dbuffed", url: "runehall.com/a/Dbuffed" },
  { name: "DNG", url: "runehall.com/a/DNG" },
  { name: "dorkbet", url: "runehall.com/a/dorkbet" },
  { name: "Dovis", url: "runehall.com/a/Dovis" },
  { name: "fiddlydingus", url: "runehall.com/a/fiddlydingus" },
  { name: "flashyflashy", url: "runehall.com/a/flashyflashy" },
  { name: "ing", url: "runehall.com/a/ing" },
  { name: "Johnjok", url: "runehall.com/a/Johnjok" },
  { name: "loltage", url: "runehall.com/a/loltage" },
  { name: "osbestrs", url: "runehall.com/a/osbestrs" },
  { name: "OSBOT1", url: "runehall.com/a/OSBOT1" },
  { name: "Osbot6m", url: "runehall.com/a/Osbot6m" },
  { name: "osbotbottom", url: "runehall.com/a/osbotbottom" },
  { name: "osbotheader", url: "runehall.com/a/osbotheader" },
  { name: "PhaserBomb", url: "runehall.com/a/PhaserBomb" },
  { name: "rkqz999", url: "runehall.com/a/rkqz999" },
  { name: "RSGUIDES", url: "runehall.com/a/RSGUIDES" },
  { name: "RuneLister", url: "runehall.com/a/RuneLister" },
  { name: "Sythesports", url: "runehall.com/a/Sythesports" },
  { name: "Takashi", url: "runehall.com/a/Takashi" },
  { name: "vidas69", url: "runehall.com/a/vidas69" },
  { name: "viperslots", url: "runehall.com/a/viperslots" },
  { name: "xTwitter", url: "runehall.com/a/xTwitter" },
  { name: "CheapGP", url: "runehall.com/a/CheapGP" }
];

export const RUNEHALL_USER_MAP = [
  { id: "229", encoded: "dHVyYm9jYXQ=", decoded: "turbocat" },
  { id: "420", encoded: "QhlYXBHUA==", decoded: "CheapGP" },
  { id: "2596", encoded: "cHJv", decoded: "pro" },
  { id: "2816", encoded: "YmxhaVibGvZDk=", decoded: "blakeblood9" },
  { id: "6451", encoded: "TWluaVTbRh", decoded: "Mini_Soda" },
  { id: "10731", encoded: "cGVrYWJvb=", decoded: "pekabooo" },
  { id: "16406", encoded: "QFsbElTWFYmU=", decoded: "CallMeMaybe" },
  { id: "20201", encoded: "ZltZXNvbWVsdWNr", decoded: "gimesomesluck" },
  { id: "20519", encoded: "TWrMTAzNA==", decoded: "Mok1034" },
  { id: "25134", encoded: "QmxpZhZWRCZXRz", decoded: "BlightedBets" },
  { id: "25432", encoded: "RkSluZw==", decoded: "GodKing" },
  { id: "25670", encoded: "QXRbEtbWFy", decoded: "AtulKumar" },
  { id: "25779", encoded: "QmVuYmFsbGVy", decoded: "Benballer" },
  { id: "26186", encoded: "VHdEZXBheTc=", decoded: "TwDepay7" }
];

export const RUNEHALL_ENDPOINTS = [
  "/.well-known/auth",
  "/account/transactions",
  "/casino/plinko",
  "/vault",
  "/api/auth/login",
  "/api/games/bet",
  "/api/payments/process",
  "/api/v1/internal/debug",
  "/api/system/tasks",
  "/api/v1/payload/generate",
  "/api/debug/exposure",
  "/api/admin/config",
  "/api/upload/profile",
  "/env",
  "/config",
  "/db",
  "/git",
  "/admin",
  "w.tar.gz",
  "/.git/config",
  "/phpinfo.php",
  "/server-status",
  "/api/v1/user/sessions",
  "/api/v1/wallet/keys"
];

export const RUNEHALL_VULNERABILITIES = [
  { type: "Logic Flaw", endpoint: "/api/games/bet", description: "Race condition in balance verification allowing double-spending." },
  { type: "RCE", endpoint: "/api/debug/exposure", description: "Reflective PHP execution via action parameter." },
  { type: "IDOR", endpoint: "/api/admin/config", description: "Unauthorized access to system configuration via sequential IDs." },
  { type: "Persistence", endpoint: "/api/system/tasks", description: "Cron-job injection via PUT request to task scheduler." },
  { type: "Data Leak", endpoint: "/.well-known/auth", description: "Exposure of JWT signing keys or session metadata." }
];

export const RUNEHALL_TARGETS = [
  "SouthernG", "MRGETDOUGH", "IDENTITTY", "GSPOTFINDER", "BASSMASTER", "MAHOOTS1",
  "PIGEON12", "LABDIENDEELS", "BIGBUBLY", "LIZZZLE", "TYLERG20",
  "ALREADYTB", "HIGHGRADEZ", "STONERGUY28", "KELV277", "BENBOOKPRO",
  "RUREMATU", "7200", "DALVADORBAN", "PRINCESS", "SLAINEZY"
];
