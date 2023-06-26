import { goto } from "$app/navigation";
import { apiServer } from "$lib/configs/api";
import { authenticated, token } from "$lib/stores/store";
import { onMount } from "svelte";
import { get } from "svelte/store";

export async function fetch_api(url: string, options: RequestInit | undefined = undefined, redirect = true) {
    const tokenObj = get(token);
    const isAuthenticated = get(authenticated);
    const auth = {
        Authorization: `Bearer ${ tokenObj?.plainTextToken}`,
    };
    const headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",

    };
    console.debug("fetch_api", url, options);
    const res = await fetch(`${apiServer}/${url}`, {
        ...options,
        headers: {
            ...(isAuthenticated ? auth : {}),
            ...headers,
            ...options?.headers,
        },
    });
    console.debug("fetch_api result", res);

    if (res.status === 401) {
        const json = await res.json();
        if (json.error_code === 401001) {
            token.set(null);
            authenticated.set(false);
            if (redirect) {
                onMount(() => {
                    goto("/login");
                });
            }
        }

    }

    return res;
}
