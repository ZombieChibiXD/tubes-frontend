<script>
	import '@picocss/pico'
	import { onMount } from "svelte";
	import { get } from 'svelte/store';
	import { user, authenticated, authenticating, token } from "$lib/stores/store";
	import Loading from "$lib/components/Loading.svelte";
	import Navbar from "./Navbar.svelte";
	import Toast from '$lib/components/Toast.svelte';
	let loading = false;
	/**
	 * @param {import('$lib/types/global').NewAccessToken?} token
	 */
	async function authentication(token) {
		authenticating.set(true);
		console.debug("Authenticating");
		console.debug(token);
		if (token === null){
			authenticated.set(false);
			authenticating.set(false);
			return false;
		}

		const isAuthenticated = get(authenticated);
		if (isAuthenticated) {
			console.debug("Already authenticated");
			authenticating.set(false);
			return true;
		}

		// TODO: Validate token
		



		authenticated.set(true);
		authenticating.set(false);
		return true;
	}
	/**
	 * @param {import('$lib/types/global').NewAccessToken?} token
	 */
	async function refresh_user(token) {
		// TODO: Fetch user from API
		console.debug("Fetching user");
		console.debug(token);
	}
	onMount(async () => {
		token.subscribe(function (value) {
			if (value === undefined) return;
			console.log("Subscribing to token");
			authentication(value).then((result) => {
				if (!result) {
					console.log("Invalid token");
					localStorage.removeItem("token");
					localStorage.removeItem("user");
					return;
				}
				refresh_user(value);
			}).catch((err) => {
				console.log(err);
			});
		});
		loading = true;
		try {
			authenticated.set(false);
			authenticating.set(true);
			const localToken = localStorage.getItem("token");
			const localUser = localStorage.getItem("user");
			user.set(JSON.parse(localUser ?? "null"));
			token.set(JSON.parse(localToken ?? "null"));
		} catch (error) {
			console.error("Unexpected Error");
			console.error(error);
		} finally {
			loading = false;
		}
		authenticating.set(false);
	});


</script>

{#if loading}
	<Loading />
{:else}
	<div>
		<header>
			<Navbar />
		</header>
		<main>
			<slot />
		</main>
		<footer>
			<p>
				&copy; 2021 Tubesoft
			</p>
		</footer>
	</div>
{/if}
<Toast />


