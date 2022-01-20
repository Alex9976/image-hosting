export function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        let date = new Date();
        date.setTime(date.getTime() + (days * 24 * 3600 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

export function getCookie(name) {
    let nameEQ = name + "=";
    let cookie = document.cookie.split(';');
    for (let i = 0; i < cookie.length; i++) {
        let char = cookie[i];
        while (char.charAt(0) === ' ') char = char.substring(1, char.length);
        if (char.indexOf(nameEQ) === 0) return char.substring(nameEQ.length, char.length);
    }
    return null;
}

export function eraseCookie(name) {
    document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}