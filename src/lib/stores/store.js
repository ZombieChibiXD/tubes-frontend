import { writable } from "svelte/store";

export const authenticating = writable(true);
export const authenticated = writable(false);
export const user = writable();

/**
 * @type {import('svelte/store').Writable<import('$lib/types/global').NewAccessToken?>}
 */
export const token = writable();
