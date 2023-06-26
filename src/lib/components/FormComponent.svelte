<script>
	import FormError from "./FormError.svelte";

    /**
     * @type {string}
     */
    export let name;
    
    /**
     * @type {string}
     */
    export let label = name;

	/**
	 * @type {{ [x: string]: string[]; }}
	 */
    export let errors;

    /**
     * @type {string}
     */
    export let field = name;
</script>

<section class="grid">
    <label for={name}>{label}</label>
    <div>
        <slot field={field}/>
        <FormError {errors} {field} />
    </div>
</section>