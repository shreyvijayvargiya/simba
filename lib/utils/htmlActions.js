/**
 * Executes a deterministic action on the provided HTML string
 * and returns the updated HTML.
 */
export const executeHtmlAction = (html, action) => {
	if (typeof window === "undefined") return html;
	const parser = new DOMParser();
	const doc = parser.parseFromString(html, "text/html");

	const { type, target, payload } = action;

	// Find the target element
	const element =
		doc.querySelector(`[data-id="${target?.componentId}"]`) ||
		(target?.componentId ? doc.getElementById(target.componentId) : null);

	if (!element && type !== "ADD_COMPONENT") {
		console.warn(`Target element ${target?.componentId} not found.`);
		return html;
	}

	switch (type) {
		case "UPDATE_STYLE":
			// payload: { classesToAdd: [], classesToRemove: [], color: 'white', ... }
			if (payload.classesToRemove) {
				element?.classList.remove(...payload.classesToRemove);
			}
			if (payload.classesToAdd) {
				element?.classList.add(...payload.classesToAdd);
			}
			// Apply direct style properties (like "color": "white")
			Object.keys(payload).forEach((key) => {
				if (key !== "classesToAdd" && key !== "classesToRemove") {
					if (element.style) {
						element.style[key] = payload[key];
					}
				}
			});
			break;

		case "UPDATE_PROPS":
			// payload: { textContent: "New Title", src: "..." }
			if (payload.textContent) element.textContent = payload.textContent;
			if (payload.src) element.src = payload.src;
			break;

		case "DELETE_COMPONENT":
			element?.remove();
			break;

		case "MOVE_COMPONENT":
			// payload: { direction: 'up' | 'down' }
			if (payload.direction === "up") {
				element?.previousElementSibling?.before(element);
			} else {
				element?.nextElementSibling?.after(element);
			}
			break;

		case "DUPLICATE_COMPONENT":
			const clone = element?.cloneNode(true);
			if (clone.id) clone.id = `${clone.id}-copy`;
			element?.after(clone);
			break;

		case "ADD_COMPONENT":
			// payload: { html: "<div>...</div>", position: "afterbegin" }
			const container =
				(target?.componentId ? doc.querySelector(target.componentId) : null) ||
				doc.body;
			container.insertAdjacentHTML(
				payload.position || "beforeend",
				payload.html,
			);
			break;

		default:
			console.log("Unknown action type:", type);
	}

	return `<!DOCTYPE html>${doc.documentElement.outerHTML}`;
};
