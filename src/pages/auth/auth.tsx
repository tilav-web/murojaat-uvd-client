import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuthStore } from "../../stores/auth/auth.store";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { authService } from "@/services/auth.service";

const Auth: React.FC = () => {
  const [uid, setUid] = useState("");
  const [password, setPassword] = useState("");
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const authData = await authService.login({ uid, password });
      setAuth(authData);
      toast.success("Successfully logged in!");
      navigate("/"); // Redirect to home or dashboard after successful login
    } catch (err) {
      toast.error("Login failed. Please check your credentials.");
      console.error(err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your UID and password to login to your account.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="uid">UID</Label>
              <Input
                id="uid"
                type="text"
                placeholder="Your UID"
                value={uid}
                onChange={(e) => setUid(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2 mb-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              Sign in
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Auth;
