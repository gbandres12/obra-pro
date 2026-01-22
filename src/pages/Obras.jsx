import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Building2,
  Plus,
  Search,
  Filter,
  MapPin,
  Ruler,
} from 'lucide-react';
import CriarObraModal from '../components/obras/CriarObraModal';

const ObraCard = ({ obra }) => {
  const getStatusColor = (situacao) => {
    switch (situacao) {
      case 'ativa': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'finalizada': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'arquivada': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTipoColor = (tipo) => {
    switch (tipo) {
      case 'civil': return 'bg-orange-100 text-orange-800';
      case 'metalica': return 'bg-purple-100 text-purple-800';
      case 'mista': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Link to={createPageUrl(`ObraDashboard?id=${obra.id}`)}>
      <Card className="hover:shadow-lg hover:border-emerald-400 transition-all duration-300 group">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                {obra.nome}
              </CardTitle>
              <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                <MapPin className="w-4 h-4" />
                {obra.localizacao}
              </div>
            </div>
            <Badge className={getStatusColor(obra.situacao)}>
              {obra.situacao}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Progresso</span>
                <span className="font-semibold">{obra.progresso_geral || 0}%</span>
              </div>
              <Progress value={obra.progresso_geral || 0} className="h-2" />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t">
               <div className="flex items-center gap-2">
                 <Ruler className="w-4 h-4 text-gray-400" />
                 <div>
                   <p className="text-xs text-gray-500">Área</p>
                   <p className="text-sm font-medium">{obra.area_construida}m²</p>
                 </div>
               </div>
               <div>
                 <p className="text-xs text-gray-500 mb-1">Tipo</p>
                 <Badge variant="outline" className={getTipoColor(obra.tipo_obra)}>
                   {obra.tipo_obra}
                 </Badge>
               </div>
             </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default function ObrasPage() {
  const [obras, setObras] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [filteredObras, setFilteredObras] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingObra, setEditingObra] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('all');
  const [activeTab, setActiveTab] = useState('ativas');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [obras, searchTerm, filterTipo, activeTab]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [obrasData, funcionariosData] = await Promise.all([
        base44.entities.Obra.list('-created_date'),
        base44.entities.Funcionario.list('nome')
      ]);
      setObras(obrasData);
      setFuncionarios(funcionariosData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
    setIsLoading(false);
  };
  
  const applyFilters = () => {
    let filtered = obras;

    // Filtro por aba (status)
    if (activeTab !== 'todas') {
      const statusMap = {
        'ativas': 'ativa',
        'finalizadas': 'finalizada',
        'arquivadas': 'arquivada'
      };
      filtered = filtered.filter(obra => obra.situacao === statusMap[activeTab]);
    }

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(obra =>
        obra.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        obra.localizacao.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por tipo
    if (filterTipo !== 'all') {
      filtered = filtered.filter(obra => obra.tipo_obra === filterTipo);
    }

    setFilteredObras(filtered);
  };

  const handleSaveObra = async (obraData) => {
    try {
      if (editingObra) {
        await base44.entities.Obra.update(editingObra.id, obraData);
      } else {
        await base44.entities.Obra.create(obraData);
      }
      setShowCreateModal(false);
      setEditingObra(null);
      loadData();
    } catch (error) {
      console.error('Erro ao salvar obra:', error);
    }
  };

  const getTabCounts = () => {
    return {
      ativas: obras.filter(o => o.situacao === 'ativa').length,
      finalizadas: obras.filter(o => o.situacao === 'finalizada').length,
      arquivadas: obras.filter(o => o.situacao === 'arquivada').length,
      todas: obras.length
    };
  };

  const tabCounts = getTabCounts();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Obras</h1>
          <p className="text-gray-600 mt-1">Gerencie todas as suas obras de construção</p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Obra
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar obras por nome ou localização..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterTipo} onValueChange={setFilterTipo}>
          <SelectTrigger className="w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="civil">Civil</SelectItem>
            <SelectItem value="metalica">Metálica</SelectItem>
            <SelectItem value="mista">Mista</SelectItem>
            <SelectItem value="outro">Outro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="ativas" className="relative">
            Ativas
            {tabCounts.ativas > 0 && (
              <Badge className="ml-2 bg-emerald-500 text-white text-xs">
                {tabCounts.ativas}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="finalizadas" className="relative">
            Finalizadas
            {tabCounts.finalizadas > 0 && (
              <Badge className="ml-2 bg-blue-500 text-white text-xs">
                {tabCounts.finalizadas}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="arquivadas" className="relative">
            Arquivadas
            {tabCounts.arquivadas > 0 && (
              <Badge className="ml-2 bg-gray-500 text-white text-xs">
                {tabCounts.arquivadas}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="todas">
            Todas ({tabCounts.todas})
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
                    <div className="h-2 bg-gray-200 rounded mb-4"></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredObras.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredObras.map(obra => (
                <ObraCard
                  key={obra.id}
                  obra={obra}
                />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Building2 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm || filterTipo !== 'all' 
                  ? 'Nenhuma obra encontrada' 
                  : 'Nenhuma obra encontrada'
                }
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || filterTipo !== 'all'
                  ? 'Tente ajustar os filtros de busca'
                  : 'Comece criando sua primeira obra'
                }
              </p>
              {(!searchTerm && filterTipo === 'all') && (
                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeira Obra
                </Button>
              )}
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <CriarObraModal
        isOpen={showCreateModal || editingObra !== null}
        onClose={() => {
          setShowCreateModal(false);
          setEditingObra(null);
        }}
        onSubmit={handleSaveObra}
        obra={editingObra}
        isEditing={!!editingObra}
        funcionarios={funcionarios}
      />
    </div>
  );
}