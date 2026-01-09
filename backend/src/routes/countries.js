import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get all countries
router.get('/', authenticateToken, async (req, res) => {
  try {
    const countries = await prisma.country.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(countries);
  } catch (error) {
    console.error('Get countries error:', error);
    res.status(500).json({ error: 'Error fetching countries' });
  }
});

// Get quality scale
router.get('/quality-scale', authenticateToken, async (req, res) => {
  try {
    const scales = await prisma.qualityScale.findMany({
      orderBy: { value: 'asc' },
    });
    res.json(scales);
  } catch (error) {
    console.error('Get quality scale error:', error);
    res.status(500).json({ error: 'Error fetching quality scale' });
  }
});

export default router;
