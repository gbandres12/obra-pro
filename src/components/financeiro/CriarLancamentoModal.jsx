import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, Save, X } from 'lucide-react';

export default function CriarLancamentoModal({ isOpen, onClose, onSubmit, obras }) {
  const [formData, setFormData] = useState({
    obra_id: '',
    descricao: '',
    valor: '',
    tipo: 'despesa',
    categoria: '',
    data_lancamento: new Date().toISOString().split('T')[0]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      valor: parseFloat(formData.valor) || 0,
    };
    setIsSubmitting(true);
    await onSubmit(submitData);
    setIsSubmitting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign /> Novo Lançamento Financeiro
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="obra_id">Obra *</Label>
            <Select required value={formData.obra_id} onValueChange={(v) => handleChange('obra_id', v)}>
              <SelectTrigger><SelectValue placeholder="Selecione a obra" /></SelectTrigger>
              <SelectContent>
                {obras.map(obra => (
                  <SelectItem key={obra.id} value={obra.id}>{obra.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição *</Label>
            <Input id="descricao" required value={formData.descricao} onChange={(e) => handleChange('descricao', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="valor">Valor (R$) *</Label>
              <Input id="valor" type="number" step="0.01" required value={formData.valor} onChange={(e) => handleChange('valor', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo *</Label>
              <Select required value={formData.tipo} onValueChange={(v) => handleChange('tipo', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="despesa">Despesa</SelectItem>
                  <SelectItem value="receita">Receita</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="data_lancamento">Data *</Label>
            <Input id="data_lancamento" type="date" required value={formData.data_lancamento} onChange={(e) => handleChange('data_lancamento', e.target.value)} />
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}><X className="mr-2 h-4 w-4" />Cancelar</Button>
            <Button type="submit" className="bg-orange-600 hover:bg-orange-700" disabled={isSubmitting}>
              <Save className="mr-2 h-4 w-4" />{isSubmitting ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}