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
