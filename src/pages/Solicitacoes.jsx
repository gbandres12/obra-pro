import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { format } from 'date-fns';
import CriarSolicitacaoModal from '../components/solicitacoes/CriarSolicitacaoModal';

const SolicitacaoCard = ({ solicitacao, obra, onUpdateStatus }) => {
  const getStatusColor = (status) => {
    const colors = {
      aberta: 'bg-blue-100 text-blue-800',
      em_analise: 'bg-amber-100 text-amber-800',
      concluida: 'bg-emerald-100 text-emerald-800',
      cancelada: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || colors.cancelada;
  };
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{solicitacao.tipo_solicitacao}</CardTitle>
            <p className="text-sm text-gray-600">{obra?.nome}</p>
          </div>
          <Badge className={getStatusColor(solicitacao.status)}>{solicitacao.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p>{solicitacao.descricao}</p>
        <div className="text-sm text-gray-500 flex justify-between">
          <span>Solicitante: {solicitacao.solicitante}</span>
          <span>Data: {format(new Date(solicitacao.data_solicitacao), 'dd/MM/yyyy')}</span>
        </div>
        <div className="flex justify-end">
          <Select value={solicitacao.status} onValueChange={(v) => onUpdateStatus(solicitacao, v)}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="aberta">Aberta</SelectItem>
              <SelectItem value="em_analise">Em Análise</SelectItem>
              <SelectItem value="concluida">Concluída</SelectItem>
              <SelectItem value="cancelada">Cancelada</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default function SolicitacoesPage() {
  const [obras, setObras] = useState([]);
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [setorFilter, setSetorFilter] = useState('all');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setIsLoading(true);
    const [obrasData, solicitacoesData] = await Promise.all([
      base44.entities.Obra.list(),
      base44.entities.Solicitacao.list('-data_solicitacao')
    ]);
    setObras(obrasData);
    setSolicitacoes(solicitacoesData);
    setIsLoading(false);
  };

  const handleSave = async (data) => {
    await base44.entities.Solicitacao.create(data);
    setShowCreateModal(false);
    loadData();
  };

  const handleUpdateStatus = async (solicitacao, status) => {
    await base44.entities.Solicitacao.update(solicitacao.id, { ...solicitacao, status });
    loadData();
  };
  
  const filteredSolicitacoes = solicitacoes.filter(s => setorFilter === 'all' || s.setor === setorFilter);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Painel de Solicitações</h1>
        <Button onClick={() => setShowCreateModal(true)} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="mr-2 h-4 w-4" /> Nova Solicitação
        </Button>
      </div>
      
      <div className="flex justify-end">
        <Select value={setorFilter} onValueChange={setSetorFilter}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Setores</SelectItem>
            <SelectItem value="engenharia">Engenharia</SelectItem>
            <SelectItem value="financeiro">Financeiro</SelectItem>
            <SelectItem value="administrativo">Administrativo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? <p>Carregando...</p> : filteredSolicitacoes.map(s => (
          <SolicitacaoCard 
            key={s.id} 
            solicitacao={s} 
            obra={obras.find(o => o.id === s.obra_id)}
            onUpdateStatus={handleUpdateStatus}
          />
        ))}
      </div>

      <CriarSolicitacaoModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleSave}
        obras={obras}
      />
    </div>
  );
}