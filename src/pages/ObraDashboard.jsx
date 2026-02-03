import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DollarSign,
  User,
  Package,
  AlertCircle,
  TrendingUp,
  Plus,
  ArrowLeft,
  Clock,
  Camera,
  Image as ImageIcon,
  Trash2
} from 'lucide-react';
import { format, differenceInDays, formatDistanceToNowStrict } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import TimelineEtapas from '../components/etapas/TimelineEtapas';
import CriarEtapaModal from '../components/etapas/CriarEtapaModal';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className={`h-4 w-4 text-muted-foreground ${color}`} />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

export default function ObraDashboard() {
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const obraId = urlParams.get('id');

  const [obra, setObra] = useState(null);
  const [lancamentos, setLancamentos] = useState([]);
  const [etapas, setEtapas] = useState([]);
  const [diarias, setDiarias] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [fotos, setFotos] = useState([]);
  const [encarregado, setEncarregado] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showEtapaModal, setShowEtapaModal] = useState(false);
  const [showFotoModal, setShowFotoModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editingEtapa, setEditingEtapa] = useState(null);

  useEffect(() => {
    if (obraId) {
      loadData(obraId);
    }
  }, [obraId]);

  const loadData = async (id) => {
    setIsLoading(true);
    try {
      const [
        obraData,
        lancamentosData,
        etapasData,
        diariasData,
        funcionariosData,
        solicitacoesData,
      ] = await Promise.all([
        base44.entities.Obra.get(id),
        base44.entities.LancamentoFinanceiro.filter({ obra_id: id }, '-data_lancamento'),
        base44.entities.Etapa.filter({ obra_id: id }, 'ordem'),
        base44.entities.Diaria.filter({ obra_id: id }, '-data_trabalho'),
        base44.entities.Funcionario.list(),
        base44.entities.SolicitacaoMaterial.filter({ obra_id: id }, '-data_solicitacao'),
        base44.entities.FotoProgresso.filter({ obra_id: id }, '-created_at'),
      ]);

      setObra(obraData);
      setLancamentos(lancamentosData);
      setEtapas(etapasData);
      setDiarias(diariasData);
      setFuncionarios(funcionariosData);
      setSolicitacoes(solicitacoesData);

      setFotos(fotosData);

      if (obraData.encarregado_id) {
        const encarregadoData = await base44.entities.Funcionario.get(obraData.encarregado_id);
        setEncarregado(encarregadoData);
      }
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard da obra:", error);
    }
    setIsLoading(false);
  };

  const handleSaveEtapa = async (etapaData) => {
    try {
      if (editingEtapa) {
        await base44.entities.Etapa.update(editingEtapa.id, etapaData);
      } else {
        await base44.entities.Etapa.create({ ...etapaData, obra_id: obraId });
      }
      setShowEtapaModal(false);
      setEditingEtapa(null);
      loadData(obraId);
    } catch (error) {
      console.error("Erro ao salvar etapa:", error);
    }
  };

  const handleUpdateStatusEtapa = async (etapa, newStatus) => {
    try {
      await base44.entities.Etapa.update(etapa.id, { ...etapa, status: newStatus });
      loadData(obraId);
    } catch (error) {
      console.error("Erro ao atualizar status da etapa:", error);
    }
  };


  if (isLoading) {
    return <div className="p-6">Carregando dashboard da obra...</div>;
  }

  if (!obra) {
    return <div className="p-6">Obra não encontrada.</div>;
  }

  const totalGasto = lancamentos.filter(l => l.tipo === 'despesa').reduce((sum, l) => sum + l.valor, 0);
  const percentualGasto = obra.valor_total_contrato > 0 ? (totalGasto / obra.valor_total_contrato) * 100 : 0;
  const saldo = obra.valor_total_contrato - totalGasto;

  const etapasConcluidas = etapas.filter(e => e.status === 'concluida').length;
  const progressoEtapas = etapas.length > 0 ? (etapasConcluidas / etapas.length) * 100 : 0;

  const custoMaoDeObra = diarias.reduce((sum, d) => sum + (d.valor_pago || 0), 0);
  const solicitacoesPendentes = solicitacoes.filter(s => s.status === 'pendente' || s.status === 'aprovado').length;

  const handleUploadFoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // For now, since we don't have a real storage implementation, 
      // we'll use a placeholder URL and simulate the creation.
      // In a real scenario, we would use supabase.storage.from('obras').upload(...)
      const placeholderUrl = `https://images.unsplash.com/photo-1541888946425-d81bb19480c5?w=800&q=80`;

      await base44.entities.FotoProgresso.create({
        obra_id: obraId,
        url: placeholderUrl,
        descricao: 'Foto adicionada via dashboard',
        data_foto: new Date().toISOString().split('T')[0]
      });

      loadData(obraId);
    } catch (error) {
      console.error("Erro ao fazer upload da foto:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteFoto = async (id) => {
    if (confirm('Deseja realmente excluir esta foto?')) {
      await base44.entities.FotoProgresso.delete(id);
      loadData(obraId);
    }
  };

  const getTempoRestante = () => {
    if (!obra.previsao_termino) return 'N/A';
    const dataTermino = new Date(obra.previsao_termino);
    const hoje = new Date();

    // Ajustar para o final do dia para incluir o dia atual
    hoje.setHours(0, 0, 0, 0);
    dataTermino.setHours(23, 59, 59, 999);

    const dias = differenceInDays(dataTermino, hoje);

    if (dias < 0) {
      return <span className="text-red-600">Atrasado em {-dias} dia(s)</span>;
    }
    if (dias === 0) {
      return "Termina hoje";
    }
    return formatDistanceToNowStrict(dataTermino, { locale: ptBR, addSuffix: true });
  };


  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Button variant="ghost" onClick={() => window.history.back()} className="mb-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Obras
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">{obra.nome}</h1>
          <p className="text-gray-600 mt-1">{obra.localizacao}</p>
          {encarregado && (
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-700">
              <User className="w-4 h-4 text-emerald-600" />
              <strong>Encarregado:</strong> {encarregado.nome}
            </div>
          )}
        </div>
        <Button className="bg-orange-600 hover:bg-orange-700">
          <Plus className="w-4 h-4 mr-2" />
          Novo Lançamento
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Orçamento Total" value={`R$ ${obra.valor_total_contrato.toLocaleString('pt-BR')}`} icon={DollarSign} color="text-emerald-500" />
        <StatCard title="Total Gasto" value={`R$ ${totalGasto.toLocaleString('pt-BR')}`} icon={TrendingUp} color="text-red-500" />
        <StatCard title="Tempo Restante" value={getTempoRestante()} icon={Clock} color="text-blue-500" />
        <StatCard title="Materiais Pendentes" value={solicitacoesPendentes} icon={Package} color="text-amber-500" />
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Progresso Financeiro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Gasto: R$ {totalGasto.toLocaleString('pt-BR')}</span>
              <span className="font-semibold">Saldo: R$ {saldo.toLocaleString('pt-BR')}</span>
            </div>
            <Progress value={percentualGasto} className="h-3" />
            <div className="flex justify-between text-xs mt-1 text-gray-500">
              <span>0%</span>
              <span>{percentualGasto.toFixed(1)}%</span>
              <span>100%</span>
            </div>
            {percentualGasto >= 80 && (
              <div className="mt-2 flex items-center gap-2 text-sm text-amber-700 bg-amber-100 p-2 rounded-md">
                <AlertCircle className="w-4 h-4" />
                Atenção: Orçamento próximo do limite!
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Progresso Físico (Etapas)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Etapas concluídas: {etapasConcluidas} de {etapas.length}</span>
            </div>
            <Progress value={progressoEtapas} className="h-3" />
            <div className="flex justify-between text-xs mt-1 text-gray-500">
              <span>0%</span>
              <span>{progressoEtapas.toFixed(1)}%</span>
              <span>100%</span>
            </div>
            <p className="text-sm mt-2 text-gray-600">Progresso geral manual: <strong>{obra.progresso_geral}%</strong></p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs com detalhes */}
      <Tabs defaultValue="financeiro">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
          <TabsTrigger value="etapas">Etapas</TabsTrigger>
          <TabsTrigger value="materiais">Materiais</TabsTrigger>
          <TabsTrigger value="equipe">Equipe</TabsTrigger>
          <TabsTrigger value="galeria">Galeria</TabsTrigger>
        </TabsList>
        <TabsContent value="financeiro">
          <Card>
            <CardHeader><CardTitle>Últimos Lançamentos Financeiros</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lancamentos.slice(0, 5).map(lanc => (
                    <TableRow key={lanc.id}>
                      <TableCell>{format(new Date(lanc.data_lancamento), 'dd/MM/yy')}</TableCell>
                      <TableCell>{lanc.descricao}</TableCell>
                      <TableCell>
                        <Badge variant={lanc.tipo === 'despesa' ? 'destructive' : 'default'}>
                          {lanc.tipo}
                        </Badge>
                      </TableCell>
                      <TableCell className={`text-right font-medium ${lanc.tipo === 'despesa' ? 'text-red-600' : 'text-emerald-600'}`}>
                        R$ {lanc.valor.toLocaleString('pt-BR')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="etapas">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Andamento das Etapas</CardTitle>
              <Button size="sm" onClick={() => setShowEtapaModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Etapa
              </Button>
            </CardHeader>
            <CardContent>
              <TimelineEtapas
                etapas={etapas}
                obras={[obra]}
                isLoading={isLoading}
                onEdit={(etapa) => {
                  setEditingEtapa(etapa);
                  setShowEtapaModal(true);
                }}
                onUpdateStatus={handleUpdateStatusEtapa}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="materiais">
          <Card>
            <CardHeader><CardTitle>Solicitações de Materiais</CardTitle></CardHeader>
            <CardContent>
              {solicitacoes.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Quantidade</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Solicitante</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {solicitacoes.map(sol => (
                      <TableRow key={sol.id}>
                        <TableCell className="font-medium">{sol.item_solicitado}</TableCell>
                        <TableCell>{sol.quantidade} {sol.unidade}</TableCell>
                        <TableCell>
                          <Badge variant={sol.status === 'pendente' ? 'destructive' : 'default'}>
                            {sol.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{sol.solicitante}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-gray-500 py-8">Nenhuma solicitação de material registrada.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="equipe">
          <Card>
            <CardHeader><CardTitle>Diárias da Equipe</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <Card className="bg-blue-50">
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-600">Total de Diárias</p>
                      <p className="text-2xl font-bold text-blue-600">{diarias.length}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-purple-50">
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-600">Custo Total</p>
                      <p className="text-2xl font-bold text-purple-600">R$ {custoMaoDeObra.toLocaleString('pt-BR')}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-emerald-50">
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-600">Funcionários</p>
                      <p className="text-2xl font-bold text-emerald-600">{new Set(diarias.map(d => d.funcionario_id)).size}</p>
                    </CardContent>
                  </Card>
                </div>
                {diarias.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Funcionário</TableHead>
                        <TableHead>Horas</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {diarias.slice(0, 10).map(diaria => {
                        const func = funcionarios.find(f => f.id === diaria.funcionario_id);
                        return (
                          <TableRow key={diaria.id}>
                            <TableCell>{format(new Date(diaria.data_trabalho), 'dd/MM/yy')}</TableCell>
                            <TableCell>{func ? func.nome : 'Desconhecido'}</TableCell>
                            <TableCell>{diaria.horas_trabalhadas || 8}h</TableCell>
                            <TableCell className="text-right font-medium">R$ {diaria.valor_pago.toLocaleString('pt-BR')}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center text-gray-500 py-8">Nenhuma diária registrada para esta obra.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="galeria">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Galeria de Progresso</CardTitle>
                <p className="text-sm text-gray-500">Acompanhamento visual da evolução da obra</p>
              </div>
              <div className="flex gap-2">
                <label className="cursor-pointer">
                  <Button variant="outline" asChild disabled={isUploading}>
                    <div>
                      {isUploading ? 'Enviando...' : <><Camera className="w-4 h-4 mr-2" /> Adicionar Foto</>}
                    </div>
                  </Button>
                  <input type="file" accept="image/*" className="hidden" onChange={handleUploadFoto} disabled={isUploading} />
                </label>
              </div>
            </CardHeader>
            <CardContent>
              {fotos.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {fotos.map(foto => (
                    <div key={foto.id} className="group relative aspect-square rounded-xl overflow-hidden border border-gray-200">
                      <img
                        src={foto.url}
                        alt={foto.descricao}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                        <p className="text-white text-xs font-semibold mb-1 truncate">{foto.descricao}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-white/80 text-[10px]">{format(new Date(foto.data_foto), 'dd/MM/yyyy')}</span>
                          <Button
                            size="icon"
                            variant="destructive"
                            className="h-7 w-7"
                            onClick={() => handleDeleteFoto(foto.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-xl">
                  <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Nenhuma foto registrada nesta obra.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CriarEtapaModal
        isOpen={showEtapaModal}
        onClose={() => {
          setShowEtapaModal(false);
          setEditingEtapa(null);
        }}
        onSubmit={handleSaveEtapa}
        etapa={editingEtapa}
        isEditing={!!editingEtapa}
        obras={[obra]}
        obraIdPredefinida={obraId}
      />
    </div>
  );
}