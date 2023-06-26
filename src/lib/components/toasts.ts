import { toast } from '@zerodevx/svelte-toast';

export const toasts = {
	success: (message: string) => {
		toast.push(message, {
			classes: ['success']
		});
	},
	error: (message: string) => {
        console.error(message);
		toast.push(message, {
			classes: ['error']
		});
	},
	info: (message: string) => {
		toast.push(message, {
			classes: ['info']
		});
	},
	warning: (message: string) => {
		toast.push(message, {
			classes: ['warning']
		});
	}
};
