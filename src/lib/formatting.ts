import type { MiniCrosswordClue } from "./types";

export default function formatDate(publicationDate: string): string {
  return new Date(publicationDate + "T00:00:00")
    .toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
    .replace(/\b(\d{1,2})\b/, (match) => {
      const suffix = ["th", "st", "nd", "rd"];
      const day = parseInt(match, 10);
      const value = day % 100;
      return day + (suffix[(value - 20) % 10] || suffix[value] || suffix[0]);
    });
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function decodeFormatted(input: string): string {
  let s = input;
  try {
    s = JSON.parse(`"${s.replace(/"/g, '\\"')}"`);
  } catch {}

  const textarea = document.createElement("textarea");
  textarea.innerHTML = s;
  s = textarea.value;

  return s
}

export function renderClue(clue: MiniCrosswordClue): string {
	return clue.text.map((part) => {
		if (part.formatted) {
			return decodeFormatted(part.formatted);
		} else {
			return part.plain;
		}
	}).join("");
}