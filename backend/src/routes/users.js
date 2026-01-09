import express from 'express';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get all users (admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        user_role: true,
        is_active: true,
        created_at: true,
      },
    });
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Error fetching users' });
  }
});

// Create user (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { username, password, user_role } = req.body;

    if (!username || !password || !user_role) {
      return res.status(400).json({ error: 'Username, password, and role required' });
    }

    if (!['admin', 'mesa', 'supervisor'].includes(user_role)) {
      return res.status(400).json({ error: 'Invalid user role' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        password_hash: hashedPassword,
        user_role,
        is_active: true,
      },
      select: {
        id: true,
        username: true,
        user_role: true,
        is_active: true,
        created_at: true,
      },
    });

    res.status(201).json(user);
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Error creating user' });
  }
});

// Update user (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, user_role, is_active } = req.body;

    const updateData = {};
    
    if (username) {
      const existingUser = await prisma.user.findFirst({
        where: { username, NOT: { id: parseInt(id) } },
      });
      if (existingUser) {
        return res.status(400).json({ error: 'Username already exists' });
      }
      updateData.username = username;
    }
    
    if (password) {
      updateData.password_hash = await bcrypt.hash(password, 10);
    }
    
    if (user_role) {
      if (!['admin', 'mesa', 'supervisor'].includes(user_role)) {
        return res.status(400).json({ error: 'Invalid user role' });
      }
      updateData.user_role = user_role;
    }
    
    if (typeof is_active === 'boolean') {
      updateData.is_active = is_active;
    }

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: updateData,
      select: {
        id: true,
        username: true,
        user_role: true,
        is_active: true,
        created_at: true,
      },
    });

    res.json(user);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Error updating user' });
  }
});

// Delete user (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting admin user
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
    });

    if (user.username === 'admin') {
      return res.status(400).json({ error: 'Cannot delete admin user' });
    }

    await prisma.user.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Error deleting user' });
  }
});

export default router;
