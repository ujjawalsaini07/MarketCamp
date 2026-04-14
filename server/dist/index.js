"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const contacts_routes_1 = __importDefault(require("./routes/contacts.routes"));
const audiences_routes_1 = __importDefault(require("./routes/audiences.routes"));
const templates_routes_1 = __importDefault(require("./routes/templates.routes"));
const campaigns_routes_1 = __importDefault(require("./routes/campaigns.routes"));
const tracking_routes_1 = __importDefault(require("./routes/tracking.routes"));
const stripe_routes_1 = __importDefault(require("./routes/stripe.routes"));
const config_1 = require("./config");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = config_1.appConfig.port;
app.use((0, cors_1.default)({
    origin: [config_1.appConfig.frontendUrl, 'http://localhost:3000'],
    credentials: true,
}));
app.use(express_1.default.json());
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/contacts', contacts_routes_1.default);
app.use('/api/audiences', audiences_routes_1.default);
app.use('/api/templates', templates_routes_1.default);
app.use('/api/campaigns', campaigns_routes_1.default);
app.use('/api/track', tracking_routes_1.default);
app.use('/api/stripe', stripe_routes_1.default);
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'CampaignIQ Server Running' });
});
app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});
