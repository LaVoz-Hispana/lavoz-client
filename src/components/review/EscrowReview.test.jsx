import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { I18nextProvider } from "react-i18next";
import i18n from "../../i18n";
import { AuthContext } from "../../context/authContext";
import { makeRequest } from "../../axios";
import EscrowReview from "./EscrowReview";

jest.mock("../../axios", () => ({
  makeRequest: { get: jest.fn(), post: jest.fn(), put: jest.fn() },
}));
let review;
beforeEach(async () => {
  jest.clearAllMocks();
  review = null;
  await i18n.changeLanguage("en");
  makeRequest.get.mockImplementation(async () => ({
    data: {
      review,
      canReview: true,
      counterpartName: "Example Company",
      counterpartProviderTypeLabel: "Company",
    },
  }));
});
function setup() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <I18nextProvider i18n={i18n}>
        <AuthContext.Provider
          value={{ currentUser: { id: 2, account_type: "student" } }}
        >
          <EscrowReview escrowId={8} />
        </AuthContext.Provider>
      </I18nextProvider>
    </QueryClientProvider>,
  );
}
test("a participant creates and edits their own review from the completed escrow", async () => {
  makeRequest.post.mockImplementation(async (url, body) => {
    review = { id: 90, ...body };
    return { data: review };
  });
  makeRequest.put.mockImplementation(async (url, body) => {
    review = { id: 90, ...body };
    return { data: review };
  });
  setup();
  fireEvent.change(await screen.findByLabelText("Your rating"), {
    target: { value: "4.5" },
  });
  fireEvent.change(screen.getByLabelText("Your review (optional)"), {
    target: { value: "Great collaboration" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Submit review" }));
  expect(await screen.findByText("Review saved.")).toBeInTheDocument();
  expect(makeRequest.post).toHaveBeenCalledWith("/reviews/escrows/8", {
    rating: 4.5,
    commentary: "Great collaboration",
  });
  fireEvent.change(screen.getByLabelText("Your rating"), {
    target: { value: "5" },
  });
  fireEvent.click(await screen.findByRole("button", { name: "Save review" }));
  await waitFor(() =>
    expect(makeRequest.put).toHaveBeenCalledWith("/reviews/90", {
      rating: 5,
      commentary: "Great collaboration",
    }),
  );
  expect(screen.queryByRole("link")).not.toBeInTheDocument();
});
test("forbidden review responses show an error without a form or counterpart identity", async () => {
  makeRequest.get.mockRejectedValue({ response: { status: 403 } });
  setup();
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Unable to load your review.",
  );
  expect(screen.queryByLabelText("Your rating")).not.toBeInTheDocument();
  expect(screen.queryByText("Example Company")).not.toBeInTheDocument();
});
