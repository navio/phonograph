import OpenAPIClientAxios from 'openapi-client-axios';

const DEFINTION = "https://listen-api.listennotes.com/api/v2/openapi.json";

const AXIOSCONFIGDEFAULTS = {
    headers: {
        'X-ListenAPI-Key': '5b7650d15f5b4edea86257fe42791e22',
    },
};

export default function API(definition = DEFINTION, axiosConfigDefaults = AXIOSCONFIGDEFAULTS) {
    const api = new OpenAPIClientAxios({ definition, axiosConfigDefaults });
    return api.init();
    //return await api.getClient();
};
