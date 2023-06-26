<script>
	import FormComponent from '$lib/components/FormComponent.svelte';
	import Loading from '$lib/components/Loading.svelte';
	import { fetch_api } from '$lib/components/fetch';
	import { toasts } from '$lib/components/toasts';
	import { authenticated } from '$lib/stores/store';
	import { onDestroy } from 'svelte';

	let loading = true;
	/**
	 * @type {{ [key: string]: string[] }}
	 */
	let errors = {};

	/**
	 * @type {{
	 *   materials: {
	 *     [key: number]: import('$lib/types/global').ToolMaterial
	 *   },
	 *   products: {
	 * 	   [key: number]: import('$lib/types/global').ToolProduct & {
	 * 	       toolboxes_count: number
	 *     }
	 *   }
	 * }}
	 */
	let data = {
		materials: {},
		products: {}
	};

	const interval = setInterval(() => {
		if ($authenticated) {
			load();
		}
	}, 10000);
	onDestroy(() => {
		errors = {};
		clearInterval(interval);
	});

	async function load() {
		console.info('Loading Products');
		const result = await fetch_api('api/tool/products');

		if (result.status == 200) {
			data = await result.json();
			return;
		}
		const { message, errors: json_err } = await result.json();

		toasts.danger(message);
		errors = json_err ?? {};
	}

	/**
	 * @type {HTMLDialogElement}
	 */
	let dialog;
	/**
	 * @type {HTMLFormElement}
	 */
	let form;

	/**
	 * @type {{
	 *   id: number?,
	 *   name: string?,
	 *   tool_material_id: number | '',
	 *   code: string,
	 *   prefix: string,
	 *   min_cutting_speed: number | '',
	 *   max_cutting_speed: number | '',
	 * }}
	 */
	let formData = {
		id: null,
		name: null,
		code: '',
		prefix: '',
		tool_material_id: '',
		min_cutting_speed: '',
		max_cutting_speed: ''
	};

	async function handleSubmit() {
		errors = {};
		const nullable = ['name'];
		nullable.forEach((key) => {
			// @ts-ignore
			if (!formData[key] || formData[key] == '') formData[key] = undefined;
		});
		const url = formData.id ? 'api/tool/products/' + formData.id : 'api/tool/products';
		const result = await fetch_api(url, {
			method: formData.id ? 'PUT' : 'POST',
			body: JSON.stringify(formData)
		});
		if (result.status == 201 || result.status == 200) {
			const model = await result.json();
			console.log('model', model);
			data.products[model.id] = model;
			dialog.close();
			form.reset();
			return;
		}
		const { message, errors: json_err } = await result.json();
		toasts.danger(message);
		errors = json_err ?? {};
		if (result.status == 404) {
			Object.keys(formData).forEach((key) => {
				errors[key] = [message];
			});
		}
	}
	/**
	 * Delete model
	 * @param {number} id
	 */
	async function handleDelete(id) {
		errors = {};
		const result = await fetch_api(`api/tool/products/${id}`, {
			method: 'DELETE'
		});
		if (result.status == 200) {
			// @ts-ignore
			data.products = Object.keys(data.products).reduce((acc, /** @type {number} */ key) => {
				if (key != id) {
					// @ts-ignore
					acc[key] = data.products[key];
				}
				return acc;
			}, {});
			return;
		}
		const { message, errors: json_err } = await result.json();
		errors = json_err ?? {};
		toasts.danger(message);
	}
	function handleReset() {
		formData = {
			id: null,
			name: null,
			code: '',
			prefix: '',
			tool_material_id: '',
			min_cutting_speed: '',
			max_cutting_speed: ''
		};
	}
	$: {
		if ($authenticated) {
			load().finally(() => {
				loading = false;
			});
		}
	}
</script>

<section class="container">
	<article>
		<header style="display: flex; align-items: center; justify-content: space-between;">
			<h2>Products</h2>
			<a
				href="#form"
				role="button"
				on:click={() => {
					handleReset();
					dialog.showModal();
				}}>Add</a
			>
		</header>
		<table>
			<thead>
				<tr>
					<th>Name</th>
					<th>Material</th>
					<th>Min Sp.</th>
					<th>Max Sp.</th>
					<th>Toolboxes</th>
					<th>Actions</th>
				</tr>
			</thead>
			<tbody>
				{#if !loading}
					{@const materials = data.materials}
					{#each Object.values(data.products) as { id, name, code, prefix, max_cutting_speed, min_cutting_speed, tool_material_id, toolboxes_count, updated_at }}
						<tr>
							<td>
								{#if name}
									<h6>{name}</h6>
								{/if}
								<div style="display: flex; flex-direction: column;">
									<strong>{prefix}</strong>
									<small>{code}</small>
								</div>
							</td>
							<td>{materials[tool_material_id].name}</td>
							<td>{min_cutting_speed}</td>
							<td>{max_cutting_speed}</td>
							<td>{toolboxes_count}</td>
							<td class="flex">
								<a
									href="#edit"
									class="contrast"
									on:click={() => {
										// @ts-ignore
										formData = { ...formData, ...data.products[id] };
										dialog.showModal();
									}}
									role="button">Edit</a
								>
								<a
									href="#delete"
									class="secondary"
									on:click={() => {
										handleDelete(id);
									}}
									role="button">Delete</a
								>
							</td>
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
	</article>
</section>

<!-- Dialog form -->
{#if $authenticated}
	<dialog bind:this={dialog} style="width: 100%;" on:close={handleReset}>
		<article style="width: 100%;">
			<form
				method="dialog"
				bind:this={form}
				on:submit|preventDefault={handleSubmit}
				on:reset={handleReset}
				autocomplete="off"
			>
				<h2>{!formData.id ? 'Create' : 'Edit'} Product</h2>
				<FormComponent {errors} name="tool_material_id" let:field>
					<select id={field} bind:value={formData.tool_material_id}>
						<option value="">Select a material</option>
						{#each Object.values(data.materials) as { id, name }}
							<option value={id}>{name}</option>
						{/each}
					</select>
				</FormComponent>
				<FormComponent {errors} name="code" let:field>
					<input type="text" id={field} bind:value={formData.code} />
				</FormComponent>
				<FormComponent {errors} name="prefix" let:field>
					<input type="text" id={field} bind:value={formData.prefix} />
				</FormComponent>
				<FormComponent {errors} name="name" label="Name" let:field>
					<input type="text" id={field} bind:value={formData.name} />
				</FormComponent>
				<FormComponent {errors} name="min_cutting_speed" let:field>
					<input type="number" id={field} bind:value={formData.min_cutting_speed} />
				</FormComponent>
				<FormComponent {errors} name="max_cutting_speed" let:field>
					<input
						type="number"
						min={formData.min_cutting_speed}
						id={field}
						bind:value={formData.max_cutting_speed}
					/>
				</FormComponent>
				<hr />
				<footer style="display: flex; flex-direction: row; justify-content: end; gap: 1rem">
					<a
						href="#cancel"
						class="secondary"
						role="button"
						on:click={() => {
							dialog.close();
							form.reset();
						}}
					>
						Close
					</a>
					<a href="#submit" class="primary" role="button" on:click={() => form.requestSubmit()}>
						Submit
					</a>
				</footer>
			</form>
		</article>
	</dialog>
{/if}
