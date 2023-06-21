<svelte:head>
	<title>About</title>
	<meta name="description" content="About this app" />
</svelte:head>


<script>
	import { goto } from "$app/navigation";
	import { fetch_api } from "$lib/components/fetch";
	import { authenticated, token } from "$lib/stores/store";
	import { onMount } from "svelte";
	import { get } from "svelte/store";

	onMount(async () => {
		if (!get(authenticated)) {
			goto("/login");
		}
		const result = await fetch_api('api/auth/logout', {
			method: 'POST'
		})
		if (result.status == 200) {
			authenticated.set(false)
			token.set(null)
			localStorage.removeItem('token')
			localStorage.removeItem('user')
			goto('/login')
			return
		}
	});

</script>


<section class="container">
	<h1>Logging out</h1>
</section>