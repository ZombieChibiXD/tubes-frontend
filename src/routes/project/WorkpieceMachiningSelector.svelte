<script>
	import FormError from '$lib/components/FormError.svelte';

	export let readonly = false;

	/**
	 * @type {import('$lib/types/global').MachiningData}
	 */
	export let machining;

	/**
	 * @type {any}
	 */
	export let errors;
	/**
	 * @type {any}
	 */
	export let workpiece_material;
	/**
	 * @type {any}
	 */
	export let machining_process;
	/**
	 * @type {any}
	 */
	export let cutting_speed;
	/**
	 * @type {any}
	 */
	export let depth_of_cut;
	/**
	 * @type {any}
	 */
	export let feeding;

	/**
	 * @type {import('$lib/types/global').ToolProduct | undefined}
	 */
	export let product;

	const placeholder = 'Select a tool...';
</script>

<fieldset>
	<legend> Machining Operations </legend>
	<section class="grid">
		<label for="workpiece_material">Workpiece material</label>
		<div>
			{#if readonly}
				<input
					type="text"
					bind:value={workpiece_material}
					id="workpiece_material"
					{placeholder}
					readonly
				/>
			{:else}
				<select
					bind:value={workpiece_material}
					id="workpiece_material"
					disabled={readonly}
					required
				>
					<option value="">Select Workpiece Material</option>
					{#each machining.workpiece_materials as material}
						<option value={material}>{material}</option>
					{/each}
				</select>
			{/if}
			<FormError {errors} field="workpiece_material" />
		</div>
	</section>
	<section class="grid">
		<label for="machining_process">Machining Process</label>
		<div>
			{#if readonly}
				<input
					type="text"
					bind:value={machining_process}
					id="machining_process"
					{placeholder}
					readonly
				/>
			{:else}
				<select bind:value={machining_process} id="machining_process" disabled={readonly} required>
					<option value="">Select Machining Process</option>
					{#each machining.machining_processes as process}
						<option value={process}>{process}</option>
					{/each}
				</select>
			{/if}
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
				min={product?.min_cutting_speed}
				max={product?.max_cutting_speed}
				disabled={!product || readonly}
				required
			/>
			<input
				type="number"
				id="cutting_speed_text"
				placeholder={readonly ? placeholder : 'Cutting Speed (m/min)'}
				readonly={!product || readonly}
				min={product?.min_cutting_speed}
				max={product?.max_cutting_speed}
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
				placeholder={readonly ? placeholder : 'Depth of cut (mm)'}
				step="0.01"
				bind:value={depth_of_cut}
				{readonly}
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
				placeholder={readonly ? placeholder : 'Feeding (mm/rev)'}
				step="0.001"
				bind:value={feeding}
				{readonly}
				required
			/>
			<FormError {errors} field="feeding" />
		</div>
	</section>
	<slot />
</fieldset>
