export const clubViews = [
  "booking",
  "people",
  "attendance",
  "sessions",
  "matches",
  "tournaments",
  "coaching",
  "communications",
  "management",
];
export function safeClubReturn(value: string) {
  if (!value.startsWith("#")) return "#club-portal";
  const input = new URLSearchParams(value.slice(1)),
    output = new URLSearchParams();
  const club = input.get("club"),
    view = input.get("view"),
    event = input.get("event");
  if (
    club &&
    /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(club)
  )
    output.set("club", club);
  if (view && clubViews.includes(view)) output.set("view", view);
  if (event && /^[a-zA-Z0-9:_-]{1,128}$/.test(event))
    output.set("event", event);
  return output.size ? `#${output}` : "#club-portal";
}
