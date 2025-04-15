import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { HeartIcon, MessageSquareIcon, BookmarkIcon } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest, queryClient } from '@/lib/queryClient';

export default function FeaturedWritings() {
  const [category, setCategory] = useState<string>('All');
  const { user } = useAuth();
  
  const { data: writings, isLoading } = useQuery({
    queryKey: ['/api/writings', { featured: true, category: category !== 'All' ? category : undefined }],
  });

  const { data: categories } = useQuery({
    queryKey: ['/api/categories'],
  });

  const toggleLike = async (writingId: number, isLiked: boolean) => {
    if (!user) {
      window.location.href = '/auth';
      return;
    }

    try {
      if (isLiked) {
        await apiRequest('DELETE', `/api/writings/${writingId}/like`);
      } else {
        await apiRequest('POST', `/api/writings/${writingId}/like`);
      }
      queryClient.invalidateQueries({ queryKey: ['/api/writings'] });
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const toggleBookmark = async (writingId: number, isBookmarked: boolean) => {
    if (!user) {
      window.location.href = '/auth';
      return;
    }

    try {
      if (isBookmarked) {
        await apiRequest('DELETE', `/api/writings/${writingId}/bookmark`);
      } else {
        await apiRequest('POST', `/api/writings/${writingId}/bookmark`);
      }
      queryClient.invalidateQueries({ queryKey: ['/api/writings'] });
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Featured Writings</h2>
        <div className="flex space-x-2 overflow-x-auto pb-1">
          <Button
            onClick={() => setCategory('All')}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              category === 'All'
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            All
          </Button>
          {categories?.map((cat: string) => (
            <Button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                category === cat
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md border border-gray-200 dark:border-gray-700">
              <Skeleton className="w-full h-48" />
              <div className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-4/5 mb-4" />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="ml-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-3 w-16 mt-1" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {writings?.map((writing: any) => (
              <article key={writing.id} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md border border-gray-200 dark:border-gray-700 transition hover:shadow-lg">
                <div className="aspect-w-16 aspect-h-9 h-48">
                  <img 
                    src={writing.coverImage || `https://source.unsplash.com/random/600x400?${writing.category.toLowerCase()}`} 
                    alt={writing.title} 
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center mb-2">
                    <Badge variant="outline" className={`px-2 py-1 ${
                      writing.category === 'Fiction' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                      writing.category === 'Poetry' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}>
                      {writing.category}
                    </Badge>
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">{writing.readTime} min read</span>
                  </div>
                  <h3 className="font-bold text-xl mb-2 text-gray-900 dark:text-white">
                    <Link href={`/writing/${writing.id}`} className="hover:text-primary transition">
                      {writing.title}
                    </Link>
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm line-clamp-3">{writing.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <Link href={`/profile/${writing.author?.id}`} className="flex items-center">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={writing.author?.profileImage} alt={writing.author?.fullName} />
                        <AvatarFallback>{writing.author?.fullName?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="ml-2">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{writing.author?.fullName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDistanceToNow(new Date(writing.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </Link>
                    <div className="flex space-x-3 text-gray-500 dark:text-gray-400">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="hover:text-primary h-auto p-1"
                        onClick={() => toggleLike(writing.id, writing.userInteraction?.liked)}
                      >
                        <HeartIcon className={`h-4 w-4 ${writing.userInteraction?.liked ? 'fill-primary text-primary' : ''}`} />
                        <span className="text-xs ml-1">{writing.stats?.likes || 0}</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="hover:text-primary h-auto p-1"
                        asChild
                      >
                        <Link href={`/writing/${writing.id}#comments`}>
                          <MessageSquareIcon className="h-4 w-4" />
                          <span className="text-xs ml-1">{writing.stats?.comments || 0}</span>
                        </Link>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="hover:text-primary h-auto p-1"
                        onClick={() => toggleBookmark(writing.id, writing.userInteraction?.bookmarked)}
                      >
                        <BookmarkIcon className={`h-4 w-4 ${writing.userInteraction?.bookmarked ? 'fill-primary text-primary' : ''}`} />
                      </Button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
          
          {writings?.length >= 6 && (
            <div className="mt-8 text-center">
              <Button 
                variant="outline" 
                className="px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 inline-flex items-center"
                asChild
              >
                <Link href="/explore">
                  <span>Load More</span>
                  <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </Link>
              </Button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
