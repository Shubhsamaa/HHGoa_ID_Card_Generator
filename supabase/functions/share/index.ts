import { createClient } from "npm:@supabase/supabase-js@2.111.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

const EVENT_NAME = "HH GOA 2026";
const EVENT_URL = "hhgoa.build";
const HASHTAG = "#FrameInGoa";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    // Path: /functions/v1/share/<id>
    const segments = url.pathname.split("/").filter(Boolean);
    const id = segments[segments.length - 1];

    // If no ID, redirect to the app.
    if (!id || id === "share") {
      return new Response(null, {
        status: 302,
        headers: { ...corsHeaders, Location: "https://" + EVENT_URL },
      });
    }

    // If this looks like a bot (Twitterbot, FacebookExternalHit, Slackbot, etc.),
    // serve the HTML with OG tags. Otherwise redirect to the app so humans
    // land on the tool.
    const userAgent = req.headers.get("user-agent") || "";
    const isBot = /twitterbot|facebookexternalhit|slackbot|linkedinbot|telegrambot|whatsapp|discordbot|googlebot|bingbot|applebot|skypeuripreview/i.test(
      userAgent,
    );

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Fetch the graphic record.
    const { data, error } = await supabase
      .from("graphics")
      .select("format, name, stack, title, caption, image_path, created_at")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) {
      // Serve a generic OG page if the record isn't found.
      return serveOgPage(
        EVENT_NAME + " — Frame Builder",
        "Upload your photo and get a branded HH Goa 2026 graphic to share on X.",
        getFallbackImageUrl(supabaseUrl),
        EVENT_URL,
        isBot,
      );
    }

    const imageUrl = `${supabaseUrl}/storage/v1/object/public/graphics/${data.image_path}`;
    const title =
      data.format === "card"
        ? `${data.name || "Builder"} — ${data.title} | ${EVENT_NAME}`
        : `${EVENT_NAME} — Builder PFP Frame`;
    const description =
      data.format === "card"
        ? `${data.name || "A builder"} is ${data.title} at ${EVENT_NAME}. ${HASHTAG}`
        : `Repping at ${EVENT_NAME}. ${HASHTAG}`;

    return serveOgPage(title, description, imageUrl, EVENT_URL, isBot, data.caption);
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function serveOgPage(
  title: string,
  description: string,
  imageUrl: string,
  siteUrl: string,
  isBot: boolean,
  tweetText?: string,
): Response {
  // For real users, redirect to the app so they can make their own.
  // For bots, serve the full HTML with OG tags so the link preview shows
  // the generated graphic.
  if (!isBot) {
    return new Response(null, {
      status: 302,
      headers: { ...corsHeaders, Location: "https://" + siteUrl },
    });
  }

  const safeTitle = escapeHtml(title);
  const safeDesc = escapeHtml(description);
  const escapedTweet = tweetText ? escapeHtml(tweetText) : "";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeTitle}</title>
  <meta name="description" content="${safeDesc}" />
  <meta property="og:title" content="${safeTitle}" />
  <meta property="og:description" content="${safeDesc}" />
  <meta property="og:image" content="${imageUrl}" />
  <meta property="og:image:width" content="1080" />
  <meta property="og:image:height" content="1350" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://${siteUrl}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${safeTitle}" />
  <meta name="twitter:description" content="${safeDesc}" />
  <meta name="twitter:image" content="${imageUrl}" />
  ${escapedTweet ? `<meta name="twitter:image:alt" content="${escapedTweet}" />` : ""}
</head>
<body>
  <p>${safeDesc}</p>
  <img src="${imageUrl}" alt="${safeTitle}" />
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
  });
}

function getFallbackImageUrl(supabaseUrl: string): string {
  return `${supabaseUrl}/storage/v1/object/public/graphics/fallback.png`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
