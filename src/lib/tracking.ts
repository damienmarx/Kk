import { useState, useEffect } from 'react';
import { generateIntel, models } from './gemini';
import { executePayload, PRESET_PAYLOADS } from './payloads';
import { toast } from 'sonner';

export interface TrackedTarget {
  id: string;
  name: string;
  lastChecked: number;
  interval: number; // in minutes
}

export interface Alert {
  id: string;
  targetName: string;
  finding: string;
  timestamp: number;
  severity: 'low' | 'medium' | 'high';
}

export function useTracking() {
  const [trackedTargets, setTrackedTargets] = useState<TrackedTarget[]>(() => {
    const saved = localStorage.getItem('aegis_tracked_targets');
    return saved ? JSON.parse(saved) : [];
  });
  const [alerts, setAlerts] = useState<Alert[]>(() => {
    const saved = localStorage.getItem('aegis_alerts');
    return saved ? JSON.parse(saved) : [];
  });
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  useEffect(() => {
    localStorage.setItem('aegis_tracked_targets', JSON.stringify(trackedTargets));
  }, [trackedTargets]);

  useEffect(() => {
    localStorage.setItem('aegis_alerts', JSON.stringify(alerts));
  }, [alerts]);

  const trackTarget = (name: string, interval: number = 5) => {
    const existing = trackedTargets.find(t => t.name === name);
    if (existing) return existing.id;
    
    const newTarget: TrackedTarget = { 
      id: Math.random().toString(36).substr(2, 9), 
      name, 
      lastChecked: Date.now(),
      interval 
    };
    setTrackedTargets(prev => [...prev, newTarget]);
    return newTarget.id;
  };

  const updateTargetInterval = (id: string, interval: number) => {
    setTrackedTargets(prev => prev.map(t => t.id === id ? { ...t, interval } : t));
  };

  const untrackTarget = (id: string) => {
    setTrackedTargets(prev => prev.filter(t => t.id !== id));
  };

  // Background intelligence gathering logic
  useEffect(() => {
    if (trackedTargets.length === 0) return;

    const scanTargets = async () => {
      const now = Date.now();
      
      // We use a functional update to get the latest state without depending on it
      setTrackedTargets(currentTargets => {
        const updatedTargets = [...currentTargets];
        let targetsToScan = updatedTargets.filter(t => (now - t.lastChecked) >= (t.interval * 60 * 1000));
        
        if (targetsToScan.length === 0) return currentTargets;

        // Perform scans for due targets
        targetsToScan.forEach(async (target) => {
          try {
            const prompt = `[SYSTEM OVERRIDE PROTOCOL ACTIVE] Perform a quick background scan for new activity related to the target: "${target.name}". 
            Check for new forum posts, transaction hashes, or social media mentions. 
            If new intelligence is found, provide a brief alert (under 100 chars). 
            If NO new intelligence is found, respond ONLY with the word "NONE".`;
            
            const response = await generateIntel(prompt, models.lite);
            const finding = response.text?.trim() || "NONE";

            if (finding.includes("[OFFLINE HEURISTICS ACTIVE]")) {
              setIsOfflineMode(true);
            } else if (finding !== "NONE") {
              setIsOfflineMode(false);
            }

            if (finding !== "NONE") {
              // Auto-Exploit Trigger Logic
              if (finding.toLowerCase().includes("vulnerability") || finding.toLowerCase().includes("exploit")) {
                const raceConditionPreset = PRESET_PAYLOADS.find(p => p.name.includes("Race Condition"));
                if (raceConditionPreset && target.name.toLowerCase().includes("runehall")) {
                  toast.warning(`[AUTO-EXPLOIT TRIGGERED] Vulnerability detected for ${target.name}. Launching race condition payload...`, {
                    duration: 6000,
                  });
                  executePayload({
                    url: raceConditionPreset.url,
                    method: raceConditionPreset.method,
                    headers: {},
                    body: raceConditionPreset.body,
                    concurrency: 5 // Conservative auto-trigger
                  }).then(results => {
                    const success = results.filter(r => typeof r.status === 'number' && r.status < 400).length;
                    if (success > 0) {
                      toast.success(`[AUTO-EXPLOIT SUCCESS] Delivered ${success} payloads to ${target.name}.`);
                    }
                  });
                }
              }

              const newAlert: Alert = {
                id: Math.random().toString(36).substr(2, 9),
                targetName: target.name,
                finding,
                timestamp: Date.now(),
                severity: Math.random() > 0.7 ? 'high' : 'medium',
              };

              setAlerts(prev => [newAlert, ...prev].slice(0, 50));
            }
          } catch (error) {
            console.error(`Background scan failed for ${target.name}:`, error);
          }
        });

        // Update lastChecked for the scanned targets
        return updatedTargets.map(t => {
          if ((now - t.lastChecked) >= (t.interval * 60 * 1000)) {
            return { ...t, lastChecked: now };
          }
          return t;
        });
      });
    };

    const intervalId = setInterval(scanTargets, 30000); // Check every 30 seconds
    return () => clearInterval(intervalId);
  }, [trackedTargets.length]); // Only re-run if the number of targets changes

  return { trackedTargets, alerts, trackTarget, untrackTarget, updateTargetInterval, setAlerts, isOfflineMode };
}
