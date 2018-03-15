const request = require('request-promise-native');
const cheerio = require('cheerio');
const Epub = require('epub-gen');

async function GenerateEbook(url, outputPath) {
    let body = await request.get(url);
    let $ = cheerio.load(body, { decodeEntities: false });

    // Parse article's information
    let countText = $('div.qa-list__info').eq(0).find('span').eq(1).html();
    let countPattern = /(\d+)/i;
    let count = countText.match(countPattern)[0];
    let pageCount = Math.ceil(count / 10);
    let title = $('h3.qa-list__title').html().replace(/<[^>]*>/g,"").trim();
    let author = $('div.profile-header__name').html().replace(/<[^>]*>/g,"").trim();

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

            articles.push({ title, url });
        });
    }

    // Fetch articles
    for (const article of articles) {
        console.log(`Fetching article: ${article.title}`);

        let body = await request.get(article.url);
        let $ = cheerio.load(body, { decodeEntities: false });

        article.data = $('div.markdown .markdown__style').html().trim();
        delete article.url;
    }

    // Generate epub
    let options = {
        title: title,
        author: author,
        appendChapterTitles: false,
        content: articles
    }

    await new Epub(options, outputPath).promise;
}

let url = '';
let outputPath = 'test.epub'
GenerateEbook(url, outputPath)
    .then(() => console.log('Finished!'));