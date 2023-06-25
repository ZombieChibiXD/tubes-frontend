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
	 * @type {import('$lib/types/global').ToolProduct[]}
	 */
	let products = [];

	async function onMount() {
		const result = await fetch_api('api/tool-products', {
			method: 'GET'
		});

		if (result.status == 200) {
			products = await result.json();
			console.debug('Fetched Products: ', products);
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
	<h1>Products</h1>
	<table>
		<thead>
			<tr>
				<th>Name</th>
				<th>Code</th>
				<th>Min Speed</th>
				<th>Max Speed</th>
				<th>Actions</th>
			</tr>
		</thead>
		<tbody>
			{#if !loading}
				{#each products as { name, code, max_cutting_speed, min_cutting_speed, items, id }}
					<tr>
						<td>{name}</td>
						<td>{code}</td>
						<td>{min_cutting_speed}</td>
						<td>{max_cutting_speed}</td>
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
