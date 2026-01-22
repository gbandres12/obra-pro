
import { supabase } from '@/lib/supabase';

export const Funcionario = {
    list: async (orderBy = 'nome', limit = 100) => {
        let orderColumn = orderBy;
        let ascending = true;

        if (orderBy.startsWith('-')) {
            orderColumn = orderBy.substring(1);
            ascending = false;
        }

        if (orderColumn === 'created_date') orderColumn = 'created_at';

        const { data, error } = await supabase
            .from('funcionarios')
            .select('*')
            .order(orderColumn, { ascending })
            .limit(limit);

        if (error) {
            console.error('Error fetching funcionarios:', error);
            throw error;
        }
        return data;
    },

    create: async (data) => {
        const { data: result, error } = await supabase
            .from('funcionarios')
            .insert([data])
            .select()
            .single();

        if (error) {
            console.error('Error creating funcionario:', error);
            throw error;
        }
        return result;
    },

    update: async (id, data) => {
        const { data: result, error } = await supabase
            .from('funcionarios')
            .update(data)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating funcionario:', error);
            throw error;
        }
        return result;
    },

    delete: async (id) => {
        const { error } = await supabase
            .from('funcionarios')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting funcionario:', error);
            throw error;
        }
        return { success: true };
    }
};
