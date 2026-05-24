"use client";

import { ContextGL } from "@/components/context-gl";
import { useGLContext } from "@/context/gl-context-code";
import { fragShaderDefault } from "@/utils/shaders";
import { Editor } from "@monaco-editor/react";
import { useState } from "react";

type BottomPanelTab = "compile" | "logs";

export default function Home() {
  const [code, setCode] = useState(fragShaderDefault);
  const [activeTab, setActiveTab] = useState<BottomPanelTab>("compile");

  const { clearLogs, handleSetNewCode, logs } = useGLContext();

  const latestError = logs.find((log) => log.level === "error");
  const hasErrors = Boolean(latestError);

  const handleCompile = (code: string) => {
    setActiveTab("logs");
    handleSetNewCode(code);
  };

  return (
    <div className="flex h-dvh items-stretch bg-neutral-950 text-neutral-100">
      <section className="flex h-full w-1/2 min-w-0 flex-col border-r border-neutral-800">
        <div className="min-h-0 flex-1">
          <Editor
            height="100%"
            language="c"
            onChange={(value) => setCode(value ?? "")}
            theme="vs-dark"
            value={code}
          />
        </div>
        <div className="border-t border-neutral-800 bg-neutral-950/95">
          <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-3">
            <div className="inline-flex rounded-md border border-neutral-800 bg-neutral-900 p-1">
              <button
                className={`rounded px-3 py-1.5 text-sm font-medium transition ${activeTab === "compile"
                  ? "bg-neutral-100 text-neutral-950"
                  : "text-neutral-400 hover:text-neutral-100"
                  }`}
                onClick={() => setActiveTab("compile")}
                type="button"
              >
                Build
              </button>
              <button
                className={`rounded px-3 py-1.5 text-sm font-medium transition ${activeTab === "logs"
                  ? "bg-neutral-100 text-neutral-950"
                  : "text-neutral-400 hover:text-neutral-100"
                  }`}
                onClick={() => setActiveTab("logs")}
                type="button"
              >
                Logs
              </button>
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <span className={`h-2 w-2 rounded-full ${hasErrors ? "bg-red-500" : "bg-emerald-400"}`} />
              <span>{hasErrors ? "Erro no shader" : "Renderer pronto"}</span>
            </div>
          </div>

          <div className="h-48 overflow-hidden">
            {activeTab === "compile" ? (
              <div className="grid h-full grid-cols-[1fr_auto] gap-4 px-4 py-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-neutral-100">Fragment shader</p>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                    <div className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2">
                      <p className="text-neutral-500">Uniform</p>
                      <p className="mt-1 font-mono text-neutral-200">iResolution</p>
                    </div>
                    <div className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2">
                      <p className="text-neutral-500">Tipo</p>
                      <p className="mt-1 font-mono text-neutral-200">vec3</p>
                    </div>
                    <div className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2">
                      <p className="text-neutral-500">Tempo</p>
                      <p className="mt-1 font-mono text-neutral-200">iTime</p>
                    </div>
                  </div>
                  {latestError ? (
                    <p className="mt-3 truncate rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 font-mono text-xs text-red-200">
                      {latestError.message}
                    </p>
                  ) : (
                    <p className="mt-3 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-100">
                      Compilacao atual sem erros reportados.
                    </p>
                  )}
                </div>
                <div className="flex w-40 flex-col justify-between">
                  <button
                    onClick={() => handleCompile(code)}
                    className="rounded-md bg-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-950/40 transition hover:bg-blue-400"
                    type="button"
                  >
                    Compilar
                  </button>
                  <button
                    onClick={clearLogs}
                    className="rounded-md border border-neutral-800 px-4 py-2 text-sm text-neutral-300 transition hover:border-neutral-600 hover:text-white"
                    type="button"
                  >
                    Limpar logs
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-2">
                  <span className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">Console</span>
                  <button
                    onClick={clearLogs}
                    className="rounded border border-neutral-800 px-2.5 py-1 text-xs text-neutral-400 transition hover:border-neutral-600 hover:text-neutral-100"
                    type="button"
                  >
                    Limpar
                  </button>
                </div>
                <div className="min-h-0 flex-1 space-y-2 overflow-auto px-4 py-3 font-mono text-xs">
                  {logs.length > 0 ? logs.map((log) => (
                    <div
                      className={`rounded-md border px-3 py-2 ${log.level === "error"
                        ? "border-red-500/30 bg-red-500/10 text-red-100"
                        : log.level === "success"
                          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-100"
                          : "border-neutral-800 bg-neutral-900 text-neutral-300"
                        }`}
                      key={log.id}
                    >
                      <span className="mr-2 text-neutral-500">{log.createdAt}</span>
                      {log.message}
                    </div>
                  )) : (
                    <div className="flex h-full items-center justify-center rounded-md border border-dashed border-neutral-800 text-neutral-500">
                      Nenhum log ainda.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
      <ContextGL />
    </div>
  );
}
