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
	Zap,
	Plus,
	Circle,
	Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import useSimba from "../lib/hooks/useSimba";
import SimbaNavbar from "../app/components/SimbaNavbar";

const SimbaCanvas = dynamic(() => import("../app/frontend/SimbaCanvas"), {
	ssr: false,
});
const DesignPropertiesSidebar = dynamic(
	() => import("../app/frontend/DesignPropertiesSidebar"),
	{ ssr: false },
);

/** Design system presets – shared with home page for /simba generation */
export const DESIGN_SYSTEMS = [
	{
		id: "default",
		name: "Default",
		font: "Plus Jakarta Sans",
		radius: "12px",
		color: "#6366f1",
		stroke: "1px",
		mode: "light",
	},
	{
		id: "minimal",
		name: "Minimal",
		font: "Inter",
		radius: "8px",
		color: "#18181b",
		stroke: "1px",
		mode: "light",
	},
	{
		id: "bold",
		name: "Bold",
		font: "Space Grotesk",
		radius: "16px",
		color: "#dc2626",
		stroke: "2px",
		mode: "light",
	},
	{
		id: "playful",
		name: "Playful",
		font: "Nunito",
		radius: "20px",
		color: "#16a34a",
		stroke: "1px",
		mode: "light",
	},
	{
		id: "dark",
		name: "Dark",
		font: "Plus Jakarta Sans",
		radius: "12px",
		color: "#a78bfa",
		stroke: "1px",
		mode: "dark",
	},
];

