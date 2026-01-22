import React, { useState, useEffect } from 'react';
import { Funcionario } from '@/entities/Funcionario';
import { Diaria } from '@/entities/Diaria';
import { Obra } from '@/entities/Obra';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  Plus,
  Search,
  Phone,
  DollarSign,
  Calendar,
  UserCheck,
  FileText
} from 'lucide-react';
import { startOfMonth, endOfMonth } from 'date-fns';
import CriarFuncionarioModal from '../components/equipe/CriarFuncionarioModal';
import CriarDiariaModal from '../components/equipe/CriarDiariaModal';
import RelatorioEquipe from '../components/equipe/RelatorioEquipe';

const FuncionarioCard = ({ funcionario, diarias = [], onEdit, onRegistrarDiaria }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'ativo': return 'bg-emerald-100 text-emerald-800';
      case 'inativo': return 'bg-gray-100 text-gray-800';
      case 'afastado': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Calcular diárias do mês atual
  const inicioMes = startOfMonth(new Date());
  const fimMes = endOfMonth(new Date());
  
  const diariasDoMes = diarias.filter(d => {
    const dataTrabalho = new Date(d.data_trabalho);
    return d.funcionario_id === funcionario.id && 
           dataTrabalho >= inicioMes && 
           dataTrabalho <= fimMes;
  });

  const diasTrabalhados = diariasDoMes.length;
  const valorTotal = diariasDoMes.reduce((sum, d) => sum + (d.valor_pago || 0), 0);

  return (
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
              <span className="text-lg font-bold text-emerald-700">
                {funcionario.nome.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-gray-900">
                {funcionario.nome}
              </CardTitle>
              <p className="text-sm text-gray-600">{funcionario.funcao}</p>
            </div>
          </div>
          <Badge className={getStatusColor(funcionario.status)}>
            {funcionario.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Diária</p>
                <p className="text-sm font-bold text-emerald-600">
                  R$ {funcionario.valor_diaria?.toFixed(2)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">WhatsApp</p>
                <p className="text-sm font-medium">{funcionario.telefone}</p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Este Mês</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Dias</p>
                <p className="text-lg font-bold text-blue-600">{diasTrabalhados}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Total</p>
                <p className="text-lg font-bold text-emerald-600">
                  R$ {valorTotal.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {funcionario.especialidades && funcionario.especialidades.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-2">Especialidades</p>
              <div className="flex flex-wrap gap-1">
                {funcionario.especialidades.map((esp, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {esp}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(funcionario)}
              className="flex-1"
            >
              <FileText className="w-4 h-4 mr-2" />
              Editar
            </Button>
            <Button
              size="sm"
              onClick={() => onRegistrarDiaria(funcionario)}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <UserCheck className="w-4 h-4 mr-2" />
              Diária
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function EquipePage() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [diarias, setDiarias] = useState([]);
  const [obras, setObras] = useState([]);
  const [filteredFuncionarios, setFilteredFuncionarios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDiariaModal, setShowDiariaModal] = useState(false);
  const [showRelatorio, setShowRelatorio] = useState(false);
  const [editingFuncionario, setEditingFuncionario] = useState(null);
  const [funcionarioDiaria, setFuncionarioDiaria] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeTab, setActiveTab] = useState('funcionarios');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [funcionarios, searchTerm, filterStatus]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [funcionariosData, diariasData, obrasData] = await Promise.all([
        Funcionario.list('-created_date'),
        Diaria.list('-data_trabalho'),
        Obra.list('-created_date')
      ]);
      
      setFuncionarios(funcionariosData);
      setDiarias(diariasData);
      setObras(obrasData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
    setIsLoading(false);
  };

  const applyFilters = () => {
    let filtered = funcionarios;

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(funcionario =>
        funcionario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        funcionario.funcao.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(funcionario => funcionario.status === filterStatus);
    }

    setFilteredFuncionarios(filtered);
  };

  const handleCreateFuncionario = async (funcionarioData) => {
    try {
      await Funcionario.create(funcionarioData);
      setShowCreateModal(false);
      loadData();
    } catch (error) {
      console.error('Erro ao criar funcionário:', error);
    }
  };

  const handleEditFuncionario = async (funcionarioData) => {
    try {
      await Funcionario.update(editingFuncionario.id, funcionarioData);
      setEditingFuncionario(null);
      loadData();
    } catch (error) {
      console.error('Erro ao editar funcionário:', error);
    }
  };

  const handleRegistrarDiaria = async (diariaData) => {
    try {
      await Diaria.create(diariaData);
      setShowDiariaModal(false);
      setFuncionarioDiaria(null);
      loadData();
    } catch (error) {
      console.error('Erro ao registrar diária:', error);
    }
  };

  const funcionariosAtivos = funcionarios.filter(f => f.status === 'ativo').length;
  const totalDiariasHoje = diarias.filter(d => {
    const hoje = new Date().toISOString().split('T')[0];
    return d.data_trabalho === hoje;
  }).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Equipe e Diárias</h1>
          <p className="text-gray-600 mt-1">Gerencie sua equipe e registre as diárias</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowRelatorio(true)}
          >
            <FileText className="w-4 h-4 mr-2" />
            Relatório
          </Button>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-orange-600 hover:bg-orange-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Funcionário
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Funcionários Ativos</p>
                <p className="text-3xl font-bold text-emerald-600">{funcionariosAtivos}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Diárias Hoje</p>
                <p className="text-3xl font-bold text-blue-600">{totalDiariasHoje}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Custo Mensal</p>
                <p className="text-3xl font-bold text-purple-600">
                  R$ {diarias.reduce((sum, d) => {
                    const dataTrabalho = new Date(d.data_trabalho);
                    const inicioMes = startOfMonth(new Date());
                    const fimMes = endOfMonth(new Date());
                    
                    if (dataTrabalho >= inicioMes && dataTrabalho <= fimMes) {
                      return sum + (d.valor_pago || 0);
                    }
                    return sum;
                  }, 0).toFixed(2)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="funcionarios">Funcionários</TabsTrigger>
          <TabsTrigger value="diarias">Histórico de Diárias</TabsTrigger>
        </TabsList>

        <TabsContent value="funcionarios" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar funcionários por nome ou função..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
                <SelectItem value="afastado">Afastado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Funcionários Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                      <div>
                        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                      </div>
                    </div>
                    <div className="h-20 bg-gray-200 rounded mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredFuncionarios.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFuncionarios.map(funcionario => (
                <FuncionarioCard
                  key={funcionario.id}
                  funcionario={funcionario}
                  diarias={diarias}
                  onEdit={setEditingFuncionario}
                  onRegistrarDiaria={(func) => {
                    setFuncionarioDiaria(func);
                    setShowDiariaModal(true);
                  }}
                />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Nenhum funcionário encontrado' 
                  : 'Nenhum funcionário cadastrado'
                }
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || filterStatus !== 'all'
                  ? 'Tente ajustar os filtros de busca'
                  : 'Comece cadastrando o primeiro funcionário'
                }
              </p>
              {(!searchTerm && filterStatus === 'all') && (
                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Cadastrar Primeiro Funcionário
                </Button>
              )}
            </Card>
          )}
        </TabsContent>

        <TabsContent value="diarias" className="space-y-6">
          <RelatorioEquipe 
            diarias={diarias}
            funcionarios={funcionarios}
            obras={obras}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <CriarFuncionarioModal
        isOpen={showCreateModal || editingFuncionario !== null}
        onClose={() => {
          setShowCreateModal(false);
          setEditingFuncionario(null);
        }}
        onSubmit={editingFuncionario ? handleEditFuncionario : handleCreateFuncionario}
        funcionario={editingFuncionario}
        isEditing={!!editingFuncionario}
      />

      <CriarDiariaModal
        isOpen={showDiariaModal}
        onClose={() => {
          setShowDiariaModal(false);
          setFuncionarioDiaria(null);
        }}
        onSubmit={handleRegistrarDiaria}
        funcionario={funcionarioDiaria}
        obras={obras}
      />
    </div>
  );
}