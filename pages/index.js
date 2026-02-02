import React, { useState, useRef, useEffect } from "react";
import Head from "next/head";
import { motion } from "framer-motion";
import {
	Send,
	Loader2,
	ImageIcon,
	Palette,
	Layout,
	ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import useSimba from "../lib/hooks/useSimba";
import { onAuthStateChange } from "../lib/api/auth";
import SimbaNavbar from "../app/components/SimbaNavbar";
import { DESIGN_SYSTEMS } from "./app";
import { createApp } from "../lib/api/kixiApps";
import { decrementCredits } from "../lib/api/simbaCredits";

const HomePage = () => {
	const [input, setInput] = useState("");
	const [user, setUser] = useState(null);
	const [isCheckingAuth, setIsCheckingAuth] = useState(true);
	const { generate, pages, setPages, isGenerating, logs } = useSimba();
	const textareaRef = useRef(null);
	const router = useRouter();
	const [selectedDesignSystem, setSelectedDesignSystem] = useState(
		DESIGN_SYSTEMS[0],
	);
	const [showLoginModal, setShowLoginModal] = useState(false);

	useEffect(() => {
		const unsub = onAuthStateChange((u) => {
			setUser(u ?? null);
			setIsCheckingAuth(false);
		});
		return () => unsub?.();
	}, []);

	const handleSend = async () => {
		if (!input.trim() || isGenerating) return;

		if (!user) {
			setShowLoginModal(true);
			return;
		}

		const prompt = input.trim();
		setInput("");

		try {
			const result = await generate(prompt, selectedDesignSystem);
			if (result?.usage?.total) {
				try {
					await decrementCredits(user.uid, result.usage.total);
				} catch (e) {
					console.error("Failed to update credits:", e);
				}
			}
			if (result?.pages && Object.keys(result.pages).length > 0) {
				const appId = await createApp(user.uid, {
					name: prompt.slice(0, 80) || "Untitled App",
					pages: result.pages,
					meta: result.meta ?? null,
					designSystem: selectedDesignSystem,
				});
				router.push(`/app/${appId}`);
			}
		} catch (error) {
			console.error("Simba Error:", error);
			toast.error("Failed to process request");
		}
	};

	if (isCheckingAuth) {
		return (
			<div className="h-screen w-full flex items-center justify-center bg-white">
				<Loader2 className="w-8 h-8 animate-spin text-zinc-900" />
			</div>
		);
	}

	const handleKeyDown = (e) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	return (
		<>
			<Head>
				<title>Simba AI - Design at the speed of thought</title>
				<meta
					name="description"
					content="Generate stunning designs with AI in seconds."
				/>
			</Head>

			<div className="min-h-screen bg-white flex flex-col overflow-hidden font-sans">
				<SimbaNavbar
					loginModalOpen={showLoginModal}
					setLoginModalOpen={setShowLoginModal}
				/>

				<main className="flex-1 relative flex flex-col overflow-hidden">
					<div className="flex-1 flex flex-col items-center justify-center p-6 relative">
						{/* Hero Background Glow */}
						<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-zinc-100 rounded-full blur-[120px] opacity-50 pointer-events-none" />

						<div className="w-full max-w-3xl flex flex-col items-center gap-8 relative z-10">
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								className="text-center space-y-4"
							>
								<h1 className="text-5xl sm:text-7xl font-black tracking-tight text-zinc-900 leading-[0.9]">
									Build your next app <br />
									<span className="text-zinc-400">with Simba.</span>
								</h1>
								<p className="text-lg text-zinc-500 font-medium max-w-xl mx-auto">
									Describe your idea, and let Simba generate a complete,
									production-ready UI for you in seconds.
								</p>
							</motion.div>

							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.1 }}
								className="w-full relative group"
							>
								<div className="absolute -inset-1 bg-gradient-to-r from-zinc-200 to-zinc-100 rounded-[32px] blur opacity-25 group-focus-within:opacity-50 transition duration-1000 group-focus-within:duration-200" />
								<div className="relative bg-white border border-zinc-200 rounded-[28px] p-2 shadow-2xl shadow-zinc-200/50">
									<textarea
										ref={textareaRef}
										value={input}
										onChange={(e) => setInput(e.target.value)}
										onKeyDown={handleKeyDown}
										placeholder="Describe a dashboard, landing page, or mobile app..."
										className="w-full px-6 py-6 text-lg text-zinc-900 placeholder:text-zinc-400 bg-transparent border-none focus:outline-none focus:ring-0 resize-none min-h-[140px] transition-all"
										disabled={isGenerating}
									/>
									<div className="flex items-center justify-between px-4 pb-4 pt-2">
										<div className="flex gap-2">
											<button className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 rounded-xl transition-all">
												<ImageIcon size={20} />
											</button>
											<button className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 rounded-xl transition-all">
												<Palette size={20} />
											</button>
											<button className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 rounded-xl transition-all">
												<Layout size={20} />
											</button>
										</div>
										<button
											onClick={handleSend}
											disabled={!input.trim() || isGenerating}
											className="group flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 disabled:opacity-50 transition-all active:scale-95 shadow-xl shadow-zinc-900/20"
										>
											{isGenerating ? (
												<>
													<Loader2 size={18} className="animate-spin" />
													Generating...
												</>
											) : (
												<>
													Generate Design
													<ArrowRight
														size={18}
														className="group-hover:translate-x-1 transition-transform"
													/>
												</>
											)}
										</button>
									</div>
								</div>
							</motion.div>

							{/* Design system selection */}
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.15 }}
								className="w-full space-y-3"
							>
								<p className="text-center text-xs font-bold uppercase tracking-widest text-zinc-400">
									Design system
								</p>
								<div className="flex flex-wrap items-center justify-center gap-2">
									{DESIGN_SYSTEMS.map((ds) => (
										<button
											key={ds.id}
											type="button"
											onClick={() => setSelectedDesignSystem(ds)}
											className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all active:scale-95 border-2 ${
												selectedDesignSystem.id === ds.id
													? "bg-zinc-900 text-white border-zinc-900 shadow-lg shadow-zinc-900/20"
													: "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300 hover:text-zinc-900"
											}`}
										>
											<span
												className="w-3 h-3 rounded-full shrink-0"
												style={{ backgroundColor: ds.color }}
											/>
											{ds.name}
										</button>
									))}
								</div>
							</motion.div>

							{/* Suggestions */}
							<div className="flex flex-wrap items-center justify-center gap-2">
								{[
									"SaaS Analytics Dashboard",
									"Modern E-commerce Landing",
									"Fitness Tracker Mobile App",
									"Designer Portfolio",
								].map((suggestion) => (
									<button
										key={suggestion}
										onClick={() => setInput(suggestion)}
										className="px-4 py-2 bg-zinc-50 border border-zinc-100 rounded-full text-xs font-bold text-zinc-500 hover:bg-white hover:border-zinc-300 hover:text-zinc-900 transition-all active:scale-95 shadow-sm"
									>
										{suggestion}
									</button>
								))}
							</div>
						</div>
					</div>

					{/* Loading Overlay when generating from an empty state */}
					{isGenerating && Object.keys(pages).length === 0 && (
						<div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[100] flex flex-col items-center justify-center gap-6">
							<div className="w-16 h-16 border-4 border-zinc-100 border-t-zinc-900 rounded-full animate-spin" />
							<div className="flex flex-col items-center gap-2">
								<h2 className="text-xl font-black tracking-tight text-zinc-900">
									Simba is building your design...
								</h2>
								<div className="flex flex-col items-center">
									{logs.slice(-1).map((log, i) => (
										<motion.p
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											key={i}
											className="text-sm font-medium text-zinc-400"
										>
											{log}
										</motion.p>
									))}
								</div>
							</div>
						</div>
					)}
				</main>
			</div>
		</>
	);
};

export default HomePage;
