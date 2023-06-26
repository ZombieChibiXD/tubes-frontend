<script>
	import { goto } from '$app/navigation';
	import FormError from '$lib/components/FormError.svelte';
	import { fetch_api } from '$lib/components/fetch';
	import { MachiningData } from '$lib/constants/tool';
	import { authenticating, authenticated } from '$lib/stores/store';
	import ToolSelector from '../ToolSelector.svelte';
	import { toasts } from '$lib/components/toasts';
	import WorkpieceMachiningSelector from '../WorkpieceMachiningSelector.svelte';

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
		const result = await fetch_api('api/project/form?filter=NEW', {
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
			goto('/login?redirect=/new_project');
		}
	}

	console.log('New Project Page');

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

	$: early_tool_life =
		cutting_speed === undefined
			? undefined
			: Math.round(Math.pow(machining.c / cutting_speed, 1 / machining.n));

	const handleSubmit = async () => {
		if (!tool_item ) {
			errors = {...errors, tool_item_id: ['Tool item is required'] };
			toasts.danger('Tool item is required');
			return;
		}
		if (!tool_product ) {
			errors = {...errors, tool_product_id: ['Tool product is required'] };
			toasts.danger('Tool product is required');
			return;
		}
		errors = {};
		const form = {
			tool_item_id: tool_item.id,
			tool_product_id: tool_product.id,
			tool_material_id: tool_product.tool_material_id,
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
			/**
			 * @type {import('$lib/types/global').MachiningProject & {
			 *   tool_item: import('$lib/types/global').ToolItem & {
			 * 	   tool_product_toolbox: import('$lib/types/global').ToolProductToolbox & {
			 * 		   tool_product: import('$lib/types/global').ToolProduct & {
			 * 			   tool_material: import('$lib/types/global').ToolMaterial
			 * 		   }
			 * 	   }
			 * 	 }
			 * }}
			 */
			const new_project = await result.json();
			console.log('New Project', new_project);
			toasts.success('Project created successfully');
			await load();
			sync_data(data);
			return;
		}
		const { message, errors: json_err } = await result.json();

		toasts.danger(message);
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
		<ToolSelector {materials} {errors} {colors} bind:tool_product bind:tool_item />
		<WorkpieceMachiningSelector
			{errors}
			product={tool_product}
			bind:machining
			bind:workpiece_material
			bind:cutting_speed
			bind:depth_of_cut
			bind:feeding
			bind:machining_process
		/>
		<fieldset>
			<legend>Tool Conditions</legend>
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
