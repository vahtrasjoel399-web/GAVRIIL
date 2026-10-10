"""
Renders the 3D props of the site with Blender (Cycles): gift boxes, the brass key,
the leather chronicle book and the padlock. Output: transparent WebP images in public/media/3d.

Box colours are read from src/content/boxes.ts and the book title from
src/content/lock.ts, so after changing them just render again:

  /Applications/Blender.app/Contents/MacOS/Blender -b --factory-startup \
      -P scripts/blender/render_assets.py -- [--preview] [--only box,key,book,padlock]
"""

import math
import os
import re
import sys

import bpy
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
OUT = os.path.join(ROOT, 'public', 'media', '3d')

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
PREVIEW = '--preview' in ARGS
ONLY = None
if '--only' in ARGS:
    ONLY = set(ARGS[ARGS.index('--only') + 1].split(','))

SAMPLES = 24 if PREVIEW else 160
SCALE = 0.5 if PREVIEW else 1.0

FONT_BOLD = '/System/Library/Fonts/Supplemental/Georgia.ttf'
STUDIO = os.path.join(bpy.utils.resource_path('LOCAL'), 'datafiles', 'studiolights', 'world')


# ---------------------------------------------------------------- content

def read(path):
    with open(os.path.join(ROOT, path), encoding='utf-8') as f:
        return f.read()


def box_colours():
    src = read('src/content/boxes.ts')
    wraps = re.findall(r"wrap:\s*'(#[0-9a-fA-F]{6})'", src)
    ribbons = re.findall(r"ribbon:\s*'(#[0-9a-fA-F]{6})'", src)
    return list(zip(wraps, ribbons))


def book_title():
    m = re.search(r"bookTitle:\s*'([^']+)'", read('src/content/lock.ts'))
    return m.group(1) if m else 'Хроники нашей группы'


# ---------------------------------------------------------------- helpers

def hex_rgb(h):
    h = h.lstrip('#')
    srgb = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    lin = [c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in srgb]
    return (*lin, 1.0)


def set_in(node, names, value):
    for n in names if isinstance(names, (list, tuple)) else [names]:
        if n in node.inputs:
            node.inputs[n].default_value = value
            return


def principled(name, colour, rough=0.5, metal=0.0, coat=0.0, sheen=0.0, aniso=0.0):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes['Principled BSDF']
    set_in(bsdf, 'Base Color', hex_rgb(colour) if isinstance(colour, str) else colour)
    set_in(bsdf, 'Roughness', rough)
    set_in(bsdf, 'Metallic', metal)
    set_in(bsdf, ['Coat Weight', 'Clearcoat'], coat)
    set_in(bsdf, ['Sheen Weight', 'Sheen'], sheen)
    set_in(bsdf, 'Anisotropic', aniso)
    return mat


def add_bump(mat, scale, strength, detail=6.0, coords='Object'):
    nt = mat.node_tree
    bsdf = nt.nodes['Principled BSDF']
    tex = nt.nodes.new('ShaderNodeTexNoise')
    tex.inputs['Scale'].default_value = scale
    tex.inputs['Detail'].default_value = detail
    coord = nt.nodes.new('ShaderNodeTexCoord')
    nt.links.new(coord.outputs[coords], tex.inputs['Vector'])
    bump = nt.nodes.new('ShaderNodeBump')
    bump.inputs['Strength'].default_value = strength
    nt.links.new(tex.outputs['Fac'], bump.inputs['Height'])
    nt.links.new(bump.outputs['Normal'], bsdf.inputs['Normal'])
    return tex


