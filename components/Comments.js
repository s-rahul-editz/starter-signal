"use client";

import { useEffect, useRef } from "react";

export default function Comments() {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current || ref.current.hasChildNodes()) return;

    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.async = true;
    script.crossOrigin = "anonymous";

    script.setAttribute("data-repo", "s-rahul-editz/starter-signal");
    script.setAttribute("data-repo-id", "R_kgDOTcFiSg");
    script.setAttribute("data-category", "General");
    script.setAttribute("data-category-id", "DIC_kwDOTcFiSs4DBfj_");

    script.setAttribute("data-mapping", "pathname");
    script.setAttribute("data-strict", "0");
    script.setAttribute("data-reactions-enabled", "1");
    script.setAttribute("data-emit-metadata", "0");
    script.setAttribute("data-input-position", "bottom");
    script.setAttribute("data-theme", "light");
    script.setAttribute("data-lang", "en");

    ref.current.appendChild(script);
  }, []);

  return <div ref={ref} style={{ marginTop: 40, paddingTop: 24, borderTop: "1px solid var(--line)" }} />;
}
