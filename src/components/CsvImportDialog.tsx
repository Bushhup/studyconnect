'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { 
  FileSpreadsheet, 
  Download, 
  Upload, 
  Info, 
  CheckCircle2, 
  Loader2,
  Table as TableIcon
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export interface CsvColumn {
  key: string;
  label: string;
  description: string;
  example: string;
  required: boolean;
}

interface CsvImportDialogProps {
  title: string;
  description: string;
  columns: CsvColumn[];
  onImport?: (data: any[]) => void;
  trigger?: React.ReactNode;
}

export function CsvImportDialog({ title, description, columns, onImport, trigger }: CsvImportDialogProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const downloadTemplate = () => {
    const headers = columns.map(c => c.key).join(',');
    const exampleRow = columns.map(c => c.example).join(',');
    const csvContent = `data:text/csv;charset=utf-8,${headers}\n${exampleRow}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${title.toLowerCase().replace(/\s+/g, '_')}_template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: 'Template Downloaded',
      description: 'Follow the format in the CSV file for successful import.'
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        variant: 'destructive',
        title: 'Invalid File',
        description: 'Please upload a valid .csv file.'
      });
      return;
    }

    setIsUploading(true);
    
    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/);
      
      if (lines.length < 2) {
        throw new Error("CSV file must contain a header row and at least one data row.");
      }

      const headers = lines[0].split(',').map(h => h.trim());
      const rows = lines.slice(1)
        .filter(line => line.trim().length > 0)
        .map(line => {
          const values = line.split(',');
          const obj: any = {};
          headers.forEach((header, index) => {
            const colConfig = columns.find(c => c.key === header);
            if (colConfig) {
              obj[header] = values[index]?.trim() || '';
            }
          });
          return obj;
        });

      // Simulation delay for processing feel
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (onImport) {
        onImport(rows);
      }

      setIsUploading(false);
      setIsSuccess(true);
      
      toast({
        title: 'Bulk Import Complete',
        description: `Successfully processed ${rows.length} institutional records.`
      });
    } catch (error: any) {
      setIsUploading(false);
      toast({
        variant: 'destructive',
        title: 'Processing Error',
        description: error.message
      });
    }
  };

  return (
    <Dialog onOpenChange={(open) => !open && setIsSuccess(false)}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2 rounded-full">
            <FileSpreadsheet className="h-4 w-4" /> Bulk Import
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl rounded-[2rem] bg-card border-none">
        <DialogHeader>
          <DialogTitle className="text-2xl font-headline flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <TableIcon className="h-6 w-6 text-primary" />
            </div>
            {title}
          </DialogTitle>
          <DialogDescription className="font-body text-base">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          <div className="bg-muted/30 rounded-2xl p-6 border border-border">
            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
              <Info className="h-3.5 w-3.5" /> CSV Data Requirements
            </h4>
            <div className="grid gap-4">
              {columns.map((col) => (
                <div key={col.key} className="flex items-start justify-between group">
                  <div className="space-y-0.5">
                    <div className="text-sm font-bold flex items-center gap-2">
                      {col.label}
                      {col.required && <Badge variant="secondary" className="text-[8px] bg-red-500/10 text-red-500 border-none uppercase h-4 px-1">Required</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">{col.description}</p>
                  </div>
                  <code className="text-[10px] bg-muted px-2 py-1 rounded font-mono text-primary opacity-60 group-hover:opacity-100 transition-opacity">
                    e.g. {col.example}
                  </code>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">Step 1: Get Template</p>
              <Button 
                onClick={downloadTemplate}
                variant="outline" 
                className="w-full h-24 flex-col gap-2 rounded-2xl border-dashed hover:bg-primary/5 hover:border-primary/50 transition-all"
              >
                <Download className="h-6 w-6 text-primary" />
                <span className="text-xs font-bold">Download Formatting Guide</span>
              </Button>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">Step 2: Upload Data</p>
              <div className="relative">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  disabled={isUploading || isSuccess}
                />
                <Button 
                  variant="secondary" 
                  disabled={isUploading || isSuccess}
                  className={cn(
                    "w-full h-24 flex-col gap-2 rounded-2xl border-none shadow-none transition-all",
                    isSuccess ? "bg-emerald-500/10 text-emerald-500" : "bg-primary/5 text-primary hover:bg-primary/10"
                  )}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span className="text-xs font-bold">Parsing Records...</span>
                    </>
                  ) : isSuccess ? (
                    <>
                      <CheckCircle2 className="h-6 w-6" />
                      <span className="text-xs font-bold">Import Successful</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-6 w-6" />
                      <span className="text-xs font-bold">Select .csv File</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
