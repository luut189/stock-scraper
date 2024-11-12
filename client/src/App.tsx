import { useState } from 'react';
import { Route, Routes } from 'react-router-dom';

import { StockResponse } from '@/common/interface';
import Navbar from '@/components/navbar';
import RequestForm from '@/pages/RequestForm';
import Display from '@/pages/Display';

export interface IStockResponseState {
    data: StockResponse[];
    setData: (value: StockResponse[]) => void;
}

export default function App() {
    const [data, setData] = useState<StockResponse[]>([]);

    return (
        <div className='flex min-h-screen flex-col'>
            <Navbar />
            <Routes>
                <Route path='/' element={<RequestForm data={data} setData={setData} />} />
                <Route path='/display' element={<Display data={data} setData={setData} />} />
            </Routes>
        </div>
    );
}
