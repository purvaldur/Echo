import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { request } from "undici";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        {
            // custom plugin for handling certain requests
            configureServer(server) {
                server.middlewares.use(async (req,res,next) => {
                    if (req.url.startsWith('/oauth2')) {
                        const fragment = new URLSearchParams(req._parsedUrl.query)
                        const code = fragment.get('code')

                        console.log(code);

                        const clientId = "508723276445646868"
                        const clientSecret = process.env.CLIENT_SECRET
                        const port = 3000
                        
                        const tokenResponseData = await request('https://discord.com/api/oauth2/token', {
			            	method: 'POST',
			            	body: new URLSearchParams({
			            		client_id: clientId,
			            		client_secret: clientSecret,
			            		code,
			            		grant_type: 'authorization_code',
			            		redirect_uri: `http://localhost:${port}/oauth2`,
			            		scope: 'identify',
			            	}).toString(),
			            	headers: {
			            		'Content-Type': 'application/x-www-form-urlencoded',
			            	},
			            })
                    
			            const oauthData = await tokenResponseData.body.json();
			            console.log(oauthData)
                    }


                    next()
                })
            }
        }
    ],
    envPrefix: 'WEB_',
    server: {
        port: 3000,
        host: true
    }
})
