<script>
	import Loading from "$lib/components/Loading.svelte";
	import { fetch_api } from "$lib/components/fetch";
	import { authenticated } from "$lib/stores/store";
	import { toast } from "@zerodevx/svelte-toast";

	/**
	 * @type {{ [key: string]: string[] }}
	 */
     let errors = {};

    /**
     * @type {import('$lib/types/global').User[]}
     */
    let users = [];

    async function onMount() {
		const result = await fetch_api('api/users', {
			method: 'GET'
		});

		if (result.status == 200) {
			users = await result.json();
            return;
		}
		const { message, errors: json_err } = await result.json();

		toast.push(message, {
			classes: ['error']
		});
		const error_400 = {
			tool_material_id: [message],
			tool_product_id: [message],
			tool_item_id: [message]
		};
		errors = result.status === 422 ? json_err : error_400;



    }
    $: {
        if ($authenticated) {
            onMount();
        }
    }




</script>

<section class="container">
    <h1>Users</h1>
    <table>
        <thead>
            <tr>
                <th>Name</th>
                <th>Username</th>
                <th>Email</th>
                <th>Roles</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            {#each users as { name, username, email, role_names }}
            <tr>
                <td>{name}</td>
                <td>{username}</td>
                <td>{email}</td>
                <td>{role_names}</td>
            </tr>
            {/each}
    </table>
</section>