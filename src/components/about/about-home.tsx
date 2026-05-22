"use client";

import { AlertTriangle, Activity, Globe, ShieldAlert } from "lucide-react";

export function AboutHome() {
  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-12 flex flex-col gap-8">
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-destructive/10 text-destructive text-sm font-medium">
          <AlertTriangle className="w-4 h-4" />
          <span>Em Desenvolvimento (Alpha)</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-serif text-foreground">
          Sobre o Surge Monitor
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl">
          Uma plataforma de inteligência epidemiológica dedicada à monitorização
          em tempo real de surtos de doenças e emergências de saúde pública, com
          foco especial no continente africano.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mt-6">
        <div className="p-6 rounded-2xl bg-card border border-border shadow-sm flex flex-col gap-3 transition-colors hover:border-primary/50">
          <Activity className="w-6 h-6 text-primary" />
          <h3 className="font-semibold text-lg text-card-foreground">
            Dados em Tempo Real
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Agregação de alertas e relatórios oficiais da Organização Mundial de
            Saúde (OMS) e autoridades sanitárias locais.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border shadow-sm flex flex-col gap-3 transition-colors hover:border-primary/50">
          <Globe className="w-6 h-6 text-primary" />
          <h3 className="font-semibold text-lg text-card-foreground">
            Foco Regional
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Visualização geoespacial detalhada para o acompanhamento da evolução
            de surtos epidémicos.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border shadow-sm flex flex-col gap-3 transition-colors hover:border-primary/50">
          <ShieldAlert className="w-6 h-6 text-primary" />
          <h3 className="font-semibold text-lg text-card-foreground">
            Apoio à Decisão
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Ferramenta desenhada para profissionais de saúde pública,
            epidemiologistas e governos, para facilitar a resposta a crises.
          </p>
        </div>
      </div>

      <div className="mt-8 p-6 md:p-8 bg-secondary/30 rounded-2xl border border-border">
        <h2 className="text-xl font-serif text-foreground mb-3">
          Estado do Projeto
        </h2>
        <div className="prose-don text-muted-foreground text-base">
          <p>
            O <strong>Surge Monitor</strong> encontra-se atualmente em fase de{" "}
            <strong>desenvolvimento ativo</strong>.
          </p>
          <p>
            Nesta fase, estamos focados em construir a infraestrutura base de
            dados, desenhar e afinar os modelos de visualização interativa do
            mapa (com foco inicial em Angola) e preparar as pipelines de recolha
            de notícias e de alertas globais. Como tal, os dados apresentados
            podem não ser finais e novas funcionalidades continuarão a ser
            lançadas gradualmente.
          </p>
        </div>
      </div>
    </div>
  );
}
