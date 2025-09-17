import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMemo, useState, useEffect } from "react";

type Student = { name: string; roll: number };

const makeStudents = (prefix: string): Student[] => {
  const names = [
    "Shivam","Rahul","Aarav","Vivaan","Aditya","Arjun","Ishaan","Kabir","Rohit","Kunal",
    "Ananya","Priya","Sneha","Riya","Aditi","Pooja","Neha","Kavya","Meera","Simran",
    "Manish","Kiran","Harsh","Varun","Nitin","Akash","Sagar","Vivek","Gaurav","Aman",
    "Sanjana","Nisha","Sonia","Pawan","Rakesh","Naveen","Deepak","Abhishek","Ravi","Sameer",
    "Santosh","Akhil","Shreya","Anjali","Palak","Ira","Tanya","Zoya","Rehan","Yash"
  ];
  return names.map((name, idx) => ({ name: `${name} (${prefix})`, roll: idx + 1 }));
};

const DEFAULT_BRANCHES: Record<string, Student[]> = {
  CSE: makeStudents("CSE"),
  ECE: makeStudents("ECE"),
  ME: makeStudents("ME"),
  CE: makeStudents("CE"),
};
const STORAGE_KEY = "teacherBranchStudents";

export default function Students() {
  const [branch, setBranch] = useState<keyof typeof DEFAULT_BRANCHES>("CSE");
  const [query, setQuery] = useState("");
  const [data, setData] = useState<Record<string, Student[]>>(DEFAULT_BRANCHES);
  const [newName, setNewName] = useState("");
  const [newRoll, setNewRoll] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setData(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {}
  }, [data]);

  const list = useMemo(() => {
    const base = data[branch];
    if (!query.trim()) return base;
    const q = query.toLowerCase();
    return base.filter((s) => s.name.toLowerCase().includes(q) || String(s.roll).includes(q));
  }, [branch, query]);

  const addStudent = () => {
    const rollNum = Number(newRoll);
    if (!newName.trim() || !rollNum) return;
    setData({
      ...data,
      [branch]: [...data[branch], { name: `${newName} (${branch})`, roll: rollNum }],
    });
    setNewName("");
    setNewRoll("");
  };

  const removeStudent = (roll: number) => {
    setData({
      ...data,
      [branch]: data[branch].filter((s) => s.roll !== roll),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Students</h1>
        <div className="flex gap-2">
          <select
            className="border rounded px-3 py-2 bg-background"
            value={branch}
            onChange={(e) => setBranch(e.target.value as keyof typeof DEFAULT_BRANCHES)}
          >
            {Object.keys(DEFAULT_BRANCHES).map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
          <Input placeholder="Search name or roll" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{branch} - 50 Students</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input placeholder="Student name" value={newName} onChange={(e) => setNewName(e.target.value)} />
            <Input placeholder="Roll" value={newRoll} onChange={(e) => setNewRoll(e.target.value)} />
            <Button onClick={addStudent}>Add</Button>
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {list.map((s) => (
              <li key={s.roll} className="border rounded px-3 py-2 text-sm flex items-center justify-between">
                <span>{s.name}, roll {s.roll}</span>
                <button className="text-red-500 text-xs" onClick={() => removeStudent(s.roll)}>Remove</button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}


