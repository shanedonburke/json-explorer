var ghpages = require('gh-pages');

ghpages.publish(
    'public', // path to public directory
    {
        branch: 'gh-pages',
        repo: 'https://github.com/shanedonburke/json-explorer.git',
        user: {
            name: 'Shane Burke'
        }
    },
    () => {
        console.log('Deploy Complete!')
    }
)