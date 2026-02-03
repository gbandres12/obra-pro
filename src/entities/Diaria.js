
import { supabase } from '@/lib/supabase';

export const Diaria = {
    list: async (orderBy = 'data_trabalho', limit = 100) => {
        let orderColumn = orderBy;
        let ascending = true;

        if (orderBy.startsWith('-')) {
            orderColumn = orderBy.substring(1);
            ascending = false;
        }

        const { data, error } = await supabase
            .from('diarias')
            .select('*')
            .order(orderColumn, { ascending })
            .limit(limit);

        if (error) {
            console.error('Error fetching diarias:', error);
            throw error;
        }
        return data;
    },

    get: async (id) => {
        const { data, error } = await supabase
            .from('diarias')
            .select('*')
            .eq('id', id)
            .single();
        if (error) throw error;
        return data;
    },

    filter: async (criteria = {}, orderBy = 'data_trabalho', limit = 100) => {
        let orderColumn = orderBy;
        let ascending = true;
        if (orderBy.startsWith('-')) {
            orderColumn = orderBy.substring(1);
            ascending = false;
        }
        let query = supabase.from('diarias').select('*').order(orderColumn, { ascending }).limit(limit);
        Object.entries(criteria).forEach(([key, value]) => {
            query = query.eq(key, value);
        });
        const { data, error } = await query;
        if (error) throw error;
        return data;
    },

    create: async (data) => {
        const { data: result, error } = await supabase
            .from('diarias')
            .insert([data])
            .select()
            .single();

        if (error) {
            console.error('Error creating diaria:', error);
            throw error;
        }
        return result;
    },

    update: async (id, data) => {
        const { data: result, error } = await supabase
            .from('diarias')
            .update(data)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating diaria:', error);
            throw error;
        }
        return result;
    },

    delete: async (id) => {
        const { error } = await supabase
            .from('diarias')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting diaria:', error);
            throw error;
        }
        return { success: true };
    }
};
