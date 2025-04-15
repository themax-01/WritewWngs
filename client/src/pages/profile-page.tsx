import { useEffect, useState } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import MobileNav from '@/components/layout/mobile-nav';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HeartIcon, MessageSquareIcon, BookmarkIcon, Edit, UserIcon, UsersIcon, FileTextIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest, queryClient } from '@/lib/queryClient';

export default function ProfilePage() {
  const params = useParams<{ id: string }>();
  const userId = parseInt(params.id);
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('writings');
  const isOwnProfile = user?.id === userId;

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['/api/users', userId],
  });

  const { data: writings, isLoading: writingsLoading } = useQuery({
    queryKey: ['/api/writings', { userId }],
    enabled: activeTab === 'writings',
  });

  const { data: followers, isLoading: followersLoading } = useQuery({
    queryKey: ['/api/users', userId, 'followers'],
    enabled: activeTab === 'followers',
  });

  const { data: following, isLoading: followingLoading } = useQuery({
    queryKey: ['/api/users', userId, 'following'],
    enabled: activeTab === 'following',
  });

  // Set page title
  useEffect(() => {
    if (profile) {
      document.title = `${profile.fullName} - Pencraft`;
    } else {
      document.title = 'Profile - Pencraft';
    }
  }, [profile]);

  const toggleFollow = async () => {
    if (!user) {
      window.location.href = '/auth';
      return;
    }

    if (userId === user.id) return; // Can't follow yourself

    try {
      if (profile.isFollowing) {
        await apiRequest('DELETE', `/api/users/${userId}/follow`);
      } else {
        await apiRequest('POST', `/api/users/${userId}/follow`);
      }
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId] });
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
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

  if (isNaN(userId)) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="container mx-auto px-4 py-8 flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Invalid Profile</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">The profile you're trying to view doesn't exist.</p>
            <Button asChild>
              <Link href="/">Go Home</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="max-w-5xl mx-auto">
          {/* Profile Header */}
          {profileLoading ? (
            <div className="mb-8 text-center">
              <Skeleton className="h-24 w-24 rounded-full mx-auto mb-4" />
              <Skeleton className="h-8 w-48 mx-auto mb-2" />
              <Skeleton className="h-4 w-64 mx-auto mb-6" />
              <div className="flex justify-center space-x-8 mb-6">
                <Skeleton className="h-16 w-20" />
                <Skeleton className="h-16 w-20" />
                <Skeleton className="h-16 w-20" />
              </div>
              <Skeleton className="h-10 w-32 mx-auto" />
            </div>
          ) : profile ? (
            <div className="mb-8 text-center">
              <Avatar className="h-24 w-24 mx-auto mb-4 border-4 border-primary">
                <AvatarImage src={profile.profileImage} alt={profile.fullName} />
                <AvatarFallback>{profile.fullName.charAt(0)}</AvatarFallback>
              </Avatar>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{profile.fullName}</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">@{profile.username}</p>
              
              {profile.bio && (
                <p className="text-gray-700 dark:text-gray-300 max-w-xl mx-auto mb-6">
                  {profile.bio}
                </p>
              )}
              
              <div className="flex justify-center space-x-8 mb-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{profile.stats.writingsCount}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Writings</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{profile.stats.followersCount}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Followers</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{profile.stats.followingCount}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Following</p>
                </div>
              </div>
              
              {isOwnProfile ? (
                <Button asChild>
                  <Link href="/settings">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Link>
                </Button>
              ) : (
                <Button 
                  className={profile.isFollowing ? 'bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700' : ''}
                  onClick={toggleFollow}
                >
                  {profile.isFollowing ? 'Following' : 'Follow'}
                </Button>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold mb-2">User not found</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                The profile you're looking for doesn't exist or has been removed.
              </p>
              <Button asChild>
                <Link href="/">Go Home</Link>
              </Button>
            </div>
          )}

          {/* Tabs */}
          {profile && (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="writings" className="flex items-center">
                  <FileTextIcon className="h-4 w-4 mr-2" />
                  Writings
                </TabsTrigger>
                <TabsTrigger value="followers" className="flex items-center">
                  <UserIcon className="h-4 w-4 mr-2" />
                  Followers
                </TabsTrigger>
                <TabsTrigger value="following" className="flex items-center">
                  <UsersIcon className="h-4 w-4 mr-2" />
                  Following
                </TabsTrigger>
              </TabsList>

              <TabsContent value="writings">
                {writingsLoading ? (
                  <div className="grid gap-6">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-48 w-full rounded-xl" />
                    ))}
                  </div>
                ) : writings?.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      {isOwnProfile ? "You haven't published any writings yet." : "This user hasn't published any writings yet."}
                    </p>
                    {isOwnProfile && (
                      <Button asChild>
                        <Link href="/create">Create Your First Writing</Link>
                      </Button>
                    )}
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
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  {formatDistanceToNow(new Date(writing.createdAt), { addSuffix: true })}
                                </span>
                                <div className="flex items-center space-x-4">
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="hover:text-primary"
                                    onClick={() => toggleLike(writing.id, writing.userInteraction?.liked)}
                                  >
                                    <HeartIcon className={`h-4 w-4 ${writing.userInteraction?.liked ? 'fill-primary text-primary' : ''}`} />
                                    <span className="text-xs ml-1">{writing.stats?.likes || 0}</span>
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="hover:text-primary"
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
                                    className="hover:text-primary"
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

              <TabsContent value="followers">
                {followersLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <Skeleton key={i} className="h-24 w-full rounded-xl" />
                    ))}
                  </div>
                ) : followers?.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600 dark:text-gray-400">
                      {isOwnProfile ? "You don't have any followers yet." : "This user doesn't have any followers yet."}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {followers?.map((follower: any) => (
                      <Card key={follower.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={follower.profileImage} alt={follower.fullName} />
                              <AvatarFallback>{follower.fullName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="ml-4 flex-1">
                              <Link href={`/profile/${follower.id}`}>
                                <h3 className="font-medium text-gray-900 dark:text-white hover:text-primary">
                                  {follower.fullName}
                                </h3>
                              </Link>
                              <p className="text-sm text-gray-500 dark:text-gray-400">@{follower.username}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {formatDistanceToNow(new Date(follower.followedAt), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="following">
                {followingLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <Skeleton key={i} className="h-24 w-full rounded-xl" />
                    ))}
                  </div>
                ) : following?.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600 dark:text-gray-400">
                      {isOwnProfile ? "You're not following anyone yet." : "This user isn't following anyone yet."}
                    </p>
                    {isOwnProfile && (
                      <Button asChild className="mt-4">
                        <Link href="/explore?view=authors">Discover Authors</Link>
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {following?.map((followedUser: any) => (
                      <Card key={followedUser.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={followedUser.profileImage} alt={followedUser.fullName} />
                              <AvatarFallback>{followedUser.fullName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="ml-4 flex-1">
                              <Link href={`/profile/${followedUser.id}`}>
                                <h3 className="font-medium text-gray-900 dark:text-white hover:text-primary">
                                  {followedUser.fullName}
                                </h3>
                              </Link>
                              <p className="text-sm text-gray-500 dark:text-gray-400">@{followedUser.username}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {formatDistanceToNow(new Date(followedUser.followedAt), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
}
