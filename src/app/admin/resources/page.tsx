'use client';

import { useState } from 'react';
import { useCollection, useMemoFirebase, useFirestore, addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Share2, Plus, Search, Folder, HardDrive, Loader2, Trash2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

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
    size: '1.2 MB'
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
    addDocumentNonBlocking(resourcesRef, {
      ...newFile,
      uploadedAt: new Date().toISOString(),
    });

    toast({ title: 'Document Added', description: `${newFile.name} is now available in the repository.` });
    setIsUploadOpen(false);
    setNewFile({ name: '', category: '', type: 'PDF', size: '1.2 MB' });
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove ${name}?`)) {
      const docRef = doc(firestore, 'colleges', collegeId, 'resources', id);
      deleteDocumentNonBlocking(docRef);
      toast({ title: 'Document Removed', description: 'The file has been deleted from the system.' });
    }
  };

  const totalSizeUsed = resources?.reduce((acc, curr) => acc + parseFloat(curr.size), 0) || 0;
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
            <Button className="gap-2 shadow-lg shadow-primary/20">
              <Plus className="h-4 w-4" /> Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Resource</DialogTitle>
              <DialogDescription>Record a new file entry in the institutional repository.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpload} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Document Name</Label>
                <Input 
                  placeholder="e.g. Student Handbook 2024" 
                  value={newFile.name}
                  onChange={e => setNewFile({...newFile, name: e.target.value})}
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select onValueChange={v => setNewFile({...newFile, category: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>File Type</Label>
                  <Select onValueChange={v => setNewFile({...newFile, type: v})} defaultValue="PDF">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PDF">PDF</SelectItem>
                      <SelectItem value="Word">Word</SelectItem>
                      <SelectItem value="Excel">Excel</SelectItem>
                      <SelectItem value="Slides">Slides</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" className="w-full mt-4">Save to Repository</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="space-y-4">
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm text-slate-600 font-bold uppercase tracking-widest">Storage Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-4">
                <HardDrive className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-xs font-bold text-slate-800">{totalSizeUsed.toFixed(1)} GB / 100 GB</p>
                  <p className="text-[10px] text-muted-foreground uppercase">Cloud Utilization</p>
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
              className="w-full justify-start gap-3 text-xs h-10 font-bold"
              onClick={() => setActiveCategory('All Documents')}
            >
              <Folder className="h-4 w-4 text-blue-500" /> All Documents
            </Button>
            {categories.map((folder) => (
              <Button 
                key={folder} 
                variant={activeCategory === folder ? 'secondary' : 'ghost'} 
                className="w-full justify-start gap-3 text-xs h-10 font-medium"
                onClick={() => setActiveCategory(folder)}
              >
                <Folder className="h-4 w-4 text-slate-400" /> {folder}
              </Button>
            ))}
          </div>
        </div>

        <div className="md:col-span-3 space-y-6">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search within repository..." 
              className="pl-10 bg-white border-none shadow-sm"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {isLoading ? (
              <div className="col-span-full py-20 flex flex-col items-center gap-2">
                <Loader2 className="animate-spin h-8 w-8 text-primary" />
                <span className="text-sm text-muted-foreground font-medium">Indexing Library...</span>
              </div>
            ) : filteredResources?.map((file) => (
              <Card key={file.id} className="border-none shadow-sm group hover:shadow-md transition-all relative">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{file.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-[8px] uppercase tracking-tighter px-1.5 py-0">{file.type}</Badge>
                      <span className="text-[10px] text-muted-foreground">{file.size}</span>
                      <span className="text-[10px] text-slate-400 italic truncate">• {file.category}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toast({ title: 'Download', description: 'File downloading...' })}><Download className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(file.id, file.name)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {!isLoading && filteredResources?.length === 0 && (
              <div className="col-span-full py-20 text-center border-2 border-dashed rounded-3xl">
                <FileText className="h-10 w-10 mx-auto mb-4 text-slate-200" />
                <p className="text-muted-foreground font-medium">No documents found in this view.</p>
                <Button variant="link" onClick={() => {setSearchQuery(''); setActiveCategory('All Documents')}}>Clear all filters</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}