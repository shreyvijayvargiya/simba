import { useState } from "react";
import { executeHtmlAction } from "../utils/htmlActions";
import { toast } from "sonner";

const DEFAULT_PAGES = {
	index: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Business Success Landing Page</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gradient-to-br from-zinc-50 to-zinc-100">
    <!-- HEADER SECTION -->
    <nav class="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-zinc-100 px-6 py-4">
        <div class="max-w-7xl mx-auto flex justify-between items-center">
            <div class="flex items-center gap-2 font-black text-2xl tracking-tighter">
                <div class="w-8 h-8 bg-zinc-900 rounded-xl"></div>
                SIMBA
            </div>
            <div class="hidden md:flex gap-8 items-center text-sm font-bold text-zinc-500">
                <a href="#" class="text-zinc-900 hover:text-zinc-600 transition-colors">Product</a>
                <a href="#" class="hover:text-zinc-900 transition-colors">Solutions</a>
                <a href="#" class="hover:text-zinc-900 transition-colors">Pricing</a>
            </div>
            <div class="flex items-center gap-4">
                <button class="text-sm font-bold text-zinc-900 px-4 py-2">Sign In</button>
                <button class="bg-zinc-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-zinc-200 hover:bg-zinc-800 transition-all">Get Started</button>
            </div>
        </div>
    </nav>

    <!-- HERO SECTION -->
    <div class="min-h-screen flex items-center justify-center px-4 bg-zinc-100">
        <div class="max-w-4xl mx-auto text-center">
            <img src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzMzc1MTV8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHN1Y2Nlc3N8ZW58MHwwfHx8MTc2OTk4NzYzOXww&ixlib=rb-4.1.0&q=80&w=1080" alt="man in white dress shirt sitting beside woman in black long sleeve shirt" class="w-full h-auto rounded-xl mb-8">
            <h1 class="text-5xl md:text-6xl font-bold text-gray-900 mb-6">Transform Your Business Today</h1>
            <p class="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">The all-in-one solution to streamline your workflow and boost productivity by 10x</p>
            <div class="flex gap-4 justify-center flex-wrap">
                <button class="bg-zinc-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-zinc-700 transition">Get Started Free</button>
                <button class="border-2 border-zinc-600 text-zinc-600 px-8 py-4 rounded-xl font-semibold hover:bg-zinc-50 transition">Watch Demo</button>
            </div>
        </div>
    </div>

    <!-- FEATURES SECTION -->
    <div class="py-20 bg-white">
        <div class="max-w-6xl mx-auto px-4">
            <h2 class="text-4xl font-bold text-center mb-12">Why Choose Us</h2>
            <div class="grid md:grid-cols-3 gap-8">
                <div class="text-center p-6">
                    <div class="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <img src="https://unpkg.com/lucide-static@latest/icons/signal.svg" class="w-8 h-8 text-zinc-600" />
                    </div>
                    <h3 class="text-xl font-semibold mb-2">Lightning Fast</h3>
                    <p class="text-gray-600">Optimized performance for seamless experience</p>
                </div>
                <div class="text-center p-6">
                    <div class="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <img src="https://unpkg.com/lucide-static@latest/icons/shield.svg" class="w-8 h-8 text-zinc-600" />
                    </div>
                    <h3 class="text-xl font-semibold mb-2">Secure</h3>
                    <p class="text-gray-600">Enterprise-grade security for your data</p>
                </div>
                <div class="text-center p-6">
                    <div class="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <img src="https://unpkg.com/lucide-static@latest/icons/cloud.svg" class="w-8 h-8 text-zinc-600" />
                    </div>
                    <h3 class="text-xl font-semibold mb-2">Cloud Based</h3>
                    <p class="text-gray-600">Access anywhere, anytime from any device</p>
                </div>
            </div>
            <img src="https://images.unsplash.com/photo-1730768805915-45ac3968ef95?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzMzc1MTV8MHwxfHNlYXJjaHwxfHxmZWF0dXJlJTIwZ3JpZCUyMGRpc3BsYXl8ZW58MHwwfHx8MTc2OTk4NzYzOXww&ixlib=rb-4.1.0&q=80&w=1080" alt="A building that has many windows and a clock on it" class="w-full h-auto rounded-xl mt-12">
        </div>
    </div>

    <!-- TESTIMONIALS SECTION -->
    <div class="py-20 bg-zinc-100">
        <div class="max-w-6xl mx-auto px-4">
            <h2 class="text-4xl font-bold text-center mb-12">What Our Clients Say</h2>
            <div class="flex overflow-x-auto">
                <div class="flex-shrink-0 w-3/4 mx-auto">
                    <img src="https://images.unsplash.com/photo-1600456899121-68eda5705257?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzMzc1MTV8MHwxfHNlYXJjaHwxfHxjdXN0b21lciUyMHRlc3RpbW9uaWFsc3xlbnwwfDB8fHwxNzY5OTg3NjM5fDA&ixlib=rb-4.1.0&q=80&w=1080" alt="white wall with black shadow" class="w-full h-auto rounded-xl mb-8">
                    <p class="text-gray-700 italic">"Their service has transformed our workflow. We couldn't be happier!"</p>
                    <p class="text-gray-500 font-bold">- Jane Doe</p>
                </div>
            </div>
        </div>
    </div>

    <!-- FOOTER SECTION -->
    <footer class="py-6 bg-white">
        <div class="max-w-6xl mx-auto px-4 flex justify-between items-center">
            <div>
                <img src="https://images.unsplash.com/photo-1722778610400-3f4a01ec3122?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzMzc1MTV8MHwxfHNlYXJjaHwxfHxmb290ZXIlMjBkZXNpZ258ZW58MHwwfHx8MTc2OTk4MjU5NXww&ixlib=rb-4.1.0&q=80&w=1080" alt="A computer generated image of a circular object" class="h-6 w-6">
                <small class="text-gray-600">© 2023 Business Success. All rights reserved.</small>
            </div>
            <div class="flex gap-4">
                <a href="#" class="text-zinc-600 hover:text-zinc-900 transition-all">Privacy Policy</a>
                <a href="#" class="text-zinc-600 hover:text-zinc-900 transition-all">Terms of Service</a>
            </div>
        </div>
    </footer>
</body>
</html>`,
};

export default function useSimba(initialState, options = {}) {
	const { onUsage, onDesignSystemChange } = options;
	const [pages, setPages] = useState(
		initialState?.pages && Object.keys(initialState.pages).length > 0
			? initialState.pages
			: {},
	);
	const [meta, setMeta] = useState(initialState?.meta ?? null);
	const [isGenerating, setIsGenerating] = useState(false);
	const [usage, setUsage] = useState(null);
	const [logs, setLogs] = useState([]);
	const [editingSlug, setEditingSlug] = useState(null);

	const agentEdit = async (prompt, currentPages, designSystem, targetSlug) => {
		setIsGenerating(true);
		setLogs((prev) => [...prev, `Analyzing: ${prompt}`]);

		try {
			const response = await fetch("http://localhost:3002/agent-edit", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					prompt,
					currentAppContext: {
						intent: meta?.intent || "Editing existing app",
						pages: currentPages,
					},
					designSystem,
					targetSlug: targetSlug || null,
				}),
			});

			const contentType = response.headers.get("content-type");

			// CASE 1: Deterministic Action or Regeneration Required (JSON)
			if (contentType?.includes("application/json")) {
				const result = await response.json();
				if (result.intentType === "ACTION") {
					setLogs((prev) => [
						...prev,
						`✅ Action Found: ${result.actionReasoning}`,
					]);

					const action = result.action;
					const actionType = action?.type?.toUpperCase?.() || "";

					// Theme/design system update from agent (e.g. "change theme to indigo")
					if (
						actionType === "UPDATE_DESIGN_SYSTEM" ||
						actionType === "UPDATE_THEME" ||
						action?.designSystem
					) {
						const updates =
							action.payload ||
							action.designSystem ||
							(action.color ? { color: action.color } : action);
						if (updates && typeof updates === "object") {
							onDesignSystemChange?.(updates);
						}
					} else {
						// HTML action
						const slug =
							action.slug ||
							result.slug ||
							action.target?.page ||
							(Object.keys(pages).length === 1
								? Object.keys(pages)[0]
								: "index");

						setPages((prev) => {
							const currentHtml = prev[slug];
							if (!currentHtml) {
								console.warn(
									`Page slug "${slug}" not found in current pages:`,
									Object.keys(prev),
								);
								return prev;
							}

							const updatedHtml = executeHtmlAction(currentHtml, action);
							return {
								...prev,
								[slug]: updatedHtml,
							};
						});
					}
				} else if (result.intentType === "REGENERATE") {
					setLogs((prev) => [...prev, `⚠️ ${result.message}`]);
					toast.error(result.message);
				}
				if (result.usage) {
					setUsage(result.usage);
					onUsage?.(result.usage);
				}
				if (result.designSystem) {
					onDesignSystemChange?.(result.designSystem);
				}
				setIsGenerating(false);
				return result;
			}

			// CASE 2: Surgical AI Edit (SSE Stream)
			if (response.body) {
				const reader = response.body.getReader();
				const decoder = new TextDecoder();
				let buffer = "";
				let currentEvent = "";

				while (true) {
					const { value, done } = await reader.read();
					if (done) break;

					buffer += decoder.decode(value, { stream: true });
					const lines = buffer.split("\n");
					buffer = lines.pop() || "";

					for (const line of lines) {
						const trimmed = line.trim();
						if (!trimmed) continue;

						if (trimmed.startsWith("event:")) {
							currentEvent = trimmed.replace("event:", "").trim();
						} else if (trimmed.startsWith("data:")) {
							try {
								const data = JSON.parse(trimmed.replace("data:", "").trim());
								if (currentEvent === "meta") {
									setLogs((prev) => [...prev, `✨ Plan: ${data.reasoning}`]);
									if (data.slug) setEditingSlug(data.slug);
								} else if (currentEvent === "page") {
									setLogs((prev) => [...prev, `📝 Updated page: ${data.slug}`]);
									setPages((prev) => ({
										...prev,
										[data.slug]: data.html,
									}));
								} else if (currentEvent === "done") {
									setLogs((prev) => [...prev, "✅ Edit Complete"]);
									if (data.usage) {
										setUsage(data.usage);
										onUsage?.(data.usage);
									}
									if (data.designSystem) {
										onDesignSystemChange?.(data.designSystem);
									}
								} else if (currentEvent === "designSystem") {
									if (data.designSystem) {
										onDesignSystemChange?.(data.designSystem);
									}
								}
							} catch (e) {
								console.error("Error parsing SSE data:", e);
							}
						}
					}
				}
			}
		} catch (error) {
			console.error("Edit failed:", error);
			setLogs((prev) => [...prev, "❌ Error occurred"]);
		} finally {
			setIsGenerating(false);
			setEditingSlug(null);
		}
	};

	const generate = async (prompt, designSystem) => {
		setIsGenerating(true);
		setPages({});
		setMeta(null);
		setUsage(null);

		let finalUsage = null;
		let finalMeta = null;
		const accumulatedPages = {};

		try {
			const response = await fetch("http://localhost:3002/simba", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					prompt,
					designSystem,
				}),
			});

			if (!response.ok) {
				throw new Error(`API Error: ${response.status}`);
			}

			if (!response.body) return null;

			const reader = response.body.getReader();
			const decoder = new TextDecoder();
			let buffer = "";
			let currentEvent = "";

			while (true) {
				const { value, done } = await reader.read();
				if (done) break;

				buffer += decoder.decode(value, { stream: true });
				const lines = buffer.split("\n");
				buffer = lines.pop() || "";

				for (const line of lines) {
					const trimmedLine = line.trim();
					if (!trimmedLine) continue;

					if (trimmedLine.startsWith("event:")) {
						currentEvent = trimmedLine.replace("event:", "").trim();
					} else if (trimmedLine.startsWith("data:")) {
						const dataStr = trimmedLine.replace("data:", "").trim();
						if (!dataStr) continue;

						try {
							const data = JSON.parse(dataStr);
							if (currentEvent === "meta") {
								finalMeta = data;
								setMeta(data);
							} else if (currentEvent === "page") {
								accumulatedPages[data.slug] = data.html;
								setPages((prev) => ({
									...prev,
									[data.slug]: data.html,
								}));
							} else if (currentEvent === "done") {
								finalUsage = data.usage;
								setUsage(data.usage);
								setIsGenerating(false);
								if (data.usage) onUsage?.(data.usage);
							}
						} catch (e) {
							console.error("Error parsing JSON line:", e, dataStr);
						}
					}
				}
			}
			return { usage: finalUsage, pages: accumulatedPages, meta: finalMeta };
		} catch (error) {
			console.error("Simba Hook Error:", error);
			setIsGenerating(false);
			return null;
		}
	};

	const edit = async (userPrompt, currentPages, designSystem) => {
		setIsGenerating(true);

		try {
			const response = await fetch("http://localhost:3002/edit", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					prompt: userPrompt,
					currentAppContext: {
						intent: "Editing existing app",
						pages: currentPages,
					},
					designSystem,
				}),
			});

			if (!response.ok) throw new Error("Failed to connect to edit API");

			const contentType = response.headers.get("content-type");

			// 1. Handle JSON Response (ACTION)
			if (contentType?.includes("application/json")) {
				const result = await response.json();
				if (result.usage) {
					setUsage(result.usage);
					onUsage?.(result.usage);
				}
				setIsGenerating(false);
				if (result.intentType === "ACTION") {
					console.log("Action performed:", result.action);
					return { type: "action", data: result.action };
				}
				return { type: "json", data: result };
			}

			// 2. Handle SSE Stream (AI_EDIT)
			const reader = response.body?.getReader();
			const decoder = new TextDecoder();
			if (!reader) {
				setIsGenerating(false);
				return null;
			}

			let buffer = "";
			let currentEvent = "";
			let finalUsage = null;

			while (true) {
				const { value, done } = await reader.read();
				if (done) break;

				buffer += decoder.decode(value, { stream: true });
				const lines = buffer.split("\n");
				buffer = lines.pop() || "";

				for (const line of lines) {
					const trimmedLine = line.trim();
					if (!trimmedLine) continue;

					if (trimmedLine.startsWith("event:")) {
						currentEvent = trimmedLine.replace("event:", "").trim();
					} else if (trimmedLine.startsWith("data:")) {
						const dataStr = trimmedLine.replace("data:", "").trim();
						if (!dataStr) continue;

						try {
							const data = JSON.parse(dataStr);
							switch (currentEvent) {
								case "meta":
									console.log("Edit Scope:", data.scope);
									break;
								case "page":
									setPages((prev) => ({
										...prev,
										[data.slug]: data.html,
									}));
									break;
								case "error":
									console.error(`Error on page ${data.slug}:`, data.error);
									break;
								case "done":
									finalUsage = data.usage;
									if (data.usage) {
										setUsage(data.usage);
										onUsage?.(data.usage);
									}
									setIsGenerating(false);
									break;
							}
						} catch (e) {
							console.error("Error parsing Edit JSON line:", e, dataStr);
						}
					}
				}
			}
			return { type: "stream", usage: finalUsage };
		} catch (error) {
			console.error("Edit failed:", error);
			setIsGenerating(false);
			return null;
		}
	};

	const generateVariant = async (
		slug,
		currentHtml,
		variantName,
		designSystem,
	) => {
		setIsGenerating(true);
		setEditingSlug(slug);
		setLogs((prev) => [...prev, `Applying variant: ${variantName}`]);

		try {
			const response = await fetch("http://localhost:3002/generate-variant", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					html: currentHtml,
					variant: variantName,
					designSystem,
				}),
			});

			if (!response.ok) throw new Error("Failed to generate variant");

			if (response.body) {
				const reader = response.body.getReader();
				const decoder = new TextDecoder();
				let buffer = "";
				let currentEvent = "";

				while (true) {
					const { value, done } = await reader.read();
					if (done) break;

					buffer += decoder.decode(value, { stream: true });
					const lines = buffer.split("\n");
					buffer = lines.pop() || "";

					for (const line of lines) {
						const trimmed = line.trim();
						if (!trimmed) continue;

						if (trimmed.startsWith("event:")) {
							currentEvent = trimmed.replace("event:", "").trim();
						} else if (trimmed.startsWith("data:")) {
							try {
								const data = JSON.parse(trimmed.replace("data:", "").trim());
								if (currentEvent === "meta") {
									setLogs((prev) => [...prev, `✨ Plan: ${data.reasoning}`]);
								} else if (currentEvent === "page") {
									setPages((prev) => ({
										...prev,
										[data.slug || slug]: data.html,
									}));
									setLogs((prev) => [
										...prev,
										`✅ Variant ${variantName} applied to ${data.slug || slug}`,
									]);
								} else if (currentEvent === "done") {
									if (data.usage) {
										setUsage(data.usage);
										onUsage?.(data.usage);
									}
									setIsGenerating(false);
								}
							} catch (e) {
								console.error("Error parsing SSE data:", e);
							}
						}
					}
				}
			}
		} catch (error) {
			console.error("Variant Error:", error);
			setLogs((prev) => [...prev, "❌ Failed to apply variant"]);
			toast.error("Failed to apply design variant");
		} finally {
			setIsGenerating(false);
			setEditingSlug(null);
		}
	};

	return {
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
		logs,
	};
}
