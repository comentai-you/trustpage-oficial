const AdvertorialDisclaimer = () => (
  <footer className="bg-gray-100 border-t border-gray-200 py-6 px-4" style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
    <div className="max-w-4xl mx-auto text-center">
      <p className="text-[10px] sm:text-xs text-gray-400 leading-relaxed">
        Este site não é afiliado ao Facebook ou a nenhuma entidade de imprensa oficial.
        Todo o conteúdo aqui presente é de caráter publicitário. Os resultados podem variar de pessoa para pessoa.
      </p>
      <div className="flex items-center justify-center gap-4 mt-3 text-[10px] text-gray-400">
        <span>Termos de Uso</span>
        <span>•</span>
        <span>Política de Privacidade</span>
        <span>•</span>
        <span>Disclaimer</span>
      </div>
    </div>
  </footer>
);

export default AdvertorialDisclaimer;
