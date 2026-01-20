'use client'

import { useEffect, useRef, useState, useMemo } from 'react'

/**
 * Premium Aurora Background (Fixed & Refined)
 * 
 * Architecture:
 * - Full-viewport WebGL Quad rendering.
 * - Procedural Volumetric Shader:
 *   - Depth-enhanced sky.
 *   - Micro-noise star haze.
 *   - Vertical ribbons with razor-sharp striations and soft volumetric glow.
 *   - WebGL 1.0 compatible indexing.
 */

const VERTEX_SHADER = `
    attribute vec2 a_position;
    varying vec2 v_uv;
    void main() {
        v_uv = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
    }
`

const FRAGMENT_SHADER = `
    precision highp float;
    
    varying vec2 v_uv;
    uniform float u_time;
    uniform vec2 u_resolution;
    
    uniform float u_intensity;       
    uniform float u_speed;           
    uniform float u_bloom;           
    uniform float u_opacity;         
    
    uniform vec3 u_colors[5];
    uniform int u_color_count;

    #define PI 3.14159265359

    vec2 hash2(vec2 p) {
        return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);
    }

    // High-fidelity smooth noise
    float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(dot(hash2(i + vec2(0.0,0.0)), f - vec2(0.0,0.0)),
                       dot(hash2(i + vec2(1.0,0.0)), f - vec2(1.0,0.0)), u.x),
                   mix(dot(hash2(i + vec2(0.0,1.0)), f - vec2(0.0,1.0)),
                       dot(hash2(i + vec2(1.0,1.0)), f - vec2(1.0,1.0)), u.x), u.y);
    }

    float fbm(vec2 p) {
        float h = 0.0;
        float amp = 0.5;
        for (int i = 0; i < 4; i++) {
            h += noise(p) * amp;
            p *= 2.02;
            amp *= 0.5;
        }
        return h * 0.5 + 0.5;
    }

    // Domain warping to create "silk folds"
    float silkCurtain(vec2 p, float time, float offset, float dir) {
        // Broad S-curve warping - More movement at the bottom
        float warpScale = 1.0 + (1.0 - v_uv.y) * 1.2;
        float warp = fbm(p * 0.25 + time * 0.2 + offset);
        p.x += (warp - 0.5) * 1.4 * warpScale * dir;
        
        // ribbon base - Broadened for "Wider" feel
        float d = abs(p.x - 1.0); 
        float ribbon = exp(-d * 1.8);
        
        // Vertical Striations (Hair-like textures, extremely subtle)
        float rays = sin(p.x * 10.0 + warp * 8.0 + time * 0.4);
        rays = smoothstep(0.3, 0.95, 0.5 + 0.5 * rays);
        
        // Height Profile (The rising curtain)
        float h = smoothstep(0.0, 0.2, v_uv.y) * (1.0 - smoothstep(0.7, 1.0, v_uv.y));
        
        return ribbon * (0.5 + rays * 0.5) * h;
    }

    void main() {
        vec2 uv = v_uv;
        float aspect = u_resolution.x / u_resolution.y;
        vec2 p = uv;
        p.x *= aspect;
        
        // Shared Origin Perspective Tilt
        float centerX = aspect * 0.5;
        p.x = (p.x - centerX) * (1.0 + uv.y * 1.8) + centerX;

        float time = u_time * u_speed * 0.2;

        // 1. Base Night Sky (Darkened further)
        vec3 col = vec3(0.0006, 0.001, 0.002);
        col = mix(col * 0.3, col, uv.y);

        // 2. Dual Warped Silk Ribbons (Primary & Mirrored)
        vec3 auroraAccum = vec3(0.0);
        
        for (int i = 0; i < 2; i++) {
            float dir = (i == 0) ? 1.0 : -1.0;
            
            // Loop for multiple ribbons within each set
            for (int j = 0; j < 2; j++) {
                float idx = float(j);
                float offset = idx * 7.0 + (i == 1 ? 13.0 : 0.0);
                
                // Adjust coordinate for mirroring opposite direction
                vec2 pCurtain = p;
                if (i == 1) pCurtain.x = centerX - (pCurtain.x - centerX);
                
                float intens = silkCurtain(pCurtain, time, offset, dir);
                
                // Color Mapping
                vec3 c1 = u_colors[0]; // Teal/Green
                vec3 c2 = u_colors[1]; // Purple/Magenta
                
                vec3 mixed = mix(c2, c1, uv.y + intens * 0.3);
                auroraAccum += mixed * intens * 0.6;
            }
        }

        // 3. Post-Process & Atmosphere (Gradual Top-to-Bottom Fade for Readability)
        // High intensity at top (uv.y=1), fading out toward bottom (uv.y=0)
        float verticalFade = smoothstep(0.0, 0.8, uv.y); 
        auroraAccum *= verticalFade;
        
        // Final intensity calibration - Subtler for readability
        auroraAccum *= u_intensity * 0.6; 
        
        // Gaussian-style bloom
        float glow = length(auroraAccum) * u_bloom * 0.5;
        col += auroraAccum;
        col += auroraAccum * glow;

        // Scrim for UI legibility (Clean edge at very bottom/top)
        float mask = smoothstep(0.0, 0.02, uv.y) * (1.0 - smoothstep(0.95, 1.0, uv.y));
        col *= mask;
        
        gl_FragColor = vec4(clamp(col, 0.0, 1.0), u_opacity);
    }
`

