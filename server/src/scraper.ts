import axios from 'axios';
import { load } from 'cheerio';
import { configDotenv } from 'dotenv';

configDotenv();

export interface StockResponse {
    quote: string;
    success: boolean;
    error?: string;
    data?: {
        name: string;
        url: string;
        livePrice: string | null;
        priceChange: string | null;
        priceChangePercent: string | null;
    };
}

function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function scrapeStock(quotes: string) {
    const quoteList = quotes.split(' ');
    const instance = axios.create({
        headers: {
            'User-Agent':
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_3) AppleWebKit/537.75.14 (KHTML, like Gecko) Version/7.0.3 Safari/7046A194A',
            Referer: process.env.SITE,
        },
        maxRedirects: 1,
        timeout: 5000,
    });
    const allResponses: StockResponse[] = [];
    const delayTime = 1000;

    const responsePromises = quoteList.map(async (quote, index): Promise<StockResponse> => {
        if (index > 0) await delay(delayTime);
        try {
            const url = process.env.SITE + `quote/${quote}`;
            const response = await instance.get(url);

            const html = response.data;
            const $ = load(html);

            const topContainer = $('section.container>.top');
            const bottomContainer = $('section.container>.bottom');

            const quoteName = $(topContainer).find('h1').first().text();
            const livePrice = $(bottomContainer).find('.livePrice').attr('data-value');
            const priceChange = $(bottomContainer).find('.priceChange').attr('data-value');
            const priceChangePercent = $(bottomContainer)
                .find('.priceChange')
                .next()
                .attr('data-value');

            if (!quoteName || quoteName.length === 0) {
                return {
                    quote,
                    success: false,
                    error: 'Failed to fetch quote name',
                };
            }

            if (!livePrice || !priceChange || !priceChangePercent) {
                return {
                    quote,
                    success: false,
                    error: 'Incomplete price data',
                    data: {
                        name: quoteName,
                        url,
                        livePrice: livePrice || null,
                        priceChange: priceChange || null,
                        priceChangePercent: priceChangePercent || null,
                    },
                };
            }

            return {
                quote,
                success: true,
                data: {
                    name: quoteName,
                    url: url,
                    livePrice: livePrice,
                    priceChange: priceChange,
                    priceChangePercent: priceChangePercent,
                },
            };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.log(`Skipping ${quote}`);
                return {
                    quote,
                    success: false,
                    error: error.message,
                };
            }
            console.error(
                `Error processing ${quote}:`,
                error instanceof Error ? error.message : 'Unknown error',
            );
        }
        return {
            quote,
            success: false,
            error: `Failed to process ${quote}`,
        };
    });

    allResponses.push(...(await Promise.all(responsePromises)));

    return allResponses;
}
