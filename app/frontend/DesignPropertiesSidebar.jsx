import React, { useState, useEffect, useRef } from "react";
import {
	Type,
	Maximize,
	Layers,
	Image as ImageIcon,
	Video,
	Trash2,
	ChevronDown,
	ChevronUp,
	Palette,
	Upload,
	X,
	Droplet,
} from "lucide-react";

const PropertyGroup = ({ title, icon: Icon, children, defaultOpen = true }) => {
	const [isOpen, setIsOpen] = useState(defaultOpen);
	return (
		<div className="border-b border-zinc-100">
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="w-full px-4 py-3 flex items-center justify-between hover:bg-zinc-50 transition-colors"
			>
				<div className="flex items-center gap-2 text-zinc-900">
					<Icon size={14} className="text-zinc-400" />
					<span className="text-[11px] font-black uppercase tracking-widest">
						{title}
					</span>
				</div>
				{isOpen ? (
					<ChevronUp size={14} className="text-zinc-300" />
				) : (
					<ChevronDown size={14} className="text-zinc-300" />
				)}
			</button>
			{isOpen && <div className="px-4 pb-4 space-y-3">{children}</div>}
		</div>
	);
};

const Input = ({ label, value, onChange, placeholder, type = "text" }) => (
	<div className="space-y-1">
		<label className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">
			{label}
		</label>
		<input
			type={type}
			value={value || ""}
			onChange={(e) => onChange(e.target.value)}
			placeholder={placeholder}
			className="w-full px-2 py-1.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-all"
		/>
	</div>
);

