import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get records (filtered by user role)
router.get('/model/:modelId', authenticateToken, async (req, res) => {
  try {
    const { modelId } = req.params;
    const { organId } = req.query;

    const whereClause = {
      organ: {
        models_organs: {
          some: {
            model_id: parseInt(modelId),
          },
        },
      },
    };

    // Non-admin users can only see their own records
    if (req.user.role !== 'admin') {
      whereClause.user_id = req.user.id;
    }

    // Filter by organ if specified
    if (organId) {
      whereClause.organ_id = parseInt(organId);
    }

    const records = await prisma.record.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            user_role: true,
          },
        },
        organ: true,
        country: true,
        quality: true,
        context: true,
      },
      orderBy: { created_at: 'desc' },
    });

    res.json(records);
  } catch (error) {
    console.error('Get records error:', error);
    res.status(500).json({ error: 'Error fetching records' });
  }
});

// Get ranking for a model
router.get('/ranking/:modelId', authenticateToken, async (req, res) => {
  try {
    const { modelId } = req.params;
    const { organId } = req.query;

    const whereClause = {
      organ: {
        models_organs: {
          some: {
            model_id: parseInt(modelId),
          },
        },
      },
    };

    if (organId) {
      whereClause.organ_id = parseInt(organId);
    }

    const records = await prisma.record.findMany({
      where: whereClause,
      include: {
        country: true,
        user: {
          select: {
            user_role: true,
          },
        },
      },
    });

    // Get role weights
    const roleWeights = await prisma.roleWeight.findMany();
    const weightMap = {};
    roleWeights.forEach(rw => {
      weightMap[rw.user_role] = rw.weight;
    });

    // Calculate ranking
    const countryScores = {};
    
    records.forEach(record => {
      const countryName = record.country.name;
      const weight = weightMap[record.user.user_role] || 1;
      const score = record.quality_value * weight;
      
      if (!countryScores[countryName]) {
        countryScores[countryName] = {
          country: record.country,
          totalScore: 0,
          interventions: 0,
        };
      }
      
      countryScores[countryName].totalScore += score;
      countryScores[countryName].interventions += 1;
    });

    // Convert to array and sort
    const ranking = Object.values(countryScores)
      .map(item => ({
        country: item.country,
        totalScore: item.totalScore,
        interventions: item.interventions,
        averageScore: item.interventions > 0 ? item.totalScore / item.interventions : 0,
      }))
      .sort((a, b) => b.totalScore - a.totalScore);

    res.json(ranking);
  } catch (error) {
    console.error('Get ranking error:', error);
    res.status(500).json({ error: 'Error calculating ranking' });
  }
});

// Create record
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { organ_id, country_id, quality_id, context_id, observations } = req.body;

    if (!organ_id || !country_id || !quality_id) {
      return res.status(400).json({ error: 'Organ, country, and quality are required' });
    }

    // Get quality value
    const quality = await prisma.qualityScale.findUnique({
      where: { id: parseInt(quality_id) },
    });

    if (!quality) {
      return res.status(400).json({ error: 'Invalid quality scale' });
    }

    // Get user's role weight
    const roleWeight = await prisma.roleWeight.findUnique({
      where: { user_role: req.user.role },
    });

    const weight = roleWeight ? roleWeight.weight : 1;

    // Calculate final score
    const finalScore = quality.value * weight;

    // Create record
    const record = await prisma.record.create({
      data: {
        user_id: req.user.id,
        organ_id: parseInt(organ_id),
        country_id: parseInt(country_id),
        quality_id: parseInt(quality_id),
        context_id: context_id ? parseInt(context_id) : null,
        role_weight_applied: weight,
        context_weight_applied: 1, // Default for now
        quality_value: quality.value,
        final_score: finalScore,
        observations: observations || null,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            user_role: true,
          },
        },
        organ: true,
        country: true,
        quality: true,
        context: true,
      },
    });

    // Create audit entry
    await prisma.recordAudit.create({
      data: {
        record_id: record.id,
        action_made: 'CREATE',
        performed_by: req.user.id,
      },
    });

    res.status(201).json(record);
  } catch (error) {
    console.error('Create record error:', error);
    res.status(500).json({ error: 'Error creating record' });
  }
});

// Delete record (admin only or own record)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const record = await prisma.record.findUnique({
      where: { id: parseInt(id) },
    });

    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }

    // Check permissions
    if (req.user.role !== 'admin' && record.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this record' });
    }

    // Create audit entry before deletion
    await prisma.recordAudit.create({
      data: {
        record_id: record.id,
        action_made: 'DELETE',
        performed_by: req.user.id,
      },
    });

    await prisma.record.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Record deleted successfully' });
  } catch (error) {
    console.error('Delete record error:', error);
    res.status(500).json({ error: 'Error deleting record' });
  }
});

export default router;
