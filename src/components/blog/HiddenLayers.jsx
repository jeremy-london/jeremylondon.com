import MatrixInput from "@components/blog/shared/MatrixInput";
import { useCallback, useEffect, useState } from "react";

const HiddenLayers = () => {
  // Gate UI until PythonModule exposes its window API
  const [uiReady, setUiReady] = useState(false);
  useEffect(() => {
    let alive = true;
    const until = Date.now() + 15000;
    const tick = () => {
      if (!alive) return;
      const hasAPI =
        typeof window !== "undefined" &&
        (typeof window.setPythonCode === "function" ||
          typeof window.executePython === "function");
      if (hasAPI) setUiReady(true);
      else if (Date.now() < until) requestAnimationFrame(tick);
    };
    tick();
    return () => {
      alive = false;
    };
  }, []);

  // ---------------- state ----------------
  const [matrixW1, setMatrixW1] = useState([
    [1, -1, 1, -5],
    [1, 1, 0, 0],
    [0, 1, 1, 1],
    [1, 0, 1, -2],
  ]);
  const [matrixW2, setMatrixW2] = useState([
    [1, 1, -1, 0, 0],
    [0, 0, 1, -1, 1],
  ]);
  // x is 3x1 in UI; python uses 1D array
  const [matrixX, setMatrixX] = useState([[2], [1], [3]]);

  // hidden Z/A 4x1; output Z/A 2x1
  const [matrixHZ, setMatrixHZ] = useState([[0], [0], [0], [0]]);
  const [matrixHA, setMatrixHA] = useState([[0], [0], [0], [0]]);
  const [matrixYZ, setMatrixYZ] = useState([[0], [0]]);
  const [matrixYA, setMatrixYA] = useState([[0], [0]]);

  // ---------------- helpers: python code i/o ----------------
  const getBaseCode = () =>
    (typeof window.getPythonCode === "function" && window.getPythonCode()) ||
    "";

  const setAndRun = useCallback((next) => {
    if (typeof window.setPythonCode === "function") {
      window.setPythonCode(next, { run: true });
    } else if (typeof window.executePython === "function") {
      window.executePython(next);
    }
  }, []);

  // ---------------- precise array patcher ----------------
  // Replaces ONLY the content inside np.array( ... ) for varName.
  // Preserves comments/whitespace around it and the rest of the file.
  const patchArrayLiteral = (src, varName, jsValue /* 1D or 2D */) => {
    const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const assignRe = new RegExp(
      `\\b${esc(varName)}\\s*=\\s*np\\.array\\s*\\(`,
      "m"
    );
    const m = assignRe.exec(src);
    if (!m) return src;

    // Find the matching closing ')'
    const i = m.index + m[0].length - 1; // at '('
    let depth = 0;
    let end = -1;
    for (let k = i; k < src.length; k++) {
      const ch = src[k];
      if (ch === "(") depth++;
      else if (ch === ")") {
        depth--;
        if (depth === 0) {
          end = k;
          break;
        }
      }
    }
    if (end === -1) return src; // malformed; bail out

    // Preserve any trailing comment on the same line after the ')'
    let lineEnd = src.indexOf("\n", end);
    if (lineEnd === -1) lineEnd = src.length;
    const afterParen = src.slice(end + 1, lineEnd); // e.g., "  # Hidden layer biases"

    // Build the new inner np.array content
    const buildNp = (val) => {
      if (Array.isArray(val[0])) {
        // 2D
        const rows = val.map((row) => `[${row.join(", ")}]`).join(", ");
        return `[${rows}]`;
      }
      // 1D
      return `[${val.join(", ")}]`;
    };

    const newInner = buildNp(jsValue);

    const before = src.slice(0, i + 1); // up to and including '('
    const after = src.slice(end); // from ')' inclusive
    const replaced = `${before}${newInner}${after}`;

    // Re-attach trailing comment (if any) after the ')', preserving rest of file
    const final = replaced.slice(0, end + 1) + afterParen + src.slice(lineEnd);

    return final;
  };

  // ---------------- parsing from python output ----------------
  // Grab the vector on the line immediately after the heading
  const vecAfter = (heading, text) => {
    const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`^${esc(heading)}\\s*\\n\\s*\\[([^\\]]+)\\]`, "mu");
    const m = text.match(re);
    if (!m) return [];
    return m[1].trim().split(/\s+/).filter(Boolean).map(Number);
  };
  const toCol = (arr) => (arr.length ? arr.map((v) => [v]) : []);

  useEffect(() => {
    const handler = (e) => {
      const out = String(e.detail ?? "");
      const hz = vecAfter("Hidden layer: (W1 * x + b1 → h_z):", out);
      const ha = vecAfter(
        "ReLU Activated Hidden layer: (W1 * x + b1 → ReLU → h):",
        out
      );
      const yz = vecAfter("Output Layer: (W2 * h + b2 → y_z):", out);
      const ya = vecAfter(
        "ReLU Activated Output Layer: (W2 * h + b2 → ReLU → y):",
        out
      );

      if (hz.length) setMatrixHZ(toCol(hz));
      if (ha.length) setMatrixHA(toCol(ha));
      if (yz.length) setMatrixYZ(toCol(yz));
      if (ya.length) setMatrixYA(toCol(ya));
    };
    window.addEventListener("pythonOutputChanged", handler);
    return () => window.removeEventListener("pythonOutputChanged", handler);
  }, []);

  // ---------------- handlers: patch arrays precisely & run ----------------
  const handleMatrixW1Change = (newW1) => {
    setMatrixW1(newW1);
    const base = getBaseCode();
    if (!base) return;
    const weights = newW1.map((r) => r.slice(0, 3)); // 4x3
    const biases = newW1.map((r) => r[3]); // 4
    let updated = patchArrayLiteral(base, "W1", weights);
    updated = patchArrayLiteral(updated, "b1", biases);
    setAndRun(updated);
  };

  const handleMatrixW2Change = (newW2) => {
    setMatrixW2(newW2);
    const base = getBaseCode();
    if (!base) return;
    const weights = newW2.map((r) => r.slice(0, 4)); // 2x4
    const biases = newW2.map((r) => r[4]); // 2
    let updated = patchArrayLiteral(base, "W2", weights);
    updated = patchArrayLiteral(updated, "b2", biases);
    setAndRun(updated);
  };

  const handleMatrixXChange = (newX) => {
    setMatrixX(newX);
    const base = getBaseCode();
    if (!base) return;
    const flat = newX.flat(); // 3x1 -> [2,1,3]
    const updated = patchArrayLiteral(base, "x", flat);
    setAndRun(updated);
  };

  return (
    <div
      id="hiddenLayersInteractiveInputs"
      className={
        (uiReady ? "" : "hidden ") +
        "mb-4 grid grid-cols-[2fr_1fr_1fr] grid-rows-[1fr_1fr_1fr] place-items-center gap-2 rounded-md bg-[#e9e9e9] p-1 text-[#d0d0d0] sm:gap-4 sm:p-6 md:gap-6 lg:gap-8 dark:bg-[#292929] dark:text-[#f5f2f0]"
      }
    >
      <div className="bg-transparent"></div>

      {/* Input x (3x1 UI; python 1D) */}
      <div className="text-center">
        <span className="text-base font-bold text-black sm:text-lg dark:text-white">
          Input
        </span>
        <MatrixInput
          columns={1}
          idPrefix="x"
          defaultValues={matrixX}
          onMatrixChange={handleMatrixXChange}
          width="w-full sm:w-auto"
        />
        <span className="p-2 text-black opacity-40 dark:text-white">1</span>
      </div>

      <div className="bg-transparent"></div>

      {/* Layer 1 W/B */}
      <div className="text-center">
        <span className="text-base font-bold text-black sm:text-lg dark:text-white">
          Layer 1 W/B
        </span>
        <MatrixInput
          columns={4}
          idPrefix="w1"
          defaultValues={matrixW1}
          onMatrixChange={handleMatrixW1Change}
          width="w-full sm:w-auto"
        />
        <span className="p-2 text-black opacity-0 dark:text-white">1</span>
      </div>

      {/* Hidden Z (4x1) */}
      <div className="text-center">
        <span className="text-base font-bold text-black sm:text-lg dark:text-white">
          Z
        </span>
        <MatrixInput
          columns={1}
          idPrefix="z"
          defaultValues={matrixHZ}
          onMatrixChange={setMatrixHZ}
          disabled
          width="w-full sm:w-auto"
        />
        <span className="p-2 text-black opacity-0 dark:text-white">1</span>
      </div>

      {/* Hidden A (4x1) */}
      <div className="text-center">
        <span className="text-base font-bold text-black sm:text-lg dark:text-white">
          A
        </span>
        <MatrixInput
          columns={1}
          idPrefix="A"
          defaultValues={matrixHA}
          onMatrixChange={setMatrixHA}
          disabled
          width="w-full sm:w-auto"
        />
        <span className="p-2 text-black opacity-40 dark:text-white">1</span>
      </div>

      {/* Layer 2 W/B */}
      <div className="text-center">
        <span className="text-base font-bold text-black sm:text-lg dark:text-white">
          Layer 2 W/B
        </span>
        <MatrixInput
          columns={5}
          idPrefix="w2"
          defaultValues={matrixW2}
          onMatrixChange={handleMatrixW2Change}
          width="w-full sm:w-auto"
        />
      </div>

      {/* Output Z (2x1) */}
      <div className="text-center">
        <span className="text-base font-bold text-black sm:text-lg dark:text-white">
          Z
        </span>
        <MatrixInput
          columns={1}
          idPrefix="y_z"
          defaultValues={matrixYZ}
          onMatrixChange={setMatrixYZ}
          disabled
          width="w-full sm:w-auto"
        />
      </div>

      {/* Output A (2x1) */}
      <div className="text-center">
        <span className="text-base font-bold text-black sm:text-lg dark:text-white">
          A
        </span>
        <MatrixInput
          columns={1}
          idPrefix="y_a"
          defaultValues={matrixYA}
          onMatrixChange={setMatrixYA}
          disabled
          width="w-full sm:w-auto"
        />
      </div>
    </div>
  );
};

export default HiddenLayers;
