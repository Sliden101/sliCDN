# Introduction

A simple image upload server that comes with auto resizing.

# Submission for AP CSP Create Performance Task

May come back for revision later(gotta go see the guidelines)

## Example Post Request

```
curl -X POST -H "Content-Type: multipart/form-data" \
-F "file=@/home/sliden/Pictures/suisad.png" \
-F "width=500" \
-F "height=500" \
-F "quality=90" \
http://localhost:3000/upload
```