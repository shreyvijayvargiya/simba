import React, { useState, useMemo } from "react";
import Icons from "../hooks/allIcons";
import { Search, X } from "lucide-react";

const IconsSelectorDropdown = ({ onSelect, onClose }) => {
	const [search, setSearch] = useState("");

	const iconNames = useMemo(() => Object.keys(Icons), []);

	const filteredIcons = useMemo(() => {
		if (!search) return iconNames.slice(0, 50); // Show first 50 initially
		return iconNames
			.filter((name) => name.toLowerCase().includes(search.toLowerCase()))
			.slice(0, 50);
	}, [search, iconNames]);

	return (
		<div className="bg-white border border-zinc-200 shadow-2xl rounded-2xl p-4 w-72 max-h-[400px] flex flex-col gap-4">
			<div className="flex items-center justify-between border-b border-zinc-100 pb-2">
				<h3 className="text-sm font-bold text-zinc-900">Select Icon</h3>
				<button
					onClick={onClose}
					className="text-zinc-400 hover:text-zinc-600 transition-colors"
				>
					<X size={16} />
				</button>
			</div>

			<div className="relative">
				<Search
					size={14}
					className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
				/>
				<input
					autoFocus
					type="text"
					placeholder="Search icons..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
				/>
			</div>

			<div className="grid grid-cols-5 gap-2 overflow-y-auto pr-2 custom-scrollbar">
				{filteredIcons.map((name) => {
					const Icon = Icons[name];
					return (
						<button
							key={name}
							onClick={() => onSelect(name)}
							className="p-2 aspect-square flex items-center justify-center rounded-lg border border-zinc-100 hover:border-blue-500 hover:bg-blue-50 text-zinc-600 hover:text-blue-600 transition-all group"
							title={name}
						>
							<Icon size={18} />
						</button>
					);
				})}
				{filteredIcons.length === 0 && (
					<div className="col-span-5 py-8 text-center text-xs text-zinc-400 font-medium">
						No icons found
					</div>
				)}
			</div>
		</div>
	);
};

export default IconsSelectorDropdown;
