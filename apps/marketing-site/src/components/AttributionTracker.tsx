"use client";

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';

export default function AttributionTracker() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get('ref');
    const source = searchParams.get('utm_source');
    const medium = searchParams.get('utm_medium');
    const campaign = searchParams.get('utm_campaign');
    const content = searchParams.get('utm_content');

    if (ref || source || medium || campaign || content) {
      const existingCookie = Cookies.get('kalahari_ref');
      let data: Record<string, string> = {};

      if (existingCookie) {
        try {
          data = JSON.parse(existingCookie);
        } catch (e) {
          // Ignored
        }
      }

      if (ref) data.ref = ref;
      if (source) data.utm_source = source;
      if (medium) data.utm_medium = medium;
      if (campaign) data.utm_campaign = campaign;
      if (content) data.utm_content = content;

      Cookies.set('kalahari_ref', JSON.stringify(data), { expires: 30 });
      console.log('Attribution cookie updated:', data);
    }
  }, [searchParams]);

  return null;
}
