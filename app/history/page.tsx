"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Clock, Trash2, ArrowRight, LogOut } from "lucide-react";

interface User {
  id: number;
  name?: string;
  email: string;
}

interface HistoryItem {
  id: string;
  timestamp: string;
  cipherType: string;
  input: string;
  output: string;
  operation: "encrypt" | "decrypt" | "inverse" | "crack" |"brute-force";
  key?: string;
}

export default function HistoryPage() {
  const router = useRouter();

  // --- State ---
  const [user, setUser] = useState<User | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState("all");

  // --- Fetch history from API ---
  const fetchHistoryData = async () => {
    try {
      const res = await fetch("/api/history");
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data: HistoryItem[] = await res.json();
      setHistory(data);
    } catch (err) {
      console.error("Error fetching history:", err);
    }
  };

  // --- On mount: load user or redirect, then fetch history ---
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      router.push("/login");
      return;
    }

    const parsed = JSON.parse(stored);
    // Ensure parsed.id exists — default to 1 if not
    setUser({
      id: parsed.id ?? 1,
      name: parsed.name,
      email: parsed.email,
    });

    fetchHistoryData();
  }, [router]);

  // --- Logout ---
  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  // --- Delete single history item ---
  const handleDeleteItem = async (id: string) => {
    try {
      const res = await fetch(`/api/history?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        console.error("Failed to delete:", await res.text());
        return;
      }
      setHistory((h) => h.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Error deleting history item:", err);
    }
  };

  // --- Clear all history for this user ---
  const handleClearHistory = async () => {
    if (!user) return; // guard!
    if (!confirm("Are you sure you want to clear your entire history?")) return;

    try {
      const res = await fetch(
        `/api/history?all=true&user_id=${user.id}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        console.error("Failed to clear history:", await res.text());
        return;
      }
      setHistory([]);
    } catch (err) {
      console.error("Error clearing history:", err);
    }
  };

  // --- Filtered view based on tab ---
  const filteredHistory =
    activeTab === "all"
      ? history
      : history.filter((item) => item.cipherType.toLowerCase() === activeTab);

  // --- Timestamp formatting ---
  const formatTime = (ts: string) => new Date(ts).toLocaleString();

  // --- Loading state ---
  if (!user) {
    return (
      <div className="container mx-auto p-8 text-center">Loading…</div>
    );
  }
 

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-emerald-700">
            Encryption History
          </h1>
          <p className="mt-2 text-gray-600">
            View and manage your previous encryption and decryption operations
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="bg-blue-50 p-3 rounded-md">
            <p className="text-sm text-blue-700">
              Logged in as <span className="font-bold">{user.name || user.email}</span>
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="border-red-300 text-red-600 hover:bg-red-50"
          >
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="caesar">Caesar</TabsTrigger>
              <TabsTrigger value="affine">Affine</TabsTrigger>
              <TabsTrigger value="vigenère">Vigenère</TabsTrigger>
              <TabsTrigger value="playfair">Playfair</TabsTrigger>
              <TabsTrigger value="hill">Hill</TabsTrigger>
            </TabsList>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleClearHistory}
              disabled={history.length === 0}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Clear History
            </Button>
          </div>
          <TabsContent value={activeTab} className="mt-6">
            {filteredHistory.length > 0 ? (
              <div className="space-y-4">
                {filteredHistory.map((item: HistoryItem) => (
                  <Card key={item.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg flex items-center">
                            {item.cipherType} Cipher
                            <Badge
                              className={`ml-3 ${
                                item.operation === 'encrypt'
                                ? 'bg-emerald-500'
                                : item.operation === 'decrypt'
                                ? 'bg-blue-500'
                                : item.operation === 'inverse'
                                ? 'bg-purple-500'
                                : item.operation === 'crack'
                                ? 'bg-yellow-400'
                                : 'bg-yellow-600'   // brute-force
                            }`}
                            >
                              {item.operation === 'encrypt'
                                  ? 'Encrypted'
                                  : item.operation === 'decrypt'
                                  ? 'Decrypted'
                                  : item.operation === 'inverse'
                                  ? 'Inverse'
                                  : item.operation === 'crack'
                                  ? 'Cracked'
                                  : 'Brute‑Forced'      // brute-force
                                }
                            </Badge>
                          </CardTitle>
                          <CardDescription className="flex items-center mt-1">
                            <Clock className="h-3 w-3 mr-1" /> {formatTime(item.timestamp)}
                          </CardDescription>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-500">Input</p>
                          <p className="font-mono bg-gray-50 p-2 rounded-md break-all">
                            {item.input}
                          </p>
                        </div>
                        <div className="flex items-center justify-center">
                          <div className="flex flex-col items-center">
                            <ArrowRight className="h-5 w-5 text-gray-400" />
                            <p className="text-xs text-gray-500 mt-1">
                              Key: {item.key}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-500">Output</p>
                          <p className="font-mono bg-gray-50 p-2 rounded-md break-all">
                            {item.output}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center p-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">
                  No history found for this cipher type.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => router.push("/")}
                >
                  Go to Dashboard
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
