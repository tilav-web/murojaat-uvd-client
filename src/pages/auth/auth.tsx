import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuthStore } from "../../stores/auth/auth.store";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { authService } from "@/services/auth.service";
import { Shield } from "lucide-react";

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
      toast.success("Muvaffaqiyatli tizimga kirdingiz!");
      navigate("/"); // Redirect to home or dashboard after successful login
    } catch (err) {
      toast.error("Tizimga kirishda xatolik. Iltimos, ma'lumotlaringizni tekshiring.");
      console.error(err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-[#d1fff3]">
      <Card className="w-full max-w-md shadow-2xl rounded-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto bg-[#62e3c8] p-4 rounded-full mb-4">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-4xl font-bold tracking-tight">
            Xush kelibsiz!
          </CardTitle>
          <CardDescription className="text-lg text-gray-500">
            Hisobingizga kirish uchun tizimga kiring.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="grid gap-6 p-8">
            <div className="grid gap-2">
              <Label htmlFor="uid" className="text-base">
                UID
              </Label>
              <Input
                id="uid"
                type="text"
                placeholder="UID kiriting"
                value={uid}
                onChange={(e) => setUid(e.target.value)}
                required
                className="py-6 text-base"
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-base">
                  Parol
                </Label>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="py-6 text-base"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 p-8 pt-0">
            <Button
              type="submit"
              className="w-full py-6 text-lg font-semibold"
              style={{ backgroundColor: "#62e3c8" }}
            >
              Kirish
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Auth;
