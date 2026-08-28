import { insertTextAtCaret, serializeEditorContent } from "./richTextEditor";

const setCaret = (node, offset) => {
  const range = document.createRange();
  range.setStart(node, offset);
  range.collapse(true);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
};

describe("rich-text editor caret insertion", () => {
  let editor;
  let link;

  beforeEach(() => {
    editor = document.createElement("div");
    link = document.createElement("a");
    link.className = "editor-link";
    link.textContent = "thebryancarwash.com";
    editor.appendChild(link);
    document.body.appendChild(editor);
  });

  afterEach(() => {
    document.body.innerHTML = "";
    window.getSelection().removeAllRanges();
  });

  test("Enter at the end of an auto-link inserts a normal-text line", () => {
    setCaret(link.firstChild, link.textContent.length);

    expect(insertTextAtCaret(editor, "\n", { exitLinkAtEnd: true })).toBe(true);
    expect(insertTextAtCaret(editor, "ARL")).toBe(true);

    expect(link.textContent).toBe("thebryancarwash.com");
    expect(editor.textContent).toBe("thebryancarwash.com\nARL");
    expect(link.nextSibling.nodeValue).toBe("\n");
    expect(link.nextSibling.nextSibling.nodeValue).toBe("ARL");
  });

  test("insertion within an auto-link remains within the link", () => {
    setCaret(link.firstChild, link.textContent.length - 1);

    expect(insertTextAtCaret(editor, "X", { exitLinkAtEnd: true })).toBe(true);

    expect(link.textContent).toBe("thebryancarwash.coXm");
    expect(editor.childNodes).toHaveLength(1);
  });

  test.each([" ", "\n"])(
    "a deleted URL character does not return after inserting %p",
    (separator) => {
      link.dataset.rawUrl = "https://www.thebryancarwash.comX";
      link.dataset.displayUrl = "thebryancarwash.comX";
      link.dataset.urlPrefix = "https://www.";
      link.dataset.urlSuffix = "";

      // Simulate Backspace changing the live anchor before the input event is
      // serialized back into React state.
      link.textContent = "thebryancarwash.com";
      editor.appendChild(document.createTextNode(separator));

      expect(serializeEditorContent(editor)).toBe(
        `https://www.thebryancarwash.com${separator}`
      );
    }
  );
});
