import React, { useEffect, useRef, useState, useMemo } from "react";
import {
	MousePointer2,
	Hand,
	RotateCcw,
	Minus,
	Plus,
	Copy,
	Monitor,
	Smartphone,
	Code,
	Download,
	MoreHorizontal,
	Trash2,
	Layers,
	FileCode,
	Palette,
	Type,
	Image as ImageIcon,
	Sparkles,
	Check,
	X,
	Upload,
	Smile,
} from "lucide-react";
import {
	TransformWrapper,
	TransformComponent,
	useControls,
} from "react-zoom-pan-pinch";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import IconsSelectorDropdown from "../../lib/ui/IconsSelectorDropdown";
import Icons from "../../lib/hooks/allIcons";
import { renderToStaticMarkup } from "react-dom/server";

const THEMES = [
	{ name: "Indigo", color: "#6366f1" },
	{ name: "Emerald", color: "#10b981" },
	{ name: "Rose", color: "#f43f5e" },
	{ name: "Amber", color: "#f59e0b" },
	{ name: "Zinc", color: "#18181b" },
	{ name: "Sky", color: "#0ea5e9" },
];

const COLORS = [
	{ name: "Zinc", value: "#18181b" },
	{ name: "White", value: "#ffffff" },
	{ name: "Slate", value: "#64748b" },
	{ name: "Red", value: "#ef4444" },
	{ name: "Blue", value: "#3b82f6" },
	{ name: "Emerald", value: "#10b981" },
	{ name: "Amber", value: "#f59e0b" },
	{ name: "Indigo", value: "#6366f1" },
	{ name: "Rose", value: "#f43f5e" },
	{ name: "Purple", value: "#a855f7" },
];

