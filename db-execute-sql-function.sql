-- Function to execute arbitrary SQL (use with caution, only for admin purposes)
CREATE OR REPLACE FUNCTION public.execute_sql(sql_query TEXT)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  -- Execute the SQL query
  EXECUTE sql_query INTO result;
  
  -- Return the result
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  -- Return error information
  RETURN jsonb_build_object(
    'error', SQLERRM,
    'detail', SQLSTATE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.execute_sql TO authenticated;
