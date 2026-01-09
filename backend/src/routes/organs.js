import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get all organs
router.get('/', authenticateToken, async (req, res) => {
  try {
    const organs = await prisma.organ.findMany({
      include: {
        organ_countries: {
          include: {
            country: true,
          },
        },
      },
    });

    const transformedOrgans = organs.map(organ => ({
      id: organ.id,
      name: organ.name,
      countries: organ.organ_countries.map(oc => oc.country),
    }));

    res.json(transformedOrgans);
  } catch (error) {
    console.error('Get organs error:', error);
    res.status(500).json({ error: 'Error fetching organs' });
  }
});

export default router;
