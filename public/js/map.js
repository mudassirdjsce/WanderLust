

const getData = async (location) => {
    try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=jsonv2`;
        const response = await fetch(url, { headers: { "Accept-Language": "en" } });
        const data = await response.json();
        return data;
    } catch (err) {
        console.warn("Could not fetch map coordinates:", err);
        return [];
    }
};

const initMap = async () => {
    const mapElement = document.getElementById("map");
    if (!mapElement || typeof listing === "undefined") return;

    let lat = 28.6139;
    let lon = 77.2090;

    try {
        const queryLocation = `${listing.location || ""}, ${listing.country || ""}`.trim();
        const data = await getData(queryLocation || listing.location);

        if (data && data.length > 0) {
            lat = Number(data[0].lat);
            lon = Number(data[0].lon);
        }
    } catch (e) {
        console.warn("Using default coordinates for map:", e);
    }

    const map = L.map("map").setView([lat, lon], 10);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    const marker = L.marker([lat, lon]).addTo(map);
    marker.bindPopup(`
        <div style="font-family: inherit; font-size: 0.9rem;">
            <strong style="color: #fe424d;">${listing.title}</strong><br>
            <span>${listing.location}, ${listing.country}</span><br>
            <small style="color: #717171;">Exact location provided upon booking</small>
        </div>
    `).openPopup();
};

initMap();

