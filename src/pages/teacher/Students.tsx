import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMemo, useState, useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

type Student = { id: string; name: string; email: string; roll: string };

const BRANCHES = ["CSE", "ECE", "ME", "CE"] as const;

export default function Students() {
  const [branch, setBranch] = useState<(typeof BRANCHES)[number]>("CSE");
  const [query, setQuery] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [newName, setNewName] = useState("");
  const [newRoll, setNewRoll] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("ems_token");
        const res = await fetch(`${API_BASE}/users`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          const studentUsers = (data.users || [])
            .filter((u: any) => u.role === "student")
            .map((u: any) => ({
              id: u.id,
              name: u.name,
              email: u.email,
              roll: "Not assigned yet",
            }));
          if (isMounted) setStudents(studentUsers);
        }
      } catch (err) {
        console.error("Failed to load real students:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchUsers();
    return () => {
      isMounted = false;
    };
  }, []);

  const list = useMemo(() => {
    if (!query.trim()) return students;
    const q = query.toLowerCase();
    return students.filter((s) => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || s.roll.toLowerCase().includes(q));
  }, [students, query]);

  const addStudent = () => {
    if (!newName.trim()) return;
    setStudents((prev) => [
      ...prev,
      {
        id: `local-${Date.now()}`,
        name: newName,
        email: "Not assigned yet",
        roll: newRoll.trim() || "Not assigned yet",
      },
    ]);
    setNewName("");
    setNewRoll("");
  };

  const removeStudent = (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Students</h1>
        <div className="flex gap-2">
          <select
            className="border rounded px-3 py-2 bg-background text-sm"
            value={branch}
            onChange={(e) => setBranch(e.target.value as (typeof BRANCHES)[number])}
          >
            {BRANCHES.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
          <Input placeholder="Search name or email" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{branch} - {list.length} Enrolled {list.length === 1 ? 'Student' : 'Students'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input placeholder="Student name" value={newName} onChange={(e) => setNewName(e.target.value)} />
            <Input placeholder="Roll (optional)" value={newRoll} onChange={(e) => setNewRoll(e.target.value)} />
            <Button onClick={addStudent}>Add</Button>
          </div>

          {list.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No students enrolled yet.
            </div>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {list.map((s) => (
                <li key={s.id} className="border rounded px-3 py-2 text-sm flex items-center justify-between">
                  <div className="truncate mr-2">
                    <span className="font-medium text-foreground block truncate">{s.name}</span>
                    <span className="text-xs text-muted-foreground block truncate font-mono">Roll: {s.roll}</span>
                  </div>
                  <button className="text-red-500 text-xs shrink-0 hover:underline" onClick={() => removeStudent(s.id)}>Remove</button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
