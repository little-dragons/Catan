import { readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue()
    ],
    server: {
        https: process.env.NODE_ENV !== 'production' ? undefined : {
            key: readFileSync(`${process.env.SSL_DIR}/privkey.pem`),
            cert: readFileSync(`${process.env.SSL_DIR}/fullchain.pem`)
        }
    },
    resolve: {
        alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    }
})
