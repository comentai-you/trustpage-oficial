import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, 
  Download, 
  Trash2, 
  Loader2, 
  Search, 
  Mail, 
  Phone, 
  MessageCircle,
  Calendar,
  FileText,
  ArrowLeft,
  Filter,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ConfirmDialog from "@/components/ConfirmDialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Lead {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  created_at: string;
  landing_page_id: string;
  page_name?: string | null;
  page_slug?: string;
}

interface LandingPage {
  id: string;
  page_name: string | null;
  slug: string;
}

interface UserProfile {
  full_name: string | null;
  avatar_url: string | null;
}

const LeadsPage = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [pages, setPages] = useState<LandingPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPage, setSelectedPage] = useState<string>("all");
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; ids: string[]; count: number }>({ 
    open: false, 
    ids: [], 
    count: 0 
  });
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchPages();
      fetchLeads();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", user!.id)
        .maybeSingle();
      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const fetchPages = async () => {
    try {
      const { data, error } = await supabase
        .from("landing_pages")
        .select("id, page_name, slug")
        .eq("user_id", user!.id)
        .order("page_name", { ascending: true });

      if (error) throw error;
      setPages(data || []);
    } catch (error) {
      console.error("Error fetching pages:", error);
    }
  };

  const fetchLeads = async () => {
    try {
      // First, get all leads from user's landing pages
      const { data: leadsData, error: leadsError } = await supabase
        .from("leads")
        .select(`
          id,
          name,
          email,
          phone,
          whatsapp,
          created_at,
          landing_page_id
        `)
        .order("created_at", { ascending: false });

      if (leadsError) throw leadsError;

      // Get page info for leads
      const { data: pagesData, error: pagesError } = await supabase
        .from("landing_pages")
        .select("id, page_name, slug")
        .eq("user_id", user!.id);

      if (pagesError) throw pagesError;

      // Create a map of page IDs to page info
      const pageMap = new Map(pagesData?.map(p => [p.id, { page_name: p.page_name, page_slug: p.slug }]));

      // Filter leads to only include those from user's pages and add page info
      const userLeads = (leadsData || [])
        .filter(lead => pageMap.has(lead.landing_page_id))
        .map(lead => ({
          ...lead,
          page_name: pageMap.get(lead.landing_page_id)?.page_name,
          page_slug: pageMap.get(lead.landing_page_id)?.page_slug,
        }));

      setLeads(userLeads);
    } catch (error) {
      console.error("Error fetching leads:", error);
      toast.error("Erro ao carregar leads");
    } finally {
      setLoading(false);
    }
  };

  // Filtered leads based on search and page filter
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      // Page filter
      if (selectedPage !== "all" && lead.landing_page_id !== selectedPage) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          lead.name?.toLowerCase().includes(query) ||
          lead.email?.toLowerCase().includes(query) ||
          lead.phone?.includes(query) ||
          lead.whatsapp?.includes(query)
        );
      }

      return true;
    });
  }, [leads, searchQuery, selectedPage]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLeads(new Set(filteredLeads.map(l => l.id)));
    } else {
      setSelectedLeads(new Set());
    }
  };

  const handleSelectLead = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedLeads);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedLeads(newSelected);
  };

  const handleDeleteSelected = () => {
    if (selectedLeads.size === 0) return;
    setDeleteDialog({ 
      open: true, 
      ids: Array.from(selectedLeads), 
      count: selectedLeads.size 
    });
  };

  const confirmDelete = async () => {
    const { ids } = deleteDialog;
    setDeleteDialog({ open: false, ids: [], count: 0 });

    try {
      const { error } = await supabase
        .from("leads")
        .delete()
        .in("id", ids);

      if (error) throw error;

      setLeads(leads.filter(l => !ids.includes(l.id)));
      setSelectedLeads(new Set());
      toast.success(`${ids.length} lead(s) excluído(s) com sucesso`);
    } catch (error) {
      console.error("Error deleting leads:", error);
      toast.error("Erro ao excluir leads");
    }
  };

  const handleExportCSV = () => {
    if (filteredLeads.length === 0) {
      toast.error("Nenhum lead para exportar");
      return;
    }

    // Create CSV content
    const headers = ["Nome", "Email", "Telefone", "WhatsApp", "Página", "Data"];
    const rows = filteredLeads.map(lead => [
      lead.name || "",
      lead.email || "",
      lead.phone || "",
      lead.whatsapp || "",
      lead.page_name || lead.page_slug || "",
      format(new Date(lead.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    // Download file
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `leads_${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();

    toast.success("Leads exportados com sucesso!");
  };

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  return (
    <DashboardLayout avatarUrl={profile?.avatar_url} fullName={profile?.full_name}>
      <main className="container mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate("/dashboard")}
              className="shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">Leads Capturados</h1>
              <p className="text-sm text-muted-foreground">
                Gerencie os contatos das suas landing pages
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={handleExportCSV}
              disabled={filteredLeads.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card className="border-0 shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total de Leads</p>
                  <p className="text-2xl font-bold text-foreground">{leads.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Com Email</p>
                  <p className="text-2xl font-bold text-foreground">
                    {leads.filter(l => l.email).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Com WhatsApp</p>
                  <p className="text-2xl font-bold text-foreground">
                    {leads.filter(l => l.whatsapp || l.phone).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6 border-0 shadow-card">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, email ou telefone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={selectedPage} onValueChange={setSelectedPage}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filtrar por página" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as páginas</SelectItem>
                  {pages.map((page) => (
                    <SelectItem key={page.id} value={page.id}>
                      {page.page_name || page.slug}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Actions Bar */}
        {selectedLeads.size > 0 && (
          <div className="flex items-center justify-between p-3 mb-4 rounded-lg bg-primary/5 border border-primary/20">
            <span className="text-sm font-medium text-foreground">
              {selectedLeads.size} lead(s) selecionado(s)
            </span>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteSelected}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir Selecionados
            </Button>
          </div>
        )}

        {/* Leads Table */}
        <Card className="border-0 shadow-card overflow-hidden">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {leads.length === 0 ? "Nenhum lead capturado" : "Nenhum resultado encontrado"}
                </h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  {leads.length === 0 
                    ? "Quando visitantes preencherem formulários nas suas páginas de captura, os leads aparecerão aqui."
                    : "Tente ajustar os filtros para encontrar o que procura."
                  }
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">
                        <Checkbox
                          checked={selectedLeads.size === filteredLeads.length && filteredLeads.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Contato</TableHead>
                      <TableHead>Página</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLeads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedLeads.has(lead.id)}
                            onCheckedChange={(checked) => handleSelectLead(lead.id, !!checked)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-foreground">
                            {lead.name || <span className="text-muted-foreground">Não informado</span>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {lead.email && (
                              <div className="flex items-center gap-1.5 text-sm">
                                <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                                <a href={`mailto:${lead.email}`} className="text-primary hover:underline">
                                  {lead.email}
                                </a>
                              </div>
                            )}
                            {(lead.whatsapp || lead.phone) && (
                              <div className="flex items-center gap-1.5 text-sm">
                                <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                                <a 
                                  href={`https://wa.me/${(lead.whatsapp || lead.phone)?.replace(/\D/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-success hover:underline"
                                >
                                  {lead.whatsapp || lead.phone}
                                </a>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="font-normal">
                            <FileText className="w-3 h-3 mr-1" />
                            {lead.page_name || lead.page_slug}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(lead.created_at)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <ChevronDown className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {lead.email && (
                                <DropdownMenuItem asChild>
                                  <a href={`mailto:${lead.email}`}>
                                    <Mail className="w-4 h-4 mr-2" />
                                    Enviar Email
                                  </a>
                                </DropdownMenuItem>
                              )}
                              {(lead.whatsapp || lead.phone) && (
                                <DropdownMenuItem asChild>
                                  <a 
                                    href={`https://wa.me/${(lead.whatsapp || lead.phone)?.replace(/\D/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <MessageCircle className="w-4 h-4 mr-2" />
                                    Abrir WhatsApp
                                  </a>
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem 
                                onClick={() => setDeleteDialog({ open: true, ids: [lead.id], count: 1 })}
                                className="text-destructive focus:text-destructive"
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

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => !open && setDeleteDialog({ open: false, ids: [], count: 0 })}
        title="Excluir Lead(s)"
        description={`Tem certeza que deseja excluir ${deleteDialog.count} lead(s)? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        onConfirm={confirmDelete}
        variant="destructive"
      />
    </DashboardLayout>
  );
};

export default LeadsPage;
