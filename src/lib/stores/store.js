import { writable } from "svelte/store";

export const loading = writable(true);
export const authenticating = writable(true);
export const authenticated = writable(false);
export const user = writable();
export const token = writable();
