
'use client';

import { useDoc, useMemoFirebase, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { Loader2, Briefcase, GraduationCap, Award, BookOpen, ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const collegeId = 'study-connect-college';

export function FacultyBioHover({ faculty, children }: { faculty: any, children: React.ReactNode }) {
  const firestore = useFirestore();
  
  // Faculty ID is usually their email
  const bioRef = useMemoFirebase(() => 
    firestore && faculty?.email ? doc(firestore, 'colleges', collegeId, 'facultyProfiles', faculty.email.toLowerCase()) : null
  , [firestore, faculty?.email]);
  
  const { data: bio, isLoading } = useDoc(bioRef);

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="cursor-help">
            {children}
          </div>
        </TooltipTrigger>
        <TooltipContent 
          className="w-[22rem] p-0 rounded-[1.5rem] overflow-hidden border-none shadow-2xl bg-card" 
          side="right" 
          sideOffset={10}
        >
          <div className="h-1.5 w-full bg-emerald-500" />
          <div className="p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-foreground leading-tight">
                  {bio?.fullName || `Dr. ${faculty.firstName} ${faculty.lastName}`}
                </h4>
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                  {bio?.designation || faculty.designation || 'Faculty Member'}
                </p>
              </div>
              <Badge variant="outline" className="text-[8px] uppercase border-emerald-500/20 text-emerald-600">
                Staff ID: {bio?.employeeId?.split('-').pop() || '...'}
              </Badge>
            </div>

            {isLoading ? (
              <div className="py-6 flex flex-col items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <p className="text-[9px] font-bold uppercase tracking-tighter text-muted-foreground">Syncing staff records...</p>
              </div>
            ) : bio ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-dashed">
                  <div className="space-y-0.5">
                    <p className="text-[8px] font-bold uppercase text-muted-foreground flex items-center gap-1">
                      <GraduationCap className="h-2.5 w-2.5" /> Qualifications
                    </p>
                    <p className="text-[10px] font-medium text-foreground truncate">{bio.pgDegree || bio.ugDegree || 'N/A'}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[8px] font-bold uppercase text-muted-foreground flex items-center gap-1">
                      <Briefcase className="h-2.5 w-2.5" /> Experience
                    </p>
                    <p className="text-[10px] font-medium text-foreground">{bio.yearsOfExperience || 0} Years Active</p>
                  </div>
                  <div className="col-span-2 space-y-0.5">
                    <p className="text-[8px] font-bold uppercase text-muted-foreground flex items-center gap-1">
                      <BookOpen className="h-2.5 w-2.5" /> Specialization
                    </p>
                    <p className="text-[10px] font-medium text-foreground truncate">{bio.specialization || 'General Academics'}</p>
                  </div>
                </div>

                {bio.areasOfInterest && (
                  <div className="p-3 bg-muted/40 rounded-xl space-y-1">
                    <p className="text-[8px] font-bold uppercase text-muted-foreground flex items-center gap-1">
                      <Award className="h-2.5 w-2.5 text-amber-500" /> Research Interests
                    </p>
                    <p className="text-[10px] font-medium text-foreground line-clamp-2 italic leading-relaxed">
                      "{bio.areasOfInterest}"
                    </p>
                  </div>
                )}

                <div className="pt-2 flex flex-col gap-1 border-t border-dashed">
                   <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
                     <Mail className="h-2.5 w-2.5" /> {bio.email}
                   </div>
                   <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
                     <Phone className="h-2.5 w-2.5" /> {bio.mobileNumber || 'No Direct Contact'}
                   </div>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center text-[10px] italic text-muted-foreground bg-muted/30 rounded-xl">
                Detailed professional bio not found.
              </div>
            )}
            
            <div className="pt-3 border-t flex justify-between items-center">
               <span className="text-[9px] font-bold uppercase text-emerald-600 flex items-center gap-1">
                 <ShieldCheck className="h-2.5 w-2.5" /> Verified Staff Node
               </span>
               <Badge className="bg-emerald-50 text-emerald-700 border-none font-bold text-[8px] px-2 h-5">
                 {bio?.employmentType || 'Permanent'}
               </Badge>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
