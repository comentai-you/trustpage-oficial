import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Lock } from "lucide-react";

interface ViewLimitOverlayProps {
  ownerName?: string;
}

const ViewLimitOverlay = ({ ownerName }: ViewLimitOverlayProps) => {
  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Icon */}
        <div className="mx-auto w-20 h-20 rounded-full bg-orange-500/20 flex items-center justify-center">
          <Lock className="w-10 h-10 text-orange-400" />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Limite de Visualizações Atingido
          </h1>
          <p className="text-gray-400 text-lg">
            Esta página atingiu o limite mensal de 1.000 visualizações do plano gratuito.
          </p>
        </div>

        {/* Info Box */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-center gap-2 text-orange-400">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-semibold">Página Temporariamente Indisponível</span>
          </div>
          <p className="text-gray-400 text-sm">
            Entre em contato com o proprietário desta página para mais informações.
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 pt-6">
          <p className="text-gray-500 text-sm mb-4">
            É o dono desta página?
          </p>
          <Link to="/auth">
            <Button 
              variant="outline" 
              className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              Fazer Login
            </Button>
          </Link>
          <div className="mt-3">
            <Link 
              to="/oferta" 
              className="text-primary hover:underline text-sm font-medium"
            >
              Faça upgrade para liberar visualizações ilimitadas →
            </Link>
          </div>
        </div>

        {/* TrustPage Branding */}
        <div className="pt-4">
          <p className="text-gray-600 text-xs">
            Página criada com{" "}
            <a 
              href="https://trustpageapp.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-400"
            >
              TrustPage
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ViewLimitOverlay;
