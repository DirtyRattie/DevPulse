import { Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { DashboardPage } from "@/pages/DashboardPage";
import { TrendsPage } from "@/pages/TrendsPage";
import { PostsPage } from "@/pages/PostsPage";
import { DraftsPage } from "@/pages/DraftsPage";
import { AuditPage } from "@/pages/AuditPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="trends" element={<TrendsPage />} />
        <Route path="posts" element={<PostsPage />} />
        <Route path="drafts" element={<DraftsPage />} />
        <Route path="audit" element={<AuditPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
