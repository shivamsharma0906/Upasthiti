import React from "react";

export default function ManualEntry() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Manual Entry</h1>
      <p className="mt-2">Here you can manually mark attendance.</p>

      {/* Example form */}
      <form className="mt-4 space-y-3">
        <input
          type="text"
          placeholder="Enter Student ID"
          className="border p-2 rounded w-full"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