def wrapping_paper(name, colour):
    """Glossy wrapping paper with soft polka dots."""
    mat = principled(name, colour, rough=0.42, coat=0.25)
    nt = mat.node_tree
    bsdf = nt.nodes['Principled BSDF']
    coord = nt.nodes.new('ShaderNodeTexCoord')
    vor = nt.nodes.new('ShaderNodeTexVoronoi')
    vor.inputs['Scale'].default_value = 4.2
    nt.links.new(coord.outputs['Object'], vor.inputs['Vector'])
    ramp = nt.nodes.new('ShaderNodeValToRGB')
    ramp.color_ramp.elements[0].position = 0.2
    ramp.color_ramp.elements[0].color = (1, 1, 1, 1)
    ramp.color_ramp.elements[1].position = 0.235
    ramp.color_ramp.elements[1].color = (0, 0, 0, 1)
    nt.links.new(vor.outputs['Distance'], ramp.inputs['Fac'])
    mix = nt.nodes.new('ShaderNodeMix')
    mix.data_type = 'RGBA'
    mix.inputs['A'].default_value = hex_rgb(colour)
    light = [min(1.0, c * 1.5 + 0.05) for c in hex_rgb(colour)[:3]]
    mix.inputs['B'].default_value = (*light, 1)
    nt.links.new(ramp.outputs['Color'], mix.inputs['Factor'])
    nt.links.new(mix.outputs['Result'], bsdf.inputs['Base Color'])
    add_bump(mat, 220, 0.03)
    return mat


def leather(name, colour):
    mat = principled(name, colour, rough=0.58, coat=0.08)
    nt = mat.node_tree
    bsdf = nt.nodes['Principled BSDF']
    coord = nt.nodes.new('ShaderNodeTexCoord')
    grain = nt.nodes.new('ShaderNodeTexVoronoi')
    grain.inputs['Scale'].default_value = 90
    nt.links.new(coord.outputs['Object'], grain.inputs['Vector'])
    bump = nt.nodes.new('ShaderNodeBump')
    bump.inputs['Strength'].default_value = 0.25
    nt.links.new(grain.outputs['Distance'], bump.inputs['Height'])
    nt.links.new(bump.outputs['Normal'], bsdf.inputs['Normal'])
    blot = nt.nodes.new('ShaderNodeTexNoise')
    blot.inputs['Scale'].default_value = 3.0
    nt.links.new(coord.outputs['Object'], blot.inputs['Vector'])
    mix = nt.nodes.new('ShaderNodeMix')
    mix.data_type = 'RGBA'
    mix.inputs['A'].default_value = hex_rgb(colour)
    dark = [c * 0.55 for c in hex_rgb(colour)[:3]]
    mix.inputs['B'].default_value = (*dark, 1)
    nt.links.new(blot.outputs['Fac'], mix.inputs['Factor'])
    nt.links.new(mix.outputs['Result'], bsdf.inputs['Base Color'])
    return mat


def obj_from_op(name):
    o = bpy.context.active_object
    o.name = name
    return o


def cube(name, size, loc, mat=None, bevel=0.0, segments=3):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    o = obj_from_op(name)
    o.scale = size
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel:
        m = o.modifiers.new('bevel', 'BEVEL')
        m.width = bevel
        m.segments = segments
        m.limit_method = 'ANGLE'
    if mat:
        o.data.materials.append(mat)
    smooth(o)
    return o


def smooth(o):
    for p in o.data.polygons:
        p.use_smooth = True


def hollow_box(name, size, loc, outer, inner, thickness, open_side='top', bevel=0.012):
    """A box with one face removed and walls of real thickness."""
    o = cube(name, size, loc)
    me = o.data
    import bmesh
    bm = bmesh.new()
    bm.from_mesh(me)
    target = max if open_side == 'top' else min
    face = target(bm.faces, key=lambda f: f.calc_center_median().z)
    bmesh.ops.delete(bm, geom=[face], context='FACES')
    bm.to_mesh(me)
    bm.free()
    me.materials.append(outer)
    me.materials.append(inner)
    sol = o.modifiers.new('solidify', 'SOLIDIFY')
    sol.thickness = thickness
    sol.offset = -1
    sol.material_offset = 1
    sol.material_offset_rim = 1
    bev = o.modifiers.new('bevel', 'BEVEL')
    bev.width = bevel
    bev.segments = 3
    bev.limit_method = 'ANGLE'
    smooth(o)
    return o


