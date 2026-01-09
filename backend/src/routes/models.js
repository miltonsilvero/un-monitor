import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get all models
router.get('/', authenticateToken, async (req, res) => {
  try {
    const models = await prisma.model.findMany({
      include: {
        models_organs: {
          include: {
            organ: {
              include: {
                organ_countries: {
                  include: {
                    country: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    // Transform data for frontend
    const transformedModels = models.map(model => ({
      id: model.id,
      name: model.name,
      created_at: model.created_at,
      organs: model.models_organs.map(mo => ({
        id: mo.organ.id,
        name: mo.organ.name,
        countries: mo.organ.organ_countries.map(oc => oc.country),
      })),
    }));

    res.json(transformedModels);
  } catch (error) {
    console.error('Get models error:', error);
    res.status(500).json({ error: 'Error fetching models' });
  }
});

// Get single model
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const model = await prisma.model.findUnique({
      where: { id: parseInt(id) },
      include: {
        models_organs: {
          include: {
            organ: {
              include: {
                organ_countries: {
                  include: {
                    country: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!model) {
      return res.status(404).json({ error: 'Model not found' });
    }

    const transformedModel = {
      id: model.id,
      name: model.name,
      created_at: model.created_at,
      organs: model.models_organs.map(mo => ({
        id: mo.organ.id,
        name: mo.organ.name,
        countries: mo.organ.organ_countries.map(oc => oc.country),
      })),
    };

    res.json(transformedModel);
  } catch (error) {
    console.error('Get model error:', error);
    res.status(500).json({ error: 'Error fetching model' });
  }
});

// Create model (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, organs } = req.body;

    if (!name || !organs || !Array.isArray(organs) || organs.length === 0) {
      return res.status(400).json({ error: 'Model name and organs required' });
    }

    // Check if model name already exists
    const existingModel = await prisma.model.findUnique({
      where: { name },
    });

    if (existingModel) {
      return res.status(400).json({ error: 'Model name already exists' });
    }

    // Create model with organs and countries
    const model = await prisma.model.create({
      data: {
        name,
      },
    });

    // Process each organ
    for (const organData of organs) {
      // Find or create organ
      let organ = await prisma.organ.findUnique({
        where: { name: organData.name },
      });

      if (!organ) {
        organ = await prisma.organ.create({
          data: { name: organData.name },
        });
      }

      // Associate organ with model
      await prisma.modelOrgan.create({
        data: {
          model_id: model.id,
          organ_id: organ.id,
        },
      });

      // Process countries for this organ
      if (organData.countries && Array.isArray(organData.countries)) {
        for (const countryData of organData.countries) {
          // Find or create country
          let country = await prisma.country.findFirst({
            where: { name: countryData.name },
          });

          if (!country) {
            country = await prisma.country.create({
              data: {
                name: countryData.name,
                iso_code: countryData.iso_code || countryData.name.substring(0, 2).toUpperCase(),
              },
            });
          }

          // Associate country with organ (if not already associated)
          const existingAssoc = await prisma.organCountry.findUnique({
            where: {
              organ_id_country_id: {
                organ_id: organ.id,
                country_id: country.id,
              },
            },
          });

          if (!existingAssoc) {
            await prisma.organCountry.create({
              data: {
                organ_id: organ.id,
                country_id: country.id,
              },
            });
          }
        }
      }
    }

    // Fetch complete model with relations
    const completeModel = await prisma.model.findUnique({
      where: { id: model.id },
      include: {
        models_organs: {
          include: {
            organ: {
              include: {
                organ_countries: {
                  include: {
                    country: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const transformedModel = {
      id: completeModel.id,
      name: completeModel.name,
      created_at: completeModel.created_at,
      organs: completeModel.models_organs.map(mo => ({
        id: mo.organ.id,
        name: mo.organ.name,
        countries: mo.organ.organ_countries.map(oc => oc.country),
      })),
    };

    res.status(201).json(transformedModel);
  } catch (error) {
    console.error('Create model error:', error);
    res.status(500).json({ error: 'Error creating model' });
  }
});

// Delete model (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.model.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Model deleted successfully' });
  } catch (error) {
    console.error('Delete model error:', error);
    res.status(500).json({ error: 'Error deleting model' });
  }
});

export default router;
