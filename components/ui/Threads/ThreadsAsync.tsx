"use client";

import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Color, Mesh, Program, Renderer, Triangle} from 'ogl';

interface ThreadsProps {
    color?: [number, number, number];
    amplitude?: number;
    distance?: number;
    enableMouseInteraction?: boolean;
}

const vertexShader = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragmentShader = `
precision highp float;

uniform float iTime;
uniform vec3 iResolution;
uniform vec3 uColor;
uniform float uAmplitude;
uniform float uDistance;
uniform vec2 uMouse;

#define PI 3.1415926538

const int u_line_count = 40;
const float u_line_width = 7.0;
const float u_line_blur = 10.0;

float Perlin2D(vec2 P) {
    vec2 Pi = floor(P);
    vec4 Pf_Pfmin1 = P.xyxy - vec4(Pi, Pi + 1.0);
    vec4 Pt = vec4(Pi.xy, Pi.xy + 1.0);
    Pt = Pt - floor(Pt * (1.0 / 71.0)) * 71.0;
    Pt += vec2(26.0, 161.0).xyxy;
    Pt *= Pt;
    Pt = Pt.xzxz * Pt.yyww;
    vec4 hash_x = fract(Pt * (1.0 / 951.135664));
    vec4 hash_y = fract(Pt * (1.0 / 642.949883));
    vec4 grad_x = hash_x - 0.49999;
    vec4 grad_y = hash_y - 0.49999;
    vec4 grad_results = inversesqrt(grad_x * grad_x + grad_y * grad_y)
        * (grad_x * Pf_Pfmin1.xzxz + grad_y * Pf_Pfmin1.yyww);
    grad_results *= 1.4142135623730950;
    vec2 blend = Pf_Pfmin1.xy * Pf_Pfmin1.xy * Pf_Pfmin1.xy
               * (Pf_Pfmin1.xy * (Pf_Pfmin1.xy * 6.0 - 15.0) + 10.0);
    vec4 blend2 = vec4(blend, vec2(1.0 - blend));
    return dot(grad_results, blend2.zxzx * blend2.wwyy);
}

float pixel(float count, vec2 resolution) {
    return (1.0 / max(resolution.x, resolution.y)) * count;
}

float lineFn(vec2 st, float width, float perc, float offset, vec2 mouse, float time, float amplitude, float distance) {
    float split_offset = (perc * 0.4);
    float split_point = 0.1 + split_offset;

    float amplitude_normal = smoothstep(split_point, 0.7, st.x);
    float amplitude_strength = 0.5;
    float finalAmplitude = amplitude_normal * amplitude_strength
                           * amplitude * (1.0 + (mouse.y - 0.5) * 0.2);

    float time_scaled = time / 10.0 + (mouse.x - 0.5) * 1.0;
    float blur = smoothstep(split_point, split_point + 0.05, st.x) * perc;

    float xnoise = mix(
        Perlin2D(vec2(time_scaled, st.x + perc) * 2.5),
        Perlin2D(vec2(time_scaled, st.x + time_scaled) * 3.5) / 1.5,
        st.x * 0.3
    );

    float y = 0.5 + (perc - 0.5) * distance + xnoise / 2.0 * finalAmplitude;

    float line_start = smoothstep(
        y + (width / 2.0) + (u_line_blur * pixel(1.0, iResolution.xy) * blur),
        y,
        st.y
    );

    float line_end = smoothstep(
        y,
        y - (width / 2.0) - (u_line_blur * pixel(1.0, iResolution.xy) * blur),
        st.y
    );

    return clamp(
        (line_start - line_end) * (1.0 - smoothstep(0.0, 1.0, pow(perc, 0.3))),
        0.0,
        1.0
    );
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy;

    float line_strength = 1.0;
    for (int i = 0; i < u_line_count; i++) {
        float p = float(i) / float(u_line_count);
        line_strength *= (1.0 - lineFn(
            uv,
            u_line_width * pixel(1.0, iResolution.xy) * (1.0 - p),
            p,
            (PI * 1.0) * p,
            uMouse,
            iTime,
            uAmplitude,
            uDistance
        ));
    }

    float colorVal = 1.0 - line_strength;
    fragColor = vec4(uColor * colorVal, colorVal);
}

void main() {
    mainImage(gl_FragColor, gl_FragCoord.xy);
}
`;

