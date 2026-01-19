import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Mail,
  Plus,
  Calendar,
  Clock,
  Send,
  Users,
  FileText,
  Loader2,
  ShieldCheck,
  RefreshCw,
  MoreHorizontal,
  Trash2,
  Eye,
  Pencil,
  CheckCircle,
  XCircle,
  AlertCircle,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import CampaignEditor from "@/components/marketing/CampaignEditor";

interface Campaign {
  id: string;
  title: string;
  subject: string;
  content: string;
  scheduled_at: string | null;
  status: string;
  sent_count: number;
  failed_count: number;
  created_at: string;
  updated_at: string;
}

const AdminMarketingPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [processingCampaigns, setProcessingCampaigns] = useState(false);

  // Check for editor mode from URL
  useEffect(() => {
    if (searchParams.get("new") === "true") {
      setShowEditor(true);
      setSelectedCampaign(null);
    }
    const editId = searchParams.get("edit");
    if (editId && campaigns.length > 0) {
      const campaign = campaigns.find((c) => c.id === editId);
      if (campaign) {
        setSelectedCampaign(campaign);
        setShowEditor(true);
      }
    }
  }, [searchParams, campaigns]);

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
      loadCampaigns();
    }
  }, [isAdmin]);

  const loadCampaigns = async () => {
    setLoadingData(true);
    try {
      const { data, error } = await supabase
        .from("marketing_campaigns")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCampaigns((data as Campaign[]) || []);
    } catch (err) {
      console.error("Error loading campaigns:", err);
      toast.error("Erro ao carregar campanhas");
    } finally {
      setLoadingData(false);
    }
  };

  const handleNewCampaign = () => {
    setSelectedCampaign(null);
    setShowEditor(true);
    setSearchParams({ new: "true" });
  };

  const handleEditCampaign = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setShowEditor(true);
    setSearchParams({ edit: campaign.id });
  };

  const handleDeleteCampaign = async (campaign: Campaign) => {
    if (!confirm(`Deseja excluir a campanha "${campaign.title}"?`)) return;

    try {
      const { error } = await supabase
        .from("marketing_campaigns")
        .delete()
        .eq("id", campaign.id);

      if (error) throw error;
      toast.success("Campanha excluída");
      loadCampaigns();
    } catch (err) {
      console.error("Error deleting campaign:", err);
      toast.error("Erro ao excluir campanha");
    }
  };

  const handleCloseEditor = () => {
    setShowEditor(false);
    setSelectedCampaign(null);
    setSearchParams({});
    loadCampaigns();
  };

  const handleForceProcess = async () => {
    setProcessingCampaigns(true);
    try {
      console.log("Calling process-campaigns edge function...");
      
      const { data, error } = await supabase.functions.invoke("process-campaigns");
      
      if (error) {
        console.error("Error from process-campaigns:", error);
        toast.error(`Erro ao processar: ${error.message}`);
        return;
      }

      console.log("Response from process-campaigns:", data);
      
      if (data?.processed === 0) {
        toast.info(
          `Nenhuma campanha para processar agora. ${data.pendingCampaigns || 0} campanha(s) pendente(s) aguardando horário.`,
          { description: `Hora do servidor: ${data.serverTime}` }
        );
      } else if (data?.processed > 0) {
        const successCount = data.results?.filter((r: any) => r.status === "completed").length || 0;
        const failedCount = data.results?.filter((r: any) => r.status === "failed").length || 0;
        
        if (failedCount > 0) {
          toast.warning(
            `Processado: ${successCount} sucesso, ${failedCount} falha(s)`,
            { description: `Total: ${data.processed} campanha(s)` }
          );
        } else {
          toast.success(
            `✅ ${successCount} campanha(s) processada(s) com sucesso!`,
            { description: `Hora do servidor: ${data.serverTime}` }
          );
        }
      } else {
        toast.info("Processamento concluído", { description: JSON.stringify(data) });
      }
      
      // Reload campaigns to show updated status
      await loadCampaigns();
    } catch (err) {
      console.error("Exception calling process-campaigns:", err);
      toast.error(`Erro: ${err instanceof Error ? err.message : "Erro desconhecido"}`);
    } finally {
      setProcessingCampaigns(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return (
          <Badge variant="secondary" className="gap-1">
            <FileText className="w-3 h-3" />
            Rascunho
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-500 text-white gap-1">
            <Clock className="w-3 h-3" />
            Agendado
          </Badge>
        );
      case "processing":
        return (
          <Badge className="bg-blue-500 text-white gap-1">
            <Loader2 className="w-3 h-3 animate-spin" />
            Enviando
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-green-500 text-white gap-1">
            <CheckCircle className="w-3 h-3" />
            Enviado
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="w-3 h-3" />
            Falhou
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return "-";
    return format(new Date(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
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

  // Show editor
  if (showEditor) {
    return (
      <CampaignEditor
        campaign={selectedCampaign}
        onClose={handleCloseEditor}
      />
    );
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
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Admin Control Center
                </h1>
                <p className="text-sm text-gray-500">Email Marketing & Campanhas</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Navigation Tabs */}
              <nav className="hidden sm:flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/admin")}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Usuários
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/admin/blog")}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Blog CMS
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="bg-white dark:bg-gray-600 shadow-sm"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Marketing
                </Button>
              </nav>
              <Button
                variant="outline"
                size="sm"
                onClick={loadCampaigns}
                disabled={loadingData}
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${loadingData ? "animate-spin" : ""}`}
                />
                Atualizar
              </Button>
            </div>
          </div>
          {/* Mobile Navigation */}
          <nav className="flex sm:hidden items-center gap-2 mt-3 pt-3 border-t overflow-x-auto">
            <Button
              variant="ghost"
              size="sm"
              className="flex-shrink-0"
              onClick={() => navigate("/admin")}
            >
              <Users className="w-4 h-4 mr-2" />
              Usuários
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex-shrink-0"
              onClick={() => navigate("/admin/blog")}
            >
              <FileText className="w-4 h-4 mr-2" />
              Blog
            </Button>
            <Button variant="secondary" size="sm" className="flex-shrink-0">
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
              <CardTitle className="text-sm font-medium text-gray-500">
                Total de Campanhas
              </CardTitle>
              <Mail className="w-5 h-5 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{campaigns.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Agendadas
              </CardTitle>
              <Clock className="w-5 h-5 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">
                {campaigns.filter((c) => c.status === "pending").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Enviadas
              </CardTitle>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {campaigns.filter((c) => c.status === "completed").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Total Enviados
              </CardTitle>
              <Send className="w-5 h-5 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {campaigns.reduce((acc, c) => acc + (c.sent_count || 0), 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Force Process Button */}
        <Card className="mb-6 border-dashed border-2 border-amber-300 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-700">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
                <Zap className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Processamento Manual</h3>
                <p className="text-sm text-muted-foreground">
                  Força o processamento de campanhas agendadas (bypass no Cron)
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleForceProcess}
              disabled={processingCampaigns}
              className="border-amber-500 text-amber-700 hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-900"
            >
              {processingCampaigns ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Zap className="w-4 h-4 mr-2" />
              )}
              {processingCampaigns ? "Processando..." : "🔄 Forçar Processamento"}
            </Button>
          </CardContent>
        </Card>

        {/* Campaigns Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Campanhas de Email</CardTitle>
              <Button onClick={handleNewCampaign}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Campanha
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loadingData ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : campaigns.length === 0 ? (
              <div className="text-center py-12">
                <Mail className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Nenhuma campanha criada
                </h3>
                <p className="text-gray-500 mb-4">
                  Crie sua primeira campanha de email marketing
                </p>
                <Button onClick={handleNewCampaign}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Campanha
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campanha</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Agendado para</TableHead>
                      <TableHead>Enviados</TableHead>
                      <TableHead>Criado em</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.map((campaign) => (
                      <TableRow key={campaign.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{campaign.title}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {campaign.subject}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                        <TableCell>
                          {campaign.scheduled_at ? (
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              {formatDate(campaign.scheduled_at)}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-green-600">
                              {campaign.sent_count || 0}
                            </span>
                            {campaign.failed_count > 0 && (
                              <span className="text-red-500 text-sm">
                                / {campaign.failed_count} falhas
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {formatDate(campaign.created_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleEditCampaign(campaign)}
                              >
                                <Pencil className="w-4 h-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteCampaign(campaign)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminMarketingPage;
