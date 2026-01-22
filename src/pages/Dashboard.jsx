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
      <div className="flex flex-col items-center text-center">
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-4 shadow-sm`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        {trend && (
          <div className="flex items-center mt-2 text-sm justify-center">
            <TrendingUp className="w-4 h-4 mr-1 text-emerald-500" />
            <span className="text-emerald-600 font-medium">{trend}</span>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

const WeatherWidget = () => (
  <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white overflow-hidden relative">
    <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10" />
    <CardContent className="p-6 relative z-10">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-medium text-blue-100">Local da Obra</p>
          <h3 className="text-2xl font-bold mt-1">São Paulo, SP</h3>
          <div className="flex items-center mt-4 gap-4">
            <span className="text-4xl font-bold">28°</span>
            <div className="text-sm text-blue-100">
              <p>Parcialmente</p>
              <p>Nublado</p>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-blue-100">Umidade: 65%</p>
          <p className="text-sm text-blue-100 mt-1">Vento: 12km/h</p>
        </div>
      </div>
      <div className="mt-6 flex gap-4 text-sm text-blue-100 border-t border-white/20 pt-4">
        <div className="flex-1 text-center">
          <p>08:00</p>
          <p className="font-bold my-1">24°</p>
        </div>
        <div className="flex-1 text-center border-l border-white/20">
          <p>12:00</p>
          <p className="font-bold my-1">30°</p>
        </div>
        <div className="flex-1 text-center border-l border-white/20">
          <p>16:00</p>
          <p className="font-bold my-1">29°</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const ExpirationsWidget = () => (
  <Card>
    <CardHeader>
      <CardTitle className="text-base font-semibold text-gray-900">Próximos Vencimentos</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      {[1, 2, 3].map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">Alvará de Construção #292</p>
            <p className="text-xs text-gray-500">Vence em 5 dias</p>
          </div>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
            Ver
          </Button>
        </div>
      ))}
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
              <p className="text-xs text-gray-500">Contrato</p>
              <p className="text-sm font-medium text-emerald-600">
                R$ {obra.valor_total_contrato ? obra.valor_total_contrato.toLocaleString('pt-BR') : '0,00'}
              </p>
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
      const obrasData = await base44.entities.Obra.list('-created_date', 50);
      setObras(obrasData);

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content: Obras list */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Obras em Andamento</h2>
            <Link to={createPageUrl('Obras')}>
              <Button variant="outline" size="sm">Ver Todas</Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map(i => <Card key={i} className="animate-pulse h-48" />)}
            </div>
          ) : obrasAtivas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {obrasAtivas.slice(0, 4).map(obra => (
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
              <p>Nenhuma obra ativa.</p>
            </Card>
          )}
        </div>

        {/* Sidebar Widgets: Weather & Expirations */}
        <div className="space-y-6">
          <WeatherWidget />
          <ExpirationsWidget />
        </div>
      </div>
    </div>
  );
}