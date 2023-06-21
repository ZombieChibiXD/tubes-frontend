<script>
	/**
	 * @type {{ [x: string]: string[]; }}
	 */
	 export let errors;
    
	/**
	 * @type {string}
	 */
	 export let field;
</script>

{#if errors[field]}
	<ul style="font-size: small; color: red;">
		{#each errors[field] as error}
			<li>{error}</li>
		{/each}
	</ul>
{/if}
