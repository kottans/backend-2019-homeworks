const readBody = req =>
  new Promise(resolve => {
    const chunks = [];

    req.on('data', chunk => {
      chunks.push(chunk);
    });

    req.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
  });

const parseJson = async req => readBody(req).then(JSON.parse);

const validValueCondition = value =>
  Number.isFinite(value) || typeof value === 'string';

const parsedBodyValues = req =>
  parseJson(req).then(body =>
    Object.keys(body).reduce((acc, key) => {
      if (['add', 'successor', 'remove'].includes(key)) {
        if (!validValueCondition(body[key]))
          throw SyntaxError(
            `'${body[key]}' should be of type 'string' or 'number'.`
          );
        return { ...acc, [key]: body[key] };
      }
      return acc;
    }, {})
  );

module.exports = parsedBodyValues;
