import { writable } from "svelte/store";
import { Stocks } from "./stocks.js";

export const Store = writable(new Stocks());
export const SelectedStock = writable(null)