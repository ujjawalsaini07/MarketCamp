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
exports.deleteTemplate = exports.updateTemplate = exports.createTemplate = exports.getTemplates = void 0;
const prisma_1 = require("../prisma");
// Get all templates for user
const getTemplates = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = String(req.user.id);
        const templates = yield prisma_1.prisma.template.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
        res.json({ templates });
    }
    catch (error) {
        console.error('Get templates error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getTemplates = getTemplates;
// Create template
const createTemplate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = String(req.user.id);
        const { name, htmlContent } = req.body;
        if (!name || !htmlContent) {
            return res.status(400).json({ message: 'Name and htmlContent are required' });
        }
        const template = yield prisma_1.prisma.template.create({
            data: { name, htmlContent, userId },
        });
        res.status(201).json({ template });
    }
    catch (error) {
        console.error('Create template error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.createTemplate = createTemplate;
// Update template
const updateTemplate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = String(req.user.id);
        const id = String(req.params.id);
        const { name, htmlContent } = req.body;
        const existing = yield prisma_1.prisma.template.findFirst({ where: { id, userId } });
        if (!existing)
            return res.status(404).json({ message: 'Template not found' });
        const template = yield prisma_1.prisma.template.update({
            where: { id },
            data: Object.assign(Object.assign({}, (name && { name })), (htmlContent && { htmlContent })),
        });
        res.json({ template });
    }
    catch (error) {
        console.error('Update template error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.updateTemplate = updateTemplate;
// Delete template
const deleteTemplate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = String(req.user.id);
        const id = String(req.params.id);
        yield prisma_1.prisma.template.deleteMany({ where: { id, userId } });
        res.json({ message: 'Template deleted' });
    }
    catch (error) {
        console.error('Delete template error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.deleteTemplate = deleteTemplate;
