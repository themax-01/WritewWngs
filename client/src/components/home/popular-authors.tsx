import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest, queryClient } from '@/lib/queryClient';

export default function PopularAuthors() {
  const { user } = useAuth();
  
  // This query would normally fetch popular authors from the server
  // For now, we'll fetch all users and assume some are popular
  const { data: users, isLoading } = useQuery({
    queryKey: ['/api/admin/users'],
  });

  const toggleFollow = async (userId: number, isFollowing: boolean) => {
    if (!user) {
      window.location.href = '/auth';
      return;
    }

    if (userId === user.id) return; // Can't follow yourself

    try {
      if (isFollowing) {
        await apiRequest('DELETE', `/api/users/${userId}/follow`);
      } else {
        await apiRequest('POST', `/api/users/${userId}/follow`);
      }
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Popular Authors</h2>
        <Link href="/explore?view=authors" className="text-primary hover:text-blue-700 dark:hover:text-blue-400 font-medium">
          View all authors
        </Link>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center">
              <Skeleton className="h-20 w-20 rounded-full" />
              <Skeleton className="h-5 w-32 mt-4 mb-1" />
              <Skeleton className="h-4 w-24 mb-3" />
              <div className="flex justify-center items-center space-x-3 mb-4">
                <Skeleton className="h-8 w-12" />
                <div className="h-8 border-l border-gray-200 dark:border-gray-700"></div>
                <Skeleton className="h-8 w-12" />
              </div>
              <Skeleton className="h-9 w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {users?.filter((u: any) => u.id !== user?.id).slice(0, 4).map((author: any) => {
            const isFollowing = author.isFollowing;
            
            return (
              <div key={author.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center">
                <Link href={`/profile/${author.id}`}>
                  <Avatar className="h-20 w-20 border-2 border-primary p-0.5">
                    <AvatarImage src={author.profileImage} alt={author.fullName} />
                    <AvatarFallback>{author.fullName.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Link>
                <h3 className="font-bold text-gray-900 dark:text-white mt-4 mb-1">{author.fullName}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  {author.bio && author.bio.length > 30 
                    ? `${author.bio.substring(0, 30)}...` 
                    : author.bio || (author.stats?.writingsCount ? `${author.stats.writingsCount} writings` : 'Writer')}
                </p>
                <div className="flex justify-center items-center space-x-3 mb-4">
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{author.stats?.writingsCount || 0}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Writings</p>
                  </div>
                  <div className="h-8 border-l border-gray-200 dark:border-gray-700"></div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{author.stats?.followersCount || 0}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Followers</p>
                  </div>
                </div>
                <Button 
                  className={`w-full ${isFollowing 
                    ? 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600' 
                    : 'bg-primary text-white hover:bg-blue-600'}`}
                  onClick={() => toggleFollow(author.id, isFollowing)}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
