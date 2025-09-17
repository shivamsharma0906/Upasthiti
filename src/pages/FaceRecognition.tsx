import React from "react";

export default function FaceRecognition() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Face Recognition</h1>
      <p className="mt-2">This page will handle face recognition attendance.</p>

      {/* Placeholder for camera */}
      <div className="mt-4 border p-6 rounded bg-gray-100 text-center">
        📷 Camera feed will appear here
      </div>
    </div>
  );
}
