import React, { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

// Haversine distance in meters
const computeDistanceMeters = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const QrScanner = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<string>("Checking proximity...");
  const [allowed, setAllowed] = useState<boolean>(false);

  const sessionId = searchParams.get("session") || "";
  const targetLat = searchParams.get("lat");
  const targetLng = searchParams.get("lng");
  const radius = Number(searchParams.get("radius") || 0);

  const hasGeoConstraint = useMemo(() => targetLat && targetLng && radius > 0, [targetLat, targetLng, radius]);

  useEffect(() => {
    if (!hasGeoConstraint) {
      setStatus("No location restriction on this QR. Proceed.");
      setAllowed(true);
      return;
    }

    if (!navigator.geolocation) {
      setStatus("Geolocation not supported on this device. Cannot verify proximity.");
      setAllowed(false);
      return;
    }

    const desiredLat = Number(targetLat);
    const desiredLng = Number(targetLng);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const distance = computeDistanceMeters(
          desiredLat,
          desiredLng,
          pos.coords.latitude,
          pos.coords.longitude
        );
        if (distance <= radius) {
          setStatus(`Within range (${Math.round(distance)}m ≤ ${radius}m). You may proceed.`);
          setAllowed(true);
        } else {
          setStatus(`Too far from scanner (~${Math.round(distance)}m). Move closer (≤ ${radius}m).`);
          setAllowed(false);
        }
      },
      () => {
        setStatus("Location permission denied. Cannot verify proximity.");
        setAllowed(false);
      },
      { enableHighAccuracy: true, timeout: 7000 }
    );
  }, [hasGeoConstraint, targetLat, targetLng, radius]);

  return (
    <div className="p-6 space-y-3">
      <h1 className="text-xl font-bold">QR Scanner</h1>
      <p className="text-sm text-muted-foreground">Session: {sessionId || "unknown"}</p>
      <div className="p-4 rounded border">
        <p className={allowed ? "text-green-600" : "text-red-600"}>{status}</p>
      </div>
      {/* Implement actual QR scanning here if needed */}
    </div>
  );
};

export default QrScanner;
