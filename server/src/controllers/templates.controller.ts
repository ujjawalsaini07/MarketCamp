import { Request, Response } from 'express';
import { prisma } from '../prisma';

// Get all templates for user
export const getTemplates = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const templates = await prisma.template.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ templates });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create template
export const createTemplate = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { name, htmlContent } = req.body;

    if (!name || !htmlContent) {
      return res.status(400).json({ message: 'Name and htmlContent are required' });
    }

    const template = await prisma.template.create({
      data: { name, htmlContent, userId },
    });
    res.status(201).json({ template });
  } catch (error) {
    console.error('Create template error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update template
export const updateTemplate = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const { name, htmlContent } = req.body;

    const existing = await prisma.template.findFirst({ where: { id, userId } });
    if (!existing) return res.status(404).json({ message: 'Template not found' });

    const template = await prisma.template.update({
      where: { id },
      data: { ...(name && { name }), ...(htmlContent && { htmlContent }) },
    });
    res.json({ template });
  } catch (error) {
    console.error('Update template error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete template
export const deleteTemplate = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    await prisma.template.deleteMany({ where: { id, userId } });
    res.json({ message: 'Template deleted' });
  } catch (error) {
    console.error('Delete template error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
