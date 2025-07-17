import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useEffect } from "react";
import Auth from "./pages/auth/auth";
import PrivateRoute from "./private/PrivateRoute";
import { RootLayout } from "./layouts/root-layout";
import { authService } from "./services/auth.service";
import Home from "./pages/home/home";
import Users from "./pages/users/users";
import Groups from "./pages/groups/groups";
import Emergency from "./pages/emergency/emergency"; // Import Emergency component
import AdminsPage from "./pages/admins/admins";
import { useAuthStore } from "./stores/auth/auth.store";
import { AdminRole } from "./interfaces/auth.interface";

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: "/",
        element: (
          <PrivateRoute roles={[AdminRole.ADMIN, AdminRole.SUPER_ADMIN]}>
            <Home />
          </PrivateRoute>
        ),
      },
      {
        path: "/users",
        element: (
          <PrivateRoute roles={[AdminRole.ADMIN, AdminRole.SUPER_ADMIN]}>
            <Users />
          </PrivateRoute>
        ),
      },
      {
        path: "/groups",
        element: (
          <PrivateRoute roles={[AdminRole.ADMIN, AdminRole.SUPER_ADMIN]}>
            <Groups />
          </PrivateRoute>
        ),
      },
      {
        path: "/emergency", // Add new route for Emergency
        element: (
          <PrivateRoute roles={[AdminRole.ADMIN, AdminRole.SUPER_ADMIN]}>
            <Emergency />
          </PrivateRoute>
        ),
      },
      {
        path: "/admins",
        element: (
          <PrivateRoute roles={[AdminRole.SUPER_ADMIN]}>
            <AdminsPage />
          </PrivateRoute>
        ),
      },
    ],
  },
  {
    path: "/auth",
    element: <Auth />,
  },
]);

export default function App() {
  const { setAuth, isLoading } = useAuthStore();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await authService.getMe();
        setAuth(user);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        setAuth(null); // Clear user data if fetching fails
      } finally {
        useAuthStore.setState({ isLoading: false });
      }
    };

    fetchUser();
  }, [setAuth]);

  if (isLoading) {
    return <div>Loading...</div>; // Show loading indicator while fetching user data
  }

  return <RouterProvider router={router} />;
}