def parent_all(parent, objs):
    for o in objs:
        o.parent = parent


def empty(name, loc=(0, 0, 0)):
    bpy.ops.object.empty_add(location=loc)
    return obj_from_op(name)


# ---------------------------------------------------------------- scene

def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.render.engine = 'CYCLES'
    prefs = bpy.context.preferences.addons['cycles'].preferences
    for backend in ('METAL', 'OPTIX', 'CUDA', 'HIP'):
        try:
            prefs.compute_device_type = backend
            prefs.get_devices()
            if any(d.type == backend for d in prefs.devices):
                for d in prefs.devices:
                    d.use = True
                scene.cycles.device = 'GPU'
                break
        except TypeError:
            continue
    scene.cycles.samples = SAMPLES
    scene.cycles.use_denoising = True
    scene.cycles.max_bounces = 8
    scene.render.film_transparent = True
    scene.render.image_settings.file_format = 'WEBP'
    scene.render.image_settings.color_mode = 'RGBA'
    scene.render.image_settings.quality = 88
    try:
        scene.view_settings.view_transform = 'AgX'
        scene.view_settings.look = 'AgX - Punchy'
    except TypeError:
        pass

    world = bpy.data.worlds.new('world')
    scene.world = world
    world.use_nodes = True
    nt = world.node_tree
    env = nt.nodes.new('ShaderNodeTexEnvironment')
    path = os.path.join(STUDIO, 'interior.exr')
    if os.path.exists(path):
        env.image = bpy.data.images.load(path)
        nt.links.new(env.outputs['Color'], nt.nodes['Background'].inputs['Color'])
    nt.nodes['Background'].inputs['Strength'].default_value = 0.35
    return scene


def lights(target=(0, 0, 0.6), warm=True):
    def area(name, loc, energy, size, colour):
        bpy.ops.object.light_add(type='AREA', location=loc)
        l = obj_from_op(name)
        l.data.energy = energy
        l.data.size = size
        l.data.color = colour
        aim(l, target)
        return l

    area('key', (3.2, -3.6, 4.6), 420, 3.0, (1.0, 0.86, 0.7) if warm else (1, 1, 1))
    area('fill', (-4.2, -2.2, 2.2), 110, 4.0, (0.8, 0.86, 1.0))
    area('rim', (-1.2, 4.2, 3.6), 320, 2.0, (1.0, 0.9, 0.76))


def aim(o, target):
    d = Vector(target) - o.location
    o.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()


def camera(loc, target, lens=55, ortho=None):
    bpy.ops.object.camera_add(location=loc)
    cam = obj_from_op('camera')
    aim(cam, target)
    if ortho:
        cam.data.type = 'ORTHO'
        cam.data.ortho_scale = ortho
    else:
        cam.data.lens = lens
    bpy.context.scene.camera = cam
    return cam


def shadow_catcher(size=12):
    bpy.ops.mesh.primitive_plane_add(size=size, location=(0, 0, 0))
    p = obj_from_op('shadow')
    p.is_shadow_catcher = True
    return p


def render(name, w, h):
    scene = bpy.context.scene
    scene.render.resolution_x = int(w * SCALE)
    scene.render.resolution_y = int(h * SCALE)
    scene.render.filepath = os.path.join(OUT, name + '.webp')
    bpy.ops.render.render(write_still=True)
    print('rendered', name)


def show_only(objs):
    keep = set(objs)
    for o in bpy.context.scene.objects:
        if o.type in ('MESH', 'CURVE', 'FONT'):
            hidden = o not in keep
            o.hide_render = hidden


# ---------------------------------------------------------------- gift box

