<script>
	import { goto } from '$app/navigation';
	import { fetch_api } from '$lib/components/fetch';
	import {
		ToolMaterialWithProductWithItem,
		WorkpieceMaterials,
		MachiningProcesses,
		MachiningC,
		MachiningN
	} from '$lib/constants/tool';
	import { authenticated } from '$lib/stores/store';
	import { onMount } from 'svelte';

	let data = ToolMaterialWithProductWithItem;
	/**
	 * @type {number | string}
	 */
	let tool_material_id;
	/**
	 * @type {number | string}
	 */
	let tool_product_id;
	/**
	 * @type {number | string}
	 */
	let tool_item_id;

	/**
	 * @type {string}
	 */
	let workpiece_material;

	/**
	 * @type {string}
	 */
	let machining_process;
	/**
	 * @type {number | undefined}
	 */
	let cutting_speed;
	/**
	 * @type {number}
	 */
	let depth_of_cut;
	/**
	 * @type {number}
	 */
	let feeding;

	/**
	 * @type {number | undefined}
	 */
	let early_tool_life;

	onMount(async () => {
		const result = await fetch_api('http://localhost:8000/api/tools', {
			method: 'GET'
		});
		if (result.status == 200) {
			data = await result.json();
		}
	});

	/**
	 * @type {import('$lib/types/global').ToolMaterial | undefined}
	 */
	let selected_tool_material;

	/**
	 * @type {import('$lib/types/global').ToolProduct | undefined}
	 */
	let selected_tool_product;

	$: selected_tool_material = data?.find((item) => item.id == tool_material_id);

	$: selected_tool_product = selected_tool_material?.products?.find(
		(/** @type {{ id: number; }} */ item) => item.id == tool_product_id
	);

	$: early_tool_life =
		cutting_speed === undefined
			? undefined
			: Math.round(Math.pow(MachiningC / cutting_speed, 1 / MachiningN));
</script>

<svelte:head>
	<title>About</title>
	<meta name="description" content="About this app" />
</svelte:head>

<section class="container">
	<form>
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
						{#if !data || data.length == 0}
							No Available Tool Materials Found
						{:else}
							Select Tool Material
						{/if}
					</option>
					{#each data as { id, name }}
						<option value={id}>{name}</option>
					{/each}
				</select>
			</section>
			<section class="grid">
				<label for="tool_product_id">Tool Product</label>
				<select
					bind:value={tool_product_id}
					on:change={() => {
						tool_item_id = '';
						cutting_speed = undefined;
					}}
					id="tool_product_id"
					required
				>
					<option value="">
						{#if !selected_tool_material}
							Select Tool Material First
						{:else if !selected_tool_material?.products?.length}
							No Available Tool Products Found
						{:else}
							Select Tool Product
						{/if}
					</option>
					{#if selected_tool_material?.products}
						{#each selected_tool_material.products as { id, code, name }}
							<option value={id}
								>{code}
								{#if name} - {name} {/if}
							</option>{/each}
					{/if}
				</select>
			</section>
			<section class="grid">
				<label for="tool_item_id">Tool Item</label>
				<select bind:value={tool_item_id} id="tool_item_id" required>
					<option value="">
						{#if !selected_tool_product}
							Select Tool Product First
						{:else if !selected_tool_product?.items?.length}
							No Available Tool Items Found
						{:else}
							Select Tool Item
						{/if}
					</option>
					{#if selected_tool_product?.items}
						{#each selected_tool_product.items as { id, item_code }}
							<option value={id}>{item_code}</option>
						{/each}
					{/if}
				</select>
			</section>

			<section class="grid">
				<label for="workpiece_material">Workpiece material</label>
				<select bind:value={workpiece_material} id="workpiece_material" required>
					<option value="">Select Workpiece Material</option>
					{#each WorkpieceMaterials as material}
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
					{#each MachiningProcesses as process}
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
