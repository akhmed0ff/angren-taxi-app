import { Router, Request, Response } from 'express';
import { DriverService } from './driver.service';
import { validateCoordinates, validateString, validateBoolean } from '../../common/validators';

const router = Router();
const service = new DriverService();

interface CreateDriverRequest {
  name?: any;
  latitude?: any;
  longitude?: any;
}

interface UpdateLocationRequest {
  latitude?: any;
  longitude?: any;
}

interface UpdateAvailabilityRequest {
  isAvailable?: any;
}

// POST /drivers - Create driver
router.post('/', async (req: Request<never, never, CreateDriverRequest>, res: Response) => {
  try {
    const { name, latitude, longitude } = req.body;

    // Validation
    const nameErrors = validateString(name, 'name', 2, 100);
    const coordErrors = validateCoordinates(latitude, longitude);
    const allErrors = [...nameErrors, ...coordErrors];

    if (allErrors.length > 0) {
      return res.status(400).json({ errors: allErrors });
    }

    const driver = await service.createDriver(name.trim(), latitude, longitude);

    res.status(201).json(driver);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create driver' });
  }
});

// GET /drivers - Get all drivers
router.get('/', async (_req: Request, res: Response) => {
  try {
    const drivers = await service.getAllDrivers();
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch drivers' });
  }
});

// GET /drivers/available - Get available drivers
router.get('/available', async (_req: Request, res: Response) => {
  try {
    const drivers = await service.getAvailableDrivers();
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch available drivers' });
  }
});

// GET /drivers/:id - Get driver by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const driver = await service.getDriverById(req.params.id);
    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }
    res.json(driver);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch driver' });
  }
});

// PATCH /drivers/:id/location - Update driver location
router.patch('/:id/location', async (req: Request<{ id: string }, never, UpdateLocationRequest>, res: Response) => {
  try {
    const { latitude, longitude } = req.body;

    const coordErrors = validateCoordinates(latitude, longitude);
    if (coordErrors.length > 0) {
      return res.status(400).json({ errors: coordErrors });
    }

    const driver = await service.updateDriverLocation(req.params.id, latitude, longitude);
    res.json(driver);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update driver location' });
  }
});

// PATCH /drivers/:id/availability - Update driver availability
router.patch('/:id/availability', async (req: Request<{ id: string }, never, UpdateAvailabilityRequest>, res: Response) => {
  try {
    const { isAvailable } = req.body;

    const availErrors = validateBoolean(isAvailable, 'isAvailable');
    if (availErrors.length > 0) {
      return res.status(400).json({ errors: availErrors });
    }

    const driver = await service.updateDriverAvailability(req.params.id, isAvailable);
    res.json(driver);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update driver availability' });
  }
});

// DELETE /drivers/:id - Delete driver
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await service.deleteDriver(req.params.id);
    res.json({ message: 'Driver deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete driver' });
  }
});

export default router;
