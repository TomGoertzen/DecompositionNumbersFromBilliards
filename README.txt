Billiards visualisations
Tom Goertzen and Maxwell Liu

REVIEW COPY

Open index.html in a modern browser with JavaScript enabled. The page, fonts,
mathematical typesetting, computation data and thesis are included locally.
An internet connection is only needed to follow external reference links.

FOLDER STRUCTURE

index.html                              Page text, controls and references
assets/css/styles.css                   Website styling
assets/js/range.js                      Interactive visualisations and calculations
assets/fonts/                           Website fonts
assets/vendor/katex/                    KaTeX scripts, stylesheet and maths fonts
assets/vendor/lievis/SOURCE.txt          Lievis source and permission notes
data/billiards_base_characters.js        Precomputed character input
documents/maxwell-liu-honours-thesis.pdf  Maxwell Liu's honours thesis
THIRD_PARTY_NOTICES.txt                  Asset sources and acknowledgements

The [Liu] reference on the page links to the included, unmodified thesis.
Edit index.html to proofread the text. Keep these relative paths intact.

SHARING OR HOSTING

This is a standalone static website. Share the whole folder or upload its
contents to a static web host. No build step, package installation, Magma,
GAP or Python computation service is required.

If your browser blocks local files, optionally run this inside the folder:

    python3 -m http.server 8765

Then open http://127.0.0.1:8765/ and stop the server with Ctrl+C.

This review copy excludes development scripts, tests, build caches, duplicate
data files and unused upstream source files. It has not been published.

Before publication, review THIRD_PARTY_NOTICES.txt, including the unresolved
permission status for any adapted Lievis-specific source. The KaTeX and font
licences are included locally; attribution alone does not settle permission.
