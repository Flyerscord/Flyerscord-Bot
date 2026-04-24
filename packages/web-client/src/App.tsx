import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useState } from "react";
import { trpc } from "./trpc";
import NavBar from "./components/NavBar";
import LeaderboardPage from "./pages/LeaderboardPage";
import LoginPage from "./pages/LoginPage";
import AuditLogPage from "./pages/admin/AuditLogPage";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [httpBatchLink({ url: "/trpc" })],
    }),
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <div className="min-h-screen bg-base-100">
            <NavBar />
            <main className="container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<LeaderboardPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route
                  path="/admin/audit-log"
                  element={
                    <ProtectedRoute adminOnly>
                      <AuditLogPage />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
