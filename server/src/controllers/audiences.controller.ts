import { Request, Response } from 'express';
import { prisma } from '../prisma';

export const getAudiences = async (req: Request, res: Response) => {
  try {
    const userId = String((req as any).user.id);
    const audiences = await prisma.audience.findMany({
      where: { userId },
      include: {
        contacts: {
          select: { id: true, email: true, name: true, unsubscribed: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ audiences });
  } catch (error) {
    console.error('Get audiences error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createAudience = async (req: Request, res: Response) => {
  try {
    const userId = String((req as any).user.id);
    const { name, contactIds } = req.body as { name?: string; contactIds?: string[] };

    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const audience = await prisma.audience.create({
      data: {
        name,
        userId,
        contacts: contactIds?.length
          ? {
              connect: contactIds.map((id) => ({ id })),
            }
          : undefined,
      },
      include: { contacts: true },
    });

    res.status(201).json({ audience });
  } catch (error) {
    console.error('Create audience error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateAudience = async (req: Request, res: Response) => {
  try {
    const userId = String((req as any).user.id);
    const id = String(req.params.id);
    const { name, contactIds } = req.body as { name?: string; contactIds?: string[] };

    const existing = await prisma.audience.findFirst({ where: { id, userId }, select: { id: true } });
    if (!existing) {
      return res.status(404).json({ message: 'Audience not found' });
    }

    const audience = await prisma.audience.update({
      where: { id },
      data: {
        ...(name ? { name } : {}),
        ...(contactIds
          ? {
              contacts: {
                set: contactIds.map((contactId) => ({ id: contactId })),
              },
            }
          : {}),
      },
      include: { contacts: true },
    });

    res.json({ audience });
  } catch (error) {
    console.error('Update audience error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteAudience = async (req: Request, res: Response) => {
  try {
    const userId = String((req as any).user.id);
    const id = String(req.params.id);
    await prisma.audience.deleteMany({ where: { id, userId } });
    res.json({ message: 'Audience deleted' });
  } catch (error) {
    console.error('Delete audience error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
