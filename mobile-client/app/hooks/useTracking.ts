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
    socketService.onDriverLocation(handleDriverLocation);

    return () => {
      socketService.removeAllListeners();
    };
  }, [handleDriverLocation]);

  const stopTracking = useCallback(() => {
    socketService.removeAllListeners();
    setDriverLocation(null);
  }, []);

  return { driverLocation, stopTracking };
}
