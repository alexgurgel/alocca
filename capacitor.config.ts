import type { CapacitorConfig } from '@capacitor/cli';

// O Alocca e um app Next.js com Server Components, middleware de sessao e
// rotas dinamicas — nao da pra "exportar" isso como HTML estatico (webDir).
// Em vez disso, o app nativo carrega o site de producao ao vivo, direto na
// URL da Vercel, dentro de uma WebView nativa real (nao e so um navegador
// escondido: o Capacitor da acesso a APIs nativas de verdade, como push
// notification, camera etc., quando forem adicionadas).
const config: CapacitorConfig = {
  appId: 'com.alocca.app',
  appName: 'Alocca',
  webDir: 'public',
  server: {
    url: 'https://alocca.vercel.app',
    cleartext: false,
  },
};

export default config;
