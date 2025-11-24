"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { TorusKnot } from "three/examples/jsm/curves/CurveExtras.js";

// Sidewall material function - creates animated material with WCS blue/red grid pattern
function createSideWallMaterial() {
  // WCS brand colors
  const wcsBlue = '#002C51';
  const wcsRed = '#D91E18';
  const brightBlue = '#004080'; // Brighter blue for glow
  const brightRed = '#FF4444'; // Brighter red for glow
  
  // Create a grid texture using canvas
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  
  // Fill with dark background
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, 512, 512);
  
  const gridSize = 32;
  
  // Draw grid lines with alternating blue and red
  // Vertical lines - alternate between blue and red
  for (let x = 0; x <= 512; x += gridSize) {
    const isBlue = (x / gridSize) % 2 === 0;
    ctx.strokeStyle = isBlue ? wcsBlue : wcsRed;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 512);
    ctx.stroke();
    
    // Add glow effect with brighter color
    ctx.shadowBlur = 8;
    ctx.shadowColor = isBlue ? brightBlue : brightRed;
    ctx.strokeStyle = isBlue ? brightBlue : brightRed;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 512);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }
  
  // Horizontal lines - alternate between blue and red
  for (let y = 0; y <= 512; y += gridSize) {
    const isBlue = (y / gridSize) % 2 === 0;
    ctx.strokeStyle = isBlue ? wcsBlue : wcsRed;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
    
    // Add glow effect with brighter color
    ctx.shadowBlur = 8;
    ctx.shadowColor = isBlue ? brightBlue : brightRed;
    ctx.strokeStyle = isBlue ? brightBlue : brightRed;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }
  
  // Create texture from canvas
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 10); // Stretch vertically to match the tunnel
  
  // Create material with grid texture and shiny emissive properties
  const mat = new THREE.MeshLambertMaterial({ 
    map: texture,
    emissive: 0x001122, // Dark blue emissive base
    emissiveIntensity: 0.5,
    emissiveMap: texture, // Use texture for emissive too
    // Add some shininess
    transparent: false,
    opacity: 1.0
  });
  
  // Store time and texture for animation
  (mat as any).userData.time = 0;
  (mat as any).userData.texture = texture;
  (mat as any).userData.wcsBlue = wcsBlue;
  (mat as any).userData.wcsRed = wcsRed;
  (mat as any).userData.brightBlue = brightBlue;
  (mat as any).userData.brightRed = brightRed;

  return mat;
}

/**
 * Animated Banner Ad Component with Three.js
 * Features a 3D animated background similar to the CodePen example
 * Camera follows a torus knot path with bloom effects
 */
