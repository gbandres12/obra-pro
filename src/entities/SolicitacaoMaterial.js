
import { supabase } from '@/lib/supabase';

export const SolicitacaoMaterial = {
    list: async (orderBy = 'created_at', limit = 50) => {
        let orderColumn = orderBy;
        let ascending = true;

        if (orderBy.startsWith('-')) {
            orderColumn = orderBy.substring(1);
            ascending = false;
        }

        if (orderColumn === 'created_date' || orderColumn === 'data_solicitacao') orderColumn = 'created_at';

        const { data, error } = await supabase
            .from('solicitacoes_materiais')
            .select('*')
            .order(orderColumn, { ascending })
            .limit(limit);

        if (error) {
            console.error('Error fetching solicitacoes:', error);
            throw error;
        }
        return data;
    },

    get: async (id) => {
        const { data, error } = await supabase
            .from('solicitacoes_materiais')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching solicitacao:', error);
            throw error;
        }
        return data;
    },

    filter: async (criteria = {}, orderBy = 'created_at', limit = 50) => {
        let orderColumn = orderBy;
        let ascending = true;
        if (orderBy.startsWith('-')) {
            orderColumn = orderBy.substring(1);
            ascending = false;
        }
        if (orderColumn === 'created_date') orderColumn = 'created_at';

        let query = supabase
            .from('solicitacoes_materiais')
            .select('*')
            .order(orderColumn, { ascending })
            .limit(limit);

        // Apply filters
        Object.keys(criteria).forEach(key => {
            query = query.eq(key, criteria[key]);
        });

        const { data, error } = await query;
        if (error) throw error;
        return data;
    },

    create: async (data) => {
        const { data: result, error } = await supabase
            .from('solicitacoes_materiais')
            .insert([data])
            .select()
            .single();

        if (error) {
            console.error('Error creating solicitacao:', error);
            throw error;
        }
        return result;
    },

    update: async (id, data) => {
        const { data: result, error } = await supabase
            .from('solicitacoes_materiais')
            .update(data)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating solicitacao:', error);
            throw error;
        }
        return result;
    },

    delete: async (id) => {
        const { error } = await supabase
            .from('solicitacoes_materiais')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting solicitacao:', error);
            throw error;
        }
        return { success: true };
    }
};
