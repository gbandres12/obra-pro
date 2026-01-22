
import { supabase } from '@/lib/supabase';

export const LancamentoFinanceiro = {
    list: async (orderBy = 'data_lancamento', limit = 100) => {
        let orderColumn = orderBy;
        let ascending = true;
        if (orderBy.startsWith('-')) {
            orderColumn = orderBy.substring(1);
            ascending = false;
        }
        const { data, error } = await supabase
            .from('lancamentos_financeiros')
            .select('*')
            .order(orderColumn, { ascending })
            .limit(limit);
        if (error) throw error;
        return data;
    },
    create: async (data) => {
        const { data: result, error } = await supabase
            .from('lancamentos_financeiros')
            .insert([data])
            .select()
            .single();
        if (error) throw error;
        return result;
    },
    update: async (id, data) => {
        const { data: result, error } = await supabase
            .from('lancamentos_financeiros')
            .update(data)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return result;
    },
    delete: async (id) => {
        const { error } = await supabase.from('lancamentos_financeiros').delete().eq('id', id);
        if (error) throw error;
        return { success: true };
    }
};
