import { useEffect, useState } from "react";

interface RiveAnimationProps {
  src: string;
  className?: string;
  withSound?: boolean;
  stateMachines?: string | string[];
  animations?: string | string[];
  fit?: "contain" | "cover" | "fill" | "fitWidth" | "fitHeight" | "none" | "scaleDown";
  alignment?: "center" | "topLeft" | "topCenter" | "topRight" | "centerLeft" | "centerRight" | "bottomLeft" | "bottomCenter" | "bottomRight";
}

export function RiveAnimation({
  src,
  className,
  withSound = false,
  stateMachines,
  animations,
  fit = "contain",
  alignment = "center",
}: RiveAnimationProps) {
  const [RiveComponent, setRiveComponent] = useState<React.ComponentType<any> | null>(null);
  const [riveInstance, setRiveInstance] = useState<any>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const pkg = await import("@rive-app/react-canvas");
        const { useRive: _, Layout, Fit, Alignment, ...rest } = pkg as any;

        const fitMap: Record<string, any> = {
          contain:    Fit.Contain,
          cover:      Fit.Cover,
          fill:       Fit.Fill,
          fitWidth:   Fit.FitWidth,
          fitHeight:  Fit.FitHeight,
          none:       Fit.None,
          scaleDown:  Fit.ScaleDown,
        };

        const alignMap: Record<string, any> = {
          center:        Alignment.Center,
          topLeft:       Alignment.TopLeft,
          topCenter:     Alignment.TopCenter,
          topRight:      Alignment.TopRight,
          centerLeft:    Alignment.CenterLeft,
          centerRight:   Alignment.CenterRight,
          bottomLeft:    Alignment.BottomLeft,
          bottomCenter:  Alignment.BottomCenter,
          bottomRight:   Alignment.BottomRight,
        };

        // Inline wrapper so we can use useRive inside a component
        function Inner() {
          const { RiveComponent: RC, rive } = (pkg as any).useRive({
            src,
            autoplay: true,
            ...(stateMachines ? { stateMachines } : {}),
            ...(animations    ? { animations }    : {}),
            shouldResizeCanvasToContainer: true,
            layout: new Layout({
              fit:       fitMap[fit]       ?? Fit.Contain,
              alignment: alignMap[alignment] ?? Alignment.Center,
            }),
            onLoadError: () => setError(true),
          });

          useEffect(() => {
            if (rive) setRiveInstance(rive);
          }, [rive]);

          return (
            <RC
              style={{
                width: "100%",
                height: "100%",
                background: "transparent",
              }}
            />
          );
        }

        if (!cancelled) setRiveComponent(() => Inner);
      } catch (e) {
        console.error("[RiveAnimation] failed to load:", e);
        if (!cancelled) setError(true);
      }
    }

    load();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  // Audio unlock
  useEffect(() => {
    if (!riveInstance || !withSound) return;
    const unlock = () => {
      try { (riveInstance as any)?.audioContext?.resume(); } catch (_) {}
    };
    document.addEventListener("click", unlock, { once: true });
    return () => document.removeEventListener("click", unlock);
  }, [riveInstance, withSound]);

  if (error) return null; // or swap for a fallback image

  return (
    <div
      className={className}
      style={{ background: "transparent", width: "100%", height: "100%" }}
    >
      {RiveComponent ? <RiveComponent /> : null}
    </div>
  );
}