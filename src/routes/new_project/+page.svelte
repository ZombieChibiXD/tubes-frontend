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
	/** @type {string} */
	let workpiece_material;
	/** @type {string} */
	let machining_process;
	/** @type {number | undefined} */
	let cutting_speed;
	/** @type {number} */
	let depth_of_cut;
	/** @type {number} */
	let feeding;
	/** @type {number | undefined} */
	let early_tool_life;

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

	console.log('New Project Page');
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

	const reset_on_tool_item_change = () => {
		tool_item_id = '';
		cutting_speed = undefined;
	};

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
	$: {
		const include = false;
		// Filter projects by selected tool product
		// Map to get tool_item_id
		const tool_item_ids_set = new Set(
			projects
				.filter(({ tool_product_id }) => tool_product_id == selected_tool_product?.id)
				.map(({ tool_item_id }) => tool_item_id)
		);
		// If include is true, filter tool items by tool_item_ids_set
		// If include is false, filter tool items by not tool_item_ids_set
		tool_items =
			selected_tool_product?.items?.filter(({ id }) =>
				include ? tool_item_ids_set.has(id) : !tool_item_ids_set.has(id)
			) ?? [];
	}

	$: early_tool_life =
		cutting_speed === undefined
			? undefined
			: Math.round(Math.pow(machining.c / cutting_speed, 1 / machining.n));

	const handleSubmit = async () => {
		const form = {
			tool_material_id,
			tool_product_id,
			tool_item_id,
			workpiece_material,
			machining_process,
			cutting_speed,
			depth_of_cut,
			feeding,
			early_tool_life
		};

		console.log(form);

		const result = await fetch_api('api/project', {
			method: 'POST',
			body: JSON.stringify(form)
		});

		if (result.status === 201) {
			const new_project = await result.json();
			console.log('Before', data);
			data = {
				...data,
				projects: [...projects, new_project]
			};
			console.log('After', data);
			reset_on_tool_item_change();
			toast.push('Project created successfully', {
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
	<h1>New Project</h1>
	<form class="card" on:submit|preventDefault={handleSubmit}>
		<fieldset>
			<legend>
				Tool & Workpiece Material
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
						on:change={reset_on_tool_item_change}
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

			<section class="grid">
				<label for="workpiece_material">Workpiece material</label>
				<div>
					<select bind:value={workpiece_material} id="workpiece_material" required>
						<option value="">Select Workpiece Material</option>
						{#each machining.workpiece_materials as material}
							<option value={material}>{material}</option>
						{/each}
					</select>
					<FormError {errors} field="workpiece_material" />
				</div>
			</section>
		</fieldset>
		<fieldset>
			<legend>
				Machining Operations
			</legend>
			<section class="grid">
				<label for="machining_process">Machining Process</label>
				<div>
					<select bind:value={machining_process} id="machining_process" required>
						<option value="">Select Machining Process</option>
						{#each machining.machining_processes as process}
							<option value={process}>{process}</option>
						{/each}
					</select>
					<FormError {errors} field="machining_process" />
				</div>
			</section>
			<section class="grid">
				<label for="cutting_speed_text">Cutting Speed</label>
				<div>
					<input
						type="range"
						id="cutting_speed_slider"
						bind:value={cutting_speed}
						min={selected_tool_product?.min_cutting_speed}
						max={selected_tool_product?.max_cutting_speed}
						disabled={!selected_tool_product}
						required
					/>
					<input
						type="number"
						id="cutting_speed_text"
						placeholder="Cutting Speed (m/min)"
						readonly={!selected_tool_product}
						min={selected_tool_product?.min_cutting_speed}
						max={selected_tool_product?.max_cutting_speed}
						bind:value={cutting_speed}
						required
					/>
					<FormError {errors} field="cutting_speed" />
				</div>
			</section>
			<section class="grid">
				<label for="depth_of_cut">Depth of cut</label>
				<div>
					<input
						type="number"
						id="depth_of_cut"
						placeholder="Depth of cut (mm)"
						step="0.001"
						bind:value={depth_of_cut}
						required
					/>
					<FormError {errors} field="depth_of_cut" />
				</div>
			</section>
			<section class="grid">
				<label for="feeding">Feeding</label>
				<div>
					<input
						type="number"
						id="feeding"
						placeholder="Feeding (mm/rev)"
						step="0.001"
						bind:value={feeding}
						required
					/>
					<FormError {errors} field="feeding" />
				</div>
			</section>
		</fieldset>
		<fieldset>
			<legend>
				Tool Conditions
			</legend>
			<section class="grid">
				<label for="early_tool_life">Early tool life</label>
				<div>
					<input
						type="number"
						id="early_tool_life"
						placeholder="Early tool life (min)"
						bind:value={early_tool_life}
						readonly
						required
					/>
					<FormError {errors} field="early_tool_life" />
				</div>
			</section>
		</fieldset>
		<button type="submit" class="submit_button">Start &amp; Save</button>
	</form>
</section>

<style>
	fieldset {
		box-shadow: 10px 10px 4px 0 rgba(0, 0, 0, 0.2);
		border-radius: .5rem;
		border: 1px solid #ccc;
		padding: 1rem 0rem;
	}
	fieldset > legend {
		padding: 0.5rem;
		color: #ccc;
		background-color: rgb(11, 49, 153);
		width: 100%;
		font-size: xx-large;
		border: 1px solid #d8d8d8;
	}
	fieldset > section {
		padding: 0.5rem 2rem;
	}
	.submit_button {
		margin: 2rem auto;
		width: 50%;
		
	}
</style>