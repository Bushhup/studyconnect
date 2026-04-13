'use client';

import { useState, useEffect } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, ShieldCheck, Save, AlertCircle } from 'lucide-react';

const collegeId = 'study-connect-college';

export default function StudentBioDataPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    fullName: '',
    gender: '',
    phoneNumber: '',
    address: '',
    fatherName: '',
    fatherPhoneNumber: '',
    motherName: '',
    motherPhoneNumber: '',
    religion: '',
    aadharNumber: '',
    quota: 'Management',
  });

  const profileRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'colleges', collegeId, 'studentProfiles', user.uid);
  }, [firestore, user?.uid]);

  const { data: profile, isLoading } = useDoc(profileRef);

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || '',
        gender: profile.gender || '',
        phoneNumber: profile.phoneNumber || '',
        address: profile.address || '',
        fatherName: profile.fatherName || '',
        fatherPhoneNumber: profile.fatherPhoneNumber || '',
        motherName: profile.motherName || '',
        motherPhoneNumber: profile.motherPhoneNumber || '',
        religion: profile.religion || '',
        aadharNumber: profile.aadharNumber || '',
        quota: profile.quota || 'Management',
      });
    }
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileRef || !user?.uid) return;

    setDocumentNonBlocking(profileRef, {
      ...formData,
      id: user.uid,
      userId: user.uid,
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    toast({
      title: 'Bio Data Recorded',
      description: 'Your biographical profile has been successfully saved to the registry.',
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4">
        <Loader2 className="animate-spin h-10 w-10 text-primary" />
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Accessing Records...</p>
      </div>
    );
  }

  const isReadOnly = !!profile;

  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-headline font-bold text-foreground tracking-tight flex items-center gap-3">
          <User className="text-primary h-8 w-8" /> Institutional Bio Data
        </h1>
        <p className="text-muted-foreground mt-1 font-body">Official biographical, family, and identification records.</p>
      </div>

      {isReadOnly ? (
        <Card className="mb-8 border-none shadow-sm bg-primary/5 text-foreground rounded-2xl overflow-hidden">
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 bg-white rounded-xl shadow-sm">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold">Profile Locked</p>
              <p className="text-xs text-muted-foreground font-body">
                This record is finalized. To request modifications, please visit the Administrative Office with supporting documents.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-8 border-none shadow-sm bg-amber-50 text-amber-900 rounded-2xl overflow-hidden">
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 bg-white rounded-xl shadow-sm">
              <AlertCircle className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-bold">First-Time Submission</p>
              <p className="text-xs text-amber-800/70 font-body">
                Please verify all details carefully. Once saved, these fields will be locked for editing.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card className="border-none shadow-sm bg-card rounded-[2rem] overflow-hidden">
          <CardHeader className="bg-muted/30 border-b">
            <CardTitle className="text-lg font-headline">Personal & Identification</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Legal Name</Label>
              <Input 
                value={formData.fullName} 
                onChange={(e) => setFormData({...formData, fullName: e.target.value})} 
                disabled={isReadOnly}
                className="bg-muted border-none h-12 rounded-xl focus-visible:ring-primary/20" 
                placeholder="As per Aadhar / High School Certificate"
                required 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Gender</Label>
              <Select 
                onValueChange={(v) => setFormData({...formData, gender: v})} 
                value={formData.gender}
                disabled={isReadOnly}
              >
                <SelectTrigger className="bg-muted border-none h-12 rounded-xl focus:ring-primary/20"><SelectValue placeholder="Select Gender" /></SelectTrigger>
                <SelectContent className="rounded-xl border-none shadow-xl">
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Contact Number</Label>
              <Input 
                value={formData.phoneNumber} 
                onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} 
                disabled={isReadOnly}
                className="bg-muted border-none h-12 rounded-xl focus-visible:ring-primary/20" 
                placeholder="+91 XXXXX XXXXX"
                required 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Aadhar Number</Label>
              <Input 
                value={formData.aadharNumber} 
                onChange={(e) => setFormData({...formData, aadharNumber: e.target.value})} 
                disabled={isReadOnly}
                className="bg-muted border-none h-12 rounded-xl focus-visible:ring-primary/20 font-mono" 
                placeholder="XXXX XXXX XXXX"
                required 
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Permanent Residential Address</Label>
              <Input 
                value={formData.address} 
                onChange={(e) => setFormData({...formData, address: e.target.value})} 
                disabled={isReadOnly}
                className="bg-muted border-none h-12 rounded-xl focus-visible:ring-primary/20" 
                placeholder="House No, Street, City, State, ZIP"
                required 
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-card rounded-[2rem] overflow-hidden">
          <CardHeader className="bg-muted/30 border-b">
            <CardTitle className="text-lg font-headline">Guardian & Background</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Father's Name</Label>
              <Input 
                value={formData.fatherName} 
                onChange={(e) => setFormData({...formData, fatherName: e.target.value})} 
                disabled={isReadOnly}
                className="bg-muted border-none h-12 rounded-xl" 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Father's Phone Number</Label>
              <Input 
                value={formData.fatherPhoneNumber} 
                onChange={(e) => setFormData({...formData, fatherPhoneNumber: e.target.value})} 
                disabled={isReadOnly}
                className="bg-muted border-none h-12 rounded-xl" 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Mother's Name</Label>
              <Input 
                value={formData.motherName} 
                onChange={(e) => setFormData({...formData, motherName: e.target.value})} 
                disabled={isReadOnly}
                className="bg-muted border-none h-12 rounded-xl" 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Mother's Phone Number</Label>
              <Input 
                value={formData.motherPhoneNumber} 
                onChange={(e) => setFormData({...formData, motherPhoneNumber: e.target.value})} 
                disabled={isReadOnly}
                className="bg-muted border-none h-12 rounded-xl" 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Religion</Label>
              <Input 
                value={formData.religion} 
                onChange={(e) => setFormData({...formData, religion: e.target.value})} 
                disabled={isReadOnly}
                className="bg-muted border-none h-12 rounded-xl" 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Admission Quota</Label>
              <Select 
                onValueChange={(v) => setFormData({...formData, quota: v})} 
                value={formData.quota}
                disabled={isReadOnly}
              >
                <SelectTrigger className="bg-muted border-none h-12 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-xl border-none shadow-xl">
                  <SelectItem value="Government">Government Quota</SelectItem>
                  <SelectItem value="Management">Management Quota</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {!isReadOnly && (
          <Button type="submit" className="w-full h-14 text-lg font-headline font-bold shadow-lg shadow-primary/20 rounded-2xl uppercase tracking-tight transition-all active:scale-[0.98]">
            <Save className="mr-2 h-5 w-5" /> Finalize & Submit Bio Data
          </Button>
        )}
      </form>
    </div>
  );
}