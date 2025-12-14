export const lettersByFrequency = "ESIARNTOLCDUGPMHBYFVKWZXJQ".split("");

export function scaledRandom(arr: any[], factor: number) {
	return arr[Math.floor(Math.pow(Math.random(), factor) * arr.length)];
}

export function getDefaultCascade(rows: number, columns: number) {
	const cascade: string[][] = [];
	for (let r = 0; r < rows; r++) {
		cascade.push([]);
		for (let c = 0; c < columns; c++) {
			cascade[r].push(scaledRandom(lettersByFrequency, 2));
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