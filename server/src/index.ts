import express, { Express, Request, Response } from 'express';
import { configDotenv } from 'dotenv';
import cors from 'cors';
import { scrapeStock } from './scraper';

configDotenv();
const app: Express = express();
const port = process.env.PORT || 3000;

app.use(cors());

app.get('/request', (req: Request, res: Response) => {
    const quotes = req.query.quotes;
    scrapeStock(quotes as string).then((data) => {
        res.send(data);
    });
});

app.listen(port, () => {
    console.log(`[server]: server listening on http://localhost:${port}`);
});
