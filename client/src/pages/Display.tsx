import { IStockResponseState } from '@/App';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardDescription,
    CardFooter,
} from '@/components/ui/card';
import { API_ENDPOINT } from '@/common/constants';
import { StockResponse } from '@/common/interface';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowBigLeft, RotateCw } from 'lucide-react';
import axios from 'axios';

export default function Display({ data, setData }: IStockResponseState) {
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (data.length === 0) handleReload();
        const refreshInterval = 60 * 1000;
        const intervalId = setInterval(handleReload, refreshInterval);
        return () => clearInterval(intervalId);
    });

    async function handleReload() {
        const quotes = localStorage.getItem('lastScraped');
        setIsLoading(true);
        await axios
            .get(`${API_ENDPOINT}/request/`, {
                params: {
                    quotes: quotes,
                },
            })
            .then((res) => {
                setData(res.data as StockResponse[]);
            })
            .catch(() => {
                setData([]);
            });
        setIsLoading(false);
    }

    return (
        <div className='flex flex-col justify-center gap-5 p-5'>
            <div className='flex items-center justify-center'>
                <Button className='mr-auto' onClick={() => navigate('/')}>
                    <ArrowBigLeft />
                    <div className='hidden md:flex lg:flex'>Back to Request Form</div>
                </Button>
                <Button
                    className='ml-auto'
                    onClick={handleReload}
                    disabled={isLoading}
                    size={'icon'}>
                    <RotateCw className={isLoading ? 'animate-spin transition-all' : ''} />
                </Button>
            </div>
            <div className='grid grid-cols-1 flex-wrap gap-2 px-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                {data.map((value) => {
                    if (value.data) {
                        const quote = value.quote.toUpperCase();
                        const name = value.data.name;
                        const price = value.data.livePrice;
                        const priceChange = value.data.priceChange
                            ? parseFloat(value.data.priceChange).toFixed(2)
                            : 'Not Found';
                        const priceChangePercent = value.data.priceChangePercent
                            ? parseFloat(value.data.priceChangePercent).toFixed(2) + '%'
                            : 'Not Found';

                        const isPositive =
                            value.data.priceChange && parseFloat(value.data.priceChange) > 0;

                        return (
                            <Card>
                                <CardHeader>
                                    <CardTitle>{quote}</CardTitle>
                                    <CardDescription>{name}</CardDescription>
                                </CardHeader>
                                <CardContent className='pb-0'>
                                    <div className='text-xl font-bold'>${price}</div>
                                </CardContent>
                                <CardFooter>
                                    <div className={isPositive ? 'text-green-600' : 'text-red-600'}>
                                        {isPositive
                                            ? '+$' + priceChange
                                            : '-$' + priceChange.slice(1)}{' '}
                                        (
                                        {isPositive ? '+' + priceChangePercent : priceChangePercent}
                                        )
                                    </div>
                                </CardFooter>
                            </Card>
                        );
                    } else {
                        return (
                            <Card>
                                <CardHeader>
                                    <CardTitle>{value.quote}</CardTitle>
                                    <CardDescription className='text-red-600'>
                                        Failed to scrape {value.quote}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className='pb-0'>
                                    <div className='text-xl font-bold'>$XXX</div>
                                </CardContent>
                                <CardFooter>
                                    <div className='text-red-600'>XXX (XXX%)</div>
                                </CardFooter>
                            </Card>
                        );
                    }
                })}
            </div>
        </div>
    );
}
