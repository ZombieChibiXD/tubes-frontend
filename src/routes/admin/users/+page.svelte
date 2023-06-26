<script>
	import FormError from '$lib/components/FormError.svelte';
	import Loading from '$lib/components/Loading.svelte';
	import { fetch_api } from '$lib/components/fetch';
	import { toasts } from '$lib/components/toasts';
	import { authenticated } from '$lib/stores/store';
	import { onDestroy } from 'svelte';

	let loading = true;
	/**
	 * @type {{ [key: string]: string[] }}
	 */
	let errors = {};

	/**
	 * @type {{[key:number]:import('$lib/types/global').User}}
	 */
	let users = [];

	/**
	 * @type {import('$lib/types/global').Role[]}
	 */
	let server_roles = [];

	const interval = setInterval(() => {
		if ($authenticated) {
			load();
		}
	}, 10000);
	onDestroy(() => {
		errors = {};
		clearInterval(interval);
	});

	async function load() {
		console.info('Loading users');
		let result = await fetch_api('api/users');

		if (result.status == 200) {
			users = await result.json();
			result = await fetch_api('api/roles');
			if (result.status == 200) {
				server_roles = await result.json();
				return;
			}
		}
		const { message, errors: json_err } = await result.json();

		toasts.danger(message);
		const error_400 = {
			tool_material_id: [message],
			tool_product_id: [message],
			tool_item_id: [message]
		};
		errors = result.status === 422 ? json_err : error_400;
	}
	$: {
		if ($authenticated) {
			load().finally(() => (loading = false));
		}
	}

	/**
	 * @type {HTMLDialogElement}
	 */
	let dialog;
	/**
	 * @type {HTMLFormElement}
	 */
	let form;

	/**
	 * @type {{
	 *   id: number?,
	 *   name: string,
	 *   username: string,
	 *   email: string,
	 *   password: string | undefined,
	 *   role_ids: number[]
	 * }}
	 */
	let user = {
		id: null,
		name: '',
		username: '',
		email: '',
		password: undefined,
		role_ids: []
	};

	async function handleSubmit() {
		errors = {};
		if (user.id) {
			if (!user.password || user.password.length == 0) {
				user.password = undefined;
			}
		}
		const [url, options] = user.id
			? [
					'api/users/' + user.id,
					{
						method: 'PUT',
						body: JSON.stringify(user)
					}
			  ]
			: [
					'api/users',
					{
						method: 'POST',
						body: JSON.stringify(user)
					}
			  ];
		const result = await fetch_api(url, options);
		if (result.status == 201 || result.status == 200) {
			const user = await result.json();
			users[user.id] = user;
			dialog.close();
			form.reset();
			return;
		}
		const { message, errors: json_err } = await result.json();
		toasts.danger(message);
		errors = json_err ?? {};
		if (result.status == 404) {
			errors['name'] = errors['name'] ? [...errors['name'], message] : [message];
			errors['username'] = errors['username'] ? [...errors['username'], message] : [message];
			errors['email'] = errors['email'] ? [...errors['email'], message] : [message];
		}
	}
	/**
	 * Delete user
	 * @param {number} id
	 */
	async function handleDelete(id) {
		errors = {};
		const result = await fetch_api(`api/users/${id}`, {
			method: 'DELETE'
		});
		if (result.status == 200) {
			// @ts-ignore
			users = Object.keys(users).reduce((acc, /** @type {number} */ key) => {
				if (key != id) {
					// @ts-ignore
					acc[key] = users[key];
				}
				return acc;
			}, {});
			return;
		}
		const { message, errors: json_err } = await result.json();
		toasts.danger(message);
	}
	function handleReset() {
		user = {
			id: null,
			name: '',
			username: '',
			email: '',
			password: '',
			role_ids: []
		};
	}
</script>

<section class="container">
	<article>
		<header style="display: flex; align-items: center; justify-content: space-between;">
			<h2>Users</h2>
			<a
				href="#form"
				role="button"
				on:click={() => {
					handleReset();
					dialog.showModal();
				}}>Add</a
			>
		</header>
		<table>
			<thead>
				<tr>
					<th>Name</th>
					<th>Username</th>
					<th>Email</th>
					<th>Roles</th>
					<th>Actions</th>
				</tr>
			</thead>
			<tbody>
				{#if !loading}
					{#each Object.entries(users) as [_, { id, name, username, email, role_names }]}
						<tr>
							<td>{name}</td>
							<td>{username}</td>
							<td>{email}</td>
							<td>{role_names}</td>
							<td class="flex">
								<a
									href="#edit"
									class="contrast"
									on:click={() => {
										// @ts-ignore
										user = { ...user, ...users[id] };
										dialog.showModal();
									}}
									role="button">Edit</a
								>
								<a
									href="#delete"
									class="secondary"
									on:click={() => {
										handleDelete(id);
									}}
									role="button">Delete</a
								>
							</td>
						</tr>
					{/each}
				{:else}
					<tr>
						<td colspan="5" style="">
							<Loading />
						</td>
					</tr>
				{/if}
			</tbody>
		</table>
	</article>
</section>
<!-- Dialog form -->
<dialog bind:this={dialog} style="width: 100%;" on:close={handleReset}>
	<article style="width: 100%;">
		<form
			method="dialog"
			bind:this={form}
			on:submit|preventDefault={handleSubmit}
			on:reset={handleReset}
			autocomplete="off"
		>
			<h2>{!user.id ? 'Create User' : 'Edit User'}</h2>
			<section class="grid">
				<label for="name">Name</label>
				<div>
					<input type="text" id="name" bind:value={user.name} required />
					<FormError {errors} field="name" />
				</div>
			</section>
			<section class="grid">
				<label for="username">Username</label>
				<div>
					<input type="text" id="username" bind:value={user.username} required />
					<FormError {errors} field="username" />
				</div>
			</section>
			<section class="grid">
				<label for="email">E-mail</label>
				<div>
					<input type="email" id="email" bind:value={user.email} required />
					<FormError {errors} field="email" />
				</div>
			</section>
			<section class="grid">
				<label for="password">Password</label>
				<div>
					<input
						type="password"
						id="password"
						bind:value={user.password}
						required={user.id == null}
						autocomplete="off"
					/>
					<FormError {errors} field="password" />
				</div>
			</section>
			<section class="grid">
				<label for="roles">Roles</label>
				<div>
					{#each server_roles as { id, name }}
						<label>
							<input type="checkbox" id="roles" bind:group={user.role_ids} value={id} />
							{name}
						</label>
					{/each}
					<FormError {errors} field="role_ids" />
				</div>
			</section>
			<hr />
			<footer style="display: flex; flex-direction: row; justify-content: end; gap: 1rem">
				<a
					href="#cancel"
					class="secondary"
					role="button"
					on:click={() => {
						dialog.close();
						form.reset();
					}}
				>
					Close
				</a>
				<a href="#submit" class="primary" role="button" on:click={() => form.requestSubmit()}>
					Submit
				</a>
			</footer>
		</form>
	</article>
</dialog>
