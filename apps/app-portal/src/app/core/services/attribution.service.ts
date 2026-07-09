import { Injectable, signal } from '@angular/core';

export interface AttributionData {
  ref?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class AttributionService {
  private data = signal<AttributionData>({});

  captureAttribution(params: { [key: string]: string }) {
    const parsed: AttributionData = {
      ref: params['ref'] || null,
      utm_source: params['utm_source'] || null,
      utm_medium: params['utm_medium'] || null,
      utm_campaign: params['utm_campaign'] || null,
      utm_content: params['utm_content'] || null,
    };
    
    // Store in session storage to survive refreshes during onboarding
    sessionStorage.setItem('kredo_attribution', JSON.stringify(parsed));
    this.data.set(parsed);
  }

  getAttribution(): AttributionData {
    if (!this.data().ref) {
      const stored = sessionStorage.getItem('kredo_attribution');
      if (stored) {
        try {
          this.data.set(JSON.parse(stored));
        } catch (e) {
          // Ignored
        }
      }
    }
    return this.data();
  }
}
