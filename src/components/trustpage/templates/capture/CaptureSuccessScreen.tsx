import { Button } from "@/components/ui/button";
import { CheckCircle, Download, Loader2 } from "lucide-react";

interface CaptureSuccessScreenProps {
  accentColor: string;
  textColor: string;
  isDownloading: boolean;
  onDownload: () => void;
}

const CaptureSuccessScreen = ({ accentColor, textColor, isDownloading, onDownload }: CaptureSuccessScreenProps) => (
  <div className="text-center space-y-6">
    <div
      className="mx-auto w-20 h-20 rounded-full flex items-center justify-center"
      style={{
        backgroundColor: `${accentColor}20`,
        boxShadow: `0 0 30px ${accentColor}40`,
      }}
    >
      <CheckCircle className="w-10 h-10" style={{ color: accentColor }} />
    </div>

    <div className="space-y-2">
      <h2 className="text-2xl font-bold" style={{ color: textColor }}>
        Quase lá! 🎉
      </h2>
      <p className="text-base" style={{ color: `${textColor}cc` }}>
        Seu download está pronto. Clique no botão abaixo para baixar.
      </p>
    </div>

    <Button
      onClick={onDownload}
      disabled={isDownloading}
      className="w-full h-16 text-lg font-bold uppercase tracking-wide transition-all duration-300 hover:scale-[1.02] disabled:opacity-80"
      style={{
        background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}cc 100%)`,
        color: '#ffffff',
        boxShadow: `0 10px 30px -10px ${accentColor}80`,
      }}
    >
      {isDownloading ? (
        <>
          <Loader2 className="w-6 h-6 mr-3 animate-spin" />
          Baixando...
        </>
      ) : (
        <>
          <Download className="w-6 h-6 mr-3" />
          BAIXAR AGORA
        </>
      )}
    </Button>

    <p className="text-xs" style={{ color: `${textColor}60` }}>
      💡 O download iniciará automaticamente. Verifique sua pasta de downloads.
    </p>
  </div>
);

export default CaptureSuccessScreen;
