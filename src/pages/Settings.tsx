import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  User, 
  CreditCard, 
  Bell,
  Shield,
  Save,
  Loader2,
  Camera
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type PixKeyType = "cpf" | "email" | "phone" | "random";

interface ProfileData {
  full_name: string;
  username: string;
  bio: string;
  telegram_username: string;
  avatar_url: string;
  pix_key: string;
  pix_key_type: PixKeyType | "";
}

const SettingsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "pix" | "notifications" | "security">("profile");
  
  const [profile, setProfile] = useState<ProfileData>({
    full_name: "",
    username: "",
    bio: "",
    telegram_username: "",
    avatar_url: "",
    pix_key: "",
    pix_key_type: "",
  });

  useEffect(() => {
    const checkAuthAndLoadProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      if (error) {
        toast.error("Erro ao carregar perfil");
        console.error(error);
      } else if (data) {
        setProfile({
          full_name: data.full_name || "",
          username: data.username || "",
          bio: data.bio || "",
          telegram_username: data.telegram_username || "",
          avatar_url: data.avatar_url || "",
          pix_key: data.pix_key || "",
          pix_key_type: (data.pix_key_type as PixKeyType) || "",
        });
      }
      
      setLoading(false);
    };

    checkAuthAndLoadProfile();
  }, [navigate]);

  const handleSaveProfile = async () => {
    setSaving(true);
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Sessão expirada");
      navigate("/auth");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        username: profile.username,
        bio: profile.bio,
        telegram_username: profile.telegram_username,
        avatar_url: profile.avatar_url,
      })
      .eq("id", session.user.id);

    if (error) {
      toast.error("Erro ao salvar perfil");
      console.error(error);
    } else {
      toast.success("Perfil atualizado com sucesso!");
    }
    
    setSaving(false);
  };

  const handleSavePix = async () => {
    if (!profile.pix_key || !profile.pix_key_type) {
      toast.error("Preencha a chave PIX e o tipo");
      return;
    }

    setSaving(true);
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Sessão expirada");
      navigate("/auth");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        pix_key: profile.pix_key,
        pix_key_type: profile.pix_key_type,
      })
      .eq("id", session.user.id);

    if (error) {
      toast.error("Erro ao salvar chave PIX");
      console.error(error);
    } else {
      toast.success("Chave PIX salva com sucesso!");
    }
    
    setSaving(false);
  };

  const tabs = [
    { id: "profile" as const, label: "Perfil", icon: User },
    { id: "pix" as const, label: "Chave PIX", icon: CreditCard },
    { id: "notifications" as const, label: "Notificações", icon: Bell },
    { id: "security" as const, label: "Segurança", icon: Shield },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              <span className="gradient-text">Configurações</span>
            </h1>
            <p className="text-muted-foreground">
              Gerencie seu perfil e preferências
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <nav className="glass-card rounded-xl p-2 space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Content Area */}
            <div className="lg:col-span-3">
              {activeTab === "profile" && (
                <div className="glass-card rounded-xl p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-6">
                    Informações do Perfil
                  </h2>

                  <div className="space-y-6">
                    {/* Avatar */}
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-3xl font-bold text-primary-foreground">
                          {profile.full_name ? profile.full_name[0].toUpperCase() : "U"}
                        </div>
                        <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
                          <Camera className="w-4 h-4" />
                        </button>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Foto de Perfil</p>
                        <p className="text-sm text-muted-foreground">
                          JPG, PNG ou GIF. Máximo 2MB.
                        </p>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="full_name">Nome Completo</Label>
                        <Input
                          id="full_name"
                          value={profile.full_name}
                          onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                          placeholder="Seu nome completo"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="username">Nome de Usuário</Label>
                        <Input
                          id="username"
                          value={profile.username}
                          onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                          placeholder="@username"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={profile.bio}
                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                        placeholder="Conte um pouco sobre você..."
                        className="resize-none"
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="telegram">Telegram</Label>
                      <Input
                        id="telegram"
                        value={profile.telegram_username}
                        onChange={(e) => setProfile({ ...profile, telegram_username: e.target.value })}
                        placeholder="@seu_telegram"
                      />
                      <p className="text-xs text-muted-foreground">
                        Usado para contato rápido com compradores
                      </p>
                    </div>

                    <Button 
                      onClick={handleSaveProfile} 
                      disabled={saving}
                      className="w-full sm:w-auto"
                    >
                      {saving ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Salvar Alterações
                    </Button>
                  </div>
                </div>
              )}

              {activeTab === "pix" && (
                <div className="glass-card rounded-xl p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-6">
                    Chave PIX para Saques
                  </h2>

                  <div className="space-y-6">
                    <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
                      <p className="text-sm text-amber-800">
                        <strong>Importante:</strong> A chave PIX cadastrada será usada para receber seus saques. 
                        Certifique-se de que a chave está correta.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pix_key_type">Tipo de Chave</Label>
                      <Select
                        value={profile.pix_key_type}
                        onValueChange={(value: PixKeyType) => setProfile({ ...profile, pix_key_type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cpf">CPF</SelectItem>
                          <SelectItem value="email">E-mail</SelectItem>
                          <SelectItem value="phone">Telefone</SelectItem>
                          <SelectItem value="random">Chave Aleatória</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pix_key">Chave PIX</Label>
                      <Input
                        id="pix_key"
                        value={profile.pix_key}
                        onChange={(e) => setProfile({ ...profile, pix_key: e.target.value })}
                        placeholder={
                          profile.pix_key_type === "cpf" ? "000.000.000-00" :
                          profile.pix_key_type === "email" ? "seu@email.com" :
                          profile.pix_key_type === "phone" ? "+55 11 99999-9999" :
                          "Sua chave aleatória"
                        }
                      />
                    </div>

                    <Button 
                      onClick={handleSavePix} 
                      disabled={saving}
                      className="w-full sm:w-auto"
                    >
                      {saving ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Salvar Chave PIX
                    </Button>
                  </div>
                </div>
              )}

              {activeTab === "notifications" && (
                <div className="glass-card rounded-xl p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-6">
                    Preferências de Notificações
                  </h2>
                  <p className="text-muted-foreground">
                    Em breve você poderá configurar suas notificações aqui.
                  </p>
                </div>
              )}

              {activeTab === "security" && (
                <div className="glass-card rounded-xl p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-6">
                    Segurança da Conta
                  </h2>
                  <p className="text-muted-foreground">
                    Em breve você poderá configurar opções de segurança aqui.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SettingsPage;
