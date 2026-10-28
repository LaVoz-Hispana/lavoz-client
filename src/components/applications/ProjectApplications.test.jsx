import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { createInstance } from "i18next";
import { I18nextProvider } from "react-i18next";
import { AuthContext } from "../../context/authContext";
import { makeRequest } from "../../axios";
import {
  resumeApplicationEnglish,
  resumeApplicationSpanish,
} from "../../resumeApplicationStrings";
import ProjectApplications from "./ProjectApplications";
import ResumeLibrary from "../resume/ResumeLibrary";

jest.mock("../../axios", () => ({
  makeRequest: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));
const student = { id: 2, account_type: "student" };
const project = { id: 5, userId: 3, title: "Design a logo", status: "open" };
const resume = {
  id: 7,
  label: "Design CV",
  isDefault: 1,
  originalFileName: "resume.pdf",
  mimeType: "application/pdf",
  createdAt: "2026-10-01T00:00:00Z",
  inUse: 0,
};
let savedResumes, applications, i18n;

beforeEach(async () => {
  jest.clearAllMocks();
  savedResumes = [resume];
  applications = [];
  i18n = createInstance();
  await i18n.init({
    lng: "en",
    resources: {
      en: { translation: { resumeApplications: resumeApplicationEnglish } },
      es: { translation: { resumeApplications: resumeApplicationSpanish } },
    },
  });
  makeRequest.get.mockImplementation((url) =>
    Promise.resolve({ data: url === "/resumes" ? savedResumes : applications }),
  );
});

function setup(
  element = <ProjectApplications project={project} />,
  user = student,
) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const wrap = (child, actor = user) => (
    <QueryClientProvider client={client}>
      <I18nextProvider i18n={i18n}>
        <AuthContext.Provider value={{ currentUser: actor }}>
          <MemoryRouter>{child}</MemoryRouter>
        </AuthContext.Provider>
      </I18nextProvider>
    </QueryClientProvider>
  );
  return { ...render(wrap(element)), client, wrap };
}

test("Apply selects the default resume, sends the note and displays application-in-progress", async () => {
  makeRequest.post.mockImplementation(async () => {
    applications = [
      {
        id: 10,
        projectId: 5,
        resumeId: 7,
        resumeLabel: resume.label,
        projectStatus: "open",
        status: "submitted",
        createdAt: resume.createdAt,
      },
    ];
    return { data: { id: 10, status: "submitted" } };
  });
  setup();
  fireEvent.click(await screen.findByRole("button", { name: "Apply" }));
  const selector = await screen.findByLabelText("Select a saved resume");
  await waitFor(() => expect(selector).toHaveValue("7"));
  fireEvent.change(
    screen.getByLabelText("Interest and qualifications (optional)"),
    { target: { value: "I study design." } },
  );
  fireEvent.click(screen.getByRole("button", { name: "Submit Application" }));
  expect(
    await screen.findByText(resumeApplicationEnglish.submittedSuccess),
  ).toBeInTheDocument();
  expect(makeRequest.post).toHaveBeenCalledWith("/applications/projects/5", {
    resumeId: 7,
    note: "I study design.",
  });
  expect(
    makeRequest.post.mock.calls.some(([url]) => url.includes("escrow")),
  ).toBe(false);
  fireEvent.click(screen.getByRole("button", { name: "Close" }));
  expect(
    await screen.findByText("Application in Progress"),
  ).toBeInTheDocument();
});

test("a student with no resumes uploads to the private library before submitting", async () => {
  savedResumes = [];
  makeRequest.post.mockImplementation(async (url) => {
    if (url === "/resumes") {
      savedResumes = [resume];
      return { data: resume };
    }
    return { data: { id: 10, status: "submitted" } };
  });
  setup();
  fireEvent.click(await screen.findByRole("button", { name: "Apply" }));
  const input = await screen.findByLabelText("Resume file");
  expect(
    screen.getByRole("button", { name: "Submit Application" }),
  ).toBeDisabled();
  fireEvent.change(input, {
    target: {
      files: [
        new File(["%PDF-1.7\n%%EOF"], "resume.pdf", {
          type: "application/pdf",
        }),
      ],
    },
  });
  fireEvent.click(screen.getByRole("button", { name: "Upload Resume" }));
  await waitFor(() =>
    expect(screen.getByLabelText("Select a saved resume")).toHaveValue("7"),
  );
  fireEvent.click(screen.getByRole("button", { name: "Submit Application" }));
  await screen.findByText(resumeApplicationEnglish.submittedSuccess);
  expect(makeRequest.post.mock.calls.map(([url]) => url)).toEqual([
    "/resumes",
    "/applications/projects/5",
  ]);
  expect(makeRequest.post.mock.calls[0][1].get("file").name).toBe("resume.pdf");
});