def ribbon_bow(mat, top_z, parent):
    parts = []
    for side in (-1, 1):
        bpy.ops.mesh.primitive_torus_add(major_radius=0.34, minor_radius=0.04, major_segments=64, minor_segments=12,
                                         location=(side * 0.36, 0, top_z + 0.2))
        loop = obj_from_op(f'bow_loop_{side}')
        loop.rotation_euler = (math.radians(90), math.radians(side * -22), math.radians(side * 14))
        # a flat satin band: wide along the torus axis, thin across; loop stretched sideways
        loop.scale = (1.25, 0.72, 4.4)
        loop.data.materials.append(mat)
        smooth(loop)
        sub = loop.modifiers.new('sub', 'SUBSURF')
        sub.levels = 1
        sub.render_levels = 2
        parts.append(loop)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.16, location=(0, 0, top_z + 0.08))
    knot = obj_from_op('bow_knot')
    knot.scale = (1.0, 1.3, 0.8)
    knot.data.materials.append(mat)
    smooth(knot)
    parts.append(knot)
    for side in (-1, 1):
        tail = cube(f'bow_tail_{side}', (0.24, 0.62, 0.02), (side * 0.2, side * 0.32, top_z + 0.02), mat, bevel=0.008)
        tail.rotation_euler = (math.radians(side * -8), 0, math.radians(side * 26))
        parts.append(tail)
    parent_all(parent, parts)
    return parts


def build_box(wrap, ribbon_hex):
    W, D, H = 2.0, 2.0, 1.55
    LW, LD, LH = W + 0.1, D + 0.1, 0.42
    paper = wrapping_paper('paper', wrap)
    kraft = principled('kraft', '#b08a5c', rough=0.85)
    add_bump(kraft, 60, 0.05)
    satin = principled('satin', ribbon_hex, rough=0.22, sheen=0.6, coat=0.3, aniso=0.6)
    band = 0.34

    body_root = empty('body_root')
    body = hollow_box('body', (W, D, H), (0, 0, H / 2), paper, kraft, 0.05)
    bands = [
        cube('band_f', (band, 0.02, H), (0, -D / 2 - 0.01, H / 2), satin, bevel=0.004),
        cube('band_b', (band, 0.02, H), (0, D / 2 + 0.01, H / 2), satin, bevel=0.004),
        cube('band_l', (0.02, band, H), (-W / 2 - 0.01, 0, H / 2), satin, bevel=0.004),
        cube('band_r', (0.02, band, H), (W / 2 + 0.01, 0, H / 2), satin, bevel=0.004),
    ]
    parent_all(body_root, [body, *bands])

    lid_root = empty('lid_root')
    lid = hollow_box('lid', (LW, LD, LH), (0, 0, H + 0.12 - LH / 2), paper, kraft, 0.04, open_side='bottom')
    top = H + 0.12
    lid_bands = [
        cube('lid_band_x', (LW + 0.02, band, 0.02), (0, 0, top + 0.01), satin, bevel=0.004),
        cube('lid_band_y', (band, LD + 0.02, 0.02), (0, 0, top + 0.012), satin, bevel=0.004),
        cube('lid_band_f', (band, 0.02, LH), (0, -LD / 2 - 0.01, top - LH / 2), satin, bevel=0.004),
        cube('lid_band_b', (band, 0.02, LH), (0, LD / 2 + 0.01, top - LH / 2), satin, bevel=0.004),
        cube('lid_band_l', (0.02, band, LH), (-LW / 2 - 0.01, 0, top - LH / 2), satin, bevel=0.004),
        cube('lid_band_r', (0.02, band, LH), (LW / 2 + 0.01, 0, top - LH / 2), satin, bevel=0.004),
    ]
    bow = ribbon_bow(satin, top + 0.02, lid_root)
    parent_all(lid_root, [lid, *lid_bands])
    return [body, *bands], [lid, *lid_bands, *bow]


