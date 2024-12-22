const CLIENT_ID = '551393977925-uaaeav21vc89nsg6lte4kjikk0okc21m.apps.googleusercontent.com';
const REDIRECT_URI = './main.html';

/**
* This codes are from Google's tutorial. Not much changes has been done to it as it's working perfectly.
*Create form to request access token from Google's OAuth 2.0 server.
*/
function oauth2SignIn() {
    // create random state value and store in local storage
    var state = generateCryptoRandomState();
    localStorage.setItem('state', state);
    if (localStorage.getItem('oauth2-params') !== null) {
        localStorage.removeItem('oauth2-params');
    }

    // Google's OAuth 2.0 endpoint for requesting an access token
    var oauth2Endpoint = 'https://accounts.google.com/o/oauth2/v2/auth';

    // Create element to open OAuth 2.0 endpoint in new window.
    var form = document.createElement('form');
    form.setAttribute('method', 'GET'); // Send as a GET request.
    form.setAttribute('action', oauth2Endpoint);

    // Parameters to pass to OAuth 2.0 endpoint.
    var params = {'client_id': CLIENT_ID,
                    'redirect_uri': REDIRECT_URI,
                    'scope': 'https://www.googleapis.com/auth/youtube.force-ssl',
                    'state': state,
                    'include_granted_scopes': 'true',
                    'response_type': 'token',
                };

    // Add form parameters as hidden input values.
    for (var p in params) {
        var input = document.createElement('input');
        input.setAttribute('type', 'hidden');
        input.setAttribute('name', p);
        input.setAttribute('value', params[p]);
        form.appendChild(input);
    }

    // Add form to page and submit it to open the OAuth 2.0 endpoint.
    document.body.appendChild(form);
    form.submit();
}

/**
 * Function to generate a random state value
 * 
 * @returns 
 */
function generateCryptoRandomState() {
    const randomValues = new Uint32Array(2);
    window.crypto.getRandomValues(randomValues);

    // Encode as UTF-8
    const utf8Encoder = new TextEncoder();
    const utf8Array = utf8Encoder.encode(
        String.fromCharCode.apply(null, randomValues)
    );

    // Base64 encode the UTF-8 data
    return btoa(String.fromCharCode.apply(null, utf8Array))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

export {
    oauth2SignIn
}