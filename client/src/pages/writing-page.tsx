import { useEffect, useState } from 'react';
import { useParams } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import MobileNav from '@/components/layout/mobile-nav';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HeartIcon, BookmarkIcon, MessageSquareIcon, Share2Icon, CalendarIcon, ClockIcon, UserIcon } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'wouter';
import { formatDistanceToNow, format } from 'date-fns';
import Markdown from '@/components/ui/markdown';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

const commentSchema = z.object({
  content: z.string().min(3, { message: 'Comment must be at least 3 characters' }).max(1000, { message: 'Comment must be less than 1000 characters' })
});

export default function WritingPage() {
  const params = useParams<{ id: string }>();
  const writingId = parseInt(params.id);
  const { user } = useAuth();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  // Get writing details
  const { data: writing, isLoading } = useQuery({
    queryKey: ['/api/writings', writingId],
  });

  // Get comments
  const { data: comments, isLoading: commentsLoading } = useQuery({
    queryKey: ['/api/writings', writingId, 'comments'],
    enabled: !!writing
  });

  // Comment form
  const form = useForm<z.infer<typeof commentSchema>>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      content: ''
    }
  });

  // Create comment mutation
  const commentMutation = useMutation({
    mutationFn: async (data: z.infer<typeof commentSchema>) => {
      const res = await apiRequest('POST', `/api/writings/${writingId}/comments`, data);
      return await res.json();
    },
    onSuccess: () => {
      form.reset();
      toast({
        title: 'Comment added',
        description: 'Your comment has been posted successfully.'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/writings', writingId, 'comments'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to post comment. Please try again.',
        variant: 'destructive'
      });
      console.error('Error posting comment:', error);
    }
  });

  const toggleLike = async () => {
    if (!user) {
      window.location.href = '/auth';
      return;
    }

    try {
      if (writing.userInteraction?.liked) {
        await apiRequest('DELETE', `/api/writings/${writingId}/like`);
      } else {
        await apiRequest('POST', `/api/writings/${writingId}/like`);
      }
      queryClient.invalidateQueries({ queryKey: ['/api/writings', writingId] });
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const toggleBookmark = async () => {
    if (!user) {
      window.location.href = '/auth';
      return;
    }

    try {
      if (writing.userInteraction?.bookmarked) {
        await apiRequest('DELETE', `/api/writings/${writingId}/bookmark`);
      } else {
        await apiRequest('POST', `/api/writings/${writingId}/bookmark`);
      }
      queryClient.invalidateQueries({ queryKey: ['/api/writings', writingId] });
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url)
      .then(() => {
        setCopied(true);
        toast({
          title: 'Link copied',
          description: 'The link has been copied to your clipboard.'
        });
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((error) => {
        console.error('Error copying link:', error);
        toast({
          title: 'Copy failed',
          description: 'Failed to copy link to clipboard.',
          variant: 'destructive'
        });
      });
  };

  const onCommentSubmit = (data: z.infer<typeof commentSchema>) => {
    if (!user) {
      window.location.href = '/auth';
      return;
    }
    
    commentMutation.mutate(data);
  };

  // Set page title
  useEffect(() => {
    if (writing) {
      document.title = `${writing.title} - Pencraft`;
    } else {
      document.title = 'Reading - Pencraft';
    }
  }, [writing]);

  // Scroll to comments if URL has #comments
  useEffect(() => {
    if (window.location.hash === '#comments') {
      const commentsSection = document.getElementById('comments');
      if (commentsSection) {
        commentsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [comments]);

  if (isNaN(writingId)) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="container mx-auto px-4 py-8 flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Invalid Writing</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">The writing you're trying to view doesn't exist.</p>
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
        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            <div>
              <Skeleton className="h-10 w-3/4 mb-2" />
              <div className="flex items-center mb-6">
                <Skeleton className="h-4 w-24 mr-4" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="flex items-center mb-6">
                <Skeleton className="h-12 w-12 rounded-full mr-4" />
                <div>
                  <Skeleton className="h-5 w-32 mb-1" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <div className="space-y-4 mb-6">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <Skeleton className="h-64 w-full rounded-lg mb-6" />
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ) : writing ? (
            <>
              <article className="mb-10">
                <header className="mb-6">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">{writing.title}</h1>
                  <div className="flex flex-wrap items-center gap-4 mb-6">
                    <Badge variant="outline" className={`${
                      writing.category === 'Fiction' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                      writing.category === 'Poetry' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}>
                      {writing.category}
                    </Badge>
                    
                    <span className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      {format(new Date(writing.createdAt), 'MMM d, yyyy')}
                    </span>
                    
                    <span className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      {writing.readTime} min read
                    </span>
                    
                    <span className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                      <UserIcon className="h-4 w-4 mr-1" />
                      {writing.stats?.likes || 0} {writing.stats?.likes === 1 ? 'like' : 'likes'}
                    </span>
                  </div>
                  
                  <div className="flex items-center mb-8">
                    <Link href={`/profile/${writing.author?.id}`} className="flex items-center">
                      <Avatar className="h-12 w-12 mr-4">
                        <AvatarImage src={writing.author?.profileImage} alt={writing.author?.fullName} />
                        <AvatarFallback>{writing.author?.fullName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{writing.author?.fullName}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">@{writing.author?.username}</p>
                      </div>
                    </Link>
                  </div>
                  
                  {writing.coverImage && (
                    <div className="mb-8">
                      <img 
                        src={writing.coverImage} 
                        alt={writing.title} 
                        className="w-full rounded-lg object-cover max-h-96"
                      />
                    </div>
                  )}
                </header>
                
                <div className="prose dark:prose-invert max-w-none mb-8">
                  <Markdown content={writing.content} />
                </div>
                
                {writing.tags && writing.tags.length > 0 && (
                  <div className="mb-8">
                    <p className="text-gray-700 dark:text-gray-300 mb-2">Tags:</p>
                    <div className="flex flex-wrap gap-2">
                      {writing.tags.map((tag: string) => (
                        <Link key={tag} href={`/explore?tag=${encodeURIComponent(tag)}`}>
                          <Badge variant="outline" className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer">
                            #{tag}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between items-center py-4 border-t border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-4">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="hover:text-primary"
                      onClick={toggleLike}
                    >
                      <HeartIcon className={`h-5 w-5 mr-1.5 ${writing.userInteraction?.liked ? 'fill-primary text-primary' : ''}`} />
                      <span>{writing.stats?.likes || 0}</span>
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="hover:text-primary"
                      asChild
                    >
                      <a href="#comments">
                        <MessageSquareIcon className="h-5 w-5 mr-1.5" />
                        <span>{writing.stats?.comments || 0}</span>
                      </a>
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="hover:text-primary"
                      onClick={toggleBookmark}
                    >
                      <BookmarkIcon className={`h-5 w-5 mr-1.5 ${writing.userInteraction?.bookmarked ? 'fill-primary text-primary' : ''}`} />
                      <span>Save</span>
                    </Button>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="hover:text-primary"
                    onClick={handleShare}
                  >
                    <Share2Icon className="h-5 w-5 mr-1.5" />
                    <span>{copied ? "Copied!" : "Share"}</span>
                  </Button>
                </div>
              </article>
              
              <section id="comments" className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Comments</h2>
                
                {user ? (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onCommentSubmit)} className="mb-8">
                      <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Textarea 
                                placeholder="Share your thoughts..." 
                                className="min-h-24"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="mt-2 flex justify-end">
                        <Button 
                          type="submit" 
                          disabled={commentMutation.isPending}
                        >
                          {commentMutation.isPending ? 'Posting...' : 'Post Comment'}
                        </Button>
                      </div>
                    </form>
                  </Form>
                ) : (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-8 text-center">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">You need to be logged in to comment.</p>
                    <Button asChild>
                      <Link href="/auth">Sign In</Link>
                    </Button>
                  </div>
                )}
                
                {commentsLoading ? (
                  <div className="space-y-6">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex">
                        <Skeleton className="h-10 w-10 rounded-full mr-4" />
                        <div className="flex-1">
                          <Skeleton className="h-5 w-48 mb-2" />
                          <Skeleton className="h-4 w-full mb-1" />
                          <Skeleton className="h-4 w-3/4" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : comments?.length === 0 ? (
                  <p className="text-gray-600 dark:text-gray-400 text-center py-6">No comments yet. Be the first to share your thoughts!</p>
                ) : (
                  <div className="space-y-6">
                    {comments?.map((comment: any) => (
                      <div key={comment.id} className="pb-6 border-b border-gray-200 dark:border-gray-700 last:border-0">
                        <div className="flex items-start">
                          <Link href={`/profile/${comment.author?.id}`}>
                            <Avatar className="h-10 w-10 mr-4">
                              <AvatarImage src={comment.author?.profileImage} alt={comment.author?.fullName} />
                              <AvatarFallback>{comment.author?.fullName.charAt(0)}</AvatarFallback>
                            </Avatar>
                          </Link>
                          <div className="flex-1">
                            <div className="flex items-center mb-1">
                              <Link href={`/profile/${comment.author?.id}`}>
                                <h4 className="font-medium text-gray-900 dark:text-white hover:text-primary">
                                  {comment.author?.fullName}
                                </h4>
                              </Link>
                              <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">
                                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                              </span>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300">{comment.content}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
              
              {/* Suggested Readings (from same author or category) could be added here */}
            </>
          ) : (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold mb-2">Writing not found</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                The writing you're looking for doesn't exist or has been removed.
              </p>
              <Button asChild>
                <Link href="/">Go Home</Link>
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
}
