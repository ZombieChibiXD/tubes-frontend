<script>
	import { user, authenticated, authenticating, token } from "$lib/stores/store";
</script>
<nav class="container-fluid">
    <ul>
        <a href="/" class="contrast">
            <strong>Tubes Frontend</strong>
        </a>
    </ul>
    <ul>
        <li><a href="/">Home</a></li>
        {#if $authenticated}
            <li><a href="/new_project">New Project</a></li>
            <li><a href="/ongoing_project">Ongoing Project</a></li>
            <li><a href="/tool_history">Tool History</a></li>
    
            <!-- {#if $token?.accessToken.abilities.includes('ADMINISTRATOR')}
            <li>
                <details role="list" dir="rtl">
                <summary aria-haspopup="listbox" role="link">Admin</summary>
                <ul role="listbox" data-theme="dark">
                    <li><a href="#a">Users</a></li>
                    <li><a href="#a">Tools</a></li>
                </ul>
                </details>
            </li>
            {/if} -->
            <li><a href="/logout">Logout</a></li>
        {:else}
            <li><a href="/login">Login</a></li>
        {/if}
    </ul>
</nav>