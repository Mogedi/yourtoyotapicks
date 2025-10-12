'use client';

import Link from 'next/link';
import { Car, Settings, User } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center px-4 md:px-6">
        {/* Logo/Title */}
        <Link href="/dashboard" className="flex items-center space-x-2 mr-6">
          <Car className="h-6 w-6 text-blue-600" />
          <span className="font-bold text-lg hidden sm:inline-block">
            YourToyotaPicks
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center space-x-1 md:space-x-4 flex-1">
          <Link href="/dashboard">
            <Button variant="ghost" className="text-sm font-medium">
              Dashboard
            </Button>
          </Link>
          <Link href="/dashboard/settings">
            <Button variant="ghost" className="text-sm font-medium">
              <Settings className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Settings</span>
            </Button>
          </Link>
        </nav>

        {/* User Avatar Dropdown */}
        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-blue-600 text-white">
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">User</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    user@example.com
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