def render_boxes():
    colours = box_colours()
    if PREVIEW:
        colours = colours[:1]
    for i, (wrap, rib) in enumerate(colours, start=1):
        reset_scene()
        lights(target=(0, 0, 0.8))
        catcher = shadow_catcher()
        body, lid = build_box(wrap, rib)
        camera((4.4, -6.2, 4.4), (0, 0, 0.95), lens=50)
        show_only([catcher, *body, *lid])
        render(f'box-{i}-closed', 1000, 1000)
        show_only([catcher, *body])
        render(f'box-{i}-body', 1000, 1000)
        catcher.hide_render = True
        show_only(lid)
        render(f'box-{i}-lid', 1000, 1000)


# ---------------------------------------------------------------- key

def build_key(scale=1.0, loc=(0, 0, 0), rot=(0, 0, 0)):
    brass = principled('brass', '#d6a54e', rough=0.26, metal=1.0)
    add_bump(brass, 40, 0.04)
    root = empty('key_root', loc)
    parts = []
    face = (math.radians(90), 0, 0)  # the key is drawn in the XZ plane
    bpy.ops.mesh.primitive_torus_add(major_radius=0.42, minor_radius=0.1, major_segments=64, minor_segments=20, location=(-1.0, 0, 0),
                                     rotation=face)
    ring = obj_from_op('key_ring')
    ring.data.materials.append(brass)
    smooth(ring)
    parts.append(ring)
    bpy.ops.mesh.primitive_torus_add(major_radius=0.16, minor_radius=0.05, major_segments=48, minor_segments=12, location=(-1.0, 0, 0),
                                     rotation=face)
    inner = obj_from_op('key_inner')
    inner.data.materials.append(brass)
    smooth(inner)
    parts.append(inner)
    for a in range(4):
        ang = a * math.pi / 2 + math.pi / 4
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.085, location=(-1.0 + math.cos(ang) * 0.42, 0, math.sin(ang) * 0.42))
        b = obj_from_op(f'key_bead_{a}')
        b.data.materials.append(brass)
        smooth(b)
        parts.append(b)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.075, depth=1.7, location=(0.27, 0, 0), rotation=(0, math.radians(90), 0))
    shaft = obj_from_op('key_shaft')
    shaft.data.materials.append(brass)
    smooth(shaft)
    parts.append(shaft)
    for x in (-0.48, -0.36):
        bpy.ops.mesh.primitive_cylinder_add(radius=0.12, depth=0.06, location=(x, 0, 0), rotation=(0, math.radians(90), 0))
        c = obj_from_op('key_collar')
        c.data.materials.append(brass)
        smooth(c)
        parts.append(c)
    parts.append(cube('key_bit_a', (0.12, 0.05, 0.36), (0.92, 0, -0.2), brass, bevel=0.012))
    parts.append(cube('key_bit_b', (0.1, 0.05, 0.24), (1.06, 0, -0.14), brass, bevel=0.012))
    parent_all(root, parts)
    root.scale = (scale, scale, scale)
    root.rotation_euler = rot
    return parts


def render_key():
    reset_scene()
    lights(target=(0, 0, 0.2))
    catcher = shadow_catcher()
    # lying flat on the desk, face up, seen from above at an angle
    key = build_key(loc=(0.05, 0, 0.11), rot=(math.radians(-90), 0, math.radians(-20)))
    camera((0.4, -4.4, 3.9), (0.05, 0, 0.05), lens=62)
    show_only([catcher, *key])
    render('key', 1200, 700)


# ---------------------------------------------------------------- book

def gold():
    return principled('gold', '#f4c978', rough=0.2, metal=1.0)


