import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import fs from 'fs';
// export default defineConfig({
//     plugins: [
//         laravel({
//             input: ['resources/js/app.jsx'],
//             refresh: true,
//         }),
//         react(),
//     ],
// });

const host = 'messenger.test';

export default defineConfig({
    plugins: [
        laravel({
            input: [
                'resources/js/app.jsx',
                'resources/css/app.css'
            ],
            detectTls: host,
            refresh: true,
        }),
        react(),
    ],
    server: {
        host,
        hmr: { host },
        https: {
            key: fs.readFileSync(`/Users/molly/.config/valet/Certificates/${host}.key`),
            cert: fs.readFileSync(`/Users/molly/.config/valet/Certificates/${host}.crt`),
        }
    }
});
