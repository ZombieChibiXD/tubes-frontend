<script>
	import { SvelteToast } from '@zerodevx/svelte-toast';
</script>

<div class="toast">
	<SvelteToast
		options={{
			classes: ['something']
		}}
	/>
</div>

<style>
	:global(ul._toastContainer>li) {
		list-style: none;
	}
	:global(._toastBtn) {
		--background-color: none;
		--border-color: none;
		--color: none;
		--box-shadow: none;
        --primary-hover: none;
		padding: var(--form-element-spacing-vertical) var(--form-element-spacing-horizontal);
		border: none;
		border-radius: 0;
		outline: 0;
	}
	:global(._toastBar) {
        border-radius: 0;
        margin-bottom: auto;
	}
</style>
