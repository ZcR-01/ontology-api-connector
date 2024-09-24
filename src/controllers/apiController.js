const axios = require('axios');

function processLOVData(data) {
  return data.results.map((item) => {
    const labelArray =
      item.highlight['http://www.w3.org/2000/01/rdf-schema#label@en'] ??
      item.highlight['http://www.w3.org/2000/01/rdf-schema#label'] ??
      Object.values(item.highlight)[0] ??
      [];

    let labelValue = 'undefined';

    labelValue = labelArray
      .map((label) => label.replace(/<\/?b>/g, ''))
      .join(' ');

    return {
      uri: item.uri,
      prefixedName: item.prefixedName,
      label: labelValue,
    };
  });
}

async function fetchExternalAPI(req, res) {
  const { term } = req.params;

  try {
    const lovURL = `https://lov.linkeddata.es/dataset/lov/api/v2/term/search?q=${term}&type=class`;

    const response = await axios.get(lovURL);

    response.data = processLOVData(response.data);

    res.send(response.data);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
}

module.exports = { fetchExternalAPI };
