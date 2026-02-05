import { useState } from "react";
import { executeHtmlAction } from "../utils/htmlActions";
import { toast } from "sonner";



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
			const response = await fetch("http://localhost:3003/agent-edit", {
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
		let summary = null;
		let next_updates = null;
		const accumulatedPages = {};

		try {
			const response = await fetch("http://localhost:3003/simba", {
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
								summary = data.summary;
								next_updates = data.next_updates;
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
			return {
				usage: finalUsage,
				pages: accumulatedPages,
				meta: finalMeta,
				summary: summary,
				next_updates: next_updates,
			};
		} catch (error) {
			console.error("Simba Hook Error:", error);
			setIsGenerating(false);
			return null;
		}
	};

	const edit = async (userPrompt, currentPages, designSystem) => {
		setIsGenerating(true);

		try {
			const response = await fetch("http://localhost:3003/edit", {
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
			const response = await fetch("http://localhost:3003/generate-variant", {
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

	const getTemplates = async () => {
		const response = await fetch("http://localhost:3003/get-templates", {
			method: "GET",
		});
		const data = await response.json();
		return data;
	};

	return {
		generate,
		getTemplates,
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
