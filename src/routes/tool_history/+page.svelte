<script>
	import { goto } from '$app/navigation';
	import FormError from '$lib/components/FormError.svelte';
	import { fetch_api } from '$lib/components/fetch';
	import {
		ToolMaterialWithProductWithItem,
		WorkpieceMaterials,
		MachiningProcesses,
		MachiningC,
		MachiningN,
		MachiningProjects
	} from '$lib/constants/tool';
	import { authenticating, authenticated } from '$lib/stores/store';
	import { toast } from '@zerodevx/svelte-toast';

	/**
	 * @type {{ [key: string]: string[] }}
	 */
	let errors = {};

	// Form fields
	/** @type {number | string} */
	let tool_material_id;
	/** @type {number | string} */
	let tool_product_id;
	/** @type {number | string} */
	let tool_item_id;

	async function load() {
		const result = await fetch_api('api/project', {
			method: 'GET'
		});

		if (result.status == 200) {
			data = await result.json();
			tool_material_id = '';
		}
	}

	$: {
		if (!$authenticating && $authenticated) {
			load();
		} else if (!$authenticating && !$authenticated) {
			goto('/login?redirect=/new_project');
		}
	}

	console.log('Tool History Page');
	/**
	 * @typedef {{
	 *     workpiece_materials: string[];
	 *     machining_processes: string[];
	 *     c: number;
	 *     n: number;
	 * }} MachiningData
	 */
	/**
	 * @typedef {{
	 *   materials: import('$lib/types/global').ToolMaterial[];
	 *   projects: import('$lib/types/global').MachiningProject[];
	 *   machining: MachiningData;
	 * }} ProjectData
	 */
	//** @type {ProjectData} */
	let data = {
		materials: ToolMaterialWithProductWithItem,
		projects: MachiningProjects,
		machining: {
			workpiece_materials: WorkpieceMaterials,
			machining_processes: MachiningProcesses,
			c: MachiningC,
			n: MachiningN
		}
	};
	/** @type {import('$lib/types/global').ToolMaterial[]} */
	let materials = [];
	/** @type {import('$lib/types/global').MachiningProject[]} */
	let projects = [];
	/** @type {MachiningData} */
	let machining = {
		workpiece_materials: [],
		machining_processes: [],
		c: 0,
		n: 0
	};
	const sync_data = (/** @type {ProjectData} */ data) => {
		console.warn('sync_data', data);
		materials = data.materials;
		projects = data.projects;
		machining = data.machining;
	};

	$: sync_data(data);


	/**
	 * @type {import('$lib/types/global').ToolMaterial | undefined}
	 */
	let selected_tool_material;

	/**
	 * @type {import('$lib/types/global').ToolProduct | undefined}
	 */
	let selected_tool_product;

	$: selected_tool_material = materials?.find((item) => item.id == tool_material_id);

	/**
	 * @type {import("$lib/types/global").ToolProduct[]}
	 */
	let tool_products = [];
	$: tool_products = selected_tool_material?.products ?? [];

	$: selected_tool_product = selected_tool_material?.products?.find(
		(/** @type {{ id: number; }} */ item) => item.id == tool_product_id
	);
	/**
	 * @type {import("$lib/types/global").ToolItem[]}
	 */
	let tool_items = [];
	$: tool_items = selected_tool_product?.items ?? [];

	const handleSubmit = async () => {
		const form = {
			tool_material_id,
			tool_product_id,
			tool_item_id
		};

		console.log(form);

		const result = await fetch_api('api/project/tool/history', {
			method: 'POST',
			body: JSON.stringify(form)
		});

		if (result.status === 200) {
			toast.push('Downloading Tool History shortly..', {
				classes: ['success']
			});
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
	};
</script>

<svelte:head>
	<title>New Project</title>
	<meta name="description" content="Create a new project" />
</svelte:head>

<section class="container">
	<form on:submit|preventDefault={handleSubmit}>
		<fieldset>
			<legend>
				<h3>Tool & Workpiece Material</h3>
			</legend>
			<section class="grid">
				<label for="tool_material_id">Tool Material</label>
				<div>
					<select
						bind:value={tool_material_id}
						on:change={() => (tool_product_id = '')}
						id="tool_material_id"
						required
					>
						<option value="">
							{#if !materials || materials.length == 0}
								No Available Tool Materials Found
							{:else}
								Select Tool Material
							{/if}
						</option>
						{#each materials as { id, name }}
							<option value={id}>{name}</option>
						{/each}
					</select>
					<FormError {errors} field="tool_material_id" />
				</div>
			</section>
			<section class="grid">
				<label for="tool_product_id">Tool Product</label>
				<div>
					<select
						bind:value={tool_product_id}
						on:change={() => (tool_item_id = '')}
						id="tool_product_id"
						required
					>
						<option value="">
							{#if !selected_tool_material}
								Select Tool Material First
							{:else if tool_products.length == 0}
								No Available Tool Products Found
							{:else}
								Select Tool Product
							{/if}
						</option>
						{#each tool_products as { id, code, name }}
							<option value={id}>{code}{name ? ' - ' + name : ''}</option>
						{/each}
					</select>
					<FormError {errors} field="tool_product_id" />
				</div>
			</section>
			<section class="grid">
				<label for="tool_item_id">Tool Item</label>
				<div>
					<select bind:value={tool_item_id} id="tool_item_id" required>
						<option value="">
							{#if !selected_tool_product}
								Select Tool Product First
							{:else if tool_items.length == 0}
								No Available Tool Items Found
							{:else}
								Select Tool Item
							{/if}
						</option>
						{#each tool_items as { id, item_code }}
							<option value={id}>{item_code}</option>
						{/each}
					</select>
					<FormError {errors} field="tool_item_id" />
				</div>
			</section>
		</fieldset>
		<button>Download Tool History</button>
	</form>
</section>
