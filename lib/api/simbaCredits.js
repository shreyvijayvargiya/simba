import {
	doc,
	getDoc,
	setDoc,
	updateDoc,
	serverTimestamp,
	increment,
} from "firebase/firestore";
import { db } from "../config/firebase";

const SIMBA_CREDITS_COLLECTION = "simba-credits";
const DEFAULT_CREDITS = 10000;

/**
 * Get Simba credits for a user. Creates doc with default credits if not exists.
 * @param {string} userId - Firebase Auth UID
 * @returns {Promise<number>} Current credits balance
 */
export async function getCredits(userId) {
	if (!userId) return 0;
	const ref = doc(db, SIMBA_CREDITS_COLLECTION, userId);
	const snap = await getDoc(ref);
	if (snap.exists()) {
		const data = snap.data();
		return typeof data.credits === "number" ? data.credits : DEFAULT_CREDITS;
	}
	await setDoc(ref, {
		credits: DEFAULT_CREDITS,
		createdAt: serverTimestamp(),
		updatedAt: serverTimestamp(),
	});
	return DEFAULT_CREDITS;
}

/**
 * Initialize credits for a user (only if doc does not exist).
 * @param {string} userId - Firebase Auth UID
 * @param {number} [initialCredits=10000] - Initial credit balance
 * @returns {Promise<number>} Current credits after init
 */
export async function initCredits(userId, initialCredits = DEFAULT_CREDITS) {
	if (!userId) return 0;
	const ref = doc(db, SIMBA_CREDITS_COLLECTION, userId);
	const snap = await getDoc(ref);
	if (snap.exists()) {
		const data = snap.data();
		return typeof data.credits === "number" ? data.credits : DEFAULT_CREDITS;
	}
	await setDoc(ref, {
		credits: initialCredits,
		createdAt: serverTimestamp(),
		updatedAt: serverTimestamp(),
	});
	return initialCredits;
}

/**
 * Decrement user's Simba credits (atomic). Does not go below 0 at DB level.
 * @param {string} userId - Firebase Auth UID
 * @param {number} amount - Positive number to subtract (e.g. usage.total)
 * @returns {Promise<void>}
 */
export async function decrementCredits(userId, amount) {
	if (!userId || !amount || amount <= 0) return;
	const ref = doc(db, SIMBA_CREDITS_COLLECTION, userId);
	await updateDoc(ref, {
		credits: increment(-Math.min(amount, 999999999)),
		updatedAt: serverTimestamp(),
	});
}
