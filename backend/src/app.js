import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import aiRoutes from './ai/routes/ai.routes.js';
import dishRoutes from './ai/routes/dish.routes.js';
import statRoutes from './routes/statRoutes.js';
import cookieParser from 'cookie-parser';

const app = express();

app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/dishes', dishRoutes);
app.use('/api/stats', statRoutes);

app.get('/health', (req, res) => {
    res.status(200).json({
        "status": 'OK',
        "message": "Health Mode On!!"
    })
})
export default app;