<script>
	import Loading from '$lib/components/Loading.svelte';
	import { fetch_api } from '$lib/components/fetch';
	import { authenticated } from '$lib/stores/store';
	import { toast } from '@zerodevx/svelte-toast';

	let loading = true;

	/**
	 * @type {{ [key: string]: string[] }}
	 */
	let errors = {};

	/**
	 * @type {import('$lib/types/global').ToolMaterial[]}
	 */
	let materials = [];

	async function onMount() {
		const result = await fetch_api('api/tool-materials', {
			method: 'GET'
		});

		if (result.status == 200) {
			materials = await result.json();
			console.debug('Fetched Materials: ', materials);
			return;
		}
		const { message, errors: json_err } = await result.json();

		toast.push(message, {
			classes: ['danger']
		});
		const error_400 = {};
		errors = result.status === 422 ? json_err : error_400;
	}
	$: {
		if ($authenticated) {
			onMount().finally(() => {
				loading = false;
			});
		}
	}
</script>

<section class="container">
	<h1>Materials</h1>
	<table>
		<thead>
			<tr>
				<th>Name</th>
				<th>Description</th>
				<th>Products</th>
				<th>Last updated</th>
				<th>Actions</th>
			</tr>
		</thead>
		<tbody>
			{#if !loading}
				{#each materials as { name, description, products, updated_at, id }}
					<tr>
						<td>{name}</td>
						<td>{description}</td>
						<td>{products?.length ?? 0}</td>
						<td>{updated_at}</td>
					</tr>
				{:else}
					<tr>
						<td colspan="5" style="text-align: center; vertical-align: middle;">
							<p>No materials found.</p>
						</td>
					</tr>
				{/each}
			{:else}
				<tr>
					<td colspan="5" style="">
						<Loading />
					</td>
				</tr>
			{/if}
		</tbody>
	</table>
</section>
