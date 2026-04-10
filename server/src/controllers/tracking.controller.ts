import { Request, Response } from 'express';
import { prisma } from '../prisma';

// Track email open (1x1 pixel)
export const trackOpen = async (req: Request, res: Response) => {
  try {
    const { campaignId, contactId } = req.params;

    // Record the open event
    await prisma.campaignEvent.create({
      data: {
        type: 'OPEN',
        campaignId,
        contactId,
      },
    });

    // Increment open count on campaign
    await prisma.campaign.update({
      where: { id: campaignId },
      data: { openCount: { increment: 1 } },
    });

    // Return a 1x1 transparent pixel
    const pixel = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64'
    );
    res.setHeader('Content-Type', 'image/gif');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.end(pixel);
  } catch (error) {
    console.error('Track open error:', error);
    // Still return pixel even on error
    const pixel = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64'
    );
    res.setHeader('Content-Type', 'image/gif');
    res.end(pixel);
  }
};

// Track link click (redirect)
export const trackClick = async (req: Request, res: Response) => {
  try {
    const { campaignId, contactId } = req.params;
    const { url } = req.query;

    if (!url || typeof url !== 'string') {
      return res.status(400).send('Missing URL');
    }

    // Record the click event
    await prisma.campaignEvent.create({
      data: {
        type: 'CLICK',
        url: url,
        campaignId,
        contactId,
      },
    });

    // Increment click count on campaign
    await prisma.campaign.update({
      where: { id: campaignId },
      data: { clickCount: { increment: 1 } },
    });

    // Redirect to original URL
    res.redirect(302, url);
  } catch (error) {
    console.error('Track click error:', error);
    const { url } = req.query;
    if (url && typeof url === 'string') {
      res.redirect(302, url);
    } else {
      res.status(500).send('Error');
    }
  }
};

// Unsubscribe contact
export const unsubscribe = async (req: Request, res: Response) => {
  try {
    const { contactId } = req.params;

    await prisma.contact.update({
      where: { id: contactId },
      data: { unsubscribed: true },
    });

    // Return a simple HTML page
    res.send(`
      <!DOCTYPE html>
      <html>
      <head><title>Unsubscribed</title></head>
      <body style="font-family:Inter,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#fafaf8;">
        <div style="text-align:center;padding:40px;">
          <div style="width:64px;height:64px;border-radius:16px;background:linear-gradient(135deg,#346739,#79AE6F);margin:0 auto 20px;display:flex;align-items:center;justify-content:center;">
            <span style="color:white;font-size:28px;font-weight:bold;">C</span>
          </div>
          <h1 style="color:#1a1a1a;font-size:24px;margin-bottom:8px;">Unsubscribed</h1>
          <p style="color:#888;font-size:16px;">You have been successfully unsubscribed from our emails.</p>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Unsubscribe error:', error);
    res.status(500).send('Something went wrong');
  }
};

// Get analytics for a campaign
export const getCampaignAnalytics = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { campaignId } = req.params;

    const campaign = await prisma.campaign.findFirst({
      where: { id: campaignId, userId },
    });
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });

    const events = await prisma.campaignEvent.findMany({
      where: { campaignId },
    });

    const opens = events.filter((e) => e.type === 'OPEN').length;
    const clicks = events.filter((e) => e.type === 'CLICK').length;
    const bounces = events.filter((e) => e.type === 'BOUNCE').length;

    const uniqueOpens = new Set(events.filter((e) => e.type === 'OPEN').map((e) => e.contactId)).size;
    const uniqueClicks = new Set(events.filter((e) => e.type === 'CLICK').map((e) => e.contactId)).size;

    // Click URLs breakdown
    const clickUrls: Record<string, number> = {};
    events.filter((e) => e.type === 'CLICK' && e.url).forEach((e) => {
      clickUrls[e.url!] = (clickUrls[e.url!] || 0) + 1;
    });

    res.json({
      campaignId,
      sentCount: campaign.sentCount,
      openCount: campaign.openCount,
      clickCount: campaign.clickCount,
      totalOpens: opens,
      totalClicks: clicks,
      totalBounces: bounces,
      uniqueOpens,
      uniqueClicks,
      openRate: campaign.sentCount > 0 ? ((uniqueOpens / campaign.sentCount) * 100).toFixed(1) : '0',
      clickRate: campaign.sentCount > 0 ? ((uniqueClicks / campaign.sentCount) * 100).toFixed(1) : '0',
      clickUrls,
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get overall analytics
export const getOverallAnalytics = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const campaigns = await prisma.campaign.findMany({ where: { userId } });
    const totalSent = campaigns.reduce((sum, c) => sum + c.sentCount, 0);
    const totalOpens = campaigns.reduce((sum, c) => sum + c.openCount, 0);
    const totalClicks = campaigns.reduce((sum, c) => sum + c.clickCount, 0);
    const totalContacts = await prisma.contact.count({ where: { userId } });

    res.json({
      totalCampaigns: campaigns.length,
      totalSent,
      totalOpens,
      totalClicks,
      totalContacts,
      avgOpenRate: totalSent > 0 ? ((totalOpens / totalSent) * 100).toFixed(1) : '0',
      avgClickRate: totalSent > 0 ? ((totalClicks / totalSent) * 100).toFixed(1) : '0',
    });
  } catch (error) {
    console.error('Get overall analytics error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