const DesignPropertiesSidebar = ({ element, onUpdate, onDelete, onClose }) => {
	const [localStyles, setLocalStyles] = useState({});
	const fileInputRef = useRef(null);

	useEffect(() => {
		if (element && element.info && element.info.style) {
			setLocalStyles(element.info.style);
		} else {
			setLocalStyles({});
		}
	}, [element]);

	if (!element) return null;

	const { info, slug, path } = element;

	const updateStyle = (key, value) => {
		setLocalStyles((prev) => ({ ...prev, [key]: value }));
		onUpdate({ style: { [key]: value } }, false);
	};

	const handleImageUpload = (e) => {
		const file = e.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				onUpdate({ src: reader.result }, false);
			};
			reader.readAsDataURL(file);
		}
	};

	return (
		<div
			className="w-80 border-l border-zinc-200 flex flex-col bg-white overflow-hidden shadow-2xl relative z-30"
			onClick={(e) => e.stopPropagation()}
		>
			<div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
				<div className="flex items-center gap-2">
					<div className="w-8 h-8 rounded-xl bg-zinc-900 flex items-center justify-center text-white text-[10px] font-black uppercase">
						{info.tagName.charAt(0)}
					</div>
					<div>
						<h2 className="text-sm font-bold text-zinc-900">
							{info.tagName.toUpperCase()}
						</h2>
						<p className="text-[10px] text-zinc-500 font-medium truncate w-32">
							{path}
						</p>
					</div>
				</div>
				<button
					onClick={onClose}
					className="p-1.5 hover:bg-zinc-200 rounded-md text-zinc-400"
				>
					<X size={14} />
				</button>
			</div>

			<div className="flex-1 overflow-y-auto hidescrollbar">
				<PropertyGroup title="Layout" icon={Maximize}>
					<div className="grid grid-cols-2 gap-2">
						<Input
							label="Padding"
							value={localStyles.padding}
							placeholder="e.g. 20px"
							onChange={(val) => updateStyle("padding", val)}
						/>
						<Input
							label="Margin"
							value={localStyles.margin}
							placeholder="e.g. 10px"
							onChange={(val) => updateStyle("margin", val)}
						/>
						<Input
							label="Width"
							value={localStyles.width}
							placeholder="e.g. 100%"
							onChange={(val) => updateStyle("width", val)}
						/>
						<Input
							label="Height"
							value={localStyles.height}
							placeholder="e.g. auto"
							onChange={(val) => updateStyle("height", val)}
						/>
					</div>
					<div className="flex gap-2 pt-1">
						<button
							onClick={() => updateStyle("width", "100%")}
							className="flex-1 py-1 px-2 bg-zinc-100 hover:bg-zinc-200 rounded-lg text-[9px] font-bold text-zinc-600 uppercase transition-all"
						>
							Full (100%)
						</button>
						<button
							onClick={() => updateStyle("width", "50%")}
							className="flex-1 py-1 px-2 bg-zinc-100 hover:bg-zinc-200 rounded-lg text-[9px] font-bold text-zinc-600 uppercase transition-all"
						>
							Half (50%)
						</button>
						<button
							onClick={() => updateStyle("width", "auto")}
							className="flex-1 py-1 px-2 bg-zinc-100 hover:bg-zinc-200 rounded-lg text-[9px] font-bold text-zinc-600 uppercase transition-all"
						>
							Auto
						</button>
					</div>
				</PropertyGroup>

				{(info.tagName === "p" ||
					info.tagName.startsWith("h") ||
					info.tagName === "span" ||
					info.tagName === "button") && (
					<PropertyGroup title="Typography" icon={Type}>
						<Input
							label="Font Size"
							value={localStyles.fontSize}
							placeholder="e.g. 16px"
							onChange={(val) => updateStyle("fontSize", val)}
						/>
						<Input
							label="Font Weight"
							value={localStyles.fontWeight}
							placeholder="e.g. 600"
							onChange={(val) => updateStyle("fontWeight", val)}
						/>
						<Input
							label="Text Color"
							type="color"
							value={localStyles.color}
							onChange={(val) => updateStyle("color", val)}
						/>
					</PropertyGroup>
				)}

				<PropertyGroup title="Appearance" icon={Palette}>
					<Input
						label="Background"
						type="color"
						value={localStyles.backgroundColor}
						onChange={(val) => updateStyle("backgroundColor", val)}
					/>
					<div className="grid grid-cols-2 gap-2">
						<Input
							label="Radius"
							value={localStyles.borderRadius}
							placeholder="e.g. 12px"
							onChange={(val) => updateStyle("borderRadius", val)}
						/>
						<Input
							label="Opacity"
							value={localStyles.opacity}
							placeholder="e.g. 0.5"
							onChange={(val) => updateStyle("opacity", val)}
						/>
					</div>
				</PropertyGroup>

				{(info.tagName === "img" || info.tagName === "video") && (
					<PropertyGroup
						title="Media"
						icon={info.tagName === "img" ? ImageIcon : Video}
					>
						<div className="space-y-3">
							<Input
								label="Source URL"
								value={info.src}
								onChange={(val) => onUpdate({ src: val }, false)}
							/>
							<button
								onClick={() => fileInputRef.current?.click()}
								className="w-full py-2 bg-zinc-100 hover:bg-zinc-200 rounded-xl text-zinc-600 text-[10px] font-black uppercase flex items-center justify-center gap-2 transition-all"
							>
								<Upload size={12} /> Upload File
							</button>
							<input
								type="file"
								ref={fileInputRef}
								className="hidden"
								accept={info.tagName === "img" ? "image/*" : "video/*"}
								onChange={handleImageUpload}
							/>
						</div>
					</PropertyGroup>
				)}

				<PropertyGroup title="Effects" icon={Droplet}>
					<Input
						label="Box Shadow"
						value={localStyles.boxShadow}
						placeholder="e.g. 0 4px 6px rgba(0,0,0,0.1)"
						onChange={(val) => updateStyle("boxShadow", val)}
					/>
					<Input
						label="Border"
						value={localStyles.border}
						placeholder="e.g. 1px solid #000"
						onChange={(val) => updateStyle("border", val)}
					/>
				</PropertyGroup>
			</div>

			<div className="p-4 border-t border-zinc-100 bg-zinc-50/30">
				<button
					onClick={onDelete}
					className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 transition-all"
				>
					<Trash2 size={14} /> Delete Element
				</button>
			</div>
		</div>
	);
};

export default DesignPropertiesSidebar;
