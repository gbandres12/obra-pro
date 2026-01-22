import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  CheckSquare,
  Package,
  Plus,
  TrendingUp,
  AlertTriangle,
  DollarSign
} from 'lucide-react';
import { startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const StatusCard = ({ title, value, icon: Icon, color, trend, onClick }) => (
  <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={onClick}>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {trend && (
            <div className="flex items-center mt-2 text-sm">
              <TrendingUp className="w-4 h-4 mr-1 text-emerald-500" />
              <span className="text-emerald-600 font-medium">{trend}</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const ObraCard = ({ obra, etapas = [], materiais = [] }) => {
  const etapasObra = etapas.filter(e => e.obra_id === obra.id);
  const materiaisObra = materiais.filter(m => m.obra_id === obra.id);
  const materiaisPendentes = materiaisObra.filter(m => m.status === 'pendente').length;
  
  const getStatusColor = (situacao) => {
    switch (situacao) {
      case 'ativa': return 'bg-emerald-100 text-emerald-800';
      case 'finalizada': return 'bg-blue-100 text-blue-800';
      case 'arquivada': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-bold text-gray-900">{obra.nome}</CardTitle>
            <p className="text-sm text-gray-500 mt-1">{obra.localizacao}</p>
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
              <span className="text-gray-600">Progresso Geral</span>
              <span className="font-semibold text-gray-900">{obra.progresso_geral}%</span>
            </div>
            <Progress value={obra.progresso_geral} className="h-2" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">Área</p>
              <p className="text-sm font-medium">{obra.area_construida}m²</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Tipo</p>
              <p className="text-sm font-medium capitalize">{obra.tipo_obra}</p>
            </div>
          </div>

          {materiaisPendentes > 0 && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span className="text-sm text-amber-800">
                {materiaisPendentes} material{materiaisPendentes > 1 ? 'ais' : ''} pendente{materiaisPendentes > 1 ? 's' : ''}
              </span>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Link to={createPageUrl(`ObraDashboard?id=${obra.id}`)} className="w-full">
              <Button variant="default" size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700">
                <Building2 className="w-4 h-4 mr-2" />
                Ver Detalhes
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function Dashboard() {
  const [obras, setObras] = useState([]);
  const [etapas, setEtapas] = useState([]);
  const [materiais, setMateriais] = useState([]);
  const [diarias, setDiarias] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Carregar apenas obras primeiro
      const obrasData = await base44.entities.Obra.list('-created_date', 50);
      setObras(obrasData);
      
      // Carregar outros dados em sequência para evitar timeout
      const obrasAtivas = obrasData.filter(o => o.situacao === 'ativa');
      if (obrasAtivas.length > 0) {
        const [etapasData, materiaisData, diariasData] = await Promise.all([
          base44.entities.Etapa.list('-created_date', 100),
          base44.entities.SolicitacaoMaterial.filter({ status: 'pendente' }, '-created_date', 50),
          base44.entities.Diaria.list('-data_trabalho', 100)
        ]);
        
        setEtapas(etapasData);
        setMateriais(materiaisData);
        setDiarias(diariasData);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      // Definir estados vazios em caso de erro
      setObras([]);
      setEtapas([]);
      setMateriais([]);
      setDiarias([]);
    }
    setIsLoading(false);
  };

  const obrasAtivas = obras.filter(o => o.situacao === 'ativa');
  const materiaisPendentes = materiais.filter(m => m.status === 'pendente');
  const etapasPendentes = etapas.filter(e => e.status !== 'concluida');

  // Calcular diárias da semana
  const inicioSemana = startOfWeek(new Date(), { locale: ptBR });
  const fimSemana = endOfWeek(new Date(), { locale: ptBR });
  const diariasSemanais = diarias.filter(d => {
    const dataTrabalho = new Date(d.data_trabalho);
    return dataTrabalho >= inicioSemana && dataTrabalho <= fimSemana;
  });
  const valorSemanal = diariasSemanais.reduce((sum, d) => sum + (d.valor_pago || 0), 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Visão geral das suas obras</p>
        </div>
        <Link to={createPageUrl('Obras')}>
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="w-4 h-4 mr-2" />
            Nova Obra
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatusCard
          title="Obras Ativas"
          value={obrasAtivas.length}
          icon={Building2}
          color="bg-emerald-500"
          trend="+2 este mês"
          onClick={() => window.location.href = createPageUrl('Obras')}
        />
        <StatusCard
          title="Etapas Pendentes"
          value={etapasPendentes.length}
          icon={CheckSquare}
          color="bg-blue-500"
          onClick={() => window.location.href = createPageUrl('Etapas')}
        />
        <StatusCard
          title="Materiais Pendentes"
          value={materiaisPendentes.length}
          icon={Package}
          color="bg-amber-500"
          onClick={() => window.location.href = createPageUrl('Materiais')}
        />
        <StatusCard
          title="Gasto Semanal"
          value={`R$ ${valorSemanal.toFixed(2)}`}
          icon={DollarSign}
          color="bg-purple-500"
          onClick={() => window.location.href = createPageUrl('Equipe')}
        />
      </div>

      {/* Obras em Andamento */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Obras em Andamento</h2>
          <Link to={createPageUrl('Obras')}>
            <Button variant="outline" size="sm">
              Ver Todas
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
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
        ) : obrasAtivas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {obrasAtivas.slice(0, 6).map(obra => (
              <ObraCard 
                key={obra.id} 
                obra={obra} 
                etapas={etapas}
                materiais={materiais}
              />
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Building2 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma obra ativa</h3>
            <p className="text-gray-600 mb-6">Comece criando sua primeira obra</p>
            <Link to={createPageUrl('Obras')}>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeira Obra
              </Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}