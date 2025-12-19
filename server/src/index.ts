// server/src/index.ts
import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'OK', message: 'Server is running (TypeScript)', timestamp: new Date() });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});