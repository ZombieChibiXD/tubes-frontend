<script>
	import { page } from '$app/stores';
	import FormComponent from '$lib/components/FormComponent.svelte';
	import Loading from '$lib/components/Loading.svelte';
	import { fetch_api } from '$lib/components/fetch';
	import { toasts } from '$lib/components/toasts';
	import { authenticated } from '$lib/stores/store';
	import { onDestroy } from 'svelte';
	const page_id = $page.params.id;

	let loading = true;
	/**
	 * @type {{ [key: string]: string[] }}
	 */
	let errors = {};

	/**
	 * @type {import('$lib/types/global').ToolProduct & {
	 *     toolboxes: (import('$lib/types/global').ToolProductToolbox & {
	 * 			tool_items_count: number
	 *     })[]
	 * }}
	 */
	let data;

	const interval = setInterval(() => {
		if ($authenticated) {
			load();
		}
	}, 10000);
	onDestroy(() => {
		errors = {};
		clearInterval(interval);
	});

	$: {
		if ($authenticated) {
			load().finally(() => {
				loading = false;
			});
		}
	}

	async function load() {
		console.info('Loading Product Details');
		const result = await fetch_api(`api/tool/products/${page_id}`);

		if (result.status == 200) {
			data = await result.json();
			console.log(data);
			return;
		}
		const { message, errors: json_err } = await result.json();

		toasts.danger(message);
		errors = json_err ?? {};
	}

	async function addToolbox() {
		console.info('Loading Product Details');
		const result = await fetch_api(`api/tool/products/${page_id}/toolbox`, {
			method: 'POST'
		});

		if (result.status == 200) {
			data = await result.json();
			console.log(data);
			return;
		}
		const { message, errors: json_err } = await result.json();

		toasts.danger(message);
		errors = json_err ?? {};

	}
</script>

<section class="container">
	<article>
		<header style="display: flex; align-items: center; justify-content: space-between;">
			<h2>Product Details</h2>
			<a href="#form" role="button" on:click={addToolbox}>Add</a>
		</header>
		{#if loading}
			<Loading />
		{:else}
			<h3>Toolboxes</h3>
			<table>
				<thead>
					<tr>
						<th>Tool ID</th>
						<th>Items</th>
						<th>Created At</th>
					</tr>
				</thead>
				<tbody>
					{#each data.toolboxes as { code, created_at, tool_items_count }}
						<tr>
							<td>{data.prefix}-{code}</td>
							<td>{tool_items_count}</td>
							<td>{created_at}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</article>
</section>
