const axios = require('axios');

function processLOVData(data) {
  return data.results.map((item) => {
    const labelArray =
      item.highlight['http://www.w3.org/2000/01/rdf-schema#label@en'] ??
      item.highlight['http://www.w3.org/2000/01/rdf-schema#label'] ??
      Object.values(item.highlight)[0] ??
      [];

    const labelValue = labelArray
      .map((label) => label.replace(/<\/?b>/g, ''))
      .join(' ');

    const uriValue = Object.values(item.uri)[0];
    const delimiter = uriValue.includes('#') ? '#' : '/';

    const formatedUri = uriValue.substring(
      0,
      uriValue.lastIndexOf(delimiter) + 1,
    );

    return {
      uri: formatedUri,
      prefixedName: Object.values(item.prefixedName)[0],
      label: labelValue,
    };
  });
}

function processZazukoData(data) {
  return data.map((item) => {
    const uriValue = item.iri.value;
    const delimiter = uriValue.includes('#') ? '#' : '/';
    const formatedUri = uriValue.substring(
      0,
      uriValue.lastIndexOf(delimiter) + 1,
    );
    return {
      uri: formatedUri,
      prefixedName: item.prefixed,
      label: item.label,
    };
  });
}

function processAgroportalData(data) {
  return data.map((item) => {
    const uriValue = item.name;
    const delimiter = uriValue.includes('#') ? '#' : '/';
    const formatedUri = uriValue.substring(
      0,
      uriValue.lastIndexOf(delimiter) + 1,
    );

    const parts = uriValue.split('/');
    const prefix = parts[parts.length - 2];
    const suffix = uriValue.substring(uriValue.lastIndexOf(delimiter) + 1);
    return {
      uri: formatedUri,
      prefixedName: prefix + ':' + suffix,
      label: item.label,
    };
  });
}

function processBioPortalData(data) {
  return data.collection.map((item) => {
    const uriValue = item['@id'];
    const delimiter = uriValue.includes('#') ? '#' : '/';
    const formatedUri = uriValue.substring(
      0,
      uriValue.lastIndexOf(delimiter) + 1,
    );

    const parts = uriValue.split('/');
    const prefix = parts[parts.length - 2];
    const suffix = uriValue.substring(uriValue.lastIndexOf(delimiter) + 1);

    return {
      uri: formatedUri,
      prefixedName: prefix + ':' + suffix,
      label: item.prefLabel,
    };
  });
}

async function fetchExternalAPI(req, res) {
  const { term } = req.params;

  try {
    // const lovURL = `https://lov.linkeddata.es/dataset/lov/api/v2/term/search?q=${term}&type=class`;
    const zazukoURL = `https://prefix.zazuko.com/api/v1/search?q=${term}`;
    // const agroPortalURL = `https://agroportal.lirmm.fr/ajax/search/ontologies/content?ontologies=&types=&search=${term}`;
    const bioPortalURL = `https://data.bioontology.org/search?q=${term}&apikey=4f43ff51-95cd-478c-906a-225203b52b35&suggest=true`;

    const [responseZazuko, responseBioportal] = await Promise.all([
      // axios.get(lovURL),
      axios.get(zazukoURL),
      // axios.get(agroPortalURL),
      axios.get(bioPortalURL),
    ]);

    // const [responseLOV, responseZazuko, responseAgroportal, responseBioportal] =
    //   await Promise.all([
    //     axios.get(lovURL),
    //     axios.get(zazukoURL),
    //     axios.get(agroPortalURL),
    //     axios.get(bioPortalURL),
    //   ]);

    const processedData = {
      // lov: processLOVData(responseLOV.data),
      zazuko: processZazukoData(responseZazuko.data),
      // agroportal: processAgroportalData(responseAgroportal.data),
      bioportal: processBioPortalData(responseBioportal.data),
    };

    res.json(processedData);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
}

module.exports = { fetchExternalAPI };
