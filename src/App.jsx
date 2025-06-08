import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Bot, User, Youtube, FileText, Film, MemoryStick, Loader2 } from 'lucide-react';

// Mock API functions to simulate backend processes
const mockApi = {
  fetchTranscript: async (url) => {
    console.log(`[MOCK API] Fetching transcript for: ${url}`);
    await new Promise(resolve => setTimeout(resolve, 1500));
    return `This is a mock transcript for the video at ${url}. It contains several key moments. One interesting part is about generative AI. Another key highlight discusses the future of web development. Finally, the conclusion summarizes the main points.`;
  },
  generateVideo: async (prompt, transcript) => {
    console.log(`[MOCK API] Generating video with prompt: "${prompt}"`);
    console.log(`[MOCK API] Using transcript: "${transcript.substring(0, 100)}..."`);
    await new Promise(resolve => setTimeout(resolve, 3000));
    return {
      // Replaced the fake URL with a real, working sample video URL
      downloadUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      clips: [
        "Clip 1: Discussing generative AI.",
        "Clip 2: The future of web development.",
        "Clip 3: A summary of the main points."
      ]
    };
  }
};


// Main Application Component
export default function App() {
  const [messages, setMessages] = useState([]);
  const [inputUrl, setInputUrl] = useState('');
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  useEffect(() => {
    // Initial bot message
    setMessages([
        { 
            sender: 'bot', 
            text: "Hello! I am the Content Clipper Agent. Please provide a YouTube URL and a prompt for the video you'd like me to create.",
            Component: ({text}) => <BotMessage text={text} />
        }
    ]);
  }, []);

  const addMessage = useCallback((sender, text, Component) => {
    setMessages(prev => [...prev, { sender, text, Component }]);
  }, []);
  
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputUrl || !inputPrompt || isLoading) return;

    setIsLoading(true);
    const userMessageText = `URL: ${inputUrl}\nPrompt: ${inputPrompt}`;
    addMessage('user', userMessageText, ({text}) => <UserMessage text={text} />);
    setInputUrl('');
    setInputPrompt('');

    // --- Agent Simulation Starts ---
    
    // 1. Acknowledge and start process
    setTimeout(() => {
        addMessage('bot', "Request received. Starting analysis...", ({text}) => <BotMessage text={text} icon={<Loader2 className="w-4 h-4 animate-spin" />} />);
    }, 500);

    // 2. Simulate Memory
    setTimeout(() => {
        addMessage('bot', "Accessing simple memory for context...", ({text}) => <BotMessage text={text} icon={<MemoryStick className="w-4 h-4 text-blue-400" />} />);
    }, 1500);

    // 3. Call for transcript
    setTimeout(() => {
        addMessage('bot', `Initiating transcript generation for ${inputUrl}... (POST /video-transcript)`, ({text}) => <BotMessage text={text} icon={<FileText className="w-4 h-4 text-purple-400"/>} />);
    }, 2500);

    try {
        const transcript = await mockApi.fetchTranscript(inputUrl);
        addMessage('bot', `Transcript received successfully.`, ({text}) => <BotMessage text={text} icon={<FileText className="w-4 h-4 text-green-400"/>} />);
        
        // 4. Call for video generation
        setTimeout(() => {
            addMessage('bot', "Sending request for video generation... (POST /video-generation)", ({text}) => <BotMessage text={text} icon={<Film className="w-4 h-4 text-teal-400"/>} />);
        }, 1000);

        const videoResult = await mockApi.generateVideo(inputPrompt, transcript);
        const resultMessage = `Video generation complete! \nClips created: \n- ${videoResult.clips.join('\n- ')}\n\nYour video is available at: ${videoResult.downloadUrl}`;
        addMessage('bot', resultMessage, ({text, url = videoResult.downloadUrl}) => <BotMessageWithLink text={text} url={url} icon={<Film className="w-4 h-4 text-green-400" />} />);

    } catch (error) {
        console.error("Agent process failed:", error);
        addMessage('bot', "An error occurred during the process. Please try again.", ({text}) => <BotMessage text={text} />);
    } finally {
        setIsLoading(false);
    }
    // --- Agent Simulation Ends ---
  };

  return (
    <div className="flex h-screen w-full bg-slate-900 text-white font-sans">
      <div className="flex flex-col flex-1">
        {/* Header */}
        <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 p-4 shadow-md">
            <h1 className="text-xl font-bold text-center text-blue-300 flex items-center justify-center gap-3">
                <Bot className="w-7 h-7" />
                Content Clipper Agent
            </h1>
        </header>

        {/* Chat Messages */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {messages.map((msg, index) => (
              <msg.Component key={index} text={msg.text} />
          ))}
          <div ref={messagesEndRef} />
        </main>

        {/* Input Form */}
        <footer className="bg-slate-800 p-4 border-t border-slate-700">
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto space-y-3">
            <div className="flex items-center bg-slate-900 border border-slate-600 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 transition-shadow">
                <Youtube className="w-5 h-5 mx-3 text-slate-400"/>
                <input
                    type="url"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="Enter YouTube URL..."
                    className="w-full bg-transparent p-3 focus:outline-none"
                    disabled={isLoading}
                />
            </div>
            <div className="flex items-center bg-slate-900 border border-slate-600 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 transition-shadow">
                <User className="w-5 h-5 mx-3 text-slate-400"/>
                <input
                    type="text"
                    value={inputPrompt}
                    onChange={(e) => setInputPrompt(e.target.value)}
                    placeholder="Enter your prompt (e.g., 'Create a clip about AI')"
                    className="w-full bg-transparent p-3 focus:outline-none"
                    disabled={isLoading}
                />
            </div>
            <button
                type="submit"
                disabled={isLoading || !inputUrl || !inputPrompt}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-blue-500/30"
            >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Request"}
            </button>
          </form>
        </footer>
      </div>
    </div>
  );
}

// --- Message Components ---

const BotMessage = ({ text, icon = <Bot className="w-6 h-6 text-blue-300" /> }) => (
    <div className="flex items-start gap-3 max-w-xl">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
            {icon}
        </div>
        <div className="bg-slate-800 rounded-lg p-3 shadow-md">
            <p className="text-slate-200 whitespace-pre-wrap">{text}</p>
        </div>
    </div>
);

// New component to render the message with a clickable link
const BotMessageWithLink = ({ text, url, icon }) => {
    const parts = text.split(url);
    return (
        <div className="flex items-start gap-3 max-w-xl">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                {icon}
            </div>
            <div className="bg-slate-800 rounded-lg p-3 shadow-md">
                <p className="text-slate-200 whitespace-pre-wrap">
                    {parts[0]}
                    <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline break-all">
                        {url}
                    </a>
                    {parts[1]}
                </p>
            </div>
        </div>
    );
};


const UserMessage = ({ text }) => (
    <div className="flex items-start gap-3 justify-end">
        <div className="bg-blue-600 rounded-lg p-3 shadow-md max-w-xl">
            <p className="text-white whitespace-pre-wrap">{text}</p>
        </div>
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
            <User className="w-5 h-5 text-slate-300"/>
        </div>
    </div>
);