const SelectionToolbar = ({ element, onUpdate, onDelete, onClose }) => {
	const [activeAction, setActiveAction] = useState(null); // 'text' | 'image' | 'color' | 'icon'
	const [tempText, setTempText] = useState(element.info.text);
	const [tempSrc, setTempSrc] = useState(element.info.src || "");
	const [imagePreview, setImagePreview] = useState(null);
	const fileInputRef = useRef(null);

	// Sync local state with element info when it changes
	useEffect(() => {
		setTempText(element.info.text);
		setTempSrc(element.info.src || "");
		setImagePreview(null);
	}, [element.info]);

	const { rect, info } = element;

	const handleImageUpload = (e) => {
		const file = e.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				setImagePreview(reader.result);
				setTempSrc(reader.result);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleIconSelect = (iconName) => {
		const IconComponent = Icons[iconName];
		if (IconComponent) {
			try {
				// Ensure the icon has currentColor so our style updates work
				const svgString = renderToStaticMarkup(
					<IconComponent size={24} stroke="currentColor" />,
				);
				onUpdate(
					{
						html: svgString,
						replace: true,
					},
					false,
				);
				setActiveAction(null);
			} catch (err) {
				console.error("Failed to render icon:", err);
				toast.error("Failed to change icon");
			}
		}
	};

	return (
		<div
			className="absolute z-[100] flex flex-col items-center gap-2 pointer-events-auto"
			style={{
				top: rect.top - 10,
				left: rect.left + rect.width / 2,
				transform: "translate(-50%, -100%)",
			}}
		>
			<div className="bg-white/95 backdrop-blur-md border border-zinc-200 shadow-2xl rounded-xl p-1.5 flex items-center gap-1 whitespace-nowrap">
				<div className="px-2 py-1 text-[10px] font-bold text-zinc-400 uppercase tracking-tight border-r border-zinc-100 mr-1">
					{info.tagName}
				</div>

				<button
					onClick={() =>
						setActiveAction(activeAction === "text" ? null : "text")
					}
					className={`p-1.5 rounded-xl transition-all ${activeAction === "text" ? "bg-zinc-100 text-zinc-900" : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"}`}
					title="Edit Text"
				>
					<Type size={14} />
				</button>

				{info.tagName === "img" && (
					<button
						onClick={() =>
							setActiveAction(activeAction === "image" ? null : "image")
						}
						className={`p-1.5 rounded-xl transition-all ${activeAction === "image" ? "bg-zinc-100 text-zinc-900" : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"}`}
						title="Replace Image"
					>
						<ImageIcon size={14} />
					</button>
				)}

				<button
					onClick={() =>
						setActiveAction(activeAction === "icon" ? null : "icon")
					}
					className={`p-1.5 rounded-xl transition-all ${activeAction === "icon" ? "bg-zinc-100 text-zinc-900" : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"}`}
					title="Change Icon"
				>
					<Smile size={14} />
				</button>

				<button
					onClick={() =>
						setActiveAction(activeAction === "color" ? null : "color")
					}
					className={`p-1.5 rounded-xl transition-all ${activeAction === "color" ? "bg-zinc-100 text-zinc-900" : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"}`}
					title="Text Color"
				>
					<Palette size={14} />
				</button>

				<div className="w-px h-4 bg-zinc-100 mx-0.5" />

				<button
					onClick={() => onDelete()}
					className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
					title="Delete"
				>
					<Trash2 size={14} />
				</button>
			</div>

			{activeAction === "text" && (
				<motion.div
					initial={{ opacity: 0, scale: 0.95, y: 5 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					className="bg-white border border-zinc-200 shadow-xl rounded-xl p-2 flex gap-2 items-center min-w-[300px]"
				>
					<input
						autoFocus
						className="flex-1 text-xs px-2 py-1 border border-zinc-200 rounded-md outline-none focus:border-blue-500"
						value={tempText}
						onChange={(e) => setTempText(e.target.value)}
						onKeyDown={(e) => e.key === "Enter" && onUpdate({ text: tempText })}
					/>
					<button
						onClick={() => onUpdate({ text: tempText })}
						className="p-1 bg-zinc-100 text-black rounded-md hover:bg-zinc-200"
					>
						<Check size={14} />
					</button>
					<button
						onClick={() => setActiveAction(null)}
						className="p-1 text-zinc-400 hover:text-zinc-600"
					>
						<X size={14} />
					</button>
				</motion.div>
			)}

			{activeAction === "image" && (
				<motion.div
					initial={{ opacity: 0, scale: 0.95, y: 5 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					className="bg-white border border-zinc-200 shadow-xl rounded-xl p-3 flex flex-col gap-3 min-w-[300px]"
				>
					<div className="flex gap-2 items-center">
						<input
							autoFocus
							placeholder="Image URL..."
							className="flex-1 text-xs px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-blue-500"
							value={tempSrc}
							onChange={(e) => setTempSrc(e.target.value)}
							onKeyDown={(e) => e.key === "Enter" && onUpdate({ src: tempSrc })}
						/>
						<button
							onClick={() => fileInputRef.current?.click()}
							className="p-2 bg-zinc-100 text-zinc-600 rounded-xl hover:bg-zinc-200"
							title="Upload from computer"
						>
							<Upload size={14} />
						</button>
						<input
							type="file"
							ref={fileInputRef}
							className="hidden"
							accept="image/*"
							onChange={handleImageUpload}
						/>
					</div>

					{imagePreview && (
						<div className="relative w-full aspect-video rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200">
							<img
								src={imagePreview}
								alt="Preview"
								className="w-full h-full object-contain"
							/>
							<button
								onClick={() => {
									setImagePreview(null);
									setTempSrc(element.info.src || "");
								}}
								className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full hover:bg-black/70"
							>
								<X size={12} />
							</button>
						</div>
					)}

					<div className="flex justify-end gap-2">
						<button
							onClick={() => setActiveAction(null)}
							className="px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-700"
						>
							Cancel
						</button>
						<button
							onClick={() => onUpdate({ src: tempSrc })}
							className="px-3 py-1.5 bg-zinc-900 text-white text-xs font-bold rounded-xl hover:bg-zinc-800 flex items-center gap-1"
						>
							<Check size={14} /> Update Image
						</button>
					</div>
				</motion.div>
			)}

			{activeAction === "color" && (
				<motion.div
					initial={{ opacity: 0, scale: 0.95, y: 5 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					className="bg-white border border-zinc-200 shadow-xl rounded-xl p-2 grid grid-cols-5 gap-2"
				>
					{COLORS.map((c) => (
						<button
							key={c.name}
							onClick={() => onUpdate({ style: { color: c.value } }, false)}
							className="w-6 h-6 rounded-full border border-zinc-200 transition-transform hover:scale-110"
							style={{ backgroundColor: c.value }}
							title={c.name}
						/>
					))}
				</motion.div>
			)}

			{activeAction === "icon" && (
				<motion.div
					initial={{ opacity: 0, scale: 0.95, y: 5 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					className="z-[110]"
				>
					<IconsSelectorDropdown
						onSelect={handleIconSelect}
						onClose={() => setActiveAction(null)}
					/>
				</motion.div>
			)}
		</div>
	);
};

const CanvasControls = ({
	scale,
	pages,
	viewMode,
	setViewMode,
	activeTheme,
	setTheme,
	activeTool,
	setActiveTool,
}) => {
	const { zoomIn, zoomOut, resetTransform } = useControls();
	const [showThemes, setShowThemes] = useState(false);

	return (
		<div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-50 pointer-events-auto scale-110">
			<AnimatePresence>
				{showThemes && (
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 10 }}
						className="bg-white/90 backdrop-blur-md border border-zinc-200 rounded-2xl p-2 flex gap-2 shadow-xl mb-2"
					>
						{THEMES.map((t) => (
							<button
								key={t.name}
								onClick={() => setTheme(t)}
								className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${activeTheme.name === t.name ? "border-zinc-900" : "border-transparent"}`}
								style={{ backgroundColor: t.color }}
								title={t.name}
							/>
						))}
					</motion.div>
				)}
			</AnimatePresence>

			<div className="bg-white/90 backdrop-blur-md border border-zinc-200 rounded-full px-4 py-2 flex items-center gap-2 shadow-2xl">
				<div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-full mr-2">
					<button
						onClick={() => setViewMode("mobile")}
						className={`p-1.5 rounded-full transition-all ${viewMode === "mobile" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400 hover:text-zinc-600"}`}
						title="Mobile View"
					>
						<Smartphone size={14} />
					</button>
					<button
						onClick={() => setViewMode("desktop")}
						className={`p-1.5 rounded-full transition-all ${viewMode === "desktop" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400 hover:text-zinc-600"}`}
						title="Desktop View"
					>
						<Monitor size={14} />
					</button>
				</div>

				<div className="w-px h-4 bg-zinc-200 mx-1" />

				<button
					onClick={() => setShowThemes(!showThemes)}
					className={`p-2 rounded-full transition-all ${showThemes ? "bg-zinc-100 text-zinc-900" : "text-zinc-400 hover:text-zinc-600"}`}
					title="Change Theme"
				>
					<Palette size={16} />
				</button>

				<button
					onClick={() => setActiveTool("cursor")}
					className={`p-2 rounded-full transition-all ${activeTool === "cursor" ? "bg-zinc-100 text-zinc-900" : "text-zinc-400 hover:text-zinc-600"}`}
				>
					<MousePointer2 size={16} />
				</button>
				<button
					onClick={() => setActiveTool("hand")}
					className={`p-2 rounded-full transition-all ${activeTool === "hand" ? "bg-orange-50 text-orange-600" : "text-zinc-400 hover:text-zinc-600"}`}
				>
					<Hand size={16} />
				</button>
				<button
					onClick={() => resetTransform()}
					className="p-2 text-zinc-400 hover:text-zinc-600 rounded-full transition-all"
					title="Reset View"
				>
					<RotateCcw size={16} />
				</button>

				<div className="w-px h-4 bg-zinc-200 mx-1" />

				<button
					onClick={() => zoomOut()}
					className="p-2 text-zinc-500 hover:text-zinc-900 transition-colors"
				>
					<Minus size={16} />
				</button>

				<span className="text-xs font-bold text-zinc-600 w-12 text-center tabular-nums">
					{Math.round(scale * 100)}%
				</span>

				<button
					onClick={() => zoomIn()}
					className="p-2 text-zinc-500 hover:text-zinc-900 transition-colors"
				>
					<Plus size={16} />
				</button>

				<div className="w-px h-4 bg-zinc-200 mx-1" />

				<button
					onClick={() => {
						const allHtml = Object.values(pages).join("\n<hr/>\n");
						navigator.clipboard.writeText(allHtml);
						toast.success("Design code copied to clipboard!");
					}}
					className="p-2 text-zinc-400 hover:text-zinc-600 rounded-full transition-all"
					title="Copy Design Code"
				>
					<Copy size={16} />
				</button>
			</div>
		</div>
	);
};

const PageFrame = ({
	slug,
	html,
	applyTheme,
	activeTool,
	dimensions,
	isGenerating,
}) => {
	const iframeRef = useRef(null);
	const lastHtmlRef = useRef("");

	useEffect(() => {
		if (iframeRef.current) {
			const themeHtml = applyTheme(html, slug);
			// Only update srcDoc if the HTML is fundamentally different (not a local DOM edit)
			if (lastHtmlRef.current !== themeHtml) {
				iframeRef.current.srcdoc = themeHtml;
				lastHtmlRef.current = themeHtml;
			}
		}
	}, [html, slug, applyTheme]);

	useEffect(() => {
		iframeRef.current?.contentWindow?.postMessage(
			{ type: "simba-set-tool", tool: activeTool },
			"*",
		);
	}, [activeTool]);

	return (
		<div className="relative w-full h-full overflow-hidden rounded-[inherit]">
			<iframe
				ref={iframeRef}
				title={slug}
				style={{
					width: dimensions.width,
					height: dimensions.height,
					borderRadius: dimensions.radius,
				}}
				className="w-full h-full border-none"
				onLoad={() => {
					iframeRef.current?.contentWindow?.postMessage(
						{ type: "simba-set-tool", tool: activeTool },
						"*",
					);
				}}
			/>
			{isGenerating && (
				<div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] flex items-center justify-center z-50 transition-all duration-300">
					<div className="flex flex-col items-center gap-2">
						<div className="w-6 h-6 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin" />
						<span className="text-[10px] font-black text-zinc-900 uppercase tracking-tighter">
							Updating...
						</span>
					</div>
				</div>
			)}
		</div>
	);
};

const SimbaCanvas = ({ pages, setPages, isGenerating, editingSlug }) => {
	const [currentScale, setCurrentScale] = useState(0.7);
	const [viewMode, setViewMode] = useState("mobile");
	const [activeTheme, setActiveTheme] = useState(THEMES[0]);
	const [selectedSlug, setSelectedSlug] = useState(null);
	const [renamingSlug, setRenamingSlug] = useState(null);
	const [activeDropdown, setActiveDropdown] = useState(null);
	const [activeTool, setActiveTool] = useState("hand");
	const [hoveredElement, setHoveredElement] = useState(null);
	const [selectedElement, setSelectedElement] = useState(null);
	const [history, setHistory] = useState([]);

	const pageSlugs = useMemo(() => Object.keys(pages), [pages]);

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

	useEffect(() => {
		const handleKeyDown = (e) => {
			if ((e.ctrlKey || e.metaKey) && e.key === "z") {
				e.preventDefault();
				undo();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [history, pages]); // Need history and pages to have latest values in closure

	useEffect(() => {
		const handleMessage = (e) => {
			if (!e.data || typeof e.data !== "object") return;

			if (e.data.type === "simba-hover") {
				setHoveredElement(e.data);
			} else if (e.data.type === "simba-hover-clear") {
				setHoveredElement(null);
			} else if (e.data.type === "simba-select") {
				setSelectedElement(e.data);
			}
		};

		window.addEventListener("message", handleMessage);
		return () => window.removeEventListener("message", handleMessage);
	}, []);

	useEffect(() => {
		// Update active tool in all iframes
		const iframes = document.querySelectorAll("iframe");
		iframes.forEach((iframe) => {
			iframe.contentWindow?.postMessage(
				{ type: "simba-set-tool", tool: activeTool },
				"*",
			);
		});
	}, [activeTool]);

	const frameDimensions = useMemo(() => {
		return viewMode === "desktop"
			? { width: 1280, height: 800, radius: 12 }
			: { width: 320, height: 640, radius: 32 };
	}, [viewMode]);

	const applyThemeToHtml = (html, slug) => {
		if (!html) return "";
		const themeStyle = `
			<style>
				:root { --primary: ${activeTheme.color}; }
				/* Override common Tailwind indigo classes with theme color */
				[class*="text-indigo-"], [class*="text-blue-"] { color: ${activeTheme.color} !important; }
				[class*="bg-indigo-"], [class*="bg-blue-"] { background-color: ${activeTheme.color} !important; }
				[class*="border-indigo-"], [class*="border-blue-"] { border-color: ${activeTheme.color} !important; }
				button:hover { opacity: 0.9; }

				.simba-hover-outline {
					outline: 2px solid #3b82f6 !important;
					outline-offset: -2px !important;
					cursor: pointer !important;
				}
				.simba-selected-outline {
					outline: 2px solid #3b82f6 !important;
					outline-offset: -2px !important;
				}
			</style>
			<script>
				(function() {
					let hoveredEl = null;
					let selectedEl = null;

					window.addEventListener('mousemove', (e) => {
						if (window.activeTool !== 'cursor') return;
						
						const el = document.elementFromPoint(e.clientX, e.clientY);
						if (el === hoveredEl) return;
						
						if (hoveredEl) hoveredEl.classList.remove('simba-hover-outline');
						
						// Don't highlight body or html
						if (el && el !== document.body && el !== document.documentElement) {
							hoveredEl = el;
							hoveredEl.classList.add('simba-hover-outline');
							
							const rect = el.getBoundingClientRect();
							window.parent.postMessage({
								type: 'simba-hover',
								slug: '${slug}',
								tagName: el.tagName.toLowerCase(),
								rect: {
									top: rect.top,
									left: rect.left,
									width: rect.width,
									height: rect.height
								}
							}, '*');
						} else {
							hoveredEl = null;
							window.parent.postMessage({ type: 'simba-hover-clear', slug: '${slug}' }, '*');
						}
					});

					window.addEventListener('click', (e) => {
						if (window.activeTool !== 'cursor') return;
						e.preventDefault();
						e.stopPropagation();

						const el = document.elementFromPoint(e.clientX, e.clientY);
						if (el && el !== document.body && el !== document.documentElement) {
							if (selectedEl) selectedEl.classList.remove('simba-selected-outline');
							selectedEl = el;
							selectedEl.classList.add('simba-selected-outline');

							const rect = el.getBoundingClientRect();
							// Get some metadata for editing
							const info = {
								tagName: el.tagName.toLowerCase(),
								text: el.innerText,
								html: el.innerHTML,
								attributes: {}
							};
							
							if (el.tagName === 'IMG') {
								info.src = el.src;
							}
							
							// Find path to element to target it for updates
							const getPath = (element) => {
								const path = [];
								while (element && element.parentElement) {
									let index = 1;
									let sibling = element.previousElementSibling;
									while (sibling) {
										if (sibling.tagName === element.tagName) index++;
										sibling = sibling.previousElementSibling;
									}
									path.unshift(element.tagName.toLowerCase() + ':nth-of-type(' + index + ')');
									element = element.parentElement;
								}
								return path.join(' > ');
							};

							window.parent.postMessage({
								type: 'simba-select',
								slug: '${slug}',
								path: getPath(el),
								info: info,
								rect: {
									top: rect.top,
									left: rect.left,
									width: rect.width,
									height: rect.height
								}
							}, '*');
						}
					}, true);

					window.addEventListener('message', (e) => {
						if (e.data.type === 'simba-set-tool') {
							window.activeTool = e.data.tool;
							if (window.activeTool !== 'cursor') {
								if (hoveredEl) hoveredEl.classList.remove('simba-hover-outline');
								if (selectedEl) selectedEl.classList.remove('simba-selected-outline');
								hoveredEl = null;
								selectedEl = null;
							}
						}
					});
				})();
			</script>
		`;

		if (html.includes("</head>")) {
			return html.replace("</head>", `${themeStyle}</head>`);
		}
		return `<!DOCTYPE html><html><head>${themeStyle}</head><body>${html}</body></html>`;
	};

	const handleDelete = (slug) => {
		addToHistory(pages);
		const newData = { ...pages };
		delete newData[slug];
		setPages(newData);
		setActiveDropdown(null);
	};

	const handleDuplicate = (slug) => {
		addToHistory(pages);
		const newSlug = `${slug}-copy-${Date.now()}`;
		setPages({ ...pages, [newSlug]: pages[slug] });
		setActiveDropdown(null);
	};

	const getElementPath = (el) => {
		const path = [];
		let current = el;
		while (current && current.parentElement && current.tagName !== "BODY") {
			let index = 1;
			let sibling = current.previousElementSibling;
			while (sibling) {
				if (sibling.tagName === current.tagName) index++;
				sibling = sibling.previousElementSibling;
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

		setPages((prev) => {
			const html = prev[slug];
			const parser = new DOMParser();
			const doc = parser.parseFromString(html, "text/html");
			let el = doc.querySelector(path);
			let newPath = path;

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

						// Update the selected element's rect and info in our state
						if (iframeEl) {
							const newRect = iframeEl.getBoundingClientRect();
							setSelectedElement((curr) => {
								if (!curr || curr.slug !== slug || curr.path !== path)
									return curr;
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
										tagName: iframeEl.tagName.toLowerCase(),
									},
								};
							});
						}
					}
				}

				return { ...prev, [slug]: newHtml };
			}
			return prev;
		});

		if (shouldClose) {
			setSelectedElement(null);
		}
		toast.success("Element updated!");
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

	return (
		<div
			className="w-full h-full bg-[#f8f8f8] relative overflow-hidden flex-1"
			onClick={() => {
				setSelectedSlug(null);
				setActiveDropdown(null);
			}}
		>
			<TransformWrapper
				initialScale={0.7}
				minScale={0.05}
				maxScale={3}
				centerOnInit
				onTransformed={(ref) => setCurrentScale(ref.state.scale)}
			>
				{({ zoomIn, zoomOut, resetTransform }) => (
					<>
						<CanvasControls
							scale={currentScale}
							pages={pages}
							viewMode={viewMode}
							setViewMode={setViewMode}
							activeTheme={activeTheme}
							setTheme={setActiveTheme}
							activeTool={activeTool}
							setActiveTool={setActiveTool}
						/>
						<TransformComponent
							wrapperStyle={{ width: "100%", height: "100%" }}
							contentStyle={{ width: "fit-content", height: "fit-content" }}
						>
							<div className="relative min-w-[5000px] min-h-[3000px] p-[1000px] flex items-start gap-[100px]">
								{/* Dotted Background Grid */}
								<div
									className="absolute inset-0 pointer-events-none"
									style={{
										backgroundImage:
											"radial-gradient(#d1d1d1 1.2px, transparent 0)",
										backgroundSize: "32px 32px",
										opacity: 0.6,
									}}
								/>

								{pageSlugs.map((slug) => (
									<div
										key={slug}
										className="flex flex-col gap-4 relative z-10 transition-all duration-500 ease-in-out"
										onClick={(e) => {
											e.stopPropagation();
											setSelectedSlug(slug);
										}}
									>
										{/* Page Header matching image */}
										<div
											className={`flex items-center justify-between bg-white/80 backdrop-blur shadow-sm border rounded-full px-3 py-1.5 min-w-[200px] transition-colors ${selectedSlug === slug ? "border-blue-400 ring-2 ring-blue-100" : "border-zinc-200"}`}
										>
											<div className="flex items-center gap-2">
												<div className="grid grid-cols-2 gap-0.5 opacity-30 cursor-grab active:cursor-grabbing">
													{[...Array(6)].map((_, i) => (
														<div
															key={i}
															className="w-1 h-1 bg-zinc-900 rounded-full"
														/>
													))}
												</div>
												{renamingSlug === slug ? (
													<input
														autoFocus
														defaultValue={
															slug === "/" || slug === "landing"
																? "Home"
																: slug.replace(/^\//, "")
														}
														onBlur={(e) => {
															const newTitle = e.target.value;
															if (newTitle && newTitle !== slug) {
																addToHistory(pages);
																const newData = { ...pages };
																newData[newTitle] = newData[slug];
																delete newData[slug];
																setPages(newData);
															}
															setRenamingSlug(null);
														}}
														onKeyDown={(e) =>
															e.key === "Enter" && e.target.blur()
														}
														className="text-xs font-bold text-zinc-900 bg-transparent outline-none border-b border-zinc-300 w-24"
													/>
												) : (
													<span
														onClick={() => setRenamingSlug(slug)}
														className="text-xs font-bold text-zinc-600 uppercase tracking-widest cursor-pointer hover:text-zinc-900"
													>
														{slug === "/" || slug === "landing"
															? "Home"
															: slug.replace(/^\//, "")}
													</span>
												)}
											</div>

											<div className="flex items-center gap-1 border-l border-zinc-200 ml-2 pl-2">
												<button
													onClick={(e) => {
														e.stopPropagation();
														navigator.clipboard.writeText(pages[slug]);
														toast.success("Code copied!");
													}}
													className="p-1 text-zinc-400 hover:text-zinc-600"
													title="Copy Code"
												>
													<Code size={14} />
												</button>
												<button
													className="p-1 text-zinc-400 hover:text-zinc-600"
													title="Download"
												>
													<Download size={14} />
												</button>
												<div className="relative">
													<button
														onClick={(e) => {
															e.stopPropagation();
															setActiveDropdown(
																activeDropdown === slug ? null : slug,
															);
														}}
														className="p-1 text-zinc-400 hover:text-zinc-600"
													>
														<MoreHorizontal size={14} />
													</button>
													{activeDropdown === slug && (
														<div className="absolute right-0 bottom-full mt-2 w-40 bg-white border border-zinc-200 rounded-xl shadow-xl z-[60] overflow-hidden">
															<button
																onClick={() => handleDuplicate(slug)}
																className="w-full px-4 py-2 text-left text-xs text-zinc-600 hover:bg-zinc-50 flex items-center gap-2"
															>
																<Layers size={14} /> Duplicate
															</button>
															<button className="w-full px-4 py-2 text-left text-xs text-zinc-600 hover:bg-zinc-50 flex items-center gap-2">
																<FileCode size={14} /> React Code
															</button>
															<div className="border-t border-zinc-100" />
															<button
																onClick={() => handleDelete(slug)}
																className="w-full px-4 py-2 text-left text-xs text-red-500 hover:bg-red-50 flex items-center gap-2"
															>
																<Trash2 size={14} /> Delete
															</button>
														</div>
													)}
												</div>
											</div>
										</div>

										{/* Dynamic Frame with Selection Border */}
										<div
											style={{
												width: frameDimensions.width,
												height: frameDimensions.height,
												borderRadius: frameDimensions.radius,
											}}
											className={`bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] border transition-all duration-300 relative ${selectedSlug === slug ? "border-blue-500 ring-4 ring-blue-500/10" : "border-zinc-200"}`}
										>
											<PageFrame
												slug={slug}
												html={pages[slug]}
												applyTheme={applyThemeToHtml}
												activeTool={activeTool}
												dimensions={frameDimensions}
												isGenerating={editingSlug === slug}
											/>

											{/* Hover Overlay */}
											{activeTool === "cursor" &&
												hoveredElement &&
												hoveredElement.slug === slug && (
													<div
														className="absolute pointer-events-none border-2 border-blue-400 z-30"
														style={{
															top: hoveredElement.rect.top,
															left: hoveredElement.rect.left,
															width: hoveredElement.rect.width,
															height: hoveredElement.rect.height,
														}}
													>
														<div className="absolute top-0 left-0 -translate-y-full bg-blue-500 text-white text-[8px] px-1 py-0.5 rounded-t-sm font-bold uppercase">
															{hoveredElement.tagName}
														</div>
													</div>
												)}

											{/* Selection Overlay & Toolbar */}
											{activeTool === "cursor" &&
												selectedElement &&
												selectedElement.slug === slug && (
													<>
														<div
															className="absolute pointer-events-none border-2 border-blue-600 z-40"
															style={{
																top: selectedElement.rect.top,
																left: selectedElement.rect.left,
																width: selectedElement.rect.width,
																height: selectedElement.rect.height,
															}}
														/>
														<SelectionToolbar
															element={selectedElement}
															onUpdate={(updates, shouldClose = true) =>
																handleUpdateElement(
																	slug,
																	selectedElement.path,
																	updates,
																	shouldClose,
																)
															}
															onDelete={() =>
																handleDeleteElement(slug, selectedElement.path)
															}
															onClose={() => setSelectedElement(null)}
														/>
													</>
												)}

											{selectedSlug === slug && (
												<div className="absolute inset-0 pointer-events-none border-2 border-blue-500 rounded-[inherit] z-20" />
											)}
										</div>
									</div>
								))}

								{isGenerating && (
									<div
										style={{
											width: frameDimensions.width,
											height: frameDimensions.height,
											borderRadius: frameDimensions.radius,
										}}
										className="bg-zinc-50 border border-dashed border-zinc-300 flex flex-col items-center justify-center gap-3 relative z-10 transition-all duration-500 ease-in-out"
									>
										<div className="w-8 h-8 border-2 border-zinc-200 border-t-zinc-800 rounded-full animate-spin" />
										<span className="text-[10px] text-zinc-400 font-bold uppercase tracking-tighter">
											Generating...
										</span>
									</div>
								)}
							</div>
						</TransformComponent>
					</>
				)}
			</TransformWrapper>
		</div>
	);
};

export default SimbaCanvas;
