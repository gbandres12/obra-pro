
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
    get: async (id) => {
        const { data, error } = await supabase
            .from('lancamentos_financeiros')
            .select('*')
            .eq('id', id)
            .single();
        if (error) throw error;
        return data;
    },
    filter: async (criteria = {}, orderBy = 'data_lancamento', limit = 100) => {
        let orderColumn = orderBy;
        let ascending = true;
        if (orderBy.startsWith('-')) {
            orderColumn = orderBy.substring(1);
            ascending = false;
        }
        let query = supabase.from('lancamentos_financeiros').select('*').order(orderColumn, { ascending }).limit(limit);
        Object.entries(criteria).forEach(([key, value]) => {
            query = query.eq(key, value);
        });
        const { data, error } = await query;
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
