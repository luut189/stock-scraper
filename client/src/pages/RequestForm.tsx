import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { IStockResponseState } from '@/App';
import { StockResponse } from '@/common/interface';
import { API_ENDPOINT } from '@/common/constants';

import { zodResolver } from '@hookform/resolvers/zod';
import { LoaderCircle, X, Check, Forward } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

type Status = 'Success' | 'Fail' | 'Default';

const formSchema = z.object({
    quotes: z.string().min(1, {
        message: 'Request must contain at least 1 character',
    }),
});

export default function RequestForm({ setData }: IStockResponseState) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            quotes: '',
        },
    });
    const [status, setStatus] = useState<Status>('Default');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    async function onSubmit(value: z.infer<typeof formSchema>) {
        setIsLoading(true);
        await axios
            .get(`${API_ENDPOINT}/request/`, {
                params: {
                    quotes: value.quotes,
                },
            })
            .then((res) => {
                setData(res.data as StockResponse[]);
                localStorage.setItem('lastScraped', value.quotes);
                setStatus('Success');
                navigate('/display');
            })
            .catch(() => {
                setStatus('Fail');
                setData([]);
            });
        setIsLoading(false);
    }

    return (
        <div className='flex flex-grow flex-col justify-center px-20'>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <FormField
                        control={form.control}
                        name='quotes'
                        render={({ field }) => (
                            <FormItem className='flex flex-col'>
                                <FormLabel className='mr-auto flex items-center gap-2 text-xl font-semibold'>
                                    <p>Scraping Stocks</p>
                                    {isLoading ? (
                                        <LoaderCircle className='animate-spin' />
                                    ) : status == 'Fail' ? (
                                        <X className='text-red-600' />
                                    ) : (
                                        <Check className='text-green-600' />
                                    )}
                                </FormLabel>
                                <FormControl>
                                    <div className='flex flex-col gap-3'>
                                        <Input placeholder='AAPL NVDA VFV.TO ...' {...field} />
                                        <FormMessage />
                                        <Button
                                            className='ml-auto'
                                            type='submit'
                                            disabled={isLoading}>
                                            {isLoading ? (
                                                <LoaderCircle className='h-full w-full animate-spin' />
                                            ) : (
                                                <>
                                                    Send request
                                                    <Forward />
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </form>
            </Form>
        </div>
    );
}
