import AppConstants from "../constants/AppConstants";

export const ApiManager = {

    /**
     * HTTP GET with react native fetch
     * @param url String url to be fetched
     * @param responseData response data callback
     * @param errorData error on response callback
     */
    getData(url, responseData, errorData) {

        console.log('get url ,', url);

        fetch(url, {
            method: 'GET',
        })
            .then((result) => result = result.json())
            .then((res) => {
                console.log('get response ,', res);
                responseData(res)
            })
            .catch((error) => {
                console.log('get error : ', error);
                if (error.message == "Network request failed" && !error.response) {
                    error.message = AppConstants.NETWORK_ERROR;
                } else {
                    error.message = AppConstants.SERVER_ERROR;
                }
                errorData(error);
            });
    },

}

