
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Share2, Plus, Search, Folder, HardDrive } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function ResourcesPage() {
  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Resource Center</h1>
          <p className="text-muted-foreground mt-1">Repository for forms, policies, templates, and faculty assets.</p>
        </div>
        <Button className="gap-2 shadow-lg shadow-primary/20">
          <Plus className="h-4 w-4" /> Upload Document
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="space-y-4">
           <Card className="border-none shadow-sm">
             <CardHeader className="pb-4">
               <CardTitle className="text-sm">Storage Stats</CardTitle>
             </CardHeader>
             <CardContent>
                <div className="flex items-center gap-3 mb-4">
                   <HardDrive className="h-8 w-8 text-primary" />
                   <div>
                      <p className="text-xs font-bold text-slate-800">42.5 GB / 100 GB</p>
                      <p className="text-[10px] text-muted-foreground uppercase">Cloud Utilization</p>
                   </div>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                   <div className="h-full bg-primary w-[42%]" />
                </div>
             </CardContent>
           </Card>

           <div className="space-y-1">
              {['All Documents', 'Administrative Forms', 'Faculty Handbooks', 'Policy Documents', 'Public Templates'].map((folder) => (
                <Button key={folder} variant="ghost" className="w-full justify-start gap-3 text-xs h-10 font-medium">
                   <Folder className="h-4 w-4 text-blue-500" /> {folder}
                </Button>
              ))}
           </div>
        </div>

        <div className="md:col-span-3 space-y-6">
           <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search within repository..." className="pl-10 bg-white border-none shadow-sm" />
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { name: 'Student_Admission_Policy_2024.pdf', size: '2.4 MB', type: 'PDF' },
                { name: 'Faculty_Reimbursement_Form.docx', size: '450 KB', type: 'Word' },
                { name: 'Campus_Safety_Protocol.pdf', size: '1.8 MB', type: 'PDF' },
                { name: 'Graduation_Template_Master.pptx', size: '12.2 MB', type: 'Slides' },
              ].map((file) => (
                <Card key={file.name} className="border-none shadow-sm group hover:shadow-md transition-all">
                  <CardContent className="p-4 flex items-center gap-4">
                     <div className="p-3 rounded-xl bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                        <FileText className="h-6 w-6" />
                     </div>
                     <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">{file.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                           <Badge variant="outline" className="text-[8px] uppercase tracking-tighter px-1.5 py-0">{file.type}</Badge>
                           <span className="text-[10px] text-muted-foreground">{file.size}</span>
                        </div>
                     </div>
                     <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Download className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Share2 className="h-4 w-4" /></Button>
                     </div>
                  </CardContent>
                </Card>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}
