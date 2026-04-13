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
import { Loader2, User, ShieldCheck, Save } from 'lucide-react';

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
    if (!profileRef) return;

    setDocumentNonBlocking(profileRef, {
      ...formData,
      userId: user?.uid,
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    toast({
      title: 'Bio Data Submitted',
      description: 'Your information has been securely stored in the institutional records.',
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4">
        <Loader2 className="animate-spin h-10 w-10 text-primary" />
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Fetching records...</p>
      </div>
    );
  }

  const isReadOnly = !!profile;

  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-headline font-bold text-foreground tracking-tight flex items-center gap-3">
          <User className="text-primary h-8 w-8" /> Student Bio Data
        </h1>
        <p className="text-muted-foreground mt-1 font-body">Official biographical and contact information record.</p>
      </div>

      {isReadOnly && (
        <Card className="mb-8 border-none shadow-sm bg-accent/10 text-foreground rounded-2xl">
          <CardContent className="pt-6 flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <p className="text-xs font-medium font-body">
              This record is locked. To modify your bio data, please contact the administrative office.
            </p>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card className="border-none shadow-sm bg-card rounded-[2rem] overflow-hidden">
          <CardHeader className="bg-muted/30 border-b">
            <CardTitle className="text-lg font-headline">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="font-body">Full Legal Name</Label>
              <Input 
                value={formData.fullName} 
                onChange={(e) => setFormData({...formData, fullName: e.target.value})} 
                disabled={isReadOnly}
                className="bg-muted border-none h-11" required 
              />
            </div>
            <div className="space-y-2">
              <Label className="font-body">Gender</Label>
              <Select 
                onValueChange={(v) => setFormData({...formData, gender: v})} 
                value={formData.gender}
                disabled={isReadOnly}
              >
                <SelectTrigger className="bg-muted border-none h-11"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="font-body">Personal Phone Number</Label>
              <Input 
                value={formData.phoneNumber} 
                onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} 
                disabled={isReadOnly}
                className="bg-muted border-none h-11" required 
              />
            </div>
            <div className="space-y-2">
              <Label className="font-body">Aadhar Identification Number</Label>
              <Input 
                value={formData.aadharNumber} 
                onChange={(e) => setFormData({...formData, aadharNumber: e.target.value})} 
                disabled={isReadOnly}
                className="bg-muted border-none h-11" required 
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label className="font-body">Residential Address</Label>
              <Input 
                value={formData.address} 
                onChange={(e) => setFormData({...formData, address: e.target.value})} 
                disabled={isReadOnly}
                className="bg-muted border-none h-11" required 
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-card rounded-[2rem] overflow-hidden">
          <CardHeader className="bg-muted/30 border-b">
            <CardTitle className="text-lg font-headline">Family & Background</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="font-body">Father's Name</Label>
              <Input 
                value={formData.fatherName} 
                onChange={(e) => setFormData({...formData, fatherName: e.target.value})} 
                disabled={isReadOnly}
                className="bg-muted border-none h-11" required 
              />
            </div>
            <div className="space-y-2">
              <Label className="font-body">Father's Contact Number</Label>
              <Input 
                value={formData.fatherPhoneNumber} 
                onChange={(e) => setFormData({...formData, fatherPhoneNumber: e.target.value})} 
                disabled={isReadOnly}
                className="bg-muted border-none h-11" required 
              />
            </div>
            <div className="space-y-2">
              <Label className="font-body">Mother's Name</Label>
              <Input 
                value={formData.motherName} 
                onChange={(e) => setFormData({...formData, motherName: e.target.value})} 
                disabled={isReadOnly}
                className="bg-muted border-none h-11" required 
              />
            </div>
            <div className="space-y-2">
              <Label className="font-body">Mother's Contact Number</Label>
              <Input 
                value={formData.motherPhoneNumber} 
                onChange={(e) => setFormData({...formData, motherPhoneNumber: e.target.value})} 
                disabled={isReadOnly}
                className="bg-muted border-none h-11" required 
              />
            </div>
            <div className="space-y-2">
              <Label className="font-body">Religion</Label>
              <Input 
                value={formData.religion} 
                onChange={(e) => setFormData({...formData, religion: e.target.value})} 
                disabled={isReadOnly}
                className="bg-muted border-none h-11" required 
              />
            </div>
            <div className="space-y-2">
              <Label className="font-body">Admission Quota</Label>
              <Select 
                onValueChange={(v) => setFormData({...formData, quota: v})} 
                value={formData.quota}
                disabled={isReadOnly}
              >
                <SelectTrigger className="bg-muted border-none h-11 font-body"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Government">Government</SelectItem>
                  <SelectItem value="Management">Management</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {!isReadOnly && (
          <Button type="submit" className="w-full h-14 text-lg font-headline font-bold shadow-lg shadow-primary/20 rounded-2xl uppercase tracking-tight">
            <Save className="mr-2 h-5 w-5" /> Submit Bio Data Profile
          </Button>
        )}
      </form>
    </div>
  );
}