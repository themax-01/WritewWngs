import { Link, useLocation } from 'wouter';
import { Pen, Home, Compass, Bookmark, User } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export default function MobileNav() {
  const [location] = useLocation();
  const { user } = useAuth();
  
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-2 px-4 z-40">
      <div className="flex justify-between items-center">
        <Link href="/" className="flex flex-col items-center text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary">
          <Home className={`h-5 w-5 ${location === '/' ? 'text-primary' : ''}`} />
          <span className="text-xs mt-1">Home</span>
        </Link>
        
        <Link href="/explore" className="flex flex-col items-center text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary">
          <Compass className={`h-5 w-5 ${location === '/explore' ? 'text-primary' : ''}`} />
          <span className="text-xs mt-1">Explore</span>
        </Link>
        
        <Link href={user ? "/create" : "/auth"} className="flex flex-col items-center">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white -mt-5">
            <Pen className="h-5 w-5" />
          </div>
          <span className="text-xs mt-1">Write</span>
        </Link>
        
        <Link href={user ? "/bookmarks" : "/auth"} className="flex flex-col items-center text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary">
          <Bookmark className={`h-5 w-5 ${location === '/bookmarks' ? 'text-primary' : ''}`} />
          <span className="text-xs mt-1">Saved</span>
        </Link>
        
        <Link href={user ? `/profile/${user.id}` : "/auth"} className="flex flex-col items-center text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary">
          <User className={`h-5 w-5 ${location.startsWith('/profile') ? 'text-primary' : ''}`} />
          <span className="text-xs mt-1">Profile</span>
        </Link>
      </div>
    </div>
  );
}
