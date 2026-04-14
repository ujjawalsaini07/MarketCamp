"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appConfig = void 0;
exports.requiredEnv = requiredEnv;
function requiredEnv(name) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}
exports.appConfig = {
    get port() {
        return Number(process.env.PORT || 5000);
    },
    get frontendUrl() {
        return process.env.FRONTEND_URL || 'http://localhost:3000';
    },
    get emailServiceUrl() {
        return process.env.EMAIL_SERVICE_URL || '';
    },
    get backendUrl() {
        return process.env.BACKEND_URL || '';
    },
    get stripeSecretKey() {
        return process.env.STRIPE_SECRET_KEY || '';
    },
    get jwtSecret() {
        if (process.env.JWT_SECRET)
            return process.env.JWT_SECRET;
        if (process.env.NODE_ENV === 'production') {
            throw new Error('JWT_SECRET is required in production');
        }
        return 'dev-only-secret';
    },
};
