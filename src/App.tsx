/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  StickyNote, 
  Settings as SettingsIcon, 
  Plus, 
  CheckCircle2, 
  Circle, 
  Clock, 
  ChevronRight,
  Search,
  Bell,
  User,
  Trash2,
  Calendar as CalendarIcon,
  MapPin,
  Timer,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Send,
  Bot,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";

// --- Types ---
interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  tags: string[];
  category: string;
}

interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  tags: string[];
  updatedAt: string;
}

interface AppEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location?: string;
  tags: string[];
  description?: string;
}

// --- Components ---

const NoteModal = ({ 
  isOpen, 
  onClose, 
  onSave 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSave: (note: Omit<Note, 'id' | 'updatedAt'>) => void;
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState('bg-white');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const colors = [
    { name: 'White', class: 'bg-white' },
    { name: 'Amber', class: 'bg-amber-100' },
    { name: 'Emerald', class: 'bg-emerald-100' },
    { name: 'Rose', class: 'bg-rose-100' },
    { name: 'Indigo', class: 'bg-indigo-100' },
    { name: 'Sky', class: 'bg-sky-100' },
  ];

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSave = () => {
    if (!title.trim() || !content.trim()) return;
    onSave({
      title,
      content,
      color,
      tags
    });
    // Reset form
    setTitle('');
    setContent('');
    setColor('bg-white');
    setTags([]);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
          />
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white rounded-t-[32px] p-8 z-[70] shadow-2xl"
          >
            <div className="w-12 h-1.5 bg-zinc-200 rounded-full mx-auto mb-6" />
            
            <h2 className="text-xl font-display font-bold mb-6">Create New Note</h2>
            
            <div className="space-y-5 max-h-[70vh] overflow-y-auto no-scrollbar pb-6">
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">Note Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Title of your note"
                  className="w-full p-4 rounded-2xl bg-zinc-50 border border-zinc-100 outline-none focus:border-emerald-500 transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">Content</label>
                <textarea 
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your thoughts..."
                  rows={5}
                  className="w-full p-4 rounded-2xl bg-zinc-50 border border-zinc-100 outline-none focus:border-emerald-500 transition-all resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">Color</label>
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                  {colors.map((c) => (
                    <button
                      key={c.class}
                      onClick={() => setColor(c.class)}
                      className={`w-10 h-10 rounded-full border-2 transition-all shrink-0 ${c.class} ${
                        color === c.class ? 'border-zinc-900 scale-110' : 'border-black/5'
                      }`}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold flex items-center gap-1">
                      {tag}
                      <button onClick={() => removeTag(tag)} className="hover:text-emerald-800">
                        <Plus size={14} className="rotate-45" />
                      </button>
                    </span>
                  ))}
                </div>
                <input 
                  type="text" 
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="Press Enter to add tags"
                  className="w-full p-4 rounded-2xl bg-zinc-50 border border-zinc-100 outline-none"
                />
              </div>
            </div>

            <button 
              onClick={handleSave}
              className="w-full py-5 bg-zinc-900 text-white rounded-2xl font-bold text-lg shadow-xl mt-4 active:scale-95 transition-transform"
            >
              Save Note
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const AIAssistantModal = ({ 
  isOpen, 
  onClose,
  onAddTask,
  onAddNote,
  onAddEvent,
  categories
}: { 
  isOpen: boolean; 
  onClose: () => void;
  onAddTask: (task: Omit<Task, 'id' | 'completed'>) => void;
  onAddNote: (note: Omit<Note, 'id' | 'updatedAt'>) => void;
  onAddEvent: (event: Omit<AppEvent, 'id'>) => void;
  categories: string[];
}) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([
    { role: 'ai', content: "Hi! I'm your ZenDo assistant. I can help you create tasks, notes, and events. Just tell me what's on your mind!" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const createTaskTool: FunctionDeclaration = {
    name: "createTask",
    parameters: {
      type: Type.OBJECT,
      description: "Create a new task in the to-do list.",
      properties: {
        title: { type: Type.STRING, description: "The title of the task." },
        description: { type: Type.STRING, description: "Additional details about the task." },
        priority: { type: Type.STRING, enum: ["low", "medium", "high"], description: "The priority level." },
        category: { type: Type.STRING, description: "The category for the task (e.g., Work, Personal, Health)." },
        dueDate: { type: Type.STRING, description: "When the task is due (e.g., 'Today at 5pm', 'Tomorrow')." },
        tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of tags for the task." }
      },
      required: ["title"]
    }
  };

  const createNoteTool: FunctionDeclaration = {
    name: "createNote",
    parameters: {
      type: Type.OBJECT,
      description: "Create a new note.",
      properties: {
        title: { type: Type.STRING, description: "The title of the note." },
        content: { type: Type.STRING, description: "The content of the note." },
        color: { type: Type.STRING, description: "A Tailwind background color class (e.g., 'bg-amber-100', 'bg-emerald-100')." },
        tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of tags for the note." }
      },
      required: ["title", "content"]
    }
  };

  const createEventTool: FunctionDeclaration = {
    name: "createEvent",
    parameters: {
      type: Type.OBJECT,
      description: "Create a new calendar event.",
      properties: {
        title: { type: Type.STRING, description: "The title of the event." },
        date: { type: Type.STRING, description: "The date of the event in YYYY-MM-DD format." },
        time: { type: Type.STRING, description: "The time of the event (e.g., '14:00')." },
        location: { type: Type.STRING, description: "The location of the event." },
        tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of tags for the event." },
        description: { type: Type.STRING, description: "Details about the event." }
      },
      required: ["title", "date", "time"]
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
    const modelName = (import.meta.env.VITE_GEMINI_MODEL as string | undefined) || 'gemini-2.5-flash';

    if (!apiKey) {
      setMessages(prev => [...prev, { role: 'ai', content: "AI is not configured yet. Set VITE_GEMINI_API_KEY in your .env.local file and restart the dev server." }]);
      return;
    }

    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: modelName,
        contents: userMessage,
        config: {
          systemInstruction: `You are a helpful assistant for ZenDo, a productivity app. 
          Your goal is to help users manage their tasks, notes, and events.
          When a user asks to create something, use the appropriate tool.
          If they are vague, ask for more details.
          Current date: ${new Date().toISOString().split('T')[0]}.
          Available categories: ${categories.join(', ')}.`,
          tools: [{ functionDeclarations: [createTaskTool, createNoteTool, createEventTool] }]
        }
      });

      const functionCalls = response.functionCalls;
      let aiResponseText = response.text || "I've processed your request.";

      if (functionCalls) {
        for (const call of functionCalls) {
          if (call.name === 'createTask') {
            const args = call.args as any;
            onAddTask({
              title: args.title,
              description: args.description || '',
              priority: args.priority || 'medium',
              category: args.category || 'Personal',
              dueDate: args.dueDate,
              tags: args.tags || []
            });
            aiResponseText = `I've created the task: "${args.title}".`;
          } else if (call.name === 'createNote') {
            const args = call.args as any;
            onAddNote({
              title: args.title,
              content: args.content,
              color: args.color || 'bg-zinc-100',
              tags: args.tags || []
            });
            aiResponseText = `I've added a new note: "${args.title}".`;
          } else if (call.name === 'createEvent') {
            const args = call.args as any;
            onAddEvent({
              title: args.title,
              date: args.date,
              time: args.time,
              location: args.location,
              tags: args.tags || [],
              description: args.description
            });
            aiResponseText = `I've scheduled the event: "${args.title}" for ${args.date} at ${args.time}.`;
          }
        }
      }

      setMessages(prev => [...prev, { role: 'ai', content: aiResponseText }]);
    } catch (error) {
      console.error("AI Error:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isQuotaError =
        /RESOURCE_EXHAUSTED|quota|429/i.test(errorMessage);

      if (isQuotaError) {
        const retryMatch = errorMessage.match(/retry in\s+([0-9.]+s?)/i) || errorMessage.match(/retryDelay":"([^"]+)"/i);
        const retryDelay = retryMatch?.[1];
        const quotaMessage = retryDelay
          ? `Gemini quota limit reached. Please wait ${retryDelay} and try again. You can also use a lighter model by setting VITE_GEMINI_MODEL=gemini-2.5-flash in .env.local.`
          : "Gemini quota limit reached. Please try again later or use a lighter model by setting VITE_GEMINI_MODEL=gemini-2.5-flash in .env.local.";
        setMessages(prev => [...prev, { role: 'ai', content: quotaMessage }]);
      } else {
        setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I encountered an error. Please try again." }]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-80"
          />
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white rounded-t-4xl flex flex-col h-[80vh] z-[90] shadow-2xl"
          >
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-zinc-900 flex items-center justify-center text-white">
                  <Bot size={24} />
                </div>
                <div>
                  <h2 className="font-display font-bold text-zinc-900">ZenDo AI</h2>
                  <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Online</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-600">
                <Plus size={24} className="rotate-45" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-zinc-900 text-white rounded-tr-none' 
                      : 'bg-zinc-100 text-zinc-800 rounded-tl-none'
                  }`}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-zinc-100 p-4 rounded-2xl rounded-tl-none">
                    <Loader2 size={16} className="animate-spin text-zinc-400" />
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-zinc-100 bg-white rounded-b-4xl">
              <div className="relative flex items-center">
                <input 
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask me to create a task..."
                  className="w-full p-4 pr-14 rounded-2xl bg-zinc-50 border border-zinc-100 outline-none focus:border-zinc-900 transition-all"
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 p-3 bg-zinc-900 text-white rounded-xl disabled:opacity-50 transition-opacity"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const EventModal = ({ 
  isOpen, 
  onClose, 
  onSave 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSave: (event: Omit<AppEvent, 'id'>) => void;
}) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSave = () => {
    if (!title.trim() || !date.trim()) return;
    onSave({
      title,
      date,
      time,
      location,
      description,
      tags
    });
    // Reset form
    setTitle('');
    setDate('');
    setTime('');
    setLocation('');
    setDescription('');
    setTags([]);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
          />
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white rounded-t-[32px] p-8 z-[70] shadow-2xl"
          >
            <div className="w-12 h-1.5 bg-zinc-200 rounded-full mx-auto mb-6" />
            
            <h2 className="text-xl font-display font-bold mb-6">Create New Event</h2>
            
            <div className="space-y-5 max-h-[70vh] overflow-y-auto no-scrollbar pb-6">
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">Event Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What's happening?"
                  className="w-full p-4 rounded-2xl bg-zinc-50 border border-zinc-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">Date</label>
                  <input 
                    type="date" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-4 rounded-2xl bg-zinc-50 border border-zinc-100 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">Time</label>
                  <input 
                    type="time" 
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full p-4 rounded-2xl bg-zinc-50 border border-zinc-100 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">Location</label>
                <input 
                  type="text" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Where is it?"
                  className="w-full p-4 rounded-2xl bg-zinc-50 border border-zinc-100 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">Description</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add details..."
                  rows={3}
                  className="w-full p-4 rounded-2xl bg-zinc-50 border border-zinc-100 outline-none resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold flex items-center gap-1">
                      {tag}
                      <button onClick={() => removeTag(tag)} className="hover:text-indigo-800">
                        <Plus size={14} className="rotate-45" />
                      </button>
                    </span>
                  ))}
                </div>
                <input 
                  type="text" 
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="Press Enter to add tags"
                  className="w-full p-4 rounded-2xl bg-zinc-50 border border-zinc-100 outline-none"
                />
              </div>
            </div>

            <button 
              onClick={handleSave}
              className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-bold text-lg shadow-xl mt-4 active:scale-95 transition-transform"
            >
              Save Event
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
const TaskModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  categories 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSave: (task: Omit<Task, 'id' | 'completed'>) => void;
  categories: string[];
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [category, setCategory] = useState(categories[0] || 'Personal');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState('');

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      title,
      description,
      priority,
      category,
      tags,
      dueDate: dueDate || undefined
    });
    // Reset form
    setTitle('');
    setDescription('');
    setPriority('medium');
    setCategory(categories[0] || 'Personal');
    setTags([]);
    setDueDate('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
          />
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white rounded-t-[32px] p-8 z-[70] shadow-2xl"
          >
            <div className="w-12 h-1.5 bg-zinc-200 rounded-full mx-auto mb-6" />
            
            <h2 className="text-xl font-display font-bold mb-6">Create New Task</h2>
            
            <div className="space-y-5 max-h-[70vh] overflow-y-auto no-scrollbar pb-6">
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">Task Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What needs to be done?"
                  className="w-full p-4 rounded-2xl bg-zinc-50 border border-zinc-100 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">Description (Optional)</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add more details..."
                  rows={3}
                  className="w-full p-4 rounded-2xl bg-zinc-50 border border-zinc-100 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">Category</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-4 rounded-2xl bg-zinc-50 border border-zinc-100 outline-none appearance-none"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">Priority</label>
                  <div className="flex gap-2">
                    {(['low', 'medium', 'high'] as const).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPriority(p)}
                        className={`flex-1 py-4 rounded-2xl border text-xs font-bold uppercase transition-all ${
                          priority === p 
                            ? p === 'high' ? 'bg-rose-500 border-rose-500 text-white' :
                              p === 'medium' ? 'bg-amber-500 border-amber-500 text-white' :
                              'bg-emerald-500 border-emerald-500 text-white'
                            : 'bg-zinc-50 border-zinc-100 text-zinc-400'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">Due Date</label>
                <input 
                  type="text" 
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  placeholder="e.g. Tomorrow, 10:00 AM"
                  className="w-full p-4 rounded-2xl bg-zinc-50 border border-zinc-100 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold flex items-center gap-1">
                      {tag}
                      <button onClick={() => removeTag(tag)} className="hover:text-emerald-800">
                        <Plus size={14} className="rotate-45" />
                      </button>
                    </span>
                  ))}
                </div>
                <input 
                  type="text" 
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="Press Enter to add tags"
                  className="w-full p-4 rounded-2xl bg-zinc-50 border border-zinc-100 outline-none"
                />
              </div>
            </div>

            <button 
              onClick={handleSave}
              className="w-full py-5 bg-zinc-900 text-white rounded-2xl font-bold text-lg shadow-xl mt-4 active:scale-95 transition-transform"
            >
              Save Task
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const FocusTimer = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [duration, setDuration] = useState(25);
  const [isMuted, setIsMuted] = useState(false);
  const [mode, setMode] = useState<'focus' | 'short' | 'long'>('focus');
  const [notificationMessage, setNotificationMessage] = useState('Time is up! Take a break.');

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      if (!isMuted) {
        // Simple notification logic
        alert(notificationMessage);
      }
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, isMuted, notificationMessage]);

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(duration * 60);
  };

  const handleModeChange = (newMode: 'focus' | 'short' | 'long', mins: number) => {
    setMode(newMode);
    setDuration(mins);
    setTimeLeft(mins * 60);
    setIsActive(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (timeLeft / (duration * 60)) * 100;

  return (
    <div className="space-y-8 pb-24">
      <header className="pt-4">
        <h1 className="text-2xl font-display font-bold text-zinc-900">Focus Timer</h1>
        <p className="text-zinc-500">Stay productive and mindful</p>
      </header>

      <div className="flex justify-center gap-2 p-1 bg-zinc-100 rounded-2xl">
        <button 
          onClick={() => handleModeChange('focus', 25)}
          className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${mode === 'focus' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-400'}`}
        >
          Focus
        </button>
        <button 
          onClick={() => handleModeChange('short', 5)}
          className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${mode === 'short' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-400'}`}
        >
          Short Break
        </button>
        <button 
          onClick={() => handleModeChange('long', 15)}
          className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${mode === 'long' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-400'}`}
        >
          Long Break
        </button>
      </div>

      <div className="relative flex flex-col items-center justify-center py-12">
        {/* Timer Circle */}
        <div className="relative w-64 h-64 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="128"
              cy="128"
              r="120"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-zinc-100"
            />
            <motion.circle
              cx="128"
              cy="128"
              r="120"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 120}
              initial={{ strokeDashoffset: 2 * Math.PI * 120 }}
              animate={{ strokeDashoffset: (2 * Math.PI * 120) * (1 - progress / 100) }}
              className="text-emerald-500"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-6xl font-display font-bold text-zinc-900 tracking-tighter">
              {formatTime(timeLeft)}
            </span>
            <span className="text-sm font-bold text-zinc-400 uppercase tracking-widest mt-2">{mode}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-6">
        <button 
          onClick={resetTimer}
          className="p-4 rounded-2xl bg-white border border-zinc-100 text-zinc-400 hover:text-zinc-600 shadow-sm"
        >
          <RotateCcw size={24} />
        </button>
        <button 
          onClick={toggleTimer}
          className="w-20 h-20 rounded-3xl bg-zinc-900 text-white flex items-center justify-center shadow-xl shadow-zinc-200 active:scale-95 transition-transform"
        >
          {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
        </button>
        <button 
          onClick={() => setIsMuted(!isMuted)}
          className="p-4 rounded-2xl bg-white border border-zinc-100 text-zinc-400 hover:text-zinc-600 shadow-sm"
        >
          {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
        </button>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm">
        <h3 className="font-display font-bold text-zinc-900 mb-4">Custom Timer</h3>
        <div className="flex items-center gap-4 mb-6">
          <input 
            type="range" 
            min="1" 
            max="60" 
            value={duration}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setDuration(val);
              if (!isActive) setTimeLeft(val * 60);
            }}
            className="flex-1 h-2 bg-zinc-100 rounded-full appearance-none accent-emerald-500"
          />
          <span className="w-12 text-center font-bold text-zinc-900">{duration}m</span>
        </div>
        
        <div className="space-y-2">
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Notification Message</label>
          <input 
            type="text"
            value={notificationMessage}
            onChange={(e) => setNotificationMessage(e.target.value)}
            placeholder="e.g. Time to stretch!"
            className="w-full p-3 rounded-xl bg-zinc-50 border border-zinc-100 outline-none text-sm"
          />
        </div>
        <p className="text-xs text-zinc-400 mt-4">Set a custom duration and notification message for your focus session.</p>
      </div>
    </div>
  );
};

const Calendar = ({ events }: { events: AppEvent[] }) => {
  // Simple grouping by date
  const groupedEvents = events.reduce((acc, event) => {
    if (!acc[event.date]) acc[event.date] = [];
    acc[event.date].push(event);
    return acc;
  }, {} as Record<string, AppEvent[]>);

  const sortedDates = Object.keys(groupedEvents).sort();

  return (
    <div className="space-y-6 pb-24">
      <header className="flex justify-between items-center pt-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-zinc-900">Calendar</h1>
          <p className="text-zinc-500">Your upcoming schedule</p>
        </div>
        <div className="flex gap-3">
          <button className="p-2 rounded-full bg-white shadow-sm border border-zinc-100 text-zinc-600">
            <Search size={20} />
          </button>
        </div>
      </header>

      {/* Mini Calendar Placeholder */}
      <div className="bg-white rounded-3xl p-6 border border-zinc-100 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-zinc-900">February 2026</h3>
          <div className="flex gap-2">
            <button className="p-1 text-zinc-400"><ChevronRight size={20} className="rotate-180" /></button>
            <button className="p-1 text-zinc-400"><ChevronRight size={20} /></button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-zinc-400 mb-2">
          <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
        </div>
        <div className="grid grid-cols-7 gap-2 text-center">
          {Array.from({ length: 28 }, (_, i) => (
            <div 
              key={i} 
              className={`py-2 rounded-xl text-sm font-medium ${
                i + 1 === 24 ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'text-zinc-600 hover:bg-zinc-50'
              }`}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {sortedDates.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-zinc-400">No events scheduled</p>
          </div>
        ) : (
          sortedDates.map(date => (
            <div key={date} className="space-y-3">
              <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest px-1">
                {new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </h3>
              {groupedEvents[date].map((event, idx) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm flex gap-4"
                >
                  <div className="w-12 flex flex-col items-center justify-center border-r border-zinc-100 pr-4">
                    <span className="text-xs font-bold text-indigo-600">{event.time}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-zinc-900">{event.title}</h4>
                    {event.location && (
                      <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                        <span className="w-1 h-1 bg-zinc-300 rounded-full" />
                        {event.location}
                      </p>
                    )}
                    <div className="flex gap-2 mt-2">
                      {event.tags.map(tag => (
                        <span key={tag} className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md uppercase">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const Dashboard = ({ 
  tasks, 
  toggleTask, 
  categories, 
  activeCategory, 
  setActiveCategory,
  events,
  setActiveTab,
  onOpenAI
}: { 
  tasks: Task[], 
  toggleTask: (id: string) => void,
  categories: string[],
  activeCategory: string,
  setActiveCategory: (cat: string) => void,
  events: AppEvent[],
  setActiveTab: (tab: 'dashboard' | 'calendar' | 'focus' | 'notes' | 'settings') => void,
  onOpenAI: () => void
}) => {
  const filteredTasks = activeCategory === 'All' 
    ? tasks 
    : tasks.filter(t => t.category === activeCategory);
    
  const completedCount = filteredTasks.filter(t => t.completed).length;
  const progress = filteredTasks.length > 0 ? (completedCount / filteredTasks.length) * 100 : 0;

  // Upcoming events widget logic
  const upcomingEvents = events.slice(0, 2);

  return (
    <div className="space-y-6 pb-24">
      <header className="flex justify-between items-center pt-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-zinc-900">Good morning,</h1>
          <p className="text-zinc-500">You have {tasks.filter(t => !t.completed).length} tasks remaining.</p>
        </div>
        <div className="flex gap-3">
          <button className="p-2 rounded-full bg-white shadow-sm border border-zinc-100 text-zinc-600">
            <Search size={20} />
          </button>
          <button className="p-2 rounded-full bg-white shadow-sm border border-zinc-100 text-zinc-600 relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white"></span>
          </button>
        </div>
      </header>

      {/* Progress Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-900 rounded-3xl p-6 text-white shadow-xl overflow-hidden relative"
      >
        <div className="relative z-10">
          <span className="text-zinc-400 text-sm font-medium uppercase tracking-wider">
            {activeCategory} Progress
          </span>
          <div className="mt-2 flex items-end gap-2">
            <span className="text-4xl font-display font-bold">{Math.round(progress)}%</span>
            <span className="text-zinc-400 mb-1">completed</span>
          </div>
          <div className="mt-4 w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-emerald-400"
            />
          </div>
        </div>
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl"></div>
      </motion.div>

      {/* AI Assistant Widget */}
      <motion.button 
        whileTap={{ scale: 0.98 }}
        onClick={onOpenAI}
        className="w-full p-6 rounded-3xl bg-gradient-to-br from-zinc-900 to-zinc-800 text-white shadow-xl relative overflow-hidden group"
      >
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <Sparkles size={24} />
            </div>
            <div className="text-left">
              <h3 className="font-display font-bold text-lg">ZenDo AI Assistant</h3>
              <p className="text-zinc-400 text-xs">Create tasks & notes with AI</p>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
            <ChevronRight size={20} className="text-zinc-500" />
          </div>
        </div>
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors"></div>
      </motion.button>

      {/* Upcoming Events Widget */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-display font-semibold">Upcoming Events</h2>
          <button className="text-indigo-600 text-sm font-medium">View calendar</button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {upcomingEvents.length === 0 ? (
            <div className="col-span-2 p-6 rounded-3xl bg-white border border-dashed border-zinc-200 text-center">
              <p className="text-zinc-400 text-sm">No upcoming events</p>
            </div>
          ) : (
            upcomingEvents.map(event => (
              <div key={event.id} className="p-4 rounded-3xl bg-indigo-50 border border-indigo-100 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500" />
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">{event.time}</span>
                </div>
                <h3 className="font-bold text-zinc-900 text-sm line-clamp-1">{event.title}</h3>
                <p className="text-[10px] text-zinc-500 mt-1">{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Focus Session Widget */}
      <div className="p-6 rounded-3xl bg-white border border-zinc-100 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Timer size={24} />
          </div>
          <div>
            <h3 className="font-bold text-zinc-900">Focus Session</h3>
            <p className="text-xs text-zinc-500">Ready to get things done?</p>
          </div>
        </div>
        <button 
          onClick={() => setActiveTab('focus')}
          className="px-4 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-zinc-200"
        >
          Start
        </button>
      </div>

      {/* Categories Horizontal Scroll */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
        {['All', ...categories].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all ${
              activeCategory === cat 
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-100' 
                : 'bg-white text-zinc-400 border border-zinc-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-display font-semibold">
            {activeCategory === 'All' ? "Today's Tasks" : `${activeCategory} Tasks`}
          </h2>
          <button className="text-emerald-600 text-sm font-medium">See all</button>
        </div>
        
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-300">
                <CheckCircle2 size={32} />
              </div>
              <p className="text-zinc-400 font-medium">No tasks in this category</p>
            </div>
          ) : (
            filteredTasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-4 rounded-2xl border transition-all ${
                  task.completed 
                    ? 'bg-zinc-50 border-zinc-100 opacity-60' 
                    : 'bg-white border-zinc-100 shadow-sm'
                }`}
              >
                <div className="flex items-start gap-4">
                  <button 
                    onClick={() => toggleTask(task.id)}
                    className={`mt-1 transition-colors ${task.completed ? 'text-emerald-500' : 'text-zinc-300'}`}
                  >
                    {task.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                  </button>
                  <div className="flex-1">
                    <h3 className={`font-bold ${task.completed ? 'line-through text-zinc-400' : 'text-zinc-800'}`}>
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="text-sm text-zinc-500 mt-1 line-clamp-2">{task.description}</p>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-3 mt-3">
                      {task.dueDate && (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                          <Clock size={12} />
                          <span>{task.dueDate}</span>
                        </div>
                      )}
                      {task.tags.map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-zinc-100 text-zinc-500 rounded-md text-[10px] font-bold uppercase tracking-wider">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    task.priority === 'high' ? 'bg-rose-400' : 
                    task.priority === 'medium' ? 'bg-amber-400' : 'bg-emerald-400'
                  }`} />
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const Notes = ({ notes, onAddNote }: { notes: Note[], onAddNote: () => void }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const allTags = Array.from(new Set(notes.flatMap(n => n.tags)));

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         note.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag ? note.tags.includes(selectedTag) : true;
    return matchesSearch && matchesTag;
  });

  return (
    <div className="space-y-6 pb-24">
      <header className="flex justify-between items-center pt-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-zinc-900">Notes</h1>
          <p className="text-zinc-500">Capture your thoughts</p>
        </div>
        <button 
          onClick={onAddNote}
          className="p-3 rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-200"
        >
          <Plus size={24} />
        </button>
      </header>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search notes..."
          className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-zinc-100 outline-none focus:border-emerald-500 transition-all shadow-sm"
        />
      </div>

      {allTags.length > 0 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedTag === null ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-400 border border-zinc-100'
            }`}
          >
            All
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedTag === tag ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-400 border border-zinc-100'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {filteredNotes.length === 0 ? (
          <div className="col-span-2 py-12 text-center">
            <p className="text-zinc-400">No notes found</p>
          </div>
        ) : (
          filteredNotes.map((note, index) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`${note.color} p-5 rounded-3xl shadow-sm border border-black/5 flex flex-col h-56`}
            >
              <h3 className="font-display font-bold text-zinc-900 mb-2 line-clamp-1">{note.title}</h3>
              <p className="text-zinc-700 text-sm line-clamp-4 flex-1">{note.content}</p>
              
              <div className="flex flex-wrap gap-1 mt-3">
                {note.tags.slice(0, 2).map(tag => (
                  <span key={tag} className="text-[8px] font-bold text-zinc-500 bg-black/5 px-1.5 py-0.5 rounded uppercase">
                    #{tag}
                  </span>
                ))}
                {note.tags.length > 2 && (
                  <span className="text-[8px] font-bold text-zinc-500 bg-black/5 px-1.5 py-0.5 rounded uppercase">
                    +{note.tags.length - 2}
                  </span>
                )}
              </div>

              <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-tighter mt-3">
                {note.updatedAt}
              </span>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

const Settings = () => {
  const menuItems = [
    { icon: <User size={20} />, label: 'Profile', sub: 'Personal information' },
    { icon: <Bell size={20} />, label: 'Notifications', sub: 'Alerts & reminders' },
    { icon: <Clock size={20} />, label: 'History', sub: 'Completed tasks' },
    { icon: <Trash2 size={20} />, label: 'Data', sub: 'Clear storage' },
  ];

  return (
    <div className="space-y-8 pb-24">
      <header className="pt-4">
        <h1 className="text-2xl font-display font-bold text-zinc-900">Settings</h1>
        <p className="text-zinc-500">Manage your preferences</p>
      </header>

      <div className="flex items-center gap-4 p-6 rounded-3xl bg-white border border-zinc-100 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-zinc-900 flex items-center justify-center text-white text-2xl font-bold">
          JD
        </div>
        <div>
          <h2 className="font-display font-bold text-lg">John Doe</h2>
          <p className="text-zinc-500 text-sm">john@example.com</p>
        </div>
        <button className="ml-auto p-2 text-zinc-400">
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="space-y-2">
        {menuItems.map((item, index) => (
          <button 
            key={index}
            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white border border-zinc-100 shadow-sm hover:bg-zinc-50 transition-colors text-left"
          >
            <div className="p-2.5 rounded-xl bg-zinc-50 text-zinc-600">
              {item.icon}
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-zinc-900">{item.label}</h3>
              <p className="text-xs text-zinc-500">{item.sub}</p>
            </div>
            <ChevronRight size={18} className="text-zinc-300" />
          </button>
        ))}
      </div>

      <div className="p-6 rounded-3xl bg-rose-50 border border-rose-100 text-center">
        <button className="text-rose-600 font-semibold">Log Out</button>
      </div>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'calendar' | 'focus' | 'notes' | 'settings'>('dashboard');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [categories] = useState(['Personal', 'Work', 'Health', 'Finance']);
  
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Design user interface', description: 'Create a high-fidelity prototype for the mobile app dashboard.', completed: false, priority: 'high', dueDate: '10:00 AM', tags: ['design', 'ui'], category: 'Work' },
    { id: '2', title: 'Review project proposal', description: 'Go through the Q3 roadmap and provide feedback on the timeline.', completed: true, priority: 'medium', dueDate: '12:30 PM', tags: ['meeting'], category: 'Work' },
    { id: '3', title: 'Call with the team', description: 'Weekly sync to discuss progress and blockers.', completed: false, priority: 'high', dueDate: '02:00 PM', tags: ['sync'], category: 'Work' },
    { id: '4', title: 'Update documentation', description: 'Ensure all API endpoints are correctly documented in Swagger.', completed: false, priority: 'low', dueDate: '04:00 PM', tags: ['docs'], category: 'Work' },
    { id: '5', title: 'Gym session', description: 'Leg day workout at the local fitness center.', completed: false, priority: 'medium', dueDate: '06:00 PM', tags: ['fitness'], category: 'Health' },
  ]);

  const [notes, setNotes] = useState<Note[]>([
    { id: '1', title: 'Idea for App', content: 'A minimalist task manager that focuses on daily flow and mental clarity.', color: 'bg-amber-100', tags: ['app', 'design'], updatedAt: '2 hours ago' },
    { id: '2', title: 'Shopping List', content: 'Milk, Eggs, Bread, Avocados, Coffee beans, Dark chocolate.', color: 'bg-emerald-100', tags: ['grocery'], updatedAt: 'Yesterday' },
    { id: '3', title: 'Meeting Notes', content: 'Discuss the new branding strategy and timeline for Q3 launch.', color: 'bg-indigo-100', tags: ['work', 'branding'], updatedAt: '3 days ago' },
    { id: '4', title: 'Workout Plan', content: 'Monday: Chest & Triceps\nWednesday: Back & Biceps\nFriday: Legs & Shoulders', color: 'bg-rose-100', tags: ['fitness'], updatedAt: '1 week ago' },
  ]);

  const [events, setEvents] = useState<AppEvent[]>([
    { id: '1', title: 'Product Launch Sync', date: '2026-02-24', time: '10:00', location: 'Meeting Room A', tags: ['work', 'launch'] },
    { id: '2', title: 'Dinner with Sarah', date: '2026-02-25', time: '19:00', location: 'Italian Bistro', tags: ['personal'] },
    { id: '3', title: 'Yoga Class', date: '2026-02-24', time: '08:00', location: 'Zen Studio', tags: ['health'] },
  ]);

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleSaveTask = (newTaskData: Omit<Task, 'id' | 'completed'>) => {
    const newTask: Task = {
      ...newTaskData,
      id: Math.random().toString(36).substr(2, 9),
      completed: false
    };
    setTasks([newTask, ...tasks]);
  };

  const handleSaveEvent = (newEventData: Omit<AppEvent, 'id'>) => {
    const newEvent: AppEvent = {
      ...newEventData,
      id: Math.random().toString(36).substr(2, 9)
    };
    setEvents([newEvent, ...events]);
  };

  const handleSaveNote = (newNoteData: Omit<Note, 'id' | 'updatedAt'>) => {
    const newNote: Note = {
      ...newNoteData,
      id: Math.random().toString(36).substr(2, 9),
      updatedAt: 'Just now'
    };
    setNotes([newNote, ...notes]);
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-zinc-50 font-sans selection:bg-emerald-100">
      <main className="px-6 pt-4">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <Dashboard 
                tasks={tasks} 
                toggleTask={toggleTask} 
                categories={categories}
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
                events={events}
                setActiveTab={setActiveTab}
                onOpenAI={() => setIsAIAssistantOpen(true)}
              />
            </motion.div>
          )}
          {activeTab === 'calendar' && (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <Calendar events={events} />
            </motion.div>
          )}
          {activeTab === 'focus' && (
            <motion.div
              key="focus"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <FocusTimer />
            </motion.div>
          )}
          {activeTab === 'notes' && (
            <motion.div
              key="notes"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <Notes notes={notes} onAddNote={() => setIsNoteModalOpen(true)} />
            </motion.div>
          )}
          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <Settings />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <TaskModal 
        isOpen={isTaskModalOpen} 
        onClose={() => setIsTaskModalOpen(false)} 
        onSave={handleSaveTask}
        categories={categories}
      />

      <EventModal 
        isOpen={isEventModalOpen} 
        onClose={() => setIsEventModalOpen(false)} 
        onSave={handleSaveEvent}
      />

      <NoteModal 
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        onSave={handleSaveNote}
      />

      <AIAssistantModal 
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
        onAddTask={handleSaveTask}
        onAddNote={handleSaveNote}
        onAddEvent={handleSaveEvent}
        categories={categories}
      />

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto px-6 pb-8 pt-4 bg-zinc-50/80 backdrop-blur-xl border-t border-zinc-100 z-50">
        <div className="flex justify-between items-center bg-white rounded-3xl p-2 shadow-lg shadow-zinc-200/50 border border-zinc-100">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 flex flex-col items-center py-2 rounded-2xl transition-all ${
              activeTab === 'dashboard' ? 'bg-zinc-900 text-white' : 'text-zinc-400 hover:text-zinc-600'
            }`}
          >
            <LayoutDashboard size={20} />
            <span className="text-[10px] font-bold mt-1 uppercase tracking-widest">Home</span>
          </button>

          <button 
            onClick={() => setActiveTab('calendar')}
            className={`flex-1 flex flex-col items-center py-2 rounded-2xl transition-all ${
              activeTab === 'calendar' ? 'bg-zinc-900 text-white' : 'text-zinc-400 hover:text-zinc-600'
            }`}
          >
            <CalendarIcon size={20} />
            <span className="text-[10px] font-bold mt-1 uppercase tracking-widest">Cal</span>
          </button>

          <button 
            onClick={() => setActiveTab('focus')}
            className={`flex-1 flex flex-col items-center py-2 rounded-2xl transition-all ${
              activeTab === 'focus' ? 'bg-zinc-900 text-white' : 'text-zinc-400 hover:text-zinc-600'
            }`}
          >
            <Timer size={20} />
            <span className="text-[10px] font-bold mt-1 uppercase tracking-widest">Focus</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('notes')}
            className={`flex-1 flex flex-col items-center py-2 rounded-2xl transition-all ${
              activeTab === 'notes' ? 'bg-zinc-900 text-white' : 'text-zinc-400 hover:text-zinc-600'
            }`}
          >
            <StickyNote size={20} />
            <span className="text-[10px] font-bold mt-1 uppercase tracking-widest">Notes</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('settings')}
            className={`flex-1 flex flex-col items-center py-2 rounded-2xl transition-all ${
              activeTab === 'settings' ? 'bg-zinc-900 text-white' : 'text-zinc-400 hover:text-zinc-600'
            }`}
          >
            <SettingsIcon size={20} />
            <span className="text-[10px] font-bold mt-1 uppercase tracking-widest">Set</span>
          </button>
        </div>
      </nav>

      {/* Floating Action Button */}
      {(activeTab === 'dashboard' || activeTab === 'calendar' || activeTab === 'notes') && (
        <motion.button 
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          onClick={() => {
            if (activeTab === 'dashboard') setIsTaskModalOpen(true);
            else if (activeTab === 'calendar') setIsEventModalOpen(true);
            else if (activeTab === 'notes') setIsNoteModalOpen(true);
          }}
          className={`fixed bottom-28 right-6 w-14 h-14 text-white rounded-2xl shadow-xl flex items-center justify-center z-40 ${
            activeTab === 'dashboard' ? 'bg-emerald-500 shadow-emerald-200' : 
            activeTab === 'calendar' ? 'bg-indigo-600 shadow-indigo-200' :
            'bg-emerald-500 shadow-emerald-200'
          }`}
        >
          <Plus size={28} />
        </motion.button>
      )}
    </div>
  );
}
