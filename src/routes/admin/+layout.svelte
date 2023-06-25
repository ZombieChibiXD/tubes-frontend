<script>
	import { authenticated, authenticating, token } from '$lib/stores/store';
	import { goto } from '$app/navigation';
	import Loading from '$lib/components/Loading.svelte';

	$: {
		if (!$authenticating && !$authenticated) {
			goto('/login');
		}
	}
</script>

{#if $authenticating}
<section style="display: flex; align-items: center; justify-content: center;">
    <Loading />
</section>
{:else if $token?.accessToken.abilities.includes('ADMINISTRATOR')}
	<slot />
{:else}
	<section class="container">
		<h1>Unauthorized</h1>
		<p>You are not authorized to access this page.</p>
		<a href="/">Go Home</a>
	</section>
{/if}
