import ghpages from 'gh-pages';

ghpages.publish(
    'public',
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