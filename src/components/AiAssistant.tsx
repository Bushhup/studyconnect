'use client';

import { useState } from 'react';
import { useUser, useDoc, useMemoFirebase, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { askAcademicAssistant } from '@/ai/flows/academic-assistant';
import { 
  Sparkles, 
  X, 
  Send, 
  Loader2, 
  MessageSquare,
  Bot,
  User as UserIcon,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const collegeId = 'study-connect-college';

export function AiAssistant() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant', text: string, actions?: string[] }>>([
    { role: 'assistant', text: "Welcome to StudyConnect AI. How can I assist you with your academic journey today?" }
  ]);

  const profileRef = useMemoFirebase(() => {
    if (!firestore || !user?.email) return null;
    return doc(firestore, 'colleges', collegeId, 'users', user.email.toLowerCase());
  }, [firestore, user?.email]);
  const { data: profile } = useDoc(profileRef);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim() || isLoading) return;

    const userText = query.trim();
    setQuery('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsLoading(true);

    try {
      const response = await askAcademicAssistant({
        query: userText,
        userRole: (profile?.role as any) || 'student',
        userName: profile?.firstName || 'User'
      });

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        text: response.message,
        actions: response.suggestedActions 
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', text: "I'm having trouble connecting to the institutional brain. Please try again in a moment." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-[100]">
        <Button 
          onClick={() => setIsOpen(true)}
          className={cn(
            "h-14 w-14 rounded-full shadow-2xl shadow-primary/40 p-0 transition-all duration-500",
            isOpen ? "scale-0 rotate-90" : "scale-100 rotate-0"
          )}
        >
          <Sparkles className="h-6 w-6 animate-pulse" />
        </Button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-6 right-6 z-[110] w-[90vw] sm:w-[400px] h-[600px] max-h-[80vh]"
          >
            <Card className="h-full flex flex-col border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] bg-card rounded-[2.5rem] overflow-hidden">
              <CardHeader className="bg-primary p-6 text-white flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <Bot className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-headline">Academic Assistant</CardTitle>
                    <p className="text-[10px] uppercase font-bold tracking-widest opacity-60">StudyConnect Intelligence</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-white hover:bg-white/10 rounded-full">
                  <X className="h-5 w-5" />
                </Button>
              </CardHeader>
              
              <CardContent className="flex-1 overflow-hidden p-0 relative">
                <ScrollArea className="h-full px-6 py-6">
                  <div className="space-y-6">
                    {messages.map((m, idx) => (
                      <div key={idx} className={cn("flex flex-col", m.role === 'user' ? "items-end" : "items-start")}>
                        <div className={cn(
                          "max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed",
                          m.role === 'user' 
                            ? "bg-primary text-white rounded-br-none" 
                            : "bg-muted text-foreground rounded-bl-none"
                        )}>
                          {m.text}
                        </div>
                        {m.actions && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {m.actions.map(action => (
                              <Button key={action} variant="outline" size="sm" className="h-8 rounded-full text-[10px] font-bold uppercase border-primary/20 text-primary hover:bg-primary/5">
                                {action}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex items-start gap-2">
                        <div className="p-3 bg-muted rounded-2xl rounded-bl-none">
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>

              <CardFooter className="p-6 bg-muted/30 border-t border-dashed">
                <form onSubmit={handleSend} className="flex gap-2 w-full">
                  <Input 
                    placeholder="Ask about subjects, grades..." 
                    className="h-12 bg-white border-none rounded-xl text-sm"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  <Button type="submit" size="icon" className="h-12 w-12 rounded-xl shrink-0" disabled={!query.trim() || isLoading}>
                    <Send className="h-5 w-5" />
                  </Button>
                </form>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
