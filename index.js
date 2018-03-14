const request = require('request-promise-native');
const cheerio = require('cheerio');

async function Analysis(url) {
    let body = await request.get(url);
    let $ = cheerio.load(body, { decodeEntities: false });

    // Parse article's count
    let countText = $('div.qa-list__info').eq(0).find('span').eq(1).html();
    let countPattern = /(\d+)/i;
    let count = countText.match(countPattern)[0];
    let pageCount = Math.ceil(count / 10);

    // Parse articles link
    let articles = [];
    for (let i = 1; i <= pageCount; i++) {
        if (i > 1) {
            body = await request.get(`${url}?page=${i}`);
            $ = cheerio.load(body, { decodeEntities: false });
        }

        $('h3.qa-list__title a').each((i, element) => {
            let title = $(element).html().trim();
            let url = $(element).attr('href').trim();

            articles.push({title, url});
        })
    }

    console.log(articles);
}

let url = '';
Analysis(url)
    .then(() => console.log('Finished!'));