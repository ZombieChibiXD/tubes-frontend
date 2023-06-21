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

	/**
	 * @type {HTMLFormElement}
	 */
	let form;

	// Form fields
	/** @type {number | string} */
	let tool_material_id;
	/** @type {number | string} */
	let tool_product_id;
	/** @type {number | string} */
	let tool_item_id;
	
	/** @type {string} */
	let product_id;
	/** @type {number} */
	let initial_diameter;
	/** @type {number} */
	let final_diameter;
	/** @type {number} */
	let workpart_length;
	
	/** @type {number} */
	let machining_time;

	/** @type {number} */
	let product_quantity;

	
	/** @type {number | undefined} */
	let remaining_tool_life;

	/** @type {import('$lib/types/global').MachiningProject | any} */
	const no_machining_project = {
		id: undefined,
		tool_material_id: undefined,
		tool_product_id: undefined,
		tool_item_id: undefined,
		workpiece_material: undefined,
		machining_process: undefined,
		cutting_speed: undefined,
		feeding: undefined,
		depth_of_cut: undefined,
		early_tool_life: undefined,
		created_at: undefined,
		updated_at: undefined,
		is_active: false
	};

	/**
	 * @type {import('$lib/types/global').MachiningProject}
	 */
	let machining_project = no_machining_project;

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
			goto('/login?redirect=/ongoing_project');
		}
	}

	console.log('On-going Project Page');
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
	const placeholder = 'Select a tool item...';

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

	$: {
		selected_tool_product = selected_tool_material?.products?.find(
		(/** @type {{ id: number; }} */ item) => item.id == tool_product_id
		);
	}
	/**
	 * @type {import("$lib/types/global").ToolItem[]}
	 */
	let tool_items = [];
	$: {
		const include = true;
		// Filter projects by selected tool product
		// Map to get tool_item_id
		const tool_item_ids_set = new Set(
			projects
				.filter(({ tool_material_id, tool_product_id }) => tool_product_id == selected_tool_product?.id && tool_material_id == selected_tool_material?.id)
				.map(({ tool_item_id }) => tool_item_id)
		);
		// If include is true, filter tool items by tool_item_ids_set
		// If include is false, filter tool items by not tool_item_ids_set
		tool_items =
			selected_tool_product?.items?.filter(({ id }) =>
				include ? tool_item_ids_set.has(id) : !tool_item_ids_set.has(id)
			) ?? [];
	}

	$: {
		machining_project = projects.find(({ tool_item_id: item_id }) => tool_item_id == item_id) ?? no_machining_project;
		console.log('Choosing Machining Project', machining_project);
	}
	
	$: {
		if (machining_time || product_quantity) {
			remaining_tool_life = undefined;
			errors.machining_time = [];
			errors.product_quantity = [];
			errors.remaining_tool_life = [];
		}
	}

	const calculate_tool_life = () => {
		if (!form.reportValidity()) return;

		remaining_tool_life = machining_project.early_tool_life - machining_time * product_quantity;
		if (remaining_tool_life < 0) {
			errors = {
				machining_time: ['Machining time is too long.'],
				product_quantity: ['Product quantity is too much.'],
				remaining_tool_life: ['Remaining tool life is negative.']
			};
		}
	}
	const handleSubmit = async () => {
		const formData = {
			machining_project_id: machining_project.id,
			machining_time,
			product_id,
			initial_diameter,
			final_diameter,
			workpart_length,
			product_quantity
		};

		console.log(formData);

		const result = await fetch_api('api/project/ongoing', {
			method: 'POST',
			body: JSON.stringify(formData)
		});

		if (result.status === 201) {
			/** @type {import('$lib/types/global').MachiningProject} */
			const machining_project = await result.json();
			toast.push('Added project', {
				classes: ['success']
			});
			if (!machining_project.is_active) {
				toast.push('Project has been finished.', {
					classes: ['warning']
				});
				projects = projects.filter(({ id }) => id != machining_project.id);
			}
			form.reset();
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
	<title>Ongoing Project</title>
	<meta name="description" content="Ongoing Project" />
</svelte:head>

<section class="container">
	<form on:submit|preventDefault={handleSubmit} id="form" bind:this={form}>
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
						id="tool_product_id"
						on:change={() => (tool_item_id = '')}
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
					<input
						type="text"
						bind:value={machining_project.workpiece_material}
						id="workpiece_material"
						{placeholder}
						readonly
					/>
					<FormError {errors} field="workpiece_material" />
				</div>
			</section>
		</fieldset>
		<fieldset>
			<legend>
				<h3>Product Specifications</h3>
			</legend>
			<section class="grid">
				<label for="product_id">Product Id</label>
				<div>
					<input
						type="text"
						bind:value={product_id}
						placeholder="Product id"
						required
					/>
					<FormError {errors} field="product_id" />
				</div>
			</section>
			<section class="grid">
				<label for="initial_diameter">Initial Diameter</label>
				<div>
					<input
						type="number"
						bind:value={initial_diameter}
						placeholder="Initial Diameter (mm)"
						required
					/>
					<FormError {errors} field="initial_diameter" />
				</div>
			</section>
			<section class="grid">
				<label for="final_diameter">Final Diameter</label>
				<div>
					<input
						type="number"
						bind:value={final_diameter}
						placeholder="Final Diameter (mm)"
						required
					/>
					<FormError {errors} field="final_diameter" />
				</div>
			</section>
			<section class="grid">
				<label for="workpart_length">Workpart Length</label>
				<div>
					<input
						type="number"
						bind:value={workpart_length}
						placeholder="Workpart Length (mm)"
						required
					/>
					<FormError {errors} field="workpart_length" />
				</div>
			</section>
		</fieldset>
		<fieldset>
			<legend>
				<h3>Machining Operations</h3>
			</legend>
			<section class="grid">
				<label for="machining_process">Machining Process</label>
				<div>
					<input
						type="text"
						bind:value={machining_project.machining_process}
						id="machining_process"
						{placeholder}
						readonly
					/>
					<FormError {errors} field="machining_process" />
				</div>
			</section>
			<section class="grid">
				<label for="cutting_speed_text">Cutting Speed</label>
				<div>
					<input
						type="range"
						id="cutting_speed_slider"
						bind:value={machining_project.cutting_speed}
						min={selected_tool_product?.min_cutting_speed}
						max={selected_tool_product?.max_cutting_speed}
						disabled
					/>
					<input
						type="number"
						id="cutting_speed_text"
						{placeholder}
						min={selected_tool_product?.min_cutting_speed}
						max={selected_tool_product?.max_cutting_speed}
						bind:value={machining_project.cutting_speed}
						readonly
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
						step="0.01"
						bind:value={machining_project.depth_of_cut}
						{placeholder}
						readonly
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
						step="0.01"
						bind:value={machining_project.feeding}
						{placeholder}
						readonly
					/>
					<FormError {errors} field="feeding" />
				</div>
			</section>
			<section class="grid">
				<label for="machining_time">Machining Time</label>
				<div>
					<input
						type="number"
						id="machining_time"
						step="1"
						bind:value={machining_time}
						placeholder="Machining Time (min)"
						required
					/>
					<FormError {errors} field="machining_time" />
				</div>
			</section>
			<section class="grid">
				<label for="product_quantity">Product Quantity</label>
				<div>
					<input
						type="number"
						id="product_quantity"
						step="1"
						bind:value={product_quantity}
						placeholder="Product Quantity (pcs.)"
						required
					/>
					<FormError {errors} field="product_quantity" />
					<button type="button" on:click={calculate_tool_life}>Calculate tool life</button>
				</div>
			</section>
		</fieldset>
		<fieldset>
			<legend>
				<h3>Tool Conditions</h3>
			</legend>
			<section class="grid">
				<label for="early_tool_life">Early tool life</label>
				<div>
					<input
						type="number"
						id="early_tool_life"
						bind:value={machining_project.early_tool_life}
						{placeholder}
						readonly
					/>
					<FormError {errors} field="early_tool_life" />
				</div>
			</section>
			<section class="grid">
				<label for="remaining_tool_life">Remaining tool life</label>
				<div>
					<input
						type="number"
						id="remaining_tool_life"
						bind:value={remaining_tool_life}
						min="0"
						placeholder="Remaining tool life (min)"
						readonly
					/>
					<FormError {errors} field="remaining_tool_life" />
				</div>
			</section>
		</fieldset>
		<button>Start &amp; Save</button>
	</form>
</section>
