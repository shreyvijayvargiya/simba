import React, { useState, useEffect } from "react";
import { Zap, User as UserIcon, DogIcon, Dog } from "lucide-react";
import { onAuthStateChange } from "../../lib/api/auth";
import LoginModal from "../../lib/ui/LoginModal";
import { useRouter } from "next/router";

const SimbaNavbar = ({
	loginModalOpen,
	setLoginModalOpen: setLoginModalOpenProp,
}) => {
	const [user, setUser] = useState(null);
	const [internalLoginOpen, setInternalLoginOpen] = useState(false);
	const router = useRouter();
	const isLoginModalOpen = setLoginModalOpenProp
		? loginModalOpen
		: internalLoginOpen;
	const setIsLoginModalOpen = setLoginModalOpenProp || setInternalLoginOpen;

	useEffect(() => {
		const unsubscribe = onAuthStateChange((currentUser) => {
			setUser(currentUser);
		});
		return () => unsubscribe();
	}, []);

	return (
		<>
			<nav className="h-10 border-b border-zinc-100 flex items-center justify-between px-6 bg-white/80 backdrop-blur-md sticky top-0 z-50">
				<div
					className="flex items-center cursor-pointer"
					onClick={() => router.push("/")}
				>
					<div className="w-4 h-4 rounded-xl flex items-center justify-center">
						<Dog size={16} className="text-zinc-900" />
					</div>
					<span className="font-black tracking-tighter text-zinc-900">
						SIMBA
					</span>
				</div>
				<div className="flex items-center gap-4">
					<button
						onClick={() => router.push("/app")}
						className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
					>
						Projects
					</button>
					<button
						onClick={() => setIsLoginModalOpen(true)}
						className="flex items-center gap-2 px-2 py-1 bg-zinc-100 text-zinc-800 rounded-full text-sm hover:bg-zinc-200 transition-all active:scale-95"
					>
						{user ? (
							<>
								{user.photoURL ? (
									<img
										src={user.photoURL}
										alt={user.displayName}
										className="w-3 h-3 rounded-full"
									/>
								) : (
									<UserIcon size={14} />
								)}
								Account
							</>
						) : (
							"Sign In"
						)}
					</button>
				</div>
			</nav>

			<LoginModal
				isOpen={isLoginModalOpen}
				onClose={() => setIsLoginModalOpen(false)}
			/>
		</>
	);
};

export default SimbaNavbar;
