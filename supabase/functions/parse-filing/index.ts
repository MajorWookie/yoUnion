/*
  Edge function to parse SEC filing content and extract sections
  This is a placeholder implementation for the MVP
*/

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface ParseFilingRequest {
  filingId: string;
  secUrl: string;
  form: string;
}

interface FilingSection {
  itemCode: string;
  title: string;
  content: string;
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

    const { filingId, secUrl, form }: ParseFilingRequest = await req.json();

    // TODO: Implement actual parsing logic
    // 1. Fetch filing content from SEC URL
    // 2. Parse HTML/XBRL content
    // 3. Extract relevant sections based on form type
    // 4. Clean and normalize text content
    // 5. Store sections in database

    console.log("Parsing filing:", { filingId, form, secUrl });

    // Placeholder parsed sections
    const mockSections: FilingSection[] = [
      {
        itemCode: "1",
        title: "Business",
        content: "Sample business description content...",
      },
      {
        itemCode: "1A",
        title: "Risk Factors",
        content: "Sample risk factors content...",
      },
      {
        itemCode: "7",
        title: "Management's Discussion and Analysis",
        content: "Sample MD&A content...",
      },
    ];

    const response = {
      success: true,
      filingId,
      sectionsProcessed: mockSections.length,
      sections: mockSections.map((section) => ({
        itemCode: section.itemCode,
        title: section.title,
        contentLength: section.content.length,
      })),
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
    console.error("Error parsing filing:", error);

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