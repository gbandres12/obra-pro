import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  CheckCircle,
  Circle,
  PlayCircle,
  AlertTriangle,
  Calendar,
  Clock,
  FileText
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const StatusIcon = ({ status, className = "w-6 h-6" }) => {
  switch (status) {
    case 'pendente':
      return <Circle className={`${className} text-gray-400`} />;
    case 'em_andamento':
      return <PlayCircle className={`${className} text-blue-500`} />;
    case 'concluida':
      return <CheckCircle className={`${className} text-emerald-500`} />;
    case 'atrasada':
      return <AlertTriangle className={`${className} text-red-500`} />;
    default:
      return <Circle className={`${className} text-gray-400`} />;
  }
};

const TimelineItem = ({ etapa, obra, isLast, onEdit, onUpdateStatus }) => {
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
    <div className="flex">
      {/* Timeline connector */}
      <div className="flex flex-col items-center mr-6">
        <div className="flex-shrink-0 w-12 h-12 rounded-full border-2 border-gray-200 bg-white flex items-center justify-center shadow-sm">
          <StatusIcon status={etapa.status} className="w-6 h-6" />
        </div>
        {!isLast && (
          <div className="w-px bg-gray-200 flex-1 mt-4" style={{ minHeight: '60px' }} />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-8">
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-gray-900">
                  {etapa.nome_etapa}
                </CardTitle>
                {obra && (
                  <p className="text-sm text-emerald-600 mt-1 font-medium">{obra.nome}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">Ordem: {etapa.ordem}</p>
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

              {/* Datas */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                {etapa.data_inicio_prevista && (
                  <div>
                    <p className="text-gray-500 flex items-center gap-1 mb-1">
                      <Calendar className="w-3 h-3" />
                      Início Prev.
                    </p>
                    <p className="font-medium">
                      {format(new Date(etapa.data_inicio_prevista), 'dd/MM/yy', { locale: ptBR })}
                    </p>
                  </div>
                )}
                {etapa.data_fim_prevista && (
                  <div>
                    <p className="text-gray-500 flex items-center gap-1 mb-1">
                      <Clock className="w-3 h-3" />
                      Fim Prev.
                    </p>
                    <p className="font-medium">
                      {format(new Date(etapa.data_fim_prevista), 'dd/MM/yy', { locale: ptBR })}
                    </p>
                  </div>
                )}
                {etapa.data_inicio_real && (
                  <div>
                    <p className="text-green-600 flex items-center gap-1 mb-1">
                      <Calendar className="w-3 h-3" />
                      Início Real
                    </p>
                    <p className="font-medium text-green-700">
                      {format(new Date(etapa.data_inicio_real), 'dd/MM/yy', { locale: ptBR })}
                    </p>
                  </div>
                )}
                {etapa.data_fim_real && (
                  <div>
                    <p className="text-green-600 flex items-center gap-1 mb-1">
                      <Clock className="w-3 h-3" />
                      Fim Real
                    </p>
                    <p className="font-medium text-green-700">
                      {format(new Date(etapa.data_fim_real), 'dd/MM/yy', { locale: ptBR })}
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
      </div>
    </div>
  );
};

export default function TimelineEtapas({ etapas, obras, isLoading, onEdit, onUpdateStatus }) {
  const getObraById = (obraId) => {
    return obras.find(obra => obra.id === obraId);
  };

  // Agrupar etapas por obra
  const etapasPorObra = etapas.reduce((acc, etapa) => {
    const obraId = etapa.obra_id;
    if (!acc[obraId]) {
      acc[obraId] = [];
    }
    acc[obraId].push(etapa);
    return acc;
  }, {});

  // Ordenar etapas dentro de cada obra
  Object.keys(etapasPorObra).forEach(obraId => {
    etapasPorObra[obraId].sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex animate-pulse">
            <div className="w-12 h-12 bg-gray-200 rounded-full mr-6 flex-shrink-0" />
            <Card className="flex-1">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-6"></div>
                <div className="h-2 bg-gray-200 rounded mb-4"></div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    );
  }

  if (etapas.length === 0) {
    return (
      <Card className="p-12 text-center">
        <CheckCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Nenhuma etapa encontrada
        </h3>
        <p className="text-gray-600">
          As etapas aparecerão aqui quando forem criadas
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-12">
      {Object.entries(etapasPorObra).map(([obraId, etapasObra]) => {
        const obra = getObraById(obraId);
        return (
          <div key={obraId}>
            {obra && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{obra.nome}</h2>
                <p className="text-gray-600">{obra.localizacao}</p>
              </div>
            )}
            
            <div className="space-y-0">
              {etapasObra.map((etapa, index) => (
                <TimelineItem
                  key={etapa.id}
                  etapa={etapa}
                  obra={obra}
                  isLast={index === etapasObra.length - 1}
                  onEdit={onEdit}
                  onUpdateStatus={onUpdateStatus}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}