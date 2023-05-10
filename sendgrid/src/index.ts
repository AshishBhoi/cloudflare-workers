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

const handler: ExportedHandler = {
    // @ts-ignore "STUPID ERROR"
    async fetch(request: Request, env: Env) {

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

        const init = {
            body: JSON.stringify(message_full),
            method: "POST",
            headers: {
                "content-type": "application/json;charset=UTF-8",
                "Authorization": "Bearer " + env.SENDGRID_API
            },
        };
        const response = await fetch(url, init);
        const results = await gatherResponse(response);
        return new Response(results, {
            status: response.status,
            headers: {
                "content-type": "application/json;charset=UTF-8",
            }
        });
    },
};

export default handler;