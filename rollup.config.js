import babel from 'rollup-plugin-babel';
import svelte from 'rollup-plugin-svelte';
import scss from 'rollup-plugin-scss';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import livereload from 'rollup-plugin-livereload';
import {terser} from 'rollup-plugin-terser';
import autoPreprocess from 'svelte-preprocess';
import replace from '@rollup/plugin-replace';
import dotenv from 'dotenv';
const fs = require('fs');
const path = require('path');
import copy from 'rollup-plugin-copy';


dotenv.config();
const x = process.env.__COMMIT_DETAILS;
const production = process.env.__prod === 'true';

function serve() {
    let server;

    function toExit() {
        if (server) server.kill(0);
    }

    return {
        writeBundle() {
            if (server) return;
            server = require('child_process').spawn('npm', ['run', 'start', '--', '--dev'], {
                stdio: ['ignore', 'inherit', 'inherit'],
                shell: true
            });

            process.on('SIGTERM', toExit);
            process.on('exit', toExit);
        }
    };
}

export default {
    input: 'src/index2.js',
    output: {
        sourcemap: !production,
        format: 'iife',
        name: 'app',
        file: 'public/build/bundle.js'
    },
    plugins: [
        replace({
            __IS_EMBED_MODE: JSON.stringify(process.env.__IS_EMBED_MODE),
            __MODE: JSON.stringify(process.env.__MODE),
            __deployRoot: JSON.stringify(process.env.__deployRoot),
            __COMMIT_DETAILS: x,
            __ROOT__: production? 'https://imi-engage-wc-dev.netlify.app/': '',
            'process.env.NODE_ENV': JSON.stringify( 'production' )
        }),
        copy({
            targets: [
                { src: `node_modules/@momentum-ui/icons/fonts`, dest: `public/` },
                { src: `node_modules/@momentum-ui/icons/fonts`, dest: `public/icons/` },
                { src: `node_modules/@momentum-ui/icons/css/momentum-ui-icons.css`, dest: `public/css` },
                { src: `node_modules/@momentum-ui/icons/css/momentum-ui-icons.min.css`, dest: `public/css` },
                { src: `node_modules/@momentum-ui/core/css/momentum-ui.css`, dest: `public/css` },
            ]
        }),
        json(),
        svelte({
            // enable run-time checks when not in production
            dev: !production,
            // we'll extract any component CSS out into
            // a separate file - better for performance
            css: css => {
                css.write('bundle.css', !production);
            },
            preprocess: autoPreprocess()
        }),

        scss({
            output: 'public/build/globalX.css',
            include: ['/**/*.scss'] // do not include Svelte-generated *.css files
        }),

        // If you have external dependencies installed from
        // npm, you'll most likely need these plugins. In
        // some cases you'll need additional configuration -
        // consult the documentation for details:
        // https://github.com/rollup/plugins/tree/master/packages/commonjs
        resolve({
            browser: true,
            dedupe: ['svelte'],
        }),
        commonjs(),
        babel({
            plugins: ['@babel/plugin-proposal-class-properties'],
            extensions: ['.js', '.jsx', '.es6', '.es', '.mjs', '.vue', '.html', '.svelte'],
            runtimeHelpers: true,
        }),

        // In dev mode, call `npm run start` once
        // the bundle has been generated
        !production && serve(),

        // Watch the `public` directory and refresh the
        // browser on changes when not in production
        !production && livereload('public'),

        // If we're building for production (npm run build
        // instead of npm run dev), minify
        production && terser()
    ],
    watch: {
        clearScreen: false
    }
};