interface AuroraBackgroundProps {
    intensity?: number
    speed?: number
    bloomStrength?: number
    grainAmount?: number
    curtains?: number
    colors?: string[]
    opacity?: number
    disabled?: boolean
}

function hexToRgb(hex: string): [number, number, number] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? [
        parseInt(result[1], 16) / 255,
        parseInt(result[2], 16) / 255,
        parseInt(result[3], 16) / 255
    ] : [0.1, 0.9, 0.7]
}

export function DynamicBackground({
    intensity = 0.7,
    speed = 0.5,
    bloomStrength = 0.3,
    grainAmount = 0.2,
    curtains = 4,
    colors = ['#0cebb9', '#9d4edd', '#4cc9f0', '#0cebb9', '#9d4edd'],
    opacity = 1.0,
    disabled = false
}: AuroraBackgroundProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const glRef = useRef<WebGLRenderingContext | null>(null)
    const programRef = useRef<WebGLProgram | null>(null)
    const animationRef = useRef<number>(0)
    const startTimeRef = useRef<number>(Date.now())
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
    const [webglSupported, setWebglSupported] = useState(true)

    const rgbColors = useMemo(() => {
        const result = colors.slice(0, 5).flatMap(c => hexToRgb(c))
        // Pad to 5 colors (15 floats) if necessary
        while (result.length < 15) {
            result.push(0, 0, 0)
        }
        return result
    }, [colors])

    useEffect(() => {
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
        setPrefersReducedMotion(mq.matches)
        const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
        mq.addEventListener('change', handler)
        return () => mq.removeEventListener('change', handler)
    }, [])

    useEffect(() => {
        if (disabled) return
        const canvas = canvasRef.current
        if (!canvas) return

        const gl = canvas.getContext('webgl', { antialias: false, alpha: true })
        if (!gl) { setWebglSupported(false); return }
        glRef.current = gl

        const createShader = (type: number, source: string) => {
            const shader = gl.createShader(type)!
            gl.shaderSource(shader, source)
            gl.compileShader(shader)
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error(gl.getShaderInfoLog(shader))
                return null
            }
            return shader
        }

        const vs = createShader(gl.VERTEX_SHADER, VERTEX_SHADER)
        const fs = createShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER)
        if (!vs || !fs) { setWebglSupported(false); return }

        const program = gl.createProgram()!
        gl.attachShader(program, vs)
        gl.attachShader(program, fs)
        gl.linkProgram(program)
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { setWebglSupported(false); return }
        programRef.current = program

        const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1])
        const buffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)
        const posLoc = gl.getAttribLocation(program, 'a_position')
        gl.enableVertexAttribArray(posLoc)
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)

        return () => {
            gl.deleteProgram(program)
            gl.deleteShader(vs)
            gl.deleteShader(fs)
        }
    }, [disabled])

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas || disabled) return
        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio, 2.0)
            canvas.width = window.innerWidth * dpr
            canvas.height = window.innerHeight * dpr
            if (glRef.current) glRef.current.viewport(0, 0, canvas.width, canvas.height)
        }
        resize()
        window.addEventListener('resize', resize)
        return () => window.removeEventListener('resize', resize)
    }, [disabled])

    useEffect(() => {
        const gl = glRef.current
        const program = programRef.current
        const canvas = canvasRef.current
        if (!gl || !program || !canvas || !webglSupported || disabled) return

        const render = () => {
            const time = (Date.now() - startTimeRef.current) / 1000
            const actualSpeed = prefersReducedMotion ? 0.01 : speed

            gl.useProgram(program)

            // Basic Uniforms
            gl.uniform1f(gl.getUniformLocation(program, 'u_time'), time)
            gl.uniform2f(gl.getUniformLocation(program, 'u_resolution'), canvas.width, canvas.height)

            // Props
            gl.uniform1f(gl.getUniformLocation(program, 'u_intensity'), intensity)
            gl.uniform1f(gl.getUniformLocation(program, 'u_speed'), actualSpeed)
            gl.uniform1f(gl.getUniformLocation(program, 'u_bloom'), bloomStrength)
            gl.uniform1f(gl.getUniformLocation(program, 'u_grain'), grainAmount)
            gl.uniform1f(gl.getUniformLocation(program, 'u_curtains'), curtains)
            gl.uniform1f(gl.getUniformLocation(program, 'u_opacity'), opacity)

            // Colors
            gl.uniform3fv(gl.getUniformLocation(program, 'u_colors'), new Float32Array(rgbColors))
            gl.uniform1i(gl.getUniformLocation(program, 'u_color_count'), colors.length)

            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
            animationRef.current = requestAnimationFrame(render)
        }
        render()
        return () => cancelAnimationFrame(animationRef.current)
    }, [prefersReducedMotion, webglSupported, intensity, speed, bloomStrength, grainAmount, curtains, rgbColors, colors.length, opacity, disabled])

    if (disabled) return null

    if (!webglSupported) {
        return (
            <div className="fixed inset-0 -z-10 bg-[#010305]" style={{ opacity }}>
                <div className="absolute inset-0 opacity-20" style={{
                    background: `radial-gradient(circle at 50% 100%, ${colors[0]}, transparent 70%)`,
                    filter: 'blur(100px)'
                }} />
            </div>
        )
    }

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 -z-10 w-full h-full pointer-events-none"
            style={{
                imageRendering: 'auto',
                background: '#010305'
            }}
        />
    )
}
