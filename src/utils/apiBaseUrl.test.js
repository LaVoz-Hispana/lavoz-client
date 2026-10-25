import { resolveApiBaseUrl } from "./apiBaseUrl";

const productionApi = "https://poststation-api-391b2ced2a59.herokuapp.com/api";
const development = { nodeEnv: "development", hostname: "localhost", protocol: "http:" };

test.each([
  ["localhost", "http://localhost:8800/api"],
  ["127.0.0.1", "http://127.0.0.1:8800/api"],
  ["192.168.1.168", "http://192.168.1.168:8800/api"],
  ["[::1]", "http://[::1]:8800/api"],
  ["::1", "http://[::1]:8800/api"],
])("development on %s uses the API on the same host", (hostname, expected) => {
  expect(resolveApiBaseUrl({ ...development, hostname })).toBe(expected);
});

test.each(["lavoz-client.vercel.app", "preview-123.vercel.app", "www.poststation.link", "localhost"])(
  "production builds on %s use the hosted API", (hostname) => {
    expect(resolveApiBaseUrl({ nodeEnv: "production", hostname, protocol: "https:" })).toBe(productionApi);
  }
);

test.each(["development", "production"])("an explicit API URL supports %s overrides", (nodeEnv) => {
  expect(resolveApiBaseUrl({
    ...development,
    nodeEnv,
    apiUrl: " https://staging-api.example.com/api/ ",
  })).toBe("https://staging-api.example.com/api");
});

test("a blank API URL keeps automatic selection", () => {
  expect(resolveApiBaseUrl({ ...development, apiUrl: "  " })).toBe("http://localhost:8800/api");
});
