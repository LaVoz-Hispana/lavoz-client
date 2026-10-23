import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { I18nextProvider } from "react-i18next";
import i18n from "../../i18n";
import { AuthContext } from "../../context/authContext";
import { LanguageContext } from "../../context/language";
import { makeRequest } from "../../axios";
import Register from "../../pages/register/Register";
import FirstLogin from "../../pages/firstLogin/FirstLogin";
import Update from "../update/Update";

jest.mock("../../axios", () => ({ makeRequest: { get: jest.fn(), post: jest.fn(), put: jest.fn() } }));
jest.mock("../update/NotificationPreferences", () => () => null);
jest.mock("../resume/ResumeLibrary", () => () => <div>Optional resume library</div>);
const provider = { id: 3, username: "login-name", email: "provider@example.com", account_type: "local",
  provider_type: "company", contact_person_name: "Jane Smith", company_name: "Example Company", organization_name: "" };
const persisted = { ...provider, providerDisplayName: "Example Company", providerTypeLabel: "Company", providerProfileComplete: true };
let updateUser;
beforeEach(async () => {
  jest.clearAllMocks();
  localStorage.clear();
  i18n.options.debug = false;
  await i18n.changeLanguage("en");
  updateUser = jest.fn();
  makeRequest.get.mockImplementation(async (url) => ({ data: url.startsWith("/users/find/") ? persisted : [] }));
  makeRequest.put.mockResolvedValue({ data: "Updated!" });
});
function setup(child, user = provider) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(<QueryClientProvider client={client}><I18nextProvider i18n={i18n}><MemoryRouter>
    <LanguageContext.Provider value={{ language: "en", langToggle: jest.fn() }}>
      <AuthContext.Provider value={{ currentUser: user, updateUser }}>{child}</AuthContext.Provider>
    </LanguageContext.Provider>
  </MemoryRouter></I18nextProvider></QueryClientProvider>);
}

test.each(["onboarding", "edit"])("%s saves a provider without student-only categories and uses the backend identity", async (screenName) => {
  const close = jest.fn();
  setup(screenName === "onboarding" ? <FirstLogin /> : <Update user={provider} setOpenUpdate={close} />);
  const field = screen.getByLabelText("Company name");
  fireEvent.change(field, { target: { value: " Example Company " } });
  fireEvent.submit(field.closest("form"));
  await waitFor(() => expect(updateUser).toHaveBeenCalledWith(persisted));
  const [url, body] = makeRequest.put.mock.calls[0];
  expect(url).toBe("/users");
  expect(body.company_name).toBe(" Example Company ");
  for (const key of ["serviceCategoryIds", "password", "confirmPassword", "account_type"]) expect(body).not.toHaveProperty(key);
  expect(makeRequest.get).toHaveBeenCalledWith("/users/find/3");
});

test("switching provider type clears the old entity and requires the matching name", async () => {
  setup(<Update user={provider} setOpenUpdate={jest.fn()} />);
  fireEvent.change(screen.getByLabelText("Provider type"), { target: { value: "organization" } });
  expect(screen.queryByLabelText("Company name")).not.toBeInTheDocument();
  const entity = screen.getByLabelText("Organization name");
  fireEvent.submit(entity.closest("form"));
  expect(await screen.findByRole("alert")).toHaveTextContent("Organization name is required.");
  expect(makeRequest.put).not.toHaveBeenCalled();
  fireEvent.change(entity, { target: { value: "Community Group" } });
  fireEvent.submit(entity.closest("form"));
  await waitFor(() => expect(makeRequest.put).toHaveBeenCalled());
  expect(makeRequest.put.mock.calls[0][1]).toMatchObject({ company_name: "", organization_name: "Community Group" });
});

test("provider validation errors are translated and a failed save keeps the form open", async () => {
  await i18n.changeLanguage("es");
  makeRequest.put.mockRejectedValue({ response: { status: 400, data: { code: "provider_fields_conflict", error: "English server error" } } });
  const close = jest.fn();
  setup(<Update user={provider} setOpenUpdate={close} />);
  fireEvent.submit(screen.getByLabelText("Nombre de la empresa").closest("form"));
  expect(await screen.findByRole("alert")).toHaveTextContent("Introduce solo el nombre de la entidad");
  expect(close).not.toHaveBeenCalled();
  expect(updateUser).not.toHaveBeenCalled();
});

test("provider registration submits with the keyboard and stores no password in the session", async () => {
  makeRequest.post.mockResolvedValue({ data: { ...persisted, token: "test-token" } });
  setup(<Register />, null);
  fireEvent.click(screen.getByRole("button", { name: "Project Provider" }));
  for (const [label, value] of [["Email", "provider@example.com"], ["Username", "login-name"], ["Password", "Password123"], ["Confirm password", "Password123"], ["Provider type", "company"], ["Contact person", "Jane Smith"], ["Company name", "Example Company"]]) {
    fireEvent.change(screen.getByLabelText(label), { target: { value } });
  }
  fireEvent.submit(screen.getByLabelText("Company name").closest("form"));
  await waitFor(() => expect(updateUser).toHaveBeenCalled());
  expect(makeRequest.post.mock.calls[0][1]).toMatchObject({ account_type: "local", provider_type: "company", company_name: "Example Company" });
  expect(updateUser.mock.calls[0][0]).not.toHaveProperty("password");
  expect(updateUser.mock.calls[0][0]).not.toHaveProperty("confirmPassword");
  expect(updateUser.mock.calls[0][0].providerDisplayName).toBe("Example Company");
});
