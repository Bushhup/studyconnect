'use client';

import { useState } from 'react';
import { useCollection, useMemoFirebase, useFirestore, addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Download, 
  Plus, 
  Search, 
  Folder, 
  HardDrive, 
  Loader2, 
  Trash2, 
  Link as LinkIcon, 
  FileUp,
  Clock,
  ShieldCheck,
  Globe,
  Lock
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const collegeId = 'study-connect-college';

const categories = [
  'Administrative Forms',
  'Faculty Handbooks',
  'Policy Documents',
  'Public Templates',
  'Research Assets'
];

export default function ResourcesPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All Documents');
  
  // Upload State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [newFile, setNewFile] = useState({
    name: '',
    category: '',
    type: 'PDF',
    size: '1.2 MB',
    description: '',
    sourceType: 'local' as 'local' | 'url',
    url: '',
    accessLevel: 'Public' as 'Public' | 'Faculty' | 'Admin'
  });

  const resourcesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'colleges', collegeId, 'resources');
  }, [firestore]);

  const { data: resources, isLoading } = useCollection(resourcesQuery);

  const filteredResources = resources?.filter(res => {
    const matchesSearch = res.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All Documents' || res.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFile.name || !newFile.category) return;

    const resourcesRef = collection(firestore, 'colleges', collegeId, 'resources');
    const timestamp = new Date().toISOString();

    addDocumentNonBlocking(resourcesRef, {
      ...newFile,
      uploadedAt: timestamp,
      lastModified: timestamp,
    });

    toast({ 
      title: 'Resource Saved', 
      description: `${newFile.name} has been synchronized at ${format(new Date(), 'HH:mm')}.` 
    });
    
    setIsUploadOpen(false);
    setNewFile({ 
      name: '', 
      category: '', 
      type: 'PDF', 
      size: '1.2 MB', 
      description: '', 
      sourceType: 'local', 
      url: '', 
      accessLevel: 'Public' 
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove ${name}?`)) {
      const docRef = doc(firestore, 'colleges', collegeId, 'resources', id);
      deleteDocumentNonBlocking(docRef);
      toast({ title: 'Document Removed', description: 'The file has been deleted from the system.' });
    }
  };

  const totalSizeUsed = resources?.reduce((acc, curr) => acc + parseFloat(curr.size || '0'), 0) || 0;
  const storagePercentage = Math.min((totalSizeUsed / 100) * 100, 100);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Resource Center</h1>
          <p className="text-muted-foreground mt-1">Repository for forms, policies, templates, and faculty assets.</p>
        </div>

        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-lg shadow-primary/20 h-12 px-6 rounded-full font-bold">
              <Plus className="h-5 w-5" /> Add Resource
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Provision Institutional Resource</DialogTitle>
              <DialogDescription>Record a new asset entry. All changes are tracked with a timestamp.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpload} className="space-y-6 pt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Source Type</Label>
                  <Tabs value={newFile.sourceType} onValueChange={(v: any) => setNewFile({...newFile, sourceType: v})}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="local" className="gap-2"><FileUp className="h-4 w-4" /> Local Storage</TabsTrigger>
                      <TabsTrigger value="url" className="gap-2"><LinkIcon className="h-4 w-4" /> Remote URL</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Resource Name</Label>
                    <Input 
                      placeholder="e.g. Student Handbook 2024" 
                      value={newFile.name}
                      onChange={e => setNewFile({...newFile, name: e.target.value})}
                      required 
                      className="bg-slate-50 border-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Category</Label>
                    <Select onValueChange={v => setNewFile({...newFile, category: v})}>
                      <SelectTrigger className="bg-slate-50 border-none">
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {newFile.sourceType === 'url' && (
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Asset URL</Label>
                    <Input 
                      placeholder="https://cloud.storage.com/assets/..." 
                      value={newFile.url}
                      onChange={e => setNewFile({...newFile, url: e.target.value})}
                      required 
                      className="bg-slate-50 border-none"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Access Level</Label>
                    <Select onValueChange={(v: any) => setNewFile({...newFile, accessLevel: v})} defaultValue="Public">
                      <SelectTrigger className="bg-slate-50 border-none">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Public">Public (Everyone)</SelectItem>
                        <SelectItem value="Faculty">Faculty Only</SelectItem>
                        <SelectItem value="Admin">Admin Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">File Format</Label>
                    <Select onValueChange={v => setNewFile({...newFile, type: v})} defaultValue="PDF">
                      <SelectTrigger className="bg-slate-50 border-none">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PDF">PDF Document</SelectItem>
                        <SelectItem value="Word">Word Doc</SelectItem>
                        <SelectItem value="Excel">Spreadsheet</SelectItem>
                        <SelectItem value="Slides">Presentation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Brief Description</Label>
                  <Textarea 
                    placeholder="Provide context about this resource..." 
                    className="min-h-[100px] bg-slate-50 border-none resize-none"
                    value={newFile.description}
                    onChange={e => setNewFile({...newFile, description: e.target.value})}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full h-12 font-bold uppercase tracking-tight shadow-lg shadow-primary/20">
                Synchronize Resource
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-6">
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-primary/5 pb-4">
              <CardTitle className="text-xs text-primary font-bold uppercase tracking-widest">Repository Status</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-primary text-white">
                  <HardDrive className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">{totalSizeUsed.toFixed(2)} GB / 100 GB</p>
                  <p className="text-[10px] text-muted-foreground uppercase font-medium">Global Usage</p>
                </div>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${storagePercentage}%` }} />
              </div>
            </CardContent>
          </Card>

          <div className="space-y-1">
            <Button 
              variant={activeCategory === 'All Documents' ? 'secondary' : 'ghost'} 
              className="w-full justify-start gap-3 text-xs h-10 font-bold rounded-lg"
              onClick={() => setActiveCategory('All Documents')}
            >
              <Folder className={cn("h-4 w-4", activeCategory === 'All Documents' ? "text-primary" : "text-slate-400")} /> 
              All Documents
            </Button>
            {categories.map((folder) => (
              <Button 
                key={folder} 
                variant={activeCategory === folder ? 'secondary' : 'ghost'} 
                className="w-full justify-start gap-3 text-xs h-10 font-medium rounded-lg"
                onClick={() => setActiveCategory(folder)}
              >
                <Folder className={cn("h-4 w-4", activeCategory === folder ? "text-primary" : "text-slate-400")} /> 
                {folder}
              </Button>
            ))}
          </div>
        </div>

        <div className="md:col-span-3 space-y-6">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Search by title or keyword..." 
              className="pl-12 bg-white border-none shadow-sm h-12 text-sm focus-visible:ring-primary/20"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            {isLoading ? (
              <div className="py-20 flex flex-col items-center gap-4">
                <Loader2 className="animate-spin h-10 w-10 text-primary" />
                <span className="text-sm text-muted-foreground font-bold uppercase tracking-widest">Updating Registry...</span>
              </div>
            ) : filteredResources?.map((file) => (
              <Card key={file.id} className="border-none shadow-sm group hover:shadow-md transition-all">
                <CardContent className="p-5 flex items-start gap-4">
                  <div className={cn(
                    "p-4 rounded-2xl transition-colors",
                    file.sourceType === 'url' ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"
                  )}>
                    {file.sourceType === 'url' ? <LinkIcon className="h-6 w-6" /> : <FileText className="h-6 w-6" />}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-base font-bold text-slate-800 truncate">{file.name}</p>
                      <Badge variant="outline" className="text-[9px] uppercase tracking-tighter h-5 px-1.5 font-bold">
                        {file.accessLevel || 'Public'}
                      </Badge>
                    </div>
                    
                    {file.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1 mb-2 font-medium">
                        {file.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold uppercase">
                        <Badge variant="secondary" className="bg-slate-100 text-slate-500 rounded px-1.5 py-0">
                          {file.type}
                        </Badge>
                        <span>{file.size}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium italic">
                        <Folder className="h-3 w-3" /> {file.category}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-bold uppercase tracking-tight">
                        <Clock className="h-3 w-3" /> Last Modified: {file.lastModified ? format(new Date(file.lastModified), 'MMM dd, HH:mm') : 'N/A'}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-10 w-10 rounded-xl"
                      onClick={() => toast({ title: 'Accessing Resource', description: 'Redirecting to asset location...' })}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-10 w-10 rounded-xl text-red-400 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(file.id, file.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {!isLoading && filteredResources?.length === 0 && (
              <div className="py-24 text-center border-2 border-dashed rounded-[2rem] bg-slate-50/50">
                <FileText className="h-12 w-12 mx-auto mb-4 text-slate-200" />
                <p className="font-bold text-slate-800">No assets matching your search</p>
                <p className="text-xs text-muted-foreground mt-1">Try clearing filters or adding a new institutional resource.</p>
                <Button 
                  variant="link" 
                  className="mt-4 font-bold text-primary"
                  onClick={() => {setSearchQuery(''); setActiveCategory('All Documents')}}
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