def corner_piece(name, corner, sx, sz, size, mat):
    """Triangular metal cap on a cover corner (thin prism)."""
    cx, cy, cz = corner
    pts = [(cx, cz), (cx - sx * size, cz), (cx, cz - sz * size)]
    verts = [(x, cy - 0.015, z) for x, z in pts] + [(x, cy + 0.015, z) for x, z in pts]
    faces = [(0, 1, 2), (5, 4, 3), (0, 3, 4, 1), (1, 4, 5, 2), (2, 5, 3, 0)]
    me = bpy.data.meshes.new(name)
    me.from_pydata(verts, [], faces)
    me.update()
    o = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(o)
    me.materials.append(mat)
    bev = o.modifiers.new('bevel', 'BEVEL')
    bev.width = 0.006
    bev.segments = 2
    return o


def build_book(title, with_strap=True):
    BW, BH, T = 1.44, 2.0, 0.44
    hide = leather('leather', '#6a3a22')
    paper = principled('pages', '#efe3c8', rough=0.8)
    add_bump(paper, 300, 0.08)
    g = gold()
    parts = []
    # boards and spine (book stands upright, front cover facing -Y)
    parts.append(cube('front', (BW, 0.06, BH), (0, -T / 2 + 0.03, 0), hide, bevel=0.02))
    parts.append(cube('back', (BW, 0.06, BH), (0, T / 2 - 0.03, 0), hide, bevel=0.02))
    parts.append(cube('spine', (0.08, T, BH), (-BW / 2 + 0.02, 0, 0), hide, bevel=0.03))
    parts.append(cube('pages', (BW - 0.08, T - 0.1, BH - 0.08), (0.02, 0, 0), paper, bevel=0.01))
    # gold corner protectors on the front cover
    for sx in (-1, 1):
        for sz in (-1, 1):
            parts.append(corner_piece(f'corner_{sx}_{sz}', (sx * BW / 2, -T / 2 - 0.012, sz * BH / 2), sx, sz, 0.26, g))
    # embossed frame
    fw, fh, th = BW - 0.32, BH - 0.36, 0.012
    for name, size, loc in (
        ('frame_t', (fw, 0.012, th), (0, -T / 2 - 0.002, fh / 2)),
        ('frame_b', (fw, 0.012, th), (0, -T / 2 - 0.002, -fh / 2)),
        ('frame_l', (th, 0.012, fh), (-fw / 2, -T / 2 - 0.002, 0)),
        ('frame_r', (th, 0.012, fh), (fw / 2, -T / 2 - 0.002, 0)),
    ):
        parts.append(cube(name, size, loc, g))
    # title
    words = title.upper().split()
    lines = []
    for w in words:
        if lines and len(lines[-1]) + len(w) < 9:
            lines[-1] += ' ' + w
        else:
            lines.append(w)
    bpy.ops.object.text_add(location=(0, -T / 2 - 0.004, 0.18))
    txt = obj_from_op('title')
    txt.data.body = '\n'.join(lines)
    if os.path.exists(FONT_BOLD):
        txt.data.font = bpy.data.fonts.load(FONT_BOLD)
    txt.data.align_x = 'CENTER'
    txt.data.align_y = 'CENTER'
    txt.data.size = 0.165
    txt.data.space_line = 1.1
    txt.data.space_character = 1.06
    txt.data.extrude = 0.006
    txt.data.bevel_depth = 0.002
    txt.rotation_euler = (math.radians(90), 0, 0)
    txt.data.materials.append(g)
    parts.append(txt)
    # small diamond ornament
    d = cube('ornament', (0.07, 0.01, 0.07), (0, -T / 2 - 0.004, -0.38), g)
    d.rotation_euler = (0, math.radians(45), 0)
    parts.append(d)
    if with_strap:
        strap = principled('strap', '#4e2b18', rough=0.6)
        parts.append(cube('strap', (0.46, 0.05, 0.2), (BW / 2 - 0.1, -T / 2 - 0.02, -0.32), strap, bevel=0.02))
        parts.append(cube('strap_side', (0.05, T + 0.1, 0.2), (BW / 2 + 0.11, 0, -0.32), strap, bevel=0.02))
    return parts


