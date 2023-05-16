function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}


async function getCleanVideoUrl(link) {
    if (!isValidUrl(link)) {
        console.log('Некорректная ссылка.');
        return link;
    }
    const url = new URL(link);
    const searchParams = new URLSearchParams(url.search);

    if (searchParams.has("list") || searchParams.has("index") || searchParams.has("t")) {
        searchParams.delete("t");
        searchParams.delete("index");
        searchParams.delete("list");
        url.search = searchParams.toString();
    }

    if (url.hostname === "youtu.be") {
        const videoId = url.pathname.substr(1);
        url.host = "www.youtube.com";
        url.pathname = "/watch";
        url.searchParams.set("v", videoId);
    }

    return url.toString();
}









module.exports = { getCleanVideoUrl }
