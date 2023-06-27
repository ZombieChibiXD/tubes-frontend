<script>
	import { goto } from '$app/navigation';
	import { fetch_api } from '$lib/components/fetch';
	import { authenticating, authenticated } from '$lib/stores/store';
	import { toast } from '@zerodevx/svelte-toast';
	import ToolSelector from '../ToolSelector.svelte';
	import { MachiningData } from '$lib/constants/tool';
	import { toasts } from '$lib/components/toasts';
	import { convert_to_flat_json, to_csv } from './export';

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
	 * @type {boolean}
	 */
	let add_sep = true;

	async function load() {
		const result = await fetch_api('api/project/form?filter=HISTORY', {
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
			goto('/login?redirect=/project/history');
		}
	}

	console.log('Tool History Page');

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


	const handleSubmit = async () => {
		if (!tool_item) {
			errors = {
				tool_item_id: ['Tool Item is required']
			};
			return;
		}
		errors = {};
		const result = await fetch_api(`api/tool/history/${tool_item.id}`, {
			method: 'GET',
		});

		if (result.status === 200) {
			const data = await result.json();
			console.log(data);
			const flat_json = convert_to_flat_json(data);
			console.table(flat_json);
			const csv = to_csv(flat_json);
			console.log(csv);
			toasts.success('Downloading Tool History shortly..');
			const blob = new Blob([(add_sep ? 'sep=,\n' : '') + csv], { type: 'text/csv;charset=utf-8;' });
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
	<title>Tool History</title>
	<meta name="description" content="Tool History" />
</svelte:head>

<section class="container">
	<form on:submit|preventDefault={handleSubmit}>
		<ToolSelector {errors} bind:tool_item bind:tool_product {colors} {materials}/>
		<fieldset>
			<legend>Download Options</legend>
			<section class="grid" style="padding-bottom: 1rem;">
				<p>Ms. Excel Fix</p>
				<label for="add_sep">
					<input type="checkbox" id="add_sep" bind:checked={add_sep} />
					Add "sep=,"
				</label>
			</section>
		</fieldset>
		<button class="submit_button">Download Tool History</button>
	</form>
</section>
