import { useState, useRef } from 'react';
import { Crown, EyeOff, Eye, MessageCircle, Send, Shield, Zap, Terminal } from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CyberButton } from '../cyber-button/CyberButton';
import { CyberInput } from '../cyber-input/CyberInput';

export default function CyberBattleHeader({ 
  roomId, 
  currentProblem,
  problemStatements,
  selectedLanguage,
  languages,
  handleProblemChange,
  handleLanguageChange,
  showProblem,
  setShowProblem
}) {
  const [chatOpen, setChatOpen] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  const sendMessage = () => {
    if (newMessage.trim() === '') return;
    
    const newMsg = {
      text: newMessage,
      isFromYou: true,
      timestamp: new Date()
    };
    
    setMessages([...messages, newMsg]);
    setNewMessage('');
    
    // Scroll to bottom
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const formatMessageTime = (timestamp) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(timestamp);
  };

  return (
    <header className="border-b border-cyber-blue/30 bg-cyber-black py-2 px-4 relative overflow-hidden">
      {/* Animated scanline */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-px bg-cyber-blue/50 animate-scanline"></div>
      </div>
      
      {/* Background glow */}
      <div className="absolute -inset-2 bg-gradient-to-r from-cyber-blue/5 via-cyber-pink/5 to-cyber-blue/5 blur-xl"></div>
      
      <div className="flex flex-wrap items-center justify-between relative z-10 py-2">
        <div className="flex items-center space-x-4">
          <div className="cyber-border border-cyber-yellow p-1.5 rounded-sm">
            <Crown className="w-5 h-5 text-cyber-yellow animate-neon-pulse" />
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center">
            <h1 className="text-xl font-display font-bold text-cyber-blue cyber-text-shadow mr-2">
              CYBER<span className="text-cyber-pink">BATTLE</span>
            </h1>
            
            <div className="flex items-center">
              <Terminal className="w-4 h-4 text-cyber-green mr-1" />
              <span className="text-cyber-green font-cyber text-xs">
                ARENA~$ <span className="text-cyber-yellow blink">{roomId || 'CONNECTING...'}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 mt-2 sm:mt-0">
          <div className="flex items-center space-x-2">
            {/* Problem selection */}
            <div className="relative">
              <div className="absolute -inset-0.5 bg-cyber-blue/20 cyber-clip-corner -z-10"></div>
              <Select onValueChange={handleProblemChange} defaultValue={currentProblem.id}>
                <SelectTrigger className="w-[180px] bg-cyber-black border-cyber-blue/50 text-cyber-blue font-cyber text-sm">
                  <SelectValue placeholder="SELECT PROBLEM" />
                </SelectTrigger>
                <SelectContent className="bg-cyber-black border-cyber-blue text-cyber-blue">
                  {problemStatements.map(problem => (
                    <SelectItem key={problem.id} value={problem.id} className="font-cyber">
                      {problem.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Language selection */}
            <div className="relative">
              <div className="absolute -inset-0.5 bg-cyber-pink/20 cyber-clip-corner -z-10"></div>
              <Select onValueChange={handleLanguageChange} defaultValue={selectedLanguage.id.toString()}>
                <SelectTrigger className="w-[150px] bg-cyber-black border-cyber-pink/50 text-cyber-pink font-cyber text-sm">
                  <SelectValue placeholder="SELECT LANGUAGE" />
                </SelectTrigger>
                <SelectContent className="bg-cyber-black border-cyber-pink text-cyber-pink">
                  {languages.map(language => (
                    <SelectItem key={language.id} value={language.id.toString()} className="font-cyber">
                      {language.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <CyberButton
            variant={showProblem ? "destructive" : "outline"}
            size="sm"
            onClick={() => setShowProblem(!showProblem)}
            glitch="subtle"
            shape="clipped"
            className="ml-2"
          >
            {showProblem ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {showProblem ? "HIDE PROBLEM" : "SHOW PROBLEM"}
          </CyberButton>

          <Dialog open={chatOpen} onOpenChange={setChatOpen}>
            <DialogTrigger asChild>
              <CyberButton variant="ghost" size="icon" neon={true}>
                <MessageCircle className="h-5 w-5" />
              </CyberButton>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-cyber-black cyber-border border-cyber-blue p-0 shadow-cyber">
              <DialogHeader className="border-b border-cyber-blue/30 p-4">
                <DialogTitle className="font-display text-cyber-blue cyber-text-shadow text-center">
                  <div className="flex items-center justify-center">
                    <Shield className="w-4 h-4 mr-2 text-cyber-green" />
                    SECURE COMMS CHANNEL
                    <Zap className="w-4 h-4 ml-2 text-cyber-yellow" />
                  </div>
                </DialogTitle>
              </DialogHeader>
              <div className="flex flex-col h-[300px]">
                <ScrollArea className="flex-1 p-4">
                  {messages.length === 0 ? (
                    <div className="text-center text-cyber-blue/50 mt-10 font-cyber">
                      <Terminal className="w-8 h-8 mx-auto mb-2 text-cyber-blue/30" />
                      COMM-LINK ESTABLISHED. AWAITING INPUT...
                    </div>
                  ) : (
                    messages.map((msg, index) => (
                      <div
                        key={index}
                        className={`mb-3 ${msg.isFromYou ? 'text-right' : 'text-left'}`}
                      >
                        <div
                          className={`inline-block p-2 cyber-clip-corner ${msg.isFromYou
                            ? 'bg-cyber-blue/20 text-cyber-blue border border-cyber-blue/50'
                            : 'bg-cyber-pink/20 text-cyber-pink border border-cyber-pink/50'
                            } font-cyber text-sm`}
                        >
                          {msg.text}
                        </div>
                        <div className="text-xs text-slate-500 mt-1 font-cyber">
                          {formatMessageTime(msg.timestamp)}
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </ScrollArea>
                <div className="flex border-t border-cyber-blue/30 p-3 bg-cyber-black/80">
                  <CyberInput
                    variant="terminal"
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="ENTER MESSAGE..."
                    className="flex-1 mr-2 text-cyber-green"
                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                  />
                  <CyberButton onClick={sendMessage} size="icon" variant="primary" neon={true}>
                    <Send className="h-4 w-4" />
                  </CyberButton>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Bottom border with pulse effect */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-cyber-blue via-cyber-pink to-cyber-blue animate-neon-pulse"></div>
    </header>
  );
}