import { describe, expect, it } from "vitest";
import { extractWebsiteText, isPublicHttpUrl } from "./website";

describe("isPublicHttpUrl", () => {
  it("accepts public https company sites and rejects private or non-http URLs", () => {
    expect(isPublicHttpUrl("https://bloom.date")).toBe(true);
    expect(isPublicHttpUrl("http://example.com/about")).toBe(true);
    expect(isPublicHttpUrl("https://example.com:443")).toBe(true);
    expect(isPublicHttpUrl("ftp://example.com")).toBe(false);
    expect(isPublicHttpUrl("https://localhost/secret")).toBe(false);
    expect(isPublicHttpUrl("http://127.0.0.1")).toBe(false);
    expect(isPublicHttpUrl("http://10.0.0.4")).toBe(false);
    expect(isPublicHttpUrl("http://192.168.1.9")).toBe(false);
    expect(isPublicHttpUrl("http://169.254.169.254/latest/meta-data")).toBe(false);
    expect(isPublicHttpUrl("not a url")).toBe(false);
  });
});

describe("extractWebsiteText", () => {
  it("pulls title, meta description, and visible copy, dropping script and nav chrome", () => {
    const html = `<!doctype html>
      <html>
        <head>
          <title>Bloom — dating for grownups</title>
          <meta name="description" content="Bloom helps adults find lasting relationships." />
        </head>
        <body>
          <nav>Home Pricing Login</nav>
          <script>window.secret = "do-not-send";</script>
          <style>.hide { display:none }</style>
          <main>
            <h1>Find someone you actually like</h1>
            <p>Bloom is a relationship app for people who are done with swipe culture.</p>
          </main>
        </body>
      </html>`;
    const text = extractWebsiteText(html);
    expect(text).toContain("Bloom — dating for grownups");
    expect(text).toContain("Bloom helps adults find lasting relationships.");
    expect(text).toContain("Find someone you actually like");
    expect(text).toContain("relationship app");
    expect(text).not.toContain("do-not-send");
    expect(text).not.toContain("window.secret");
  });
});
