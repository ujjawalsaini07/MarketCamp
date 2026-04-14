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
exports.unsubscribeContact = exports.deleteContact = exports.importContacts = exports.createContact = exports.getContacts = void 0;
const prisma_1 = require("../prisma");
const parseCsvData = (csvData) => {
    const lines = csvData
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);
    if (lines.length < 2) {
        return [];
    }
    const headers = lines[0].split(',').map((header) => header.trim());
    return lines.slice(1).map((line) => {
        const values = line.split(',').map((value) => value.trim());
        return headers.reduce((acc, key, index) => {
            acc[key] = values[index] || '';
            return acc;
        }, {});
    });
};
// Get all contacts for user
const getContacts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = String(req.user.id);
        const contacts = yield prisma_1.prisma.contact.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
        res.json({ contacts });
    }
    catch (error) {
        console.error('Get contacts error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getContacts = getContacts;
// Create a contact
const createContact = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = String(req.user.id);
        const { email, name, attributes } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }
        const contact = yield prisma_1.prisma.contact.create({
            data: { email, name, attributes, userId },
        });
        res.status(201).json({ contact });
    }
    catch (error) {
        if (error.code === 'P2002') {
            return res.status(409).json({ message: 'Contact with this email already exists' });
        }
        console.error('Create contact error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.createContact = createContact;
// Bulk import contacts via CSV
const importContacts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = String(req.user.id);
        const { csvData } = req.body;
        if (!csvData) {
            return res.status(400).json({ message: 'CSV data is required' });
        }
        const records = parseCsvData(csvData);
        const contacts = [];
        const errors = [];
        for (const record of records) {
            const email = record.email || record.Email || record.EMAIL;
            const name = record.name || record.Name || record.NAME || null;
            if (!email) {
                errors.push(`Row missing email: ${JSON.stringify(record)}`);
                continue;
            }
            try {
                const contact = yield prisma_1.prisma.contact.upsert({
                    where: { userId_email: { userId, email } },
                    update: { name: name || undefined },
                    create: { email, name, userId },
                });
                contacts.push(contact);
            }
            catch (err) {
                errors.push(`Failed to import ${email}`);
            }
        }
        res.json({
            message: `Imported ${contacts.length} contacts`,
            imported: contacts.length,
            errors: errors.length,
            errorDetails: errors.slice(0, 10),
        });
    }
    catch (error) {
        console.error('Import contacts error:', error);
        res.status(500).json({ message: 'Failed to parse CSV data' });
    }
});
exports.importContacts = importContacts;
// Delete a contact
const deleteContact = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = String(req.user.id);
        const id = String(req.params.id);
        yield prisma_1.prisma.contact.deleteMany({ where: { id, userId } });
        res.json({ message: 'Contact deleted' });
    }
    catch (error) {
        console.error('Delete contact error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.deleteContact = deleteContact;
// Unsubscribe a contact  
const unsubscribeContact = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = String(req.params.id);
        yield prisma_1.prisma.contact.update({
            where: { id },
            data: { unsubscribed: true },
        });
        res.json({ message: 'Unsubscribed successfully' });
    }
    catch (error) {
        console.error('Unsubscribe error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.unsubscribeContact = unsubscribeContact;
