import { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, Plus, Settings, HelpCircle, LogOut, User, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface DashboardLayoutProps {
  children: ReactNode;
  avatarUrl?: string | null;
  fullName?: string | null;
  onNewPage?: () => void;
  newPageDisabled?: boolean;
}

const DashboardLayout = ({ 
  children, 
  avatarUrl, 
  fullName,
  onNewPage,
  newPageDisabled = false
}: DashboardLayoutProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
    toast.success("Você saiu da conta");
  };

  const getInitials = (name?: string | null) => {
    if (!name) return user?.email?.charAt(0).toUpperCase() || "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <Link to="/dashboard" className="flex items-center gap-2 group">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Sparkles className="w-4 sm:w-5 h-4 sm:h-5 text-primary" />
              </div>
              <span className="text-lg sm:text-xl font-bold text-foreground">TrustPage</span>
            </Link>
            
            <div className="flex items-center gap-2 sm:gap-3">
              {onNewPage && (
                <Button 
                  onClick={onNewPage} 
                  disabled={newPageDisabled} 
                  size="sm" 
                  className="gradient-button text-primary-foreground border-0"
                >
                  <Plus className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Nova Página</span>
                </Button>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-full p-0 hover:ring-2 hover:ring-primary/20 transition-all">
                    <Avatar className="h-9 w-9 sm:h-10 sm:w-10 border-2 border-border">
                      <AvatarImage src={avatarUrl || undefined} alt={fullName || "Avatar"} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                        {getInitials(fullName)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center gap-3 p-3 border-b border-border">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={avatarUrl || undefined} alt={fullName || "Avatar"} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {getInitials(fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <p className="text-sm font-medium truncate">{fullName || "Usuário"}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                  </div>
                  <div className="p-1">
                    <DropdownMenuItem 
                      className="cursor-pointer"
                      onClick={() => navigate("/settings")}
                    >
                      <User className="w-4 h-4 mr-2" />
                      Minha Conta
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="cursor-pointer"
                      onClick={() => navigate("/subscription")}
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Assinatura
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="cursor-pointer"
                      onClick={() => window.open("https://wa.me/5511999999999?text=Preciso de ajuda com o TrustPage", "_blank")}
                    >
                      <HelpCircle className="w-4 h-4 mr-2" />
                      Central de Ajuda
                    </DropdownMenuItem>
                  </div>
                  <DropdownMenuSeparator />
                  <div className="p-1">
                    <DropdownMenuItem 
                      className="cursor-pointer text-destructive focus:text-destructive"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sair
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {children}
    </div>
  );
};

export default DashboardLayout;
