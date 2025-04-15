import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import MobileNav from '@/components/layout/mobile-nav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import Markdown from '@/components/ui/markdown';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

const writingSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters' }).max(100, { message: 'Title must be less than 100 characters' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters' }).max(500, { message: 'Description must be less than 500 characters' }),
  content: z.string().min(50, { message: 'Content must be at least 50 characters' }),
  category: z.string().min(1, { message: 'Please select a category' }),
  coverImage: z.string().url({ message: 'Please enter a valid URL' }).optional().or(z.literal('')),
  tags: z.string().transform(val => val ? val.split(',').map(tag => tag.trim()) : []),
  readTime: z.coerce.number().min(1, { message: 'Read time must be at least 1 minute' }).max(60, { message: 'Read time must be less than 60 minutes' })
});

type WritingFormValues = z.infer<typeof writingSchema>;

export default function CreateWritingPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [previewTab, setPreviewTab] = useState('edit');

  // Set page title
  useEffect(() => {
    document.title = 'Create Writing - Pencraft';
  }, []);

  // Get categories
  const { data: categories } = useQuery({
    queryKey: ['/api/categories'],
  });

  // Create writing form
  const form = useForm<WritingFormValues>({
    resolver: zodResolver(writingSchema),
    defaultValues: {
      title: '',
      description: '',
      content: '',
      category: '',
      coverImage: '',
      tags: '',
      readTime: 5
    }
  });

  // Calculate read time automatically based on content length
  useEffect(() => {
    const content = form.watch('content');
    if (content) {
      // Average reading speed: 225 words per minute
      const wordCount = content.trim().split(/\s+/).length;
      const readTime = Math.max(1, Math.ceil(wordCount / 225));
      if (readTime <= 60) {
        form.setValue('readTime', readTime);
      }
    }
  }, [form.watch('content')]);

  // Create writing mutation
  const createWritingMutation = useMutation({
    mutationFn: async (data: WritingFormValues) => {
      const res = await apiRequest('POST', '/api/writings', data);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Success!',
        description: 'Your writing has been published successfully.',
      });
      navigate(`/writing/${data.id}`);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to publish your writing. Please try again.',
        variant: 'destructive'
      });
      console.error('Error creating writing:', error);
    }
  });

  const onSubmit = (data: WritingFormValues) => {
    createWritingMutation.mutate(data);
  };

  const estimatedReadTime = form.watch('readTime');
  const contentPreview = form.watch('content') || '*Your content preview will appear here*';

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create New Writing</h1>
            <p className="text-gray-600 dark:text-gray-400">Share your story, poem, or essay with the world</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Writing Details</CardTitle>
                      <CardDescription>
                        Basic information about your writing
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter an engaging title" {...field} />
                            </FormControl>
                            <FormDescription>
                              A catchy title will attract more readers
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Write a short description of your writing" 
                                className="resize-none h-24" 
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              This will appear in previews and search results
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {categories?.map((category: string) => (
                                    <SelectItem key={category} value={category}>{category}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Choose the category that best fits your writing
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="tags"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tags</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="fiction, adventure, romance" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormDescription>
                                Comma-separated tags to help readers find your work
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="coverImage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cover Image URL (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="https://example.com/image.jpg" {...field} />
                            </FormControl>
                            <FormDescription>
                              A URL to an image that represents your writing
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="readTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estimated Read Time (minutes)</FormLabel>
                            <FormControl>
                              <Input type="number" min={1} max={60} {...field} />
                            </FormControl>
                            <FormDescription>
                              Automatically calculated, but you can adjust if needed
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </div>

                <div className="md:col-span-1">
                  <Card>
                    <CardHeader>
                      <CardTitle>Publishing Guide</CardTitle>
                      <CardDescription>
                        Tips for creating great content
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-1">Markdown Supported</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          You can use Markdown to format your text:
                        </p>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 list-disc list-inside mt-1">
                          <li>**bold** for <strong>bold text</strong></li>
                          <li>*italic* for <em>italic text</em></li>
                          <li># Heading 1, ## Heading 2</li>
                          <li>[Link](url) for hyperlinks</li>
                          <li>![Alt text](image-url) for images</li>
                        </ul>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="font-semibold mb-1">Content Guidelines</h3>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 list-disc list-inside">
                          <li>Be original and authentic</li>
                          <li>Respect copyright and cite sources</li>
                          <li>Avoid offensive or harmful content</li>
                          <li>Proofread before publishing</li>
                        </ul>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="font-semibold mb-1">Stats</h3>
                        <div className="text-sm">
                          <div className="flex justify-between mb-1">
                            <span className="text-gray-600 dark:text-gray-400">Estimated read time:</span>
                            <span className="font-medium">{estimatedReadTime} min</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Content</CardTitle>
                  <CardDescription>
                    Write your story, poem, or essay below
                  </CardDescription>
                  <Tabs value={previewTab} onValueChange={setPreviewTab}>
                    <TabsList>
                      <TabsTrigger value="edit">Edit</TabsTrigger>
                      <TabsTrigger value="preview">Preview</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </CardHeader>
                <CardContent>
                  <TabsContent value="edit" className="mt-0">
                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea 
                              placeholder="Start writing your story here..." 
                              className="min-h-[400px] font-mono" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Markdown formatting is supported
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                  <TabsContent value="preview" className="mt-0">
                    <div className="border rounded-md p-4 min-h-[400px] overflow-y-auto">
                      <Markdown content={contentPreview} />
                    </div>
                  </TabsContent>
                </CardContent>
              </Card>

              <div className="flex justify-end space-x-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/')}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createWritingMutation.isPending}
                >
                  {createWritingMutation.isPending ? 'Publishing...' : 'Publish Writing'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
}
