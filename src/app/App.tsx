import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AuthProvider } from "../context/AuthContext";
import { NotificationsProvider } from "../context/NotificationsContext";
import { LanguageProvider } from "../context/LanguageContext";

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <NotificationsProvider>
          <RouterProvider router={router} />
        </NotificationsProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