test("invalid file MIME is rejected before uploading; active applications disable deletion", async () => {
  savedResumes = [{ ...resume, inUse: 1 }];
  setup(<ResumeLibrary optional />);
  expect(await screen.findByText("Design CV")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Delete" })).toBeDisabled();
  expect(
    screen.getByText(resumeApplicationEnglish.optional),
  ).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText("Resume file"), {
    target: { files: [new File(["text"], "fake.pdf", { type: "text/plain" })] },
  });
  expect(screen.getByRole("alert")).toHaveTextContent(
    resumeApplicationEnglish.errors.resume_invalid_type,
  );
  expect(screen.getByRole("button", { name: "Upload Resume" })).toBeDisabled();
  expect(makeRequest.post).not.toHaveBeenCalled();
  expect(screen.queryByRole("link")).not.toBeInTheDocument();
});

test("project owner can select an applicant and reach the pending escrow", async () => {
  applications = [
    {
      id: 10,
      projectId: 5,
      resumeId: 7,
      resumeLabel: resume.label,
      studentUsername: "Applicant",
      status: "submitted",
      projectStatus: "open",
      createdAt: resume.createdAt,
    },
  ];
  jest.spyOn(window, "confirm").mockReturnValue(true);
  makeRequest.put.mockImplementation(async () => {
    applications = [
      {
        ...applications[0],
        status: "selected",
        projectStatus: "in_escrow",
        escrowId: 20,
      },
    ];
    return { data: { escrowId: 20 } };
  });
  setup(undefined, { id: 3, account_type: "local" });
  fireEvent.click(
    await screen.findByRole("button", { name: "Select Applicant" }),
  );
  expect(
    await screen.findByRole("link", { name: "View Escrow" }),
  ).toHaveAttribute("href", "/escrows/20");
  expect(makeRequest.put).toHaveBeenCalledWith(
    "/applications/projects/5/10/select",
  );
  expect(
    screen.queryByRole("button", { name: "Apply" }),
  ).not.toBeInTheDocument();
  window.confirm.mockRestore();
});

test("guest and unrelated provider do not fetch application or resume data", () => {
  const view = setup(undefined, null);
  expect(makeRequest.get).not.toHaveBeenCalled();
  view.rerender(
    view.wrap(<ProjectApplications project={project} />, {
      id: 99,
      account_type: "local",
    }),
  );
  expect(makeRequest.get).not.toHaveBeenCalled();
});

test("Spanish library exposes translated accessible labels and error messages", async () => {
  await i18n.changeLanguage("es");
  setup(<ResumeLibrary />);
  expect(screen.getByLabelText("Etiqueta del currículum")).toBeInTheDocument();
  expect(screen.getByLabelText("Archivo del currículum")).toBeInTheDocument();
  const list = screen.getByRole("list");
  expect(await within(list).findByText("Predeterminado")).toBeInTheDocument();
});

test("switching from owner to student immediately removes cached applicant identities", async () => {
  applications = [
    {
      id: 10,
      projectId: 5,
      resumeId: 7,
      resumeLabel: "Private CV",
      status: "submitted",
      projectStatus: "open",
      createdAt: resume.createdAt,
      applicant: {
        id: 2,
        username: "Private Applicant",
        profilePic: "private-photo",
      },
    },
  ];
  const view = setup(undefined, { id: 3, account_type: "local" });
  expect(await screen.findByText("Private Applicant")).toBeInTheDocument();
  makeRequest.get.mockImplementation(() => new Promise(() => {}));
  view.rerender(
    view.wrap(<ProjectApplications project={project} />, {
      id: 4,
      account_type: "student",
    }),
  );
  expect(screen.queryByText("Private Applicant")).not.toBeInTheDocument();
  expect(screen.queryByText("Private CV")).not.toBeInTheDocument();
  expect(screen.queryByRole("img")).not.toBeInTheDocument();
});

test("a forbidden owner response never renders cached applicant details", async () => {
  makeRequest.get.mockRejectedValue({
    response: { status: 403, data: { code: "forbidden" } },
  });
  setup(undefined, { id: 3, account_type: "local" });
  expect(await screen.findByRole("alert")).toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "Select Applicant" }),
  ).not.toBeInTheDocument();
  expect(screen.queryByRole("img")).not.toBeInTheDocument();
});
