module.exports = {
  tsConfigFile: 'tsconfig.json',
  tsLintFile: 'tslint.json',

  packageFiles: [
    {
      src: 'package.json',
      base: '.',
      out: './dist',
      jsonTransform: (data, file) => { 
        if (!!data.scripts)
          delete data.scripts;
        if (!!data.devDependencies)
          delete data.devDependencies;
        return data;
      },
      jsonWhitespace: 2
    },
    {
      src: 'README.md',
      base: '.',
      out: './dist'
    },
    {
      src: 'LICENSE',
      base: '.',
      out: './dist'
    },
    {
      src: '.npmignore',
      base: '.',
      out: './dist'
    }
  ]
}
