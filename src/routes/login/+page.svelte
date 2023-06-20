<svelte:head>
	<title>About</title>
	<meta name="description" content="About this app" />
</svelte:head>


<script>
	import { goto } from "$app/navigation";
	import { fetch_api } from "$lib/components/fetch";
	import { user, authenticated, authenticating, token } from "$lib/stores/store";
	import { get } from "svelte/store";

	if (get(authenticated)) {
		goto("/");
	}
	console.log($authenticated);

	let username = ''
	let password = ''
	/**
	 * @type {{ [key: string]: string[] }}
	 */
	let errors = {};

	async function handleSubmit(){
		const data = {
			username,
			password
		}
		console.log(data)
		authenticating.set(true)
		try {
			const result = await fetch_api('http://localhost:8000/api/auth/login', {
				method: 'POST',
				body: JSON.stringify(data)
			})
	
			if (result.status == 200) {
				authenticated.set(true)
				const {token: jwt_token, user: user_data} = await result.json();
				user.set(user_data)
				token.set(jwt_token)
				localStorage.setItem('token',JSON.stringify(jwt_token))
				localStorage.setItem('user', JSON.stringify(user_data))
				goto('/')
				return
			}
			const {message, errors: json_err} = await result.json();
			errors = result.status === 422 ? json_err 
					: { username: [message], password: [message]	}
			console.error(message)
			console.error(errors)
		} catch (error) {
			console.error('Unexpected Error')
			console.error(error)
		} finally {
			authenticating.set(false)
		}
		
	}
	const resetError = (/** @type {string} */ value, /** @type {string?} */ field) => {
		console.debug('resetError', field);
		if (!field) {
			errors = {};
			return;
		}
		if (errors[field]) {
			delete errors[field];
		}
	}


	// On Username Change, remove error
	$:  resetError(username, 'username')
	// On Password Change, remove all errors
	$:  resetError(password)
</script>


<section class="container">
	<form on:submit|preventDefault={handleSubmit}>
		<div>
			<label for="username">Username</label>
			<input type="text" id="username" bind:value={username} class:form-error={errors?.username}/>
			{#if errors?.username}
			<ul style="font-size: small; color: red;">
				{#each errors.username as error}
					<li>{error}</li>
				{/each}
			</ul>
			{/if}
		</div>
		<div>
			<label for="password">Password</label>
			<input type="password" id="password" bind:value={password} class:form-error={errors?.password}/>
			{#if errors?.password}
			<ul style="font-size: small; color: red;">
				{#each errors.password as error}
					<li>{error}</li>
				{/each}
			</ul>
			{/if}
		</div>
		<button type="submit">Login</button>
	</form>
</section>