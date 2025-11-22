import { Navigation } from "@/components/Navigation";
import { GoldButton } from "@/components/GoldButton";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, MessageSquare, Send, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SAMPLE_CONVERSATIONS = [
  {
    question: "How does the Section 45X tax credit work?",
    answer: "Section 45X provides advanced manufacturing production credits for domestically-produced clean energy components. For solar panels, credits stack across the supply chain: $4.50/kg for polysilicon, $12/m² for wafers, $20/m² for cells, and $35/m² for modules. When vertically integrated like Project Tavakiev, this totals ~$60/panel in tax credits, making US production cost-competitive with China."
  },
  {
    question: "What's the investment minimum for Tabeguache Collection?",
    answer: "The Tabeguache Collection offers multiple investment structures. Direct equity positions start at $500K. Debt instruments (senior secured notes) have $100K minimums. For qualified accredited investors, we also offer a $1M opportunity zone fund with additional tax benefits. All structures provide quarterly distributions and 5-7 year exit horizons."
  },
  {
    question: "How do you ensure autonomous truck safety?",
    answer: "Golden Spike's autonomous trucks use redundant sensor arrays: LiDAR, radar, cameras, and V2X communication. The I-25 corridor has dedicated lanes with smart infrastructure. Each truck has 3 independent braking systems and can operate in degraded modes. We maintain a 99.97% safety record over 2M test miles, exceeding human driver statistics by 40x."
  }
];

export default function InnovationStoryEngineering() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hello! I'm DATA, Physical.Capital's AI investment advisor. Ask me anything about our projects, tax credit optimization, or investment structures." }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response with typewriter effect
    setTimeout(() => {
      const sampleResponse = SAMPLE_CONVERSATIONS.find(c =>
        input.toLowerCase().includes(c.question.toLowerCase().split(' ').slice(0, 3).join(' '))
      );

      const response = sampleResponse?.answer ||
        "That's an interesting question! Our investment team would be happy to provide detailed information. Let me connect you with a specialist who can dive deeper into this topic.";

      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSampleQuestion = (question: string) => {
    setInput(question);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Link href="/">
          <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">DATA AI Investment Advisor</h1>
          <p className="text-xl text-muted-foreground">Story Engineering through Conversational Intelligence</p>
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge variant="secondary">GPT-4 Powered</Badge>
            <Badge variant="secondary">Real-Time Analysis</Badge>
            <Badge variant="secondary">Investor-Focused</Badge>
          </div>
        </div>

        {/* Chatbot Interface */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border">
            <MessageSquare className="w-6 h-6 text-primary" />
            <div>
              <h2 className="text-xl font-semibold">DATA AI Chat</h2>
              <p className="text-xs text-muted-foreground">Ask about any of our projects or innovations</p>
            </div>
          </div>

          {/* Chat messages */}
          <div className="h-96 overflow-y-auto mb-4 space-y-4 px-2">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-2 text-xs font-semibold">
                      <Sparkles className="w-3 h-3" />
                      DATA AI
                    </div>
                  )}
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-foreground rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about projects, tax credits, investments..."
              className="flex-1"
              data-testid="chat-input"
            />
            <GoldButton onClick={handleSend} size="sm" icon="none" data-testid="send-message">
              <Send className="w-4 h-4" />
            </GoldButton>
          </div>
        </Card>

        {/* Sample questions */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Try These Questions:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {SAMPLE_CONVERSATIONS.map((conv, idx) => (
              <button
                key={idx}
                onClick={() => handleSampleQuestion(conv.question)}
                className="text-left p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all"
                data-testid={`sample-question-${idx}`}
              >
                <div className="text-sm font-medium text-foreground">{conv.question}</div>
              </button>
            ))}
            <button
              onClick={() => handleSampleQuestion("What makes Venustas Tower structurally feasible?")}
              className="text-left p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all"
            >
              <div className="text-sm font-medium text-foreground">What makes Venustas Tower structurally feasible?</div>
            </button>
            <button
              onClick={() => handleSampleQuestion("How does Yádiłhił's life support system work?")}
              className="text-left p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all"
            >
              <div className="text-sm font-medium text-foreground">How does Yádiłhił's life support system work?</div>
            </button>
          </div>
        </Card>

        {/* Capabilities */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card className="p-6">
            <Sparkles className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-semibold mb-2">Real-Time Analysis</h3>
            <p className="text-sm text-muted-foreground">
              Instant access to project financials, technical specs, and market comparisons.
            </p>
          </Card>

          <Card className="p-6">
            <MessageSquare className="w-8 h-8 text-accent mb-3" />
            <h3 className="font-semibold mb-2">Natural Language</h3>
            <p className="text-sm text-muted-foreground">
              Ask questions in plain English. DATA understands context and provides detailed answers.
            </p>
          </Card>

          <Card className="p-6">
            <Send className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-semibold mb-2">Investor-Focused</h3>
            <p className="text-sm text-muted-foreground">
              Trained on investor questions, due diligence frameworks, and financial structures.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
