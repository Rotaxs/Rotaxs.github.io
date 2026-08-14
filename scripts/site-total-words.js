'use strict';

const { stripHTML } = require('hexo-util');

const getWordCount = (post) => {
  const content = stripHTML(post.origin || post.content).replace(/[\s\r\n]/g, '');
  return content.length;
};

hexo.extend.filter.register('after_render:html', function (str, data) {
  if (!str.includes('site-total-words')) return str;

  let count = 0;
  hexo.locals.get('posts').each((post) => {
    count += getWordCount(post);
  });

  return str.replace(
    /<span id="site-total-words">[\s\S]*?<\/span>/,
    `<span id="site-total-words">博客总字数 ${count.toLocaleString()} 字</span>`
  );
});