import { Router } from 'express';
import { driverController } from '../controllers/driver.controller';
import { authMiddleware, driverOnly } from '../middleware/auth.middleware';

const router = Router();

router.post('/online', authMiddleware, driverOnly, (req, res, next) =>
  driverController.setOnline(req, res, next)
);

router.post('/offline', authMiddleware, driverOnly, (req, res, next) =>
  driverController.setOffline(req, res, next)
);

router.put('/status', authMiddleware, driverOnly, (req, res, next) =>
  driverController.setStatus(req, res, next)
);

router.put('/location', authMiddleware, driverOnly, (req, res, next) =>
  driverController.updateLocation(req, res, next)
);

// GET /me — alias for /profile (for mobile-driver compatibility)
router.get('/me', authMiddleware, (req, res, next) =>
  driverController.getProfile(req, res, next)
);

router.get('/profile', authMiddleware, driverOnly, (req, res, next) =>
  driverController.getProfile(req, res, next)
);

router.put('/profile', authMiddleware, driverOnly, (req, res, next) =>
  driverController.updateProfile(req, res, next)
);

router.get('/stats', authMiddleware, driverOnly, (req, res, next) =>
  driverController.getStats(req, res, next)
);

router.get('/balance', authMiddleware, driverOnly, (req, res, next) =>
  driverController.getBalance(req, res, next)
);

router.put('/vehicle', authMiddleware, driverOnly, (req, res, next) =>
  driverController.updateVehicle(req, res, next)
);

router.get('/vehicle', authMiddleware, driverOnly, (req, res, next) =>
  driverController.getVehicle(req, res, next)
);

router.post('/documents', authMiddleware, driverOnly, (req, res, next) =>
  driverController.uploadDocuments(req, res, next)
);

router.put('/bank-details', authMiddleware, driverOnly, (req, res, next) =>
  driverController.updateBankDetails(req, res, next)
);

router.get('/bank-details', authMiddleware, driverOnly, (req, res, next) =>
  driverController.getBankDetails(req, res, next)
);

export default router;
