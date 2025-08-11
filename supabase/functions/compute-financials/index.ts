/*
  Edge function to extract and compute financial data from parsed filings
  This is a placeholder implementation for the MVP
*/

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface ComputeFinancialsRequest {
  filingId: string;
  form: string;
  sections: Array<{
    itemCode: string;
    title: string;
    content: string;
  }>;
}

interface FinancialLine {
  lineCode: string;
  label: string;
  value: number;
  orderIndex: number;
}

Deno.serve(async (req: Request) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        {
          status: 405,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const { filingId, form, sections }: ComputeFinancialsRequest = await req.json();

    // TODO: Implement actual financial computation logic
    // 1. Extract financial statements from sections
    // 2. Parse and normalize financial data
    // 3. Map to standardized line codes
    // 4. Validate and clean numerical values
    // 5. Store in financial_statements and financial_lines tables

    console.log("Computing financials for filing:", { filingId, form });

    // Placeholder financial lines for income statement
    const mockIncomeStatementLines: FinancialLine[] = [
      { lineCode: "NET_SALES", label: "Total net sales", value: 383285000000, orderIndex: 1 },
      { lineCode: "COGS", label: "Cost of sales", value: 214137000000, orderIndex: 2 },
      { lineCode: "GROSS_PROFIT", label: "Gross margin", value: 169148000000, orderIndex: 3 },
      { lineCode: "OPERATING_EXPENSES", label: "Total operating expenses", value: 55013000000, orderIndex: 4 },
      { lineCode: "OPERATING_INCOME", label: "Operating income", value: 114301000000, orderIndex: 5 },
      { lineCode: "PRETAX_INCOME", label: "Income before taxes", value: 113736000000, orderIndex: 6 },
      { lineCode: "TAX_EXPENSE", label: "Tax expense", value: 16741000000, orderIndex: 7 },
      { lineCode: "NET_INCOME", label: "Net income", value: 96995000000, orderIndex: 8 },
    ];

    const response = {
      success: true,
      filingId,
      statementsProcessed: 1,
      statements: [
        {
          type: "income",
          linesCount: mockIncomeStatementLines.length,
          totalRevenue: mockIncomeStatementLines.find(l => l.lineCode === "NET_SALES")?.value || 0,
          netIncome: mockIncomeStatementLines.find(l => l.lineCode === "NET_INCOME")?.value || 0,
        }
      ],
    };

    return new Response(
      JSON.stringify(response),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error computing financials:", error);

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error.message,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});