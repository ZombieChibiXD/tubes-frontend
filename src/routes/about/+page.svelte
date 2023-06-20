<svelte:head>
	<title>About</title>
	<meta name="description" content="About this app" />
</svelte:head>


<script>
	import { user, authenticated, authenticating, loading, token } from "$lib/stores/store";
	console.log($authenticated);
</script>

<div class="text-column">
	{#if $authenticated}
		<h1>Hi {$user}!</h1>
		<p>You are authenticated!</p>
	{:else if $authenticating}
		<p>Authenticating...</p>
	{:else if $loading}
		<p>Loading...</p>
	{:else}
		<p>You are not authenticated!</p>
	{/if}

</div>
