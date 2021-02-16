
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import babel from '@rollup/plugin-babel';
import { uglify } from 'rollup-plugin-uglify';
// import analyzer from 'rollup-plugin-analyzer';
import visualizer from 'rollup-plugin-visualizer';


const extensions = ['.js', '.jsx'];

export default {
	input: {
		index: 'src/index.js',
		field: 'src/Components/Field/index.jsx',
		provider: 'src/Components/Provider/index.jsx'
	},
	output: [
		{
			dir: 'build',
			format: 'cjs',
			exports: 'named',
			sourcemap: true,
			strict: false
		},
	],
	plugins: [
		peerDepsExternal(),
		resolve({
			extensions
		}),
		babel({
			exclude: './node_modules/**',
			extensions,
			presets: ['@babel/env', '@babel/preset-react']
		}),
		commonjs(),
		uglify(),
		visualizer(),
		// analyzer(),

	],
	external: ['react', 'react-dom']
};