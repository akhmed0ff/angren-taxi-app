import { useState, useEffect, useCallback } from 'react';

import { socketService } from '../services/socket.service';
import type { Location } from '../types';

export function useTracking(driverId?: string) {
  const [driverLocation, setDriverLocation] = useState<Location | null>(null);

  const handleDriverLocation = useCallback(
    (data: { driverId: string; location: Location }) => {
      if (!driverId || data.driverId === driverId) {
        setDriverLocation(data.location);
      }
    },
    [driverId],
  );

  useEffect(() => {
    const unsubscribe = socketService.onDriverLocation(handleDriverLocation);

    return () => {
      unsubscribe();
    };
  }, [handleDriverLocation]);

  const stopTracking = useCallback(() => {
    setDriverLocation(null);
  }, []);

  return { driverLocation, stopTracking };
}
