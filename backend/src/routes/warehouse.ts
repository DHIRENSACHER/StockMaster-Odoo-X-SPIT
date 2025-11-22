import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getLocations, getWarehouses } from '../services/warehouseService';

const router = Router();

router.get('/warehouses', authenticate, async (_req, res, next) => {
  try {
    const data = await getWarehouses();
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get('/locations', authenticate, async (_req, res, next) => {
  try {
    const data = await getLocations();
    res.json(data);
  } catch (error) {
    next(error);
  }
});

export const warehouseRouter = router;
