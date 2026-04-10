import { Request, Response } from 'express';
import { prisma } from '../prisma';

// Get all campaigns for user
export const getCampaigns = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const campaigns = await prisma.campaign.findMany({
      where: { userId },
      include: { template: true, audiences: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ campaigns });
  } catch (error) {
    console.error('Get campaigns error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get single campaign
export const getCampaign = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const campaign = await prisma.campaign.findFirst({
      where: { id, userId },
      include: { template: true, audiences: { include: { contacts: true } }, events: true },
    });
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
    res.json({ campaign });
  } catch (error) {
    console.error('Get campaign error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create campaign
export const createCampaign = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { name, subject, templateId, audienceIds } = req.body;

    if (!name || !subject) {
      return res.status(400).json({ message: 'Name and subject are required' });
    }

    const campaign = await prisma.campaign.create({
      data: {
        name,
        subject,
        userId,
        templateId: templateId || null,
        audiences: audienceIds ? { connect: audienceIds.map((id: string) => ({ id })) } : undefined,
      },
      include: { template: true, audiences: true },
    });
    res.status(201).json({ campaign });
  } catch (error) {
    console.error('Create campaign error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update campaign
export const updateCampaign = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const { name, subject, status, templateId } = req.body;

    const existing = await prisma.campaign.findFirst({ where: { id, userId } });
    if (!existing) return res.status(404).json({ message: 'Campaign not found' });

    const campaign = await prisma.campaign.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(subject && { subject }),
        ...(status && { status }),
        ...(templateId && { templateId }),
      },
    });
    res.json({ campaign });
  } catch (error) {
    console.error('Update campaign error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete campaign
export const deleteCampaign = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    // Delete related events first
    await prisma.campaignEvent.deleteMany({ where: { campaignId: id } });
    await prisma.campaign.deleteMany({ where: { id, userId } });
    res.json({ message: 'Campaign deleted' });
  } catch (error) {
    console.error('Delete campaign error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Send campaign (trigger bulk email)
export const sendCampaign = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const campaign = await prisma.campaign.findFirst({
      where: { id, userId },
      include: {
        template: true,
        audiences: { include: { contacts: { where: { unsubscribed: false } } } },
      },
    });

    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
    if (!campaign.template) return res.status(400).json({ message: 'Campaign needs a template' });
    if (campaign.audiences.length === 0) return res.status(400).json({ message: 'Campaign needs at least one audience' });

    // Collect unique contacts
    const contactMap = new Map();
    campaign.audiences.forEach((aud) => {
      aud.contacts.forEach((c) => contactMap.set(c.id, c));
    });
    const contacts = Array.from(contactMap.values());

    if (contacts.length === 0) {
      return res.status(400).json({ message: 'No subscribeable contacts found' });
    }

    // Update campaign status
    await prisma.campaign.update({
      where: { id },
      data: { status: 'SENDING' },
    });

    // Dispatch emails (in production, this would use BullMQ)
    const emailServiceUrl = process.env.EMAIL_SERVICE_URL;
    const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
    let sentCount = 0;

    for (const contact of contacts) {
      try {
        // Inject tracking pixel and rewrite links
        let htmlContent = campaign.template.htmlContent;

        // Add open tracking pixel
        const trackingPixel = `<img src="${backendUrl}/api/track/open/${campaign.id}/${contact.id}" width="1" height="1" style="display:none;" />`;
        htmlContent = htmlContent.replace('</body>', `${trackingPixel}</body>`);
        if (!htmlContent.includes('</body>')) {
          htmlContent += trackingPixel;
        }

        // Rewrite links for click tracking
        htmlContent = htmlContent.replace(
          /href="(https?:\/\/[^"]+)"/g,
          (match: string, url: string) => {
            const trackUrl = `${backendUrl}/api/track/click/${campaign.id}/${contact.id}?url=${encodeURIComponent(url)}`;
            return `href="${trackUrl}"`;
          }
        );

        // Add unsubscribe link
        const unsubLink = `${backendUrl}/api/track/unsubscribe/${contact.id}`;
        htmlContent += `<p style="text-align:center;padding:16px;font-size:12px;color:#999;">
          <a href="${unsubLink}" style="color:#999;">Unsubscribe</a>
        </p>`;

        // Send via email service
        await fetch(`${emailServiceUrl}/api/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: contact.email,
            subject: campaign.subject,
            htmlContent,
          }),
        });

        sentCount++;
      } catch (err) {
        console.error(`Failed to send to ${contact.email}:`, err);
      }
    }

    // Update campaign
    await prisma.campaign.update({
      where: { id },
      data: { status: 'COMPLETED', sentCount },
    });

    res.json({ message: `Campaign sent to ${sentCount} contacts`, sentCount });
  } catch (error) {
    console.error('Send campaign error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
