import React, { useRef, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, ShieldAlert, ScanFace } from "lucide-react";

export default function FaceRecognition() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();
  const [scanState, setScanState] = useState<"initializing" | "scanning" | "verifying" | "success" | "error">("initializing");
  const [statusMessage, setStatusMessage] = useState("Initializing facial scanner feed...");

  useEffect(() => {
    let stream: MediaStream | null = null;
    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setScanState("scanning");
        setStatusMessage("Face alignment guides active. Please hold still.");
      } catch (err) {
        console.error("Camera access error:", err);
        setScanState("error");
        setStatusMessage("Failed to interface with media capture device.");
      }
    }
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const triggerVerification = () => {
    setScanState("verifying");
    setStatusMessage("Extracting facial signatures & matching logs...");
    
    // Simulate biometric match verification
    setTimeout(() => {
      setScanState("success");
      setStatusMessage("Biometric signature matched. Verification logged.");
    }, 2200);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold font-heading text-primary">Biometric Face Scanner</h1>
        <p className="text-muted-foreground">Keep your face within alignment parameters</p>
      </div>

      <Card className="glass-card-premium max-w-md w-full p-6 space-y-5 rounded-2xl border border-border/50 overflow-hidden relative">
        <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-white/10 shadow-inner flex items-center justify-center">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover scale-x-[-1]"
          />
          
          {/* Biometric Guide Reticle (Target Face Ring) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <motion.div 
              animate={{ 
                scale: scanState === "verifying" ? [1, 0.98, 1] : 1,
                borderColor: scanState === "success" ? "rgba(16, 185, 129, 0.6)" :
                             scanState === "verifying" ? "rgba(139, 92, 246, 0.6)" : 
                             "rgba(255, 255, 255, 0.25)"
              }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-36 h-48 border-2 border-dashed rounded-[50%_50%_40%_40%] flex items-center justify-center"
            >
              <div className="absolute inset-0 rounded-[50%_50%_40%_40%] border border-primary/20 scale-[1.05] animate-pulse" />
            </motion.div>
          </div>

          {/* Futuristic scanner line */}
          {scanState === "scanning" && (
            <motion.div 
              animate={{ y: ["0%", "100%"] }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-teal-400 to-transparent z-10"
            />
          )}
          {scanState === "verifying" && (
            <motion.div 
              animate={{ y: ["0%", "100%", "0%"] }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
              className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent z-10 shadow-[0_0_10px_var(--primary)]"
            />
          )}

          {/* Biometric HUD corner highlights */}
          <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-primary/45 rounded-tl pointer-events-none" />
          <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-primary/45 rounded-tr pointer-events-none" />
          <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-primary/45 rounded-bl pointer-events-none" />
          <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-primary/45 rounded-br pointer-events-none" />

          {/* Biometric scanner top-HUD bar */}
          <div className="absolute top-4 left-4 right-4 flex justify-between px-2 text-[10px] font-mono text-white/50 tracking-wider pointer-events-none z-10">
            <span>ALIGNMENT: LOCKED</span>
            <span>FPS: 30</span>
          </div>

          {/* Status icon overlay state */}
          <AnimatePresence>
            {scanState === "success" && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 bg-emerald-500/10 backdrop-blur-sm z-20 flex items-center justify-center border border-emerald-500/30 rounded-xl"
              >
                <div className="p-4 bg-emerald-500 rounded-full text-white shadow-lg shadow-emerald-500/20">
                  <ShieldCheck className="w-10 h-10" />
                </div>
              </motion.div>
            )}
            {scanState === "error" && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 bg-destructive/10 backdrop-blur-sm z-20 flex items-center justify-center border border-destructive/30 rounded-xl"
              >
                <div className="p-4 bg-destructive rounded-full text-white shadow-lg shadow-destructive/20 animate-bounce">
                  <ShieldAlert className="w-10 h-10" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Scan Log readout */}
        <div className={`p-4 rounded-xl border text-center transition-colors ${
          scanState === "success" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" :
          scanState === "error" ? "bg-destructive/10 border-destructive/20 text-destructive" :
          "bg-muted/40 border-border/40 text-muted-foreground"
        }`}>
          <p className="text-xs font-mono font-medium leading-relaxed">{statusMessage}</p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate(-1)} className="w-1/3 h-11 rounded-xl">
            Back
          </Button>
          <Button 
            disabled={scanState !== "scanning"} 
            onClick={triggerVerification} 
            className="flex-1 btn-premium h-11"
          >
            {scanState === "verifying" ? "Matching..." : scanState === "success" ? "Verified" : "Capture Signature"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
