<script>
	import { user, authenticated, authenticating, token } from "$lib/stores/store";
</script>
<nav class="container-fluid">
    <ul>
        <a href="/" class="contrast">
            <strong>Estimated Tool Life</strong>
        </a>
    </ul>
    <ul>
        <li><a href="/">Home</a></li>
        {#if $authenticated}
            <li><a href="/project/new">New Project</a></li>
            <li><a href="/project/continue">Continue Project</a></li>
            <li><a href="/project/history">Tool History</a></li>
    
            {#if $token?.accessToken.abilities.includes('ADMINISTRATOR')}
            <li>
                <details role="list" dir="rtl">
                <summary aria-haspopup="listbox" role="link">Admin</summary>
                <ul role="listbox" data-theme="dark">
                    <li><a href="/admin/users">Users</a></li>
                    <li><a href="/admin/materials">Tool Materials</a></li>
                    <li><a href="/admin/products">Tool Products</a></li>
                </ul>
                </details>
            </li>
            {/if}
            <li><a href="/logout">Logout</a></li>
        {:else}
            <li><a href="/login">Login</a></li>
        {/if}
    </ul>
</nav>