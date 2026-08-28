const getContainingEditorLink = (root, node) => {
  const element = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
  const link = element?.closest?.("a.editor-link");
  return link && root.contains(link) ? link : null;
};

const isCaretAtEndOf = (container, offset, ancestor) => {
  if (container.nodeType === Node.TEXT_NODE) {
    if (offset !== container.nodeValue.length) return false;
  } else if (container.nodeType === Node.ELEMENT_NODE) {
    if (offset !== container.childNodes.length) return false;
  } else {
    return false;
  }

  let node = container;
  while (node !== ancestor) {
    if (node.nextSibling) return false;
    node = node.parentNode;
    if (!node) return false;
  }

  return true;
};

export const getEditorLinkValue = (link) => {
  const rawUrl = link.dataset.rawUrl || link.getAttribute("href") || link.textContent || "";
  const originalDisplayUrl = link.dataset.displayUrl;

  // Older rendered links do not carry editing metadata, so retain their
  // original serialization behavior until they are rendered again.
  if (originalDisplayUrl === undefined || link.textContent === originalDisplayUrl) {
    return rawUrl;
  }

  return `${link.dataset.urlPrefix || ""}${link.textContent || ""}${link.dataset.urlSuffix || ""}`;
};

export const serializeEditorContent = (root) => {
  const serializeNode = (node) => {
    if (node.nodeType === Node.TEXT_NODE) return node.nodeValue;
    if (node.nodeType !== Node.ELEMENT_NODE) return "";
    if (node.tagName === "BR") return "\n";
    if (node.tagName === "A" && node.classList.contains("editor-link")) {
      return getEditorLinkValue(node);
    }

    return Array.from(node.childNodes).map(serializeNode).join("");
  };

  return serializeNode(root).replace(/\r\n/g, "\n");
};

export const insertTextAtCaret = (root, text, { exitLinkAtEnd = false } = {}) => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return false;

  const range = selection.getRangeAt(0);
  if (!root.contains(range.commonAncestorContainer)) return false;

  if (exitLinkAtEnd && range.collapsed) {
    const link = getContainingEditorLink(root, range.startContainer);
    if (link && isCaretAtEndOf(range.startContainer, range.startOffset, link)) {
      range.setStartAfter(link);
      range.collapse(true);
    }
  }

  range.deleteContents();
  const textNode = document.createTextNode(text);
  range.insertNode(textNode);
  range.setStartAfter(textNode);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
  return true;
};
