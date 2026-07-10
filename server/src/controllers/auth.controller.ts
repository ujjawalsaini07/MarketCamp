import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';
import { appConfig } from '../config';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    const token = jwt.sign({ id: user.id }, appConfig.jwtSecret, { expiresIn: '7d' });

    res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name, plan: user.plan, settings: user.settings } });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id }, appConfig.jwtSecret, { expiresIn: '7d' });

    res.status(200).json({ token, user: { id: user.id, email: user.email, name: user.name, plan: user.plan, settings: user.settings } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const me = async (req: Request, res: Response) => {
  try {
    const userId = String((req as any).user.id);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ user: { id: user.id, email: user.email, name: user.name, plan: user.plan, settings: user.settings } });
  } catch (error) {
    console.error('Me error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = String((req as any).user.id);
    const { name, email } = req.body as { name?: string; email?: string };
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { email, name: name || null },
    });
    res.json({ user: { id: updated.id, email: updated.email, name: updated.name, plan: updated.plan, settings: updated.settings } });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'Email is already in use' });
    }
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updatePassword = async (req: Request, res: Response) => {
  try {
    const userId = String((req as any).user.id);
    const { newPassword } = req.body as { newPassword?: string };
    
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ message: 'A new password (min 8 chars) is required' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const lastChangeStr = user.lastPasswordChange ? user.lastPasswordChange.toISOString().split('T')[0] : null;

    if (lastChangeStr === todayStr && user.passwordChangeCount >= 2) {
      return res.status(429).json({ message: 'You can only change your password 2 times per day.' });
    }

    const newCount = lastChangeStr === todayStr ? user.passwordChangeCount + 1 : 1;
    const hashed = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({ 
      where: { id: userId }, 
      data: { 
        password: hashed,
        passwordChangeCount: newCount,
        lastPasswordChange: new Date()
      } 
    });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateSettings = async (req: Request, res: Response) => {
  try {
    const userId = String((req as any).user.id);
    const { settings } = req.body;
    
    if (!settings) {
      return res.status(400).json({ message: 'Settings payload required' });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { settings },
    });
    
    res.json({ settings: updated.settings });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
