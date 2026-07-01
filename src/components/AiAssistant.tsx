'use client';

import { useState, useRef, useEffect } from 'react';
import { useUser, useDoc, useMemoFirebase, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { askAcademicAssistant } from '@/ai/flows/academic-assistant';
import { 
  Sparkles, 
  X, 
  Send, 
  Loader2, 
  Bot,
  RotateCcw,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

const collegeId = 'study-connect-college';

type Message = {
  role: 'user' | 'assistant';
  text: string;
  actions?: string[];
};

export function AiAssistant() {
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: "Welcome to StudyConnect AI. How can I assist you with your academic journey today?" }
  ]);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  const profileRef = useMemoFirebase(() => {
    if (!firestore || !user?.email) return null;
    return doc(firestore, 'colleges', collegeId, 'users', user.email.toLowerCase());
  }, [firestore, user?.email]);
  const { data: profile } = useDoc(profileRef);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      const scrollArea = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollArea) {
        scrollArea.scrollTop = scrollArea.scrollHeight;
      }
    }
  }, [messages, isLoading]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userText = text.trim();
    setQuery('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsLoading(true);

    try {
      // Map history to Genkit format
      const history = messages.map(m => ({
        role: m.role === 'user' ? 'user' as const : 'model' as const,
        content: [{ text: m.text }]
      }));

      const response = await askAcademicAssistant({
        query: userText,
        userRole: (profile?.role as any) || 'student',
        userName: profile?.firstName || 'User',
        history
      });

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        text: response.message,
        actions: response.suggestedActions 
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        text: "I encountered an error connecting to the institutional core. Please try again." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = (action: string) => {
    if (action.startsWith('nav:')) {
      const path = action.replace('nav:', '');
      router.push(path);
      setIsOpen(false);
    } else {
      handleSend(action);
    }
  };

  const clearChat = () => {
    setMessages([{ role: 'assistant', text: "Chat history cleared. How can I help you now?" }]);
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
            className="fixed bottom-6 right-6 z-[110] w-[90vw] sm:w-[420px] h-[650px] max-h-[85vh]"
          >
            <Card className="h-full flex flex-col border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] bg-card rounded-[2.5rem] overflow-hidden">
              <CardHeader className="bg-primary p-6 text-white flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                    <Bot className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-headline">Academic Assistant</CardTitle>
                    <p className="text-[9px] uppercase font-bold tracking-widest opacity-60">StudyConnect Intelligence</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={clearChat} className="text-white/60 hover:text-white hover:bg-white/10 rounded-full h-8 w-8">
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-white hover:bg-white/10 rounded-full h-8 w-8">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 overflow-hidden p-0 relative bg-muted/20">
                <ScrollArea className="h-full px-6 py-8" ref={scrollRef}>
                  <div className="space-y-8">
                    {messages.map((m, idx) => (
                      <div key={idx} className={cn("flex flex-col", m.role === 'user' ? "items-end" : "items-start")}>
                        <div className={cn(
                          "max-w-[90%] p-4 rounded-[1.5rem] text-sm leading-relaxed shadow-sm",
                          m.role === 'user' 
                            ? "bg-primary text-white rounded-br-none" 
                            : "bg-white text-foreground rounded-bl-none border border-border/50"
                        )}>
                          {m.text}
                        </div>
                        {m.actions && m.actions.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {m.actions.map(action => {
                              const isNav = action.startsWith('nav:');
                              const label = isNav ? action.replace('nav:', '').split('/').pop()?.replace(/-/g, ' ') : action;
                              return (
                                <Button 
                                  key={action} 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => handleAction(action)}
                                  className="h-8 rounded-full text-[10px] font-bold uppercase border-primary/10 bg-white text-primary hover:bg-primary hover:text-white transition-all shadow-sm gap-1.5"
                                >
                                  {isNav && <ExternalLink className="h-3 w-3" />}
                                  {label}
                                </Button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex items-start gap-2">
                        <div className="p-4 bg-white rounded-2xl rounded-bl-none shadow-sm border border-border/50">
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>

              <CardFooter className="p-6 bg-white border-t border-dashed">
                <form onSubmit={(e) => { e.preventDefault(); handleSend(query); }} className="flex gap-3 w-full">
                  <Input 
                    placeholder="Ask about subjects, grades, schedule..." 
                    className="h-12 bg-muted/50 border-none rounded-2xl text-sm px-6"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    disabled={isLoading}
                  />
                  <Button type="submit" size="icon" className="h-12 w-12 rounded-2xl shrink-0 shadow-lg shadow-primary/20" disabled={!query.trim() || isLoading}>
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
