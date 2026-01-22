import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Obra } from '@/entities/Obra';
import { SolicitacaoMaterial } from '@/entities/SolicitacaoMaterial';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  CheckCircle,
  Clock,
  ShoppingCart
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import CriarSolicitacaoMaterialModal from '../components/materiais/CriarSolicitacaoMaterialModal';

const MaterialCard = ({ solicitacao, obra, onUpdateStatus }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      case 'aprovado': return 'bg-blue-100 text-blue-800';
      case 'comprado': return 'bg-purple-100 text-purple-800';
      case 'entregue': return 'bg-emerald-100 text-emerald-800';
      case 'cancelado': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgenciaColor = (urgencia) => {
    switch (urgencia) {
      case 'urgente': return 'bg-red-100 text-red-800';
      case 'alta': return 'bg-orange-100 text-orange-800';
      case 'media': return 'bg-blue-100 text-blue-800';
      case 'baixa': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const StatusIcon = ({ status }) => {
    switch (status) {
      case 'pendente': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'aprovado': return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case 'comprado': return <ShoppingCart className="w-4 h-4 text-purple-600" />;
      case 'entregue': return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case 'cancelado': return <AlertTriangle className="w-4 h-4 text-gray-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  // Verificar se está atrasado (mais de 48h para entregar)
  const diasAtrasado = solicitacao.data_necessaria 
    ? differenceInDays(new Date(), new Date(solicitacao.data_necessaria))
    : 0;
  const isAtrasado = diasAtrasado > 0 && solicitacao.status !== 'entregue' && solicitacao.status !== 'cancelado';

  return (
    <Card className={`hover:shadow-lg transition-all duration-300 ${isAtrasado ? 'border-red-300 bg-red-50' : ''}`}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <StatusIcon status={solicitacao.status} />
              {solicitacao.item_solicitado}
            </CardTitle>
            {obra && (
              <p className="text-sm text-gray-500 mt-1">{obra.nome}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Badge className={getStatusColor(solicitacao.status)}>
              {solicitacao.status}
            </Badge>
            <Badge className={getUrgenciaColor(solicitacao.urgencia)}>
              {solicitacao.urgencia}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Quantidade</p>
              <p className="font-medium">{solicitacao.quantidade} {solicitacao.unidade}</p>
            </div>
            <div>
              <p className="text-gray-500">Solicitante</p>
              <p className="font-medium">{solicitacao.solicitante}</p>
            </div>
          </div>

          {solicitacao.data_necessaria && (
            <div className={`p-3 rounded-lg ${isAtrasado ? 'bg-red-100' : 'bg-gray-50'}`}>
              <p className="text-sm">
                <span className={isAtrasado ? 'text-red-700 font-medium' : 'text-gray-600'}>
                  Data necessária: {format(new Date(solicitacao.data_necessaria), 'dd/MM/yyyy', { locale: ptBR })}
                </span>
              </p>
              {isAtrasado && (
                <p className="text-sm text-red-700 font-medium mt-1">
                  <AlertTriangle className="w-4 h-4 inline mr-1" />
                  Atrasado há {diasAtrasado} dias
                </p>
              )}
            </div>
          )}

          {solicitacao.observacoes && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">{solicitacao.observacoes}</p>
            </div>
          )}

          {solicitacao.valor_estimado && (
            <div>
              <p className="text-sm text-gray-500">Valor Estimado</p>
              <p className="text-lg font-bold text-emerald-600">
                R$ {solicitacao.valor_estimado.toFixed(2)}
              </p>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Select
              value={solicitacao.status}
              onValueChange={(value) => onUpdateStatus(solicitacao, value)}
            >
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="aprovado">Aprovado</SelectItem>
                <SelectItem value="comprado">Comprado</SelectItem>
                <SelectItem value="entregue">Entregue</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function MateriaisPage() {
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const obraIdFromUrl = urlParams.get('obra');

  const [obras, setObras] = useState([]);
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [filteredSolicitacoes, setFilteredSolicitacoes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedObra, setSelectedObra] = useState(obraIdFromUrl || 'all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('todas');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [solicitacoes, selectedObra, searchTerm, activeTab]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [obrasData, solicitacoesData] = await Promise.all([
        Obra.list('-created_date'),
        SolicitacaoMaterial.list('-data_solicitacao')
      ]);
      
      setObras(obrasData);
      setSolicitacoes(solicitacoesData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
    setIsLoading(false);
  };

  const applyFilters = () => {
    let filtered = solicitacoes;

    // Filtro por obra
    if (selectedObra !== 'all') {
      filtered = filtered.filter(solicitacao => solicitacao.obra_id === selectedObra);
    }

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(solicitacao =>
        solicitacao.item_solicitado.toLowerCase().includes(searchTerm.toLowerCase()) ||
        solicitacao.solicitante.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por tab
    if (activeTab !== 'todas') {
      filtered = filtered.filter(solicitacao => solicitacao.status === activeTab);
    }

    setFilteredSolicitacoes(filtered);
  };

  const handleCreateSolicitacao = async (solicitacaoData) => {
    try {
      await SolicitacaoMaterial.create(solicitacaoData);
      setShowCreateModal(false);
      loadData();
    } catch (error) {
      console.error('Erro ao criar solicitação:', error);
    }
  };

  const handleUpdateStatus = async (solicitacao, newStatus) => {
    try {
      await SolicitacaoMaterial.update(solicitacao.id, { ...solicitacao, status: newStatus });
      loadData();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const getTabCounts = () => {
    return {
      todas: solicitacoes.length,
      pendente: solicitacoes.filter(s => s.status === 'pendente').length,
      aprovado: solicitacoes.filter(s => s.status === 'aprovado').length,
      comprado: solicitacoes.filter(s => s.status === 'comprado').length,
      entregue: solicitacoes.filter(s => s.status === 'entregue').length
    };
  };

  const tabCounts = getTabCounts();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Controle de Materiais</h1>
          <p className="text-gray-600 mt-1">Gerencie solicitações de materiais das obras</p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Solicitação
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar por item ou solicitante..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedObra} onValueChange={setSelectedObra}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por obra" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as obras</SelectItem>
            {obras.map(obra => (
              <SelectItem key={obra.id} value={obra.id}>
                {obra.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="todas">
            Todas ({tabCounts.todas})
          </TabsTrigger>
          <TabsTrigger value="pendente">
            Pendentes ({tabCounts.pendente})
          </TabsTrigger>
          <TabsTrigger value="aprovado">
            Aprovadas ({tabCounts.aprovado})
          </TabsTrigger>
          <TabsTrigger value="comprado">
            Compradas ({tabCounts.comprado})
          </TabsTrigger>
          <TabsTrigger value="entregue">
            Entregues ({tabCounts.entregue})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-6"></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredSolicitacoes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSolicitacoes.map(solicitacao => (
                <MaterialCard
                  key={solicitacao.id}
                  solicitacao={solicitacao}
                  obra={obras.find(o => o.id === solicitacao.obra_id)}
                  onUpdateStatus={handleUpdateStatus}
                />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm || selectedObra !== 'all' 
                  ? 'Nenhuma solicitação encontrada' 
                  : 'Nenhuma solicitação de material'
                }
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || selectedObra !== 'all'
                  ? 'Tente ajustar os filtros de busca'
                  : 'Comece criando a primeira solicitação'
                }
              </p>
              {(!searchTerm && selectedObra === 'all') && (
                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Primeira Solicitação
                </Button>
              )}
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Modal */}
      <CriarSolicitacaoMaterialModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateSolicitacao}
        obras={obras}
        obraIdPredefinida={selectedObra !== 'all' ? selectedObra : null}
      />
    </div>
  );
}