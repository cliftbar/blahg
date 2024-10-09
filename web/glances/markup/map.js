const layerIdPrefix = 'tracks-'
let map = new maplibregl.Map({
    container: 'map', // container id
    // style: 'https://demotiles.maplibre.org/style.json', // style URL
    // https://github.com/nst-guide/osm-liberty-topo
    style: "https://raw.githubusercontent.com/nst-guide/osm-liberty-topo/gh-pages/style.json",
    center: [-121.69, 45.37], // starting position [lng, lat]
    zoom: 10 // starting zoom
});
map.on("load", () => {init()});
function init() {
    maplibregl.addProtocol('gpx', VectorTextProtocol.VectorTextProtocol);

    document.getElementById("inputTrackColor").value = randomPastelColors()

    map.on('idle', () => {
        // Add the layer selector
        layerSelector(map, layerIdPrefix);
    });

    const urlParams = new URLSearchParams(window.location.search);
    const myParam = urlParams.get('track');
    trackFromUrl(myParam, myParam);
}
function guessInputType(ipt){
    if (ipt.includes(".gpx")) {
        return "gpx://"
    } else if (ipt.includes(".json")) {
        return ""
    } else {
        console.error("couldn't identify input type");
    }
}

function fetchTrack() {
    let url = document.getElementById("inputUrl").value;
    const sourceName = document.getElementById("inputTrackLabel").value || url;
    trackFromUrl(url, sourceName);
}

function trackFromUrl(url, sourceName) {
    fetch(url).then(r => {

        return r.text()
    }).then(content => {
        const inputBlob = new Blob([content], { type: 'text/plain' });

        const blobUrl = guessInputType(url) + URL.createObjectURL(inputBlob);

        let color = document.getElementById("inputTrackColor").value;

        map.addSource(sourceName, {
            'type': 'geojson',
            'data': blobUrl,
        });
        map.addLayer({
            'id': layerIdPrefix + sourceName,
            'type': 'line',
            'source': sourceName,
            'minzoom': 0,
            'maxzoom': 20,
            'paint': {
            'line-color': color,
            'line-width': 5
            }
        });
        zoomToSource(sourceName)
        document.getElementById("inputTrackColor").value = randomPastelColors()
    })
}

function addTrack() {
    const file = document.getElementById("inputFile").files[0]; // Read first selected file
    const sourceName = document.getElementById("inputTrackLabel").value || file.name;
    console.log(file)

    const reader = new FileReader();

    reader.onload = function (theFile) {

        const gpxContent = theFile.target.result;

        const inputBlob = new Blob([gpxContent], { type: 'text/plain' });
            // Create a data URL from the Blob
        const blobUrl = guessInputType(file.name) + URL.createObjectURL(inputBlob);
        let color = document.getElementById("inputTrackColor").value;


        map.addSource(sourceName, {
            'type': 'geojson',
            'data': blobUrl,
        });
        map.addLayer({
            'id': layerIdPrefix + sourceName,
            'type': 'line',
            'source': sourceName,
            'minzoom': 0,
            'maxzoom': 20,
            'paint': {
            'line-color': color,
            'line-width': 5
            }
        });
        zoomToSource(sourceName)
        document.getElementById("inputTrackColor").value = randomPastelColors()
    }
    reader.readAsText(file, 'UTF-8');
}

function removeTrack(evt) {
    let tgt = evt.target;
    let layerId = tgt.value;
    const prefixRegexp = new RegExp(`^${layerIdPrefix}`);
    let sourceId = layerId.replace(prefixRegexp, '');
    map.removeLayer(layerId);
    map.removeSource(sourceId);

    let elmId = "cbx_" + layerId;
    document.getElementById("li_" + elmId).remove();
//    document.getElementById("lbl_" + elmId).remove();
//    document.getElementById("btn_" + elmId).remove();
}

function zoomToSource(source) {
    map.getSource(source).getData().then(d => {
            const coordinates = d.features[0].geometry.coordinates;

        // Pass the first coordinates in the LineString to `lngLatBounds` &
        // wrap each coordinate pair in `extend` to include them in the bounds
        // result. A variation of this technique could be applied to zooming
        // to the bounds of multiple Points or Polygon geometries - it just
        // requires wrapping all the coordinates with the extend method.
        let bounds = coordinates.reduce((bounds, coord) => {
            return bounds.extend(coord);
        }, new maplibregl.LngLatBounds(coordinates[0], coordinates[0]));
        return bounds;
        }).then(bounds => {
            map.fitBounds(bounds, {
                padding: 20
            });
        })
}

function layerSelector (map, prefix) {
    // Enumerate ids of the layers
    const prefixRegexp = new RegExp(`^${prefix}`);
    const toggleableLayerIds = Object.keys(map.style._layers)
      .filter(name => name.match(prefixRegexp));

    toggleableLayerIds.forEach(layerId => {
        // Make the name nicer
        const layerName = layerId.replace(prefixRegexp, '');

        let elmId = "cbx_" + layerId;

        if (!document.getElementById(elmId)) {

            // Create a link.
            let link = document.createElement('input');
            link.id = elmId;
            link.type = "checkbox"
            link.className = 'active';
            link.value = layerId
            link.checked = true

            let label = document.createElement("label")
            label.id = "lbl_" + elmId
            label.htmlFor = elmId
            label.textContent = layerName

            let btn = document.createElement("button")
            btn.id = "btn_" + elmId
            btn.type = "button";
            btn.onclick = removeTrack;
            btn.textContent = "X"
            btn.value = layerId

            // Show or hide layer when the toggle is clicked.
            link.onchange = function (e) {
                const clickedLayer = this.value;
                e.preventDefault();
                e.stopPropagation();

                const visibility = map.getLayoutProperty(
                    clickedLayer,
                    'visibility'
                );

                // Toggle layer visibility by changing the layout object's visibility property.
                if (visibility !== 'none') {
                    map.setLayoutProperty(clickedLayer, 'visibility', 'none');
                    this.className = '';
                } else {
                    this.className = 'active';
                    map.setLayoutProperty(
                        clickedLayer,
                        'visibility',
                        'visible'
                    );
                }
            };

            const layers = document.getElementById('track-list');
            let li = document.createElement("li")
            li.id = "li_" + elmId
            li.appendChild(link);
            li.appendChild(label)
            li.appendChild(btn)
            layers.appendChild(li)
        }
    });
};

// https://stackoverflow.com/questions/43044/algorithm-to-randomly-generate-an-aesthetically-pleasing-color-palette
function randomPastelColors(){
    let color = [191, 191, 191]
    var r = (Math.round(((Math.random() * 256) +  color[0]) / 2)).toString(16);
    var g = (Math.round(((Math.random() * 256) +  color[1]) / 2)).toString(16);
    var b = (Math.round(((Math.random() * 256) +  color[2]) / 2)).toString(16);
    let res = '#' + r + g + b;
//    console.log(res)
    return res
}
