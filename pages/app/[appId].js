import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Loader2 } from "lucide-react";
import { onAuthStateChange } from "../../lib/api/auth";
import { getApp } from "../../lib/api/kixiApps";
import { AIDesignCreatorPage } from "../app";

export default function AppByIdPage() {
	const router = useRouter();
	const { appId } = router.query;
	const [user, setUser] = useState(null);
	const [app, setApp] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const unsub = onAuthStateChange((u) => {
			setUser(u ?? null);
			if (!u) setLoading(false);
		});
		return () => unsub?.();
	}, []);

	useEffect(() => {
		if (!appId || !user) return;
		let cancelled = false;
		setLoading(true);
		setError(null);
		getApp(user.uid, appId)
			.then((data) => {
				if (!cancelled) {
					if (!data) {
						setError("Project not found");
						setApp(null);
					} else {
						setApp(data);
					}
				}
			})
			.catch((err) => {
				if (!cancelled) {
					setError(err.message || "Failed to load project");
					setApp(null);
				}
			})
			.finally(() => {
				if (!cancelled) setLoading(false);
			});
		return () => {
			cancelled = true;
		};
	}, [appId, user]);

	useEffect(() => {
		if (!loading && !user) {
			router.replace("/");
			return;
		}
		if (!loading && user && error) {
			router.replace("/app");
			return;
		}
	}, [loading, user, error, router]);

	if (loading || !user) {
		return (
			<div className="h-screen w-full flex items-center justify-center bg-white">
				<Loader2 className="w-8 h-8 animate-spin text-zinc-900" />
			</div>
		);
	}

	if (error || !app) {
		return (
			<div className="h-screen w-full flex items-center justify-center bg-white">
				<p className="text-zinc-500 font-medium">
					{error || "Project not found"}
				</p>
			</div>
		);
	}

	return (
		<AIDesignCreatorPage
			initialPages={app.pages || {}}
			initialMeta={app.meta ?? null}
			initialDesignSystem={app.designSystem ?? null}
			appId={appId}
			userId={user.uid}
		/>
	);
}
