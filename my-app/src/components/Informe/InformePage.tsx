import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { getInforme, descargarInforme } from "../../helpers/API";

// ── XML node types ────────────────────────────────────────────────────────────
type NodeKind = "element" | "comment" | "cdata" | "processing-instruction" | "dtd" | "text";

interface XmlNode {
  kind:     NodeKind;
  tag:      string;
  attrs:    Record<string, string>;
  text:     string | null;
  children: XmlNode[];
}

// ── Parser ────────────────────────────────────────────────────────────────────
function parseXml(xmlStr: string): XmlNode[] {
  // Extract processing instructions and DTD from raw string (DOMParser strips them)
  const extras: XmlNode[] = [];

  // Processing instructions (excluding <?xml ...?>)
  const piRe = /<\?(?!xml\s)(\S+)(.*?)\?>/gs;
  for (const m of xmlStr.matchAll(piRe)) {
    extras.push({ kind: "processing-instruction", tag: m[1], attrs: {}, text: m[2].trim(), children: [] });
  }

  // DTD
  const dtdMatch = xmlStr.match(/<!DOCTYPE[\s\S]*?\]>/);
  if (dtdMatch) {
    extras.push({ kind: "dtd", tag: "DOCTYPE", attrs: {}, text: dtdMatch[0], children: [] });
  }

  // Parse the element tree
  try {
    const parser = new DOMParser();
    const doc    = parser.parseFromString(xmlStr, "application/xml");
    if (doc.querySelector("parsererror")) return [];
    const root = domToNode(doc.documentElement);
    return [...extras, root];
  } catch {
    return [];
  }
}

function domToNode(el: Element): XmlNode {
  const attrs: Record<string, string> = {};
  for (let i = 0; i < el.attributes.length; i++) {
    const a = el.attributes[i];
    attrs[a.name] = a.value;
  }

  const children: XmlNode[] = [];
  let   text: string | null = null;

  el.childNodes.forEach((n) => {
    if (n.nodeType === Node.ELEMENT_NODE) {
      children.push(domToNode(n as Element));
    } else if (n.nodeType === Node.COMMENT_NODE) {
      children.push({ kind: "comment", tag: "", attrs: {}, text: n.textContent ?? "", children: [] });
    } else if (n.nodeType === Node.CDATA_SECTION_NODE) {
      children.push({ kind: "cdata", tag: "", attrs: {}, text: n.textContent ?? "", children: [] });
    } else if (n.nodeType === Node.TEXT_NODE) {
      const t = n.textContent?.trim();
      if (t) text = t;
    }
  });

  return { kind: "element", tag: el.tagName, attrs, text, children };
}

