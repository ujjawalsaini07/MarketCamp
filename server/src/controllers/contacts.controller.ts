import { Request, Response } from 'express';
import { prisma } from '../prisma';
import { parse } from 'csv-parse/sync';

// Get all contacts for user
export const getContacts = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const contacts = await prisma.contact.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ contacts });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create a contact
export const createContact = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { email, name, attributes } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const contact = await prisma.contact.create({
      data: { email, name, attributes, userId },
    });
    res.status(201).json({ contact });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'Contact with this email already exists' });
    }
    console.error('Create contact error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Bulk import contacts via CSV
export const importContacts = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { csvData } = req.body;

    if (!csvData) {
      return res.status(400).json({ message: 'CSV data is required' });
    }

    const records = parse(csvData, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    const contacts = [];
    const errors: string[] = [];

    for (const record of records) {
      const email = record.email || record.Email || record.EMAIL;
      const name = record.name || record.Name || record.NAME || null;

      if (!email) {
        errors.push(`Row missing email: ${JSON.stringify(record)}`);
        continue;
      }

      try {
        const contact = await prisma.contact.upsert({
          where: { userId_email: { userId, email } },
          update: { name: name || undefined },
          create: { email, name, userId },
        });
        contacts.push(contact);
      } catch (err) {
        errors.push(`Failed to import ${email}`);
      }
    }

    res.json({
      message: `Imported ${contacts.length} contacts`,
      imported: contacts.length,
      errors: errors.length,
      errorDetails: errors.slice(0, 10),
    });
  } catch (error) {
    console.error('Import contacts error:', error);
    res.status(500).json({ message: 'Failed to parse CSV data' });
  }
};

// Delete a contact
export const deleteContact = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    await prisma.contact.deleteMany({ where: { id, userId } });
    res.json({ message: 'Contact deleted' });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Unsubscribe a contact  
export const unsubscribeContact = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.contact.update({
      where: { id },
      data: { unsubscribed: true },
    });
    res.json({ message: 'Unsubscribed successfully' });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
