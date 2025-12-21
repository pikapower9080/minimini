export const lettersByFrequency = "ESIARNTOLCDUGPMHBYFVKWZXJQ".split("");
// @ts-ignore
import { prng_alea } from "esm-seedrandom";
import type { RefObject } from "react";

export function scaledRandom(arr: any[], factor: number, seed: string) {
	const rng = prng_alea(seed);
	return arr[Math.floor(Math.pow(rng.double(), factor) * arr.length)];
}

export function getDefaultCascade(rows: number, columns: number) {
	const cascade: string[][] = [];
	for (let r = 0; r < rows; r++) {
		cascade.push([]);
		for (let c = 0; c < columns; c++) {
			cascade[r].push(scaledRandom(lettersByFrequency, 2, getTileSeed(r, c)));
		}
	}
	return cascade;
}

export function getColumn(cascade: string[][], column: number) {
	return cascade.map((row) => row[column]);
}

export function cellIsActive(cascade: string[][], row: number, column: number) {
	return row === cascade.length - 1 || cascade[row + 1][column] === "";
}

export function checkWords(letters: string[], words: readonly string[]): string[] {
	const letterStr = letters.join('').toLowerCase();

	const matches: string[] = [];
	for (const word of words) {
		if (letterStr.includes(word)) {
			matches.push(word);
		}
	}
	
	const sortedMatches = matches.sort((a, b) => b.length - a.length);
	return sortedMatches;
}

export function getDateString() {
	const date = new Date();
	return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

export function getTileSeed(row: number, column: number) {
	return `${getDateString()}-r${row}c${column}`;
}

export function getNextLetter(column: number, index: number) {
	const seed = `${getDateString()}-nxt-c${column}-${index}`;
	console.log(seed);
	return scaledRandom(lettersByFrequency, 1.7, seed);
}

export function dropCascade(cascade: string[][], drops: RefObject<number[]>) {
	const rows = cascade.length;
	const columns = cascade[0].length;

	const newCascade = [...cascade];
	for (let c = 0; c < columns; c++) {
		const column = getColumn(newCascade, c);
		const filtered = column.filter((letter) => letter !== "");
		if (filtered.length < rows) {
			while (filtered.length < rows) {
				filtered.unshift(getNextLetter(c, drops.current[c]));
				drops.current[c] += 1;
			}
		}
		for (let r = 0; r < rows; r++) {
			newCascade[r][c] = filtered[r];
		}
	}

	return newCascade;
}