// ── Tree node ─────────────────────────────────────────────────────────────────
function TreeNode({ node, depth = 0 }: { node: XmlNode; depth?: number }) {
  const [open, setOpen] = useState(depth < 2);
  const indent = depth * 18;

  // ── Comment ──
  if (node.kind === "comment") {
    return (
      <div style={{ marginLeft: indent }} className="xml-row">
        <span className="xml-toggle xml-leaf">·</span>
        <span className="xml-comment">{`<!-- ${node.text} -->`}</span>
      </div>
    );
  }

  // ── CDATA ──
  if (node.kind === "cdata") {
    return (
      <div style={{ marginLeft: indent }} className="xml-row">
        <span className="xml-toggle xml-leaf">·</span>
        <span className="xml-cdata-kw">{"<![CDATA["}</span>
        <span className="xml-cdata-val">{node.text}</span>
        <span className="xml-cdata-kw">{"]]>"}</span>
      </div>
    );
  }

  // ── Processing instruction ──
  if (node.kind === "processing-instruction") {
    return (
      <div style={{ marginLeft: indent }} className="xml-row">
        <span className="xml-toggle xml-leaf">·</span>
        <span className="xml-pi">{`<?${node.tag} ${node.text}?>`}</span>
      </div>
    );
  }

  // ── DTD ──
  if (node.kind === "dtd") {
    const [dtdOpen, setDtdOpen] = useState(false);
    return (
      <div style={{ marginLeft: indent }}>
        <div className="xml-row" onClick={() => setDtdOpen(!dtdOpen)} style={{ cursor: "pointer" }}>
          <span className="xml-toggle">{dtdOpen ? "▾" : "▸"}</span>
          <span className="xml-dtd-kw">{"<!DOCTYPE informe ["}</span>
          {!dtdOpen && <span className="xml-muted"> …]&gt;</span>}
        </div>
        {dtdOpen && (
          <div className="xml-children">
            <pre className="xml-dtd-body">{node.text}</pre>
          </div>
        )}
      </div>
    );
  }

  // ── Element ──
  const hasChildren = node.children.length > 0;

  return (
    <div style={{ marginLeft: indent }}>
      <div
        className="xml-row"
        onClick={() => hasChildren && setOpen(!open)}
        style={{ cursor: hasChildren ? "pointer" : "default" }}
      >
        {hasChildren
          ? <span className="xml-toggle">{open ? "▾" : "▸"}</span>
          : <span className="xml-toggle xml-leaf">·</span>
        }

        <span className="xml-tag">&lt;{node.tag}</span>

        {Object.entries(node.attrs).map(([k, v]) => (
          <span key={k}>
            {" "}<span className="xml-attr-key">{k}</span>
            <span className="xml-eq">=</span>
            <span className="xml-attr-val">"{v}"</span>
          </span>
        ))}

        {!hasChildren && node.text !== null ? (
          <>
            <span className="xml-tag">&gt;</span>
            <span className="xml-text">{node.text}</span>
            <span className="xml-tag">&lt;/{node.tag}&gt;</span>
          </>
        ) : (
          <span className="xml-tag">{hasChildren ? ">" : " />"}</span>
        )}
      </div>

      {hasChildren && open && (
        <div className="xml-children">
          {node.children.map((child, i) => (
            <TreeNode key={i} node={child} depth={depth + 1} />
          ))}
          <div>
            <span className="xml-tag">&lt;/{node.tag}&gt;</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Legend ────────────────────────────────────────────────────────────────────
function Legend() {
  const items = [
    { color: "#79b8ff", label: "Elemento / Tag" },
    { color: "#b392f0", label: "Atributo" },
    { color: "#f97583", label: "Valor de atributo" },
    { color: "#e8ff47", label: "Texto / contenido" },
    { color: "#6a9955", label: "Comentario" },
    { color: "#ce9178", label: "CDATA" },
    { color: "#c586c0", label: "Instrucción de procesamiento" },
    { color: "#4ec9b0", label: "DTD" },
  ];
  return (
    <div className="xml-legend">
      {items.map(({ color, label }) => (
        <span key={label} className="xml-legend-item">
          <span className="xml-legend-dot" style={{ background: color }} />
          {label}
        </span>
      ))}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function InformePage() {
  const { token = "" } = useParams<{ token: string }>();
  const [nodes,     setNodes]     = useState<XmlNode[]>([]);
  const [xmlStr,    setXmlStr]    = useState<string | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [dlLoading, setDlLoading] = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const fetchInforme = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getInforme(token);
      const raw = typeof res.data === "string" ? res.data : String(res.data);
      setXmlStr(raw);
      setNodes(parseXml(raw));
    } catch {
      setError("No se pudo cargar el informe");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchInforme(); }, [fetchInforme]);

  const handleDescargar = async () => {
    setDlLoading(true);
    try {
      const res  = await descargarInforme(token);
      const blob = new Blob([res.data], { type: "application/xml" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = "informe.xml";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Error al descargar el informe");
    } finally {
      setDlLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .informe-page {
          max-width: 1000px;
          margin: 0 auto;
          padding: 3rem 1.5rem;
        }
        .informe-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .xml-legend {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem 1.5rem;
          margin-bottom: 1rem;
          font-size: 0.72rem;
          color: var(--text-muted);
        }
        .xml-legend-item { display: flex; align-items: center; gap: 0.4rem; }
        .xml-legend-dot  { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

        .xml-panel {
          background: #0a0a0a;
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 1.5rem;
          overflow-x: auto;
          font-family: var(--font-mono);
          font-size: 0.78rem;
          line-height: 1.9;
        }
        .xml-row {
          display: flex;
          align-items: baseline;
          flex-wrap: wrap;
          gap: 2px;
          padding: 1px 4px;
          border-radius: 2px;
          transition: background 0.1s;
        }
        .xml-row:hover { background: rgba(255,255,255,0.04); }

        .xml-toggle      { color: var(--text-muted); width: 14px; flex-shrink: 0; user-select: none; font-size: 0.68rem; }
        .xml-leaf        { opacity: 0.3; }
        .xml-muted       { color: var(--text-muted); }

        /* colours */
        .xml-tag         { color: #79b8ff; }
        .xml-attr-key    { color: #b392f0; }
        .xml-eq          { color: var(--text-muted); }
        .xml-attr-val    { color: #f97583; }
        .xml-text        { color: #e8ff47; font-weight: 600; }
        .xml-comment     { color: #6a9955; font-style: italic; }
        .xml-cdata-kw    { color: #ce9178; }
        .xml-cdata-val   { color: #ce9178; font-style: italic; }
        .xml-pi          { color: #c586c0; }
        .xml-dtd-kw      { color: #4ec9b0; }
        .xml-dtd-body    {
          color: #4ec9b0;
          font-family: var(--font-mono);
          font-size: 0.72rem;
          line-height: 1.6;
          background: transparent;
          border: none;
          margin: 0;
          white-space: pre;
          opacity: 0.85;
        }

        .xml-children    { border-left: 1px dashed #2a2a2a; margin-left: 7px; padding-left: 7px; }

        .raw-section { margin-top: 2rem; }
        .raw-toggle  {
          background: none; border: none;
          color: var(--text-muted); font-family: var(--font-mono);
          font-size: 0.75rem; cursor: pointer;
          text-decoration: underline; padding: 0;
          margin-bottom: 0.75rem; display: block;
        }
        .raw-pre {
          background: #0a0a0a;
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 1rem 1.5rem;
          overflow-x: auto;
          font-size: 0.7rem;
          line-height: 1.6;
          color: var(--text-muted);
          white-space: pre;
        }
      `}</style>

      <div className="informe-page">
        <div className="informe-header">
          <h1 className="page-title" style={{ marginBottom: 0 }}>
            Informe <span>XML</span>
          </h1>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button className="btn btn-secondary" onClick={fetchInforme} disabled={loading}>
              ↺ Actualizar
            </button>
            <button className="btn btn-primary" onClick={handleDescargar} disabled={dlLoading || !xmlStr}>
              {dlLoading ? "Descargando..." : "⬇ Descargar XML"}
            </button>
          </div>
        </div>

        {loading && <div className="spinner-wrap"><div className="spinner" /></div>}
        {error   && <div className="empty">{error}</div>}

        {!loading && nodes.length > 0 && (
          <>
            <p style={{ color: "var(--text-muted)", fontSize: "0.78rem", marginBottom: "0.75rem" }}>
              Haz clic en un nodo para expandirlo o colapsarlo.
            </p>
            <Legend />
            <div className="xml-panel">
              {nodes.map((n, i) => <TreeNode key={i} node={n} depth={0} />)}
            </div>
            <RawXml xml={xmlStr!} />
          </>
        )}
      </div>
    </>
  );
}

function RawXml({ xml }: { xml: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="raw-section">
      <button className="raw-toggle" onClick={() => setShow(!show)}>
        {show ? "▾ Ocultar XML raw" : "▸ Ver XML raw"}
      </button>
      {show && <pre className="raw-pre">{xml}</pre>}
    </div>
  );
}
