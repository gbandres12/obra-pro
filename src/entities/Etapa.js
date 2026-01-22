
import { supabase } from '@/lib/supabase';

export const Etapa = {
    list: async (orderBy = 'ordem', limit = 100) => {
        let orderColumn = orderBy;
        let ascending = true;

        if (orderBy.startsWith('-')) {
            orderColumn = orderBy.substring(1);
            ascending = false;
        }

        if (orderColumn === 'created_date') orderColumn = 'created_at';

        const { data, error } = await supabase
            .from('etapas')
            .select('*')
            .order(orderColumn, { ascending })
            .limit(limit);

        if (error) {
            console.error('Error fetching etapas:', error);
            throw error;
        }
        return data;
    },

    create: async (etapaData) => {
        const { data, error } = await supabase
            .from('etapas')
            .insert([etapaData])
            .select()
            .single();

        if (error) {
            console.error('Error creating etapa:', error);
            throw error;
        }
        return data;
    },

    update: async (id, etapaData) => {
        const { data, error } = await supabase
            .from('etapas')
            .update(etapaData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating etapa:', error);
            throw error;
        }
        return data;
    },

    delete: async (id) => {
        const { error } = await supabase
            .from('etapas')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting etapa:', error);
            throw error;
        }
        return { success: true };
    }
};
