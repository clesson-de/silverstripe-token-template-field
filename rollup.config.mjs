import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import scss from 'rollup-plugin-scss';
import replace from '@rollup/plugin-replace';
import * as sass from 'sass';

export default {
  input: 'client/src/TokenTemplateField/index.jsx',
  output: {
    file: 'client/dist/tokentemplatefield.js',
    format: 'iife',
  },
  plugins: [
    replace({
      preventAssignment: true,
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
    resolve({
      extensions: ['.js', '.jsx'],
      browser: true,
      preferBuiltins: false,
    }),
    commonjs(),
    babel({
      babelHelpers: 'bundled',
      extensions: ['.js', '.jsx'],
      presets: ['@babel/preset-env', '@babel/preset-react'],
      exclude: 'node_modules/**',
    }),
    scss({
      output: 'client/dist/tokentemplatefield.css',
      outputStyle: 'compressed',
      sass: sass,
    }),
  ],
};

