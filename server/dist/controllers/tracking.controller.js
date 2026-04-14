"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCampaignRecipientStatuses = exports.getOverallAnalytics = exports.getCampaignAnalytics = exports.unsubscribe = exports.trackClick = exports.trackOpen = void 0;
const prisma_1 = require("../prisma");
// Track email open (1x1 pixel)
const trackOpen = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const campaignId = String(req.params.campaignId);
        const contactId = String(req.params.contactId);
        const existingOpen = yield prisma_1.prisma.campaignEvent.findFirst({
            where: { campaignId, contactId, type: 'OPEN' },
            select: { id: true },
        });
        if (!existingOpen) {
            yield prisma_1.prisma.campaignEvent.create({
                data: {
                    type: 'OPEN',
                    campaignId,
                    contactId,
                },
            });
            yield prisma_1.prisma.campaign.update({
                where: { id: campaignId },
                data: { openCount: { increment: 1 } },
            });
        }
        // Return a 1x1 transparent pixel
        const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
        res.setHeader('Content-Type', 'image/gif');
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.end(pixel);
    }
    catch (error) {
        console.error('Track open error:', error);
        // Still return pixel even on error
        const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
        res.setHeader('Content-Type', 'image/gif');
        res.end(pixel);
    }
});
exports.trackOpen = trackOpen;
// Track link click (redirect)
const trackClick = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const campaignId = String(req.params.campaignId);
        const contactId = String(req.params.contactId);
        const { url } = req.query;
        if (!url || typeof url !== 'string') {
            return res.status(400).send('Missing URL');
        }
        if (!/^https?:\/\//i.test(url)) {
            return res.status(400).send('Invalid URL');
        }
        const existingUniqueClick = yield prisma_1.prisma.campaignEvent.findFirst({
            where: { campaignId, contactId, type: 'CLICK', url },
            select: { id: true },
        });
        if (!existingUniqueClick) {
            yield prisma_1.prisma.campaignEvent.create({
                data: {
                    type: 'CLICK',
                    url,
                    campaignId,
                    contactId,
                },
            });
            yield prisma_1.prisma.campaign.update({
                where: { id: campaignId },
                data: { clickCount: { increment: 1 } },
            });
        }
        yield prisma_1.prisma.campaignEvent.create({
            data: {
                type: 'PAGE_VISIT',
                url,
                campaignId,
                contactId,
            },
        });
        // Redirect to original URL
        res.redirect(302, url);
    }
    catch (error) {
        console.error('Track click error:', error);
        const { url } = req.query;
        if (url && typeof url === 'string') {
            res.redirect(302, url);
        }
        else {
            res.status(500).send('Error');
        }
    }
});
exports.trackClick = trackClick;
// Unsubscribe contact
const unsubscribe = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const contactId = String(req.params.contactId);
        const campaignId = typeof req.query.campaignId === 'string' ? req.query.campaignId : undefined;
        yield prisma_1.prisma.contact.update({
            where: { id: contactId },
            data: { unsubscribed: true },
        });
        if (campaignId) {
            const existingUnsub = yield prisma_1.prisma.campaignEvent.findFirst({
                where: { campaignId, contactId, type: 'UNSUBSCRIBE' },
                select: { id: true },
            });
            if (!existingUnsub) {
                yield prisma_1.prisma.campaignEvent.create({
                    data: {
                        type: 'UNSUBSCRIBE',
                        campaignId,
                        contactId,
                    },
                });
            }
        }
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
    }
    catch (error) {
        console.error('Unsubscribe error:', error);
        res.status(500).send('Something went wrong');
    }
});
exports.unsubscribe = unsubscribe;
// Get analytics for a campaign
const getCampaignAnalytics = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = String(req.user.id);
        const campaignId = String(req.params.campaignId);
        const campaign = yield prisma_1.prisma.campaign.findFirst({
            where: { id: campaignId, userId },
        });
        if (!campaign)
            return res.status(404).json({ message: 'Campaign not found' });
        const events = yield prisma_1.prisma.campaignEvent.findMany({
            where: { campaignId },
        });
        const opens = events.filter((e) => e.type === 'OPEN').length;
        const clicks = events.filter((e) => e.type === 'CLICK').length;
        const bounces = events.filter((e) => e.type === 'BOUNCE').length;
        const sentEvents = events.filter((e) => e.type === 'SENT').length;
        const unsubscribes = events.filter((e) => e.type === 'UNSUBSCRIBE').length;
        const pageVisits = events.filter((e) => e.type === 'PAGE_VISIT').length;
        const uniqueOpens = new Set(events.filter((e) => e.type === 'OPEN').map((e) => e.contactId)).size;
        const uniqueClicks = new Set(events.filter((e) => e.type === 'CLICK').map((e) => e.contactId)).size;
        // Click URLs breakdown
        const clickUrls = {};
        events.filter((e) => e.type === 'CLICK' && e.url).forEach((e) => {
            clickUrls[e.url] = (clickUrls[e.url] || 0) + 1;
        });
        const visitedPages = {};
        events.filter((e) => e.type === 'PAGE_VISIT' && e.url).forEach((e) => {
            try {
                const pathname = new URL(e.url).pathname || '/';
                visitedPages[pathname] = (visitedPages[pathname] || 0) + 1;
            }
            catch (_a) {
                visitedPages[e.url] = (visitedPages[e.url] || 0) + 1;
            }
        });
        const uniqueVisitors = new Set(events.filter((e) => e.type === 'PAGE_VISIT').map((e) => e.contactId)).size;
        res.json({
            campaignId,
            sentCount: campaign.sentCount,
            sentEvents,
            openCount: campaign.openCount,
            clickCount: campaign.clickCount,
            totalOpens: opens,
            totalClicks: clicks,
            totalBounces: bounces,
            totalUnsubscribes: unsubscribes,
            totalPageVisits: pageVisits,
            uniqueVisitors,
            uniqueOpens,
            uniqueClicks,
            openRate: campaign.sentCount > 0 ? ((uniqueOpens / campaign.sentCount) * 100).toFixed(1) : '0',
            clickRate: campaign.sentCount > 0 ? ((uniqueClicks / campaign.sentCount) * 100).toFixed(1) : '0',
            unsubscribeRate: campaign.sentCount > 0 ? ((unsubscribes / campaign.sentCount) * 100).toFixed(1) : '0',
            clickUrls,
            visitedPages,
        });
    }
    catch (error) {
        console.error('Get analytics error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getCampaignAnalytics = getCampaignAnalytics;
// Get overall analytics
const getOverallAnalytics = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = String(req.user.id);
        const campaigns = yield prisma_1.prisma.campaign.findMany({
            where: { userId },
            select: { id: true, sentCount: true, openCount: true, clickCount: true },
        });
        const totalSent = campaigns.reduce((sum, c) => sum + c.sentCount, 0);
        const totalOpens = campaigns.reduce((sum, c) => sum + c.openCount, 0);
        const totalClicks = campaigns.reduce((sum, c) => sum + c.clickCount, 0);
        const totalContacts = yield prisma_1.prisma.contact.count({ where: { userId } });
        const unsubscribedContacts = yield prisma_1.prisma.contact.count({ where: { userId, unsubscribed: true } });
        const totalPageVisits = yield prisma_1.prisma.campaignEvent.count({
            where: {
                type: 'PAGE_VISIT',
                campaign: { userId },
            },
        });
        res.json({
            totalCampaigns: campaigns.length,
            totalSent,
            totalOpens,
            totalClicks,
            totalContacts,
            unsubscribedContacts,
            totalPageVisits,
            unsubscribeRate: totalContacts > 0 ? ((unsubscribedContacts / totalContacts) * 100).toFixed(1) : '0',
            avgOpenRate: totalSent > 0 ? ((totalOpens / totalSent) * 100).toFixed(1) : '0',
            avgClickRate: totalSent > 0 ? ((totalClicks / totalSent) * 100).toFixed(1) : '0',
        });
    }
    catch (error) {
        console.error('Get overall analytics error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getOverallAnalytics = getOverallAnalytics;
const getCampaignRecipientStatuses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = String(req.user.id);
        const campaignId = String(req.params.campaignId);
        const campaign = yield prisma_1.prisma.campaign.findFirst({
            where: { id: campaignId, userId },
            include: { audiences: { include: { contacts: true } } },
        });
        if (!campaign)
            return res.status(404).json({ message: 'Campaign not found' });
        const recipientsMap = new Map();
        campaign.audiences.forEach((aud) => {
            aud.contacts.forEach((contact) => {
                recipientsMap.set(contact.id, contact);
            });
        });
        const recipientIds = Array.from(recipientsMap.keys());
        const events = yield prisma_1.prisma.campaignEvent.findMany({
            where: { campaignId, contactId: { in: recipientIds } },
            orderBy: { createdAt: 'asc' },
        });
        const recipients = recipientIds.map((contactId) => {
            const contact = recipientsMap.get(contactId);
            const contactEvents = events.filter((e) => e.contactId === contactId);
            const sent = contactEvents.some((e) => e.type === 'SENT');
            const opened = contactEvents.some((e) => e.type === 'OPEN');
            const clicked = contactEvents.some((e) => e.type === 'CLICK');
            const unsubscribed = contactEvents.some((e) => e.type === 'UNSUBSCRIBE') || (contact === null || contact === void 0 ? void 0 : contact.unsubscribed);
            const pageVisits = contactEvents.filter((e) => e.type === 'PAGE_VISIT').length;
            const status = unsubscribed ? 'UNSUBSCRIBED' : clicked ? 'CLICKED' : opened ? 'OPENED' : sent ? 'SENT' : 'PENDING';
            return {
                contactId,
                email: contact === null || contact === void 0 ? void 0 : contact.email,
                name: contact === null || contact === void 0 ? void 0 : contact.name,
                status,
                sent,
                opened,
                clicked,
                unsubscribed,
                pageVisits,
            };
        });
        res.json({ campaignId, recipients });
    }
    catch (error) {
        console.error('Get recipient statuses error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getCampaignRecipientStatuses = getCampaignRecipientStatuses;
