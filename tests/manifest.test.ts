import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("Web App Manifest Configuration", () => {
  it("should have public/manifest.json with correct PWA specifications", () => {
    const manifestPath = path.resolve(__dirname, "../public/manifest.json");
    expect(fs.existsSync(manifestPath)).toBe(true);

    const content = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    expect(content.name).toBe("Me Kost");
    expect(content.short_name).toBe("Me Kost");
    expect(content.display).toBe("standalone");
    expect(content.start_url).toBe("/");
    expect(content.theme_color).toBe("#04A552");
    expect(content.background_color).toBe("#ffffff");

    const sizes = content.icons.map((icon: { sizes: string }) => icon.sizes);
    expect(sizes).toContain("192x192");
    expect(sizes).toContain("512x512");
  });
});
