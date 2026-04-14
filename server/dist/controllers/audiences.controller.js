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
exports.deleteAudience = exports.updateAudience = exports.createAudience = exports.getAudiences = void 0;
const prisma_1 = require("../prisma");
const getAudiences = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = String(req.user.id);
        const audiences = yield prisma_1.prisma.audience.findMany({
            where: { userId },
            include: {
                contacts: {
                    select: { id: true, email: true, name: true, unsubscribed: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json({ audiences });
    }
    catch (error) {
        console.error('Get audiences error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getAudiences = getAudiences;
const createAudience = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = String(req.user.id);
        const { name, contactIds } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Name is required' });
        }
        const audience = yield prisma_1.prisma.audience.create({
            data: {
                name,
                userId,
                contacts: (contactIds === null || contactIds === void 0 ? void 0 : contactIds.length)
                    ? {
                        connect: contactIds.map((id) => ({ id })),
                    }
                    : undefined,
            },
            include: { contacts: true },
        });
        res.status(201).json({ audience });
    }
    catch (error) {
        console.error('Create audience error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.createAudience = createAudience;
const updateAudience = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = String(req.user.id);
        const id = String(req.params.id);
        const { name, contactIds } = req.body;
        const existing = yield prisma_1.prisma.audience.findFirst({ where: { id, userId }, select: { id: true } });
        if (!existing) {
            return res.status(404).json({ message: 'Audience not found' });
        }
        const audience = yield prisma_1.prisma.audience.update({
            where: { id },
            data: Object.assign(Object.assign({}, (name ? { name } : {})), (contactIds
                ? {
                    contacts: {
                        set: contactIds.map((contactId) => ({ id: contactId })),
                    },
                }
                : {})),
            include: { contacts: true },
        });
        res.json({ audience });
    }
    catch (error) {
        console.error('Update audience error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.updateAudience = updateAudience;
const deleteAudience = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = String(req.user.id);
        const id = String(req.params.id);
        yield prisma_1.prisma.audience.deleteMany({ where: { id, userId } });
        res.json({ message: 'Audience deleted' });
    }
    catch (error) {
        console.error('Delete audience error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.deleteAudience = deleteAudience;
