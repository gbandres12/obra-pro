import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Download, Calendar, DollarSign, Clock } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function RelatorioEquipe({ diarias, funcionarios, obras, isLoading }) {
  const [periodo, setPeriodo] = useState('mes');
  const [funcionarioFilter, setFuncionarioFilter] = useState('all');
  const [obraFilter, setObraFilter] = useState('all');

  const getFuncionarioById = (id) => {
    return funcionarios.find(f => f.id === id);
  };

  const getObraById = (id) => {
    return obras.find(o => o.id === id);
  };

  const getDataRange = () => {
    const hoje = new Date();
    switch (periodo) {
      case 'semana':
        return { inicio: startOfWeek(hoje), fim: endOfWeek(hoje) };
      case 'mes':
        return { inicio: startOfMonth(hoje), fim: endOfMonth(hoje) };
      default:
        return { inicio: startOfMonth(hoje), fim: endOfMonth(hoje) };
    }
  };

  const { inicio, fim } = getDataRange();

  const diariasFiltradas = diarias.filter(diaria => {
    const dataTrabalho = new Date(diaria.data_trabalho);
    const dentroPeriodo = dataTrabalho >= inicio && dataTrabalho <= fim;
    
    const funcionarioMatch = funcionarioFilter === 'all' || diaria.funcionario_id === funcionarioFilter;
    const obraMatch = obraFilter === 'all' || diaria.obra_id === obraFilter;
    
    return dentroPeriodo && funcionarioMatch && obraMatch;
  });

  const totalPago = diariasFiltradas.reduce((sum, d) => sum + (d.valor_pago || 0), 0);
  const totalDias = diariasFiltradas.length;
  const totalHoras = diariasFiltradas.reduce((sum, d) => sum + (d.horas_trabalhadas || 8), 0);

  // Resumo por funcionário
  const resumoPorFuncionario = funcionarios.map(funcionario => {
    const diariasFunc = diariasFiltradas.filter(d => d.funcionario_id === funcionario.id);
    const diasTrabalhados = diariasFunc.length;
    const valorTotal = diariasFunc.reduce((sum, d) => sum + (d.valor_pago || 0), 0);
    
    return {
      funcionario,
      diasTrabalhados,
      valorTotal,
      diarias: diariasFunc
    };
  }).filter(item => item.diasTrabalhados > 0);

  const exportarRelatorio = () => {
    const dados = diariasFiltradas.map(diaria => ({
      Funcionario: getFuncionarioById(diaria.funcionario_id)?.nome || 'N/A',
      Obra: getObraById(diaria.obra_id)?.nome || 'N/A',
      Data: format(new Date(diaria.data_trabalho), 'dd/MM/yyyy'),
      Horas: diaria.horas_trabalhadas || 8,
      Valor: diaria.valor_pago || 0,
      Atividades: diaria.atividades || '',
      Observacoes: diaria.observacoes || ''
    }));

    const headers = Object.keys(dados[0] || {});
    const csvContent = [
      headers.join(','),
      ...dados.map(row => headers.map(header => JSON.stringify(row[header])).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_equipe_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Controles */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={periodo} onValueChange={setPeriodo}>
          <SelectTrigger className="w-48">
            <Calendar className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="semana">Esta Semana</SelectItem>
            <SelectItem value="mes">Este Mês</SelectItem>
          </SelectContent>
        </Select>

        <Select value={funcionarioFilter} onValueChange={setFuncionarioFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Todos funcionários" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos funcionários</SelectItem>
            {funcionarios.map(func => (
              <SelectItem key={func.id} value={func.id}>
                {func.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={obraFilter} onValueChange={setObraFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Todas obras" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas obras</SelectItem>
            {obras.map(obra => (
              <SelectItem key={obra.id} value={obra.id}>
                {obra.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          onClick={exportarRelatorio}
          disabled={diariasFiltradas.length === 0}
        >
          <Download className="w-4 h-4 mr-2" />
          Exportar
        </Button>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Dias</p>
                <p className="text-3xl font-bold text-blue-600">{totalDias}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Pago</p>
                <p className="text-3xl font-bold text-emerald-600">
                  R$ {totalPago.toFixed(2)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Horas</p>
                <p className="text-3xl font-bold text-purple-600">{totalHoras}h</p>
              </div>
              <Clock className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumo por Funcionário */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo por Funcionário</CardTitle>
        </CardHeader>
        <CardContent>
          {resumoPorFuncionario.length > 0 ? (
            <div className="space-y-4">
              {resumoPorFuncionario.map(item => (
                <div key={item.funcionario.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold">{item.funcionario.nome}</h4>
                      <p className="text-sm text-gray-600">{item.funcionario.funcao}</p>
                    </div>
                    <Badge variant="outline">
                      {item.diasTrabalhados} dias
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total ganho:</span>
                    <span className="font-bold text-emerald-600">
                      R$ {item.valorTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">
              Nenhuma diária encontrada para o período selecionado
            </p>
          )}
        </CardContent>
      </Card>

      {/* Detalhamento das Diárias */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhamento das Diárias</CardTitle>
        </CardHeader>
        <CardContent>
          {diariasFiltradas.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Funcionário</TableHead>
                    <TableHead>Obra</TableHead>
                    <TableHead>Horas</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Atividades</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {diariasFiltradas.map(diaria => (
                    <TableRow key={diaria.id}>
                      <TableCell>
                        {format(new Date(diaria.data_trabalho), 'dd/MM/yyyy', { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {getFuncionarioById(diaria.funcionario_id)?.nome}
                          </p>
                          <p className="text-xs text-gray-500">
                            {getFuncionarioById(diaria.funcionario_id)?.funcao}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getObraById(diaria.obra_id)?.nome}
                      </TableCell>
                      <TableCell>{diaria.horas_trabalhadas || 8}h</TableCell>
                      <TableCell className="font-medium text-emerald-600">
                        R$ {(diaria.valor_pago || 0).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="text-sm truncate" title={diaria.atividades}>
                            {diaria.atividades || 'N/A'}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">
              Nenhuma diária encontrada para os filtros selecionados
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}