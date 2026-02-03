import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  CheckSquare,
  Plus,
  Search,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Circle,
  PlayCircle,
  FileText
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import CriarEtapaModal from '../components/etapas/CriarEtapaModal';
import TimelineEtapas from '../components/etapas/TimelineEtapas';

const StatusIcon = ({ status }) => {
  const iconProps = { className: "w-5 h-5" };

  switch (status) {
    case 'pendente':
      return <Circle {...iconProps} className="w-5 h-5 text-gray-400" />;
    case 'em_andamento':
      return <PlayCircle {...iconProps} className="w-5 h-5 text-blue-500" />;
    case 'concluida':
      return <CheckCircle {...iconProps} className="w-5 h-5 text-emerald-500" />;
    case 'atrasada':
      return <AlertTriangle {...iconProps} className="w-5 h-5 text-red-500" />;
    default:
      return <Circle {...iconProps} className="w-5 h-5 text-gray-400" />;
  }
};

const EtapaCard = ({ etapa, obra, onEdit, onUpdateStatus }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'pendente': return 'bg-gray-100 text-gray-800';
      case 'em_andamento': return 'bg-blue-100 text-blue-800';
      case 'concluida': return 'bg-emerald-100 text-emerald-800';
      case 'atrasada': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pendente': return 'Pendente';
      case 'em_andamento': return 'Em Andamento';
      case 'concluida': return 'Concluída';
      case 'atrasada': return 'Atrasada';
      default: return 'Pendente';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <StatusIcon status={etapa.status} />
            <div>
              <CardTitle className="text-lg font-bold text-gray-900">
                {etapa.nome_etapa}
              </CardTitle>
              {obra && (
                <p className="text-sm text-gray-500 mt-1">{obra.nome}</p>
              )}
            </div>
          </div>
          <Badge className={getStatusColor(etapa.status)}>
            {getStatusText(etapa.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Progresso</span>
              <span className="font-semibold">{etapa.progresso || 0}%</span>
            </div>
            <Progress value={etapa.progresso || 0} className="h-2" />
          </div>

          {etapa.descricao && (
            <p className="text-sm text-gray-600">{etapa.descricao}</p>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            {etapa.data_inicio_prevista && (
              <div>
                <p className="text-gray-500 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Início Prev.
                </p>
                <p className="font-medium">
                  {format(new Date(etapa.data_inicio_prevista), 'dd/MM/yyyy', { locale: ptBR })}
                </p>
              </div>
            )}
            {etapa.data_fim_prevista && (
              <div>
                <p className="text-gray-500 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Fim Prev.
                </p>
                <p className="font-medium">
                  {format(new Date(etapa.data_fim_prevista), 'dd/MM/yyyy', { locale: ptBR })}
                </p>
              </div>
            )}
          </div>

          {etapa.observacoes && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">{etapa.observacoes}</p>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(etapa)}
              className="flex-1"
            >
              <FileText className="w-4 h-4 mr-2" />
              Editar
            </Button>
            {etapa.status !== 'concluida' && (
              <Select
                value={etapa.status}
                onValueChange={(value) => onUpdateStatus(etapa, value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="concluida">Concluída</SelectItem>
                  <SelectItem value="atrasada">Atrasada</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function EtapasPage() {
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const obraIdFromUrl = urlParams.get('obra');

  const [obras, setObras] = useState([]);
  const [etapas, setEtapas] = useState([]);
  const [filteredEtapas, setFilteredEtapas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEtapa, setEditingEtapa] = useState(null);
  const [selectedObra, setSelectedObra] = useState(obraIdFromUrl || 'all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'timeline'

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [etapas, selectedObra, searchTerm, filterStatus]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [obrasData, etapasData] = await Promise.all([
        base44.entities.Obra.list('-created_date'),
        base44.entities.Etapa.list('-ordem')
      ]);

      setObras(obrasData);
      setEtapas(etapasData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
    setIsLoading(false);
  };

  const applyFilters = () => {
    let filtered = etapas;

    // Filtro por obra
    if (selectedObra !== 'all') {
      filtered = filtered.filter(etapa => etapa.obra_id === selectedObra);
    }

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(etapa =>
        etapa.nome_etapa.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (etapa.descricao && etapa.descricao.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filtro por status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(etapa => etapa.status === filterStatus);
    }

    setFilteredEtapas(filtered);
  };

  const handleCreateEtapa = async (etapaData) => {
    try {
      await base44.entities.Etapa.create(etapaData);
      setShowCreateModal(false);
      loadData();
    } catch (error) {
      console.error('Erro ao criar etapa:', error);
    }
  };

  const handleEditEtapa = async (etapaData) => {
    try {
      await base44.entities.Etapa.update(editingEtapa.id, etapaData);
      setEditingEtapa(null);
      loadData();
    } catch (error) {
      console.error('Erro ao editar etapa:', error);
    }
  };

  const handleUpdateStatus = async (etapa, newStatus) => {
    try {
      const updateData = { ...etapa, status: newStatus };
      if (newStatus === 'concluida') {
        updateData.progresso = 100;
        updateData.data_fim_real = new Date().toISOString().split('T')[0];
      } else if (newStatus === 'em_andamento' && !etapa.data_inicio_real) {
        updateData.data_inicio_real = new Date().toISOString().split('T')[0];
      }

      await base44.entities.Etapa.update(etapa.id, updateData);
      loadData();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const getObraById = (obraId) => {
    return obras.find(obra => obra.id === obraId);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Controle de Etapas</h1>
          <p className="text-gray-600 mt-1">Gerencie o progresso das etapas de cada obra</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'cards' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('cards')}
          >
            Cards
          </Button>
          <Button
            variant={viewMode === 'timeline' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('timeline')}
          >
            Timeline
          </Button>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-orange-600 hover:bg-orange-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Etapa
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar etapas..."
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
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="em_andamento">Em Andamento</SelectItem>
            <SelectItem value="concluida">Concluída</SelectItem>
            <SelectItem value="atrasada">Atrasada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {viewMode === 'cards' ? (
        isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-6"></div>
                  <div className="h-2 bg-gray-200 rounded mb-4"></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredEtapas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEtapas.map(etapa => (
              <EtapaCard
                key={etapa.id}
                etapa={etapa}
                obra={getObraById(etapa.obra_id)}
                onEdit={setEditingEtapa}
                onUpdateStatus={handleUpdateStatus}
              />
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <CheckSquare className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhuma etapa encontrada
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedObra !== 'all' || filterStatus !== 'all'
                ? 'Tente ajustar os filtros de busca'
                : 'Comece criando a primeira etapa'
              }
            </p>
            {(!searchTerm && selectedObra === 'all' && filterStatus === 'all') && (
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeira Etapa
              </Button>
            )}
          </Card>
        )
      ) : (
        <TimelineEtapas
          etapas={filteredEtapas}
          obras={obras}
          isLoading={isLoading}
          onEdit={setEditingEtapa}
          onUpdateStatus={handleUpdateStatus}
        />
      )}

      {/* Modal */}
      <CriarEtapaModal
        isOpen={showCreateModal || editingEtapa !== null}
        onClose={() => {
          setShowCreateModal(false);
          setEditingEtapa(null);
        }}
        onSubmit={editingEtapa ? handleEditEtapa : handleCreateEtapa}
        etapa={editingEtapa}
        obras={obras}
        isEditing={!!editingEtapa}
        obraIdPredefinida={selectedObra !== 'all' ? selectedObra : null}
      />
    </div>
  );
}