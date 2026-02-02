import {
	collection,
	doc,
	getDoc,
	getDocs,
	addDoc,
	updateDoc,
	serverTimestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";

const KIXI_APPS = "kixi-apps";
const APPS = "apps";

/**
 * Create a new app for a user.
 * Structure: kixi-apps/{userId}/apps/{appId}
 * @param {string} userId - Firebase Auth UID
 * @param {Object} data - { name, pages, meta?, designSystem? }
 * @returns {Promise<string>} The new app document ID
 */
export async function createApp(userId, data) {
	const appsRef = collection(db, KIXI_APPS, userId, APPS);
	const docRef = await addDoc(appsRef, {
		name: data.name || "Untitled App",
		pages: data.pages || {},
		meta: data.meta || null,
		designSystem: data.designSystem || null,
		createdAt: serverTimestamp(),
		updatedAt: serverTimestamp(),
	});
	return docRef.id;
}

/**
 * List all apps for a user (metadata only, no pages content).
 * @param {string} userId - Firebase Auth UID
 * @returns {Promise<Array<{ id, name, createdAt?, updatedAt? }>>}
 */
export async function listApps(userId) {
	if (!userId) return [];
	const appsRef = collection(db, KIXI_APPS, userId, APPS);
	const snap = await getDocs(appsRef);
	const apps = snap.docs.map((d) => ({
		id: d.id,
		name: d.data().name || "Untitled",
		createdAt: d.data().createdAt,
		updatedAt: d.data().updatedAt,
	}));
	// Sort by updatedAt desc (or createdAt) in memory to avoid Firestore index
	apps.sort((a, b) => {
		const ta = a.updatedAt?.toMillis?.() ?? a.createdAt?.toMillis?.() ?? 0;
		const tb = b.updatedAt?.toMillis?.() ?? b.createdAt?.toMillis?.() ?? 0;
		return tb - ta;
	});
	return apps;
}

/**
 * Get an app by userId and appId.
 * @param {string} userId - Firebase Auth UID
 * @param {string} appId - App document ID
 * @returns {Promise<Object|null>} App data or null
 */
export async function getApp(userId, appId) {
	const appRef = doc(db, KIXI_APPS, userId, APPS, appId);
	const snap = await getDoc(appRef);
	if (!snap.exists()) return null;
	return {
		id: snap.id,
		...snap.data(),
	};
}

/**
 * Update an existing app.
 * @param {string} userId - Firebase Auth UID
 * @param {string} appId - App document ID
 * @param {Object} data - { name?, pages?, meta?, designSystem? }
 */
export async function updateApp(userId, appId, data) {
	const appRef = doc(db, KIXI_APPS, userId, APPS, appId);
	await updateDoc(appRef, {
		...data,
		updatedAt: serverTimestamp(),
	});
}
