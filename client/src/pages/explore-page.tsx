import { useEffect, useState } from 'react';
import { useLocation, useSearch } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import MobileNav from '@/components/layout/mobile-nav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { HeartIcon, MessageSquareIcon, BookmarkIcon, Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'wouter';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';

export default function ExplorePage() {
  const [location] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const { user } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState(params.get('search') || '');
  const [activeCategory, setActiveCategory] = useState(params.get('category') || 'All');
  const [activeView, setActiveView] = useState(params.get('view') || 'writings');
  const [sort, setSort] = useState(params.get('sort') || 'latest');

  // Set page title
  useEffect(() => {
    document.title = 'Explore - Pencraft';
  }, []);

  // Update URL params when filters change
  useEffect(() => {
    const newParams = new URLSearchParams(search);
    
    if (searchQuery) newParams.set('search', searchQuery);
    else newParams.delete('search');
    
    if (activeCategory !== 'All') newParams.set('category', activeCategory);
    else newParams.delete('category');
    
    if (activeView !== 'writings') newParams.set('view', activeView);
    else newParams.delete('view');
    
    if (sort !== 'latest') newParams.set('sort', sort);
    else newParams.delete('sort');
    
    const newSearch = newParams.toString();
    window.history.replaceState(null, '', location + (newSearch ? `?${newSearch}` : ''));
  }, [searchQuery, activeCategory, activeView, sort, location]);

  // Categories
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['/api/categories'],
  });

  // Fetch writings
  const { data: writings, isLoading: writingsLoading } = useQuery({
    queryKey: ['/api/writings', { 
      search: searchQuery || undefined,
      category: activeCategory !== 'All' ? activeCategory : undefined,
      sort
    }],
  });

  // Fetch challenges
  const { data: challenges, isLoading: challengesLoading } = useQuery({
    queryKey: ['/api/challenges'],
    enabled: activeView === 'challenges'
  });

  // Fetch users (authors)
  const { data: authors, isLoading: authorsLoading } = useQuery({
    queryKey: ['/api/admin/users'],
    enabled: activeView === 'authors'
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Just update the state, the effect will update the URL
  };

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
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Explore Writings</h1>
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                type="text"
                placeholder="Search for stories, poems, essays..."
                className="flex-grow"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button type="submit">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </form>
          </div>

          <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <TabsList>
                <TabsTrigger value="writings">Writings</TabsTrigger>
                <TabsTrigger value="authors">Authors</TabsTrigger>
                <TabsTrigger value="challenges">Challenges</TabsTrigger>
                <TabsTrigger value="categories">Categories</TabsTrigger>
              </TabsList>
              
              {activeView === 'writings' && (
                <div className="mt-4 sm:mt-0 flex space-x-2">
                  <Button
                    size="sm"
                    variant={sort === 'latest' ? 'default' : 'outline'}
                    onClick={() => setSort('latest')}
                  >
                    Latest
                  </Button>
                  <Button
                    size="sm"
                    variant={sort === 'popular' ? 'default' : 'outline'}
                    onClick={() => setSort('popular')}
                  >
                    Most Popular
                  </Button>
                </div>
              )}
            </div>

            {activeView === 'writings' && (
              <div className="mb-6 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={activeCategory === 'All' ? 'default' : 'outline'}
                  onClick={() => setActiveCategory('All')}
                >
                  All
                </Button>
                {categoriesLoading ? (
                  <div className="flex gap-2">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-9 w-20" />
                    ))}
                  </div>
                ) : (
                  categories?.map((category: string) => (
                    <Button
                      key={category}
                      size="sm"
                      variant={activeCategory === category ? 'default' : 'outline'}
                      onClick={() => setActiveCategory(category)}
                    >
                      {category}
                    </Button>
                  ))
                )}
              </div>
            )}

            <TabsContent value="writings">
              {writingsLoading ? (
                <div className="grid gap-6">
                  {[...Array(5)].map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row">
                          <div className="md:w-1/4">
                            <Skeleton className="h-40 w-full md:h-full rounded-t-lg md:rounded-l-lg md:rounded-t-none" />
                          </div>
                          <div className="p-6 flex-1">
                            <Skeleton className="h-4 w-20 mb-2" />
                            <Skeleton className="h-6 w-3/4 mb-2" />
                            <Skeleton className="h-4 w-full mb-2" />
                            <Skeleton className="h-4 w-5/6 mb-4" />
                            <div className="flex justify-between">
                              <div className="flex items-center">
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <div className="ml-2">
                                  <Skeleton className="h-3 w-24" />
                                  <Skeleton className="h-3 w-16 mt-1" />
                                </div>
                              </div>
                              <Skeleton className="h-8 w-24" />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : writings?.length === 0 ? (
                <div className="text-center py-12">
                  <h3 className="text-xl font-semibold mb-2">No writings found</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {searchQuery 
                      ? `No results found for "${searchQuery}"` 
                      : activeCategory !== 'All' 
                        ? `No writings found in category "${activeCategory}"`
                        : 'No writings available right now'}
                  </p>
                  <Button asChild>
                    <Link href="/create">Create a writing</Link>
                  </Button>
                </div>
              ) : (
                <div className="grid gap-6">
                  {writings?.map((writing: any) => (
                    <Card key={writing.id}>
                      <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row">
                          <div className="md:w-1/4 h-40 md:h-auto">
                            <img 
                              src={writing.coverImage || `https://source.unsplash.com/random/400x300?${writing.category.toLowerCase()}`} 
                              alt={writing.title} 
                              className="h-full w-full object-cover rounded-t-lg md:rounded-l-lg md:rounded-t-none"
                            />
                          </div>
                          <div className="p-6 flex-1">
                            <div className="flex items-center mb-2">
                              <Badge variant="outline" className={`${
                                writing.category === 'Fiction' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                writing.category === 'Poetry' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                                'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              }`}>
                                {writing.category}
                              </Badge>
                              <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">{writing.readTime} min read</span>
                            </div>
                            <Link href={`/writing/${writing.id}`}>
                              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white hover:text-primary transition">
                                {writing.title}
                              </h3>
                            </Link>
                            <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                              {writing.description}
                            </p>
                            <div className="flex justify-between items-center">
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
                              <div className="flex items-center space-x-4">
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
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="authors">
              {authorsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-6 flex flex-col items-center text-center">
                        <Skeleton className="h-24 w-24 rounded-full mb-4" />
                        <Skeleton className="h-5 w-36 mb-2" />
                        <Skeleton className="h-4 w-48 mb-4" />
                        <div className="flex justify-center items-center space-x-6 w-full mb-4">
                          <div className="text-center">
                            <Skeleton className="h-4 w-8 mx-auto mb-1" />
                            <Skeleton className="h-3 w-16" />
                          </div>
                          <div className="text-center">
                            <Skeleton className="h-4 w-8 mx-auto mb-1" />
                            <Skeleton className="h-3 w-16" />
                          </div>
                        </div>
                        <Skeleton className="h-9 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {authors?.filter((a: any) => a.id !== user?.id).map((author: any) => {
                    const isFollowing = author.isFollowing;
                    
                    return (
                      <Card key={author.id}>
                        <CardContent className="p-6 flex flex-col items-center text-center">
                          <Link href={`/profile/${author.id}`}>
                            <Avatar className="h-24 w-24 border-2 border-primary p-0.5 mb-4">
                              <AvatarImage src={author.profileImage} alt={author.fullName} />
                              <AvatarFallback>{author.fullName.charAt(0)}</AvatarFallback>
                            </Avatar>
                          </Link>
                          <h3 className="font-bold text-gray-900 dark:text-white mb-1">{author.fullName}</h3>
                          <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                            {author.bio ? (
                              author.bio.length > 100 ? `${author.bio.substring(0, 100)}...` : author.bio
                            ) : (
                              `@${author.username}`
                            )}
                          </p>
                          <div className="flex justify-center items-center space-x-6 w-full mb-4">
                            <div className="text-center">
                              <p className="font-semibold text-gray-900 dark:text-white">{author.stats?.writingsCount || 0}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Writings</p>
                            </div>
                            <div className="text-center">
                              <p className="font-semibold text-gray-900 dark:text-white">{author.stats?.followersCount || 0}</p>
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
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="challenges">
              {challengesLoading ? (
                <div className="grid gap-6">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-6">
                        <div className="mb-2">
                          <Skeleton className="h-4 w-24 mb-2" />
                        </div>
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-full mb-4" />
                        <div className="flex justify-between items-center">
                          <div>
                            <Skeleton className="h-4 w-32 mb-1" />
                            <Skeleton className="h-4 w-24" />
                          </div>
                          <Skeleton className="h-9 w-32" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : challenges?.length === 0 ? (
                <div className="text-center py-12">
                  <h3 className="text-xl font-semibold mb-2">No challenges found</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    There are no writing challenges available at the moment.
                  </p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {challenges?.map((challenge: any) => {
                    const daysRemaining = challenge.endDate ? 
                      Math.ceil((new Date(challenge.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 
                      null;
                    const isActive = daysRemaining !== null && daysRemaining > 0;
                    
                    return (
                      <Card key={challenge.id}>
                        <CardContent className="p-6">
                          <div className="mb-4">
                            <Badge variant={isActive ? 'default' : 'secondary'} className="mb-2">
                              {isActive 
                                ? `Ends in ${daysRemaining} day${daysRemaining > 1 ? 's' : ''}`
                                : 'Challenge ended'
                              }
                            </Badge>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                              {challenge.title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                              {challenge.description}
                            </p>
                          </div>
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="flex items-center">
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Participants</span>
                                <span className="ml-2 text-gray-700 dark:text-gray-200 font-semibold">
                                  {challenge.entriesCount || 0}
                                </span>
                              </div>
                              {challenge.wordLimit && (
                                <div className="flex items-center mt-1">
                                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Word limit</span>
                                  <span className="ml-2 text-gray-700 dark:text-gray-200 font-semibold">
                                    {challenge.wordLimit}
                                  </span>
                                </div>
                              )}
                            </div>
                            <Button asChild disabled={!isActive}>
                              <Link href={`/challenge/${challenge.id}`}>
                                {isActive ? 'View Challenge' : 'See Results'}
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="categories">
              {categoriesLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-40 w-full rounded-xl" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {categories?.map((category: string) => (
                    <Link 
                      key={category} 
                      href={`/explore?category=${encodeURIComponent(category)}&view=writings`}
                      className="block"
                    >
                      <Card className="overflow-hidden h-40 hover:shadow-lg transition">
                        <CardContent className="p-0 h-full relative">
                          <img 
                            src={`https://source.unsplash.com/random/600x400?${category.toLowerCase()}`} 
                            alt={category} 
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                            <h3 className="text-white font-bold text-xl">{category}</h3>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
}
