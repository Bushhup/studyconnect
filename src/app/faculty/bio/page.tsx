'use client';

import { useState, useEffect } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  UserCircle, Briefcase, GraduationCap, Award, 
  BookOpen, FileText, Save, Loader2, Globe, ShieldCheck,
  Building2, Mail, Phone, MapPin, Linkedin, Link as LinkIcon
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const collegeId = 'study-connect-college';

export default function FacultyBioPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [formData, setFormData] = useState<any>({
    fullName: '',
    dob: '',
    gender: '',
    mobileNumber: '',
    email: '',
    address: '',
    pincode: '',
    nationality: 'Indian',
    aadharNumber: '',
    bloodGroup: '',
    fatherName: '',
    motherName: '',
    emergencyContact: '',
    ugDegree: '',
    pgDegree: '',
    phd: 'No',
    phdSpecialization: '',
    specialization: '',
    certifications: '',
    yearOfPassing: '',
    university: '',
    designation: 'Assistant Professor',
    employmentType: 'Permanent',
    yearsOfExperience: 0,
    linkedin: '',
    googleScholar: '',
    areasOfInterest: '',
    awards: ''
  });

  const profileRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'colleges', collegeId, 'facultyProfiles', user.uid);
  }, [firestore, user?.uid]);

  const { data: profile, isLoading } = useDoc(profileRef);

  useEffect(() => {
    if (profile) {
      setFormData({ ...profile });
    } else if (user) {
      setFormData((prev: any) => ({ ...prev, email: user.email }));
    }
  }, [profile, user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileRef || !user?.uid) return;

    const dataToSave = {
      ...formData,
      userId: user.uid,
      updatedAt: new Date().toISOString()
    };

    if (!profile?.dateOfJoining) {
      dataToSave.dateOfJoining = new Date().toISOString();
      dataToSave.employeeId = `FAC-${user.uid.slice(0, 4).toUpperCase()}`;
    }

    setDocumentNonBlocking(profileRef, dataToSave, { merge: true });

    toast({
      title: 'Professional Record Updated',
      description: 'Your faculty profile has been synchronized with the institutional directory.',
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4">
        <Loader2 className="animate-spin h-10 w-10 text-primary" />
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Accessing Staff Records...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4 max-w-6xl">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-headline font-bold text-foreground tracking-tight flex items-center gap-3">
            <UserCircle className="text-primary h-8 w-8" /> Professional Profile
          </h1>
          <p className="text-muted-foreground mt-1 font-body">Manage your academic credentials, professional history, and research profile.</p>
        </div>
        <Button onClick={handleSubmit} className="rounded-full shadow-lg shadow-primary/20 h-12 px-8 font-bold gap-2">
          <Save className="h-4 w-4" /> Save All Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
           <Card className="border-none shadow-sm bg-card rounded-[2rem] overflow-hidden">
             <div className="h-2 w-full bg-primary" />
             <CardHeader className="text-center">
                <div className="mx-auto w-24 h-24 rounded-full bg-primary/5 flex items-center justify-center border-4 border-white shadow-xl">
                  <UserCircle className="h-12 w-12 text-primary/40" />
                </div>
                <CardTitle className="mt-4 text-xl">{formData.fullName || 'Faculty Member'}</CardTitle>
                <CardDescription className="text-xs font-bold uppercase tracking-widest text-primary">{formData.designation}</CardDescription>
             </CardHeader>
             <CardContent className="space-y-4 pt-0">
               <div className="p-3 bg-muted rounded-2xl space-y-1">
                 <p className="text-[10px] font-bold text-muted-foreground uppercase">Employee ID</p>
                 <p className="text-sm font-mono font-bold text-foreground">{formData.employeeId || 'TBD'}</p>
               </div>
               <div className="space-y-2 pt-2">
                 <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                   <Building2 className="h-3.5 w-3.5" /> Department Lead
                 </div>
                 <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                   <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Verified Staff
                 </div>
               </div>
             </CardContent>
           </Card>

           <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Social Links</p>
              <Input 
                placeholder="LinkedIn Profile URL" 
                value={formData.linkedin} 
                onChange={(e) => setFormData({...formData, linkedin: e.target.value})} 
                className="bg-card border-none h-11 rounded-xl shadow-sm text-xs"
              />
              <Input 
                placeholder="Google Scholar URL" 
                value={formData.googleScholar} 
                onChange={(e) => setFormData({...formData, googleScholar: e.target.value})} 
                className="bg-card border-none h-11 rounded-xl shadow-sm text-xs"
              />
           </div>
        </div>

        <div className="lg:col-span-3">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="bg-card border h-14 p-1.5 rounded-2xl mb-8 flex justify-start overflow-x-auto w-full md:w-fit">
              <TabsTrigger value="basic" className="gap-2 px-6 rounded-xl font-bold uppercase text-[10px]">
                <FileText className="h-3.5 w-3.5" /> Basic Identity
              </TabsTrigger>
              <TabsTrigger value="education" className="gap-2 px-6 rounded-xl font-bold uppercase text-[10px]">
                <GraduationCap className="h-3.5 w-3.5" /> Qualifications
              </TabsTrigger>
              <TabsTrigger value="professional" className="gap-2 px-6 rounded-xl font-bold uppercase text-[10px]">
                <Briefcase className="h-3.5 w-3.5" /> Career Details
              </TabsTrigger>
              <TabsTrigger value="research" className="gap-2 px-6 rounded-xl font-bold uppercase text-[10px]">
                <Award className="h-3.5 w-3.5" /> Research & Interests
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6">
              <Card className="border-none shadow-sm rounded-[2rem] bg-card overflow-hidden">
                <CardHeader><CardTitle className="text-lg">Personal Information</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-0">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase">Full Name</Label>
                    <Input value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} className="bg-muted border-none h-12" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase">DOB</Label>
                      <Input type="date" value={formData.dob} onChange={(e) => setFormData({...formData, dob: e.target.value})} className="bg-muted border-none h-12" required />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase">Gender</Label>
                      <Select onValueChange={(v) => setFormData({...formData, gender: v})} value={formData.gender}>
                        <SelectTrigger className="bg-muted border-none h-12"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase">Mobile Number (xxxxx xxxxx)</Label>
                    <Input value={formData.mobileNumber} onChange={(e) => setFormData({...formData, mobileNumber: e.target.value})} className="bg-muted border-none h-12" required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase">Aadhar Number (xxxx xxxx xxxx)</Label>
                    <Input value={formData.aadharNumber} onChange={(e) => setFormData({...formData, aadharNumber: e.target.value})} className="bg-muted border-none h-12 font-mono" required />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-[10px] font-bold uppercase">Permanent Address</Label>
                    <Textarea value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="bg-muted border-none min-h-[80px]" required />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm rounded-[2rem] bg-card overflow-hidden">
                <CardHeader><CardTitle className="text-lg">Family & Emergency</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-0">
                   <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase">Father's Name</Label>
                    <Input value={formData.fatherName} onChange={(e) => setFormData({...formData, fatherName: e.target.value})} className="bg-muted border-none h-12" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase">Mother's Name</Label>
                    <Input value={formData.motherName} onChange={(e) => setFormData({...formData, motherName: e.target.value})} className="bg-muted border-none h-12" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-primary">Emergency Contact</Label>
                    <Input value={formData.emergencyContact} onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})} className="bg-muted border-none h-12 font-bold" />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="education" className="space-y-6">
              <Card className="border-none shadow-sm rounded-[2rem] bg-card overflow-hidden">
                <CardHeader><CardTitle className="text-lg">Academic Qualifications</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-0">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase">UG Degree</Label>
                    <Input value={formData.ugDegree} onChange={(e) => setFormData({...formData, ugDegree: e.target.value})} placeholder="e.g. B.Tech Computer Science" className="bg-muted border-none h-12" required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase">PG Degree</Label>
                    <Input value={formData.pgDegree} onChange={(e) => setFormData({...formData, pgDegree: e.target.value})} placeholder="e.g. M.Tech Artificial Intelligence" className="bg-muted border-none h-12" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase">PhD Holder?</Label>
                      <Select onValueChange={(v) => setFormData({...formData, phd: v})} value={formData.phd}>
                        <SelectTrigger className="bg-muted border-none h-12"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase">PhD Spec.</Label>
                      <Input value={formData.phdSpecialization} onChange={(e) => setFormData({...formData, phdSpecialization: e.target.value})} disabled={formData.phd === 'No'} className="bg-muted border-none h-12" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase">Institutional Year of Passing</Label>
                    <Input value={formData.yearOfPassing} onChange={(e) => setFormData({...formData, yearOfPassing: e.target.value})} className="bg-muted border-none h-12" />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label className="text-[10px] font-bold uppercase">Other Certifications (NET, SET, GATE)</Label>
                    <Input value={formData.certifications} onChange={(e) => setFormData({...formData, certifications: e.target.value})} className="bg-muted border-none h-12" />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="professional" className="space-y-6">
              <Card className="border-none shadow-sm rounded-[2rem] bg-card overflow-hidden">
                <CardHeader><CardTitle className="text-lg">Employment Identity</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-0">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase">Designation</Label>
                    <Select onValueChange={(v) => setFormData({...formData, designation: v})} value={formData.designation}>
                      <SelectTrigger className="bg-muted border-none h-12"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Assistant Professor">Assistant Professor</SelectItem>
                        <SelectItem value="Associate Professor">Associate Professor</SelectItem>
                        <SelectItem value="Professor">Professor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase">Employment Type</Label>
                    <Select onValueChange={(v) => setFormData({...formData, employmentType: v})} value={formData.employmentType}>
                      <SelectTrigger className="bg-muted border-none h-12"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Permanent">Permanent</SelectItem>
                        <SelectItem value="Contract">Contract</SelectItem>
                        <SelectItem value="Guest">Guest</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase">Overall Teaching Experience (Years)</Label>
                    <Input type="number" value={formData.yearsOfExperience} onChange={(e) => setFormData({...formData, yearsOfExperience: parseInt(e.target.value)})} className="bg-muted border-none h-12" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase">Primary Domain Specialization</Label>
                    <Input value={formData.specialization} onChange={(e) => setFormData({...formData, specialization: e.target.value})} className="bg-muted border-none h-12" placeholder="e.g. Distributed Systems" />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="research" className="space-y-6">
              <Card className="border-none shadow-sm rounded-[2rem] bg-card overflow-hidden">
                <CardHeader><CardTitle className="text-lg">Research & Scholarly Work</CardTitle></CardHeader>
                <CardContent className="space-y-6 pt-0">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-primary/5 rounded-2xl text-center space-y-1">
                      <p className="text-2xl font-bold text-primary">{formData.publicationsCount || 0}</p>
                      <p className="text-[9px] font-bold uppercase text-muted-foreground tracking-widest">Global Publications</p>
                    </div>
                    <div className="p-4 bg-emerald-50 rounded-2xl text-center space-y-1">
                      <p className="text-2xl font-bold text-emerald-600">{formData.feedbackRating || '4.8'}</p>
                      <p className="text-[9px] font-bold uppercase text-muted-foreground tracking-widest">Student Rating</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase">Areas of Academic Interest</Label>
                    <Textarea 
                      value={formData.areasOfInterest} 
                      onChange={(e) => setFormData({...formData, areasOfInterest: e.target.value})} 
                      placeholder="e.g. Machine Learning, NLP, Quantum Cryptography" 
                      className="bg-muted border-none min-h-[100px]" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase">Awards & Institutional Achievements</Label>
                    <Textarea 
                      value={formData.awards} 
                      onChange={(e) => setFormData({...formData, awards: e.target.value})} 
                      className="bg-muted border-none min-h-[100px]" 
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}