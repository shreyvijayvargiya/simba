import { useState } from "react";
import { executeHtmlAction } from "../utils/htmlActions";
import { toast } from "sonner";

export default function useSimba() {
	const [pages, setPages] = useState({});
	const [meta, setMeta] = useState(null);
	const [isGenerating, setIsGenerating] = useState(false);
	const [usage, setUsage] = useState(null);
	const [logs, setLogs] = useState([]);

	const agentEdit = async (prompt, currentPages) => {
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
					// 1. Better slug detection
					const slug =
						action.slug ||
						result.slug ||
						action.target?.page ||
						(Object.keys(pages).length === 1 ? Object.keys(pages)[0] : "index");

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
				} else if (result.intentType === "REGENERATE") {
					setLogs((prev) => [...prev, `⚠️ ${result.message}`]);
					toast.error(result.message);
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
								} else if (currentEvent === "page") {
									setLogs((prev) => [...prev, `📝 Updated page: ${data.slug}`]);
									setPages((prev) => ({
										...prev,
										[data.slug]: data.html,
									}));
								} else if (currentEvent === "done") {
									setLogs((prev) => [...prev, "✅ Edit Complete"]);
									setUsage(data.usage);
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
		}
	};

	const generate = async (prompt) => {
		setIsGenerating(true);
		setPages({});
		setMeta(null);
		setUsage(null);

		let finalUsage = null;

		try {
			const response = await fetch("http://localhost:3002/simba", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					prompt,
					designSystem: {
						font: "Plus Jakarta Sans",
						radius: "rounded-none",
						color: "indigo",
						stroke: "border",
						mode: "light",
					},
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
								setMeta(data);
							} else if (currentEvent === "page") {
								setPages((prev) => ({
									...prev,
									[data.slug]: data.html,
								}));
							} else if (currentEvent === "done") {
								finalUsage = data.usage;
								setUsage(data.usage);
								setIsGenerating(false);
							}
						} catch (e) {
							console.error("Error parsing JSON line:", e, dataStr);
						}
					}
				}
			}
			return finalUsage;
		} catch (error) {
			console.error("Simba Hook Error:", error);
			setIsGenerating(false);
			return null;
		}
	};

	const edit = async (userPrompt, currentPages) => {
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
					designSystem: {
						font: "Plus Jakarta Sans",
						radius: "rounded-2xl",
						color: "zinc",
						stroke: "border",
						mode: "light",
					},
				}),
			});

			if (!response.ok) throw new Error("Failed to connect to edit API");

			const contentType = response.headers.get("content-type");

			// 1. Handle JSON Response (ACTION)
			if (contentType?.includes("application/json")) {
				const result = await response.json();
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
									setUsage(data.usage);
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

	return {
		generate,
		edit,
		agentEdit,
		pages,
		setPages,
		meta,
		isGenerating,
		usage,
		logs,
	};
}
