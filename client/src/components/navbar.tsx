import { Activity } from 'lucide-react';

export default function Navbar() {
    return (
        <div className='flex h-20 items-center px-4'>
            <div className='flex items-center gap-2 text-xl font-medium'>
                <Activity />
                Stock Scraper
            </div>
        </div>
    );
}
