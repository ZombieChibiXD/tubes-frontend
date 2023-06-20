<script>
	import { onMount } from "svelte";
	import { user, authenticated, authenticating, loading, token } from "$lib/stores/store";
	import Loading from "$lib/components/Loading.svelte";

	/**
	 * @param {any} token
	 */
	async function authentication(token) {
		loading.set(true);
		authenticating.set(true);
		console.debug("Authenticating");
		console.debug(token);
		if (token === null){
			authenticated.set(false);
			authenticating.set(false);
			loading.set(false);
			return false;
		}

		// TODO: Validate token

		authenticated.set(true);
		authenticating.set(false);
		loading.set(false);
		return true;
	}
	/**
	 * @param {any} token
	 */
	async function refresh_user(token) {
		// TODO: Fetch user from API
	}
	onMount(async () => {
		token.subscribe(function (value) {
			if (value === undefined) return;
			console.log("Subscribing to token");
			authentication(value).then((value) => {
				if (!value) {
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
		loading.set(true);	
		authenticating.set(true);
		const localToken = localStorage.getItem("token");
		const localUser = localStorage.getItem("user");
		user.set(JSON.parse(localUser ?? "null"));
		token.set(JSON.parse(localToken ?? "null"));
		loading.set(false);
		authenticating.set(false);
	});


</script>
<div>
	<main>
		<slot />
	</main>
	<footer>
		<p>
			&copy; 2021 Tubesoft
		</p>
	</footer>
</div>


