import React, { useState, useRef, useEffect } from "react";
import Head from "next/head";
import { motion, AnimatePresence } from "framer-motion";
import {
	Send,
	Loader2,
	User,
	Bot,
	Palette,
	Download,
	Code,
	Play,
	X,
	ImageIcon,
	Globe,
	Lightbulb,
	Github,
	Twitter,
	Linkedin,
	Instagram,
	Mail,
	Layout,
	Sparkles,
	Star,
	Zap,
	BadgeCheck,
	RefreshCcw,
	ChevronRight,
	Sun,
	HelpCircle,
	Gift,
	Dog,
	DogIcon,
} from "lucide-react";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import useSimba from "../lib/hooks/useSimba";

const SimbaCanvas = dynamic(() => import("../app/frontend/SimbaCanvas"), {
	ssr: false,
});

const AIDesignCreatorPage = () => {
	const [messages, setMessages] = useState([
		{
			id: 1,
			role: "assistant",
			content:
				'Hello! I\'m your AI design creator. Describe the design you want to create, and I\'ll generate it for you.\n\n💡 Try prompts like:\n- "A modern landing page for a tech startup"\n- "A colorful dashboard for a fitness app"\n- "A minimalist portfolio for a designer"',
			timestamp: new Date().toISOString(),
		},
	]);
	const [showRightSidebar, setShowRightSidebar] = useState(true);
	const [input, setInput] = useState("");
	const {
		generate,
		edit,
		agentEdit,
		pages,
		setPages,
		meta,
		isGenerating,
		usage,
		logs,
	} = useSimba();
	const messagesEndRef = useRef(null);
	const textareaRef = useRef(null);

	const handleSend = async () => {
		if (!input.trim() || isGenerating) return;

		const userMessage = {
			id: Date.now(),
			role: "user",
			content: input.trim(),
			timestamp: new Date().toISOString(),
		};

		setMessages((prev) => [...prev, userMessage]);
		const prompt = input.trim();
		setInput("");

		try {
			let result;
			if (Object.keys(pages).length === 0) {
				console.log("[Simba Page] Starting generation for:", prompt);
				result = await generate(prompt);
			} else {
				console.log("[Simba Page] Starting agentic edit for:", prompt);
				result = await agentEdit(prompt, pages);
			}

			const assistantMessage = {
				id: Date.now() + 1,
				role: "assistant",
				content:
					Object.keys(pages).length === 0
						? "I've generated your design! You can now use this chat to request edits."
						: "I've updated your design based on your request.",
				timestamp: new Date().toISOString(),
				usage: result?.usage || result,
			};

			setMessages((prev) => [...prev, assistantMessage]);
		} catch (error) {
			console.error("Simba Error:", error);
			const errorMessage = {
				id: Date.now() + 1,
				role: "assistant",
				content: `Sorry, I encountered an error: ${error.message}.`,
				timestamp: new Date().toISOString(),
			};
			setMessages((prev) => [...prev, errorMessage]);
			toast.error("Failed to process request");
		}
	};

	const handleKeyDown = (e) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	useEffect(() => {
		if (textareaRef.current) {
			textareaRef.current.style.height = "auto";
			textareaRef.current.style.height =
				Math.min(textareaRef.current.scrollHeight, 220) + "px";
		}
	}, [input]);

	return (
		<>
			<Head>
				<title>AI Design Creator - gettemplate</title>
				<meta name="description" content="Create stunning designs with AI" />
			</Head>
			<div className="h-screen bg-white flex flex-col overflow-hidden">
				<main className="flex-1 flex overflow-hidden">
					<div className="w-80 min-w-80 border-r border-zinc-50 flex flex-col bg-white overflow-hidden">
						<div className="flex-1 overflow-y-auto p-4 space-y-6 hidescrollbar bg-white">
							{messages.map((message) => (
								<div key={message.id} className="space-y-2">
									<div
										className={`flex items-start gap-2 ${message.role === "user" ? "justify-end" : "justify-start"}`}
									>
										{message.role === "assistant" && (
											<div className="w-6 h-6 rounded-xl bg-zinc-100 flex items-center justify-center flex-shrink-0">
												<Bot size={14} className="text-zinc-600" />
											</div>
										)}
										<div
											className={`max-w-[85%] ${message.role === "user" ? "text-right" : "text-left"}`}
										>
											<div
												className={`inline-block p-3 border border-zinc-100 rounded-xl text-[11px] leading-relaxed ${
													message.role === "user"
														? "bg-zinc-50 text-black"
														: "bg-zinc-50 text-zinc-900 "
												}`}
											>
												{message.content}
												{message.usage && (
													<div className="mt-2 pt-2 border-t border-zinc-200/50 flex flex-wrap gap-3">
														<div className="flex flex-col">
															<span className="text-[8px] font-bold text-zinc-400 uppercase tracking-wider">
																Total Tokens
															</span>
															<span className="text-[10px] font-black text-zinc-600">
																{message.usage.total?.toLocaleString() || "N/A"}
															</span>
														</div>
														<div className="flex flex-col">
															<span className="text-[8px] font-bold text-zinc-400 uppercase tracking-wider">
																Renderer
															</span>
															<span className="text-[10px] font-black text-zinc-600">
																{message.usage.renderer?.toLocaleString() ||
																	"N/A"}
															</span>
														</div>
													</div>
												)}
											</div>
										</div>
									</div>
								</div>
							))}
							{isGenerating && (
								<div className="flex items-center gap-3">
									<div className="w-6 h-6 rounded-xl bg-zinc-900 flex items-center justify-center">
										<Bot size={14} className="text-white" />
									</div>
									<div className="bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2 flex items-center gap-2 shadow-sm">
										<Loader2 size={12} className="animate-spin text-zinc-600" />
										<span className="text-[10px] font-medium text-zinc-500">
											Generating...
										</span>
									</div>
								</div>
							)}
							<div ref={messagesEndRef} />
						</div>

						<div className="p-4 bg-white">
							<div className="relative">
								<textarea
									ref={textareaRef}
									value={input}
									onChange={(e) => setInput(e.target.value)}
									onKeyDown={handleKeyDown}
									placeholder="What changes do you want to make?"
									className="w-full pl-3 pr-12 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-300 resize-none min-h-[100px] transition-all"
									disabled={isGenerating}
								/>
								<div className="absolute left-2 bottom-2 flex gap-2">
									<button className="p-1.5 text-zinc-400 hover:text-zinc-600">
										<ImageIcon size={14} />
									</button>
								</div>
								<button
									onClick={handleSend}
									disabled={!input.trim() || isGenerating}
									className="absolute right-2 bottom-2 p-2 bg-emerald-400 text-white rounded-xl hover:bg-emerald-500 disabled:opacity-50 transition-all active:scale-95"
								>
									<Send size={14} />
								</button>
							</div>
						</div>
					</div>
					{/* Main Canvas Area (Now on the left) */}
					<div className="flex-1 relative overflow-hidden bg-zinc-50">
						{isGenerating || Object.keys(pages).length > 0 ? (
							<SimbaCanvas
								pages={pages}
								setPages={setPages}
								isGenerating={isGenerating}
							/>
						) : (
							<div className="h-full w-full flex flex-col items-center justify-center text-zinc-300 gap-4">
								<div className="w-20 h-20 rounded-full bg-white flex items-center justify-center border border-zinc-100 shadow-sm animate-pulse">
									<Palette size={32} className="opacity-10" />
								</div>
								<div className="text-center">
									<p className="text-xs font-medium text-zinc-400">
										Design will appear here
									</p>
									<p className="text-[10px] text-zinc-300 mt-1">
										Describe a design in the chat to begin
									</p>
								</div>
							</div>
						)}
					</div>

					<AnimatePresence mode="wait">
						{showRightSidebar && (
							<motion.div
								initial={{ x: "100%" }}
								animate={{ x: 0 }}
								exit={{ x: 0 }}
								className="w-80 border-l border-zinc-200 flex flex-col bg-white overflow-hidden shadow-2xl relative z-30"
							>
								<div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
									<div className="flex items-center gap-2">
										<div className="w-8 h-8 rounded-xl bg-zinc-100 flex items-center justify-center">
											<Bot size={18} className="text-white" />
										</div>
										<div>
											<h2 className="text-sm font-bold text-zinc-900">
												Simba AI
											</h2>
											<p className="text-[10px] text-zinc-500 font-medium">
												Design Agent
											</p>
										</div>
									</div>
									<div className="flex gap-1">
										<button
											className="p-1.5 hover:bg-zinc-200 rounded-md text-zinc-400"
											onClick={() => {
												// close chat window
											}}
											title="Close chat"
										>
											<X size={14} />
										</button>
									</div>
								</div>

								<div className="flex-1 overflow-y-auto p-4 space-y-2 hidescrollbar bg-white">
									{logs.map((log, i) => (
										<div
											key={i}
											className={`text-[11px] p-2 rounded-xl border border-zinc-50 ${
												log.includes("✅")
													? "bg-emerald-50/20 text-zinc-400 border-emerald-100"
													: log.includes("✨")
														? "bg-blue-50/20 text-zinc-400 border-blue-100"
														: log.includes("📝")
															? "bg-orange-50 text-zinc-400 border-orange-100"
															: "bg-zinc-50 text-zinc-600"
											}`}
										>
											{log}
										</div>
									))}
									{isGenerating && (
										<div className="flex items-center gap-2 p-2 animate-pulse">
											<Loader2
												size={10}
												className="animate-spin text-zinc-400"
											/>
											<span className="text-[10px] text-zinc-400">
												Thinking...
											</span>
										</div>
									)}
									<div ref={messagesEndRef} />
								</div>

								<div className="p-4 bg-white border-t border-zinc-100">
									<div className="relative group">
										<textarea
											ref={textareaRef}
											value={input}
											onChange={(e) => setInput(e.target.value)}
											onKeyDown={handleKeyDown}
											placeholder={
												Object.keys(pages).length === 0
													? "Describe a design..."
													: "Request an edit..."
											}
											className="w-full pl-3 pr-12 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/5 resize-none min-h-[100px] transition-all"
											disabled={isGenerating}
										/>
										<div className="absolute left-2 bottom-2 flex gap-2">
											<button className="p-1.5 text-zinc-400 hover:text-zinc-600">
												<ImageIcon size={14} />
											</button>
										</div>
										<button
											onClick={handleSend}
											disabled={!input.trim() || isGenerating}
											className="absolute right-2 bottom-2 p-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 disabled:opacity-50 transition-all active:scale-95 shadow-lg shadow-orange-500/20"
										>
											<Send size={14} />
										</button>
									</div>
								</div>
							</motion.div>
						)}
					</AnimatePresence>
				</main>
			</div>
		</>
	);
};

export default AIDesignCreatorPage;
