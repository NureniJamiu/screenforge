import { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';

/**
 * This component ensures that the Clerk JWT token is available and synchronized
 * immediately after authentication. It should be placed inside authenticated routes.
 */
export function AuthTokenManager({ children }: { children: React.ReactNode }) {
  const { getToken, isSignedIn } = useAuth();

  useEffect(() => {
    if (isSignedIn) {
      // Pre-fetch and cache the token to ensure it's available for immediate use
      getToken().catch(console.error);
    }
  }, [isSignedIn, getToken]);

  return <>{children}</>;
}
