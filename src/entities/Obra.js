
import { supabase } from '@/lib/supabase';

export const Obra = {
    list: async (orderBy = 'created_at', limit = 50) => {
        // Handle 'desc' prefix like '-created_date'
        let orderColumn = orderBy;
        let ascending = true;

        if (orderBy.startsWith('-')) {
            orderColumn = orderBy.substring(1);
            ascending = false;
        }

        // Fix legacy column names if needed (e.g., created_date -> created_at)
        if (orderColumn === 'created_date') orderColumn = 'created_at';

        const { data, error } = await supabase
            .from('obras')
            .select('*')
            .order(orderColumn, { ascending })
            .limit(limit);

        if (error) {
            console.error('Error fetching obras:', error);
            throw error;
        }
        return data;
    },

    get: async (id) => {
        const { data, error } = await supabase
            .from('obras')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching obra:', error);
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

        let query = supabase.from('obras').select('*').order(orderColumn, { ascending }).limit(limit);
        Object.entries(criteria).forEach(([key, value]) => {
            query = query.eq(key, value);
        });

        const { data, error } = await query;
        if (error) throw error;
        return data;
    },

    create: async (obraData) => {
        const { data, error } = await supabase
            .from('obras')
            .insert([obraData])
            .select()
            .single();

        if (error) {
            console.error('Error creating obra:', error);
            throw error;
        }
        return data;
    },

    update: async (id, obraData) => {
        const { data, error } = await supabase
            .from('obras')
            .update(obraData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating obra:', error);
            throw error;
        }
        return data;
    },

    delete: async (id) => {
        const { error } = await supabase
            .from('obras')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting obra:', error);
            throw error;
        }
        return { success: true };
    }
};
