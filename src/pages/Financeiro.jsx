import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Plus,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import CriarLancamentoModal from '../components/financeiro/CriarLancamentoModal';

const FinanceiroObraCard = ({ obra, lancamentos }) => {
  const despesas = lancamentos
    .filter(l => l.obra_id === obra.id && l.tipo === 'despesa')
    .reduce((sum, l) => sum + l.valor, 0);

  const percentualGasto = obra.valor_total_contrato > 0 
    ? (despesas / obra.valor_total_contrato) * 100 
    : 0;

  const saldo = obra.valor_total_contrato - despesas;

  let alert = null;
  if (percentualGasto >= 100) {
    alert = {
      message: 'Orçamento excedido',
      color: 'bg-red-100 text-red-800 border-red-200',
    };
  } else if (percentualGasto >= 80) {
    alert = {
      message: 'Orçamento próximo do limite',
      color: 'bg-amber-100 text-amber-800 border-amber-200',
    };
  }
  
  return (
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-gray-900">{obra.nome}</CardTitle>
            <p className="text-sm text-gray-500 mt-1">Centro de Custo: {obra.centro_de_custo}</p>
          </div>
          {alert && (
            <Badge className={alert.color}>
              <AlertCircle className="w-4 h-4 mr-2" />
              {alert.message}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Orçamento Gasto</span>
              <span className="font-semibold text-gray-900">{percentualGasto.toFixed(1)}%</span>
            </div>
            <Progress value={percentualGasto} className="h-3" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center border-t pt-4">
            <div>
              <p className="text-xs text-gray-500">Contrato</p>
              <p className="text-md font-bold text-gray-800">
                R$ {obra.valor_total_contrato?.toLocaleString('pt-BR')}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Gasto</p>
              <p className="text-md font-bold text-red-600">
                R$ {despesas.toLocaleString('pt-BR')}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Saldo</p>
              <p className={`text-md font-bold ${saldo >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                R$ {saldo.toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function FinanceiroPage() {
  const [obras, setObras] = useState([]);
  const [lancamentos, setLancamentos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [obraFilter, setObraFilter] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [obrasData, lancamentosData] = await Promise.all([
        base44.entities.Obra.list('-created_date'),
        base44.entities.LancamentoFinanceiro.list('-data_lancamento'),
      ]);
      setObras(obrasData.filter(o => o.situacao === 'ativa'));
      setLancamentos(lancamentosData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
    setIsLoading(false);
  };

  const handleCreateLancamento = async (data) => {
    try {
      await base44.entities.LancamentoFinanceiro.create(data);
      setShowCreateModal(false);
      loadData();
    } catch (error) {
      console.error('Erro ao criar lançamento:', error);
    }
  };

  const filteredLancamentos = lancamentos.filter(l => 
    obraFilter === 'all' || l.obra_id === obraFilter
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Controle Financeiro</h1>
          <p className="text-gray-600 mt-1">Gerencie as finanças de suas obras</p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Lançamento
        </Button>
      </div>

      {/* Resumo por Obra */}
      <div className="space-y-6">
        {isLoading ? (
          <p>Carregando...</p>
        ) : (
          obras.map(obra => (
            <FinanceiroObraCard key={obra.id} obra={obra} lancamentos={lancamentos} />
          ))
        )}
      </div>

      {/* Tabela de Lançamentos */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Histórico de Lançamentos</CardTitle>
            <Select value={obraFilter} onValueChange={setObraFilter}>
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
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Obra</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLancamentos.map(lancamento => (
                <TableRow key={lancamento.id}>
                  <TableCell>{format(new Date(lancamento.data_lancamento), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>{obras.find(o => o.id === lancamento.obra_id)?.nome}</TableCell>
                  <TableCell>{lancamento.descricao}</TableCell>
                  <TableCell>
                    <Badge variant={lancamento.tipo === 'despesa' ? 'destructive' : 'default'}>
                      {lancamento.tipo}
                    </Badge>
                  </TableCell>
                  <TableCell className={`text-right font-medium ${lancamento.tipo === 'despesa' ? 'text-red-600' : 'text-emerald-600'}`}>
                    R$ {lancamento.valor.toLocaleString('pt-BR')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <CriarLancamentoModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateLancamento}
        obras={obras}
      />
    </div>
  );
}