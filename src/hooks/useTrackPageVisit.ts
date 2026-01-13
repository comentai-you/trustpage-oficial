import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TrackVisitParams {
  pageId: string;
}

// Detect device type from user agent
const getDeviceType = (userAgent: string): 'mobile' | 'tablet' | 'desktop' => {
  const ua = userAgent.toLowerCase();
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
};

// Parse referrer to get a clean source name
const parseReferrerSource = (referrer: string): string => {
  if (!referrer) return '';
  
  try {
    const url = new URL(referrer);
    const hostname = url.hostname.toLowerCase();
    
    // Common social/platforms
    if (hostname.includes('instagram')) return 'Instagram';
    if (hostname.includes('facebook') || hostname.includes('fb.com')) return 'Facebook';
    if (hostname.includes('tiktok')) return 'TikTok';
    if (hostname.includes('youtube')) return 'YouTube';
    if (hostname.includes('twitter') || hostname.includes('x.com')) return 'Twitter/X';
    if (hostname.includes('linkedin')) return 'LinkedIn';
    if (hostname.includes('pinterest')) return 'Pinterest';
    if (hostname.includes('whatsapp')) return 'WhatsApp';
    if (hostname.includes('telegram')) return 'Telegram';
    if (hostname.includes('google')) return 'Google';
    if (hostname.includes('bing')) return 'Bing';
    
    // Return cleaned hostname for others
    return hostname.replace('www.', '');
  } catch {
    return referrer;
  }
};

// Simple hash function for IP fingerprinting (done on client for privacy)
const generateVisitorHash = (): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('fingerprint', 2, 2);
  }
  const canvasData = canvas.toDataURL();
  
  const screenData = `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const language = navigator.language;
  
  const fingerprint = `${canvasData}|${screenData}|${timezone}|${language}|${navigator.userAgent}`;
  
  // Simple hash
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
};

export const useTrackPageVisit = ({ pageId }: TrackVisitParams) => {
  const hasTracked = useRef(false);

  useEffect(() => {
    if (!pageId || hasTracked.current) return;
    
    // Check session storage to avoid duplicate tracking
    const viewKey = `visit_tracked_${pageId}`;
    if (sessionStorage.getItem(viewKey)) {
      hasTracked.current = true;
      return;
    }

    const trackVisit = async () => {
      try {
        const userAgent = navigator.userAgent;
        const deviceType = getDeviceType(userAgent);
        const referrer = document.referrer;
        
        // Get UTM params from URL
        const urlParams = new URLSearchParams(window.location.search);
        const utmSource = urlParams.get('utm_source') || urlParams.get('ref') || null;
        
        // Generate visitor hash for unique visitor tracking
        const ipHash = generateVisitorHash();

        // Insert visit record
        const { error } = await supabase
          .from('page_visits')
          .insert({
            page_id: pageId,
            referrer: referrer || null,
            utm_source: utmSource,
            user_agent: userAgent,
            device_type: deviceType,
            ip_hash: ipHash,
          });

        if (error) {
          console.error('Error tracking visit:', error);
        } else {
          sessionStorage.setItem(viewKey, 'true');
          hasTracked.current = true;
        }
      } catch (error) {
        console.error('Error tracking visit:', error);
      }
    };

    trackVisit();
  }, [pageId]);
};

export { parseReferrerSource, getDeviceType };
