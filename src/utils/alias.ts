import moduleAlias from 'module-alias';

const _rootDir = __dirname.replace(
    '/utils',
    ''
);

const _resolve = (s) => _rootDir + '/' + s;

moduleAlias.addAliases({
    '@root': _rootDir,
    '@types': _resolve('types'),
    '@models': _resolve('models'),
    '@utils': _resolve('utils')
});