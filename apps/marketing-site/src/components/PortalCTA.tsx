"use client";

import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';

interface PortalCTAProps {
  children: React.ReactNode;
  className?: string;
}

export default function PortalCTA({ children, className }: PortalCTAProps) {
  const [href, setHref] = useState('https://kredo.kalahari.co.za/apply');

  useEffect(() => {
    const rawCookie = Cookies.get('kalahari_ref');
    if (rawCookie) {
      try {
        const attributionData = JSON.parse(rawCookie);
        const searchParams = new URLSearchParams();
        
        for (const [key, value] of Object.entries(attributionData)) {
          if (value) {
            searchParams.append(key, value as string);
          }
        }
        
        const queryString = searchParams.toString();
        if (queryString) {
          setHref(`https://kredo.kalahari.co.za/apply?${queryString}`);
        }
      } catch (e) {
        console.error('Failed to parse attribution cookie data', e);
      }
    }
  }, []);

  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}
