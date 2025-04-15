import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import MobileNav from '@/components/layout/mobile-nav';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CheckIcon, PencilIcon, TrashIcon, ShieldIcon, PlusCircleIcon, XCircleIcon, SearchIcon, RefreshCwIcon, SettingsIcon } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export default function AdminPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('users');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch all users
  const { data: users, isLoading: usersLoading, refetch: refetchUsers } = useQuery({
    queryKey: ['/api/admin/users'],
  });
  
  // Fetch all writings
  const { data: writings, isLoading: writingsLoading, refetch: refetchWritings } = useQuery({
    queryKey: ['/api/admin/writings'],
  });
  
  // Fetch all challenges
  const { data: challenges, isLoading: challengesLoading, refetch: refetchChallenges } = useQuery({
    queryKey: ['/api/challenges'],
  });
  
  // Set page title
  useEffect(() => {
    document.title = 'Admin Panel - Pencraft';
  }, []);
  
  // Check if user is authorized to access admin
  useEffect(() => {
    if (user && !isAdmin(user)) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin panel",
        variant: "destructive"
      });
      navigate('/');
    } else if (!user) {
      navigate('/auth');
    }
  }, [user, navigate, toast]);
  
  // Check if user is admin
  const isAdmin = (user: any) => {
    return user?.role === 'admin' || user?.id === 1; // For demo, consider first user as admin
  };
  
  // Feature toggle mutation
  const toggleFeatureMutation = useMutation({
    mutationFn: async ({ type, id, field, value }: { type: string, id: number, field: string, value: boolean }) => {
      const res = await apiRequest('PATCH', `/api/admin/${type}/${id}`, { [field]: value });
      return await res.json();
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Success",
        description: `${variables.type.slice(0, -1)} updated successfully.`
      });
      
      if (variables.type === 'users') refetchUsers();
      else if (variables.type === 'writings') refetchWritings();
      else if (variables.type === 'challenges') refetchChallenges();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async ({ type, id }: { type: string, id: number }) => {
      await apiRequest('DELETE', `/api/admin/${type}/${id}`);
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Success",
        description: `${variables.type.slice(0, -1)} deleted successfully.`
      });
      
      if (variables.type === 'users') refetchUsers();
      else if (variables.type === 'writings') refetchWritings();
      else if (variables.type === 'challenges') refetchChallenges();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  // Role change mutation
  const changeRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: number, role: string }) => {
      const res = await apiRequest('PATCH', `/api/admin/users/${userId}`, { role });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User role updated successfully."
      });
      refetchUsers();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update role: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Filter data based on search query
  const filteredUsers = users?.filter((user: any) => 
    searchQuery ? 
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    : true
  );
  
  const filteredWritings = writings?.filter((writing: any) => 
    searchQuery ? 
      writing.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      writing.author?.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      writing.category.toLowerCase().includes(searchQuery.toLowerCase())
    : true
  );
  
  const filteredChallenges = challenges?.filter((challenge: any) => 
    searchQuery ? 
      challenge.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      challenge.description.toLowerCase().includes(searchQuery.toLowerCase())
    : true
  );
  
  // Don't render anything while checking authorization
  if (!user || !isAdmin(user)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                <ShieldIcon className="mr-2 h-8 w-8 text-primary" />
                Admin Panel
              </h1>
              <p className="text-gray-600 dark:text-gray-400">Manage users, content, and platform settings</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input 
                  className="pl-9 w-64" 
                  placeholder="Search..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => {
                  if (activeTab === 'users') refetchUsers();
                  else if (activeTab === 'writings') refetchWritings();
                  else if (activeTab === 'challenges') refetchChallenges();
                  
                  toast({
                    title: "Refreshed",
                    description: "Data has been refreshed."
                  });
                }}
              >
                <RefreshCwIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="users" className="flex items-center">
                Users
              </TabsTrigger>
              <TabsTrigger value="writings" className="flex items-center">
                Writings
              </TabsTrigger>
              <TabsTrigger value="challenges" className="flex items-center">
                Challenges
              </TabsTrigger>
            </TabsList>

            {/* Users Tab */}
            <TabsContent value="users">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>User Management</CardTitle>
                      <CardDescription>Manage user accounts and permissions</CardDescription>
                    </div>
                    {/* Would add user creation in a real app */}
                  </div>
                </CardHeader>
                <CardContent>
                  {usersLoading ? (
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Skeleton className="h-10 w-10 rounded-full mr-3" />
                            <div>
                              <Skeleton className="h-4 w-40 mb-2" />
                              <Skeleton className="h-3 w-24" />
                            </div>
                          </div>
                          <Skeleton className="h-8 w-24" />
                        </div>
                      ))}
                    </div>
                  ) : filteredUsers?.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-gray-600 dark:text-gray-400">No users found</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers?.map((user: any) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div className="flex items-center">
                                <Avatar className="h-8 w-8 mr-3">
                                  <AvatarImage src={user.profileImage} alt={user.fullName} />
                                  <AvatarFallback>{user.fullName?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{user.fullName}</div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Select 
                                defaultValue={user.role || 'user'} 
                                onValueChange={(value) => {
                                  changeRoleMutation.mutate({ userId: user.id, role: value });
                                }}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="user">User</SelectItem>
                                  <SelectItem value="editor">Editor</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Switch 
                                  checked={!user.suspended} 
                                  onCheckedChange={(checked) => {
                                    toggleFeatureMutation.mutate({ 
                                      type: 'users', 
                                      id: user.id, 
                                      field: 'suspended', 
                                      value: !checked 
                                    });
                                  }}
                                />
                                <Label>{user.suspended ? 'Suspended' : 'Active'}</Label>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => navigate(`/profile/${user.id}`)}
                                >
                                  View
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm">Delete</Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This will permanently delete the user "{user.username}" and all their data.
                                        This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => deleteMutation.mutate({ type: 'users', id: user.id })}
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Writings Tab */}
            <TabsContent value="writings">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Content Management</CardTitle>
                      <CardDescription>Manage all writings on the platform</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {writingsLoading ? (
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div>
                            <Skeleton className="h-5 w-64 mb-2" />
                            <Skeleton className="h-4 w-96" />
                          </div>
                          <Skeleton className="h-8 w-24" />
                        </div>
                      ))}
                    </div>
                  ) : filteredWritings?.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-gray-600 dark:text-gray-400">No writings found</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Author</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Featured</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredWritings?.map((writing: any) => (
                          <TableRow key={writing.id}>
                            <TableCell>
                              <div className="font-medium">{writing.title}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                                {writing.description}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Avatar className="h-6 w-6 mr-2">
                                  <AvatarImage src={writing.author?.profileImage} alt={writing.author?.fullName} />
                                  <AvatarFallback>{writing.author?.fullName?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span>{writing.author?.username}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">{writing.category}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Switch 
                                  checked={writing.featured || false} 
                                  onCheckedChange={(checked) => {
                                    toggleFeatureMutation.mutate({ 
                                      type: 'writings', 
                                      id: writing.id, 
                                      field: 'featured', 
                                      value: checked 
                                    });
                                  }}
                                />
                                <Label>{writing.featured ? 'Featured' : 'Not Featured'}</Label>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => navigate(`/writing/${writing.id}`)}
                                >
                                  View
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm">Delete</Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This will permanently delete the writing "{writing.title}".
                                        This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => deleteMutation.mutate({ type: 'writings', id: writing.id })}
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Challenges Tab */}
            <TabsContent value="challenges">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Challenge Management</CardTitle>
                      <CardDescription>Manage writing challenges</CardDescription>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button>
                          <PlusCircleIcon className="h-4 w-4 mr-2" />
                          New Challenge
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create New Challenge</DialogTitle>
                          <DialogDescription>
                            Add a new writing challenge for users to participate in.
                          </DialogDescription>
                        </DialogHeader>
                        {/* In a real app, we would add a form here */}
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input id="title" placeholder="Challenge title" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Input id="description" placeholder="Challenge description" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="end-date">End Date</Label>
                            <Input id="end-date" type="date" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="word-limit">Word Limit (optional)</Label>
                            <Input id="word-limit" type="number" placeholder="Word limit" />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="submit">Create Challenge</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {challengesLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div>
                            <Skeleton className="h-5 w-64 mb-2" />
                            <Skeleton className="h-4 w-96" />
                          </div>
                          <Skeleton className="h-8 w-24" />
                        </div>
                      ))}
                    </div>
                  ) : filteredChallenges?.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-gray-600 dark:text-gray-400">No challenges found</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>End Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Entries</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredChallenges?.map((challenge: any) => {
                          const isActive = challenge.endDate ? new Date(challenge.endDate) > new Date() : true;
                          
                          return (
                            <TableRow key={challenge.id}>
                              <TableCell>
                                <div className="font-medium">{challenge.title}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                                  {challenge.description}
                                </div>
                              </TableCell>
                              <TableCell>
                                {challenge.endDate ? new Date(challenge.endDate).toLocaleDateString() : 'No end date'}
                              </TableCell>
                              <TableCell>
                                <Badge variant={isActive ? "success" : "destructive"}>
                                  {isActive ? 'Active' : 'Ended'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {challenge.stats?.entriesCount || 0} entries
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end space-x-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                      // In a real app, we would navigate to a challenge details page
                                      toast({
                                        title: "Info",
                                        description: "Challenge details would be shown here in a real app."
                                      });
                                    }}
                                  >
                                    View Entries
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="destructive" size="sm">Delete</Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          This will permanently delete the challenge "{challenge.title}" and all entries.
                                          This action cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => deleteMutation.mutate({ type: 'challenges', id: challenge.id })}
                                        >
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
}