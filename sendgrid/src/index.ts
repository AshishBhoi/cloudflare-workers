export interface Env {
    SENDGRID_API: string
}

export interface MessageBody {
    first_name: string
    middle_name: string
    last_name: string
    message_email: string
    message_subject: string
    message: string
}

async function gatherResponse(response: Response) {
    const {headers} = response;
    const contentType = headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
        return JSON.stringify(await response.json());
    } else if (contentType.includes("application/text")) {
        return response.text();
    } else if (contentType.includes("text/html")) {
        return response.text();
    } else {
        return response.text();
    }
}

async function handleOptions(request: Request) {
    const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST,OPTIONS",
        "Access-Control-Max-Age": "86400",
    };
    if (
        request.headers.get("Origin") !== null &&
        request.headers.get("Access-Control-Request-Method") !== null &&
        request.headers.get("Access-Control-Request-Headers") !== null
    ) {
        const headers = request.headers.get("Access-Control-Request-Headers")
        // Handle CORS preflight requests.
        if (headers) {
            return new Response(null, {
                headers: {
                    ...corsHeaders,
                    "Access-Control-Allow-Headers": headers
                },
            });
        }
        return new Response(null, {
            headers: {
                ...corsHeaders,
                "Access-Control-Allow-Headers": ""
            },
        });
    } else {
        // Handle standard OPTIONS request.
        return new Response(null, {
            headers: {
                Allow: "POST, OPTIONS",
            },
        });
    }
}

const handler: ExportedHandler = {
    // @ts-ignore "STUPID ERROR"
    async fetch(request: Request, env: Env) {
        const corsHeaders = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST,OPTIONS",
            "Access-Control-Max-Age": "86400",
        };

        const body : MessageBody = JSON.parse(JSON.stringify(await request.json()))

        const message =
            `
            Name: ${body?.first_name} ${body?.middle_name} ${body?.last_name}rn
            Email: ${body?.message_email}rn
            Message: ${body?.message}
            `

        const url = "https://api.sendgrid.com/v3/mail/send";
        const message_full = {
            personalizations: [
                {
                    to: [
                        {
                            email: "ashish@ashishbhoi.com"
                        }
                    ],
                    subject: "Contact Message From Website"
                }
            ],
            content: [
                {
                    type: "text/html",
                    value: message.replace(/rn/g, '<br />')
                }
            ],
            from: {
                email: "no-reply@ashishbhoi.com",
                name: "NO-REPLY"
            }
        };

        const response = await fetch(url, {
            body: JSON.stringify(message_full),
            method: "POST",
            headers: {
                "content-type": "application/json;charset=UTF-8",
                "Authorization": "Bearer " + env.SENDGRID_API
            },
        });

        const results = await gatherResponse(response);
        if (request.method === "POST") {
            return new Response(results, {
                status: response.status,
                headers: {
                    "content-type": "application/json;charset=UTF-8",
                    ...corsHeaders
                }
            });
        }
        else if (request.method === "OPTIONS") {
            // Handle CORS preflight requests
            return handleOptions(request);
        }
        return new Response(new Blob(), {
            status: 401, statusText: "Method not allowed",
             headers: {
                 ...corsHeaders,
             }
        })
    },
};

export default handler;