const ThreadsAsync: React.FC<ThreadsProps> = ({
                                                  color = [1, 1, 1],
                                                  amplitude = 1,
                                                  distance = 0,
                                                  enableMouseInteraction = false,
                                                  ...rest
                                              }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const animationFrameId = useRef<number>(null);
    const rendererRef = useRef<Renderer | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const lastFrameTime = useRef<number>(0);
    const targetFrameTime = 1000 / 60; // 60 FPS limit

    // 使用 Intersection Observer 检测组件是否在视口中
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsVisible(entry.isIntersecting);
            },
            {threshold: 0.1}
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => {
            if (containerRef.current) {
                observer.unobserve(containerRef.current);
            }
        };
    }, []);

    // 使用 requestIdleCallback 进行异步初始化
    const initializeWebGL = useCallback(() => {
        if (!containerRef.current || !isVisible) return;

        const initWithIdleCallback = () => {
            if ('requestIdleCallback' in window) {
                requestIdleCallback(() => {
                    initWebGL();
                }, {timeout: 2000});
            } else {
                // 降级处理：使用 setTimeout
                setTimeout(() => {
                    initWebGL();
                }, 100);
            }
        };

        const initWebGL = () => {
            try {
                const container = containerRef.current;
                if (!container) return;

                const renderer = new Renderer({
                    alpha: true,
                    antialias: false, // 关闭抗锯齿以提高性能
                    powerPreference: 'high-performance'
                });
                rendererRef.current = renderer;

                const gl = renderer.gl;
                gl.clearColor(0, 0, 0, 0);
                gl.enable(gl.BLEND);
                gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
                container.appendChild(gl.canvas);

                const geometry = new Triangle(gl);
                const program = new Program(gl, {
                    vertex: vertexShader,
                    fragment: fragmentShader,
                    uniforms: {
                        iTime: {value: 0},
                        iResolution: {
                            value: new Color(gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height),
                        },
                        uColor: {value: new Color(...color)},
                        uAmplitude: {value: amplitude},
                        uDistance: {value: distance},
                        uMouse: {value: new Float32Array([0.5, 0.5])},
                    },
                });

                const mesh = new Mesh(gl, {geometry, program});

                // 防抖的 resize 处理
                let resizeTimeout: NodeJS.Timeout;

                function resize() {
                    clearTimeout(resizeTimeout);
                    resizeTimeout = setTimeout(() => {
                        if (!container) return;
                        const {clientWidth, clientHeight} = container;
                        renderer.setSize(clientWidth, clientHeight);
                        program.uniforms.iResolution.value.r = clientWidth;
                        program.uniforms.iResolution.value.g = clientHeight;
                        program.uniforms.iResolution.value.b = clientWidth / clientHeight;
                    }, 100);
                }

                window.addEventListener('resize', resize);
                resize();

                let currentMouse = [0.5, 0.5];
                let targetMouse = [0.5, 0.5];

                // 节流的鼠标移动处理
                let mouseMoveTimeout: NodeJS.Timeout;

                function handleMouseMove(e: MouseEvent) {
                    clearTimeout(mouseMoveTimeout);
                    mouseMoveTimeout = setTimeout(() => {
                        if (!container) return;
                        const rect = container.getBoundingClientRect();
                        const x = (e.clientX - rect.left) / rect.width;
                        const y = 1.0 - (e.clientY - rect.top) / rect.height;
                        targetMouse = [x, y];
                    }, 16); // ~60fps
                }

                function handleMouseLeave() {
                    targetMouse = [0.5, 0.5];
                }

                if (enableMouseInteraction) {
                    container.addEventListener('mousemove', handleMouseMove);
                    container.addEventListener('mouseleave', handleMouseLeave);
                }

                // 优化的渲染循环
                function update(t: number) {
                    // 帧率限制
                    if (t - lastFrameTime.current < targetFrameTime) {
                        animationFrameId.current = requestAnimationFrame(update);
                        return;
                    }
                    lastFrameTime.current = t;

                    // 仅在可见时渲染
                    if (!isVisible) {
                        animationFrameId.current = requestAnimationFrame(update);
                        return;
                    }

                    if (enableMouseInteraction) {
                        const smoothing = 0.05;
                        currentMouse[0] += smoothing * (targetMouse[0] - currentMouse[0]);
                        currentMouse[1] += smoothing * (targetMouse[1] - currentMouse[1]);
                        program.uniforms.uMouse.value[0] = currentMouse[0];
                        program.uniforms.uMouse.value[1] = currentMouse[1];
                    } else {
                        program.uniforms.uMouse.value[0] = 0.5;
                        program.uniforms.uMouse.value[1] = 0.5;
                    }

                    program.uniforms.iTime.value = t * 0.001;
                    renderer.render({scene: mesh});
                    animationFrameId.current = requestAnimationFrame(update);
                }

                animationFrameId.current = requestAnimationFrame(update);
                setIsLoaded(true);

                // 清理函数
                return () => {
                    if (animationFrameId.current) {
                        cancelAnimationFrame(animationFrameId.current);
                    }
                    clearTimeout(resizeTimeout);
                    clearTimeout(mouseMoveTimeout);
                    window.removeEventListener('resize', resize);

                    if (enableMouseInteraction) {
                        container.removeEventListener('mousemove', handleMouseMove);
                        container.removeEventListener('mouseleave', handleMouseLeave);
                    }

                    if (container.contains(gl.canvas)) {
                        container.removeChild(gl.canvas);
                    }

                    // 清理 WebGL 上下文
                    const ext = gl.getExtension('WEBGL_lose_context');
                    if (ext) {
                        ext.loseContext();
                    }
                };
            } catch (error) {
                console.warn('WebGL initialization failed:', error);
                setIsLoaded(false);
            }
        };

        initWithIdleCallback();
    }, [color, amplitude, distance, enableMouseInteraction, isVisible]);

    // 当组件可见时才初始化
    useEffect(() => {
        if (isVisible && !isLoaded) {
            initializeWebGL();
        }
    }, [isVisible, isLoaded, initializeWebGL]);

    // 当组件不可见时暂停渲染
    useEffect(() => {
        if (!isVisible && animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
            animationFrameId.current = null;
        }
    }, [isVisible]);

    return (
        <div ref={containerRef} className="w-full h-full relative" {...rest}>
            {!isLoaded && (
                <div className="w-full h-full flex items-center justify-center opacity-20">
                    <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"/>
                </div>
            )}
        </div>
    );
};

export default ThreadsAsync;