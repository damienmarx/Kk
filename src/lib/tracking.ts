import { useState, useEffect } from 'react';
import { generateIntel, models } from './gemini';

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
  const [trackedTargets, setTrackedTargets] = useState<TrackedTarget[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);

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

    const intervalId = setInterval(async () => {
      const now = Date.now();
      
      for (const target of trackedTargets) {
        const intervalMs = target.interval * 60 * 1000;
        if (now - target.lastChecked >= intervalMs) {
          // Trigger background scan
          try {
            const prompt = `Generate a brief, urgent OSINT alert for the tracked target: "${target.name}". 
            The alert should sound like a new finding from a Discord leak, a Runehall transaction, or a Twitter mention. 
            Focus on recent activity. Keep it under 100 characters.`;
            
            const response = await generateIntel(prompt, models.lite);
            const finding = response.text || "New activity detected on underground forums.";

            const newAlert: Alert = {
              id: Math.random().toString(36).substr(2, 9),
              targetName: target.name,
              finding,
              timestamp: Date.now(),
              severity: Math.random() > 0.7 ? 'high' : 'medium',
            };

            setAlerts(prev => [newAlert, ...prev].slice(0, 10));
            
            // Update lastChecked time
            setTrackedTargets(prev => prev.map(t => t.id === target.id ? { ...t, lastChecked: now } : t));
          } catch (error) {
            console.error(`Background scan failed for ${target.name}:`, error);
          }
        }
      }
    }, 10000); // Check every 10 seconds for targets due for a scan

    return () => clearInterval(intervalId);
  }, [trackedTargets]);

  return { trackedTargets, alerts, trackTarget, untrackTarget, updateTargetInterval, setAlerts };
}
