/**
 * Cloudflare Pages Function: /api/whitepaper-lead
 * Receives whitepaper form submissions and creates a Person + Deal in Pipedrive.
 *
 * Environment variable required:
 *   PIPEDRIVE_API_KEY — set in Cloudflare Pages > Settings > Environment Variables
 */

export async function onRequestPost(context) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': 'https://nthlayer.co.uk',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const body = await context.request.json();
    const { name, jobtitle, company, email } = body;

    if (!name || !email) {
      return new Response(JSON.stringify({ error: 'Name and email required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const apiKey = context.env.PIPEDRIVE_API_KEY;
    if (!apiKey) {
      console.error('PIPEDRIVE_API_KEY not set');
      return new Response(JSON.stringify({ error: 'Server config error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const baseUrl = 'https://api.pipedrive.com/v1';

    // 1. Search for existing person by email
    const searchRes = await fetch(
      `${baseUrl}/persons/search?term=${encodeURIComponent(email)}&fields=email&api_token=${apiKey}`
    );
    const searchData = await searchRes.json();
    let personId = null;

    if (searchData.data && searchData.data.items && searchData.data.items.length > 0) {
      personId = searchData.data.items[0].item.id;
    }

    // 2. Create person if not found
    if (!personId) {
      const personRes = await fetch(`${baseUrl}/persons?api_token=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name,
          email: [{ value: email, primary: true, label: 'work' }],
          org_id: null, // will link via deal
          job_title: jobtitle || '',
        }),
      });
      const personData = await personRes.json();
      if (!personData.success) {
        console.error('Person creation failed:', JSON.stringify(personData));
        return new Response(JSON.stringify({ error: 'Failed to create contact' }), {
          status: 502,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
      personId = personData.data.id;
    }

    // 3. Create or find organization
    let orgId = null;
    if (company) {
      const orgSearchRes = await fetch(
        `${baseUrl}/organizations/search?term=${encodeURIComponent(company)}&api_token=${apiKey}`
      );
      const orgSearchData = await orgSearchRes.json();
      if (orgSearchData.data && orgSearchData.data.items && orgSearchData.data.items.length > 0) {
        orgId = orgSearchData.data.items[0].item.id;
      } else {
        const orgRes = await fetch(`${baseUrl}/organizations?api_token=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: company }),
        });
        const orgData = await orgRes.json();
        if (orgData.success) {
          orgId = orgData.data.id;
        }
      }
    }

    // 4. Create deal in "Nth Layer" pipeline (id=4), stage "White Paper Download" (id=25)
    const dealRes = await fetch(`${baseUrl}/deals?api_token=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: `Whitepaper — ${name} (${company || 'Unknown'})`,
        person_id: personId,
        org_id: orgId,
        pipeline_id: 4,
        stage_id: 25,
        status: 'open',
        visible_to: 3, // entire company
      }),
    });
    const dealData = await dealRes.json();

    if (!dealData.success) {
      console.error('Deal creation failed:', JSON.stringify(dealData));
      return new Response(JSON.stringify({ error: 'Failed to create deal' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // 5. Add note to the deal with full form data
    await fetch(`${baseUrl}/notes?api_token=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deal_id: dealData.data.id,
        content: `Whitepaper download\nName: ${name}\nJob Title: ${jobtitle || 'N/A'}\nCompany: ${company || 'N/A'}\nEmail: ${email}\nSource: nthlayer.co.uk whitepaper form\nDate: ${new Date().toISOString()}`,
      }),
    });

    return new Response(JSON.stringify({ success: true, deal_id: dealData.data.id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (err) {
    console.error('Whitepaper lead handler error:', err.message);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}

// Handle CORS preflight
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': 'https://nthlayer.co.uk',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}
