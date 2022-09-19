import {rmSync} from 'fs'
import {join} from 'path'
import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import electron from 'vite-plugin-electron'
import pkg from './package.json'
// const path = require('path')
import path from "path-browserify"
import optimizer from 'vite-plugin-optimizer'

rmSync('dist', {recursive: true, force: true}) // v14.14.0


// https://vitejs.dev/config/
export default defineConfig({
    build: {
        outDir: "dist",
        chunkSizeWarningLimit: 5500,
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        return id.toString().split('node_modules/')[1].split('/')[0].toString();
                    }
                }
            }
        }
    },
    resolve: {
        alias: {
            '@': path.join(__dirname, 'src'),
            path: "path-browserify",
        }
    },
    css: {
        postcss: {
            plugins: [

                {
                    postcssPlugin: 'internal:charset-removal',
                    AtRule: {
                        charset: (atRule) => {
                            if (atRule.name === 'charset') {
                                atRule.remove();
                            }
                        }
                    }
                }
            ],
        },
    }, plugins: [
        optimizer({
            electron: `const { ipcRenderer } = require('electron'); export { ipcRenderer };`,
            fs: () => ({
                // this is consistent with the `alias` behavior
                find: /^(node:)?fs$/,
                code: `const fs = require('fs'); export { fs as default }`
            }),
        }),
        vue(),
        electron({

            main: {
                entry: 'src/electron/index.ts',
                vite: {
                    resolve: {
                        alias: {
                            '@': path.join(__dirname, 'src'),
                        }
                    },
                    build: {
                        outDir: 'dist/electron/main',
                    },
                },
            },
            preload: {
                input: {
                    // You can configure multiple preload here
                    index: join(__dirname, 'src/electron/preload/index.ts'),
                },
                vite: {
                    resolve: {
                        alias: {
                            '@': path.join(__dirname, 'src'),
                        }
                    },
                    build: {
                        // For debug
                        sourcemap: 'inline',
                        outDir: 'dist/electron/preload',
                    },
                },
            },
            // Enables use of Node.js API in the Renderer-process
            renderer: {},
        }),
    ],
    server: {
        host: pkg.env.VITE_DEV_SERVER_HOST,
        port: pkg.env.VITE_DEV_SERVER_PORT,
    },

})
