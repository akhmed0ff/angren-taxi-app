import { Router, type Request, type Response } from 'express';
import { TaxiDriverService } from '../modules/taxi/driver/driver.service';
import { PassengerService } from '../modules/taxi/passenger/passenger.service';
import { RideService } from '../modules/taxi/ride/ride.service';
import { DRIVER_STATUS, RIDE_STATUS } from '../modules/taxi/types';
import { emitDriverLocationUpdated, emitRideStatusUpdated } from '../realtime/socket';
import { RoutePlanningService } from '../modules/taxi/ride/route-planning.service';

const router = Router();
const driverService = new TaxiDriverService();
const passengerService = new PassengerService();
const rideService = new RideService();
const routePlanningService = new RoutePlanningService();

router.post('/routes/preview', async (req: Request, res: Response) => {
  try {
    const {
      pickupLatitude,
      pickupLongitude,
      destinationLatitude,
      destinationLongitude,
      provider,
    } = req.body;

    const numeric = [pickupLatitude, pickupLongitude, destinationLatitude, destinationLongitude];
    if (numeric.some((value) => typeof value !== 'number')) {
      return res.status(400).json({ error: 'Route coordinates must be numbers' });
    }

    if (provider && provider !== 'osrm' && provider !== 'google') {
      return res.status(400).json({ error: 'provider must be "osrm" or "google"' });
    }

    const route = await routePlanningService.getRoute(
      { latitude: pickupLatitude, longitude: pickupLongitude },
      { latitude: destinationLatitude, longitude: destinationLongitude },
      provider,
    );

    return res.json(route);
  } catch (error: any) {
    const statusCode = error?.code === 'ROUTE_NOT_FOUND' ? 404 : 400;
    return res.status(statusCode).json({ error: error?.message ?? 'Failed to build route' });
  }
});

router.post('/passengers', async (req: Request, res: Response) => {
  try {
    const { name, phone } = req.body;
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'name is required' });
    }

    const passenger = await passengerService.createPassenger(name, typeof phone === 'string' ? phone : undefined);
    return res.status(201).json(passenger);
  } catch (error: any) {
    return res.status(500).json({ error: error?.message ?? 'Failed to create passenger' });
  }
});

router.post('/drivers', async (req: Request, res: Response) => {
  try {
    const { name, latitude, longitude } = req.body;
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'name is required' });
    }

    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return res.status(400).json({ error: 'latitude and longitude must be numbers' });
    }

    const driver = await driverService.createDriver(name, latitude, longitude);
    return res.status(201).json(driver);
  } catch (error: any) {
    return res.status(500).json({ error: error?.message ?? 'Failed to create driver' });
  }
});

router.patch('/drivers/:id/location', async (req: Request, res: Response) => {
  try {
    const { latitude, longitude } = req.body;

    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return res.status(400).json({ error: 'latitude and longitude must be numbers' });
    }

    const updated = await driverService.updateLocation(req.params.id, latitude, longitude);

    emitDriverLocationUpdated({
      driverId: updated.id,
      latitude: updated.latitude,
      longitude: updated.longitude,
    });

    return res.json(updated);
  } catch (error: any) {
    const code = error?.code === 'DRIVER_NOT_FOUND' ? 404 : 500;
    return res.status(code).json({ error: error?.message ?? 'Failed to update driver location' });
  }
});

router.patch('/drivers/:id/status', async (req: Request, res: Response) => {
  try {
    const { status } = req.body;

    if (!Object.values(DRIVER_STATUS).includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${Object.values(DRIVER_STATUS).join(', ')}` });
    }

    const updated = await driverService.setStatus(req.params.id, status);
    return res.json(updated);
  } catch (error: any) {
    const code = error?.code === 'DRIVER_NOT_FOUND' ? 404 : 400;
    return res.status(code).json({ error: error?.message ?? 'Failed to set driver status' });
  }
});

router.get('/drivers/available', async (_req: Request, res: Response) => {
  try {
    const available = await driverService.getAvailableDrivers();
    return res.json(available);
  } catch (error: any) {
    return res.status(500).json({ error: error?.message ?? 'Failed to fetch available drivers' });
  }
});

router.post('/rides', async (req: Request, res: Response) => {
  try {
    const { passengerId, pickupLatitude, pickupLongitude, destinationLatitude, destinationLongitude } = req.body;

    if (!passengerId || typeof passengerId !== 'string') {
      return res.status(400).json({ error: 'passengerId is required' });
    }

    const numeric = [pickupLatitude, pickupLongitude, destinationLatitude, destinationLongitude];
    if (numeric.some((value) => typeof value !== 'number')) {
      return res.status(400).json({ error: 'Ride coordinates must be numbers' });
    }

    const ride = await rideService.createRide({
      passengerId,
      pickupLatitude,
      pickupLongitude,
      destinationLatitude,
      destinationLongitude,
    });

    return res.status(201).json(ride);
  } catch (error: any) {
    const code = error?.code === 'PASSENGER_NOT_FOUND' ? 404 : 500;
    return res.status(code).json({ error: error?.message ?? 'Failed to create ride' });
  }
});

router.post('/rides/:id/assign-driver', async (req: Request, res: Response) => {
  try {
    const ride = await rideService.assignDriver(req.params.id);

    emitRideStatusUpdated({
      rideId: ride.id,
      status: ride.status,
      driverId: ride.driverId,
      passengerId: ride.passengerId,
    });

    return res.json(ride);
  } catch (error: any) {
    const code = error?.code === 'RIDE_NOT_FOUND' ? 404 : 400;
    return res.status(code).json({ error: error?.message ?? 'Failed to assign driver' });
  }
});

router.patch('/rides/:id/status', async (req: Request, res: Response) => {
  try {
    const { status } = req.body;

    if (!Object.values(RIDE_STATUS).includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${Object.values(RIDE_STATUS).join(', ')}` });
    }

    const ride = await rideService.updateStatus(req.params.id, status);

    emitRideStatusUpdated({
      rideId: ride.id,
      status: ride.status,
      driverId: ride.driverId,
      passengerId: ride.passengerId,
    });

    return res.json(ride);
  } catch (error: any) {
    const code = error?.code === 'RIDE_NOT_FOUND' ? 404 : 400;
    return res.status(code).json({ error: error?.message ?? 'Failed to update ride status' });
  }
});

router.get('/rides/:id', async (req: Request, res: Response) => {
  try {
    const ride = await rideService.getRideById(req.params.id);
    return res.json(ride);
  } catch (error: any) {
    const code = error?.code === 'RIDE_NOT_FOUND' ? 404 : 500;
    return res.status(code).json({ error: error?.message ?? 'Failed to get ride' });
  }
});

export default router;
