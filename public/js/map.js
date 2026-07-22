

const getData = async (location) => {
    const url =
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=jsonv2`;

    const response = await fetch(url);

    const data = await response.json();

    return data;
};

const initMap = async () => {

    const data = await getData(listing.location);

    console.log(data);

    const lat = Number(data[0].lat);
    const lon = Number(data[0].lon);

    const map = L.map("map").setView([lat,lon], 9);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 13
    }).addTo(map);

    L.marker([lat, lon])
        .addTo(map)
        .bindPopup(`<h4><b>${listing.title}</b></h4>Exact Location will be provided after booking`);
        
};

initMap();

