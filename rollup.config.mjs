import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import esbuild from 'rollup-plugin-esbuild';


const actionBundleConfigurations = [
    {
        input: 'src/actions/publish-github-release/index.ts',
        plugins: [
            nodeResolve({
                preferBuiltins: true,
            }),
            commonjs(),
            esbuild({
                target: 'node24',
            }),
        ],
        output: {
            file: '.github/actions/publish-github-release/dist/index.cjs',
            format: 'cjs',
            exports: 'auto',
        },
    },
    {
        input: 'src/actions/publish-npm-package/index.ts',
        plugins: [
            nodeResolve({
                preferBuiltins: true,
            }),
            commonjs(),
            esbuild({
                target: 'node24',
            }),
        ],
        output: {
            file: '.github/actions/publish-npm-package/dist/index.cjs',
            format: 'cjs',
            exports: 'auto',
        },
    },
    {
        input: 'src/actions/bump-trb-project-node-version/index.ts',
        plugins: [
            nodeResolve({
                preferBuiltins: true,
            }),
            commonjs(),
            esbuild({
                target: 'node24',
            }),
        ],
        output: {
            file: '.github/actions/bump-trb-project-node-version/dist/index.cjs',
            format: 'cjs',
            exports: 'auto',
        },
    },
];


export default actionBundleConfigurations;
