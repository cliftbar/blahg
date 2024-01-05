---
title: Movie Rip Process
createdAt: 2022-06-21
updatedAt: 2023-09-17
---
## Hardware
- Pioneer Electronics BDR-XS07UHD
    - 6x max read (format dependant)
    - Portable
    - USB 3.1

## MKV Rip
- Open disc in MakeMKV Beta
- Disc should be opening with LibreDrive direct access
- Run save on all titles

### Rip Failure troubleshooting
- Make sure to clean disc, a dirty disc will slow the read speed at best, and can fail the read.
- Set the MakeMKV retry count up to 99, the reader might be able to brute force through

## Handbrake
- Load MKV folder as source
- General save path settings: `...\{source_folder_name}\{source}_{title}`
- Add all or selected to queue
- My encoding is going about 2x speed
- Handbrake uses all cores, but really drops in usefulness after 4 cores
    - Can set affinity in task manager if worried about using more cores, but it doesn't seem to save between runs
    - Ususally just run encodings overnight

### Encoding Settings
- Summary Options
    - Format: MP4, web aligned, align A/V Start, passthru common metadata.  No ipod 5g support
- Dimensions:
    Auto for pretty much everything.
    - I set a resolution limit to 2160 4k UHD, but I don't have any 8k content, so this could just be none
    - Optimal Size for resolution
- Filters:
    - Detelecine: Default
    - Interlace Detection: Default
    - Deinterlace: Decomb - Default
    - Off for the rest.  Defaults above will automatically apply if appropriate
- Video Settings:
    - Video Encoder: H.264
        - H.265 is better for streaming and filesize, but takes longer and can have player compatibility issues.  Need to explore that later
    - Framerate: Same as source, Variable
    - Encoder Options
        - Preset: Fast (other presets aren't worth messing with imo)
        - Tune: None
        - Profile: Main
        - Encoder Level: 4
        - Advanced Options: None
    - Quality:
        - Constant Quality: 22
        - 2 pass encoding on
        - Turbo first pass on
- Audio
    - add all tracks
- Subtites:
    - Add all the subtiitles you can.  If you can't add more than one, check if they're PSG format subtites
    - If doing a Blueray with PSG format subtitles, stick with just foreign audo scan forced, and do Subtitle Edit step later
        - PSG's are image based, so handbrake can only burn them into the end result, and so can only burn in one.

## Subtitle Edit
- Drag mkv file into Subtitle Edit
- Select PSG track to OCR
- I use nOCR, binary wasn't doing well for me, mostly anime subtitles though
    - start at 14 pixels space, adjust as errors appear
    - usually click contains italic
    - Prompt for unknown words
    - Fix OCR errors
- Hit start OCR
- Names, words not in dictionary, and one-off things, just click add to dictionary or names/noise list
- If there's an unknown OCR, make sure the gree lines well cover the foreground, and the red lines well cover the background
    - Click guess again to get a new line set
    - You can add more lines manually as well
- If there's an actual OCR error, usually recognizing something outside the normal english alphabet, click through upda
- If its things that'll happen alot (l vs I vs 1, O vs 0), re-matching the OCR probably won't help, just correct and click change all
- When done, save SRT file with the MP4.
    - Subtitle files should have the following format: `{movie_file_name}.{lang}.srt`
        - `movie_file_name` is the same as the mp4 but without the extension
        - `lang` is the 2 or 3 letter language code, `en` for english