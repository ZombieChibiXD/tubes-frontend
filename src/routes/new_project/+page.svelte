<script>
	import { goto } from '$app/navigation';
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
	 *   materials: import('$lib/types/global').ToolMaterial[];
	 *   projects: import('$lib/types/global').MachiningProject[];
	 *   machining: {
	 *     workpiece_materials: string[];
	 *     machining_processes: string[];
	 *     c: number;
	 *     n: number;
	 *   };
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
	let { materials, projects, machining } = data;

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
			return;
		}
		const { message, errors: json_err } = await result.json();

		errors =
			result.status === 422
				? json_err
				: {
						tool_material_id: [message],
						tool_product_id: [message],
						tool_item_id: [message]
				  };
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
				{#if errors?.tool_material_id}
					<ul style="font-size: small; color: red;">
						{#each errors.tool_material_id as error}
							<li>{error}</li>
						{/each}
					</ul>
				{/if}
			</section>
			<section class="grid">
				<label for="tool_product_id">Tool Product</label>
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
				{#if errors?.tool_product_id}
					<ul style="font-size: small; color: red;">
						{#each errors.tool_product_id as error}
							<li>{error}</li>
						{/each}
					</ul>
				{/if}
			</section>
			<section class="grid">
				<label for="tool_item_id">Tool Item</label>
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
				{#if errors?.tool_item_id}
					<ul style="font-size: small; color: red;">
						{#each errors.tool_item_id as error}
							<li>{error}</li>
						{/each}
					</ul>
				{/if}
			</section>

			<section class="grid">
				<label for="workpiece_material">Workpiece material</label>
				<select bind:value={workpiece_material} id="workpiece_material" required>
					<option value="">Select Workpiece Material</option>
					{#each machining.workpiece_materials as material}
						<option value={material}>{material}</option>
					{/each}
				</select>
			</section>
		</fieldset>
		<fieldset>
			<legend>
				<h3>Machining Operations</h3>
			</legend>
			<section class="grid">
				<label for="machining_process">Machining Process</label>
				<select bind:value={machining_process} id="machining_process" required>
					<option value="">Select Machining Process</option>
					{#each machining.machining_processes as process}
						<option value={process}>{process}</option>
					{/each}
				</select>
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
				</div>
			</section>
			<section class="grid">
				<label for="depth_of_cut">Depth of cut</label>
				<input
					type="number"
					id="depth_of_cut"
					placeholder="Depth of cut (mm)"
					step="0.001"
					bind:value={depth_of_cut}
					required
				/>
			</section>
			<section class="grid">
				<label for="feeding">Feeding</label>
				<input
					type="number"
					id="feeding"
					placeholder="Feeding (mm/rev)"
					step="0.001"
					bind:value={feeding}
					required
				/>
			</section>
		</fieldset>
		<fieldset>
			<legend>
				<h3>Tool Conditions</h3>
			</legend>
			<section class="grid">
				<label for="early_tool_life">Early tool life</label>
				<input
					type="number"
					id="early_tool_life"
					placeholder="Early tool life (min)"
					bind:value={early_tool_life}
					readonly
					required
				/>
			</section>
		</fieldset>
		<button>Start &amp; Save</button>
	</form>
</section>
