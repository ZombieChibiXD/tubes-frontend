<script>
	import FormError from '$lib/components/FormError.svelte';
	import Select from 'svelte-select';

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

	/**
	 * Type is key number and value is ToolColorCode
	 * @type {{
	 *    [key: number]: import("$lib/types/global").ToolColorCode;
	 * }}
	 */
	export let colors = {};

	/**
	 * @type {(import("$lib/types/global").ToolMaterial & {
	 * 		products?: ToolProductCurrent[]
	 * })}
	 */
	let tool_material;

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

	const onChangeMaterial = (/** @type {any} */ _) => {
		tool_product = undefined;
	};
	$: onChangeMaterial(tool_material);
	const onChangeProduct = (/** @type {any} */ _) => {
		tool_toolbox = undefined;
	};
	$: onChangeProduct(tool_product);
	const onChangeToolbox = (/** @type {any} */ _) => {
		tool_item = undefined;
	};
	$: onChangeToolbox(tool_toolbox);
</script>

<fieldset>
	<legend> Tool Selection </legend>
	<section class="grid">
		<label for="tool_material_id">Tool Material</label>
		<div>
			<Select
				itemId="id"
				id="tool_material_id"
				label="name"
				containerStyles="height: 3rem;"
				items={materials}
				bind:value={tool_material}
				listOffset={0}
				placeholder={materials?.length == 0 ?? true
					? 'No Available Tool Materials found'
					: 'Select Tool Material'}
				disabled={materials?.length == 0 ?? true}
				required={true}
				hasError={errors?.tool_material_id}
			/>
			<FormError {errors} field="tool_material_id" />
		</div>
	</section>
	<section class="grid">
		<label for="tool_product_id">Tool Code</label>
		<div>
			<Select
				itemId="id"
				id="tool_product_id"
				label="code"
				containerStyles="height: 3rem;"
				items={tool_material?.products}
				bind:value={tool_product}
				listOffset={0}
				placeholder={tool_material
					? tool_material?.products?.length
						? 'Select Tool Material'
						: 'No Available Tool found'
					: 'Select Tool Material First'}
				disabled={(tool_material?.products?.length ?? 0) == 0}
				required={true}
				hasError={errors?.tool_product_id}
			/>
			<FormError {errors} field="tool_product_id" />
		</div>
	</section>
	<section class="grid">
		<label for="tool_product_toolbox_id">Toolbox ID</label>
		<div>
			<Select
				itemId="id"
				id="tool_product_toolbox_id"
				label="code"
				containerStyles="height: 3rem;"
				items={tool_product?.toolboxes}
				bind:value={tool_toolbox}
				listOffset={0}
				placeholder={tool_product
					? tool_product?.toolboxes?.length
						? 'Select Toolbox'
						: 'No Available Toolbox Found'
					: 'Select Tool Code First'}
				disabled={(tool_product?.toolboxes?.length ?? 0) == 0}
				required={true}
				hasError={errors?.tool_product_toolbox_id}
			/>
			<FormError {errors} field="tool_product_toolbox_id" />
		</div>
	</section>
	<section class="grid">
		<label for="tool_item_id">
			Tool ID
			{#if tool_item}
				{@const { color } = colors[tool_item.tool_color_code_id]}
				<span class="color-preview" style={`background-color: ${color};`} />
			{/if}
		</label>
		<div>
			<Select
				itemId="id"
				id="tool_item_id"
				label="id"
				containerStyles="height: 3rem;"
				items={tool_toolbox?.tool_items}
				bind:value={tool_item}
				listOffset={0}
				placeholder={tool_toolbox
					? tool_toolbox?.tool_items?.length
						? 'Select ToolID/Color'
						: 'No Available ToolID/Color Found'
					: 'Select Toolbox First'}
				disabled={(tool_toolbox?.tool_items?.length ?? 0) == 0}
				required={true}
				hasError={errors?.tool_item_id}
			/>
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
