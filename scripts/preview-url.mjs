import { stripVTControlCharacters } from "node:util";

// Vite colours the port separately on CI and Windows, even when stdout is piped.
export function localPreviewUrl(output) {
  return stripVTControlCharacters(output).match(
    /http:\/\/127\.0\.0\.1:\d+/,
  )?.[0];
}