const AIDesignCreatorPage = () => {
	const textareaRef = useRef();
	const messagesEndRef = useRef(null);
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
	const [showLeftSidebar, setShowLeftSidebar] = useState(true);
	const [activeTool, setActiveTool] = useState("hand");
	const [isCreatingNewApp, setIsCreatingNewApp] = useState(false);
	const [newAppPrompt, setNewAppPrompt] = useState("");
	const [designSystem, setDesignSystem] = useState(DESIGN_SYSTEMS[0]);
	const [selectedElement, setSelectedElement] = useState(null);
	const [history, setHistory] = useState([]);

	const addToHistory = (currentPages) => {
		setHistory((prev) => [currentPages, ...prev].slice(0, 5));
	};

	const undo = () => {
		if (history.length > 0) {
			const [previousState, ...remainingHistory] = history;
			setHistory(remainingHistory);
			setPages(previousState);
			setSelectedElement(null);
			toast.success("Undo successful!");
		}
	};

	const getElementPath = (el) => {
		const path = [];
		let current = el;
		while (current && current.parentElement && current.tagName !== "BODY") {
			let index = 1;
			let sibling = current.previousElementSibling;
			while (sibling) {
				if (sibling.tagName === current.tagName) index++;
				sibling = sibling.previousElemenStSibling;
			}
			path.unshift(
				current.tagName.toLowerCase() + ":nth-of-type(" + index + ")",
			);
			current = current.parentElement;
		}
		return path.join(" > ");
	};

	const handleUpdateElement = (slug, path, updates, shouldClose = true) => {
		addToHistory(pages);
		const iframes = document.querySelectorAll("iframe");
		const targetIframe = Array.from(iframes).find((f) => f.title === slug);

		let newPath = path;
		let newRect = null;
		let newTagName = "";

		setPages((prev) => {
			const html = prev[slug];
			const parser = new DOMParser();
			const doc = parser.parseFromString(html, "text/html");
			let el = doc.querySelector(path);

			if (el) {
				if (updates.text !== undefined) el.innerText = updates.text;
				if (updates.html !== undefined) {
					if (updates.replace || el.tagName.toLowerCase() === "svg") {
						const parent = el.parentElement;
						const index = Array.from(parent.children).indexOf(el);
						el.outerHTML = updates.html;
						el = parent.children[index];
						if (el) newPath = getElementPath(el);
					} else {
						el.innerHTML = updates.html;
					}
				}
				if (updates.src !== undefined && el) el.src = updates.src;
				if (updates.style !== undefined && el) {
					Object.keys(updates.style).forEach((key) => {
						el.style.setProperty(key, updates.style[key], "important");
						if (el.tagName.toLowerCase() === "svg" && key === "color") {
							el.style.setProperty("stroke", updates.style[key], "important");
						}
					});
				}

				const newHtml = doc.documentElement.outerHTML;

				// Direct DOM update in iframe to avoid reload
				if (targetIframe && targetIframe.contentDocument) {
					let iframeEl = targetIframe.contentDocument.querySelector(path);
					if (iframeEl) {
						if (updates.text !== undefined) iframeEl.innerText = updates.text;
						if (updates.html !== undefined) {
							if (updates.replace || iframeEl.tagName.toLowerCase() === "svg") {
								const parent = iframeEl.parentElement;
								const index = Array.from(parent.children).indexOf(iframeEl);
								iframeEl.outerHTML = updates.html;
								iframeEl = parent.children[index];
							} else {
								iframeEl.innerHTML = updates.html;
							}
						}
						if (updates.src !== undefined && iframeEl)
							iframeEl.src = updates.src;
						if (updates.style !== undefined && iframeEl) {
							Object.keys(updates.style).forEach((key) => {
								iframeEl.style.setProperty(
									key,
									updates.style[key],
									"important",
								);
								if (
									iframeEl.tagName.toLowerCase() === "svg" &&
									key === "color"
								) {
									iframeEl.style.setProperty(
										"stroke",
										updates.style[key],
										"important",
									);
								}
							});
						}

						if (iframeEl) {
							newRect = iframeEl.getBoundingClientRect();
							newTagName = iframeEl.tagName.toLowerCase();
						}
					}
				}

				return { ...prev, [slug]: newHtml };
			}
			return prev;
		});

		// Update selection state outside of setPages
		if (!shouldClose && newRect) {
			setSelectedElement((curr) => {
				if (!curr || curr.slug !== slug) return curr;
				return {
					...curr,
					path: newPath,
					rect: {
						top: newRect.top,
						left: newRect.left,
						width: newRect.width,
						height: newRect.height,
					},
					info: {
						...curr.info,
						text: updates.text ?? curr.info.text,
						src: updates.src ?? curr.info.src,
						html: updates.html ?? curr.info.html,
						tagName: newTagName || curr.info.tagName,
					},
				};
			});
		}

		if (shouldClose) {
			setSelectedElement(null);
		}
		// Only toast for discrete updates, not every keystroke
		if (shouldClose) toast.success("Element updated!");
	};

	const handleDeleteElement = (slug, path) => {
		addToHistory(pages);
		setPages((prev) => {
			const html = prev[slug];
			const parser = new DOMParser();
			const doc = parser.parseFromString(html, "text/html");
			const el = doc.querySelector(path);
			if (el) {
				el.remove();
				const newHtml = doc.documentElement.outerHTML;
				return { ...prev, [slug]: newHtml };
			}
			return prev;
		});
		setSelectedElement(null);
		toast.success("Element deleted!");
	};
	const [agents, setAgents] = useState([
		{ id: "chat-1", name: "Chat 1", logs: [], input: "" },
	]);
	const [activeAgentId, setActiveAgentId] = useState("chat-1");

	// Keyboard Shortcuts
	useEffect(() => {
		const handleKeyDownGlobal = (e) => {
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
				e.preventDefault();
				setShowLeftSidebar((prev) => !prev);
			}
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "l") {
				e.preventDefault();
				setShowRightSidebar((prev) => !prev);
			}
		};
		window.addEventListener("keydown", handleKeyDownGlobal);
		return () => window.removeEventListener("keydown", handleKeyDownGlobal);
	}, []);
	const {
		generate,
		edit,
		agentEdit,
		generateVariant,
		pages,
		setPages,
		meta,
		isGenerating,
		editingSlug,
		usage,
		logs: currentLogs,
	} = useSimba();

	const [selectedSlug, setSelectedSlug] = useState(null);

	// Sync hook logs to active agent
	useEffect(() => {
		if (currentLogs.length > 0) {
			setAgents((prev) =>
				prev.map((a) =>
					a.id === activeAgentId ? { ...a, logs: currentLogs } : a,
				),
			);
		}
	}, [currentLogs, activeAgentId]);

	const activeAgent = agents.find((a) => a.id === activeAgentId) || agents[0];

	const handleSend = async () => {
		const input = activeAgent.input;
		if (!input.trim() || isGenerating) return;

		const prompt = input.trim();
		// Clear input for this agent
		setAgents((prev) =>
			prev.map((a) => (a.id === activeAgentId ? { ...a, input: "" } : a)),
		);

		try {
			if (Object.keys(pages).length === 0) {
				await generate(prompt, designSystem);
			} else {
				await agentEdit(prompt, pages, designSystem);
			}
		} catch (error) {
			console.error("Simba Error:", error);
			toast.error("Failed to process request");
		}
	};

	const handleCreateNewApp = async () => {
		if (!newAppPrompt.trim() || isGenerating) return;
		try {
			setIsCreatingNewApp(false);
			await generate(newAppPrompt.trim(), designSystem);
			setNewAppPrompt("");
		} catch (error) {
			console.error("New App Error:", error);
			toast.error("Failed to create new app");
		}
	};

	const addNewAgent = () => {
		const newId = `chat-${agents.length + 1}`;
		const newAgent = {
			id: newId,
			name: `Chat ${agents.length + 1}`,
			logs: [],
			input: "",
		};
		setAgents([...agents, newAgent]);
		setActiveAgentId(newId);
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
	}, []);

	return (
		<>
			<Head>
				<title>AI Design Creator - gettemplate</title>
				<meta name="description" content="Create stunning designs with AI" />
			</Head>
			<div className="h-screen bg-white flex flex-col overflow-hidden">
				<SimbaNavbar />
				<main className="flex-1 flex overflow-hidden relative">
					<AnimatePresence>
						{showLeftSidebar && (
							<motion.div
								initial={{ x: "-100%" }}
								animate={{ x: 0 }}
								exit={{ x: "-100%" }}
								transition={{ type: "spring", damping: 25, stiffness: 200 }}
								className="w-80 min-w-80 border-r border-zinc-100 flex flex-col bg-white overflow-hidden"
							>
								<div className="px-4 py-2 border-b border-zinc-50 bg-zinc-50/30 flex items-center justify-between">
									<h2 className="text-xs font-black uppercase tracking-widest text-zinc-400">
										Project Pages
									</h2>
									<div className="flex items-center gap-1">
										<button
											onClick={() => setIsCreatingNewApp(true)}
											className="p-1.5 hover:bg-zinc-100 rounded-xl text-zinc-600 transition-all"
											title="Create New App"
										>
											<Sparkles size={14} />
										</button>
										<button
											onClick={() => {
												const newSlug = `page-${Object.keys(pages).length + 1}`;
												setPages({
													...pages,
													[newSlug]: "<div>New Page</div>",
												});
											}}
											className="p-1.5 hover:bg-zinc-100 rounded-xl text-zinc-600 transition-all"
											title="Add New Page"
										>
											<Plus size={14} />
										</button>
									</div>
								</div>

								{isCreatingNewApp && (
									<div className="p-4 border-b border-zinc-100 bg-zinc-50/50 space-y-3">
										<div className="flex items-center justify-between">
											<span className="text-[10px] font-black uppercase tracking-widest text-zinc-900">
												Create New App
											</span>
											<button
												onClick={() => setIsCreatingNewApp(false)}
												className="p-1 hover:bg-zinc-200 rounded-full text-zinc-400"
											>
												<X size={12} />
											</button>
										</div>
										<div className="space-y-2">
											<input
												type="text"
												placeholder="Project Name..."
												className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all shadow-sm"
											/>
											<textarea
												autoFocus
												value={newAppPrompt}
												onChange={(e) => setNewAppPrompt(e.target.value)}
												placeholder="Describe your new app..."
												className="w-full p-3 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/5 resize-none min-h-[100px] transition-all shadow-sm"
											/>
										</div>
										<button
											onClick={handleCreateNewApp}
											disabled={!newAppPrompt.trim() || isGenerating}
											className="w-full py-2 bg-zinc-900 text-white rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 hover:bg-zinc-800 disabled:opacity-50 transition-all shadow-lg shadow-zinc-900/10"
										>
											{isGenerating ? (
												<Loader2 size={12} className="animate-spin" />
											) : (
												<Sparkles size={12} />
											)}
											Generate App
										</button>
									</div>
								)}

								<div className="flex-1 overflow-y-auto p-2 space-y-1 hidescrollbar">
									{Object.keys(pages).length === 0 ? (
										<div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40">
											<div className="w-12 h-12 rounded-2xl bg-zinc-50 flex items-center justify-center mb-4">
												<Layout size={24} className="text-zinc-300" />
											</div>
											<p className="text-[10px] font-bold uppercase tracking-tight text-zinc-400">
												No pages created
											</p>
										</div>
									) : (
										Object.keys(pages).map((slug) => (
											<button
												key={slug}
												className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-50 text-left transition-all group border border-transparent hover:border-zinc-100"
											>
												<div className="w-8 h-8 rounded-xl bg-zinc-100 flex items-center justify-center text-[10px] font-black text-zinc-400 group-hover:bg-white group-hover:text-zinc-900 transition-colors shadow-sm">
													{slug === "/" ? "H" : slug.charAt(0).toUpperCase()}
												</div>
												<div className="flex-1 min-w-0">
													<p className="text-xs font-bold text-zinc-900 truncate">
														{slug === "/" ? "Home" : slug}
													</p>
													<p className="text-[10px] text-zinc-400 font-medium truncate">
														{slug === "/" ? "landing" : slug}
													</p>
												</div>
												<Circle
													size={6}
													className="text-zinc-200 fill-zinc-200 group-hover:text-emerald-400 group-hover:fill-emerald-400"
												/>
											</button>
										))
									)}
								</div>

								{/* Credits and Footer */}
								<div className="p-4 border-t border-zinc-50 bg-zinc-50/20">
									<div className="bg-white border border-zinc-100 rounded-2xl p-4 shadow-sm">
										<div className="flex items-center justify-between mb-3">
											<span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
												Simba Credits
											</span>
											<Zap
												size={12}
												className="text-amber-500 fill-amber-500"
											/>
										</div>
										<div className="flex items-baseline gap-1">
											<span className="text-2xl font-black text-zinc-900">
												{((usage?.total || 0) / 1000).toFixed(1)}
											</span>
											<span className="text-xs font-bold text-zinc-400">
												Credits
											</span>
										</div>
										<div className="mt-3 w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
											<div
												className="bg-zinc-900 h-full transition-all duration-500"
												style={{
													width: `${Math.min(((usage?.total || 0) / 10000) * 100, 100)}%`,
												}}
											/>
										</div>
										<p className="mt-2 text-[9px] text-zinc-400 font-bold uppercase tracking-tight">
											{usage?.total?.toLocaleString() || 0} / 10,000 tokens used
										</p>
									</div>
								</div>
							</motion.div>
						)}
					</AnimatePresence>
					{/* Main Canvas Area (Now on the left) */}
					<div className="flex-1 relative overflow-hidden bg-zinc-50">
						{isGenerating || Object.keys(pages).length > 0 ? (
							<SimbaCanvas
								pages={pages}
								setPages={setPages}
								isGenerating={isGenerating}
								editingSlug={editingSlug}
								activeTool={activeTool}
								setActiveTool={setActiveTool}
								selectedElement={selectedElement}
								setSelectedElement={setSelectedElement}
								handleUpdateElement={handleUpdateElement}
								handleDeleteElement={handleDeleteElement}
								undo={undo}
								designSystem={designSystem}
								setDesignSystem={setDesignSystem}
								selectedSlug={selectedSlug}
								setSelectedSlug={setSelectedSlug}
								onGenerateVariant={generateVariant}
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

					<AnimatePresence>
						{showRightSidebar && (
							<motion.div
								initial={{ x: "100%" }}
								animate={{ x: 0 }}
								exit={{ x: "100%" }}
								transition={{ type: "spring", damping: 25, stiffness: 200 }}
								className="flex h-full overflow-hidden"
							>
								{activeTool === "cursor" && selectedElement ? (
									<DesignPropertiesSidebar
										element={selectedElement}
										onUpdate={(updates, shouldClose) =>
											handleUpdateElement(
												selectedElement.slug,
												selectedElement.path,
												updates,
												shouldClose,
											)
										}
										onDelete={() =>
											handleDeleteElement(
												selectedElement.slug,
												selectedElement.path,
											)
										}
										onClose={() => setSelectedElement(null)}
									/>
								) : (
									<div className="w-96 border-l border-zinc-200 flex flex-col bg-white overflow-hidden shadow-2xl relative z-30">
										{/* Agent Tabs */}
										<div className="flex items-center bg-zinc-50/50 border-b border-zinc-100 h-8">
											<div className="flex-1 flex items-center overflow-x-auto hidescrollbar h-full">
												{agents.map((agent) => (
													<div
														key={agent.id}
														className={`flex items-center h-full border-r border-zinc-100 group relative ${
															activeAgentId === agent.id
																? "bg-white"
																: "bg-transparent"
														}`}
													>
														<button
															onClick={() => setActiveAgentId(agent.id)}
															className={`px-4 h-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all ${
																activeAgentId === agent.id
																	? "text-zinc-900"
																	: "text-zinc-400 hover:text-zinc-600"
															}`}
														>
															{agent.name}
														</button>
														{agents.length > 1 && (
															<button
																onClick={(e) => {
																	e.stopPropagation();
																	setAgents(
																		agents.filter((a) => a.id !== agent.id),
																	);
																	if (activeAgentId === agent.id) {
																		setActiveAgentId(agents[0].id);
																	}
																}}
																className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-0.5 hover:bg-zinc-100 rounded text-zinc-400 transition-all"
															>
																<X size={10} />
															</button>
														)}
													</div>
												))}
											</div>
											<button
												onClick={addNewAgent}
												className="px-3 h-full text-zinc-400 hover:text-zinc-900 border-l border-zinc-100 bg-zinc-50/50 flex items-center justify-center transition-colors"
												title="New Chat"
											>
												<Plus size={14} />
											</button>
										</div>

										<div className="flex-1 overflow-y-auto p-4 space-y-2 hidescrollbar bg-white">
											{activeAgent.logs.length === 0 && (
												<div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40">
													<div className="w-12 h-12 rounded-2xl bg-zinc-50 flex items-center justify-center mb-4">
														<Bot size={24} className="text-zinc-300" />
													</div>
													<p className="text-[10px] font-bold uppercase tracking-tight text-zinc-400">
														Start a new conversation
													</p>
												</div>
											)}
											{activeAgent.logs.map((log, i) => (
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
										</div>

										<div className="p-4 bg-white border-t border-zinc-100">
											<div className="relative group">
												<textarea
													ref={textareaRef}
													value={activeAgent.input}
													onChange={(e) =>
														setAgents((prev) =>
															prev.map((a) =>
																a.id === activeAgentId
																	? { ...a, input: e.target.value }
																	: a,
															),
														)
													}
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
													disabled={!activeAgent.input.trim() || isGenerating}
													className="absolute right-2 bottom-2 p-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 disabled:opacity-50 transition-all active:scale-95 shadow-lg shadow-orange-500/20"
												>
													<Send size={14} />
												</button>
											</div>
										</div>
									</div>
								)}
							</motion.div>
						)}
					</AnimatePresence>
				</main>
			</div>
		</>
	);
};

export default AIDesignCreatorPage;
