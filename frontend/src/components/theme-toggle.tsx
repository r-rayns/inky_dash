import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { clsx } from 'clsx';
import { omit } from 'es-toolkit';
import { Button } from './ui/button';
import type { ComponentPropsWithoutRef } from 'react';
import { Theme } from '@/types/theme.ts';

export default function ThemeToggle({...props}: ComponentPropsWithoutRef<typeof Button>) {
  const [theme, setTheme] = useState<Theme>(() => {
    const storedTheme = localStorage.getItem('theme');
    if (typeof localStorage !== 'undefined' && storedTheme) {
      return storedTheme === Theme.DARK ? Theme.DARK : Theme.LIGHT;
    } else {
      const systemThemeIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return systemThemeIsDark ? Theme.DARK : Theme.LIGHT;
    }
  })

  useEffect(() => {
    if (theme === Theme.DARK) {
      document.documentElement.classList.add(Theme.DARK);
    } else {
      document.documentElement.classList.remove(Theme.DARK);
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  return (
    <Button {...omit(props, ['className'])}

            onClick={() => setTheme(theme === Theme.DARK ? Theme.LIGHT : Theme.DARK)}
            className={clsx("rounded-full w-8 h-8 md:w-10 md:h-10 md:rounded-md drop-shadow-md bg-muted hover:cursor-pointer hover:drop-shadow-lg\n" +
              "p-1 text-muted-foreground hover:text-primary-foreground", props.className)}>
      {theme === Theme.DARK ? <Sun className="size-4 md:size-5"/> : <Moon className="size-5"/>}
    </Button>
  )

}
