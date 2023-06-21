<script>
	import { SvelteToast } from '@zerodevx/svelte-toast';
</script>

<div class="toast">
	<SvelteToast
		options={{
			classes: ['toast']
		}}
	/>
</div>

<style>
	
	:global(.toast) {
		--toastBackground: #525252;
		--toastBarBackground: #d4d4d4;
	}
	:global(.toast.success) {
		--toastBackground: #16a34a;
		--toastBarBackground: #a3e6be;
	}
	:global(.toast.danger) {
		--toastBackground: #dc2626;
		--toastBarBackground: #fca5a5;
	}
	:global(.toast.warning) {
		--toastBackground: #ca8a04;
		--toastBarBackground: #fde68a;
	}
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
