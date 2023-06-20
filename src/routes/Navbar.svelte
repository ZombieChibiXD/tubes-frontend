<script>
	import { user, authenticated, authenticating, token } from "$lib/stores/store";
</script>
<nav>
	<a href="/">Home</a>
	<a href="/about">About</a>
    {#if $authenticated}
        <a href="/tasks">Tasks</a>
        {#if $token?.accessToken.abilities.includes('ADMINISTRATOR')}
            <a href="/admin">Admin</a>
        {/if}
        <a href="/logout">Logout</a>
    {:else}
	    <a href="/login">Login</a>
    {/if}
</nav>