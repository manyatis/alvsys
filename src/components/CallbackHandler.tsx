'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

interface CallbackHandlerProps {
  onCallbackUrl: (url: string) => void;
}

export default function CallbackHandler({ onCallbackUrl }: CallbackHandlerProps) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const urlCallbackUrl = searchParams.get('callbackUrl');
    if (urlCallbackUrl) {
      onCallbackUrl(urlCallbackUrl);
    }
  }, [searchParams, onCallbackUrl]);

  return null;
}