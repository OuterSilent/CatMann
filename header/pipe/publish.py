"""Stage 4: copy the finished vector layers from out/ (scratch, not in the repository) to data/, which is what the build reads."""
import os, shutil, sys
sys.path.insert(0, '.')
from common import HERE, OUT

# the layers build.py assembles (the steam and the neon sign are drawn by hand there)
LAYERS = ['far', 'torso', 'r_upper', 'man_head', 'table', 'mug', 'cat_tail', 'cat_body', 'cat_paw_l', 'cat_head',
          'props_front', 'r_forearm', 'r_hand', 'l_hand', 'plant', 'camera']
DATA = os.path.join(HERE, '..', 'data')

if __name__ == '__main__':
    os.makedirs(DATA, exist_ok=True)
    for f in ['vec_%s.json' % n for n in LAYERS] + ['lights.json']:
        shutil.copyfile(os.path.join(OUT, f), os.path.join(DATA, f))
        print('data/' + f)
