import { createBrowserRouter } from "react-router";
import { Root } from "./components/Root";
import { Dashboard } from "./components/Dashboard";
import { Applications } from "./components/Applications";
import { CreateApplication } from "./components/CreateApplication";
import { Profile } from "./components/Profile";
import { CVDocuments } from "./components/CVDocuments";
import { CoverLetterTemplates } from "./components/CoverLetterTemplates";
import { TextBlocks } from "./components/TextBlocks";
import { Exports } from "./components/Exports";
import { Settings } from "./components/Settings";
import { ProtectedRoute } from "../components/auth/ProtectedRoute";
import { Login } from "../pages/auth/Login";
import { Register } from "../pages/auth/Register";

function ProtectedAppLayout() {
  return (
    <ProtectedRoute>
      <Root />
    </ProtectedRoute>
  );
}

export const router = createBrowserRouter([
  { path: "/login", Component: Login },
  { path: "/register", Component: Register },
  {
    path: "/",
    Component: ProtectedAppLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: "applications", Component: Applications },
      { path: "applications/new", Component: CreateApplication },
      { path: "applications/:id/edit", Component: CreateApplication },
      { path: "profile", Component: Profile },
      { path: "cv-documents", Component: CVDocuments },
      { path: "cover-letters", Component: CoverLetterTemplates },
      { path: "text-blocks", Component: TextBlocks },
      { path: "exports", Component: Exports },
      { path: "settings", Component: Settings },
    ],
  },
]);
