import {
  createPostTextRegex,
  createUrlRegex,
  ensureAbsoluteUrl,
  getDisplayUrl,
  trimTrailingPunctuation,
} from "./postLinks";

describe("post link parsing", () => {
  test("separates adjacent absolute URLs", () => {
    const matches = Array.from(
      "https://www.first.example/pathhttps://www.second.example/page".matchAll(createUrlRegex()),
      (match) => match[1]
    );

    expect(matches).toEqual([
      "https://www.first.example/path",
      "https://www.second.example/page",
    ]);
  });

  test("separates adjacent www and protocol URLs", () => {
    const matches = Array.from(
      "www.first.examplehttps://second.example".matchAll(createUrlRegex()),
      (match) => match[1]
    );

    expect(matches).toEqual([
      "www.first.example",
      "https://second.example",
    ]);
  });

  test("keeps www after a protocol in the same URL", () => {
    const matches = Array.from(
      "https://www.example.com/page".matchAll(createUrlRegex()),
      (match) => match[1]
    );

    expect(matches).toEqual(["https://www.example.com/page"]);
  });

  test("post text parser preserves markdown links and adjacent plain links", () => {
    const matches = Array.from(
      "[First](https://first.example)https://second.example".matchAll(createPostTextRegex())
    );

    expect(matches).toHaveLength(2);
    expect(matches[0].slice(1)).toEqual(["First", "https://first.example", undefined]);
    expect(matches[1].slice(1)).toEqual([undefined, undefined, "https://second.example"]);
  });

  test("retains existing URL presentation behavior", () => {
    expect(ensureAbsoluteUrl("www.example.com")).toBe("https://www.example.com");
    expect(getDisplayUrl("https://www.example.com/")).toBe("example.com");
    expect(trimTrailingPunctuation("https://example.com.,")).toEqual({
      trimmed: "https://example.com",
      suffix: ".,",
    });
  });
});
