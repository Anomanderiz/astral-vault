import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    supabase
      .from('magic_items')
      .select('*')
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (error) setError(error);
        else setItems(data ?? []);
        setLoading(false);
      });
  }, []);

  return { items, loading, error };
}
