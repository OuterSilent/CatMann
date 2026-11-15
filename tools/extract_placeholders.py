"""Cut temporary placeholder pictures out of the Instagram profile screenshot.

The screenshot (ref/instagram-profilo.png) and the pictures it produces are not
in the repository: they are the artist's photos, used only to preview the layout
until the real works arrive. Run from the repo root.
"""
from PIL import Image, ImageFilter
import os
src = Image.open('ref/instagram-profilo.png').convert('RGB')
X = [247, 528, 809, 1091, 1372]; W = 280
Y = [566, 941, 1315]; H = 373
out = 'site/placeholder'
os.makedirs(out, exist_ok=True)

def tile(r, c, box=None):
    x, y = X[c], Y[r]
    b = (x, y, x + W, y + H) if box is None else (x + box[0], y + box[1], x + box[2], y + box[3])
    return src.crop(b)

def save(im, name, long_side=1100):
    k = long_side / max(im.size)
    im = im.resize((round(im.size[0] * k), round(im.size[1] * k)), Image.LANCZOS)
    im = im.filter(ImageFilter.UnsharpMask(radius=2.2, percent=60, threshold=2))
    im.save(f'{out}/{name}.jpg', quality=82, optimize=True, progressive=True)
    print(name, im.size, os.path.getsize(f'{out}/{name}.jpg') // 1024, 'KB')

save(tile(0, 0, (58, 14, 232, 250)), 'work-01')       # cat portrait held in front of the face
save(tile(0, 2), 'work-02')                           # graphite detail next to the phone
save(tile(1, 0, (0, 30, 150, 340)), 'work-03')        # drawing on the cafe table
save(tile(1, 3, (0, 240, 280, 373)), 'work-04', 1000) # sleeping cat drawing
save(tile(0, 4), 'work-05')                           # the grey cat
save(tile(1, 3, (150, 0, 280, 110)), 'work-06', 800)  # cat eye fragment
save(tile(2, 1), 'work-07')                           # vinyl
save(tile(1, 4), 'work-08')                           # markers
save(tile(0, 1), 'about-01', 900)                     # at work
save(tile(1, 1), 'about-02', 900)                     # with the cat
save(src.crop((610, 70, 760, 220)), 'portrait', 480)  # profile picture
