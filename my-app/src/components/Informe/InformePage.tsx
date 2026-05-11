import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { getInforme, descargarInforme } from "../../helpers/API";

// ── XML node type ─────────────────────────────────────────────────────────────
interface XmlNode {
  tag: string;
  attrs: Record<string, string>;
  text: string | null;
  children: XmlNode[];
}

function parseXml(xmlStr: string): XmlNode | null {
  try {
    const parser = new DOMParser();
    const doc    = parser.parseFromString(xmlStr, "application/xml");
    const err    = doc.querySelector("parsererror");
    if (err) return null;
    return domToNode(doc.documentElement);
  } catch {
    return null;
  }
}

function domToNode(el: Element): XmlNode {
  const attrs: Record<string, string> = {};
  for (let i = 0; i < el.attributes.length; i++) {
    const a = el.attributes[i];
    attrs[a.name] = a.value;
  }
  const children: XmlNode[] = [];
  let text: string | null = null;

  el.childNodes.forEach((n) => {
    if (n.nodeType === Node.ELEMENT_NODE) {
      children.push(domToNode(n as Element));
    } else if (n.nodeType === Node.TEXT_NODE) {
      const t = n.textContent?.trim();
      if (t) text = t;
    }
  });

  return { tag: el.tagName, attrs, text, children };
}

// ── Tree node component ───────────────────────────────────────────────────────
function TreeNode({ node, depth = 0 }: { node: XmlNode; depth?: number }) {
  const [open, setOpen] = useState(depth < 2);
  const hasChildren = node.children.length > 0;
  const indent = depth * 20;

  return (
    <div style={{ marginLeft: indent }}>
      <div
        className="xml-row"
        onClick={() => hasChildren && setOpen(!open)}
        style={{ cursor: hasChildren ? "pointer" : "default" }}
      >
        {hasChildren && (
          <span className="xml-toggle">{open ? "▾" : "▸"}</span>
        )}
        {!hasChildren && <span className="xml-toggle xml-leaf">·</span>}

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
          <div style={{ marginLeft: 0 }}>
            <span className="xml-tag">&lt;/{node.tag}&gt;</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function InformePage() {
  const { token = "" } = useParams<{ token: string }>();
  const [xmlStr,    setXmlStr]    = useState<string | null>(null);
  const [xmlNode,   setXmlNode]   = useState<XmlNode | null>(null);
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
      setXmlNode(parseXml(raw));
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
        .informe-page { max-width: 960px; margin: 0 auto; padding: 3rem 1.5rem; }

        .informe-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .xml-panel {
          background: #0a0a0a;
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 1.5rem;
          overflow-x: auto;
          font-family: var(--font-mono);
          font-size: 0.8rem;
          line-height: 1.8;
        }

        .xml-row {
          display: flex;
          align-items: baseline;
          flex-wrap: wrap;
          gap: 2px;
          border-radius: 2px;
          padding: 1px 4px;
          transition: background 0.1s;
        }
        .xml-row:hover { background: rgba(255,255,255,0.04); }

        .xml-toggle {
          color: var(--text-muted);
          width: 14px;
          flex-shrink: 0;
          user-select: none;
          font-size: 0.7rem;
        }
        .xml-leaf { opacity: 0.3; }

        .xml-tag      { color: #79b8ff; }
        .xml-attr-key { color: #b392f0; }
        .xml-eq       { color: var(--text-muted); }
        .xml-attr-val { color: #f97583; }
        .xml-text     { color: #e8ff47; font-weight: 600; }

        .xml-children { border-left: 1px dashed #2a2a2a; margin-left: 7px; padding-left: 7px; }

        .informe-raw {
          margin-top: 2rem;
        }
        .raw-toggle {
          background: none;
          border: none;
          color: var(--text-muted);
          font-family: var(--font-mono);
          font-size: 0.75rem;
          cursor: pointer;
          text-decoration: underline;
          padding: 0;
          margin-bottom: 0.75rem;
          display: block;
        }
        .raw-pre {
          background: #0a0a0a;
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 1rem 1.5rem;
          overflow-x: auto;
          font-size: 0.72rem;
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

        {error && <div className="empty">{error}</div>}

        {!loading && xmlNode && (
          <>
            <p style={{ color: "var(--text-muted)", fontSize: "0.78rem", marginBottom: "1rem" }}>
              Haz clic en un nodo para expandirlo o colapsarlo.
            </p>
            <div className="xml-panel">
              <TreeNode node={xmlNode} depth={0} />
            </div>

            <RawXml xml={xmlStr!} />
          </>
        )}
      </div>
    </>
  );
}

// ── Raw XML collapsible ───────────────────────────────────────────────────────
function RawXml({ xml }: { xml: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="informe-raw">
      <button className="raw-toggle" onClick={() => setShow(!show)}>
        {show ? "▾ Ocultar XML raw" : "▸ Ver XML raw"}
      </button>
      {show && <pre className="raw-pre">{xml}</pre>}
    </div>
  );
}
