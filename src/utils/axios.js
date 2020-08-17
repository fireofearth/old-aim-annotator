import axios from 'axios';

// Need X-CSRFTOKEN header for Django
// https://vsupalov.com/avoid-csrf-errors-axios-django/
// CSRF Error. You need to include valid CSRF tokens for any POST, PUT, PATCH or DELETE operations. You have to include CSRF token in the POST data or add the token to the HTTP header.

/**
 * withCredentials toggles XMLHttpRequests.withCredentials
 *  
 * https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials 
 */
axios.defaults.withCredentials = true

axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.xsrfHeaderName = "X-CSRFTOKEN"

export default axios;