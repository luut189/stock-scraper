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
