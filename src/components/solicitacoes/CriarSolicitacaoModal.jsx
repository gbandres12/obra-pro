import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClipboardList, Save, X } from 'lucide-react';

export default function CriarSolicitacaoModal({ isOpen, onClose, onSubmit, obras }) {
  const [formData, setFormData] = useState({
    obra_id: '', setor: '', tipo_solicitacao: '', descricao: '', solicitante: '', data_solicitacao: new Date().toISOString().split('T')[0]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSubmit(formData);
    setIsSubmitting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle className="flex items-center gap-2"><ClipboardList /> Nova Solicitação</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="obra_id">Obra *</Label>
            <Select required value={formData.obra_id} onValueChange={(v) => handleChange('obra_id', v)}>
              <SelectTrigger><SelectValue placeholder="Selecione a obra" /></SelectTrigger>
              <SelectContent>
                {obras.map(obra => <SelectItem key={obra.id} value={obra.id}>{obra.nome}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="setor">Setor *</Label>
            <Select required value={formData.setor} onValueChange={(v) => handleChange('setor', v)}>
              <SelectTrigger><SelectValue placeholder="Selecione o setor" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="engenharia">Engenharia</SelectItem>
                <SelectItem value="financeiro">Financeiro</SelectItem>
                <SelectItem value="administrativo">Administrativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tipo_solicitacao">Tipo da Solicitação *</Label>
            <Input id="tipo_solicitacao" required value={formData.tipo_solicitacao} onChange={(e) => handleChange('tipo_solicitacao', e.target.value)} placeholder="Ex: Visita Técnica" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="solicitante">Solicitante *</Label>
            <Input id="solicitante" required value={formData.solicitante} onChange={(e) => handleChange('solicitante', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição *</Label>
            <Textarea id="descricao" required value={formData.descricao} onChange={(e) => handleChange('descricao', e.target.value)} />
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}><X className="mr-2 h-4 w-4" />Cancelar</Button>
            <Button type="submit" className="bg-orange-600 hover:bg-orange-700" disabled={isSubmitting}><Save className="mr-2 h-4 w-4" />Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}