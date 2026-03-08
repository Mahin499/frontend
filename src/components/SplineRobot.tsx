"use client";

import { useEffect, useRef, useState } from "react";
import Spline from "@splinetool/react-spline";

export type RobotState = "idle" | "attendance" | "happy" | "alert" | "warning";

interface SplineRobotProps {
    robotState?: ReturnType<typeof useState<RobotState>>[0];
    className?: string;
}

export default function SplineRobot({ robotState = "idle", className = "" }: SplineRobotProps) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const spline = useRef<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function onLoad(splineApp: any) {
        spline.current = splineApp;
        setIsLoading(false);
    }

    useEffect(() => {
        if (!spline.current) return;

        // Map robot states to potential Spline events or object names
        // Note: The exact event names depend on how the Spline scene was configured.
        // We trigger custom events or 'keyDown'/'mouseDown' if they were set up that way.
        // Here we emit a custom event named after the state. 
        // If the Spline file has a custom event named "alert", this will trigger it.
        try {
            switch (robotState) {
                case "attendance":
                    // Example: Emit a custom event 'nod' or 'attendance'
                    spline.current.emitEvent("keyDown", "attendance");
                    spline.current.emitEvent("mouseHover", "attendance"); // Fallback attempt
                    break;
                case "happy":
                    spline.current.emitEvent("keyDown", "happy");
                    spline.current.emitEvent("mouseHover", "happy");
                    break;
                case "alert":
                    spline.current.emitEvent("keyDown", "alert");
                    spline.current.emitEvent("mouseHover", "alert");
                    break;
                case "warning":
                    spline.current.emitEvent("keyDown", "warning");
                    spline.current.emitEvent("mouseHover", "warning");
                    break;
                case "idle":
                default:
                    spline.current.emitEvent("keyDown", "idle");
                    break;
            }
        } catch (error) {
            console.warn("Spline event error:", error);
        }
    }, [robotState]);

    return (
        <div className={`relative ${className}`}>
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800/50 rounded-full animate-pulse z-10 w-[200px] h-[200px]">
                    <span className="text-xs font-medium text-slate-500">Loading Assistant...</span>
                </div>
            )}
            <div className={`transition-opacity duration-700 ease-in-out ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                <Spline
                    scene="https://prod.spline.design/W4IQe3pdB1tYMZKI/scene.splinecode"
                    onLoad={onLoad}
                    style={{
                        width: "100%",
                        height: "100%",
                        pointerEvents: "auto",
                    }}
                />
            </div>
        </div>
    );
}
