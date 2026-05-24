import { useGLContext } from "@/context/gl-context-code";
import { fragShaderDefault, vertShaderDefault } from "@/utils/shaders";
import { useCallback, useEffect, useRef } from "react";

export function ContextGL() {

    const { compileRequest, pushLog } = useGLContext();

    const glRef = useRef<WebGL2RenderingContext | null>(null);
    const programRef = useRef<WebGLProgram | null>(null);
    const fragShaderRef = useRef<WebGLShader | null>(null);
    const vertShaderRef = useRef<WebGLShader | null>(null);
    const vaoRef = useRef<WebGLVertexArrayObject | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const startTimeRef = useRef<number | null>(null);
    const currentTimeRef = useRef(0);

    const iResolution = useRef(new Float32Array([0, 0, 1]));

    const updateCanvasSize = useCallback((canvas: HTMLCanvasElement, gl: WebGL2RenderingContext) => {
        const pixelRatio = window.devicePixelRatio || 1;
        const width = Math.max(1, Math.floor(canvas.clientWidth * pixelRatio));
        const height = Math.max(1, Math.floor(canvas.clientHeight * pixelRatio));

        if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
        }

        iResolution.current[0] = width;
        iResolution.current[1] = height;
        iResolution.current[2] = 1;

        gl.viewport(0, 0, width, height);
    }, []);

    const setShaderUniforms = useCallback((gl: WebGL2RenderingContext, program: WebGLProgram, time: number) => {
        gl.uniform3fv(gl.getUniformLocation(program, "iResolution"), iResolution.current);
        gl.uniform1f(gl.getUniformLocation(program, "iTime"), time);
    }, []);

    const recompileShader = useCallback(() => {
        const code = compileRequest?.code;
        const gl = glRef.current;
        const oldProgram = programRef.current;
        const vertShader = vertShaderRef.current;

        if (!code || !gl || !oldProgram || !vertShader) return;

        const newFragShader = gl.createShader(gl.FRAGMENT_SHADER);

        if (!newFragShader) {
            pushLog("error", "Nao foi possivel criar o fragment shader.");
            return;
        }

        gl.shaderSource(newFragShader, code);

        gl.compileShader(newFragShader);

        if (!gl.getShaderParameter(newFragShader, gl.COMPILE_STATUS)) {
            const shaderError = gl.getShaderInfoLog(newFragShader) || "Erro desconhecido no fragment shader.";
            console.error("Fragment shader error:", shaderError);
            pushLog("error", shaderError);
            gl.deleteShader(newFragShader);
            return;
        }

        const newProgram = gl.createProgram();

        if (!newProgram) {
            pushLog("error", "Nao foi possivel criar o programa WebGL.");
            return;
        }

        gl.attachShader(newProgram, vertShader);
        gl.attachShader(newProgram, newFragShader);
        gl.linkProgram(newProgram);

        if (!gl.getProgramParameter(newProgram, gl.LINK_STATUS)) {
            const linkError = gl.getProgramInfoLog(newProgram) || "Erro desconhecido ao linkar o programa.";
            console.error("Program link error:", linkError);
            pushLog("error", linkError);
            gl.deleteProgram(newProgram);
            gl.deleteShader(newFragShader);
            return;
        }

        gl.deleteProgram(oldProgram);

        if (fragShaderRef.current) {
            gl.deleteShader(fragShaderRef.current);
        }

        programRef.current = newProgram;
        fragShaderRef.current = newFragShader;

        gl.useProgram(newProgram);
        gl.bindVertexArray(vaoRef.current);
        setShaderUniforms(gl, newProgram, currentTimeRef.current);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        pushLog("success", "Shader compilado e aplicado com sucesso.");
    }, [compileRequest?.code, pushLog, setShaderUniforms]);

    useEffect(() => {
        if (compileRequest?.code.trim()) {
            recompileShader();
        }
    }, [compileRequest?.id, compileRequest?.code, recompileShader]);

    useEffect(() => {
        console.log("Initializing WebGL context...");

        const canvas = document.getElementById("gl-canvas") as HTMLCanvasElement | null;
        if (!canvas) {
            console.error("Canvas element not found");
            pushLog("error", "Canvas WebGL nao encontrado.");
            return;
        }

        const gl = canvas.getContext("webgl2");

        if (!gl) {
            console.error("WebGL2 context not available");
            pushLog("error", "WebGL2 nao esta disponivel neste navegador.");
            return;
        }

        glRef.current = gl;

        gl.clearColor(0.1, 0.1, 0.1, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        updateCanvasSize(canvas, gl);

        const vertShader = gl.createShader(gl.VERTEX_SHADER);
        const fragShader = gl.createShader(gl.FRAGMENT_SHADER);

        vertShaderRef.current = vertShader;
        fragShaderRef.current = fragShader;

        if (!vertShader || !fragShader) {
            console.error("Failed to create shaders");
            pushLog("error", "Nao foi possivel criar os shaders iniciais.");
            return;
        }

        gl.shaderSource(vertShader, vertShaderDefault);
        gl.shaderSource(fragShader, fragShaderDefault);

        gl.compileShader(vertShader);
        gl.compileShader(fragShader);

        if (!gl.getShaderParameter(vertShader, gl.COMPILE_STATUS)) {
            const shaderError = gl.getShaderInfoLog(vertShader) || "Erro desconhecido no vertex shader.";
            console.error("Vertex shader compilation error:", shaderError);
            pushLog("error", shaderError);
            return;
        }
        if (!gl.getShaderParameter(fragShader, gl.COMPILE_STATUS)) {
            const shaderError = gl.getShaderInfoLog(fragShader) || "Erro desconhecido no fragment shader padrao.";
            console.error("Fragment shader compilation error:", shaderError);
            pushLog("error", shaderError);
            return;
        }

        const program = gl.createProgram();

        if (!program) {
            console.error("Failed to create shader program");
            pushLog("error", "Nao foi possivel criar o programa WebGL inicial.");
            return;
        }

        programRef.current = program;

        gl.attachShader(program, vertShader);
        gl.attachShader(program, fragShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            const linkError = gl.getProgramInfoLog(program) || "Erro desconhecido ao linkar o programa inicial.";
            console.error("Shader program linking error:", linkError);
            pushLog("error", linkError);
            return;
        }

        const vao = gl.createVertexArray();
        vaoRef.current = vao;
        const vbo = gl.createBuffer();
        const vertices = new Float32Array([
            // Primeiro Triângulo
            -1.0, -1.0, 0.0, 1.0, 0.0, 0.0, // Inferior Esquerdo (Vermelho)
            1.0, -1.0, 0.0, 0.0, 1.0, 0.0, // Inferior Direito (Verde)
            -1.0, 1.0, 0.0, 0.0, 0.0, 1.0, // Superior Esquerdo (Azul)

            // Segundo Triângulo
            1.0, -1.0, 0.0, 0.0, 1.0, 0.0, // Inferior Direito (Verde)
            1.0, 1.0, 0.0, 1.0, 1.0, 0.0, // Superior Direito (Amarelo)
            -1.0, 1.0, 0.0, 0.0, 0.0, 1.0  // Superior Esquerdo (Azul)
        ]);

        gl.bindVertexArray(vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        const stride = 6 * Float32Array.BYTES_PER_ELEMENT;

        //aPos
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, stride, 0);

        //aColor
        gl.vertexAttribPointer(1, 3, gl.FLOAT, false, stride, 3 * Float32Array.BYTES_PER_ELEMENT);

        gl.enableVertexAttribArray(0);
        gl.enableVertexAttribArray(1);

        gl.useProgram(program);
        gl.bindVertexArray(vao);

        const render = (timestamp: number) => {
            if (startTimeRef.current === null) {
                startTimeRef.current = timestamp;
            }

            const currentProgram = programRef.current;
            if (!currentProgram) return;

            updateCanvasSize(canvas, gl);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.useProgram(currentProgram);
            gl.bindVertexArray(vaoRef.current);
            currentTimeRef.current = (timestamp - startTimeRef.current) / 1000;
            setShaderUniforms(gl, currentProgram, currentTimeRef.current);
            gl.drawArrays(gl.TRIANGLES, 0, 6);

            animationFrameRef.current = requestAnimationFrame(render);
        };

        animationFrameRef.current = requestAnimationFrame(render);


        console.log("WebGL context initialized successfully");
        pushLog("success", "Renderer WebGL iniciado com uniforms iResolution e iTime.");

        return () => {
            if (animationFrameRef.current !== null) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };

    }, [pushLog, setShaderUniforms, updateCanvasSize]);

    return (
        <section className="flex h-full w-1/2 min-w-0 items-center justify-center text-neutral-950">
            <canvas id="gl-canvas" className="w-full h-full" width={800} height={600} />
        </section>
    );
}
