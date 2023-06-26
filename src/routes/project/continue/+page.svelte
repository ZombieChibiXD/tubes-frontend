<script>
	import { goto } from '$app/navigation';
	import FormError from '$lib/components/FormError.svelte';
	import { fetch_api } from '$lib/components/fetch';
	import { MachiningData } from '$lib/constants/tool';
	import { authenticating, authenticated } from '$lib/stores/store';
	import ToolSelector from '../ToolSelector.svelte';
	import WorkpieceMachiningSelector from '../WorkpieceMachiningSelector.svelte';
	import { toasts } from '$lib/components/toasts';

	/**
	 * @type {{ [key: string]: string[] }}
	 */
	let errors = {};

	/**
	 * @type {import('$lib/types/global').ToolProduct | undefined}
	 */
	let tool_product;
	/**
	 * @type {import('$lib/types/global').ToolItem | undefined}
	 */
	let tool_item;

	/**
	 * @type {HTMLFormElement}
	 */
	let form;

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


	/**
	 * @type {import('$lib/types/global').MachiningProject | undefined}
	 */
	let machining_project;
	/**
	 * @type {{
	 * 	cutting_speed: string | number,
	 * 	depth_of_cut: string | number,
	 * 	feeding: string | number,
	 * 	machining_process: string,
	 * 	workpiece_material: string
	 * }}
	 */
	const default_readonly_values = {
		cutting_speed: '',
		depth_of_cut: '',
		feeding: '',
		machining_process: '',
		workpiece_material: ''
	}
	let readonly_values = default_readonly_values;

	$: {
		if (machining_project) {
			const { cutting_speed, depth_of_cut, feeding, machining_process, workpiece_material } = machining_project;
			readonly_values = {
				cutting_speed,
				depth_of_cut,
				feeding,
				machining_process,
				workpiece_material
			}
			// If any of the values are undefined, then replace it with the default value
			for (const key in readonly_values) {
				// @ts-ignore
				if (readonly_values[key] === undefined) {
					// @ts-ignore
					readonly_values[key] = default_readonly_values[key];
				}
			}
		}
	}

	async function load() {
		const result = await fetch_api('api/project/form?filter=ACTIVE', {
			method: 'GET'
		});

		if (result.status == 200) {
			data = await result.json();
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
	/** @type {import('$lib/types/global').ProjectData} */
	let data = {
		materials: [],
		projects: [],
		colors: {},
		machining: MachiningData
	};

	let { materials, projects, machining, colors } = data;

	const sync_data = (/** @type {import('$lib/types/global').ProjectData} */ data) => {
		console.warn('sync_data', data);
		materials = data.materials;
		projects = data.projects;
		machining = data.machining;
		colors = data.colors;
	};
	$: sync_data(data);
	const placeholder = 'Select a tool item...';

	$: {
		machining_project =
			projects.find(({ tool_item_id }) => tool_item_id == tool_item?.id) ;
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
		if (!machining_project) {
			toasts.error('Please select a tool item. Machining project is not found.');
			return;
		}
		console.log('Calculating Tool Life');
		console.log('Machining Project', machining_project);
		remaining_tool_life = machining_project.remaining_tool_life - machining_time * product_quantity;
		if (remaining_tool_life < 0) {
			errors = {
				machining_time: ['Machining time is too long.'],
				product_quantity: ['Product quantity is too much.'],
				remaining_tool_life: ['Remaining tool life is negative.']
			};
		}
	};
	const handleSubmit = async () => {
		if (!machining_project) {
			toasts.error('Please select a tool item. Machining project is not found.');
			return;
		}
		errors = {};
		const formData = {
			machining_project_id: machining_project.id,
			product_id,
			initial_diameter,
			final_diameter,
			workpart_length,
			machining_time,
			product_quantity
		};

		console.log(formData);

		const result = await fetch_api(`api/project/${machining_project.id}`, {
			method: 'PUT',
			body: JSON.stringify(formData)
		});

		if (result.status === 201) {
			/** @type {import('$lib/types/global').MachiningProject} */
			const machining_project = await result.json();
			toasts.success('Added project');
			await load();
			sync_data(data);
			if (!machining_project.is_active) {
				toasts.success('Project has been finished.');
				form.reset();
				return;
			}
			calculate_tool_life();
			return;
		}
		const { message, errors: json_err } = await result.json();

		toasts.error(message);
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
		<h1>Ongoing Project</h1>
		<ToolSelector {materials} {errors} {colors} bind:tool_item bind:tool_product />
		<fieldset>
			<legend> Product Specifications </legend>
			<section class="grid">
				<label for="product_id">Product Id</label>
				<div>
					<input type="text" bind:value={product_id} placeholder="Product id" required />
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
		<WorkpieceMachiningSelector readonly={true} {machining} {errors} product={tool_product} {...readonly_values}>
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
		</WorkpieceMachiningSelector>
		<fieldset>
			<legend> Tool Conditions </legend>
			<section class="grid">
				<label for="early_tool_life">Current tool life</label>
				<div>
					<input
						type="number"
						id="early_tool_life"
						value={machining_project?.remaining_tool_life}
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
		<button class="submit_button">Start &amp; Save</button>
	</form>
</section>
