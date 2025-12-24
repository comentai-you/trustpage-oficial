import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Wallet, 
  Clock, 
  CheckCircle, 
  ArrowDownToLine, 
  ArrowUpFromLine,
  History,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

const WalletPage = () => {
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [pixKey, setPixKey] = useState("");

  // Mock data - will be replaced with Supabase data
  const walletData = {
    pendingBalance: 1250.00,
    availableBalance: 3450.75,
    totalEarnings: 12500.00,
  };

  const transactions = [
    {
      id: "1",
      type: "sale",
      description: "Venda - Conta Free Fire Level 80",
      amount: 297.50,
      status: "pending",
      date: "2024-01-15",
      releaseDate: "2024-01-17",
    },
    {
      id: "2",
      type: "sale",
      description: "Venda - Instagram 25K Seguidores",
      amount: 1020.00,
      status: "available",
      date: "2024-01-10",
    },
    {
      id: "3",
      type: "withdrawal",
      description: "Saque PIX",
      amount: -500.00,
      status: "completed",
      date: "2024-01-08",
    },
    {
      id: "4",
      type: "sale",
      description: "Venda - Netflix Premium 1 Ano",
      amount: 75.65,
      status: "available",
      date: "2024-01-05",
    },
  ];

  const handleWithdraw = () => {
    if (!withdrawAmount || !pixKey) {
      toast.error("Preencha todos os campos");
      return;
    }
    
    const amount = parseFloat(withdrawAmount);
    if (amount > walletData.availableBalance) {
      toast.error("Saldo insuficiente");
      return;
    }

    if (amount < 20) {
      toast.error("Valor mínimo para saque: R$ 20,00");
      return;
    }

    toast.success("Solicitação de saque enviada! Processamento em até 24h.");
    setWithdrawAmount("");
    setPixKey("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Minha <span className="gradient-text">Carteira</span>
            </h1>
            <p className="text-muted-foreground">
              Gerencie seus ganhos e solicite saques via PIX
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Balance Cards */}
            <div className="lg:col-span-2 space-y-6">
              {/* Balance Overview */}
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Pending Balance */}
                <div className="glass-card p-6 rounded-xl border-l-4 border-l-amber-500">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                      <Clock className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Saldo Pendente</p>
                      <p className="text-2xl font-bold text-foreground">
                        R$ {walletData.pendingBalance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <AlertCircle className="w-3 h-3 inline mr-1" />
                    Liberado 48h após confirmação do comprador
                  </p>
                </div>

                {/* Available Balance */}
                <div className="glass-card p-6 rounded-xl border-l-4 border-l-emerald-500">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Saldo Disponível</p>
                      <p className="text-2xl font-bold text-foreground">
                        R$ {walletData.availableBalance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-emerald-600 font-medium">
                    Disponível para saque imediato
                  </p>
                </div>
              </div>

              {/* Transaction History */}
              <div className="glass-card rounded-xl">
                <div className="p-6 border-b border-border">
                  <div className="flex items-center gap-2">
                    <History className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-semibold text-foreground">Histórico de Transações</h2>
                  </div>
                </div>
                <div className="divide-y divide-border">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          tx.type === "sale" ? "bg-emerald-100" : "bg-primary/10"
                        }`}>
                          {tx.type === "sale" ? (
                            <ArrowDownToLine className={`w-5 h-5 ${tx.status === "pending" ? "text-amber-600" : "text-emerald-600"}`} />
                          ) : (
                            <ArrowUpFromLine className="w-5 h-5 text-primary" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-sm">{tx.description}</p>
                          <p className="text-xs text-muted-foreground">{tx.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${tx.amount > 0 ? "text-emerald-600" : "text-foreground"}`}>
                          {tx.amount > 0 ? "+" : ""}R$ {Math.abs(tx.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          tx.status === "pending" 
                            ? "bg-amber-100 text-amber-700" 
                            : tx.status === "available" 
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-secondary text-muted-foreground"
                        }`}>
                          {tx.status === "pending" ? "Pendente" : tx.status === "available" ? "Disponível" : "Concluído"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Withdraw Section */}
            <div className="space-y-6">
              <div className="glass-card p-6 rounded-xl">
                <div className="flex items-center gap-2 mb-6">
                  <Wallet className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">Solicitar Saque</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">
                      Valor do Saque
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                      <Input
                        type="number"
                        placeholder="0,00"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Mínimo: R$ 20,00 • Taxa: Grátis
                    </p>
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">
                      Chave PIX
                    </label>
                    <Input
                      type="text"
                      placeholder="CPF, E-mail, Telefone ou Chave Aleatória"
                      value={pixKey}
                      onChange={(e) => setPixKey(e.target.value)}
                    />
                  </div>

                  <Button 
                    variant="gradient" 
                    className="w-full" 
                    size="lg"
                    onClick={handleWithdraw}
                  >
                    <ArrowUpFromLine className="w-4 h-4 mr-2" />
                    Solicitar Saque
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    Saques são processados em até 24 horas úteis
                  </p>
                </div>
              </div>

              {/* Info Card */}
              <div className="glass-card p-6 rounded-xl border-l-4 border-l-primary">
                <h3 className="font-semibold text-foreground mb-3">Como funciona o Escrow?</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-medium">1.</span>
                    Você realiza uma venda na plataforma
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-medium">2.</span>
                    O valor (menos 15% de comissão) vai para Saldo Pendente
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-medium">3.</span>
                    Após o comprador confirmar, aguarda-se 48h
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-medium">4.</span>
                    O saldo migra para Disponível e pode ser sacado
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default WalletPage;
