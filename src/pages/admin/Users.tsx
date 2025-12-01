import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserPlus, Trash2, Edit } from 'lucide-react';
import { getUsers, saveUser, deleteUser, getParents, saveParent, deleteParent } from '@/lib/storage';
import { User, UserRole, Parent } from '@/lib/types';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

const ManageUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);
  const [formData, setFormData] = useState({
    id: '',
    username: '',
    password: '',
    name: '',
    email: '',
    role: 'student' as UserRole,
    profileImage: 'default',
  });
  const [parentFormData, setParentFormData] = useState({
    id: '',
    name: '',
    email: '',
    password: '',
    studentId: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('default');

  useEffect(() => {
    loadUsers();
    loadParents();
  }, []);

  const loadUsers = () => {
    setUsers(getUsers());
  };

  const loadParents = () => {
    setParents(getParents());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newUser: User = {
      ...formData,
      id: formData.id || Date.now().toString(),
    };

    saveUser(newUser);
    toast.success(isEditing ? 'User updated successfully' : 'User created successfully');
    
    resetForm();
    loadUsers();
  };

  const handleEdit = (user: User) => {
    setFormData({
      ...user,
      email: user.email || '',
      profileImage: user.profileImage || 'default',
    });
    setImagePreview(user.profileImage || 'default');
    setIsEditing(true);
  };

  const handleDelete = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteUser(userId);
      toast.success('User deleted successfully');
      loadUsers();
    }
  };

  const resetForm = () => {
    setFormData({
      id: '',
      username: '',
      password: '',
      name: '',
      email: '',
      role: 'student',
      profileImage: 'default',
    });
    setImagePreview('default');
    setIsEditing(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setFormData({ ...formData, profileImage: base64String });
      setImagePreview(base64String);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setFormData({ ...formData, profileImage: 'default' });
    setImagePreview('default');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleParentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newParent: Parent = {
      ...parentFormData,
      id: parentFormData.id || Date.now().toString(),
    };

    saveParent(newParent);
    toast.success('Parent added successfully');
    
    resetParentForm();
    loadParents();
  };

  const handleDeleteParent = (parentId: string) => {
    if (window.confirm('Are you sure you want to delete this parent?')) {
      deleteParent(parentId);
      toast.success('Parent deleted successfully');
      loadParents();
    }
  };

  const resetParentForm = () => {
    setParentFormData({
      id: '',
      name: '',
      email: '',
      password: '',
      studentId: '',
    });
  };

  const students = users.filter(u => u.role === 'student');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-heading font-bold mb-2">Manage Users</h1>
          <p className="text-muted-foreground">Create and manage teachers and students</p>
        </div>

        {/* Create/Edit Form */}
        <Card className="p-6">
          <h2 className="text-xl font-heading font-semibold mb-4">
            {isEditing ? 'Edit User' : 'Create New User'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="bg-muted border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}>
                  <SelectTrigger className="bg-muted border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  className="bg-muted border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="bg-muted border-border"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-muted border-border"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="profileImage">Upload Profile Picture</Label>
                <div className="flex items-center gap-4 mt-2">
                  <div className="relative w-20 h-20 rounded-full border-2 border-primary/30 overflow-hidden bg-card flex items-center justify-center shadow-[0_0_6px_rgba(58,180,255,0.3)] hover:scale-103 transition-transform">
                    {imagePreview === 'default' ? (
                      <span className="text-2xl font-heading text-primary">
                        {formData.name ? getInitials(formData.name) : '?'}
                      </span>
                    ) : (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1">
                    <Input
                      id="profileImage"
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      onChange={handleImageUpload}
                      className="mb-2 bg-muted border-border"
                    />
                    {imagePreview !== 'default' && (
                      <Button type="button" variant="ghost" size="sm" onClick={removeImage} className="text-destructive">
                        Remove Picture
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="neon-glow">
                <UserPlus className="mr-2 h-4 w-4" />
                {isEditing ? 'Update User' : 'Create User'}
              </Button>
              {isEditing && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Card>

        {/* Users Table */}
        <Card className="p-6">
          <h2 className="text-xl font-heading font-semibold mb-4">All Users</h2>
          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Name</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email || '-'}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs capitalize">
                        {user.role}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(user.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Parents Section */}
        <Card className="p-6">
          <h2 className="text-xl font-heading font-semibold mb-4">Parents</h2>
          
          {/* Add Parent Form */}
          <form onSubmit={handleParentSubmit} className="space-y-4 mb-6 p-4 rounded-lg bg-muted/30">
            <h3 className="font-semibold">Add New Parent</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="parentName">Parent Name</Label>
                <Input
                  id="parentName"
                  value={parentFormData.name}
                  onChange={(e) => setParentFormData({ ...parentFormData, name: e.target.value })}
                  required
                  className="bg-muted border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parentEmail">Email</Label>
                <Input
                  id="parentEmail"
                  type="email"
                  value={parentFormData.email}
                  onChange={(e) => setParentFormData({ ...parentFormData, email: e.target.value })}
                  required
                  className="bg-muted border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parentPassword">Password</Label>
                <Input
                  id="parentPassword"
                  type="password"
                  value={parentFormData.password}
                  onChange={(e) => setParentFormData({ ...parentFormData, password: e.target.value })}
                  required
                  className="bg-muted border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="studentSelect">Select Student</Label>
                <Select value={parentFormData.studentId} onValueChange={(value) => setParentFormData({ ...parentFormData, studentId: value })}>
                  <SelectTrigger className="bg-muted border-border">
                    <SelectValue placeholder="Choose student" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" className="neon-glow">
              <UserPlus className="mr-2 h-4 w-4" />
              Add Parent
            </Button>
          </form>

          {/* Parents List */}
          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Parent Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Child</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No parents added yet
                    </TableCell>
                  </TableRow>
                ) : (
                  parents.map((parent) => {
                    const student = users.find(u => u.id === parent.studentId);
                    return (
                      <TableRow key={parent.id}>
                        <TableCell className="font-medium">{parent.name}</TableCell>
                        <TableCell>{parent.email}</TableCell>
                        <TableCell>{student?.name || 'Unknown Student'}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteParent(parent.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ManageUsers;