def build_padlock(state='closed', loc=(0, 0, 0), scale=1.0):
    brass = principled('lock_brass', '#d19a3f', rough=0.3, metal=1.0)
    add_bump(brass, 30, 0.03)
    steel = principled('steel', '#c9ced6', rough=0.2, metal=1.0)
    dark = principled('hole', '#140c06', rough=0.6)
    root = empty('lock_root', loc)
    parts = [cube('lock_body', (1.0, 0.38, 0.82), (0, 0, 0), brass, bevel=0.1, segments=5)]
    lift = 0.26 if state == 'open' else 0.0
    bpy.ops.mesh.primitive_torus_add(major_radius=0.3, minor_radius=0.07, major_segments=48, minor_segments=16,
                                     location=(0, 0, 0.62 + lift), rotation=(math.radians(90), 0, 0))
    arc = obj_from_op('shackle_arc')
    import bmesh
    bm = bmesh.new()
    bm.from_mesh(arc.data)
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.y < -0.01], context='VERTS')
    bm.to_mesh(arc.data)
    bm.free()
    arc.data.materials.append(steel)
    smooth(arc)
    parts.append(arc)
    for sx in (-1, 1):
        # open: the left leg stays in the body (longer), the right one comes out
        length = 0.36 + (lift if sx < 0 else 0.0)
        bpy.ops.mesh.primitive_cylinder_add(radius=0.07, depth=length, location=(sx * 0.3, 0, 0.62 + lift - length / 2))
        leg = obj_from_op(f'shackle_leg_{sx}')
        leg.data.materials.append(steel)
        smooth(leg)
        parts.append(leg)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.075, depth=0.06, location=(0, -0.19, 0.08), rotation=(math.radians(90), 0, 0))
    hole = obj_from_op('keyhole')
    hole.data.materials.append(dark)
    parts.append(hole)
    parts.append(cube('keyhole_slot', (0.05, 0.06, 0.2), (0, -0.19, -0.04), dark))
    parent_all(root, parts)
    root.scale = (scale, scale, scale)
    return parts


def render_book():
    title = book_title()
    # 1. Standing book, 3/4 view — rises from the last gift box.
    reset_scene()
    lights(target=(0, 0, 0))
    book = build_book(title)
    lock = build_padlock(loc=(0.86, -0.32, -0.32), scale=0.34)
    camera((2.2, -5.4, 1.0), (0, 0, 0), lens=60)
    show_only([*book, *lock])
    render('book-standing', 900, 1100)

    # 2. Front of the cover, flat, for the lock scene (strap and lock are separate there).
    reset_scene()
    lights(target=(0, 0, 0))
    book = build_book(title, with_strap=False)
    camera((0, -6, 0), (0, 0, 0), ortho=2.06)
    show_only(book)
    render('cover-front', 1000, int(1000 * 2.06 / 1.48))


def render_padlocks():
    for state in ('closed', 'key', 'open'):
        reset_scene()
        lights(target=(0, 0, 0.2))
        lock = build_padlock(state='open' if state == 'open' else 'closed')
        objs = [*lock]
        if state in ('key', 'open'):
            # key in the keyhole, bow towards the viewer; turned a quarter when open
            # shaft goes into the keyhole, the bow sticks out towards the viewer; a quarter turn opens it
            key = build_key(scale=0.42, loc=(0, -0.62, 0.08),
                            rot=(math.radians(90 if state == 'open' else 0), 0, math.radians(90)))
            objs += key
        camera((1.0, -4.2, 1.2), (0, 0, 0.25), lens=70)
        show_only(objs)
        render(f'padlock-{state}', 700, 900)


# ---------------------------------------------------------------- main

os.makedirs(OUT, exist_ok=True)
jobs = [('box', render_boxes), ('key', render_key), ('book', render_book), ('padlock', render_padlocks)]
for name, job in jobs:
    if ONLY is None or name in ONLY:
        job()
print('done ->', OUT)
