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
			/**
			 * @type {import('$lib/types/global').MachiningProjectExtended[]}
			 */
			const machining_projects = await result.json();
			if (machining_projects.length === 0) {
				toast.push('No Tool History found', {
					classes: ['warning']
				});
				return;
			}
			/**
			 *
			 * @typedef {{
			 *   	Time: any;
			 *   	['Tool Material']: any;
			 *   	['Tool ID']: any;
			 *   	['Tool Number']: any;
			 *   	['Workpiece Material']: any;
			 *   	['Product ID']: any;
			 *   	['Initial Diameter (mm)']: any;
			 *   	['Final Diameter (mm)']: any;
			 *   	['Workpart Length (mm)']: any;
			 *   	['Machining Process']: any;
			 *   	['Cutting Speed (m/min)']: any;
			 *   	['Depth of Cut (mm)']: any;
			 *   	['Feeding (mm/rev)']: any;
			 *   	['Machining Time (min)']: any;
			 *   	['Product Quantity (pcs)']: any;
			 *   	['Early Tool Life (min)']: any;
			 *   	['Remaining Tool Life (min)']: any;
			 * }} ToolHistory
			 */
			/**
			 * @type {ToolHistory[]}
			 */
			let tool_histories = [];
			machining_projects.forEach((project) => {
				const {
					workpiece_material,
					cutting_speed,
					depth_of_cut,
					early_tool_life,
					feeding,
					machining_process,
					created_at,
					tool_material: { name: tool_material },
					tool_product: { code: product_code },
					tool_item: { item_code },
					machining_project_works
				} = project;
				let remaining_time = early_tool_life;
				tool_histories = tool_histories.concat({
					Time: created_at,
					'Tool Material': tool_material,
					'Tool ID': product_code,
					'Tool Number': item_code,
					'Workpiece Material': workpiece_material,
					'Product ID': null,
					'Initial Diameter (mm)': null,
					'Final Diameter (mm)': null,
					'Workpart Length (mm)': null,
					'Machining Process': machining_process,
					'Cutting Speed (m/min)': cutting_speed,
					'Depth of Cut (mm)': depth_of_cut,
					'Feeding (mm/rev)': feeding,
					'Machining Time (min)': null,
					'Product Quantity (pcs)': null,
					'Early Tool Life (min)': early_tool_life,
					'Remaining Tool Life (min)': remaining_time
				});
				tool_histories = tool_histories.concat(
					...machining_project_works.map(
						({
							updated_at,
							product_id,
							initial_diameter,
							final_diameter,
							workpart_length,
							machining_time,
							product_quantity
						}) => {
							remaining_time -= machining_time * product_quantity;
							return {
								Time: updated_at,
								'Tool Material': tool_material,
								'Tool ID': product_code,
								'Tool Number': item_code,
								'Workpiece Material': workpiece_material,
								'Product ID': product_id,
								'Initial Diameter (mm)': initial_diameter,
								'Final Diameter (mm)': final_diameter,
								'Workpart Length (mm)': workpart_length,
								'Machining Process': machining_process,
								'Cutting Speed (m/min)': cutting_speed,
								'Depth of Cut (mm)': depth_of_cut,
								'Feeding (mm/rev)': feeding,
								'Machining Time (min)': machining_time,
								'Product Quantity (pcs)': product_quantity,
								'Early Tool Life (min)': early_tool_life,
								'Remaining Tool Life (min)': remaining_time
							};
						}
					)
				);
			});
			const items = tool_histories;
			// @ts-ignore
			const replacer = (key, value) => (value === null ? '' : value); // specify how you want to handle null values here
			const header = Object.keys(items[0]);
			const csv = [
				header.join(','), // header row first
				...items.map((row) =>
					// @ts-ignore
					header.map((fieldName) => JSON.stringify(row[fieldName], replacer)).join(',')
				)
			].join('\r\n');

			console.log(csv);
			toast.push('Downloading Tool History shortly..', {
				classes: ['success']
			});
			const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
			const url = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.setAttribute('href', url);
			link.setAttribute('download', 'tool_history.csv');
			link.style.visibility = 'hidden';
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
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