const AnimatedBannerAd = () => {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    renderer?: THREE.WebGLRenderer;
    scene?: THREE.Scene;
    camera?: THREE.PerspectiveCamera;
    composer?: EffectComposer;
    mesh?: THREE.Mesh;
    animationId?: number;
  }>({});

  const handleClick = () => {
    router.push("/register");
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const { width, height } = container.getBoundingClientRect();

    // Initialize Three.js
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height, false);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.01, 5000);

    // Setup scene
    scene.fog = new THREE.FogExp2(0x000000, 0.05);
    scene.add(new THREE.HemisphereLight(0x00ffff, 0xffa500, 2));

    // Constants
    const mpms = 20 / 1e3;
    const steps = 2000;

    // Create shape
    const shape = new THREE.Shape();
    // cw
    shape.moveTo(-5, -1);
    shape.quadraticCurveTo(0, -4, 5, -1);
    shape.lineTo(6, -1);
    shape.quadraticCurveTo(0, -5, -6, -1);

    const extrudePath = new TorusKnot();
    const UVGenerator = (() => {
      let i = 0; // face id
      return {
        generateTopUV(...xs: any[]) {
          // for 2 "cap" faces
          return [
            new THREE.Vector2(),
            new THREE.Vector2(),
            new THREE.Vector2(),
          ];
        },
        generateSideWallUV(
          _geom: any,
          _vs: any,
          _a: any,
          _b: any,
          _c: any,
          _d: any
        ) {
          // all side faces
          const segments = 5; // (shape-related; NOT eq `curveSegments`)
          if (i < segments * steps) {
            // ignore bottom road faces
            ++i;
            return [
              new THREE.Vector2(),
              new THREE.Vector2(),
              new THREE.Vector2(),
              new THREE.Vector2(),
            ];
          }
          const n = i - segments * steps; // offseted face idx
          const total_col_segments = 7; // (shape-related)
          const col = (n / steps) | 0;
          const left = col / total_col_segments; // normalize
          const right = (col + 1) / total_col_segments; // normalize
          const row = n % steps;
          const bottom = row / steps; // normalize
          const top = (row + 1) / steps; // normalize
          ++i;
          return [
            new THREE.Vector2(left, bottom), // bottom left
            new THREE.Vector2(right, bottom), // bottom right
            new THREE.Vector2(right, top), // top right
            new THREE.Vector2(left, top), // top left
          ];
        },
      };
    })();

    const extrudeGeom = new THREE.ExtrudeGeometry(shape, {
      bevelEnabled: false,
      steps,
      extrudePath,
      curveSegments: 5,
      UVGenerator,
    });

    // Create materials
    const matSideWall = createSideWallMaterial();
    const matTop = new THREE.MeshLambertMaterial({ color: 0x000000 });
    const mesh = new THREE.Mesh(extrudeGeom, [matTop, matSideWall]);
    scene.add(mesh);

    // Setup composer
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(
      new UnrealBloomPass(new THREE.Vector2(width, height), 2, 0.5, 0.7)
    );

    // Animation setup
    const totalLen = extrudePath.getLength();
    const { binormals } = extrudePath.computeFrenetFrames(steps);
    const $m = new THREE.Matrix4(); // rotation matrix

    // Check if shader compiled successfully before starting animation
    let shaderValid = false;
    try {
      // Force shader compilation by rendering once
      renderer.compile(scene, camera);
      shaderValid = true;
    } catch (error) {
      console.error("Shader compilation failed:", error);
      shaderValid = false;
    }

    // Animation loop - only run if shader is valid
    let animationId: number;
    const animate = (t: number) => {
      if (!shaderValid) {
        // Stop animation if shader is invalid
        return;
      }

      try {
        const $u = ((mpms * t) % totalLen) / totalLen;
        // update cam position
        extrudePath.getPointAt($u, camera.position);
        // update cam rotation
        camera.setRotationFromMatrix(
          $m.lookAt(
            /* eye */ camera.position,
            /* target */ extrudePath.getPointAt(Math.min(1.0, $u + 0.01)),
            /* up */ binormals[($u * steps) | 0]
          )
        );
        const size = renderer.getDrawingBufferSize(new THREE.Vector2());
        composer.passes[1].resolution.copy(size);
        composer.render();
        // Update material time and animate grid texture with shiny effects
        const sideWallMat = mesh.material[1] as any;
        if (sideWallMat.userData) {
          sideWallMat.userData.time = t;
          
          // Animate emissive intensity for a pulsing/shiny effect
          if (sideWallMat.emissiveIntensity !== undefined) {
            // Create a pulsing glow effect
            const pulse = Math.sin(t * 0.001) * 0.3 + 0.5;
            sideWallMat.emissiveIntensity = 0.4 + pulse * 0.4; // Range: 0.4 to 1.2
          }
          
          // Animate grid texture offset for scrolling effect
          if (sideWallMat.userData.texture && sideWallMat.map) {
            // Scroll the grid texture along the tunnel
            sideWallMat.map.offset.y = (t * 0.0001) % 1;
            // Add slight horizontal offset for more dynamic feel
            sideWallMat.map.offset.x = Math.sin(t * 0.0005) * 0.1;
          }
          
          // Animate emissive color between blue and red for shiny effect
          if (sideWallMat.emissive) {
            const colorShift = Math.sin(t * 0.0008) * 0.5 + 0.5; // 0 to 1
            // Blend between blue and red emissive
            const blueColor = new THREE.Color(0x002C51);
            const redColor = new THREE.Color(0xD91E18);
            // Interpolate between colors
            sideWallMat.emissive.r = blueColor.r + (redColor.r - blueColor.r) * colorShift;
            sideWallMat.emissive.g = blueColor.g + (redColor.g - blueColor.g) * colorShift;
            sideWallMat.emissive.b = blueColor.b + (redColor.b - blueColor.b) * colorShift;
          }
        }
        animationId = requestAnimationFrame(animate);
      } catch (error) {
        console.error("Animation error:", error);
        // Stop animation on error
        shaderValid = false;
      }
    };
    
    if (shaderValid) {
      animationId = requestAnimationFrame(animate);
    } else {
      console.warn("AnimatedBannerAd: Shader compilation failed, animation disabled");
    }

    // Handle resize
    const handleResize = () => {
      const { width: newWidth, height: newHeight } =
        container.getBoundingClientRect();
      renderer.setSize(newWidth, newHeight, false);
      renderer.setPixelRatio(window.devicePixelRatio);
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      composer.setSize(newWidth, newHeight);
    };
    window.addEventListener("resize", handleResize);

    // Store refs for cleanup
    sceneRef.current = {
      renderer,
      scene,
      camera,
      composer,
      mesh,
      animationId,
    };

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      extrudeGeom.dispose();
      matTop.dispose();
      (matSideWall as any).dispose?.();
    };
  }, []);

  return (
    <div
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label="World Class Sports - Click to register"
      className="relative w-full overflow-hidden cursor-pointer group transition-transform duration-300 hover:scale-[1.01] focus:outline-none focus:ring-4 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent"
    >
      {/* Three.js Canvas Container */}
      <div
        ref={containerRef}
        className="relative w-full"
        style={{ aspectRatio: "1200/180" }}
      />

      {/* Text Content Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-3 sm:px-4 md:px-6 z-10 pointer-events-none">
        <div className="relative text-center pointer-events-auto">
          <h2 className="text-white font-bebas text-2xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl mb-0 sm:mb-0.5 md:mb-1 leading-tight drop-shadow-[0_0_20px_rgba(0,168,255,0.8)]">
            World Class Sports
          </h2>
          <p className="inline-block px-2 sm:px-4 md:px-6 lg:px-8 py-1 sm:py-1.5 md:py-2 lg:py-2.5 bg-[#D91E18] text-white font-bebas text-[10px] sm:text-xs md:text-sm lg:text-base xl:text-lg uppercase tracking-wide drop-shadow-lg rounded-full mt-0.5 sm:mt-1 md:mt-1.5">
            Register Now
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnimatedBannerAd;
