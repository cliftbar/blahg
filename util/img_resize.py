from PIL import Image
from pathlib import Path

def single(source: Path, size: int = 600):
    
    dest_path: Path = source.parent / (source.stem + "_thumbnail" + source.suffix)

    image = Image.open(source)
    image.thumbnail((size,size), Image.Resampling.LANCZOS)

    image.save(dest_path)

    print(f"resized {source}")

def do_dir(source_dir: Path):
    print(source_dir)
    for s in source_dir.rglob("*"):
        if "thumbnail" in str(s):
            continue
        # print(s)
        single(s)

def main():
    single_source_path: Path = Path(f"E:/Syncthing/blahg/web/img/satellite/MtHood/mtHood_sentinel2_2023-11-18.png")
    source_dir: Path = Path(f"E:/Syncthing/blahg/web/img/ski/MtHood/satellite")

    do_dir(source_dir)

if __name__ == "__main__":
    main()
