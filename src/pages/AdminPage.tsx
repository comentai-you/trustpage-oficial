import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Users,
  Crown,
  Star,
  UserX,
  Search,
  MoreHorizontal,
  Pencil,
  Mail,
  Ban,
  Loader2,
  ShieldCheck,
  RefreshCw,
  FileText,
  Eye,
  LayoutTemplate,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface UserProfile {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  plan_type: string | null;
  subscription_status: string | null;
  created_at: string;
  updated_at: string;
  email: string | null;
}

// Interface atualizada conforme sua tabela 'landing_pages'
interface LandingPage {
  id: string;
  page_name: string;
  slug: string;
  is_published: boolean;
  views: number;
  created_at: string;
  template_type: string;
}

interface AdminStats {
  total_users: number;
  pro_users: number;
  essential_users: number;
  free_users: number;
}

const AdminPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingData, setLoadingData] = useState(true);

  // Dialog states
  const [changePlanOpen, setChangePlanOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [newPlan, setNewPlan] = useState<string>("");
  const [actionLoading, setActionLoading] = useState(false);

  // States para Visualizar Páginas
  const [viewPagesOpen, setViewPagesOpen] = useState(false);
  const [selectedUserPages, setSelectedUserPages] = useState<LandingPage[]>([]);
  const [pagesLoading, setPagesLoading] = useState(false);

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc("is_admin");

        if (error) {
          console.error("Error checking admin status:", error);
          setIsAdmin(false);
          return;
        }

        setIsAdmin(data === true);
      } catch (err) {
        console.error("Error:", err);
        setIsAdmin(false);
      }
    };

    if (!authLoading) {
      checkAdmin();
    }
  }, [user, authLoading]);

  // Redirect if not admin
  useEffect(() => {
    if (isAdmin === false) {
      toast.error("Acesso negado");
      navigate("/");
    }
  }, [isAdmin, navigate]);

  // Load data when admin confirmed
  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  // Filter users when search changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
      return;
    }

    const query = searchQuery.toLowerCase();
    setFilteredUsers(
      users.filter(
        (u) =>
          u.email?.toLowerCase().includes(query) ||
          u.full_name?.toLowerCase().includes(query) ||
          u.username?.toLowerCase().includes(query),
      ),
    );
  }, [searchQuery, users]);

  const loadData = async () => {
    setLoadingData(true);
    try {
      // Load stats
      const { data: statsData, error: statsError } = await supabase.rpc("admin_get_stats");
      if (statsError) throw statsError;
      if (statsData && statsData.length > 0) {
        setStats(statsData[0] as AdminStats);
      }

      // Load users
      const { data: usersData, error: usersError } = await supabase.rpc("admin_get_all_profiles");
      if (usersError) throw usersError;
      setUsers((usersData as UserProfile[]) || []);
      setFilteredUsers((usersData as UserProfile[]) || []);
    } catch (err) {
      console.error("Error loading admin data:", err);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoadingData(false);
    }
  };

  const handleChangePlan = (user: UserProfile) => {
    setSelectedUser(user);
    setNewPlan(user.plan_type || "free");
    setChangePlanOpen(true);
  };

  const savePlanChange = async () => {
    if (!selectedUser || !newPlan) return;

    setActionLoading(true);
    try {
      const { error } = await supabase.rpc("update_user_plan", {
        target_user_id: selectedUser.id,
        new_plan_type: newPlan,
        new_status: "active",
      });

      if (error) throw error;

      toast.success(`Plano atualizado para ${newPlan.toUpperCase()}`);
      setChangePlanOpen(false);
      loadData();
    } catch (err) {
      console.error("Error updating plan:", err);
      toast.error("Erro ao atualizar plano");
    } finally {
      setActionLoading(false);
    }
  };

  const handleResendAccess = async (userProfile: UserProfile) => {
    if (!userProfile.email) {
      toast.error("Usuário sem e-mail");
      return;
    }

    setActionLoading(true);
    try {
      // NOTA: Mantive trustpageapp.com aqui pois é o link de reset de senha (dashboard)
      const { error } = await supabase.auth.resetPasswordForEmail(userProfile.email, {
        redirectTo: "https://trustpageapp.com/auth/update-password",
      });

      if (error) throw error;

      toast.success(`Link de redefinição enviado para ${userProfile.email}`);
    } catch (err) {
      console.error("Error sending reset email:", err);
      toast.error("Erro ao enviar e-mail");
    } finally {
      setActionLoading(false);
    }
  };

  const handleBlockUser = async (userProfile: UserProfile) => {
    if (!confirm(`Deseja realmente bloquear ${userProfile.email || userProfile.full_name}?`)) {
      return;
    }

    setActionLoading(true);
    try {
      const { error } = await supabase.rpc("admin_update_user_status", {
        target_user_id: userProfile.id,
        new_status: "inactive",
      });

      if (error) throw error;

      toast.success("Usuário bloqueado");
      loadData();
    } catch (err) {
      console.error("Error blocking user:", err);
      toast.error("Erro ao bloquear usuário");
    } finally {
      setActionLoading(false);
    }
  };

  // Função para buscar na tabela 'landing_pages'
  const handleViewPages = async (userProfile: UserProfile) => {
    setSelectedUser(userProfile);
    setViewPagesOpen(true);
    setPagesLoading(true);

    try {
      const { data, error } = await supabase
        .from("landing_pages")
        .select("*")
        .eq("user_id", userProfile.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSelectedUserPages((data as LandingPage[]) || []);
    } catch (err) {
      console.error("Error fetching pages:", err);
      toast.error("Erro ao carregar páginas do usuário");
    } finally {
      setPagesLoading(false);
    }
  };

  const getPlanBadge = (plan: string | null) => {
    switch (plan) {
      case "pro":
        return <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">PRO</Badge>;
      case "pro_yearly":
        return <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">PRO ANUAL</Badge>;
      case "essential":
        return <Badge className="bg-blue-500 text-white">ESSENCIAL</Badge>;
      case "essential_yearly":
        return <Badge className="bg-blue-600 text-white">ESSENCIAL ANUAL</Badge>;
      default:
        return <Badge variant="secondary">FREEMIUM</Badge>;
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500 text-white">Ativo</Badge>;
      case "inactive":
        return <Badge variant="destructive">Inativo</Badge>;
      case "canceled":
        return (
          <Badge variant="outline" className="text-red-500 border-red-500">
            Cancelado
          </Badge>
        );
      default:
        return <Badge variant="secondary">Free</Badge>;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Loading state
  if (authLoading || isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not admin - will redirect
  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <ShieldCheck className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Admin Control Center</h1>
                <p className="text-sm text-gray-500">Gerenciamento de usuários e assinaturas</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Navigation Tabs */}
              <nav className="hidden sm:flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <Button variant="ghost" size="sm" className="bg-white dark:bg-gray-600 shadow-sm">
                  <Users className="w-4 h-4 mr-2" />
                  Usuários
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigate("/admin/blog")}>
                  <FileText className="w-4 h-4 mr-2" />
                  Blog CMS
                </Button>
                {/* Botão de Marketing */}
                <Button variant="ghost" size="sm" onClick={() => navigate("/admin/marketing")}>
                  <Mail className="w-4 h-4 mr-2" />
                  Marketing
                </Button>
              </nav>
              <Button variant="outline" size="sm" onClick={loadData} disabled={loadingData}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loadingData ? "animate-spin" : ""}`} />
                Atualizar
              </Button>
            </div>
          </div>
          {/* Mobile Navigation */}
          <nav className="flex sm:hidden items-center gap-2 mt-3 pt-3 border-t">
            <Button variant="secondary" size="sm" className="flex-1">
              <Users className="w-4 h-4 mr-2" />
              Usuários
            </Button>
            <Button variant="ghost" size="sm" className="flex-1" onClick={() => navigate("/admin/blog")}>
              <FileText className="w-4 h-4 mr-2" />
              Blog CMS
            </Button>
            {/* Botão de Marketing Mobile */}
            <Button variant="ghost" size="sm" className="flex-1" onClick={() => navigate("/admin/marketing")}>
              <Mail className="w-4 h-4 mr-2" />
              Marketing
            </Button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total de Usuários</CardTitle>
              <Users className="w-5 h-5 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{loadingData ? "..." : stats?.total_users || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Assinantes PRO</CardTitle>
              <Crown className="w-5 h-5 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{loadingData ? "..." : stats?.pro_users || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Assinantes BASIC</CardTitle>
              <Star className="w-5 h-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {loadingData ? "..." : stats?.essential_users || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Gratuitos</CardTitle>
              <UserX className="w-5 h-5 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-600">{loadingData ? "..." : stats?.free_users || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle>Gerenciar Usuários</CardTitle>
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar por e-mail ou nome..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loadingData ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Plano</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Cadastro</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                          Nenhum usuário encontrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((userProfile) => (
                        <TableRow key={userProfile.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={userProfile.avatar_url || undefined} />
                                <AvatarFallback>
                                  {(userProfile.full_name || userProfile.email || "U")[0].toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">
                                  {userProfile.full_name || userProfile.username || "Sem nome"}
                                </div>
                                <div className="text-sm text-gray-500">{userProfile.email || "Sem e-mail"}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{getPlanBadge(userProfile.plan_type)}</TableCell>
                          <TableCell>{getStatusBadge(userProfile.subscription_status)}</TableCell>
                          <TableCell>{formatDate(userProfile.created_at)}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {/* Opção Ver Páginas */}
                                <DropdownMenuItem onClick={() => handleViewPages(userProfile)}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  Ver Páginas
                                </DropdownMenuItem>

                                <DropdownMenuItem onClick={() => handleChangePlan(userProfile)}>
                                  <Pencil className="w-4 h-4 mr-2" />
                                  Alterar Plano
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleResendAccess(userProfile)}>
                                  <Mail className="w-4 h-4 mr-2" />
                                  Reenviar Acesso
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleBlockUser(userProfile)} className="text-red-600">
                                  <Ban className="w-4 h-4 mr-2" />
                                  Bloquear Usuário
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Change Plan Dialog */}
      <Dialog open={changePlanOpen} onOpenChange={setChangePlanOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Plano</DialogTitle>
            <DialogDescription>Alterar o plano de {selectedUser?.email || selectedUser?.full_name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Novo Plano</Label>
              <Select value={newPlan} onValueChange={setNewPlan}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um plano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Freemium</SelectItem>
                  <SelectItem value="essential">Essencial Mensal</SelectItem>
                  <SelectItem value="essential_yearly">Essencial Anual (12 meses)</SelectItem>
                  <SelectItem value="pro">PRO Mensal</SelectItem>
                  <SelectItem value="pro_yearly">PRO Anual (12 meses)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChangePlanOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={savePlanChange} disabled={actionLoading}>
              {actionLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View User Pages Dialog (Atualizado com colunas corretas e DOMÍNIO tpage.com.br) */}
      <Dialog open={viewPagesOpen} onOpenChange={setViewPagesOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Páginas de {selectedUser?.full_name || selectedUser?.email}</DialogTitle>
            <DialogDescription>Lista de todas as páginas (Landing Pages e Legais) deste usuário.</DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {pagesLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : selectedUserPages.length === 0 ? (
              <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
                <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Este usuário ainda não criou nenhuma página.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {selectedUserPages.map((page) => (
                  <Card
                    key={page.id}
                    className="overflow-hidden hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                          {/* Ícone muda dependendo do tipo */}
                          {page.template_type === "legal" ? (
                            <ShieldCheck className="w-5 h-5 text-gray-600" />
                          ) : (
                            <LayoutTemplate className="w-5 h-5 text-purple-600" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                            {page.page_name || "Sem título"}
                          </h4>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Badge variant="outline" className="text-xs">
                              {page.template_type || "Landing Page"}
                            </Badge>
                            <span className="font-mono bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                              /{page.slug}
                            </span>
                            <span>•</span>
                            <span>{page.views || 0} visualizações</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {page.is_published ? (
                          <Badge className="bg-green-500 hover:bg-green-600">Publicado</Badge>
                        ) : (
                          <Badge variant="secondary">Rascunho</Badge>
                        )}

                        <Button size="sm" variant="outline" asChild>
                          <a
                            href={`https://tpage.com.br/${page.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            Abrir
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPage;
