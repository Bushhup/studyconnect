'use client';

import React, { useState, useRef } from 'react';
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
  Table as TableIcon,
  Trash2,
  AlertCircle,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from '@/components/ui/scroll-area';

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

type ImportStep = 'upload' | 'review' | 'processing' | 'success';

export function CsvImportDialog({ title, description, columns, onImport, trigger }: CsvImportDialogProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [step, setStep] = useState<ImportStep>('upload');
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

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

    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast({
        variant: 'destructive',
        title: 'Invalid File',
        description: 'Please upload a valid .csv file.'
      });
      return;
    }

    try {
      const text = await file.text();
      // Split by lines and remove empty ones
      const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
      
      if (lines.length < 2) {
        throw new Error("CSV file must contain a header row and at least one data row.");
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const dataRows = lines.slice(1);
      
      const rows = dataRows.map(line => {
        const values = line.split(',').map(v => v.trim());
        const obj: any = {};
        
        // Map based on columns provided in props
        columns.forEach(col => {
          const headerIndex = headers.indexOf(col.key.toLowerCase());
          if (headerIndex !== -1) {
            obj[col.key] = values[headerIndex] || '';
          } else {
            // Fallback: try matching by label if key doesn't match
            const labelIndex = headers.indexOf(col.label.toLowerCase());
            if (labelIndex !== -1) {
              obj[col.key] = values[labelIndex] || '';
            } else {
              obj[col.key] = '';
            }
          }
        });
        return obj;
      });

      // Filter out rows that are completely empty
      const validRows = rows.filter(r => Object.values(r).some(v => v !== ''));

      if (validRows.length === 0) {
        throw new Error("No data rows found in the uploaded file.");
      }

      setParsedData(validRows);
      setStep('review');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Parsing Error',
        description: error.message
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleUpdateCell = (index: number, key: string, value: string) => {
    const newData = [...parsedData];
    newData[index] = { ...newData[index], [key]: value };
    setParsedData(newData);
  };

  const handleRemoveRow = (index: number) => {
    const newData = parsedData.filter((_, i) => i !== index);
    setParsedData(newData);
    if (newData.length === 0) {
      reset();
    }
  };

  const confirmImport = async () => {
    if (parsedData.length === 0) return;
    
    setIsProcessing(true);
    setStep('processing');
    
    try {
      if (onImport) {
        onImport(parsedData);
      }
      // Artificial delay to show progress for large datasets
      await new Promise(resolve => setTimeout(resolve, 800));
      setStep('success');
    } catch (error: any) {
      setStep('review');
      toast({
        variant: 'destructive',
        title: 'Sync Error',
        description: error.message
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setStep('upload');
    setParsedData([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <Dialog onOpenChange={(open) => !open && reset()}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2 rounded-full h-11 px-6 bg-card border-primary/10 text-primary font-bold">
            <FileSpreadsheet className="h-4 w-4" /> Bulk Import
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className={cn(
        "rounded-[2.5rem] border-none shadow-2xl bg-card transition-all duration-300",
        step === 'review' ? "max-w-6xl h-[85vh] flex flex-col" : "max-w-2xl"
      )}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-headline flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <TableIcon className="h-6 w-6 text-primary" />
            </div>
            {title}
          </DialogTitle>
          <DialogDescription className="font-body text-base">
            {step === 'review' ? `Detected ${parsedData.length} records. Verify or edit them before synchronizing.` : description}
          </DialogDescription>
        </DialogHeader>

        {step === 'upload' && (
          <div className="space-y-6 pt-4">
            <div className="bg-muted/30 rounded-2xl p-6 border border-border">
              <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                <Info className="h-3.5 w-3.5" /> Data Mapping Requirements
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
                      key: {col.key}
                    </code>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                onClick={downloadTemplate}
                variant="outline" 
                className="w-full h-32 flex-col gap-2 rounded-3xl border-dashed hover:bg-primary/5 hover:border-primary/50 transition-all bg-transparent"
              >
                <Download className="h-8 w-8 text-primary/40 group-hover:text-primary" />
                <div className="text-center">
                  <p className="text-xs font-bold">1. Download Template</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Get the formatting guide</p>
                </div>
              </Button>

              <div className="relative group">
                <input
                  type="file"
                  accept=".csv"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <Button 
                  variant="secondary" 
                  className="w-full h-32 flex-col gap-2 rounded-3xl border-none shadow-none bg-primary/5 group-hover:bg-primary/10 transition-all"
                >
                  <Upload className="h-8 w-8 text-primary" />
                  <div className="text-center">
                    <p className="text-xs font-bold">2. Upload Data File</p>
                    <p className="text-[10px] text-primary/60 mt-1">Select .csv to process</p>
                  </div>
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 'review' && (
          <div className="flex-1 flex flex-col min-h-0 space-y-4 pt-4 overflow-hidden">
            <div className="border rounded-2xl overflow-hidden flex-1 flex flex-col bg-muted/10">
              <ScrollArea className="flex-1">
                <Table>
                  <TableHeader className="bg-card sticky top-0 z-10">
                    <TableRow className="border-b bg-muted/50">
                      {columns.map(col => (
                        <TableHead key={col.key} className="text-[10px] font-bold uppercase tracking-widest py-4 px-4 min-w-[150px]">
                          {col.label}
                        </TableHead>
                      ))}
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedData.map((row, rowIndex) => (
                      <TableRow key={`row-${rowIndex}`} className="hover:bg-primary/5 border-b last:border-0 group">
                        {columns.map(col => (
                          <TableCell key={`${rowIndex}-${col.key}`} className="p-0">
                            <Input 
                              value={row[col.key] || ''} 
                              onChange={(e) => handleUpdateCell(rowIndex, col.key, e.target.value)}
                              className="h-12 border-none rounded-none bg-transparent hover:bg-white focus:bg-white focus:ring-0 text-sm font-medium transition-all px-4"
                            />
                          </TableCell>
                        ))}
                        <TableCell className="p-2 text-right">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleRemoveRow(rowIndex)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
            
            <div className="flex justify-between items-center py-4 px-6 bg-muted/30 rounded-2xl">
              <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                <Info className="h-3.5 w-3.5" />
                <span>You can edit data directly in the table cells above</span>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" className="rounded-xl h-11 px-6 font-bold" onClick={reset}>
                  <ArrowLeft className="h-4 w-4 mr-2" /> Reset
                </Button>
                <Button className="rounded-xl h-11 px-8 font-bold gap-2 shadow-lg shadow-primary/20" onClick={confirmImport}>
                  Confirm & Sync {parsedData.length} Records <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 'processing' && (
          <div className="py-20 flex flex-col items-center justify-center space-y-6">
            <div className="relative">
              <Loader2 className="h-16 w-16 animate-spin text-primary opacity-20" />
              <div className="absolute inset-0 flex items-center justify-center">
                <TableIcon className="h-6 w-6 text-primary animate-pulse" />
              </div>
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-xl font-bold font-headline">Synchronizing Records...</h3>
              <p className="text-sm text-muted-foreground">Writing {parsedData.length} nodes to the institutional database.</p>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="py-20 flex flex-col items-center justify-center space-y-6 animate-in zoom-in-95 duration-500">
            <div className="h-20 w-20 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 scale-110">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-2xl font-bold font-headline text-foreground">Import Successful</h3>
              <p className="text-sm text-muted-foreground">The institutional directory has been updated with {parsedData.length} new records.</p>
            </div>
            <Button className="rounded-xl h-12 px-10 font-bold uppercase text-[10px] tracking-widest" onClick={() => reset()}>
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}