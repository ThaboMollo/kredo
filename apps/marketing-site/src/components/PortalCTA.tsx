"use client";

import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';

const PORTAL_APPLY_URL = `${process.env.NEXT_PUBLIC_PORTAL_BASE_URL ?? 'https://kredo-portal.vercel.app'}/apply`;

interface PortalCTAProps {
  children: React.ReactNode;
  className?: string;
}

export default function PortalCTA({ children, className }: PortalCTAProps) {
  const [href, setHref] = useState(PORTAL_APPLY_URL);

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
          setHref(`${PORTAL_APPLY_URL}?${queryString}`);
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
