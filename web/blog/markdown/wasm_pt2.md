---
Title: WASM Pt. 2
draft: true
---
_Draft that may never be finished_

Time to revisit WASM! The last use case was running some [mapping stuff for Odin's Eye](https://www.odinseye.cloud/musings/go_wasm_memory/).  Now it's image processing, and making some improvements. I also pulled Web Workers in.  This is mostly noteworthy because between the workers and the design, I'm throwing away the initialized WASM state, so there's less worrying about memory management and leftover state.  Easier, and this setup plays nicer with TinyGo garbage collection (more later).

## The Code
At the end of it all, things aren't that hard to get running, but getting to the end took some doing.  Lots of conflicting information and tutorials pieced together from different languages.

### TinyGo
Before going into the code, I'll talk about [TinyGo](https://tinygo.org/).  TinyGo is an alternate compiler for Go, focused on smaller builds and resource constrained environments.  It does 2 great things for this project:
- Smaller compile size: from 6.2MB to 1.3MB with no extra effort, still big to send over the web but definitely an improvement just by swapping the compiler.
- Alternate garbage collector: I used the Leaking GC, meaning nothing is ever de-allocated.  This gave a notable speedup, especially on larger images.  Because the wasm code is running in a web worker, the leaking is fine, as far as I can tell all the memory gets cleaned up when the worker finishes.  This did cause issues with some of the algorithm implementations I looked at that, that did lots of allocations and threw an OOM.

TinyGo didn't play nice with goland, even with the plugin, but admittedly I didn't try hard to make it work.  I also needed to link in another set of WASM utilities, [Binaryen](https://github.com/WebAssembly/binaryen), but that may depend on how TinyGo is installed.  Build commands are below (yeah, in Powershell, I'm giving it a try lately).

```powershell
# Build Commands
$env:WASMOPT="...\bin\binaryen-version_109\bin\wasm-opt.exe"
tinygo build -target=wasm -no-debug -gc=leaking -o .\static\wasm\tinypbn.wasm main.go
```

### Go Side
Below is a somewhat simplified version of the Go code for the pixelize process.

```go
func pixelizor(this js.Value, i []js.Value) interface{} {
    // Parse Arguments
    width := i[0].Int()
    height := i[1].Int()
    widthXScalar := i[2].Int()
    heightYScalar := i[3].Int()
    clusterCount := i[4].Int()
    kMeansTune := i[5].Float()
    srcArrayJS := i[6]  // Input image JS object
    outputBuffer := i[7]  // Output Buffer

    // Copy input image bytes
    srcLen := srcArrayJS.Get("byteLength").Int()
    inputImageBytes := make([]uint8, srcLen)
    js.CopyBytesToGo(inputImageBytes, srcArrayJS)

    // Image Transforms
    imgRgb, err := imaging.Decode(bytes.NewReader(inputImageBytes), imaging.AutoOrientation(true))
    resizedImgRgb := resize.Resize(uint(imgRgb.Bounds().Size().X/widthXScalar), uint(imgRgb.Bounds().Size().Y/heightYScalar), imgRgb, resize.NearestNeighbor)
    colorPalette, colorPaletteHexStr := pbn.DominantColors(resizedImgRgb, clusterCount, kMeansTune, false)
    snapImg := pbn.SnapColors(resizedImgRgb, colorPalette)
    newImage := resize.Resize(uint(imgRgb.Bounds().Size().X), uint(imgRgb.Bounds().Size().Y), snapImg, resize.NearestNeighbor)

    // Store image in output buffer
    imgBuf := new(bytes.Buffer)
    _ = png.Encode(imgBuf, newImage)
    js.CopyBytesToJS(outputBuffer, imgBuf.Bytes())

    // Also return a string
    return js.ValueOf(colorPaletteHexStr)
}

func main() {
    c := make(chan struct{}, 0)

    println("WASM Go Initialized")
    // register functions for JS
    js.Global().Set("pixelizor", js.FuncOf(pixelizor))

    <-c
}
```

Things aren't too bad, all things considered:
- Arguments come in as an array of js.Value, each arg needs to be converted to a base type - mildly annoying to keep arguments ordered in Go and JS, but not hard
- The image comes in as an array of bytes.  The JS value has the byte length (not the same as the number of pixels, this is the full image - with headers and such), which is useful for copying the bytes over.  The wasm library provides a copy bytes function.
- Doing actual work proceeds as normal, to the point the other files don't know that wasm exists.  There's some caveats to that, as everything needs to be go code and compatible with wasm.
- Outputting the image is the same as input in reverse, get the bytes and copy them into the JS array
- We can also directly return js values, including Maps (for multiple returns), though that proved somewhat harder for pushing the large image byte arrays around.
- Our main function exposes the pixelizor method in JS, and uses a channel to keep the wasm-go instance running.

### JS side
```js
function pixelizorJS(width, height, widthFactor, heightFactor, numColors, kMeansTune, imgBytes) {
    // initialize the Go WASM glue
    importScripts("/static/js/wasm_exec_tiny.js")
    const go = new self.Go();
    const wasmInstance = await WebAssembly.instantiateStreaming(fetch("/static/wasm/tinypbn.wasm"), go.importObject);

    // Set up output image array
    let output = new Uint8Array(imgBytes.length)

    // Call the exposed wasm function
    let ret = await pixelizor(width, height, widthFactor, heightFactor, numColors, kMeansTune, imgBytes, output);

    // Log our string
    console.log(ret)

    // Set the image to the output
    document.getElementById("img").src = URL.createObjectURL(
    new Blob([output.buffer], { type: "image/png" })
    );
}
```

On the JS side, things also aren't too bad either, though there's a bit more magic that the Go side.  And more ways this can be done.  And more conflicting information since things depends on what language is running in wasm.  Key points here are:
- Import the Go-Wasm JS glue scripts.  This is copied from the Go compiler (meaning when using TinyGo, use the one supplied by TinyGo, the script from the vanilla Go compiler will error out)
- The Go import object needs to be supplied to the instantiate method.  This varies between languages, ex. when using JS in wasm the import object is empty.
- Output array we make the same size as the input image.  I'm not sure what would happen when returning a differently sized image, but since it's returning the entire image (not just the pixels) I doubt it will be too much extra work, at worst it'll need to return the new byte length as well.


## Finally
This time around, I think things are a bit more streamlined, and things are definitely going quicker, but aren't wildly different from before.  The most notable improvement is speed from the TinyGo Leaking GC, though that's only safe because of the Web Worker (I didn't test outside a worker).  See it in action by playing with [an image filter](https://pixel.cliftbar.site/).