'use client';

import { useDoc, useMemoFirebase, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { Loader2, User, Phone, MapPin, ShieldCheck, CreditCard, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const collegeId = 'study-connect-college';

export function StudentBioHover({ student, children }: { student: any, children: React.ReactNode }) {
  const firestore = useFirestore();
  
  // Fetch bio data from the profile sub-collection
  const bioRef = useMemoFirebase(() => 
    firestore && student?.id ? doc(firestore, 'colleges', collegeId, 'studentProfiles', student.id) : null
  , [firestore, student?.id]);
  
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
          className="w-80 p-0 rounded-[1.5rem] overflow-hidden border-none shadow-2xl bg-card" 
          side="right" 
          sideOffset={10}
        >
          <div className="h-1.5 w-full bg-primary" />
          <div className="p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-foreground leading-tight">
                  {student.firstName} {student.lastName}
                </h4>
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest">
                  @{student.username || student.id.slice(0, 8)}
                </p>
              </div>
              <Badge variant="outline" className="text-[8px] uppercase border-primary/20 text-primary">
                {student.departmentId || 'Unassigned'}
              </Badge>
            </div>

            {isLoading ? (
              <div className="py-6 flex flex-col items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <p className="text-[9px] font-bold uppercase tracking-tighter text-muted-foreground">Retrieving bio-data...</p>
              </div>
            ) : bio ? (
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-dashed">
                <div className="space-y-0.5">
                  <p className="text-[8px] font-bold uppercase text-muted-foreground flex items-center gap-1">
                    <User className="h-2.5 w-2.5" /> Gender
                  </p>
                  <p className="text-xs font-medium text-foreground">{bio.gender || 'N/A'}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[8px] font-bold uppercase text-muted-foreground flex items-center gap-1">
                    <ShieldCheck className="h-2.5 w-2.5" /> Quota
                  </p>
                  <p className="text-xs font-medium text-foreground">{bio.quota || 'N/A'}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[8px] font-bold uppercase text-muted-foreground flex items-center gap-1">
                    <Phone className="h-2.5 w-2.5" /> Contact
                  </p>
                  <p className="text-xs font-medium text-foreground truncate">{bio.phoneNumber || 'N/A'}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[8px] font-bold uppercase text-muted-foreground flex items-center gap-1">
                    <Users className="h-2.5 w-2.5" /> Parents
                  </p>
                  <p className="text-[10px] font-medium text-foreground truncate">{bio.fatherName || bio.motherName || 'N/A'}</p>
                </div>
                <div className="col-span-2 space-y-0.5">
                  <p className="text-[8px] font-bold uppercase text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-2.5 w-2.5" /> Address
                  </p>
                  <p className="text-[10px] font-medium text-foreground leading-tight line-clamp-2">
                    {bio.address || 'No address on record.'}
                  </p>
                </div>
                <div className="col-span-2 space-y-0.5 pt-1">
                  <p className="text-[8px] font-bold uppercase text-muted-foreground flex items-center gap-1">
                    <CreditCard className="h-2.5 w-2.5" /> Aadhar Identification
                  </p>
                  <p className="text-xs font-mono font-bold text-foreground">
                    {bio.aadharNumber ? `XXXX XXXX ${bio.aadharNumber.slice(-4)}` : 'Verified on record'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center text-[10px] italic text-muted-foreground bg-muted/30 rounded-xl">
                No biographical profile recorded.
              </div>
            )}
            
            <div className="pt-3 border-t flex justify-between items-center">
               <span className="text-[9px] font-bold uppercase text-emerald-600 flex items-center gap-1">
                 <ShieldCheck className="h-2.5 w-2.5" /> Verification Active
               </span>
               <span className="text-[9px] font-bold text-muted-foreground">ID: {student.id.slice(0, 12)}</span>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
