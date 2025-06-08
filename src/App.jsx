import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Bot, User, Youtube, FileText, Film, MemoryStick, Loader2 } from 'lucide-react';

// This function fetches real video data from YouTube's oEmbed API.
const getYouTubeVideoInfo = async (videoUrl) => {
    // A CORS proxy is used to bypass browser security restrictions for fetching the data.
    // This is a common technique for client-side applications.
    const corsProxy = 'https://cors-proxy.org/cors?url='; // Using a reliable CORS proxy
    const oEmbedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`;
    
    try {
        const response = await fetch(corsProxy + oEmbedUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch video data. Status: ${response.status}`);
        }
        const data = await response.json();
        return data; // Contains { title, author_name, thumbnail_url, etc. }
    } catch (error) {
        console.error("YouTube oEmbed fetch error:", error);
        return null; // Return null to indicate failure for graceful handling.
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
    // Set the initial welcome message when the component loads.
    setMessages([
        { 
            type: 'bot', 
            text: "Hello! I am the Content Clipper Agent. Please provide a YouTube URL and a prompt, and I'll generate a conceptual video clip for you.",
            Component: BotMessage
        }
    ]);
  }, []);

  // A helper function to add new messages to the chat history.
  const addMessage = useCallback((type, props) => {
    setMessages(prev => [...prev, { type, ...props }]);
  }, []);
  
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputUrl || !inputPrompt || isLoading) return;

    setIsLoading(true);
    const userMessageText = `URL: ${inputUrl}\nPrompt: ${inputPrompt}`;
    addMessage('user', { text: userMessageText, Component: UserMessage });

    const originalUrl = inputUrl;
    const originalPrompt = inputPrompt;
    setInputUrl('');
    setInputPrompt('');

    // --- Real & Simulated Agent Process Starts ---
    
    setTimeout(() => {
        addMessage('bot', { text: "Request received. Fetching video information...", icon: <Loader2 className="w-4 h-4 animate-spin" />, Component: BotMessage });
    }, 500);

    // 1. REAL: Fetch Video Info from the provided URL
    const videoInfo = await getYouTubeVideoInfo(originalUrl);

    if (!videoInfo) {
        addMessage('bot', { text: "Sorry, I couldn't fetch information for that YouTube URL. Please check the link and make sure it's a valid video.", Component: BotMessage });
        setIsLoading(false);
        return;
    }

    addMessage('bot', { 
        text: `Successfully fetched details for: "${videoInfo.title}" by ${videoInfo.author_name}.`,
        icon: <Youtube className="w-4 h-4 text-green-400" />,
        Component: BotMessage 
    });

    // 2. SIMULATED: The following steps are simulated to show the process.
    setTimeout(() => {
        addMessage('bot', { text: "Accessing simple memory for context...", icon: <MemoryStick className="w-4 h-4 text-blue-400" />, Component: BotMessage });
    }, 1000);

    setTimeout(() => {
        addMessage('bot', { text: `Initiating transcript generation... (Simulated)`, icon: <FileText className="w-4 h-4 text-purple-400"/>, Component: BotMessage });
    }, 2000);
    
    setTimeout(() => {
        addMessage('bot', { text: "Analyzing transcript and generating video clip based on your prompt... (Simulated)", icon: <Film className="w-4 h-4 text-teal-400"/>, Component: BotMessage });
    }, 3500);

    // 4. FINAL RESULT: Display the result card with REAL data from YouTube.
    setTimeout(() => {
        addMessage('result', { 
            videoInfo,
            prompt: originalPrompt,
            Component: VideoResultCard 
        });
        setIsLoading(false);
    }, 5000);
    // --- Agent Process Ends ---
  };

  return (
    <div className="flex h-screen w-full bg-slate-900 text-white font-sans">
      <div className="flex flex-col flex-1">
        <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 p-4 shadow-md">
            <h1 className="text-xl font-bold text-center text-blue-300 flex items-center justify-center gap-3">
                <Bot className="w-7 h-7" />
                Content Clipper Agent
            </h1>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {messages.map((msg, index) => (
              <msg.Component key={index} {...msg} />
          ))}
          <div ref={messagesEndRef} />
        </main>

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
                    required
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
                    required
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

// --- Message & Result Components ---

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

// This new component displays the final result card with the embedded video.
const VideoResultCard = ({ videoInfo, prompt }) => {
    if (!videoInfo) return null;

    // Creates a clean embed URL from a standard YouTube watch URL.
    const getEmbedUrl = (youtubeUrl) => {
        try {
            const url = new URL(youtubeUrl);
            let videoId = url.searchParams.get('v');
            if (videoId) {
                return `https://www.youtube.com/embed/${videoId}`;
            }
            // Fallback for youtu.be shortlinks
            videoId = url.pathname.split('/').pop();
            if (videoId) {
                return `https://www.youtube.com/embed/${videoId}`;
            }
        } catch (e) {
            console.error("Could not parse URL for embed:", e);
        }
        return null;
    }
    
    // We get the original URL from the 'author_url' field in the oEmbed response.
    const embedUrl = getEmbedUrl(videoInfo.author_url); 

    return (
        <div className="flex items-start gap-3 max-w-2xl mx-auto">
             <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center mt-2">
                <Film className="w-5 h-5 text-green-400"/>
            </div>
            <div className="bg-slate-800 rounded-lg p-4 shadow-lg border border-slate-700 w-full">
                <h3 className="font-bold text-lg text-white mb-2">Video Clip Generated (Concept)</h3>
                
                {embedUrl ? (
                     <div className="aspect-w-16 aspect-h-9 rounded-md overflow-hidden my-3 border border-slate-600">
                         <iframe 
                             src={embedUrl}
                             title={videoInfo.title}
                             frameBorder="0" 
                             allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                             allowFullScreen
                             className="w-full h-full"
                         ></iframe>
                     </div>
                ) : (
                    <img src={videoInfo.thumbnail_url} alt={videoInfo.title} className="w-full h-auto rounded-md my-3 border border-slate-600" />
                )}

                <h4 className="font-semibold text-md text-slate-100">{videoInfo.title}</h4>
                <p className="text-sm text-slate-400 mb-3">by {videoInfo.author_name}</p>
                <div className="bg-slate-900/50 p-3 rounded-md border border-slate-700">
                    <p className="text-sm text-slate-300">
                        <span className="font-semibold text-slate-100">Prompt:</span> "{prompt}"
                    </p>
                    <p className="text-xs text-slate-400 mt-2">
                        (This is a conceptual representation. The full video is embedded above for reference.)
                    </p>
                </div>
            </div>
        </div>
    );
};
