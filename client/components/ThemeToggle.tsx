import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    return (
        <Button
            variant='ghost'
            size='icon'
            onClick={toggleTheme}
            className='bg-background rounded-full shadow-sm border border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground p-2 lg:p-3 transition-colors'
        >
            {theme === 'dark' ? (
                <Sun className='w-4 lg:w-5 h-4 lg:h-5' />
            ) : (
                <Moon className='w-4 lg:w-5 h-4 lg:h-5' />
            )}
        </Button>
    );
}