import { signOut, useSession } from "@/lib/auth-client";
import { Bell, LogOut, Package, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

const DropdownProfile = () => {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { data: session } = useSession();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      toast.success("Logout realizado com sucesso!");
      router.push("/auth/login");
      router.refresh();
    } catch (error) {
      toast.error("Erro ao fazer logout");
    } finally {
      setIsLoggingOut(false);
    }
  };
  return (
    <>
      {!session ? (
        <Link href="/auth/login">
          <Button variant="default">Login</Button>
        </Link>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              {session?.user?.image ? (
                <div className="relative h-10 w-10">
                  <Avatar className="size-10 rounded-full">
                    <AvatarImage
                      src={session.user.image || ""}
                      alt={session.user.name || "User"}
                      className="rounded-full"
                    />
                    <AvatarFallback className="text-xs">HR</AvatarFallback>
                  </Avatar>
                  <Badge className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] text-white tabular-nums">
                    8
                  </Badge>
                </div>
              ) : (
                <div className="relative h-10 w-10 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                  {session?.user?.name?.charAt(0) || "U"}
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] text-white tabular-nums">
                    8
                  </span>
                </div>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="flex items-center gap-2 p-2">
              {session?.user?.image ? (
                <Image
                  src={session.user.image || ""}
                  alt={session.user.name || "User"}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                  {session?.user?.name?.charAt(0) || "U"}
                </div>
              )}
              <div className="flex flex-col">
                <span className="font-semibold text-sm">
                  {session?.user?.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {session?.user?.email}
                </span>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/account" className="cursor-pointer">
                <User className="h-4 w-4 mr-2" />
                <span>Minha Conta</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/orders" className="cursor-pointer">
                <Package className="h-4 w-4 mr-2" />
                <span>Meus Pedidos</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/notifications" className="cursor-pointer">
                <Bell className="h-4 w-4 mr-2" />
                <span>Notificações</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} disabled={isLoggingOut}>
              <LogOut className="h-4 w-4 mr-2" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </>
  );
};

export default DropdownProfile;
