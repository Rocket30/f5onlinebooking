"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function SqlSetupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null)

  const handleCreateSqlFunction = async () => {
    setIsLoading(true)
    try {
      // Create the exec_sql function in Supabase
      const { error } = await supabase
        .rpc("create_exec_sql_function", {
          sql_query: `
          CREATE OR REPLACE FUNCTION exec_sql(sql text) RETURNS void AS $$
          BEGIN
            EXECUTE sql;
          END;
          $$ LANGUAGE plpgsql SECURITY DEFINER;
        `,
        })
        .single()

      if (error) {
        // If the function doesn't exist yet, try creating it directly
        const createFunctionResult = await supabase.from("_schema").rpc("create_function", {
          function_name: "exec_sql",
          function_definition: `
            CREATE OR REPLACE FUNCTION exec_sql(sql text) RETURNS void AS $$
            BEGIN
              EXECUTE sql;
            END;
            $$ LANGUAGE plpgsql SECURITY DEFINER;
          `,
        })

        if (createFunctionResult.error) {
          throw new Error(`Failed to create SQL function: ${createFunctionResult.error.message}`)
        }
      }

      setResult({
        success: true,
        message: "SQL function created successfully. You can now initialize the database.",
      })
    } catch (error) {
      console.error("Error creating SQL function:", error)
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "An unknown error occurred",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>SQL Function Setup</CardTitle>
          <CardDescription>Create the necessary SQL function to enable database initialization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Important</AlertTitle>
              <AlertDescription>
                This will create a SQL function in your Supabase database that allows executing SQL statements. This is
                required before you can initialize the database tables.
              </AlertDescription>
            </Alert>

            <Button
              onClick={handleCreateSqlFunction}
              disabled={isLoading}
              className="bg-yellow-500 hover:bg-yellow-600 text-black"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating SQL Function...
                </>
              ) : (
                "Create SQL Function"
              )}
            </Button>

            {result && (
              <Alert className={result.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
                {result.success ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
                <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
                <AlertDescription>{result.success ? result.message : `Error: ${result.error}`}</AlertDescription>
              </Alert>
            )}

            <div className="mt-6 border-t pt-4">
              <h3 className="font-medium mb-2">Manual SQL Setup</h3>
              <p className="text-sm mb-4">
                If the automatic setup fails, you can create the function manually in the Supabase SQL Editor:
              </p>
              <div className="bg-gray-50 p-4 rounded-md overflow-auto text-sm">
                <pre className="whitespace-pre-wrap">
                  {`-- Run this SQL in your Supabase SQL Editor
CREATE OR REPLACE FUNCTION exec_sql(sql text) RETURNS void AS $$
BEGIN
  EXECUTE sql;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;`}
                </pre>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
