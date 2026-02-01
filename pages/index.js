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

const SimbaCanvas = dynamic(() => import("../app/frontend/SimbaCanvas"), {
	ssr: false,
});

const HomePage = () => {
	const [input, setInput] = useState("");
	const [user, setUser] = useState(null);
	const [isCheckingAuth, setIsCheckingAuth] = useState(true);
	const { generate, pages, setPages, isGenerating, logs } = useSimba();
	const textareaRef = useRef(null);
	const router = useRouter();

	useEffect(() => {
		const unsubscribe = onAuthStateChange((currentUser) => {
			setUser(currentUser);
			setIsCheckingAuth(false);
			if (currentUser) {
				router.push("/app");
			}
		});
		return () => unsubscribe();
	}, [router]);

	const handleSend = async () => {
		if (!input.trim() || isGenerating) return;

		if (!user) {
			// Instead of manual modal state, the navbar will handle login
			// But for handleSend we still need auth check
			toast.error("Please sign in first");
			return;
		}

		const prompt = input.trim();
		setInput("");

		try {
			await generate(prompt);
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
				<SimbaNavbar />

				<main className="flex-1 relative flex flex-col overflow-hidden">
					{Object.keys(pages).length > 0 ? (
						<div className="flex-1 relative overflow-hidden bg-zinc-50">
							<SimbaCanvas
								pages={pages}
								setPages={setPages}
								isGenerating={isGenerating}
							/>
						</div>
					) : (
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
					)}

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
