import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Bell, ChevronDown, Moon, Pen, Search, Sun, User } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/hooks/use-auth';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';

export default function Navbar() {
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { user, logoutMutation } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  // Get notifications
  const { data: notifications } = useQuery({
    queryKey: ['/api/notifications'],
    enabled: !!user,
  });

  const unreadNotifications = notifications?.filter(n => !n.isRead)?.length || 0;

  // Listen for scroll to add shadow
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/explore?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Explore', path: '/explore' },
    { name: 'Categories', path: '/explore?view=categories' },
    { name: 'Challenges', path: '/explore?view=challenges' },
  ];

  return (
    <header className={`sticky top-0 z-50 bg-white dark:bg-gray-900 transition-shadow ${isScrolled ? 'shadow-sm dark:shadow-gray-800/10' : ''}`}>
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path>
            </svg>
            <span className="text-xl font-bold text-gray-900 dark:text-white">Pencraft</span>
          </Link>
          
          <div className="hidden md:flex space-x-6">
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                href={link.path}
                className={`text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary transition font-medium ${
                  location === link.path ? 'text-primary dark:text-primary' : ''
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
        
        <div className="flex items-center">
          <form onSubmit={handleSearch} className="relative mx-4 hidden md:block">
            <Input
              type="text"
              placeholder="Search writings..."
              className="w-64 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button 
              type="submit" 
              variant="ghost" 
              size="icon" 
              className="absolute right-3 top-2.5 text-gray-500 dark:text-gray-400 hover:bg-transparent"
            >
              <Search className="h-4 w-4" />
            </Button>
          </form>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme}
            className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          
          {user ? (
            <>
              <Button 
                variant="ghost" 
                size="icon" 
                className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400 relative ml-2"
                asChild
              >
                <Link href="/notifications">
                  <Bell className="h-5 w-5" />
                  {unreadNotifications > 0 && (
                    <Badge variant="destructive" className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-xs p-0">
                      {unreadNotifications}
                    </Badge>
                  )}
                </Link>
              </Button>
              
              <Link href="/create">
                <Button className="ml-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 font-medium hidden md:block">
                  Write
                </Button>
              </Link>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="ml-3 flex items-center space-x-2 focus:outline-none">
                    <Avatar className="h-8 w-8 border-2 border-primary">
                      <AvatarImage src={user.profileImage} alt={user.fullName} />
                      <AvatarFallback>{user.fullName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline font-medium">{user.fullName.split(' ')[0]}</span>
                    <ChevronDown className="h-4 w-4 text-gray-500 hidden md:inline" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 py-2">
                  <DropdownMenuItem asChild>
                    <Link href={`/profile/${user.id}`} className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Your Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer">
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer">
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/bookmarks" className="cursor-pointer">
                      Bookmarks
                    </Link>
                  </DropdownMenuItem>
                  {user.isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="cursor-pointer">
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400 cursor-pointer">
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link href="/auth">
              <Button className="ml-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 font-medium">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
      
      <div className="md:hidden border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-2">
          <form onSubmit={handleSearch} className="relative">
            <Input
              type="text"
              placeholder="Search..."
              className="w-full px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button 
              type="submit" 
              variant="ghost" 
              size="icon" 
              className="absolute right-3 top-2.5 text-gray-500 dark:text-gray-400 hover:bg-transparent"
            >
              <Search className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
