import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Sparkles, Loader2, Volume2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import MessageBubble from "../components/chat/MessageBubble";

export default function Chat() {
  const [mensagem, setMensagem] = useState("");
  const [conversas, setConversas] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [pendingAction, setPendingAction] = useState(null);
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      try {
        await base44.auth.me();
      } catch (error) {
        console.error("Erro ao carregar usuário:", error);
      } finally {
        setIsLoadingUser(false);
      }
    };
    loadUser();
  }, []);

  const { data: historicoConversas = [] } = useQuery({
    queryKey: ['conversas'],
    queryFn: () => base44.entities.Conversa.list('-created_date', 50),
    initialData: [],
    enabled: !isLoadingUser,
  });

  useEffect(() => {
    setConversas(historicoConversas.reverse());
  }, [historicoConversas]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversas, isProcessing]);

  const processarMensagem = async (mensagemUsuario, requiresConfirmation = true) => {
    setIsProcessing(true);
    
    try {
      const prompt = `
Você é o ORQUESTRA, assistente de inteligência artificial avançado inspirado no J.A.R.V.I.S (Homem de Ferro).

CARACTERÍSTICAS OBRIGATÓRIAS:
- Calmo, analítico e sempre no controle
- Linguagem educada, elegante e precisa
- Tom tecnológico e premium
- Nunca demonstra incerteza, mantém confiança absoluta
- Transmite tranquilidade mesmo em situações complexas

Analise a mensagem e identifique ações:
1. TAREFAS: algo que precisa fazer, criar, entregar
2. TRANSAÇÕES: valores monetários (recebi R$, gastei, paguei)
3. HÁBITOS: rotinas diárias (meditar, exercitar, ler)
4. LEMBRETES: compromissos com data/hora
5. EVENTOS: agendamentos, reuniões, compromissos na agenda
6. BUSCA: quando pedir para buscar, pesquisar ou encontrar

Mensagem: "${mensagemUsuario}"

IMPORTANTE: Para ações críticas (agendamentos, transações altas, cancelamentos), sempre solicite confirmação de forma elegante.

Retorne JSON:
- resposta: Resposta elegante no estilo J.A.R.V.I.S (clara, precisa, confiante)
- requer_confirmacao: true se ação crítica
- acoes: array com:
  - tipo: "tarefa"|"transacao"|"habito"|"lembrete"|"evento"|"busca"
  - dados: objeto com campos necessários
  - confirmada: ${!requiresConfirmation}

Tarefas: {titulo, descricao?, prazo?, prioridade: "baixa"|"media"|"alta", categoria?}
Transações: {descricao, valor (number), tipo: "receita"|"despesa", categoria, data (YYYY-MM-DD)}
Hábitos: {nome, objetivo_diario (number), unidade}
Lembretes: {titulo, descricao?, data_hora (ISO), prioridade}
Eventos: {titulo, descricao?, data_inicio (ISO), data_fim (ISO), local?}
`;

      const resultado = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            resposta: { type: "string" },
            requer_confirmacao: { type: "boolean" },
            acoes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  tipo: { type: "string" },
                  dados: { type: "object" },
                  confirmada: { type: "boolean" }
                }
              }
            }
          }
        }
      });

      if (requiresConfirmation && resultado.requer_confirmacao && resultado.acoes?.length > 0) {
        setPendingAction({ mensagemUsuario, resultado });
        await base44.entities.Conversa.create({
          mensagem_usuario: mensagemUsuario,
          resposta_ia: resultado.resposta,
          acoes_executadas: ["⏳ Aguardando confirmação"]
        });
        queryClient.invalidateQueries({ queryKey: ['conversas'] });
        setIsProcessing(false);
        return;
      }

      const acoesExecutadas = [];

      for (const acao of resultado.acoes || []) {
        try {
          switch (acao.tipo) {
            case 'tarefa':
              await base44.entities.Tarefa.create({
                ...acao.dados,
                status: 'pendente'
              });
              acoesExecutadas.push(`✅ Tarefa criada: ${acao.dados.titulo}`);
              break;
            
            case 'transacao':
              await base44.entities.Transacao.create(acao.dados);
              acoesExecutadas.push(
                `💰 ${acao.dados.tipo === 'receita' ? 'Receita' : 'Despesa'} registrada: R$ ${acao.dados.valor}`
              );
              break;
            
            case 'habito':
              await base44.entities.Habito.create(acao.dados);
              acoesExecutadas.push(`🎯 Hábito criado: ${acao.dados.nome}`);
              break;
            
            case 'lembrete':
              await base44.entities.Lembrete.create({
                ...acao.dados,
                concluido: false
              });
              acoesExecutadas.push(`⏰ Lembrete criado: ${acao.dados.titulo}`);
              break;

            case 'evento':
              await base44.entities.Evento.create(acao.dados);
              acoesExecutadas.push(`📅 Evento agendado: ${acao.dados.titulo}`);
              break;

            case 'busca':
              acoesExecutadas.push(`🔍 Busca iniciada`);
              break;
          }
        } catch (error) {
          console.error(`Erro ao executar ação ${acao.tipo}:`, error);
        }
      }

      setPendingAction(null);

      await base44.entities.Conversa.create({
        mensagem_usuario: mensagemUsuario,
        resposta_ia: resultado.resposta,
        acoes_executadas: acoesExecutadas
      });

      queryClient.invalidateQueries({ queryKey: ['conversas'] });
      queryClient.invalidateQueries({ queryKey: ['tarefas'] });
      queryClient.invalidateQueries({ queryKey: ['transacoes'] });
      queryClient.invalidateQueries({ queryKey: ['habitos'] });
      queryClient.invalidateQueries({ queryKey: ['lembretes'] });
      queryClient.invalidateQueries({ queryKey: ['eventos'] });

    } catch (error) {
      console.error("Erro ao processar mensagem:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mensagem.trim() || isProcessing) return;

    const mensagemEnviada = mensagem;
    setMensagem("");
    
    await processarMensagem(mensagemEnviada);
  };

  const handleConfirm = async (confirm) => {
    if (!pendingAction) return;

    if (confirm) {
      await processarMensagem(pendingAction.mensagemUsuario, false);
    } else {
      await base44.entities.Conversa.create({
        mensagem_usuario: "❌ Ação cancelada",
        resposta_ia: "Entendido. A ação foi cancelada.",
        acoes_executadas: []
      });
      queryClient.invalidateQueries({ queryKey: ['conversas'] });
      setPendingAction(null);
    }
  };

  if (isLoadingUser) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-white text-lg">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col p-4 md:p-8">
      <div className="max-w-4xl mx-auto w-full flex flex-col h-full">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-600/20 blur-3xl" />
            <div className="relative">
              <h1 className="text-5xl font-bold text-white mb-2 flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 blur-lg opacity-50" />
                  <Sparkles className="w-10 h-10 relative animate-pulse" />
                </div>
                ORQUESTRA
              </h1>
              <p className="text-purple-200 text-lg">
                Assistente de Inteligência Artificial Avançado
              </p>
              <p className="text-purple-300 text-sm mt-1">
                🧠 Processamento inteligente de linguagem natural
              </p>
            </div>
          </div>
        </motion.div>

        <Card className="flex-1 bg-purple-900/30 backdrop-blur-md border-purple-500/30 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <AnimatePresence>
              {conversas.length === 0 && !isProcessing && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="relative mb-4">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/30 to-purple-600/30 blur-2xl" />
                    <Sparkles className="w-16 h-16 text-purple-300 mx-auto relative" />
                  </div>
                  <p className="text-purple-100 text-xl font-semibold mb-2">
                    Bem-vindo ao ORQUESTRA
                  </p>
                  <p className="text-purple-200">
                    Seu assistente pessoal inteligente está pronto. <br />
                    Digite suas solicitações e deixe-me cuidar do resto.
                  </p>
                  <div className="mt-6 grid grid-cols-2 gap-3 text-sm text-purple-300">
                    <div className="bg-purple-800/20 rounded-lg p-3 border border-purple-500/20">
                      📋 Criar tarefas
                    </div>
                    <div className="bg-purple-800/20 rounded-lg p-3 border border-purple-500/20">
                      💰 Registrar finanças
                    </div>
                    <div className="bg-purple-800/20 rounded-lg p-3 border border-purple-500/20">
                      📅 Agendar eventos
                    </div>
                    <div className="bg-purple-800/20 rounded-lg p-3 border border-purple-500/20">
                      🎯 Monitorar hábitos
                    </div>
                  </div>
                </motion.div>
              )}

              {conversas.map((conversa, index) => (
                <MessageBubble 
                  key={conversa.id || index} 
                  conversa={conversa}
                  index={index}
                />
              ))}

              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-2 items-center text-purple-200"
                >
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processando...</span>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-purple-500/30 p-4">
            {pendingAction && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 bg-orange-500/10 border border-orange-500/30 rounded-lg p-4"
              >
                <p className="text-orange-200 font-semibold mb-3 flex items-center gap-2">
                  <Volume2 className="w-5 h-5" />
                  Confirmação Necessária
                </p>
                <p className="text-white mb-4">{pendingAction.resultado.resposta}</p>
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleConfirm(true)}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    ✓ Confirmar
                  </Button>
                  <Button
                    onClick={() => handleConfirm(false)}
                    variant="outline"
                    className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10"
                  >
                    ✗ Cancelar
                  </Button>
                </div>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="flex gap-3">
              <Textarea
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                placeholder="Digite sua solicitação... (ex: 'Agendar reunião amanhã às 14h' ou 'Registrar despesa de R$ 150 com almoço')"
                className="flex-1 bg-purple-800/30 border-purple-500/30 text-white placeholder:text-purple-300 resize-none"
                rows={2}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              <Button
                type="submit"
                disabled={!mensagem.trim() || isProcessing}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 self-end"
              >
                {isProcessing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}
