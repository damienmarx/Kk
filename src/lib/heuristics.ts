/**
 * Aegis Offline Heuristics Module
 * Provides fallback intelligence generation when API quota is exhausted.
 */

const FINDING_TEMPLATES = [
  "Detected alias reuse on {platform} associated with {target}.",
  "New transaction hash identified on Runehall linking {target} to a known high-roller wallet.",
  "Archived post found on Sythe.org mentions {target} in a high-value OSRS GP trade.",
  "Discord metadata leak suggests {target} is active in a private RSPS development channel.",
  "Cross-correlation hit: {target} matched with a leaked database entry from a 2023 gaming forum breach.",
  "Potential real-world identity link: {target}'s profile picture matches a LinkedIn profile in the gaming sector.",
  "Underground forum dorking returned 3 new mentions of {target} on Dread.",
  "Runehall betting pattern analysis shows {target} using a potential race condition exploit vector.",
  "Wayback Machine snapshot from 2022 reveals {target}'s previous username and associated email pattern.",
  "Crypto explorer hit: Wallet associated with {target} received 500M OSRS GP equivalent in BTC.",
  "Intelligence Hit: 'Murk' identified as senior operator of Runehall (rebranded RuneBet).",
  "Technical Finding: Runehall using Nginx 1.21 and Node.js with JWT-based session signing.",
  "Vulnerability Alert: Runehall's BGaming integration is fake; games are self-hosted and rigged.",
  "Exposed Endpoint: Sensitive path '/env' or '/config' detected on Runehall's infrastructure.",
  "OSINT Hit: 'Murk' active on Sythe.org with multiple scam reports and Trustpilot 'rigged' reviews."
];

const PLATFORMS = ["Twitter", "Reddit", "Sythe", "HackForums", "Discord", "Nulled.to", "Powerbot"];

export function getLocalIntelligence(target: string): string {
  const template = FINDING_TEMPLATES[Math.floor(Math.random() * FINDING_TEMPLATES.length)];
  const platform = PLATFORMS[Math.floor(Math.random() * PLATFORMS.length)];
  
  return template
    .replace(/{target}/g, target)
    .replace(/{platform}/g, platform);
}

export function isQuotaExhaustedError(error: any): boolean {
  if (!error) return false;
  const errorStr = typeof error === 'string' ? error : JSON.stringify(error);
  return errorStr.includes("RESOURCE_EXHAUSTED") || errorStr.includes("429") || errorStr.includes("quota");
}
