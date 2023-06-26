<script>
	import FormError from '$lib/components/FormError.svelte';

	/**
	 * @typedef { import("$lib/types/global").ToolProductToolbox & {
	 * 	tool_items: import("$lib/types/global").ToolItem[]
	 * }} ToolProductToolboxCurrent
	 */
	/**
	 * @typedef { import("$lib/types/global").ToolProduct & {
	 * 	toolboxes?: ToolProductToolboxCurrent[]
	 * }} ToolProductCurrent
	 */

	/**
	 * @type {(
	 * 	import("$lib/types/global").ToolMaterial & {
	 * 		products?: ToolProductCurrent[]
	 * })[]}
	 */
	export let materials = [];

	// Detect if materials has changed
	$: {
		// Check if current material is in the list
		if (!materials.find((item) => item.id == tool_material_id)) {
			// If not, set current material to first item in the list
			tool_material_id = '';
		}
		on_material_change();
	}

	/**
	 * Type is key number and value is ToolColorCode
	 * @type {{
	 *    [key: number]: import("$lib/types/global").ToolColorCode;
	 * }}
	 */
	export let colors = {};

	/**
	 * @type {ToolProductCurrent[]}
	 */
	let products = [];
	/**
	 * @type {ToolProductToolboxCurrent[]}
	 */
	let toolboxes = [];
	/**
	 * @type {import("$lib/types/global").ToolItem[]}
	 */
	let items = [];

	/**
	 * @type {ToolProductCurrent | undefined}
	 */
	export let tool_product;

	/**
	 * @type {ToolProductToolboxCurrent | undefined}
	 */
	let tool_toolbox;

	/**
	 * @type {import("$lib/types/global").ToolItem | undefined}
	 */
	export let tool_item;

	/**
	 * @type {any}
	 */
	export let errors;

	/**
	 * @type {number | string}
	 */
	let tool_material_id;
	/**
	 * @type {number | string }
	 */
	let tool_product_id;
	/**
	 * @type {number | string }
	 */
	let tool_product_toolbox_id;
	/**
	 * @type {number | string }
	 */
	let tool_item_id;


	const on_material_change = () => {
		const material = materials.find((item) => item.id == tool_material_id);
		products = material?.products ?? [];
		tool_product_id = products.find((item) => item.id == tool_product_id) ? tool_product_id : '';
		on_product_change();
	};

	const on_product_change = () => {
		tool_product = products.find((item) => item.id == tool_product_id);
		toolboxes = tool_product?.toolboxes ?? [];
		tool_product_toolbox_id = toolboxes.find((item) => item.id == tool_product_toolbox_id) ? tool_product_toolbox_id : '';
		on_toolbox_change();
	};

	const on_toolbox_change = () => {
		tool_toolbox = toolboxes.find((item) => item.id == tool_product_toolbox_id);
		items = tool_toolbox?.tool_items ?? [];
		tool_item_id = items.find((item) => item.id == tool_item_id) ? tool_item_id : '';
		on_item_change();
	};

	const on_item_change = () => {
		tool_item = items.find((item) => item.id == tool_item_id);
	};
</script>

<fieldset>
	<legend> Tool Selection </legend>
	<section class="grid">
		<label for="tool_material_id">Tool Material</label>
		<div>
			<select
				id="tool_material_id"
				bind:value={tool_material_id}
				on:change={on_material_change}
				required
			>
				<option value="">
					{#if !materials || materials.length == 0}
						No Available Tool Materials Found
					{:else}
						Select Tool Material
					{/if}
				</option>
				{#each materials as { id, name, products }}
					<option value={id}>{name} ({products?.length})</option>
				{/each}
			</select>
			<FormError {errors} field="tool_material_id" />
		</div>
	</section>
	<section class="grid">
		<label for="tool_product_id">Toolbox ID</label>
		<div>
			<select
				id="tool_product_id"
				bind:value={tool_product_id}
				on:change={on_product_change}
				required
			>
				<option value="">
					{#if !tool_material_id}
						Select Tool Material First
					{:else if products.length == 0}
						No Available Toolbox Found
					{:else}
						Select Toolbox
					{/if}
				</option>
				{#each products as { id, code, name, toolboxes }}
					<option value={id}>{code}{name ? ' - ' + name : ''} ({toolboxes?.length})</option>
				{/each}
			</select>
			<FormError {errors} field="tool_product_id" />
		</div>
	</section>
	<section class="grid">
		<label for="tool_product_toolbox_id">Tool ID</label>
		<div>
			<select
				id="tool_product_toolbox_id"
				bind:value={tool_product_toolbox_id}
				on:change={on_toolbox_change}
				required
			>
				<option value="">
					{#if !tool_product_id}
						Select Toolbox First
					{:else if toolboxes.length == 0}
						No Available Tool Found
					{:else}
						Select Tool
					{/if}
				</option>
				{#each toolboxes as { id, code, tool_items }}
					<option value={id}>{tool_product?.prefix}-{code} ({tool_items.length})</option>
				{/each}
			</select>
			<FormError {errors} field="tool_product_toolbox_id" />
		</div>
	</section>
	<section class="grid">
		<label for="tool_item_id">
			Color ID
			{#if tool_item}
				{@const { color } = colors[tool_item.tool_color_code_id]}
				<span class="color-preview" style={`background-color: ${color};`}></span>
			{/if}
		</label>
		<div>
			<select id="tool_item_id" bind:value={tool_item_id} on:change={on_item_change} required>
				<option value="" style="background-color: white; color: black;">
					{#if !tool_product_toolbox_id}
						Select Tool First
					{:else if items.length == 0}
						No Available Color Found
					{:else}
						Select Color
					{/if}
				</option>
				{#each items as { id: item_id, tool_color_code_id: color_id }}
					{@const { id, code, color, text_color } = colors[color_id]}
					<option value={item_id} style="background-color: {color}; color: {text_color};"
						>{code}{id}</option
					>
				{/each}
			</select>
			<FormError {errors} field="tool_item_id" />
		</div>
	</section>
</fieldset>
<style>
.color-preview {
	display: inline-block;
	width: 3em;
	height: 1em;
	border-radius: 1em;
	border: 1px solid black;
	margin-left: 1em;
}
</style>