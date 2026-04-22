
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
import { Loader2, User, ShieldCheck, Save, AlertCircle, Calendar } from 'lucide-react';

const collegeId = 'study-connect-college';

const formatAadhar = (val: string) => {
  const digits = val.replace(/\D/g, '').slice(0, 12);
  const groups = digits.match(/.{1,4}/g) || [];
  return groups.join(' ');
};

const formatPhone = (val: string) => {
  const digits = val.replace(/\D/g, '').slice(0, 10);
  const groups = [digits.slice(0, 5), digits.slice(5)].filter(Boolean);
  return groups.join(' ');
};

export default function StudentBioDataPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    fullName: '',
    gender: '',
    dob: '',
    studentMobileNo: '',
    studentEmail: '',
    aadharNumber: '',
    bloodGroup: '',
    motherTongue: '',
    nationality: 'Indian',
    religion: '',
    community: '',
    casteName: '',
    address: '',
    pincode: '',
    fatherName: '',
    fatherOccupation: '',
    fatherAnnualIncome: '',
    fatherMobileNo: '',
    motherName: '',
    motherOccupation: '',
    motherAnnualIncome: '',
    motherMobileNo: '',
    quota: 'Management',
    dateOfAdmission: '',
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
        dob: profile.dob || '',
        studentMobileNo: profile.studentMobileNo || '',
        studentEmail: profile.studentEmail || '',
        aadharNumber: profile.aadharNumber || '',
        bloodGroup: profile.bloodGroup || '',
        motherTongue: profile.motherTongue || '',
        nationality: profile.nationality || 'Indian',
        religion: profile.religion || '',
        community: profile.community || '',
        casteName: profile.casteName || '',
        address: profile.address || '',
        pincode: profile.pincode || '',
        fatherName: profile.fatherName || '',
        fatherOccupation: profile.fatherOccupation || '',
        fatherAnnualIncome: profile.fatherAnnualIncome || '',
        fatherMobileNo: profile.fatherMobileNo || '',
        motherName: profile.motherName || '',
        motherOccupation: profile.motherOccupation || '',
        motherAnnualIncome: profile.motherAnnualIncome || '',
        motherMobileNo: profile.motherMobileNo || '',
        quota: profile.quota || 'Management',
        dateOfAdmission: profile.dateOfAdmission || '',
      });
    }
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileRef || !user?.uid) return;

    const dataToSave = {
      ...formData,
      userId: user.uid,
      updatedAt: new Date().toISOString(),
    };

    // Auto-generate date of admission if it's the first time
    if (!profile?.dateOfAdmission) {
      dataToSave.dateOfAdmission = new Date().toISOString();
    }

    setDocumentNonBlocking(profileRef, dataToSave, { merge: true });

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
    <div className="container mx-auto py-12 px-4 max-w-5xl">
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
            <div className="flex-1">
              <p className="text-sm font-bold">Profile Locked</p>
              <p className="text-xs text-muted-foreground font-body">
                This record is finalized. Admission Date: {formData.dateOfAdmission ? new Date(formData.dateOfAdmission).toLocaleDateString() : 'Pending'}.
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

      <form onSubmit={handleSubmit} className="space-y-8 pb-12">
        {/* Personal Details */}
        <Card className="border-none shadow-sm bg-card rounded-[2rem] overflow-hidden">
          <CardHeader className="bg-muted/30 border-b">
            <CardTitle className="text-lg font-headline">Student Identity</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Full Legal Name (as per Birth Certificate)</Label>
              <Input 
                value={formData.fullName} 
                onChange={(e) => setFormData({...formData, fullName: e.target.value})} 
                disabled={isReadOnly}
                className="bg-muted border-none h-12 rounded-xl"
                placeholder="Full Name"
                required 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Date of Birth</Label>
              <Input 
                type="date"
                value={formData.dob} 
                onChange={(e) => setFormData({...formData, dob: e.target.value})} 
                disabled={isReadOnly}
                className="bg-muted border-none h-12 rounded-xl"
                required 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Gender</Label>
              <Select onValueChange={(v) => setFormData({...formData, gender: v})} value={formData.gender} disabled={isReadOnly}>
                <SelectTrigger className="bg-muted border-none h-12 rounded-xl"><SelectValue placeholder="Gender" /></SelectTrigger>
                <SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Mobile Number</Label>
              <Input 
                value={formData.studentMobileNo} 
                onChange={(e) => setFormData({...formData, studentMobileNo: formatPhone(e.target.value)})} 
                disabled={isReadOnly}
                className="bg-muted border-none h-12 rounded-xl"
                placeholder="xxxxx xxxxx"
                required 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Email ID</Label>
              <Input 
                type="email"
                value={formData.studentEmail} 
                onChange={(e) => setFormData({...formData, studentEmail: e.target.value})} 
                disabled={isReadOnly}
                className="bg-muted border-none h-12 rounded-xl"
                placeholder="email@example.com"
                required 
              />
            </div>
          </CardContent>
        </Card>

        {/* Identification & Social */}
        <Card className="border-none shadow-sm bg-card rounded-[2rem] overflow-hidden">
          <CardHeader className="bg-muted/30 border-b">
            <CardTitle className="text-lg font-headline">Identification & Community</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-2 space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Aadhar Number</Label>
              <Input 
                value={formData.aadharNumber} 
                onChange={(e) => setFormData({...formData, aadharNumber: formatAadhar(e.target.value)})} 
                disabled={isReadOnly}
                className="bg-muted border-none h-12 rounded-xl font-mono"
                placeholder="xxxx xxxx xxxx"
                required 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Blood Group</Label>
              <Input value={formData.bloodGroup} onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})} disabled={isReadOnly} className="bg-muted border-none h-12 rounded-xl" placeholder="e.g. O+" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Mother Tongue</Label>
              <Input value={formData.motherTongue} onChange={(e) => setFormData({...formData, motherTongue: e.target.value})} disabled={isReadOnly} className="bg-muted border-none h-12 rounded-xl" placeholder="Language" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Nationality</Label>
              <Input value="Indian" readOnly className="bg-muted border-none h-12 rounded-xl opacity-60" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Religion</Label>
              <Input value={formData.religion} onChange={(e) => setFormData({...formData, religion: e.target.value})} disabled={isReadOnly} className="bg-muted border-none h-12 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Community</Label>
              <Select onValueChange={(v) => setFormData({...formData, community: v})} value={formData.community} disabled={isReadOnly}>
                <SelectTrigger className="bg-muted border-none h-12 rounded-xl"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {['BC (muslim)', 'OC', 'BC', 'MBC', 'SC', 'SCC', 'ST'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Name of the Caste</Label>
              <Input value={formData.casteName} onChange={(e) => setFormData({...formData, casteName: e.target.value})} disabled={isReadOnly} className="bg-muted border-none h-12 rounded-xl" />
            </div>
          </CardContent>
        </Card>

        {/* Address */}
        <Card className="border-none shadow-sm bg-card rounded-[2rem] overflow-hidden">
          <CardHeader className="bg-muted/30 border-b">
            <CardTitle className="text-lg font-headline">Residential Details</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-3 space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Full Address</Label>
              <Input value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} disabled={isReadOnly} className="bg-muted border-none h-12 rounded-xl" required />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Pincode</Label>
              <Input value={formData.pincode} onChange={(e) => setFormData({...formData, pincode: e.target.value})} disabled={isReadOnly} className="bg-muted border-none h-12 rounded-xl" required />
            </div>
          </CardContent>
        </Card>

        {/* Guardian Background */}
        <Card className="border-none shadow-sm bg-card rounded-[2rem] overflow-hidden">
          <CardHeader className="bg-muted/30 border-b">
            <CardTitle className="text-lg font-headline">Guardian Background</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-primary">Father's Name</Label>
                <Input value={formData.fatherName} onChange={(e) => setFormData({...formData, fatherName: e.target.value})} disabled={isReadOnly} className="bg-muted border-none h-12 rounded-xl" required />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-primary">Occupation</Label>
                <Select onValueChange={(v) => setFormData({...formData, fatherOccupation: v})} value={formData.fatherOccupation} disabled={isReadOnly}>
                  <SelectTrigger className="bg-muted border-none h-12 rounded-xl"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent><SelectItem value="Govt Services">Govt Services</SelectItem><SelectItem value="Private Services">Private Services</SelectItem><SelectItem value="Business">Business</SelectItem><SelectItem value="Self Employed">Self Employed</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-primary">Annual Income</Label>
                <Input value={formData.fatherAnnualIncome} onChange={(e) => setFormData({...formData, fatherAnnualIncome: e.target.value})} disabled={isReadOnly} className="bg-muted border-none h-12 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-primary">Mobile Number</Label>
                <Input value={formData.fatherMobileNo} onChange={(e) => setFormData({...formData, fatherMobileNo: formatPhone(e.target.value)})} disabled={isReadOnly} className="bg-muted border-none h-12 rounded-xl" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-primary">Mother's Name</Label>
                <Input value={formData.motherName} onChange={(e) => setFormData({...formData, motherName: e.target.value})} disabled={isReadOnly} className="bg-muted border-none h-12 rounded-xl" required />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-primary">Occupation</Label>
                <Select onValueChange={(v) => setFormData({...formData, motherOccupation: v})} value={formData.motherOccupation} disabled={isReadOnly}>
                  <SelectTrigger className="bg-muted border-none h-12 rounded-xl"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent><SelectItem value="Govt Services">Govt Services</SelectItem><SelectItem value="Private Services">Private Services</SelectItem><SelectItem value="Homemaker">Homemaker</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-primary">Annual Income</Label>
                <Input value={formData.motherAnnualIncome} onChange={(e) => setFormData({...formData, motherAnnualIncome: e.target.value})} disabled={isReadOnly} className="bg-muted border-none h-12 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-primary">Mobile Number</Label>
                <Input value={formData.motherMobileNo} onChange={(e) => setFormData({...formData, motherMobileNo: formatPhone(e.target.value)})} disabled={isReadOnly} className="bg-muted border-none h-12 rounded-xl" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-dashed">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Admission Quota</Label>
                <Select onValueChange={(v) => setFormData({...formData, quota: v})} value={formData.quota} disabled={isReadOnly}>
                  <SelectTrigger className="bg-muted border-none h-12 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Government">Government Quota</SelectItem><SelectItem value="Management">Management Quota</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {!isReadOnly && (
          <Button type="submit" className="w-full h-14 text-lg font-headline font-bold shadow-lg shadow-primary/20 rounded-2xl uppercase tracking-tight">
            <Save className="mr-2 h-5 w-5" /> Finalize & Submit Bio Data
          </Button>
        )}
      </form>
    </div>
  );
}
