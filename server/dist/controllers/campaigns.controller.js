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
exports.sendCampaign = exports.deleteCampaign = exports.updateCampaign = exports.createCampaign = exports.getCampaign = exports.getCampaigns = void 0;
const prisma_1 = require("../prisma");
const config_1 = require("../config");
// Get all campaigns for user
const getCampaigns = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = String(req.user.id);
        const campaigns = yield prisma_1.prisma.campaign.findMany({
            where: { userId },
            include: { template: true, audiences: true },
            orderBy: { createdAt: 'desc' },
        });
        res.json({ campaigns });
    }
    catch (error) {
        console.error('Get campaigns error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getCampaigns = getCampaigns;
// Get single campaign
const getCampaign = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = String(req.user.id);
        const id = String(req.params.id);
        const campaign = yield prisma_1.prisma.campaign.findFirst({
            where: { id, userId },
            include: { template: true, audiences: { include: { contacts: true } }, events: true },
        });
        if (!campaign)
            return res.status(404).json({ message: 'Campaign not found' });
        res.json({ campaign });
    }
    catch (error) {
        console.error('Get campaign error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getCampaign = getCampaign;
// Create campaign
const createCampaign = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = String(req.user.id);
        const { name, subject, templateId, audienceIds } = req.body;
        if (!name || !subject) {
            return res.status(400).json({ message: 'Name and subject are required' });
        }
        const campaign = yield prisma_1.prisma.campaign.create({
            data: {
                name,
                subject,
                userId,
                templateId: templateId || null,
                audiences: audienceIds ? { connect: audienceIds.map((id) => ({ id })) } : undefined,
            },
            include: { template: true, audiences: true },
        });
        res.status(201).json({ campaign });
    }
    catch (error) {
        console.error('Create campaign error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.createCampaign = createCampaign;
// Update campaign
const updateCampaign = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = String(req.user.id);
        const id = String(req.params.id);
        const { name, subject, status, templateId } = req.body;
        const existing = yield prisma_1.prisma.campaign.findFirst({ where: { id, userId } });
        if (!existing)
            return res.status(404).json({ message: 'Campaign not found' });
        const campaign = yield prisma_1.prisma.campaign.update({
            where: { id },
            data: Object.assign(Object.assign(Object.assign(Object.assign({}, (name && { name })), (subject && { subject })), (status && { status })), (templateId && { templateId })),
        });
        res.json({ campaign });
    }
    catch (error) {
        console.error('Update campaign error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.updateCampaign = updateCampaign;
// Delete campaign
const deleteCampaign = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = String(req.user.id);
        const id = String(req.params.id);
        // Delete related events first
        yield prisma_1.prisma.campaignEvent.deleteMany({ where: { campaignId: id } });
        yield prisma_1.prisma.campaign.deleteMany({ where: { id, userId } });
        res.json({ message: 'Campaign deleted' });
    }
    catch (error) {
        console.error('Delete campaign error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.deleteCampaign = deleteCampaign;
// Send campaign (trigger bulk email)
const sendCampaign = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = String(req.user.id);
        const id = String(req.params.id);
        const campaign = yield prisma_1.prisma.campaign.findFirst({
            where: { id, userId },
            include: {
                template: true,
                audiences: { include: { contacts: { where: { unsubscribed: false } } } },
            },
        });
        if (!campaign)
            return res.status(404).json({ message: 'Campaign not found' });
        if (!campaign.template)
            return res.status(400).json({ message: 'Campaign needs a template' });
        if (campaign.audiences.length === 0)
            return res.status(400).json({ message: 'Campaign needs at least one audience' });
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
        yield prisma_1.prisma.campaign.update({
            where: { id },
            data: { status: 'SENDING' },
        });
        // Dispatch emails (in production, this would use BullMQ)
        if (!config_1.appConfig.emailServiceUrl) {
            return res.status(500).json({ message: 'EMAIL_SERVICE_URL is not configured' });
        }
        const backendUrl = config_1.appConfig.backendUrl || `http://localhost:${config_1.appConfig.port}`;
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
                htmlContent = htmlContent.replace(/href=(['"])(.*?)\1/gi, (match, quote, url) => {
                    if (!url || !/^https?:\/\//i.test(url)) {
                        return match;
                    }
                    const trackUrl = `${backendUrl}/api/track/click/${campaign.id}/${contact.id}?url=${encodeURIComponent(url)}`;
                    return `href=${quote}${trackUrl}${quote}`;
                });
                // Add unsubscribe link
                const unsubLink = `${backendUrl}/api/track/unsubscribe/${contact.id}?campaignId=${campaign.id}`;
                htmlContent += `<p style="text-align:center;padding:16px;font-size:12px;color:#999;">
          <a href="${unsubLink}" style="color:#999;">Unsubscribe</a>
        </p>`;
                // Send via email service
                const sendRes = yield fetch(`${config_1.appConfig.emailServiceUrl}/api/send`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: contact.email,
                        subject: campaign.subject,
                        htmlContent,
                    }),
                });
                if (!sendRes.ok) {
                    const errorText = yield sendRes.text();
                    throw new Error(`Email service error: ${sendRes.status} ${errorText}`);
                }
                yield prisma_1.prisma.campaignEvent.create({
                    data: {
                        type: 'SENT',
                        campaignId: campaign.id,
                        contactId: contact.id,
                    },
                });
                sentCount++;
            }
            catch (err) {
                console.error(`Failed to send to ${contact.email}:`, err);
            }
        }
        // Update campaign
        yield prisma_1.prisma.campaign.update({
            where: { id },
            data: { status: 'COMPLETED', sentCount },
        });
        res.json({ message: `Campaign sent to ${sentCount} contacts`, sentCount });
    }
    catch (error) {
        console.error('Send campaign error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.sendCampaign = sendCampaign;
