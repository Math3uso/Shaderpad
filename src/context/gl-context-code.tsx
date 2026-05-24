"use client";

import { createContext, ReactNode, useCallback, useContext, useState } from "react";

export type ShaderLog = {
    id: number;
    level: "info" | "success" | "error";
    message: string;
    createdAt: string;
};

type CompileRequest = {
    id: number;
    code: string;
};

type GlContext = {
    compileRequest: CompileRequest | null;
    logs: ShaderLog[];
    clearLogs: () => void;
    handleSetNewCode: (newCode: string) => void;
    pushLog: (level: ShaderLog["level"], message: string) => void;
}

export const GlContextCode = createContext({} as GlContext);

export const GlContextProvider = ({ children }: { children: ReactNode }) => {
    const [compileRequest, setCompileRequest] = useState<CompileRequest | null>(null);
    const [logs, setLogs] = useState<ShaderLog[]>([]);

    const pushLog = useCallback((level: ShaderLog["level"], message: string) => {
        setLogs((currentLogs) => [
            {
                id: Date.now() + Math.random(),
                level,
                message,
                createdAt: new Date().toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                }),
            },
            ...currentLogs,
        ].slice(0, 40));
    }, []);

    const clearLogs = useCallback(() => {
        setLogs([]);
    }, []);

    const handleSetNewCode = useCallback((newCode: string) => {
        setCompileRequest({
            id: Date.now(),
            code: newCode,
        });
        pushLog("info", "Compilando fragment shader...");
    }, [pushLog]);

    return (
        <GlContextCode.Provider value={{ compileRequest, logs, clearLogs, handleSetNewCode, pushLog }}>
            {children}
        </GlContextCode.Provider>
    );
}

export const useGLContext = () => useContext(GlContextCode);
