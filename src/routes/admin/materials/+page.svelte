<script>
	import FormError from '$lib/components/FormError.svelte';
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
	 *     [key: number]: import('$lib/types/global').ToolMaterial & {
	 *       products_count: number
	 *     }
	 *   }
	 * }}
	 */
	let data = {
		materials: {}
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
		console.info('Loading Materials');
		const result = await fetch_api('api/tool/materials');

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
	 *   name: string,
	 *   description: string?
	 * }}
	 */
	let formData = {
		id: null,
		name: '',
		description: null
	};

	async function handleSubmit() {
		errors = {};
		
		const nullable = ['description'];
		nullable.forEach((key) => {
			// @ts-ignore
			if (!formData[key] || formData[key] == '') formData[key] = undefined;
		});

		const url = formData.id
			? 'api/tool/materials/' + formData.id
			: 'api/tool/materials';
		const result = await fetch_api(url, {
			method: formData.id ? 'PUT' : 'POST',
			body: JSON.stringify({
				...formData,
				id: undefined
			})
		});
		if (result.status == 201 || result.status == 200) {
			const model = await result.json();
			data.materials[model.id] = model;
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
		const result = await fetch_api(`api/tool/materials/${id}`, {
			method: 'DELETE'
		});
		if (result.status == 200) {
			// @ts-ignore
			data.materials = Object.keys(data.materials).reduce((acc, /** @type {number} */ key) => {
				if (key != id) {
					// @ts-ignore
					acc[key] = data.materials[key];
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
			name: '',
			description: null
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
			<h2>Materials</h2>
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
					<th>Description</th>
					<th>Products</th>
					<th>Last updated</th>
					<th>Actions</th>
				</tr>
			</thead>
			<tbody>
				{#if !loading}
					{#each Object.values(data.materials) as { id, name, description, products_count, updated_at }}
						<tr>
							<td>{name}</td>
							<td>{description ?? 'N/A'}</td>
							<td>{products_count}</td>
							<td>{updated_at}</td>
							<td class="flex">
								<a
									href="#edit"
									class="contrast"
									on:click={() => {
										// @ts-ignore
										formData = { ...formData, ...data.materials[id] };
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
<dialog bind:this={dialog} style="width: 100%;" on:close={handleReset}>
	<article style="width: 100%;">
		<form
			method="dialog"
			bind:this={form}
			on:submit|preventDefault={handleSubmit}
			on:reset={handleReset}
			autocomplete="off"
		>
			<h2>{!formData.id ? 'Create' : 'Edit'} Material</h2>
			<section class="grid">
				<label for="name">Name</label>
				<div>
					<input type="text" id="name" bind:value={formData.name} required />
					<FormError {errors} field="name" />
				</div>
			</section>
			<section class="grid">
				<label for="description">Description</label>
				<div>
					<textarea id="description" bind:value={formData.description} />
					<FormError {errors} field="description" />
				</div>
			</section>
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
