/**
 * Detailed Target Profiles for Aegis OSINT
 * Contains manually curated and automatically gathered intelligence on high-value targets.
 */

export interface TargetProfile {
  name: string;
  variants: string[];
  phoneNumbers: string[];
  ipAddresses: string[];
  emails: string[];
  socials: { [platform: string]: string };
  notes: string;
}

export const TARGET_PROFILES: { [key: string]: TargetProfile } = {
  "SouthernG": {
    name: "SouthernG",
    variants: ["Southern_G", "S_G_Rune", "SouthG_OSRS", "SouthernGamer"],
    phoneNumbers: ["+1 (555) 123-4567", "+1 (555) 987-6543"],
    ipAddresses: ["45.33.22.11", "104.21.5.12", "172.67.132.44", "108.95.121.60", "151.0.214.242"],
    emails: ["southerng@protonmail.com", "sg_osrs_pro@gmail.com"],
    socials: {
      "Sythe": "SouthernG_Official",
      "Discord": "SouthernG#1337 (ID: 123456789012345678)",
      "Twitter": "@SouthernG_OSRS"
    },
    notes: "High-value target associated with Runehall betting rings. Known to use VPNs and burner emails. Linked to multiple Sythe scam reports under previous alias 'S_G_Rune'."
  }
};
