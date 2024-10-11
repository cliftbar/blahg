from pathlib import Path

import gpxpy
from gpxpy.gpx import GPX, GPXTrack


if __name__ == "__main__":
    with open("my-tracks.gpx", "r", encoding="utf-8") as fi:
        gpx: GPX = gpxpy.parse(fi)

    ns = gpx.nsmap.copy()
    ns_nodefault = ns.copy()
    ns_nodefault[""] = ns_nodefault.pop("defaultns")

    t: GPXTrack
    for t in gpx.tracks:
        new_gpx: GPX = gpxpy.gpx.GPX()

        new_gpx.nsmap.update(ns)
        new_gpx.tracks.append(t)
        t.extensions = []
        # for e in t.extensions:
        #     e.nsmap.update(ns_nodefault)

        # for i in range(len(t.extensions)):
        #     ns = t.extensions[i].nsmap[None]
        #     t.extensions[i].attrib["xmlns"] = ns
        #     t.extensions[i].tag = t.extensions[i].tag.replace(f"{{{ns}}}", "")

        # print(new_gpx.to_xml())
        track_fo_name: str = t.name.lower().strip().replace(' ', '_').replace("/", "-").replace(":", "-")
        with Path(f"./gpx/{track_fo_name}.gpx").open("w", encoding="utf-8") as fo:
            fo.write(new_gpx.to_xml())