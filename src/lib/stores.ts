import { writable, type Writable } from 'svelte/store';

export const editModelPath: Writable<Array<string>> = writable([]);