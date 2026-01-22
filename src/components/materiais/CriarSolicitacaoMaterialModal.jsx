import React, { useState, useEffect } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, Save, X } from 'lucide-react';

export default function CriarSolicitacaoMaterialModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  obras, 
  obraIdPredefinida 
}) {
  const [formData, setFormData] = useState({
    obra_id: obraIdPredefinida || '',
    item_solicitado: '',
    quantidade: '',
    unidade: 'un',
    urgencia: 'media',
    solicitante: '',
    data_solicitacao: new Date().toISOString().split('T')[0],
    data_necessaria: '',
    observacoes: '',
    valor_estimado: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (obraIdPredefinida) {
      setFormData(prev => ({ ...prev, obra_id: obraIdPredefinida }));
    }
  }, [obraIdPredefinida]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      valor_estimado: formData.valor_estimado ? parseFloat(formData.valor_estimado) : null
    };

    setIsSubmitting(true);
    try {
      await onSubmit(submitData);
    } catch (error) {
      console.error('Erro ao criar solicitação:', error);
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Package className="w-5 h-5 text-emerald-600" />
            Nova Solicitação de Material
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="obra_id">Obra *</Label>
            <Select
              value={formData.obra_id}
              onValueChange={(value) => handleChange('obra_id', value)}
              disabled={!!obraIdPredefinida}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a obra" />
              </SelectTrigger>
              <SelectContent>
                {obras.map(obra => (
                  <SelectItem key={obra.id} value={obra.id}>
                    {obra.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="item_solicitado">Item Solicitado *</Label>
            <Input
              id="item_solicitado"
              value={formData.item_solicitado}
              onChange={(e) => handleChange('item_solicitado', e.target.value)}
              placeholder="Ex: Cimento, Areia, Tijolos..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantidade">Quantidade *</Label>
              <Input
                id="quantidade"
                value={formData.quantidade}
                onChange={(e) => handleChange('quantidade', e.target.value)}
                placeholder="Ex: 10, 50"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unidade">Unidade</Label>
              <Select
                value={formData.unidade}
                onValueChange={(value) => handleChange('unidade', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="un">Unidade</SelectItem>
                  <SelectItem value="kg">Quilograma</SelectItem>
                  <SelectItem value="m">Metro</SelectItem>
                  <SelectItem value="m2">Metro²</SelectItem>
                  <SelectItem value="m3">Metro³</SelectItem>
                  <SelectItem value="lt">Litro</SelectItem>
                  <SelectItem value="sc">Saco</SelectItem>
                  <SelectItem value="cx">Caixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="urgencia">Urgência</Label>
              <Select
                value={formData.urgencia}
                onValueChange={(value) => handleChange('urgencia', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="valor_estimado">Valor Estimado (R$)</Label>
              <Input
                id="valor_estimado"
                type="number"
                step="0.01"
                min="0"
                value={formData.valor_estimado}
                onChange={(e) => handleChange('valor_estimado', e.target.value)}
                placeholder="Ex: 150.00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="solicitante">Solicitante *</Label>
            <Input
              id="solicitante"
              value={formData.solicitante}
              onChange={(e) => handleChange('solicitante', e.target.value)}
              placeholder="Nome de quem solicita"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="data_necessaria">Data Necessária</Label>
            <Input
              id="data_necessaria"
              type="date"
              value={formData.data_necessaria}
              onChange={(e) => handleChange('data_necessaria', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => handleChange('observacoes', e.target.value)}
              placeholder="Informações adicionais sobre o material..."
              rows={3}
            />
          </div>

          <DialogFooter className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Salvando...' : 'Criar Solicitação'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}