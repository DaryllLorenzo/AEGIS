export type WordBox = {
  left: number;
  top: number;
  right: number;
  bottom: number;
  text: string;
  centerY: number;
};

export type HighlightLine = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export function extractWordsFromTextLayer(pageContainer: HTMLElement): WordBox[] {
  const textLayer = pageContainer.querySelector(
    ".react-pdf__Page__textContent, .textLayer",
  );
  if (!textLayer) return [];

  const containerRect = pageContainer.getBoundingClientRect();
  const words: WordBox[] = [];

  const walker = document.createTreeWalker(textLayer, NodeFilter.SHOW_TEXT, null);
  let node: Node | null = walker.nextNode();
  const range = document.createRange();

  while (node) {
    const text = node.nodeValue || "";
    const regex = /\S+/g;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      const wordText = match[0];
      const startOffset = match.index;
      const endOffset = startOffset + wordText.length;

      try {
        range.setStart(node, startOffset);
        range.setEnd(node, endOffset);

        const rect = range.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          const left = rect.left - containerRect.left;
          const top = rect.top - containerRect.top;
          const right = rect.right - containerRect.left;
          const bottom = rect.bottom - containerRect.top;

          words.push({
            left,
            top,
            right,
            bottom,
            text: wordText,
            centerY: top + (bottom - top) / 2,
          });
        }
      } catch {
        // DOM mutation during iteration
      }
    }
    node = walker.nextNode();
  }

  return words;
}

function findClosestWordIndex(words: WordBox[], x: number, y: number): number {
  if (words.length === 0) return -1;

  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    if (x >= w.left && x <= w.right && y >= w.top && y <= w.bottom) {
      return i;
    }
  }

  const lineIndices: number[] = [];
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    if (y >= w.top - 4 && y <= w.bottom + 4) {
      lineIndices.push(i);
    }
  }

  if (lineIndices.length > 0) {
    let minDist = Infinity;
    let bestIdx = lineIndices[0];
    for (const idx of lineIndices) {
      const w = words[idx];
      let dist = 0;
      if (x < w.left) dist = w.left - x;
      else if (x > w.right) dist = x - w.right;
      if (dist < minDist) {
        minDist = dist;
        bestIdx = idx;
      }
    }
    return bestIdx;
  }

  let minDist = Infinity;
  let bestIdx = 0;
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    const cx = (w.left + w.right) / 2;
    const cy = (w.top + w.bottom) / 2;
    const dist = Math.hypot(x - cx, y - cy);
    if (dist < minDist) {
      minDist = dist;
      bestIdx = i;
    }
  }
  return bestIdx;
}

export function computeHighlightLinesFromWords(
  words: WordBox[],
  startX: number,
  startY: number,
  endX: number,
  endY: number,
): { lines: HighlightLine[]; text: string } | null {
  if (words.length === 0) return null;

  const startIndex = findClosestWordIndex(words, startX, startY);
  const endIndex = findClosestWordIndex(words, endX, endY);
  if (startIndex === -1 || endIndex === -1) return null;

  const minIdx = Math.min(startIndex, endIndex);
  const maxIdx = Math.max(startIndex, endIndex);

  const selectedWords = words.slice(minIdx, maxIdx + 1);
  if (selectedWords.length === 0) return null;

  const rows: WordBox[][] = [];
  for (const word of selectedWords) {
    const existing = rows.find((row) =>
      row.some((w) => Math.abs(w.centerY - word.centerY) < 6),
    );
    if (existing) {
      existing.push(word);
    } else {
      rows.push([word]);
    }
  }

  rows.sort((a, b) => a[0].top - b[0].top);

  const lines: HighlightLine[] = [];
  const texts: string[] = [];

  for (const row of rows) {
    const minX = Math.min(...row.map((w) => w.left));
    const maxX = Math.max(...row.map((w) => w.right));
    const minY = Math.min(...row.map((w) => w.top));
    const maxY = Math.max(...row.map((w) => w.bottom));

    lines.push({
      x: minX,
      y: minY,
      width: Math.max(maxX - minX, 4),
      height: maxY - minY,
    });

    texts.push(...row.map((w) => w.text));
  }

  return { lines, text: texts.join(" ") };
}
